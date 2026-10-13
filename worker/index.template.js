const FILES = __ASSET_MAP__;
const MAX_BYTES = 1_000_000;
const INSTAGRAM_ROUTES = new Set(["about","accounts","developer","direct","explore","p","reel","reels","stories","tv"]);
const LINKEDIN_HOSTS = new Set(["linkedin.com","www.linkedin.com","uk.linkedin.com","ca.linkedin.com","in.linkedin.com"]);
const INSTAGRAM_HOSTS = new Set(["instagram.com","www.instagram.com"]);

function profilePlatform(url) {
  if (LINKEDIN_HOSTS.has(url.hostname)) return "linkedin";
  if (INSTAGRAM_HOSTS.has(url.hostname)) return "instagram";
  return null;
}

function allowedProfile(input) {
  let url;
  try { url = new URL(input); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const platform = profilePlatform(url);
  const instagramName = url.pathname.replace(/^\//,"").replace(/\/$/,"").toLowerCase();
  const linkedin = platform === "linkedin" && /^\/in\/[A-Za-z0-9_%.-]+\/?$/.test(url.pathname);
  const instagram = platform === "instagram" && /^\/[A-Za-z0-9._]+\/?$/.test(url.pathname) && !INSTAGRAM_ROUTES.has(instagramName);
  if (!linkedin && !instagram) return null;
  url.hash = "";
  url.search = "";
  return url;
}

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    const key = entity.toLowerCase();
    if (key[0] === "#") {
      const n = key[1] === "x" ? parseInt(key.slice(2),16) : parseInt(key.slice(1),10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
    }
    return ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "})[key];
  });
}

function clean(value) {
  let text=String(value || "").replace(/<[^>]*>/g," ").replace(/\\u003c/gi," ");
  text=decodeEntities(decodeEntities(text));
  return text.replace(/<[^>]*>/g," ").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,6000);
}

function stripPlatformChrome(value) {
  return value.replace(/\bView\s+.{1,180}?\s+profile\s+on\s+LinkedIn,\s+a\s+professional\s+community\s+of\s+[^.]*\.?/gi," ")
    .replace(/\s+/g," ").trim();
}

function pageSignals(html) {
  const meta = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content) meta[key] = stripPlatformChrome(clean(attrs.content));
  }
  const title = stripPlatformChrome(clean((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""));
  const parts = [meta["og:title"],meta["og:description"],meta.description,meta["profile:first_name"],meta["profile:last_name"],title]
    .filter(Boolean);
  return [...new Set(parts)].join("\n").slice(0,6000);
}

async function readLimited(response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) throw new Error("too_large");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new Error("too_large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8").decode(bytes);
}

async function fetchProfile(start) {
  let current = start;
  const platform = profilePlatform(start);
  for (let hops = 0; hops <= 3; hops++) {
    const response = await fetch(current.href, {
      method:"GET",
      redirect:"manual",
      signal:AbortSignal.timeout(15000),
      headers:{"accept":"text/html,application/xhtml+xml","user-agent":"DateLabPublicProfileReader/1.0 (+anonymous, single-page request)"}
    });
    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || hops === 3) return {state:"redirected",text:"",message:"The profile redirected outside a readable public page. Paste visible text from the linked profile."};
      const next = allowedProfile(new URL(location,current).href);
      if (!next || profilePlatform(next) !== platform) return {state:"redirected",text:"",message:"The profile redirected to a different platform or non-profile page. No redirected content was read."};
      current = next;
      continue;
    }
    if (!response.ok) return {state:"blocked",text:"",message:`The page returned HTTP ${response.status}. Paste the public text visible on this profile.`};
    const type = response.headers.get("content-type") || "";
    if (!type.toLowerCase().includes("html")) return {state:"unsupported",text:"",message:"The public page did not return HTML. Paste its visible profile text."};
    const text = pageSignals(await readLimited(response));
    if (text.length < 40) return {state:"partial",text,message:"Only a small public page description was returned. Review it and add visible profile text from this source."};
    return {state:"ok",text,message:`Read ${text.length} characters from the anonymous public page request.`};
  }
  return {state:"blocked",text:"",message:"The page could not be read anonymously. Paste visible public text."};
}

function json(data,status=200) {
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}

function withoutBody(response) {
  return new Response(null,{status:response.status,headers:response.headers});
}

function asset(path) {
  const file = FILES[path];
  if (!file) return new Response("Not found",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
  return new Response(file.body,{headers:{"content-type":file.type,"cache-control":path==="/index.html"?"no-cache":"public, max-age=300","x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","content-security-policy":"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"}});
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/read") {
      if (request.method !== "GET") {
        const response=json({state:"method_not_allowed",text:"",message:"Use GET to read a public profile."},405);
        return request.method==="HEAD"?withoutBody(response):response;
      }
      const target = allowedProfile(url.searchParams.get("url") || "");
      if (!target) return json({state:"invalid_url",text:"",message:"Use an HTTPS LinkedIn /in/ profile or Instagram profile URL."},400);
      try { return json(await fetchProfile(target)); }
      catch (error) {
        const message = error?.message === "too_large" ? "The page exceeded the 1 MB read limit." : "The platform did not provide a readable anonymous page.";
        return json({state:"unavailable",text:"",message},502);
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed",{status:405,headers:{allow:"GET, HEAD"}});
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const response=asset(path);
    return request.method==="HEAD"?withoutBody(response):response;
  }
};
