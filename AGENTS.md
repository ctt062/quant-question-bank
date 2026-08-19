# Agent contract

This repository is a static study desk for quant interview problems.

Read this file before changing the catalog, figures, or public copy. For a new problem, also follow `skills/add-problem/SKILL.md`.

## Product

- One-page static site. No bundler, no backend, no environment variables.
- Hash routes: `#home`, `#catalog`, `#cat/<topic>`, `#diff/<easy|medium|hard>`, `#<problem-id>`.
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

- `id` - stable hash fragment
- `topic` - one of `probability`, `geometric`, `combinatorics`, `games`, `statistics`, `strategy`
- `difficulty` - `easy` | `medium` | `hard`
- `time`, `title`, `blurb`
- `statement` and `solution` as `String.raw` HTML
- `visual` - key registered on `window.Visuals` (`sim` plus a `sim: { title, theory, caption, trial }` object is the shared Monte Carlo figure)

Topics live in `window.TOPICS`. Do not invent a seventh topic without updating the landing page copy.

## Math in HTML

Problem HTML is inserted with `innerHTML`. Never put a raw `<` or `>` inside math. Use `\lt` and `\gt`. Wrap math in `\(...\)` or `\[...\]`. `js/app.js` sanitizes remaining `<` inside those delimiters; do not rely on that as the only defense.

## Figures

Shared animation helpers are `js/visuals/engine.js` (`window.Viz`). Existing hard-set figures stay in `js/visuals.js`. New figures go in `js/visuals/<topic>.js` and attach with `Object.assign(window.Visuals, { ... })`.

Every figure needs Play (or equivalent), Reset, and a short caption. Prefer an autoplay once on mount. Monte Carlo overlays are welcome when the answer is a probability or an expectation.

Register new scripts in `index.html` after `engine.js` and before `app.js`.

## Public-facing files

Keep `README.md` accurate: what the desk is, the live URL, how to add a problem, license. Do not vendor secrets.

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
