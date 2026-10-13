# The Date Lab

The Date Lab is a deterministic prototype where each profile has an advocate agent. The agents compare public-topic signals, stage a fictional exchange, and rank every other profile for one person at a time. LGBTQIA+ people and people of any gender or orientation can be added and are treated the same in the ranking pool. The app does not infer identity or dating preferences, so the score is topic similarity, not a dating match or eligibility decision.

## What is included

- 25 named public-figure sample records with LinkedIn `/in/` and public Instagram profile URLs, reviewed on 2026-10-13.
- Separate short, human-reviewed paraphrases of each person's LinkedIn and Instagram profile text. Topic signals are extracted from each note independently, shown by source, and combined for rankings.
- A profile view with public interests, explicit hobby evidence when a source states it, unknowns for unsupported hobbies and dating needs, and both source links.
- Pairwise, fictional advocate simulations and topic rankings across the cohort. Each four-turn exchange is revealed step by step, uses each agent's own LinkedIn and Instagram signals, and ends with an opt-in-gated proposal or a request for more input. Nothing is sent or booked.
- An add-person flow that validates both official profile URLs, attempts anonymous HTML reads, and accepts user-pasted visible text when a platform blocks access.
- User-added profiles can be removed from the current browser; the seeded sample records cannot be deleted.
- Local-only storage for added profile text and analyses. The app does not send profile data to an LLM or persist it on a server.

The sample cohort is illustrative, not a claim that 25 people opted into dating. Its source notes paraphrase public LinkedIn and Instagram profile text reviewed on the date above. They are not records of successful automated scraping, and the original pages can change. The site labels each interaction as fictional and does not infer attraction, gender, sexuality, availability, consent, or private needs. Scores reflect only topics detected separately from the two source notes and related-topic bridges. Because the data contains no self-reported dating preferences or eligibility, these scores are topic-similarity rankings, not eligible date recommendations.

## Run locally

Requires Node.js with built-in `fetch`, `Request`, and ESM support. There are no dependencies, API keys, or paid services.

```sh
bash scripts/build.sh
node scripts/preview.mjs
```

Open `http://127.0.0.1:4173`. Profile-reader requests are made by the local preview server. LinkedIn and Instagram may reject anonymous requests; the add-person flow explains the result and offers a text-entry fallback. It does not sign in or bypass access controls.

## Deploy to Vercel

Vercel uses `vercel.json` and the dependency-free `npm run build` command. The build writes static assets to `dist/public` and the Fetch handler to `dist/server/index.js`; `api/read.js` exposes the profile reader as a Vercel Function. No environment variables or paid services are required.

## Runtime and reader

- Front end: semantic HTML, CSS, and vanilla browser JavaScript.
- Runtime: a Cloudflare Workers-style Fetch handler, packaged as a self-contained ESM entrypoint for the hosted site.
- Reader: one anonymous initial `fetch()` per supplied HTTPS profile URL; follows up to three validated same-platform profile redirects, times out each hop after 15 seconds, caps HTML at 1 MB, extracts public title/description metadata, and returns a visible blocked/partial state. No proxy, cookie, login, paid scraper, or API key.
- Analysis: deterministic phrase dictionary; a Dice-coefficient topic overlap score plus explicit related-topic bridges; and a stepwise, rule-based four-turn advocate exchange. Each turn is advanced by the reviewer. No external model is called.

This is a public-profile topic-similarity prototype, not a deployed dating service. Sample data and custom text are handled as stated above.

## Challenge form copy

**Overall explanation (under 200 characters):**

> The Date Lab welcomes LGBTQIA+ people, gives each profile an advocate agent, stages a fictional exchange, and ranks public-topic overlap without guessing identity or consent.

**Technical section (under 500 characters):**

> Vanilla JavaScript with a self-contained Fetch handler. It reads LinkedIn and Instagram URLs anonymously, follows up to three validated same-platform redirects, times out at 15 seconds per hop, caps HTML at 1 MB, and extracts public title/description metadata. If blocked, users paste visible text from those same pages. Analysis and four-turn advocate role-play use deterministic rules. No LLM, account, proxy, or paid API. Seed evidence is manually paraphrased.
