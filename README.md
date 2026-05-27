# Matthew Hill Deal Scout

An institutional acquisition sourcing agent built for **Matthew Hill**, operated by **Brian Wyss** of Avila Phoenix Ventures, LLC. It sweeps live business-for-sale listing platforms, scores each opportunity against Matthew's buy box, and surfaces the highest-fit deals first.

It is deployed as a static site on GitHub Pages and powered by the Anthropic API via a Cloudflare Worker proxy.

## Buy Box

| Parameter | Specification |
|---|---|
| **Buyer** | Matthew Hill — San Antonio, TX |
| **Geography** | San Antonio · Austin · Dallas–Fort Worth · Houston · Florida (statewide) |
| **Asking Price** | $1,000,000 – $5,000,000 (first deal) |
| **SDE Band** | $300,000 – $1,200,000 |
| **Max Multiple** | 4.5× SDE |
| **Cash Flow Objective** | Minimum $10,000 / month per business after debt service |
| **Industry** | Open — no sector excluded; all industries eligible |
| **Operating Model** | Semi-absentee / passive · W-2 staff or GM in place strongly preferred |
| **Equity Available** | $261,991 qualified down payment |
| **Total Budget** | $873,302 at 30% equity / 70% debt leverage |
| **Credit Score** | 778 |

Because industry is open, the sector toggles in the sidebar act as **search-emphasis weighting only** — no business is gated out on industry.

## Architecture

**Frontend** — Single-file `index.html` (no build step, no framework dependencies beyond Google Fonts). Avila Phoenix navy & gold institutional aesthetic, Cormorant Garamond + Inter, "MH" crest.

**Backend** — Cloudflare Worker (`worker.js`) deployed at `mh-scout.wyssbk.workers.dev`. The Worker holds the Anthropic API key as an encrypted secret and forwards browser requests to `https://api.anthropic.com/v1/messages`. The browser never sees the key. A session-only API key field is also provided for direct browser calls.

**Agent** — `claude-sonnet-4-6` with the `web_search_20250305` tool enabled. The system prompt enforces Matthew's exact buy box, an Avila Phoenix institutional voice, and explicit guardrails.

**Fallback** — If the Worker is unreachable or returns a non-200 status, the Scout transparently falls back to a curated 20-deal institutional library across all sectors and target markets, so the page never breaks.

## Scoring Matrix

Each listing is scored 0–99 across:

| Factor | Weight |
|---|---|
| Geography | 22 pts (TX metros + FL) |
| SDE band | 22 pts |
| Price band | 18 pts |
| Multiple discipline | 16 pts |
| Cash-flow gate ($120K/yr proxy) | 12 pts |
| Age & staffing | 10 pts |

**Verdict tiers:**

- **78+** — Advance to LOI
- **58–77** — Further Diligence Required
- **42–57** — Awareness Only
- **<42** — Pass

## Deployment

### 1. GitHub Pages

```bash
git init
git add index.html worker.js README.md 404.html
git commit -m "Initial: Matthew Hill Deal Scout"
git branch -M main
git remote add origin https://github.com/<your-username>/matthewhill-deal-scout.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Deploy from branch → main / root** → Save.

Live URL: `https://<your-username>.github.io/matthewhill-deal-scout/`

### 2. Cloudflare Worker

1. Cloudflare Dashboard → **Workers & Pages → Create Worker**
2. Name it `mh-scout`
3. Paste the contents of `worker.js`, click **Deploy**
4. **Settings → Variables → Encrypt** → add:
   - **Variable name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key
5. Add your GitHub Pages origin to the `ALLOWED_ORIGINS` array in `worker.js` (top of file), then redeploy
6. Verify with a browser GET to `https://mh-scout.wyssbk.workers.dev` — should return a JSON health response

### 3. Test

Open the GitHub Pages URL, click **Scout Listings**. The activity log should show:
- `Routing through Cloudflare Worker → claude-sonnet-4-6…`
- `Received N candidate listings from agent`
- `N deals cleared the buy box gate`

If the Worker is misconfigured, the log shows `Live agent path unavailable` and falls back to the curated library — the page still renders.

## Features

- Buy box filter controls (sector emphasis, geography, SDE band, price band, multiple, listing window, result count, 11 platform toggles, free-text sourcing notes)
- Matthew Hill Fit Score (0–99)
- Verdict signaling (Advance / Diligence / Awareness / Pass)
- Live mode (Worker + Anthropic) and Static mode (curated library) — automatic failover
- Session-only API key field for direct browser calls
- CSV export with metadata banner and full 15-column deal export
- Mobile-responsive down to 375px

## Files

| File | Purpose |
|---|---|
| `index.html` | The Scout app — deploy to GitHub Pages |
| `worker.js` | Cloudflare Worker proxy source |
| `404.html` | Branded 404 page |
| `README.md` | This file |

## Compliance

- Never references the Acquisition Network or Acquisition Network Investors group
- Never uses the term "retrade"
- All analyses attributed to Brian Wyss · Avila Phoenix Ventures, LLC
- Avila Phoenix institutional voice throughout

---

*Confidential — for internal use only.*
