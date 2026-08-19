---
name: add-problem
description: Add a quant interview problem to this static desk with topic, difficulty, a derived solution, KaTeX-safe HTML, and a playable canvas figure. Use when adding questions, catalog entries, animations, or interview problems to Quant Interview Desk.
---

# Add a problem

Work only in this repository. Keep the site static.

## Checklist

1. Derive the answer on paper. Do not copy a mnemonic until the algebra matches.
2. Choose one topic id: `probability`, `geometric`, `combinatorics`, `games`, `statistics`, `strategy`.
3. Choose `easy`, `medium`, or `hard`.
4. Append a record to `js/problems-more.js` (leave the original hard set in `js/problems.js`).
5. Write `statement` and `solution` with `String.raw`. Solution sections: Setup, derivation, boxed `answer-box`, interview hygiene.
6. Inside math, write `\lt` and `\gt`. Never raw `<`.
7. Implement `window.Visuals.<name>` in `js/visuals/<topic>.js` using `window.Viz` from `js/visuals/engine.js`.
8. The figure must play, reset, autoplay once, and caption the mechanism.
9. Set `visual` on the problem record to that name.
10. If you created a new visuals file, add a `<script defer>` tag in `index.html` before `js/app.js`.
11. Smoke: open `#<id>`, confirm KaTeX, reveal, and that the canvas runs.

## Record shape

```js
{
  id: "stable-slug",
  num: "21",
  topic: "probability",
  difficulty: "easy",
  time: "5–8 min",
  title: "Short title",
  blurb: "One sentence on why it is an interview problem.",
  statement: String.raw`...`,
  solution: String.raw`...`,
  visual: "visualKey"
}
```

## Do not

- Change answers of the original seven hard problems.
- Add a bundler, backend, or environment variable.
- Put solutions in the statement or in the card blurb.
