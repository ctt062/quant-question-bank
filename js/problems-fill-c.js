(() => {
  function entry(p) {
    return Object.assign({
      visual: p.figure ? "explain" : "sim",
      time: p.difficulty === "easy" ? "5–8 min" : p.difficulty === "medium" ? "8–12 min" : "10–15 min"
    }, p);
  }

  window.PROBLEMS = window.PROBLEMS.concat([
    entry({
      id: "matching-pennies", num: "56", topic: "games", difficulty: "easy",
      title: "Matching pennies",
      blurb: "Zero-sum. The unique mixed Nash is fair coins, and the value is 0.",
      statement: String.raw`<p>A and B each show H or T. A wins \(+1\) on a match and \(-1\) on a mismatch. Find the unique mixed Nash and the value of the game.</p>`,
      solution: String.raw`<p>If A plays H with probability \(p\) and B with probability \(q\), A's expected payoff is \(2\bigl(pq+(1-p)(1-q)\bigr)-1=(2p-1)(2q-1)\). B can hold A to 0 by playing \(q=1/2\), and A can guarantee 0 by playing \(p=1/2\). That is the unique mixed Nash. The value is 0.</p><div class="answer-box"><strong>Answer.</strong> Both mix \(1/2\). Value \(0\).</div>`,
      figure: { kind: "payoff", title: "Matching pennies", caption: "A wins +1 on a match. Unique mixed Nash is 1/2, 1/2 and the value is 0.", heading: "Zero-sum", rows: ["H", "T"], cols: ["H", "T"], cells: [["+1", "-1"], ["-1", "+1"]], note: "Mix 1/2 to hold the opponent to 0." }
    }),
    entry({
      id: "dice-higher", num: "57", topic: "games", difficulty: "easy",
      title: "Higher roll wins",
      blurb: "Two independent d6. Ties are not wins.",
      statement: String.raw`<p>A and B each roll a fair d6. Find \(\mathbb{P}(A\gt B)\).</p>`,
      solution: String.raw`<p>\(\mathbb{P}(A=B)=1/6\). Symmetry splits the rest, so \(\mathbb{P}(A\gt B)=(1-1/6)/2=5/12\).</p><div class="answer-box"><strong>Answer.</strong> \(5/12\).</div>`,
      figure: { kind: "diceGrid", title: "Strictly higher", caption: "Ties are 6/36. The rest splits, so P(A>B)=5/12.", heading: "A > B", pred: (a, b) => a > b, note: "15 gold cells out of 36." }
    }),
    entry({
      id: "first-to-heads", num: "58", topic: "games", difficulty: "easy",
      title: "First to flip heads",
      blurb: "You start. Alternating fair coins. First heads wins with probability 2/3.",
      statement: String.raw`<p>You and an opponent alternate fair coin flips. You go first. The first head wins. Find your win probability.</p>`,
      solution: String.raw`<p>Win immediately with probability \(1/2\), or TT (probability \(1/4\)) and the game restarts: \(p=\tfrac12+\tfrac14 p\), so \(p=2/3\).</p><div class="answer-box"><strong>Answer.</strong> \(2/3\).</div>`,
      figure: { kind: "coins", title: "You flip first", caption: "Win on the first flip (1/2) or restart after TT (1/4). p=1/2+(1/4)p so p=2/3.", heading: "First to heads" }
    }),
    entry({
      id: "red-then-black", num: "59", topic: "games", difficulty: "easy",
      title: "Red then black",
      blurb: "Without replacement. First red and second black is 13/51, not 1/4.",
      statement: String.raw`<p>A 52-card deck has 26 red and 26 black. Draw two cards without replacement. Find \(\mathbb{P}(\text{first red, second black})\).</p>`,
      solution: String.raw`\[ \frac{26}{52}\cdot\frac{26}{51}=\frac{13}{51}. \]<div class="answer-box"><strong>Answer.</strong> \(13/51\).</div>`,
      figure: { kind: "payoff", title: "Without replacement", caption: "First red then black is (26/52)×(26/51)=13/51, not 1/4.", heading: "Two draws", rows: ["1st R", "1st B"], cols: ["2nd R", "2nd B"], cells: [["25/51", "26/51"], ["26/51", "25/51"]], note: "The displayed second-card fractions are conditional on the first color." }
    }),
    entry({
      id: "nim-two-piles", num: "60", topic: "games", difficulty: "medium",
      title: "Nim with two piles",
      blurb: "Last object wins. First player wins iff the nim-sum is not zero.",
      statement: String.raw`<p>Two-pile Nim, sizes 3 and 5, normal play. Does the first player have a winning strategy?</p>`,
      solution: String.raw`<p>\(3\oplus 5=6\ne 0\), so yes. A winning move is to leave equal piles, e.g. (3,3).</p><div class="answer-box"><strong>Answer.</strong> Yes. The nim-sum is nonzero.</div>`,
      figure: { kind: "piles", title: "Nim-sum 3 ⊕ 5 = 6", caption: "Nonzero xor: first player wins. Equalize to (3,3).", heading: "Two-pile Nim", sizes: [3, 5], note: "A winning move leaves equal piles." }
    }),
    entry({
      id: "nontransitive-ab", num: "61", topic: "games", difficulty: "medium",
      title: "A beats B five ninths of the time",
      blurb: "Two six-sided dice, neither dominates facewise, yet P(A>B)=5/9.",
      statement: String.raw`<p>Die A has faces \(2,2,4,4,9,9\). Die B has faces \(1,1,6,6,8,8\). Each face is equally likely. Find \(\mathbb{P}(A\gt B)\).</p>`,
      solution: String.raw`<p>36 equally likely pairs. A=2 beats only B=1 (4 outcomes). A=4 beats only B=1 (4). A=9 beats all six B faces (12). Total 20. So \(20/36=5/9\).</p><div class="answer-box"><strong>Answer.</strong> \(5/9\).</div><h3>Interview hygiene</h3><p>Mean of A is \(5\), mean of B is \(5\). Means do not decide P(A>B). This is the seed of nontransitive dice.</p>`,
      figure: { kind: "diceGrid", title: "Means tie, P(A>B) does not", caption: "A=2,2,4,4,9,9 vs B=1,1,6,6,8,8. Twenty wins for A out of 36.", heading: "Nontransitive seed", pred: (a, b) => { const A = [2, 2, 4, 4, 9, 9]; const B = [1, 1, 6, 6, 8, 8]; return A[a - 1] > B[b - 1]; }, note: "P=20/36=5/9. Means are both 5." }
    }),
    entry({
      id: "kelly-even", num: "62", topic: "games", difficulty: "medium",
      title: "Kelly even money",
      blurb: "Maximize E[log wealth]. For even odds the fraction is 2p-1.",
      statement: String.raw`<p>You may bet a fraction \(f\) of wealth on even-money bets with win probability \(p\gt 1/2\). The Kelly criterion maximises \(E[\log W]\). Find the optimal \(f\).</p>`,
      solution: String.raw`<p>\(E[\log(1+(2I-1)f)]=p\log(1+f)+(1-p)\log(1-f)\). Differentiate: \(p/(1+f)-(1-p)/(1-f)=0\), so \(f^*=2p-1\).</p><div class="answer-box"><strong>Answer.</strong> \(f^*=2p-1\). For \(p=0.6\), bet \(20\%\).</div>`,
      figure: { kind: "curve", title: "Kelly growth G(f)", caption: "For even money, G'(f)=0 at f=2p-1. At p=0.6 bet 20%.", heading: "E log wealth", xmin: 0, xmax: 0.5, f: (x) => 0.6 * Math.log(1 + x) + 0.4 * Math.log(1 - x), markX: 0.2, markLabel: "f*=0.2", xLabel: "fraction f", note: "Maximise E[log W], not E[W]." }
    }),
    entry({
      id: "best-of-seven", num: "63", topic: "games", difficulty: "medium",
      title: "Best of seven",
      blurb: "IID games with p=0.6. Win the series by taking 4 before the opponent does.",
      statement: String.raw`<p>Each game is i.i.d. with \(\mathbb{P}(\text{you win})=0.6\), independently. First to 4 wins the series (best of 7). Find \(\mathbb{P}(\text{you win the series})\).</p>`,
      solution: String.raw`<p>You win unless the opponent gets to 4 first, i.e. unless they win at least 4 of the first 7, equivalently you win 4 games before 4 losses. Sum binomial:</p>\[ \sum_{k=4}^{7}\binom{7}{k}(0.6)^k(0.4)^{7-k}. \] <p>That equals \(0.6^4\sum_{j=0}^{3}\binom{3+j}{j}(0.4)^j\) by negative-binomial, numerically \(\approx 0.7102\).</p><div class="answer-box"><strong>Answer.</strong> \(\sum_{k=4}^{7}\binom{7}{k}0.6^k 0.4^{7-k}\approx 0.710\).</div>`,
      figure: { kind: "bars", title: "First to four", caption: "Win the series by taking 4 of 7. Sum binomial k=4..7 at p=0.6.", heading: "Best of seven", items: [{ label: "4-3", value: 0.29, gold: true }, { label: "5-2", value: 0.186 }, { label: "6-1", value: 0.077 }, { label: "7-0", value: 0.028 }], note: "Total ≈ 0.710." }
    }),
    entry({
      id: "beauty-contest", num: "64", topic: "games", difficulty: "hard",
      title: "Guess 2/3 of the average",
      blurb: "Keynes beauty contest. The unique Nash is 0.",
      statement: String.raw`<p>Each player names a real number in \([0,100]\). The winner is nearest to \(2/3\) of the average guess. In a Nash equilibrium, what does everyone name?</p>`,
      solution: String.raw`<p>No rational player names above \(200/3\), because \(2/3\) of the average is at most \(200/3\). Iterating dominance sends the upper bound to \((2/3)^k\cdot 100\to 0\). The unique Nash is that everyone names 0.</p><div class="answer-box"><strong>Answer.</strong> \(0\).</div><h3>Interview hygiene</h3><p>Laboratory humans play around 20-30, not 0. The Nash is the infinite-depth answer, not the empirical one.</p>`,
      figure: { kind: "shrink", title: "Only 0 survives", caption: "Nobody names above 200/3, then 400/9, and so on. The unique Nash is 0.", heading: "Guess 2/3 of the average", steps: 6 }
    }),
    entry({
      id: "truel-air", num: "65", topic: "games", difficulty: "hard",
      title: "Truel: shoot into the air",
      blurb: "A is weakest. With sequential shots, A's opening move is not to kill.",
      statement: String.raw`<p>A, B, C shoot in that order, repeating. Accuracies \(1/3\), \(2/3\), \(1\). Each shot, if they fire at someone, they hit with their accuracy and kill. They are perfect strategic killers. A to shoot first, all alive. Whom should A aim at?</p>`,
      solution: String.raw`<p>If A kills B, C then kills A for sure. If A kills C, B shoots at A with accuracy \(2/3\). If A misses both by shooting the ground, B and C prefer to shoot each other (each is the bigger threat). A then faces a single opponent with the first shot. So A should fire into the air.</p><div class="answer-box"><strong>Answer.</strong> Neither. Shoot into the air.</div>`,
      figure: { kind: "truel", title: "Shoot the air", caption: "Killing B or C leaves a perfect shot at A. Missing makes B and C the bigger threats to each other." }
    }),
    entry({
      id: "bold-play", num: "66", topic: "games", difficulty: "hard",
      title: "Bold play on a subfair game",
      blurb: "To reach a target on a subfair even-money bet, betting the min of the gap and your fortune is optimal.",
      statement: String.raw`<p>You start with \(i\) units, \(0\lt i\lt N\), and must reach \(N\) or go broke. Each available bet is even money with win probability \(p\lt 1/2\). You may stake any integer up to your fortune. What strategy maximises \(\mathbb{P}(\text{hit }N)\), and what is that probability when \(i=1\), \(N=2^n\)?</p>`,
      solution: String.raw`<p>Dubins–Savage: bold play is optimal. Stake \(\min(i,N-i)\). Starting from 1 with \(N=2^n\), you need \(n\) wins in a row before a loss, so the probability is \(p^n\).</p><div class="answer-box"><strong>Answer.</strong> Bold play. From 1 to \(2^n\), probability \(p^n\).</div>`,
      figure: { kind: "walk", title: "Bold play 1 → 8", caption: "Stake min(fortune, gap). From 1 to 8 you need three wins in a row: p^3.", heading: "Subfair even money", N: 8, start: 1, p: 0.4, bold: true, note: "Dubins–Savage: bold is optimal when p<1/2." }
    }),
    entry({
      id: "misere-nim", num: "67", topic: "games", difficulty: "hard",
      title: "Misère Nim, last loses",
      blurb: "When every pile has size at most 1, the xor rule flips. Otherwise it does not.",
      statement: String.raw`<p>Misère Nim: the player who takes the last object loses. Piles 3, 1, 1. Is this a first-player win?</p>`,
      solution: String.raw`<p>Bouton's misère analysis: if at least one pile has size \(\ge 2\), play as in normal Nim unless the move would leave only piles of size \(\le 1\). Here \(3\oplus 1\oplus 1=3\ne 0\) and there is a pile of size 3, so it is a normal-play N-position, hence a first-player win. A winning move is to take 2 from the pile of 3, leaving (1,1,1), from which the opponent is forced to take the last-but-not-quite and you leave a single object.</p><div class="answer-box"><strong>Answer.</strong> Yes, first player wins.</div>`,
      figure: { kind: "piles", title: "Misère, last loses", caption: "A pile of size ≥2 remains, so play as in normal Nim. First player wins from (3,1,1).", heading: "Piles 3, 1, 1", sizes: [3, 1, 1], note: "Leave (1,1,1) for the opponent." }
    }),
    entry({
      id: "bernoulli-var", num: "68", topic: "statistics", difficulty: "easy",
      title: "Bernoulli variance",
      blurb: "p(1-p). Maximal at p=1/2.",
      statement: String.raw`<p>\(X\sim\mathrm{Bernoulli}(p)\). Find \(\mathrm{Var}(X)\). What \(p\) maximises it?</p>`,
      solution: String.raw`<p>\(E[X]=p\), \(E[X^2]=p\), so \(\mathrm{Var}(X)=p-p^2=p(1-p)\). This is a parabola with max \(1/4\) at \(p=1/2\).</p><div class="answer-box"><strong>Answer.</strong> \(p(1-p)\), largest at \(p=1/2\).</div>`,
      figure: { kind: "curve", title: "p(1-p)", caption: "Bernoulli variance is a parabola. Max 1/4 at p=1/2.", heading: "Var(X)", xmin: 0, xmax: 1, f: (p) => p * (1 - p), markX: 0.5, markLabel: "p=1/2", xLabel: "p", note: "Var = p - p^2." }
    }),
    entry({
      id: "unbiased-mean", num: "69", topic: "statistics", difficulty: "easy",
      title: "The sample mean is unbiased",
      blurb: "E[bar X] = μ for any n ≥ 1. No CLT required.",
      statement: String.raw`<p>\(X_1,\dots,X_n\) i.i.d. with mean \(\mu\). Show \(E[\bar X_n]=\mu\).</p>`,
      solution: String.raw`<p>Linearity, no independence needed: \(E[\bar X_n]=n^{-1}\sum E[X_i]=\mu\).</p><div class="answer-box"><strong>Answer.</strong> \(E[\bar X_n]=\mu\).</div>`,
      figure: { kind: "meanline", title: "Sample mean sits on μ", caption: "Linearity: E[bar X]=μ for any n≥1. No CLT required. The mint tick jitters around the coral μ.", heading: "Unbiased for the mean", n: 12, mu: 0.5, note: "Gold ticks are Unif[0,1] draws. Coral is 1/2." }
    }),
    entry({
      id: "type-i", num: "70", topic: "statistics", difficulty: "easy",
      title: "Type I error is alpha",
      blurb: "Under the null, a level-α test rejects with probability α, by construction.",
      statement: String.raw`<p>A test of \(H_0\) has size \(\alpha=0.05\). If \(H_0\) is true, what is the probability of rejection?</p>`,
      solution: String.raw`<p>By definition of size, \(\mathbb{P}(\text{reject}\mid H_0)=\alpha=0.05\). That is a Type I error.</p><div class="answer-box"><strong>Answer.</strong> \(0.05\).</div>`,
      figure: { kind: "typeI", title: "Size is α", caption: "Under the null, p-values are uniform. The coral strip has width 0.05.", heading: "Type I error" }
    }),
    entry({
      id: "sample-variance", num: "71", topic: "statistics", difficulty: "easy",
      title: "Why divide by n-1",
      blurb: "The sample variance with n in the denominator is biased low. Bessel's correction fixes the mean.",
      statement: String.raw`<p>For i.i.d. observations with variance \(\sigma^2\), why is \(S^2=\frac1{n-1}\sum (X_i-\bar X)^2\) used instead of dividing by \(n\)?</p>`,
      solution: String.raw`<p>\(\sum (X_i-\bar X)^2/\sigma^2\sim\chi^2_{n-1}\) in the Gaussian case, and in general \(E[\sum (X_i-\bar X)^2]=(n-1)\sigma^2\). Dividing by \(n-1\) makes \(S^2\) unbiased. Dividing by \(n\) estimates \(\frac{n-1}{n}\sigma^2\).</p><div class="answer-box"><strong>Answer.</strong> Because \(E[\sum (X_i-\bar X)^2]=(n-1)\sigma^2\).</div>`,
      figure: { kind: "bars", title: "Why n-1", caption: "E[sum (Xi-bar X)^2]=(n-1)σ^2. Dividing by n estimates ((n-1)/n)σ^2.", heading: "Bessel's correction", items: [{ label: "/n", value: 4 }, { label: "/(n-1)", value: 5, gold: true }], note: "For n=5 the unbiased divisor is 4." }
    }),
    entry({
      id: "simpson", num: "72", topic: "statistics", difficulty: "medium",
      title: "Simpson's paradox",
      blurb: "A treatment can win in every subgroup and lose in the aggregate.",
      statement: String.raw`<p>A treatment has success 8/10 in group A and 20/90 in group B. Control has 70/90 in A and 2/10 in B. Which has the higher overall success rate, and which wins inside each group?</p>`,
      solution: String.raw`<p>Treatment overall: \(28/100=0.28\). Control overall: \(72/100=0.72\). Control wins overall. Inside A: treatment \(0.8\gt 70/90\approx 0.78\). Inside B: treatment \(20/90\approx 0.22\gt 0.2\). Treatment wins both groups. The confounder is the allocation: treatment is given mostly to B, the harder group.</p><div class="answer-box"><strong>Answer.</strong> Treatment wins both strata; control wins the pooled table.</div>`,
      figure: { kind: "simpson", title: "The confounder is allocation", caption: "Treatment wins both groups and loses the pooled table." }
    }),
    entry({
      id: "regression-to-mean", num: "73", topic: "statistics", difficulty: "medium",
      title: "Regression to the mean",
      blurb: "Extreme first measurements are typically followed by less extreme seconds, even with no causal improvement.",
      statement: String.raw`<p>\((X,Y)\) is bivariate normal, mean 0, variance 1, correlation \(\rho=0.5\). Given \(X=2\), find \(E[Y\mid X=2]\). Interpret.</p>`,
      solution: String.raw`<p>The conditional mean is \(\rho x=1\). A 2-sigma first observation is followed by an expected 1-sigma second observation, pulled toward the mean. That is regression to the mean, not a treatment effect.</p><div class="answer-box"><strong>Answer.</strong> \(E[Y\mid X=2]=1\).</div>`,
      figure: { kind: "scatter", title: "E[Y|X=2]=1", caption: "Bivariate normal, ρ=0.5. A 2-sigma X is followed by an expected 1-sigma Y.", heading: "Regression to the mean", slope: 0.5, note: "Not a treatment effect." }
    }),
    entry({
      id: "se-proportion", num: "74", topic: "statistics", difficulty: "medium",
      title: "SE of a sample proportion",
      blurb: "sqrt(p(1-p)/n). Worst case p=1/2.",
      statement: String.raw`<p>\(\hat p\) is the sample proportion in n i.i.d. Bernoulli(p) trials. Find \(\mathrm{SD}(\hat p)\). For a conservative sample-size calculation, which p do you plug in?</p>`,
      solution: String.raw`\[ \mathrm{SD}(\hat p)=\sqrt{p(1-p)/n}. \] <p>The product \(p(1-p)\) is at most \(1/4\), at \(p=1/2\). Conservatively use \(1/(2\sqrt n)\).</p><div class="answer-box"><strong>Answer.</strong> \(\sqrt{p(1-p)/n}\), plug \(p=1/2\) to be conservative.</div>`,
      figure: { kind: "curve", title: "SD of a proportion", caption: "SD = sqrt(p(1-p)/n). Worst case p=1/2, so conservative SE is 1/(2 sqrt n).", heading: "SE(hat p)", xmin: 0, xmax: 1, f: (p) => Math.sqrt(p * (1 - p) / 100), markX: 0.5, markLabel: "p=1/2", xLabel: "p", note: "n=100. Max SD = 0.05." }
    }),
    entry({
      id: "ci-meaning", num: "75", topic: "statistics", difficulty: "medium",
      title: "What a 95% interval means",
      blurb: "The randomness is in the interval, not in a fixed θ.",
      statement: String.raw`<p>A 95% confidence interval for a fixed unknown \(\theta\) is computed from a sample. Is it correct to say \(\mathbb{P}(\theta\in[L,U]\mid\text{data})=0.95\)? What is true instead?</p>`,
      solution: String.raw`<p>No. \(\theta\) is not random. The statement \(\mathbb{P}_\theta(L\le\theta\le U)=0.95\) holds before seeing the data, as a coverage probability over repeated samples. After the data are in, the interval either contains \(\theta\) or it does not. Posterior probability \(0.95\) would be a Bayesian credible interval, which needs a prior.</p><div class="answer-box"><strong>Answer.</strong> Coverage is frequentist, over the sample. It is not a posterior probability for a fixed \(\theta\).</div>`,
      figure: { kind: "ci", title: "Coverage, not a posterior", caption: "Each line is one 95% z-interval for a N(0,1) mean. The coral misses are about 5% of samples.", heading: "What 95% means" }
    }),
    entry({
      id: "german-tank", num: "76", topic: "statistics", difficulty: "hard",
      title: "German tank problem",
      blurb: "Serial numbers 1..N, k distinct draws. Unbiased estimate of N from the maximum.",
      statement: String.raw`<p>IDs are \(1,\dots,N\) unknown. You see \(k\) distinct IDs drawn uniformly without replacement. Let \(M\) be the maximum. Give an unbiased estimator of \(N\).</p>`,
      solution: String.raw`<p>For a uniform sample of size \(k\) from \(\{1,\dots,N\}\) without replacement, the maximum satisfies \(E[M]=\frac{k}{k+1}(N+1)\). Solving for \(N\) gives the unbiased estimator</p>\[ \hat N=M\bigl(1+1/k\bigr)-1. \]<div class="answer-box"><strong>Answer.</strong> \(\hat N=M(1+1/k)-1\).</div>`,
      figure: { kind: "tank", title: "The maximum is biased low", caption: "Unbiased: N-hat = M(1+1/k)-1.", heading: "German tank", N: 40, k: 5 }
    }),
    entry({
      id: "capture-recapture", num: "77", topic: "statistics", difficulty: "hard",
      title: "Capture-recapture",
      blurb: "Lincoln–Petersen. N ≈ K n / k.",
      statement: String.raw`<p>A lake has \(N\) fish. You catch \(K\), tag them, release. Later you catch \(n\), of which \(k\) are tagged. Estimate \(N\).</p>`,
      solution: String.raw`<p>The resampled tagged fraction \(k/n\) estimates \(K/N\), so \(\hat N=Kn/k\). (With a \(+1\) Chapman correction \(\hat N=(K+1)(n+1)/(k+1)-1\) to reduce bias.)</p><div class="answer-box"><strong>Answer.</strong> \(\hat N=Kn/k\).</div>`,
      figure: { kind: "pond", title: "Tagged fraction estimates K/N", caption: "Lincoln–Petersen: N-hat = K n / k.", heading: "Capture-recapture" }
    }),
    entry({
      id: "optional-stopping", num: "78", topic: "statistics", difficulty: "hard",
      title: "Optional stopping inflates false positives",
      blurb: "Peeking and continuing until p<0.05 is not a 5% test.",
      statement: String.raw`<p>You sample i.i.d. N(0,1) under a true null, and after every additional point you compute a two-sided z-test for mean 0. You stop at the first time \(n\le 50\) with two-sided p-value \(\lt 0.05\), or at 50. Is the Type I error 5%? What happens to it?</p>`,
      solution: String.raw`<p>No. Repeated looks consume alpha. A fair random walk will cross a fixed z-boundary with probability tending to 1 if you wait forever (law of the iterated logarithm). Even with a cap at 50, the rejection rate is well above 5%. Valid sequential tests use spending functions or always-valid p-values.</p><div class="answer-box"><strong>Answer.</strong> Type I error is larger than 5%. Peeking without an alpha-spending rule is not a 5% test.</div>`,
      figure: { kind: "walk", title: "Peeking spends alpha", caption: "A fair walk will cross a fixed z-boundary far more often than 5% if you look after every point.", heading: "Optional stopping", N: 20, start: 10, p: 0.5, note: "Use a spending function or always-valid p-values." }
    }),
    entry({
      id: "cut-and-choose", num: "79", topic: "strategy", difficulty: "easy",
      title: "I cut, you choose",
      blurb: "The cutter's incentive is to make the two pieces equal in their own measure.",
      statement: String.raw`<p>A cake is to be split between two people. One cuts into two pieces, the other chooses first. Why is this envy-free for both, if each prefers more cake?</p>`,
      solution: String.raw`<p>The chooser takes the piece they think is larger, so they are not envious. The cutter, knowing this, maximises the smaller piece in their own valuation, which forces an even split in the cutter's measure. Neither prefers the other's piece.</p><div class="answer-box"><strong>Answer.</strong> Chooser takes the better piece; cutter equalises to protect against that.</div>`,
      figure: { kind: "cake", title: "Equalise to protect yourself", caption: "Chooser takes the larger piece. Cutter therefore cuts 50-50." }
    }),
    entry({
      id: "one-shot-pd", num: "80", topic: "strategy", difficulty: "easy",
      title: "One-shot prisoner's dilemma",
      blurb: "Defect is strictly dominant. Mutual defect is the unique Nash.",
      statement: String.raw`<p>In a one-shot prisoner's dilemma, what is the unique Nash equilibrium?</p>`,
      solution: String.raw`<p>Defect strictly dominates cooperate for each player. The unique Nash is (Defect, Defect), even though (Cooperate, Cooperate) Pareto-dominates it.</p><div class="answer-box"><strong>Answer.</strong> Both defect.</div>`,
      figure: { kind: "payoff", title: "Defect strictly dominates", caption: "The unique Nash is (D,D), even though (C,C) is better for both.", heading: "Prisoner's dilemma", rows: ["C", "D"], cols: ["C", "D"], cells: [["3,3", "0,5"], ["5,0", "1,1"]], hot: [1, 1], note: "Dominant-strategy equilibrium: both defect." }
    }),
    entry({
      id: "median-voter", num: "81", topic: "strategy", difficulty: "easy",
      title: "Median voter",
      blurb: "Hotelling on a line. Two candidates converge to the median.",
      statement: String.raw`<p>Voters are distributed on \([0,1]\). Two candidates pick platforms and each voter chooses the closer candidate. Where do the candidates locate in Nash equilibrium?</p>`,
      solution: String.raw`<p>Any platform off the median can be profitably moved toward it. The unique Nash is that both sit at the median of the voter distribution.</p><div class="answer-box"><strong>Answer.</strong> Both at the median.</div>`,
      figure: { kind: "median", title: "Both candidates sit at the median", caption: "A platform off-center is pulled inward. Unique Nash: the median voter." }
    }),
    entry({
      id: "penalty-mixed", num: "82", topic: "strategy", difficulty: "easy",
      title: "Penalty kick mixed Nash",
      blurb: "If kicking L is not a pure best response, mix.",
      statement: String.raw`<p>Kicker chooses L or R, keeper independently chooses L or R. Payoff to the kicker is 1 on a mismatch and 0 on a match. Find the mixed Nash.</p>`,
      solution: String.raw`<p>This is matching pennies. Each mixes \(1/2,1/2\). The kicker scores with probability \(1/2\).</p><div class="answer-box"><strong>Answer.</strong> Both mix \(1/2\). Scoring probability \(1/2\).</div>`,
      figure: { kind: "payoff", title: "Mix to be unexploitable", caption: "Goal on a mismatch. Same game as matching pennies. Mix 1/2.", heading: "Penalty kick", rows: ["L", "R"], cols: ["L", "R"], cells: [["0", "1"], ["1", "0"]], note: "Scoring probability 1/2." }
    }),
    entry({
      id: "vickrey", num: "83", topic: "strategy", difficulty: "medium",
      title: "Vickrey auction",
      blurb: "Second-price sealed bid. Truth-telling is weakly dominant.",
      statement: String.raw`<p>In a second-price sealed-bid auction with private values, what bid is weakly dominant?</p>`,
      solution: String.raw`<p>Bid your true value. If you bid higher, you may win an object worth less than you pay. If you bid lower, you may lose an object you would have been happy to win at the second price. The price you pay, when you win, is the other bid, independent of yours (except for winning).</p><div class="answer-box"><strong>Answer.</strong> Bid your true value.</div>`,
      figure: { kind: "auction", title: "Bid your value", caption: "Your bid only decides whether you win. The price is the second bid." }
    }),
    entry({
      id: "three-pirates", num: "84", topic: "strategy", difficulty: "medium",
      title: "Three pirates",
      blurb: "100 coins, majority vote, proposer is thrown overboard on a no. Backward induction.",
      statement: String.raw`<p>Pirates A, B, C (A most senior) split 100 indivisible coins. The senior proposes, they vote, majority (including the proposer) wins; ties pass. If the proposal fails, the proposer is thrown overboard and the next senior repeats. They are bloodthirsty, greedy, and rational. What does A propose?</p>`,
      solution: String.raw`<p>With one pirate, he takes 100. With two (B,C), B takes 100, C gets 0. With three, A needs one vote besides his own. C will accept 1 coin (better than 0 in the two-pirate subgame). A takes 99, B 0, C 1.</p><div class="answer-box"><strong>Answer.</strong> \(99,0,1\) for A,B,C.</div>`,
      figure: { kind: "pirates", title: "A takes 99", caption: "C will accept 1 coin over 0 in the two-pirate subgame. A offers 99, 0, 1." }
    }),
    entry({
      id: "chicken-mixed", num: "85", topic: "strategy", difficulty: "medium",
      title: "Chicken mixed equilibrium",
      blurb: "Two mixed Nash besides the two pure swerve/straight pairs.",
      statement: String.raw`<p>Chicken: Straight vs Straight pays \(-10\) each, Swerve vs Straight pays \(0\) for the swerver and \(+1\) for the straight, Swerve vs Swerve pays \(0\). Find a mixed Nash.</p>`,
      solution: String.raw`<p>Let \(p=\mathbb{P}(\text{Straight})\). Payoff of Straight is \(p(-10)+(1-p)(1)=1-11p\). Payoff of Swerve is \(0\). Indifference requires \(1-11p=0\), so \(p=1/11\).</p><div class="answer-box"><strong>Answer.</strong> Each plays Straight with probability \(1/11\).</div>`,
      figure: { kind: "payoff", title: "Indifference at 1/11", caption: "Straight vs Straight is -10. Mix so the opponent is indifferent: P(Straight)=1/11.", heading: "Chicken", rows: ["Swerve", "Straight"], cols: ["Swerve", "Straight"], cells: [["0,0", "0,1"], ["1,0", "-10,-10"]], note: "Payoff of Straight is 1-11p." }
    }),
    entry({
      id: "braess", num: "86", topic: "strategy", difficulty: "medium",
      title: "Braess's paradox",
      blurb: "Adding a zero-cost road can make everyone's travel time worse.",
      statement: String.raw`<p>In Braess's paradox, a new zero-cost link is added to a congested network. What can happen to Nash travel times?</p>`,
      solution: String.raw`<p>They can all increase. The new link makes a selfish rerouting that congests both original routes more than the old equilibrium. Removing a road can be Pareto-improving.</p><div class="answer-box"><strong>Answer.</strong> Equilibrium travel times can rise for every traveller.</div>`,
      figure: { kind: "network", title: "A new zero-cost link can hurt everyone", caption: "Selfish rerouting congests both original routes more than the old Nash.", heading: "Braess", nodes: [{ x: 120, y: 180, label: "S", gold: true }, { x: 360, y: 80, label: "A" }, { x: 360, y: 280, label: "B" }, { x: 600, y: 180, label: "T", gold: true }], edges: [[0, 1, "n"], [0, 2, "45"], [1, 3, "45"], [2, 3, "n"], [1, 2, "0", true]], note: "The coral link is the new road." }
    }),
    entry({
      id: "hat-pairing", num: "87", topic: "strategy", difficulty: "hard",
      title: "100 prisoners, hats",
      blurb: "Different from the boxes. They see 99 hats. Pairing in 2^{99} gives 50%.",
      statement: String.raw`<p>100 prisoners get random red/blue hats. Each sees the others, then they guess simultaneously. They win if at least one is correct and none is wrong. Give a strategy with success probability \(1/2\).</p>`,
      solution: String.raw`<p>View hats as a vector in \(\mathbb{F}_2^{100}\). Agree in advance that the total parity is even. Each prisoner guesses the unique bit that would make the whole configuration even. If the true parity is even, every guess is correct. If it is odd, every guess is wrong. The two cases are equally likely, so they win with probability \(1/2\).</p><div class="answer-box"><strong>Answer.</strong> Guess to enforce an agreed parity. Win together on half of the configurations.</div>`,
      figure: { kind: "hats", title: "Guess to make parity even", caption: "All correct on even worlds, all wrong on odd worlds. Success 1/2 together." }
    }),
    entry({
      id: "blue-eyes", num: "88", topic: "strategy", difficulty: "hard",
      title: "Blue-eyed islanders",
      blurb: "Common knowledge. n blue-eyed people leave on night n.",
      statement: String.raw`<p>n people have blue eyes, others brown. They can see others' eyes, they leave on the night they deduce their own are blue, and they are perfect logicians. A guru says "I see someone with blue eyes." What happens?</p>`,
      solution: String.raw`<p>Induction. If n=1, that person sees no blue eyes, uses the guru's statement, and leaves night 1. If n=k works, then n=k+1 each sees k and expects those k to leave on night k; when they do not, everyone infers n=k+1 and they leave on night k+1. The guru's public announcement makes the existence of blue eyes common knowledge.</p><div class="answer-box"><strong>Answer.</strong> All n blue-eyed people leave on night n.</div>`,
      figure: { kind: "induction", title: "They leave on night n", caption: "The guru makes 'someone has blue eyes' common knowledge. Silence is the inductive signal.", heading: "Blue eyes", n: 5 }
    }),
    entry({
      id: "muddy-children", num: "89", topic: "strategy", difficulty: "hard",
      title: "Muddy children",
      blurb: "The same induction as blue eyes, after a public announcement that at least one child is muddy.",
      statement: String.raw`<p>k children have mud on their foreheads. A father says "at least one of you is muddy" and repeatedly asks "do you know whether you are muddy?" When do they first all say yes?</p>`,
      solution: String.raw`<p>After the \(k\)th asking. The announcement provides common knowledge of "at least one," and the silence of the first \(k-1\) rounds is the inductive signal.</p><div class="answer-box"><strong>Answer.</strong> On the \(k\)th query.</div>`,
      figure: { kind: "induction", title: "Yes on the k-th asking", caption: "Same induction as blue eyes. They announce on round k.", heading: "Muddy children", n: 4 }
    }),
    entry({
      id: "unexpected-hanging", num: "90", topic: "strategy", difficulty: "hard",
      title: "Unexpected hanging",
      blurb: "A backward-induction surprise that is consistent with a hanging on Wednesday.",
      statement: String.raw`<p>A judge says the hanging will be on one weekday at noon, and you will not know the day in advance. The prisoner argues: it cannot be Friday, or I would know Thursday night; then it cannot be Thursday, and so on, so it cannot happen. It happens on Wednesday, and he is surprised. Where does the argument fail?</p>`,
      solution: String.raw`<p>The announcement cannot be both a true statement about the calendar and a self-referential "you will not know." The backward induction assumes the announcement remains usable after days are eliminated, but the knowledge operator and the truth of "unexpected" do not survive that elimination in a consistent epistemic model. There is no hanging protocol that makes the announcement true on every day and also surprising on every day; Wednesday can still be surprising because the prisoner's proof that no day works was unsound.</p><div class="answer-box"><strong>Answer.</strong> The self-referential knowledge claim is not a premise you can iterate all the way to Monday. Surprise on Wednesday is consistent.</div>`,
      figure: { kind: "week", title: "Wednesday can still surprise", caption: "You cannot iterate 'it cannot be Friday' all the way to Monday. The self-referential claim does not survive.", heading: "Unexpected hanging", mark: 2 }
    })
  ]);
})();
