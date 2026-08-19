# Quant Question Bank

![Landing page of Quant Question Bank](docs/landing.png)

A public desk of later-round quant interview problems: probability, geometry, combinatorics, games, statistics, and strategy.

Each problem hides the solution until you reveal it, includes a timer, and has an interactive figure so you can see the mechanism instead of only reading algebra.

Use it at [https://quant-question-bank.vercel.app](https://quant-question-bank.vercel.app). Search from the header or with Command+K (Ctrl+K on Windows/Linux).

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before you change the catalog or the public copy.

Work on a branch, then open a pull request into `main`. Do not commit or push to `main`.

### Add a problem

Follow [skills/add-problem/SKILL.md](skills/add-problem/SKILL.md).

Short version: derive the answer, add a `String.raw` record with `topic` and `difficulty`, register a canvas figure on `window.Visuals`, never put raw `<` inside math.

Pull requests should say which answers you derived and how you checked the figure.

## License

MIT. See [LICENSE](LICENSE).
