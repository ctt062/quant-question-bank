# Quant Question Bank

A static site for later-round quant interview problems.

Problems are grouped by topic (probability, geometric probability, combinatorics, games and betting, statistics, strategy) and by difficulty (easy, medium, hard). Each page hides the solution until you reveal it, includes a timer, and has an interactive figure so you can see the mechanism instead of only reading algebra. Search from the header or with Command+K (Ctrl+K on Windows/Linux).

Live site: [https://quant-question-bank.vercel.app](https://quant-question-bank.vercel.app)

Source: [https://github.com/ctt062/quant-question-bank](https://github.com/ctt062/quant-question-bank)

## Run locally

```bash
./serve.sh
```

Then open [http://127.0.0.1:8765](http://127.0.0.1:8765). Or:

```bash
python3 -m http.server 8765
```

No build step. The site is HTML, CSS, and JavaScript.

## Catalog

Ninety problems. Five easy, five medium, and five hard in each of the six topics.

| Topic | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Probability | First six; first head; dice sum 7 | Coupon collector; birthday; waiting for HH vs HT | HTH vs HHH; Bertrand's boxes; secretary |
| Geometric probability | Same half; below the diagonal; Buffon warm-up | Buffon's needle; spacings; random radius | Broken stick; covering the circle; Bertrand chord |
| Combinatorics | Fixed points; handshakes; 2^n subsets | Cycle count; inversions; Catalan parentheses | Longest cycle; airplane seating; Cayley trees |
| Games and betting | Monty Hall; matching pennies; first to heads | Penney's game; nontransitive dice; Kelly | Red-black; beauty contest; bold play |
| Statistics | Medical test; Bernoulli variance; Type I error | SE of the mean; Simpson; regression to the mean | Multiple testing; German tank; optional stopping |
| Strategy | Three prisoners; cut and choose; one-shot PD | Three hats; Vickrey; three pirates | 100 prisoners; hat parity; blue eyes |

Work each problem before opening the solution. A common first-pass for HTH is \(E[T]=8\); the linear system gives \(10\). A common first-pass for HTH beating HHH is \(2/3\); the race probability is \(3/5\).

## Add a problem

Follow [skills/add-problem/SKILL.md](skills/add-problem/SKILL.md). Agents should start at [AGENTS.md](AGENTS.md).

Short version: derive the answer, add a `String.raw` record with `topic` and `difficulty`, register a canvas figure on `window.Visuals`, never put raw `<` inside math.

## Deploy

Static hosting. [Vercel](https://vercel.com) is configured via `vercel.json`. From this directory, after `vercel login`:

```bash
npx vercel --prod
```

Or connect the GitHub repo to a Vercel project so pushes to `main` deploy.

## License

MIT. See [LICENSE](LICENSE).
