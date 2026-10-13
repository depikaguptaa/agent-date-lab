(() => {
  const TOPICS = {
    "writing": ["writer","writing","essay","essays","author","newsletter","story","stories"],
    "personal growth": ["growth","personal development","self development","self-improvement","self improvement","confidence","meaningful life","resilience","purpose","values"],
    "decision-making": ["decision","decisions","decision-making","decision making","judgment","judgement","choices"],
    "fitness": ["fitness","gym","training","exercise","workout","workouts","athlete","athletics","lifting","health"],
    "entrepreneurship": ["entrepreneur","entrepreneurship","founder","founders","business owner","business building","business-building","venture","ventures","startup","startups","company building","company-building"],
    "business": ["business","businesses","sales","scaling","scale","company","companies"],
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
    "books": ["book","books","reading","book club"],
    "design": ["design","designer","brand design","visual","visuals","branding"],
    "communication": ["communication","storytelling","speaking","public speaking"],
    "marketing": ["marketing","brand","audience","campaign","content marketing","social media"],
    "product": ["product management","product","product builder","product building"],
    "startups": ["startup","startups","venture","ventures","founder","founders"],
    "food": ["food","taco","tacos","cooking","wine","restaurant"],
    "experimentation": ["experiment","experimentation","experimenting","test","testing","try","tries"],
    "travel": ["travel","travelling","traveling","trip","trips","world"],
    "animals": ["animal","animals","dog","dogs","cat","cats","animal welfare"],
    "purpose": ["purpose","mission","meaningful","meaning","why"],
  };
  const RELATED = {
    "writing": ["books","creator economy","communication","marketing","learning"],
    "personal growth": ["psychology","health","habits","leadership","purpose"],
    "decision-making": ["psychology","learning","product","entrepreneurship"],
    "fitness": ["health","sports","habits","personal growth"],
    "entrepreneurship": ["startups","technology","marketing","leadership","creator economy","product","business"],
    "business": ["entrepreneurship","startups","marketing","leadership","product"],
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
  const instagramRoutes = new Set(["about","accounts","developer","direct","explore","p","reel","reels","stories","tv"]);
  const canonicalProfileUrl = (input, kind) => {
    let url;
    try { url = new URL(input); } catch { return null; }
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const isLinkedIn = kind === "linkedin" && ["linkedin.com","www.linkedin.com","uk.linkedin.com","ca.linkedin.com","in.linkedin.com"].includes(url.hostname) && /^\/in\/[A-Za-z0-9_%.-]+\/?$/.test(url.pathname);
    const instagramName=url.pathname.replace(/^\//,"").replace(/\/$/,"").toLowerCase();
    const isInstagram = kind === "instagram" && ["instagram.com","www.instagram.com"].includes(url.hostname) && /^\/[A-Za-z0-9._]+\/?$/.test(url.pathname) && !instagramRoutes.has(instagramName);
    if (!isLinkedIn && !isInstagram) return null;
    url.hostname = kind === "linkedin" ? "www.linkedin.com" : "www.instagram.com";
    url.pathname = url.pathname.replace(/\/$/, "");
    if (kind === "instagram") url.pathname = url.pathname.toLowerCase();
    url.search = "";
    url.hash = "";
    return url.href;
  };
  const validTopics = list => Array.isArray(list) ? list.filter((topic,index) => typeof topic === "string" && Object.hasOwn(TOPICS,topic) && list.indexOf(topic) === index).slice(0,8) : [];
  const readSaved = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(p => p && !p.seeded && typeof p.id === "string" && p.id.length <= 120 && typeof p.name === "string" && p.name.trim().length > 0 && p.name.trim().length <= 80)
        .map(p => ({id:p.id,name:p.name.trim(),role:String(p.role||"Public profile · user added").slice(0,120),linkedin:canonicalProfileUrl(p.linkedin,"linkedin"),instagram:canonicalProfileUrl(p.instagram,"instagram"),summary:String(p.summary||"").slice(0,500),topics:validTopics(p.topics),linkedinTopics:validTopics(p.linkedinTopics),instagramTopics:validTopics(p.instagramTopics),linkedinText:String(p.linkedinText||"").slice(0,6000),instagramText:String(p.instagramText||"").slice(0,6000),hobbies:String(p.hobbies||"").slice(0,500),seeded:false,color:["mint","blue","orange","yellow"].includes(p.color)?p.color:"mint"}))
        .filter(p => p.linkedin && p.instagram && p.topics.length > 0);
    } catch { return []; }
  };
  const sample = (window.SEED_PEOPLE || []).map(p => {
    const linkedinTopics=extractTopics(p.linkedinText), instagramTopics=extractTopics(p.instagramText);
    const topics=[...new Set([...linkedinTopics,...instagramTopics])].slice(0,8);
    const corroborated=linkedinTopics.filter(topic=>instagramTopics.includes(topic));
    const basis=corroborated.length?`Both linked sources mention ${corroborated.slice(0,3).join(", ")}.`:`LinkedIn and Instagram together mention ${topics.slice(0,4).join(", ")}.`;
    return {...p,summary:`Source-derived public topics: ${basis}`,topics,linkedinTopics,instagramTopics,seeded:true};
  });
  const sampleUrls = new Set(sample.flatMap(p => [canonicalProfileUrl(p.linkedin,"linkedin"),canonicalProfileUrl(p.instagram,"instagram")]));
  let people = [...sample, ...readSaved().filter(p => !sampleUrls.has(p.linkedin) && !sampleUrls.has(p.instagram))];
  let datePerson = people[0]?.id || "";
  let rankingPerson = people[0]?.id || "";
  let lastFocused = null;
  let readController = null;
  let sourceReviewKey = "";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const unique = xs => [...new Set(xs)];
  function validateProfiles(li, ig) {
    if (!canonicalProfileUrl(li,"linkedin")) return {field:"linkedin-url",message:"Enter an HTTPS LinkedIn person profile with a /in/ URL and no port or sign-in details."};
    if (!canonicalProfileUrl(ig,"instagram")) return {field:"instagram-url",message:"Enter an HTTPS Instagram profile URL, not a post or private account."};
    return null;
  }
  function currentSourceReviewKey() {
    return JSON.stringify([
      $("#person-name").value.trim(),
      canonicalProfileUrl($("#linkedin-url").value.trim(),"linkedin"),
      canonicalProfileUrl($("#instagram-url").value.trim(),"instagram")
    ]);
  }
  function extractTopics(text) {
    // LinkedIn appends this generic platform footer to some public descriptions.
    // It is not evidence about the profile owner, so exclude it before topic extraction.
    const profileText=String(text||"").replace(/\bview\s+.{1,180}?\s+profile\s+on\s+linkedin,\s+a\s+professional\s+community\s+of\s+[^.]*\.?/gi," ");
    const hay = ` ${profileText.toLowerCase().replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ")} `;
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
    const bridge = unique(bridges.map(pair=>pair.sort().join(" + "))).slice(0,5);
    const denominator = a.length + b.length;
    const overlapIndex = denominator ? (2 * common.length) / denominator : 0;
    const score = Math.min(100, Math.round(overlapIndex * 75 + Math.min(25, bridge.length * 5)));
    return {score,common,bridge};
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
    $("#people-grid").innerHTML = visible.map(p=>`<tr>
      <th scope="row"><button class="person-open" type="button" data-profile="${escapeHtml(p.id)}">${escapeHtml(p.name)}<span class="person-role">${escapeHtml(p.role || "Public profile")}</span></button></th>
      <td data-col="signals"><span class="person-summary">${escapeHtml(p.summary || "Analysis derived from supplied public-profile text.")}</span><span class="tag-row">${(p.topics||[]).slice(0,4).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</span></td>
      <td data-col="sources"><div class="source-links"><a href="${escapeHtml(p.linkedin)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Open ${escapeHtml(p.name)} LinkedIn profile">LI</a><a href="${escapeHtml(p.instagram)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Open ${escapeHtml(p.name)} Instagram profile">IG</a></div></td>
      <td data-col="basis"><span class="source-state">${p.seeded?`Public pair reviewed · ${escapeHtml(p.sourceCheckedAt||"date unavailable")}`:"Text analyzed in browser"}</span></td>
      <td data-col="action"><button class="button secondary small table-action" type="button" data-profile="${escapeHtml(p.id)}">Inspect</button></td>
    </tr>`).join("") || `<tr><td class="empty" colspan="5">No people match that search.</td></tr>`;
    $$("[data-profile]").forEach(el=>{
      el.addEventListener("click",()=>openProfile(el.dataset.profile));
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
  function renderMatchRows(focus, candidate, index, rel) {
    const labels = rel.common.length ? rel.common.slice(0,2) : rel.bridge[0]?.split(" + ") || [];
    const score = rel.score;
    const basis=rel.common.length?rel.common.slice(0,2).map(topic=>`${topic}: ${focus.name} (${sourceNames(focus,topic)}), ${candidate.name} (${sourceNames(candidate,topic)})`).join(" · "):rel.bridge.length?`${rel.bridge[0]} connect topics detected in the two-source notes`:`No shared topic evidence found`;
    return `<div class="match-row"><span class="rank-num">${String(index+1).padStart(2,"0")}</span><div class="match-name">${escapeHtml(candidate.name)}<small>${escapeHtml(candidate.role||"Public profile")}</small><small class="match-evidence">Evidence: ${escapeHtml(basis)}</small></div><div class="match-tags">${labels.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("") || `<span class="tag">No shared topic or bridge</span>`}</div><div class="match-score">${score}<span class="score-label">index / 100</span><div class="score-track" aria-hidden="true"><i style="width:${score}%"></i></div></div><div class="date-row-actions"><button class="button secondary small" type="button" aria-label="Open simulation with ${escapeHtml(candidate.name)}, rank ${index+1}" data-date="${escapeHtml(focus.id)}" data-candidate="${escapeHtml(candidate.id)}">Open simulation</button></div></div>`;
  }
  function sourceNames(person,topic) {
    const names=[];
    if((person.linkedinTopics||[]).includes(topic)) names.push("LinkedIn");
    if((person.instagramTopics||[]).includes(topic)) names.push("Instagram");
    return names.join(" + ")||"no source tag";
  }
  function advocateEvidence(person, topics) {
    return topics.length
      ? topics.map(topic=>`${topic} (${sourceNames(person,topic)})`).join(", ")
      : "no topic terms detected in either source note";
  }
  function advocateDialogue(a,b,rel) {
    const lead=rel.common[0]||rel.bridge[0]?.split(" + ")[0]||"a public-profile topic";
    const otherLead=rel.common[1]||rel.bridge[0]?.split(" + ")[1]||lead;
    const aEvidence=advocateEvidence(a,rel.common.length?[lead]:a.topics.slice(0,2));
    const bEvidence=advocateEvidence(b,rel.common.length?[lead]:b.topics.slice(0,2));
    const type=rel.common.length?"shared topic":rel.bridge.length?"related topics":"no clear topic overlap";
    const inviteIdea=rel.common.includes("food")?"a casual meal":rel.common.includes("books")||rel.common.includes("writing")?"a bookshop and coffee":rel.common.includes("design")||rel.common.includes("creativity")?"a small gallery visit":rel.common.includes("fitness")||rel.common.includes("sports")?"a relaxed walk":"a quiet coffee";
    const plan=rel.common.length
      ? `Draft a low-pressure first-meeting idea around ${lead}: ${inviteIdea}. Keep it as a draft until both people explicitly opt in.`
      : rel.bridge.length
        ? `Draft a question about how ${lead} and ${otherLead} connect. Wait for both people to opt in before suggesting a meeting.`
        : "Do not draft a date idea from this evidence. Ask each person for their own interests and preferences, with their consent.";
    const turns=[
      {side:"a",name:a.name,stage:"Read and open",text:`My two source notes surfaced ${aEvidence}. I would use ${lead} as a conversation opener, then ask whether it is enjoyable outside work.`},
      {side:"b",name:b.name,stage:"Independent read",text:`My own notes surfaced ${bEvidence}. I see a ${type}, which is a lead for a question, not proof of a shared hobby, attraction, or dating interest.`},
      {side:"a",name:a.name,stage:"Proposal",text:plan},
      {side:"b",name:b.name,stage:"Decision",text:`I cannot accept or schedule for ${b.name}. The public sources do not state dating intent, availability, or preferred setting. Keep the proposal pending until both people choose to participate.`}
    ];
    return {lead,otherLead,inviteIdea,plan,turns,outcome:rel.common.length?"Draft only · human opt-in required":rel.bridge.length?"Question first · human opt-in required":"No date proposal · more input needed"};
  }
  function getRanked(focus) {
    return people.filter(p=>p.id!==focus.id).map(p=>({person:p,relation:relationship(focus,p)})).sort((x,y)=>y.relation.score-x.relation.score||x.person.name.localeCompare(y.person.name));
  }
  function renderDates() {
    const focus=people.find(p=>p.id===datePerson); if(!focus) return;
    const ranked=getRanked(focus);
    $("#date-list-title").textContent=`${focus.name}’s agent considers`;
    $("#date-list-subtitle").textContent="Ordered by public-topic overlap and related-topic bridges.";
    $("#date-count").textContent=`${ranked.length} possible simulations`;
    $("#date-list").innerHTML=ranked.map((x,i)=>renderMatchRows(focus,x.person,i,x.relation)).join("") || `<p class="empty">Add another profile to create a pair simulation.</p>`;
    bindDateButtons($("#date-list"));
  }
  function renderRankings() {
    const focus=people.find(p=>p.id===rankingPerson); if(!focus) return;
    const ranked=getRanked(focus);
    $("#ranking-title").textContent=`Topic ranking for ${focus.name}`;
    $("#ranking-description").textContent=`${ranked.length} other profiles ranked from ${focus.name}’s public topic signals.`;
    $("#ranking-list").innerHTML=ranked.map((x,i)=>renderMatchRows(focus,x.person,i,x.relation)).join("") || `<p class="empty">Add another profile to create a ranking.</p>`;
    bindDateButtons($("#ranking-list"));
  }
  function bindDateButtons(container) {
    container.querySelectorAll('[data-date]').forEach(button=>button.addEventListener("click",()=>openDate(button.dataset.date,button.dataset.candidate)));
  }
  function addSourceCard(label,url,text,seeded,topics=[],name="person") {
    const evidence = text ? `<span class="source-excerpt"><b>${seeded?"Source note · paraphrased":"Text analyzed"}:</b> ${escapeHtml(text)}</span>` : `<span class="source-excerpt">${seeded?"No public source note is available for this sample.":"No text returned from this source."}</span>`;
    const signals = topics.length ? `<span class="source-excerpt"><b>Extracted signals:</b> ${topics.map(escapeHtml).join(", ")}</span>` : "";
    return `<div class="source-card"><span class="source-label">${label}</span><span class="source-evidence">${evidence}${signals}</span><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Open ${escapeHtml(name)} ${escapeHtml(label)} profile">Open source</a></div>`;
  }
  function openProfile(id) {
    const p=people.find(x=>x.id===id); if(!p) return;
    lastFocused=document.activeElement;
    const topicChips=(p.topics||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")||`<span class="tag">No repeated topic found</span>`;
    const notes=p.seeded ? `These short notes paraphrase visible public-profile text reviewed on ${p.sourceCheckedAt||"an unspecified date"}. Open either official profile to inspect the source. Topics are extracted separately from each note; profile content can change.` : "The two excerpts below are the only text analyzed. They were returned by the anonymous reader or supplied by the user, and are stored in this browser only.";
    $("#profile-modal-content").innerHTML=`<div class="modal-head"><div><h2 class="profile-name" id="profile-modal-title">${escapeHtml(p.name)}</h2><div class="profile-role">${escapeHtml(p.role||"Public profile")}</div></div><button class="close" data-close="profile-modal" aria-label="Close profile">×</button></div>
      <div class="profile-grid"><div class="profile-box"><h3>Public interests</h3><p>${escapeHtml(p.summary||"No summary available. Add visible text from both profiles to analyze this person.")}</p><div class="tag-row">${topicChips}</div></div><div class="profile-box"><h3>Hobbies and personal interests</h3><p>${escapeHtml(p.hobbies||"No specific off-work hobby is stated clearly in these source notes. Professional topics are not treated as hobbies.")}</p></div><div class="profile-box"><h3>Dating needs</h3><p>Not stated by either source. The agent leaves this unknown and recommends asking directly, with the person’s consent.</p></div><div class="profile-box"><h3>Other qualities</h3><p>${escapeHtml(p.role||"Public profile")} is presented as a professional descriptor only. No personality or relationship claim is inferred.</p></div></div>
      <div class="label">Exactly two sources</div>${addSourceCard("LinkedIn",p.linkedin,p.linkedinText,p.seeded,p.linkedinTopics||[],p.name)}${addSourceCard("Instagram",p.instagram,p.instagramText,p.seeded,p.instagramTopics||[],p.name)}
      <div class="interpret-note">${escapeHtml(notes)} Topics are not evidence of attraction, availability, sexuality, relationship intent, or consent.</div>
      <div class="modal-actions"><div class="left-actions"><button class="button secondary" data-close="profile-modal">Close profile</button>${p.seeded?"":`<button class="button secondary small" type="button" data-remove-profile="${escapeHtml(p.id)}">Remove from this browser</button>`}</div><div class="right"><button class="button" data-profile-date="${escapeHtml(p.id)}">See ${escapeHtml(p.name)}’s rankings →</button></div></div>`;
    showModal("profile-modal");
    $("#profile-modal-content").querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>hideModal("profile-modal")));
    $("#profile-modal-content").querySelector("[data-profile-date]").addEventListener("click",()=>{datePerson=p.id;rankingPerson=p.id;hideModal("profile-modal");switchView("rankings");renderSelects();});
    const removeButton=$("#profile-modal-content").querySelector("[data-remove-profile]");
    if(removeButton) removeButton.addEventListener("click",()=>removeUserProfile(p.id));
  }
  function removeUserProfile(id) {
    const person=people.find(p=>p.id===id);
    if(!person||person.seeded) return;
    if(!window.confirm(`Remove ${person.name}'s locally saved profile and text from this browser? This cannot be undone from the site.`)) return;
    const next=people.filter(p=>p.id!==id);
    try { localStorage.setItem(storageKey,JSON.stringify(next.filter(p=>!p.seeded))); }
    catch { setStatus("This browser could not update its saved profiles. The profile was not removed.","error"); return; }
    people=next;
    renderStats();renderPeople($("#people-search").value);renderSelects();
    hideModal("profile-modal");switchView("profiles");toast("Profile removed from this browser.");
  }
  function openDate(focusId,candidateId) {
    const a=people.find(p=>p.id===focusId), b=people.find(p=>p.id===candidateId); if(!a||!b) return;
    const rel=relationship(a,b), dialogue=advocateDialogue(a,b,rel);
    lastFocused=document.activeElement;
    $("#date-modal-content").innerHTML=`<div class="modal-head"><div><h2 id="date-modal-title">Two advocates, one proposal</h2><p>${escapeHtml(a.name)}’s advocate and ${escapeHtml(b.name)}’s advocate reason from separate source notes.</p></div><button class="close" data-close="date-modal" aria-label="Close simulation">×</button></div>
      <div class="sim-intro"><div><strong>${rel.score}/100 topic signal index</strong><br><span>${rel.common.length} shared topic${rel.common.length===1?"":"s"}${rel.bridge.length?` · ${rel.bridge.length} related-topic bridge${rel.bridge.length===1?"":"s"}`:""} · ${escapeHtml(dialogue.outcome)}</span></div></div>
      <div class="sim-evidence"><strong>Source signals used</strong><div><span>${escapeHtml(a.name)}</span><small>LinkedIn: ${escapeHtml((a.linkedinTopics||[]).join(", ")||"no topic term detected")}<br>Instagram: ${escapeHtml((a.instagramTopics||[]).join(", ")||"no topic term detected")}</small><a href="${escapeHtml(a.linkedin)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">LinkedIn</a><a href="${escapeHtml(a.instagram)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Instagram</a></div><div><span>${escapeHtml(b.name)}</span><small>LinkedIn: ${escapeHtml((b.linkedinTopics||[]).join(", ")||"no topic term detected")}<br>Instagram: ${escapeHtml((b.instagramTopics||[]).join(", ")||"no topic term detected")}</small><a href="${escapeHtml(b.linkedin)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">LinkedIn</a><a href="${escapeHtml(b.instagram)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Instagram</a></div></div>
      <div class="turn-controls"><button class="button small" id="advance-agent-turn" type="button">Run agent exchange</button><span id="turn-progress" aria-live="polite">0 of ${dialogue.turns.length} turns</span></div>
      <div class="conversation" id="agent-conversation" aria-label="Deterministic advocate exchange" aria-live="polite"></div>
      <div class="date-suggestion" id="agent-outcome" hidden><b>Agents’ outcome:</b> ${escapeHtml(dialogue.outcome)}${rel.common.length?`<br><span>Hypothetical plan: ${escapeHtml(dialogue.inviteIdea)} around ${escapeHtml(dialogue.lead)}.</span>`:""}</div>
      <div class="sim-footer">This is a deterministic, fictional role-play based only on the two linked source notes per person. It is not a real conversation, endorsement, invitation, or statement of either person’s intentions. Nothing is sent or booked. The ranking score measures topic similarity, not dating compatibility.</div>
      <div class="modal-actions"><button class="button secondary" data-close="date-modal">Close</button><div class="right"><button class="button" data-rank-focus="${escapeHtml(a.id)}">Open ${escapeHtml(a.name)}’s full ranking →</button></div></div>`;
    showModal("date-modal");
    $("#date-modal-content").querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>hideModal("date-modal")));
    let turnIndex=0;
    $("#advance-agent-turn").addEventListener("click",event=>{
      const turn=dialogue.turns[turnIndex];
      if(!turn) return;
      const bubble=document.createElement("div");
      bubble.className=`bubble ${turn.side}`;
      const speaker=document.createElement("span");
      speaker.className="speaker";
      speaker.textContent=`Turn ${turnIndex+1} · ${turn.name}’s advocate · ${turn.stage}`;
      const text=document.createElement("span");
      text.textContent=turn.text;
      bubble.append(speaker,text);
      $("#agent-conversation").append(bubble);
      turnIndex++;
      $("#turn-progress").textContent=`${turnIndex} of ${dialogue.turns.length} turns`;
      if(turnIndex===dialogue.turns.length) {
        event.currentTarget.disabled=true;
        event.currentTarget.textContent="Exchange complete";
        $("#agent-outcome").hidden=false;
      } else {
        event.currentTarget.textContent=`Advance to turn ${turnIndex+1}`;
      }
    });
    $("#date-modal-content").querySelector("[data-rank-focus]").addEventListener("click",e=>{rankingPerson=e.currentTarget.dataset.rankFocus;hideModal("date-modal");switchView("rankings");renderSelects();});
  }
  function showModal(id) { const el=$("#"+id); el.classList.add("open"); $(".page").inert=true; document.body.style.overflow="hidden"; const focus=el.querySelector("[data-initial-focus]")||el.querySelector("button,input,textarea,select"); if(focus) focus.focus(); }
  function cancelRead() {
    if (!readController) return;
    readController.abort();
    readController=null;
    $("#read-sources").disabled=false;
    $("#read-again").disabled=false;
  }
  function hideModal(id) {
    if(id==="add-modal") cancelRead();
    $("#"+id).classList.remove("open");
    if(!$$('.modal-backdrop.open').length) { document.body.style.overflow=""; $(".page").inert=false; if(lastFocused?.focus) lastFocused.focus(); }
  }
  function switchView(name) {
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
    $$(".tab").forEach(t=>{const selected=t.dataset.view===name;t.setAttribute("aria-selected",String(selected));t.tabIndex=selected?0:-1;});
    history.replaceState(null,"",`#${name}`);
    if(name==="dates") renderDates(); if(name==="rankings") renderRankings();
    window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  }
  function toast(message) { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2400); }
  function validateForm() {
    const name=$("#person-name").value.trim(), li=$("#linkedin-url").value.trim(), ig=$("#instagram-url").value.trim();
    if(!name) { $("#person-name").focus(); return "Add a name first."; }
    const profileError=validateProfiles(li,ig); if(profileError) { $("#"+profileError.field).focus(); return profileError.message; }
    if(!$("#instagram-public-check").checked) { $("#instagram-public-check").focus(); return "Confirm these links belong to the same person and that Instagram is public."; }
    const normalizedLinkedIn=canonicalProfileUrl(li,"linkedin"), normalizedInstagram=canonicalProfileUrl(ig,"instagram");
    if(people.some(p=>canonicalProfileUrl(p.linkedin,"linkedin")===normalizedLinkedIn||canonicalProfileUrl(p.instagram,"instagram")===normalizedInstagram)) return "This LinkedIn or Instagram profile is already in the cohort.";
    return "";
  }
  async function readBoth() {
    const error=validateForm(); if(error){setStatus(error,"error");return;}
    cancelRead();
    sourceReviewKey="";
    const controller=new AbortController();
    readController=controller;
    const li=$("#linkedin-url").value.trim(), ig=$("#instagram-url").value.trim();
    $("#scrape-panels").hidden=false;
    $("#scrape-panels").classList.add("visible");
    $("#read-sources").disabled=true; $("#read-again").disabled=true;
    $("#scrape-status").textContent="Reading both public pages without signing in…";
    setStatus("");
    const fetchSource=async url=>{
      try { const response=await fetch(`/api/read?url=${encodeURIComponent(url)}`,{headers:{Accept:"application/json"},signal:controller.signal}); const payload=await response.json(); return {...payload,ok:response.ok}; }
      catch { return {ok:false,state:"unavailable",text:"",message:"The no-cost reader is not available in this preview. Paste visible public text from this profile."}; }
    };
    const [l,i]=await Promise.all([fetchSource(li),fetchSource(ig)]);
    if(controller.signal.aborted) return;
    $("#linkedin-text").value=l.text||""; $("#instagram-text").value=i.text||"";
    sourceReviewKey=currentSourceReviewKey();
    const messages=[`LinkedIn: ${l.message || `${(l.text||"").length} characters read`}`,`Instagram: ${i.message || `${(i.text||"").length} characters read`}`];
    $("#scrape-status").textContent=messages.join(" · ");
    $("#read-sources").disabled=false; $("#read-again").disabled=false;
    readController=null;
    if(l.text||i.text) setStatus("Review the returned source text. Add visible profile text if either result is incomplete, then analyze.","good");
    else setStatus("The platforms blocked anonymous access. Paste the public headline/About text and bio or visible captions from the two linked pages.","error");
    $("#linkedin-text").focus();
  }
  function setStatus(message,kind="") { const e=$("#add-status"); e.textContent=message; e.className=`form-status ${kind}`; }
  function invalidateSourceText() {
    cancelRead();
    sourceReviewKey="";
    const hadSourceText=Boolean($("#linkedin-text").value||$("#instagram-text").value);
    $("#linkedin-text").value="";
    $("#instagram-text").value="";
    $("#instagram-public-check").checked=false;
    if(!$("#scrape-panels").hidden&&(hadSourceText||$("#add-status").textContent)) setStatus("The name or profile links changed. Confirm the links again, then read and review both current sources before analysis.","error");
  }
  function analyzeAndSave(event) {
    event.preventDefault();
    const error=validateForm(); if(error){setStatus(error,"error");return;}
    if(sourceReviewKey!==currentSourceReviewKey()){setStatus("The name or profile links changed after the sources were read. Read both current profiles, then review their text before analysis.","error");return;}
    const liText=$("#linkedin-text").value.trim(), igText=$("#instagram-text").value.trim();
    if(liText.length<20||igText.length<20){setStatus("Add at least 20 characters from each public profile so both sources contribute to the analysis.","error");return;}
    const linkedinTopics=extractTopics(liText), instagramTopics=extractTopics(igText);
    const topics=unique([...linkedinTopics,...instagramTopics]).slice(0,8);
    if(!topics.length){setStatus("No known interest themes were found. Add a few explicit topics from the two source pages, then retry.","error");return;}
    const name=$("#person-name").value.trim(), linkedin=canonicalProfileUrl($("#linkedin-url").value.trim(),"linkedin"), instagram=canonicalProfileUrl($("#instagram-url").value.trim(),"instagram");
    const p={id:`${slug(name)}-${Date.now().toString(36)}`,name,role:"Public profile · user added",linkedin,instagram,summary:`Public topic signals: ${topics.slice(0,4).join(", ")}. Derived from the source text entered for both profiles.`,topics,linkedinTopics,instagramTopics,linkedinText:liText,instagramText:igText,seeded:false,color:["mint","blue","orange","yellow"][people.length%4]};
    try { localStorage.setItem(storageKey,JSON.stringify([...people.filter(x=>!x.seeded),p])); }
    catch { setStatus("This browser could not save the profile. Free up local storage, then retry.","error"); return; }
    people.push(p);
    renderStats();renderPeople($("#people-search").value);renderSelects();rankingPerson=p.id;datePerson=p.id;renderSelects();
    $("#add-form").reset();sourceReviewKey="";$("#scrape-panels").classList.remove("visible");$("#scrape-panels").hidden=true;setStatus("");hideModal("add-modal");switchView("profiles");openProfile(p.id);toast("Profile analyzed from the two sources in this browser.");
  }
  function init() {
    renderStats();renderPeople();renderSelects();
    $$(".tab").forEach(t=>t.addEventListener("click",()=>switchView(t.dataset.view)));
    $(".tabs").addEventListener("keydown",e=>{
      const tabs=$$(".tab"), index=tabs.indexOf(document.activeElement); if(index<0) return;
      let next=null;
      if(e.key==="ArrowRight") next=tabs[(index+1)%tabs.length];
      if(e.key==="ArrowLeft") next=tabs[(index-1+tabs.length)%tabs.length];
      if(e.key==="Home") next=tabs[0];
      if(e.key==="End") next=tabs.at(-1);
      if(next){e.preventDefault();next.focus();next.click();}
    });
    $$('[data-nav]').forEach(a=>a.addEventListener("click",e=>{
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
      e.preventDefault();switchView(a.dataset.nav);
    }));
    $("#show-rankings").addEventListener("click",()=>switchView("rankings"));
    $("#people-search").addEventListener("input",e=>renderPeople(e.target.value));
    $("#date-person").addEventListener("change",e=>{datePerson=e.target.value;renderDates();});
    $("#ranking-person").addEventListener("change",e=>{rankingPerson=e.target.value;renderRankings();});
    $("#person-name").addEventListener("input",invalidateSourceText);
    $("#linkedin-url").addEventListener("input",invalidateSourceText);
    $("#instagram-url").addEventListener("input",invalidateSourceText);
    $("#add-person").addEventListener("click",()=>{lastFocused=document.activeElement;showModal("add-modal");});
    $("#read-sources").addEventListener("click",readBoth);$("#read-again").addEventListener("click",readBoth);$("#add-form").addEventListener("submit",analyzeAndSave);
    $("#method-link").addEventListener("click",()=>{lastFocused=document.activeElement;showModal("method-modal");});
    $$('[data-close="add-modal"]').forEach(b=>b.addEventListener("click",()=>hideModal("add-modal")));
    $$('[data-close="method-modal"]').forEach(b=>b.addEventListener("click",()=>hideModal("method-modal")));
    $$(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop)hideModal(backdrop.id);}));
    document.addEventListener("keydown",e=>{
      const modal=$$(".modal-backdrop.open").at(-1); if(!modal) return;
      if(e.key==="Escape"){hideModal(modal.id);return;}
      if(e.key==="Tab"){
        const focusable=[...modal.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
        if(!focusable.length){e.preventDefault();return;}
        const first=focusable[0],last=focusable.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
    const hash=location.hash.replace("#","");
    const initialView=new URLSearchParams(location.search).has("demo")?"profiles":["profiles","dates","rankings"].includes(hash)?hash:"profiles";
    switchView(initialView);
  }
  init();
})();
