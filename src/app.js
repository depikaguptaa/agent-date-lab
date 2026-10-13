(() => {
  const TOPICS = {
    "writing": ["writer","writing","essay","essays","author","book","books","newsletter","story","stories","read","reading"],
    "personal growth": ["growth","personal development","self development","self-improvement","self improvement","confidence","meaningful life","resilience","purpose","values"],
    "decision-making": ["decision","decisions","decision-making","decision making","judgment","judgement","choices"],
    "fitness": ["fitness","gym","training","exercise","workout","workouts","athlete","athletics","lifting","health"],
    "entrepreneurship": ["entrepreneur","entrepreneurship","founder","founders","business owner","business building","business-building","venture","ventures","startup","startups","company building","company-building"],
    "productivity": ["productivity","focus","deep work","time management","habits","routine","routines"],
    "learning": ["learning","learn","education","teaching","curiosity","curious","research","professor","student","study"],
    "creator economy": ["creator","creators","content creator","content creation","audience","online business","independent work","creative work"],
    "technology": ["technology","tech","ai","software","digital","internet","web"],
    "philosophy": ["philosophy","philosophical","meaning","human potential","life questions"],
    "creativity": ["creativity","creative","art","artist","ideas","imagination","storytelling"],
    "community": ["community","communities","belonging","trust","connection","relationships","team","teams"],
    "leadership": ["leadership","leader","leaders","management","culture","teams","organization","organizational"],
    "psychology": ["psychology","psychologist","behavior","behaviour","human behavior","human behaviour","vulnerability","courage","mindset"],
    "health": ["health","wellbeing","well-being","wellness","mental health","science-backed","science backed"],
    "podcasting": ["podcast","podcasting","host","interview","interviews"],
    "habits": ["habits","habit","routine","routines","behavior change","behaviour change","continuous improvement"],
    "dance": ["dance","dancing","movement"],
    "sports": ["sports","sport","baseball","football","basketball","tennis","athlete"],
    "books": ["books","reading","book club","author","writer"],
    "design": ["design","designer","brand design","visual","visuals","branding"],
    "communication": ["communication","storytelling","speaking","public speaking","writing"],
    "marketing": ["marketing","brand","audience","campaign","content marketing","social media"],
    "product": ["product management","product","product builder","product building"],
    "startups": ["startup","startups","venture","ventures","founder","founders"],
    "food": ["food","taco","tacos","cooking","wine","restaurant"],
    "experimentation": ["experiment","experimentation","experimenting","test","testing","try","tries"],
    "travel": ["travel","travelling","traveling","trip","trips","world"],
    "animals": ["animal","animals","dog","dogs","cat","cats","animal welfare"],
    "purpose": ["purpose","mission","meaningful","meaning","why"],
    "communication": ["communication","speaking","storytelling","ideas"]
  };
  const RELATED = {
    "writing": ["books","creator economy","communication","marketing","learning"],
    "personal growth": ["psychology","health","habits","leadership","purpose"],
    "decision-making": ["psychology","learning","product","entrepreneurship"],
    "fitness": ["health","sports","habits","personal growth"],
    "entrepreneurship": ["startups","technology","marketing","leadership","creator economy","product"],
    "productivity": ["habits","learning","writing","entrepreneurship"],
    "learning": ["books","writing","psychology","creativity","product"],
    "creator economy": ["writing","podcasting","marketing","entrepreneurship","communication"],
    "technology": ["product","startups","entrepreneurship","experimentation"],
    "philosophy": ["personal growth","writing","psychology","purpose"],
    "creativity": ["design","writing","communication","marketing"],
    "community": ["leadership","psychology","purpose","podcasting"],
    "leadership": ["entrepreneurship","psychology","community","communication"],
    "psychology": ["personal growth","leadership","health","learning"],
    "health": ["fitness","personal growth","habits","psychology"],
    "podcasting": ["communication","creator economy","learning","writing"],
    "habits": ["productivity","fitness","personal growth","learning"],
    "dance": ["creativity","fitness","health"],
    "sports": ["fitness","health","community"],
    "books": ["writing","learning","philosophy","psychology"],
    "design": ["creativity","communication","marketing","product"],
    "communication": ["writing","podcasting","leadership","creativity"],
    "marketing": ["creator economy","entrepreneurship","writing","design"],
    "product": ["technology","startups","learning","entrepreneurship","design"],
    "startups": ["technology","product","entrepreneurship","leadership"],
    "food": ["travel","community","creativity"],
    "experimentation": ["learning","technology","entrepreneurship","creativity"],
    "travel": ["food","creativity","learning","sports"],
    "animals": ["health","community","purpose"],
    "purpose": ["leadership","community","personal growth","philosophy"]
  };
  const storageKey = "date-lab-people-v1";
  const readSaved = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; } };
  const sample = (window.SEED_PEOPLE || []).map(p => ({...p, seeded:true}));
  let people = [...sample, ...readSaved()];
  let activeView = "profiles";
  let datePerson = people[0]?.id || "";
  let rankingPerson = people[0]?.id || "";
  let lastFocused = null;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const initials = name => name.split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
  const colorClass = p => ({mint:"",orange:" orange",blue:" blue",yellow:" yellow"}[p.color] || "");
  const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const topicNames = () => Object.keys(TOPICS);
  const unique = xs => [...new Set(xs)];
  const normalizeUrl = s => { try { const u = new URL(s); return u.protocol === "https:" ? u : null; } catch { return null; } };
  function validateProfiles(li, ig) {
    const l = normalizeUrl(li), i = normalizeUrl(ig);
    if (!l || !["linkedin.com","www.linkedin.com","uk.linkedin.com","ca.linkedin.com","in.linkedin.com"].includes(l.hostname) || !/^\/in\/[^/]+\/?$/.test(l.pathname)) return "Enter a public LinkedIn person profile with a /in/ URL.";
    if (!i || !["instagram.com","www.instagram.com"].includes(i.hostname) || !/^\/[A-Za-z0-9._]+\/?$/.test(i.pathname)) return "Enter a public Instagram profile URL, not a post or private account.";
    return "";
  }
  function extractTopics(text) {
    const hay = ` ${String(text||"").toLowerCase().replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ")} `;
    const hits = [];
    for (const [topic, words] of Object.entries(TOPICS)) {
      let weight = 0;
      for (const word of words) {
        const needle = ` ${word.toLowerCase()} `;
        if (hay.includes(needle)) weight += word.includes(" ") ? 2 : 1;
      }
      if (weight) hits.push({topic,weight});
    }
    return hits.sort((a,b)=>b.weight-a.weight).slice(0,8).map(x=>x.topic);
  }
  function relationship(focus, candidate) {
    const a = focus.topics || [], b = candidate.topics || [];
    const common = a.filter(x=>b.includes(x));
    const bridges = [];
    for (const left of a) for (const right of b) {
      if (left !== right && (RELATED[left]||[]).includes(right) && !common.includes(left) && !common.includes(right)) bridges.push([left,right]);
    }
    const bridge = unique(bridges.map(pair=>pair.sort().join(" + "))).slice(0,3);
    const directionalFit = (primary, secondary) => {
      if (!primary.length) return 36;
      const weights = primary.reduce((sum, topic, index) => sum + Math.max(1, 5-index), 0);
      const matched = primary.reduce((sum, topic, index) => sum + (secondary.includes(topic) ? Math.max(1, 5-index) : 0), 0);
      const adjacent = primary.reduce((sum, topic, index) => {
        if (secondary.includes(topic)) return sum;
        const related = RELATED[topic] || [];
        return sum + (secondary.some(other => related.includes(other)) ? Math.max(1, 5-index) * 0.45 : 0);
      }, 0);
      const overlap = Math.min(1, matched / weights);
      const bridgeFit = Math.min(1, adjacent / weights);
      return Math.max(36, Math.min(96, 44 + Math.round(overlap * 40) + Math.round(bridgeFit * 12)));
    };
    const focusScore = directionalFit(a,b);
    const reverseScore = directionalFit(b,a);
    return {score:Math.max(36,Math.min(96,focusScore)),mutual:Math.round((focusScore+reverseScore)/2),common,bridge};
  }
  function dateCount() { return Math.max(0,people.length*(people.length-1)/2); }
  function optionList(selected) { return people.map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===selected?"selected":""}>${escapeHtml(p.name)}</option>`).join(""); }
  function renderStats() {
    $("#stat-people").textContent = people.length;
    $("#stat-dates").textContent = dateCount();
    $("#stat-sources").textContent = people.length * 2;
    $("#profile-count").textContent = `${people.length} profiles`;
  }
  function renderPeople(filter="") {
    const query = filter.trim().toLowerCase();
    const visible = people.filter(p=>`${p.name} ${p.role} ${(p.topics||[]).join(" ")}`.toLowerCase().includes(query));
    $("#people-grid").innerHTML = visible.map(p=>`<article class="person-card" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.name)} profile" data-profile="${escapeHtml(p.id)}">
      <div class="person-head"><span class="avatar${colorClass(p)}">${escapeHtml(initials(p.name))}</span><div class="person-title"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.role || "Public profile")}</span></div><span class="card-arrow" aria-hidden="true">↗</span></div>
      <p class="person-about">${escapeHtml(p.summary || "Analysis derived from supplied public-profile text.")}</p>
      <div class="tag-row">${(p.topics||[]).slice(0,4).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      <div class="source-check"><span><i></i>LinkedIn</span><span><i></i>Instagram</span><span style="margin-left:auto">${p.seeded?"SAMPLE":"ADDED"}</span></div>
    </article>`).join("") || `<div class="empty" style="grid-column:1/-1">No people match that search.</div>`;
    $$("[data-profile]").forEach(el=>{
      el.addEventListener("click",()=>openProfile(el.dataset.profile));
      el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openProfile(el.dataset.profile);}});
    });
  }
  function renderSelects() {
    if (!people.length) return;
    if (!people.find(p=>p.id===datePerson)) datePerson=people[0].id;
    if (!people.find(p=>p.id===rankingPerson)) rankingPerson=people[0].id;
    $("#date-person").innerHTML=optionList(datePerson);
    $("#ranking-person").innerHTML=optionList(rankingPerson);
    renderDates(); renderRankings();
  }
  function renderMatchRows(focus, candidate, index, rel, mode) {
    const labels = rel.common.length ? rel.common.slice(0,2) : rel.bridge.slice(0,1).flatMap(x=>x.split(" + "));
    const score = mode === "mutual" ? rel.mutual : rel.score;
    return `<div class="match-row"><span class="rank-num">${String(index+1).padStart(2,"0")}</span><div class="match-name">${escapeHtml(candidate.name)}<small>${escapeHtml(candidate.role||"Public profile")}</small></div><div class="match-tags">${labels.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("") || `<span class="tag">new perspective</span>`}</div><div class="match-score">${score}<div class="score-track"><i style="width:${score}%"></i></div></div><div class="date-row-actions"><button class="button secondary small" data-date="${escapeHtml(focus.id)}" data-candidate="${escapeHtml(candidate.id)}">Open the date</button></div></div>`;
  }
  function getRanked(focus) {
    return people.filter(p=>p.id!==focus.id).map(p=>({person:p,relation:relationship(focus,p)})).sort((x,y)=>y.relation.score-x.relation.score||x.person.name.localeCompare(y.person.name));
  }
  function renderDates() {
    const focus=people.find(p=>p.id===datePerson); if(!focus) return;
    const ranked=getRanked(focus);
    $("#date-list-title").textContent=`${focus.name}’s agent considers`;
    $("#date-list-subtitle").textContent="Ordered by the focus agent’s profile signals, with mutual fit shown in each conversation.";
    $("#date-count").textContent=`${ranked.length} possible dates`;
    $("#date-list").innerHTML=ranked.map((x,i)=>renderMatchRows(focus,x.person,i,x.relation,"mutual")).join("");
    bindDateButtons();
  }
  function renderRankings() {
    const focus=people.find(p=>p.id===rankingPerson); if(!focus) return;
    const ranked=getRanked(focus);
    $("#ranking-title").textContent=`Best-fit conversations for ${focus.name}`;
    $("#ranking-description").textContent=`${ranked.length} other profiles ranked from ${focus.name}’s public topic signals.`;
    $("#ranking-list").innerHTML=ranked.map((x,i)=>renderMatchRows(focus,x.person,i,x.relation,"directional")).join("");
    bindDateButtons();
  }
  function bindDateButtons() {
    $$('[data-date]').forEach(button=>button.addEventListener("click",()=>openDate(button.dataset.date,button.dataset.candidate)));
  }
  function addSourceCard(label,url) {
    return `<div class="source-card"><span>${label}</span><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open public profile ↗</a></div>`;
  }
  function openProfile(id) {
    const p=people.find(x=>x.id===id); if(!p) return;
    lastFocused=document.activeElement;
    const topicChips=(p.topics||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")||`<span class="tag">No repeated topic found</span>`;
    const notes=p.seeded ? "Sample analysis uses concise, manually curated topic notes associated with these two public profile links. This sample is not presented as a live scrape." : "These topic signals were extracted from the LinkedIn and Instagram text supplied or returned by the anonymous reader. The source URLs and excerpts stay in this browser and are not uploaded to a server.";
    $("#profile-modal-content").innerHTML=`<div class="modal-head"><div class="profile-title"><span class="avatar${colorClass(p)}">${escapeHtml(initials(p.name))}</span><div><h2 class="profile-name" id="profile-modal-title">${escapeHtml(p.name)}</h2><div class="profile-role">${escapeHtml(p.role||"Public profile")}</div></div></div><button class="close" data-close="profile-modal" aria-label="Close profile">×</button></div>
      <div class="profile-grid"><div class="profile-box"><h4>Interests · public topic signals</h4><p>${escapeHtml(p.summary||"No summary available. Add visible text from the two profiles to analyze this person.")}</p><div class="tag-row">${topicChips}</div></div><div class="profile-box"><h4>Hobbies · evidence check</h4><p>${p.seeded?"The sample notes do not reliably distinguish free-time hobbies from professional topics. Ask whether any of these interests carry over into their time off.":"The reader only extracts topic mentions, not whether they are work or hobbies. Treat these themes as conversation starters, and ask what they enjoy outside work."}</p></div><div class="profile-box"><h4>Dating needs · hypothesis</h4><p>${escapeHtml(p.needs||"Neither profile states dating preferences. Ask what makes a first conversation enjoyable before drawing conclusions.")}</p></div></div>
      <div class="label">The only two source links</div>${addSourceCard("LinkedIn public profile",p.linkedin)}${addSourceCard("Instagram public profile",p.instagram)}
      <div class="interpret-note">${escapeHtml(notes)} This is a compatibility experiment based on public topics, not a claim about real attraction, availability, sexuality, or consent.</div>
      <div class="modal-actions"><button class="button secondary" data-close="profile-modal">Close profile</button><div class="right"><button class="button" data-profile-date="${escapeHtml(p.id)}">See ${escapeHtml(p.name)}’s rankings →</button></div></div>`;
    showModal("profile-modal");
    $("#profile-modal-content").querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>hideModal("profile-modal")));
    $("#profile-modal-content").querySelector("[data-profile-date]").addEventListener("click",()=>{datePerson=p.id;rankingPerson=p.id;hideModal("profile-modal");switchView("rankings");renderSelects();});
  }
  function openDate(focusId,candidateId) {
    const a=people.find(p=>p.id===focusId), b=people.find(p=>p.id===candidateId); if(!a||!b) return;
    const rel=relationship(a,b), overlap=rel.common[0]||rel.bridge[0]?.split(" + ")[0]||"a new idea";
    const second=rel.common[1]||rel.bridge[0]?.split(" + ")[1]||"a different perspective";
    const firstQuestion=rel.common.length ? `Suggested opener: both profiles return to ${overlap}. Ask what part of that topic would make a good conversation outside work.` : `Suggested opener: the profiles approach ${overlap} from different directions. Ask what draws each person to it, without assuming it is a hobby.`;
    const response=rel.common.length>1 ? `Second advocate: the profiles also overlap on ${second}. Use it as a follow-up question, not as evidence of shared values or off-work habits.` : `Second advocate: this topic could offer a different perspective. Ask whether it matters to either person beyond their public work.`;
    const dateIdea=rel.common.includes("food")?"A low-key taco spot, with phones away.":rel.common.includes("books")||rel.common.includes("writing")?"A bookshop wander, then coffee and one question each.":rel.common.includes("design")||rel.common.includes("creativity")?"A small gallery visit, followed by a walk and a favorite idea.":rel.common.includes("fitness")||rel.common.includes("sports")?"A relaxed walk somewhere green, then a casual meal.":"A quiet coffee and a walk, with room for the conversation to choose its own topic.";
    lastFocused=document.activeElement;
    $("#date-modal-content").innerHTML=`<div class="modal-head"><div><h2 id="date-modal-title">A table for two agents</h2><p>${escapeHtml(a.name)}’s advocate meets ${escapeHtml(b.name)}’s advocate.</p></div><button class="close" data-close="date-modal" aria-label="Close date">×</button></div>
      <div class="sim-intro"><span class="avatar${colorClass(a)}">${escapeHtml(initials(a.name))}</span><span class="avatar${colorClass(b)}">${escapeHtml(initials(b.name))}</span><div><strong>${rel.mutual}/100 public-signal fit</strong><br><span>${rel.common.length} shared topic${rel.common.length===1?"":"s"}${rel.bridge.length?` · ${rel.bridge.length} bridge${rel.bridge.length===1?"":"s"}`:""}</span></div></div>
      <div class="conversation"><div class="bubble a"><span class="speaker">${escapeHtml(a.name)}’s advocate · opening</span>${escapeHtml(firstQuestion)}</div><div class="bubble b"><span class="speaker">${escapeHtml(b.name)}’s advocate · evidence</span>${escapeHtml(response)}</div><div class="bubble a"><span class="speaker">${escapeHtml(a.name)}’s advocate · uncertainty check</span>The links do not show everyday pace, values, or dating intentions. Ask about those directly if both people opt in.</div><div class="bubble b"><span class="speaker">${escapeHtml(b.name)}’s advocate · next step</span>Recommendation: offer a short, low-pressure first meeting only after both people choose to participate. No consent is inferred from these profiles.</div></div>
      <div class="date-suggestion"><b>Fictional date setting:</b> ${escapeHtml(dateIdea)}</div>
      <div class="sim-footer">This exchange is generated by two deterministic advocate agents from the shared topics shown above. It is not a real conversation, endorsement, or statement of either person’s intentions.</div>
      <div class="modal-actions"><button class="button secondary" data-close="date-modal">Close</button><div class="right"><button class="button" data-rank-focus="${escapeHtml(a.id)}">Open ${escapeHtml(a.name)}’s full ranking →</button></div></div>`;
    showModal("date-modal");
    $("#date-modal-content").querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>hideModal("date-modal")));
    $("#date-modal-content").querySelector("[data-rank-focus]").addEventListener("click",e=>{rankingPerson=e.currentTarget.dataset.rankFocus;hideModal("date-modal");switchView("rankings");renderSelects();});
  }
  function showModal(id) { const el=$("#"+id); el.classList.add("open"); document.body.style.overflow="hidden"; const focus=el.querySelector("button,input,textarea,select"); if(focus) focus.focus(); }
  function hideModal(id) { $("#"+id).classList.remove("open"); if(!$$('.modal-backdrop.open').length) document.body.style.overflow=""; if(lastFocused?.focus) lastFocused.focus(); }
  function switchView(name) {
    activeView=name;
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
    $$(".tab").forEach(t=>t.setAttribute("aria-selected",String(t.dataset.view===name)));
    history.replaceState(null,"",`#${name}`);
    if(name==="dates") renderDates(); if(name==="rankings") renderRankings();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function toast(message) { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2400); }
  function validateForm() {
    const name=$("#person-name").value.trim(), li=$("#linkedin-url").value.trim(), ig=$("#instagram-url").value.trim();
    if(!name) return "Add a name first.";
    const error=validateProfiles(li,ig); if(error) return error;
    if(!$("#instagram-public-check").checked) return "Open the Instagram profile and confirm it is public before adding it.";
    if(people.some(p=>p.linkedin?.replace(/\/$/,"")===li.replace(/\/$/,"")||p.instagram?.replace(/\/$/,"")===ig.replace(/\/$/,""))) return "This LinkedIn or Instagram profile is already in the cohort.";
    return "";
  }
  async function readBoth() {
    const error=validateForm(); if(error){setStatus(error,"error");return;}
    const li=$("#linkedin-url").value.trim(), ig=$("#instagram-url").value.trim();
    $("#scrape-panels").classList.add("visible");
    $("#read-sources").disabled=true; $("#read-again").disabled=true;
    $("#scrape-status").textContent="Reading both public pages without signing in…";
    setStatus(""," ");
    const fetchSource=async url=>{
      try { const response=await fetch(`/api/read?url=${encodeURIComponent(url)}`,{headers:{Accept:"application/json"}}); const payload=await response.json(); return {...payload,ok:response.ok}; }
      catch { return {ok:false,state:"unavailable",text:"",message:"The no-cost reader is not available in this preview. Paste visible public text from this profile."}; }
    };
    const [l,i]=await Promise.all([fetchSource(li),fetchSource(ig)]);
    $("#linkedin-text").value=l.text||""; $("#instagram-text").value=i.text||"";
    const messages=[`LinkedIn: ${l.message || `${(l.text||"").length} characters read`}`,`Instagram: ${i.message || `${(i.text||"").length} characters read`}`];
    $("#scrape-status").textContent=messages.join(" · ");
    $("#read-sources").disabled=false; $("#read-again").disabled=false;
    if(l.text||i.text) setStatus("Review the returned source text. Add visible profile text if either result is incomplete, then analyze.","good");
    else setStatus("The platforms blocked anonymous access. Paste the public headline/About text and bio or visible captions from the two linked pages.","error");
    $("#linkedin-text").focus();
  }
  function setStatus(message,kind="") { const e=$("#add-status"); e.textContent=message; e.className=`form-status ${kind}`; }
  function analyzeAndSave(event) {
    event.preventDefault();
    const error=validateForm(); if(error){setStatus(error,"error");return;}
    const liText=$("#linkedin-text").value.trim(), igText=$("#instagram-text").value.trim();
    if(liText.length<20||igText.length<20){setStatus("Add at least 20 characters from each public profile so both sources contribute to the analysis.","error");return;}
    const topics=extractTopics(`${liText}\n${igText}`);
    if(!topics.length){setStatus("No known interest themes were found. Add a few explicit topics from the two source pages, then retry.","error");return;}
    const name=$("#person-name").value.trim(), linkedin=$("#linkedin-url").value.trim(), instagram=$("#instagram-url").value.trim();
    const p={id:`${slug(name)}-${Date.now().toString(36)}`,name,role:"Public profile · user added",linkedin,instagram,summary:`Public topic signals: ${topics.slice(0,4).join(", ")}. Derived from the source text entered for both profiles.`,topics,needs:`The profiles do not state dating preferences. Ask what a good first conversation feels like, then check whether the shared topics matter outside work.`,linkedinText:liText,instagramText:igText,seeded:false,color:["mint","blue","orange","yellow"][people.length%4]};
    people.push(p); localStorage.setItem(storageKey,JSON.stringify(people.filter(x=>!x.seeded)));
    renderStats();renderPeople($("#people-search").value);renderSelects();rankingPerson=p.id;datePerson=p.id;renderSelects();
    $("#add-form").reset();$("#scrape-panels").classList.remove("visible");setStatus("");hideModal("add-modal");switchView("profiles");openProfile(p.id);toast("Profile analyzed from both public sources on this device.");
  }
  function init() {
    renderStats();renderPeople();renderSelects();
    $$(".tab").forEach(t=>t.addEventListener("click",()=>switchView(t.dataset.view)));
    $$('[data-nav]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();switchView(a.dataset.nav);}));
    $("#show-rankings").addEventListener("click",()=>switchView("rankings"));
    $("#people-search").addEventListener("input",e=>renderPeople(e.target.value));
    $("#date-person").addEventListener("change",e=>{datePerson=e.target.value;renderDates();});
    $("#ranking-person").addEventListener("change",e=>{rankingPerson=e.target.value;renderRankings();});
    $("#add-person").addEventListener("click",()=>{lastFocused=document.activeElement;showModal("add-modal");});
    $("#read-sources").addEventListener("click",readBoth);$("#read-again").addEventListener("click",readBoth);$("#add-form").addEventListener("submit",analyzeAndSave);
    $("#method-link").addEventListener("click",e=>{e.preventDefault();lastFocused=document.activeElement;showModal("method-modal");});
    $$('[data-close="add-modal"]').forEach(b=>b.addEventListener("click",()=>hideModal("add-modal")));
    $$('[data-close="method-modal"]').forEach(b=>b.addEventListener("click",()=>hideModal("method-modal")));
    $$(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop)hideModal(backdrop.id);}));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){const modal=$$(".modal-backdrop.open").at(-1);if(modal)hideModal(modal.id);}});
    const hash=location.hash.replace("#",""); if(["profiles","dates","rankings"].includes(hash)) switchView(hash);
    if(new URLSearchParams(location.search).has("demo")) switchView("profiles");
  }
  init();
})();
