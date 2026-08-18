# Quant interview prep

A local study desk for later-round quant interview problems: probability, strategy, and statistics.

The first set is six hard classics. Each page hides the solution until you reveal it, includes a timer, and has an interactive figure so you can see the mechanism instead of only reading algebra.

## Run locally

From this directory:

```bash
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765](http://127.0.0.1:8765).

The site is static HTML, CSS, and JavaScript. No build step.

## The hard set

1. Waiting time for `HTH` vs `HHH`
2. Broken stick forms a triangle
3. Covering the circle (no empty semicircle)
4. 100 prisoners
5. Multiple testing: FWER vs FDR
6. Uniform order-statistic expectations

Work each problem for 8-15 minutes before opening the solution.

## Note on problem 1

A common first-pass answer is \(E[T_{\mathrm{HTH}}]=8\). The linear system actually gives \(10\). The value \(8\) belongs to `HHT` / `HTT`, not `HTH`. The site derives both waiting times in full.
