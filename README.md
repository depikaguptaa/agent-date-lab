# The Date Lab

The Date Lab gives each public profile a deterministic advocate agent. Advocates compare public-topic signals, hold a short fictional exchange, propose a low-pressure conversation setting, and rank the cohort for one person at a time.

## What is included

- 25 named public figures, each with a LinkedIn `/in/` profile URL and an Instagram profile URL.
- A profile view with topic signals, a cautious conversation-needs hypothesis, and both source links.
- Pairwise advocate-date simulations and directional rankings across the cohort.
- An add-person flow that validates both official profile URLs, attempts anonymous HTML reads, and accepts user-pasted visible text when a platform blocks access.
- Local-only storage for added profile text and analyses. The app does not send profile data to an LLM or persist it on a server.

The sample cohort is illustrative, not a claim that 25 people opted into dating. Its concise sample analyses are manually curated topic notes associated with the linked profiles, not records of successful live scraping. The site labels each interaction as fictional and does not infer attraction, sexuality, availability, consent, or private needs. Scores reflect only public-topic overlap and adjacent topics.

## Run locally

Requires Node.js with built-in `fetch`, `Request`, and ESM support. There are no dependencies, API keys, or paid services.

```sh
bash scripts/build.sh
node scripts/preview.mjs
```

Open `http://127.0.0.1:4173`. Profile-reader requests are made by the local preview server. LinkedIn and Instagram may reject anonymous requests; the add-person flow explains the result and offers a text-entry fallback. It does not sign in or bypass access controls.

## Runtime and reader

- Front end: semantic HTML, CSS, and vanilla browser JavaScript.
- Runtime: a Cloudflare Workers-style Fetch handler, packaged as a self-contained ESM entrypoint for the hosted site.
- Reader: one bounded, anonymous `fetch()` per supplied HTTPS profile URL; extracts page title and public description metadata, caps responses at 1 MB, validates each redirect host, and returns a visible blocked/partial state. No proxy, cookie, login, paid scraper, or API key.
- Analysis: deterministic phrase dictionary; a directional weighted topic score plus explicit adjacent-topic bridges; a template-based two-advocate exchange. No external model is called.

This is a public-profile compatibility prototype, not a deployed dating service. Sample data and custom text are handled as stated above.

## Challenge form copy

**Overall explanation (under 200 characters):**

> The Date Lab gives each public profile an advocate agent, stages a fictional evidence-based conversation, and ranks topic overlap without guessing attraction or consent.

**Technical section (under 500 characters):**

> Vanilla JavaScript plus a self-contained edge Fetch handler. It attempts one anonymous HTTPS request to each official LinkedIn/Instagram profile, extracts public title/description metadata, caps reads at 1 MB, validates redirects, and exposes blocked pages for user-pasted visible text. No Apify credits, cookies, login, proxy, paid API, or LLM. The 25-person sample is manually curated, not represented as scraped output.

