# Quant Question Bank

A static site for later-round quant interview problems.

Problems are grouped by topic (probability, geometric probability, combinatorics, games and betting, statistics, strategy) and by difficulty (easy, medium, hard). Each page hides the solution until you reveal it, includes a timer, and has an interactive figure so you can see the mechanism instead of only reading algebra. Search from the header or with Command+K (Ctrl+K on Windows/Linux).

Live site: [https://quant-question-bank.vercel.app](https://quant-question-bank.vercel.app)

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

Twenty problems. Easy / medium / hard inside each topic.

| Topic | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Probability | Waiting for the first six | Coupon collector | HTH vs HHH |
| Geometric probability | Two points in the same half | Buffon's needle | Broken stick; covering the circle |
| Combinatorics | Expected fixed points | Expected cycle count | Longest cycle past n/2 |
| Games and betting | Monty Hall | Penney's game | Red-black even-money betting |
| Statistics | Rare disease and a good test | Standard error of the mean | Multiple testing; uniform order stats |
| Strategy | Three prisoners | Three hats | 100 prisoners |

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
