# Agent contract

This repository is a static study desk for quant interview problems.

Read this file before changing the catalog, figures, or public copy. For a new problem, also follow `skills/add-problem/SKILL.md`.

## Product

- One-page static site. No bundler, no backend, no environment variables.
- Live site: `https://quant-question-bank.vercel.app`. The Vercel project is `quant-question-bank`. Do not create, link, or deploy a `quant-interview-prep` project.
- Hash routes: `#home`, `#catalog`, `#cat/<topic>`, `#diff/<easy|medium|hard>`, `#practice`, `#practice/continue`, `#practice/hard`, `#practice/timed`, `#practice/mock`, `#practice/topic/<topic>`, `#<problem-id>`.
- Global search opens with Command+K (Ctrl+K on Windows/Linux).
- Solutions stay hidden until the reader reveals them.
- Every problem has a derived solution and a playable figure.

## Do not invent answers

Derive every numerical claim. If a popular mnemonic disagrees with the algebra, keep the algebra and name the mnemonic as a slip (see HTH waiting time 10 vs 8, and HTH-before-HHH 3/5 vs 2/3).

Existing hard-set answers must not change:

- \(E[T_{\mathrm{HTH}}]=10\), \(E[T_{\mathrm{HHH}}]=14\)
- Broken stick triangle: \(1/4\)
- Circle covering: \(E[N]=5\)
- 100 prisoners: \(1-(H_{100}-H_{50})\approx 31.2\%\)
- Multiple testing: 500 expected false positives; Bonferroni \(5\times 10^{-6}\)
- Order stats: \(E[U_{(k)}]=k/(n+1)\)
- Red-black: terminal fortune \(2^{2n}/\binom{2n}{n}\)

## Schema

Each record in `js/problems.js`, `js/problems-more.js`, or `js/problems-fill-*.js` needs:

- `id` - stable hash fragment that must not collide with reserved routes (`home`, `catalog`, `topics`, `practice`, `cat`, `diff`)
- `topic` - one of `probability`, `geometric`, `combinatorics`, `games`, `statistics`, `strategy`
- `difficulty` - `easy` | `medium` | `hard`
- `time`, `title`, `blurb`
- `statement` and `solution` as `String.raw` HTML
- `visual` - key registered on `window.Visuals`. Prefer `figure: { kind, title, caption, ... }` with `visual: "explain"` for a picture of the argument. Custom playable figures stay on named keys. `sim` plus `sim: { title, theory, caption, trial }` remains the shared running-mean figure when a Monte Carlo overlay is the right picture.

Topics live in `window.TOPICS`. Do not invent a seventh topic without updating the landing page copy.

## Math in HTML

Problem HTML is inserted with `innerHTML`. Never put a raw `<` or `>` inside math. Use `\lt` and `\gt`. Wrap math in `\(...\)` or `\[...\]`. `js/app.js` sanitizes remaining `<` inside those delimiters; do not rely on that as the only defense.

## Figures

Shared animation helpers are `js/visuals/engine.js` (`window.Viz`). Existing hard-set figures stay in `js/visuals.js` and `js/visuals/<topic>.js`. Diagram kinds for the 70 later problems live in `js/visuals/explain.js` (`Visuals.explain`).

A figure should make the argument visible: a sample space, a payoff matrix, a graph, a stick, a permutation. Do not attach a running-mean Monte Carlo that only restates the number. Use `New sample` when a fresh draw helps; omit it on static diagrams.

Register new scripts in `index.html` after `engine.js` and before `app.js`.

## Checks

`npm test` validates catalog schema (unique ids, reserved hash fragments, required fields) and runs Playwright against every hash route, search, solution reveal, notes, and figure mount.

## Public-facing files

Keep `README.md` accurate: what the desk is, the live URL, how to add a problem, license. Do not vendor secrets.

`.vercel/project.json` pins deploys to project `quant-question-bank`. Do not retarget it.

## Git

Do not commit to `main`. Do not push to `main`.

Land every later change through a pull request:

1. Create a branch named for the change.
2. Commit on that branch only.
3. Push the branch.
4. Open a pull request into `main`.
5. Do not merge the pull request unless the owner explicitly asks to merge it.

Never force-push `main`. Never skip the pull request to ship work.

## Style

- One sentence per line in markdown.
- Plain dash `-`, never an em dash.
- No agent name as a git co-author.
