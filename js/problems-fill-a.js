(() => {
  function entry(p) {
    return Object.assign({
      visual: "sim",
      time: p.difficulty === "easy" ? "5–8 min" : p.difficulty === "medium" ? "8–12 min" : "10–15 min"
    }, p);
  }
  const d6 = () => 1 + Math.floor(Math.random() * 6);
  const coin = () => (Math.random() < 0.5 ? "H" : "T");

  window.PROBLEMS = window.PROBLEMS.concat([
    entry({
      id: "first-head", num: "21", topic: "probability", difficulty: "easy",
      title: "Waiting for the first head",
      blurb: "Geometric with p = 1/2. The mean is 2, not 1.",
      statement: String.raw`<p>A fair coin is flipped until the first head appears. Let \(T\) be the number of flips, including the head. Find \(E[T]\).</p>`,
      solution: String.raw`<h3>Setup</h3><p>\(T\) is geometric with success probability \(p=1/2\), counting the successful trial.</p><h3>Mean</h3><p>The one-step equation is \(E=1+(1-p)E\), so \(E=1/p=2\).</p><div class="answer-box"><strong>Answer.</strong> \(E[T]=2\).</div><h3>Interview hygiene</h3><p>After a tail you start over. Remaining time is still 2, not 1.</p>`,
      sim: { title: "Flips until H", theory: 2, caption: "Waiting times for a fair-coin head. The mean sits at 2.", trial() { let t = 0; while (true) { t += 1; if (Math.random() < 0.5) return t; } } }
    }),
    entry({
      id: "dice-seven", num: "22", topic: "probability", difficulty: "easy",
      title: "Two dice sum to seven",
      blurb: "Six favorable ordered pairs out of 36.",
      statement: String.raw`<p>Two fair dice are rolled. Find \(\mathbb{P}(\text{sum}=7)\).</p>`,
      solution: String.raw`<h3>Count</h3><p>There are \(6\times 6=36\) equally likely outcomes. The pairs with sum 7 are \((1,6),(2,5),(3,4),(4,3),(5,2),(6,1)\): six of them.</p>\[ \mathbb{P}=6/36=1/6. \]<div class="answer-box"><strong>Answer.</strong> \(1/6\).</div><h3>Interview hygiene</h3><p>Write ordered pairs, not unordered {1,6} which would undercount.</p>`,
      sim: { title: "Sum = 7", theory: 1 / 6, caption: "Fraction of rolls whose faces add to 7.", trial() { return Number(d6() + d6() === 7); } }
    }),
    entry({
      id: "ten-coins", num: "23", topic: "probability", difficulty: "easy",
      title: "Expected heads in ten flips",
      blurb: "Linearity. You do not need the binomial distribution.",
      statement: String.raw`<p>Ten fair coins are flipped independently. Let \(X\) be the number of heads. Find \(E[X]\).</p>`,
      solution: String.raw`<h3>Linearity</h3><p>Write \(X=\sum_{i=1}^{10} I_i\) with \(I_i=\mathbf{1}_{\{\text{coin \(i\) is H}\}}\). Then \(E[I_i]=1/2\), so \(E[X]=5\).</p><div class="answer-box"><strong>Answer.</strong> \(5\).</div><h3>Interview hygiene</h3><p>Independence is not required for the mean. It would be required for \(\mathrm{Var}(X)=10\cdot 1/4=2.5\).</p>`,
      sim: { title: "Heads in 10 flips", theory: 5, caption: "Number of heads in 10 fair flips. Mean 5.", trial() { let x = 0; for (let i = 0; i < 10; i += 1) x += Number(Math.random() < 0.5); return x; } }
    }),
    entry({
      id: "four-dice-six", num: "24", topic: "probability", difficulty: "easy",
      title: "At least one six in four rolls",
      blurb: "Complement. The naive 4/6 is wrong.",
      statement: String.raw`<p>A fair die is rolled four times independently. Find \(\mathbb{P}(\text{at least one 6})\).</p>`,
      solution: String.raw`<h3>Complement</h3>\[ \mathbb{P}(\text{no 6})=(5/6)^4,\qquad \mathbb{P}(\text{at least one 6})=1-(5/6)^4. \] <p>Numerically \(1-625/1296=671/1296\approx 0.5177\).</p><div class="answer-box"><strong>Answer.</strong> \(1-(5/6)^4=671/1296\).</div><h3>Interview hygiene</h3><p>Do not add \(1/6\) four times. That double-counts two sixes and exceeds 1 if you keep going.</p>`,
      sim: { title: "At least one 6", theory: 1 - (5 / 6) ** 4, caption: "Four independent rolls. Success if any face is 6.", trial() { return Number([d6(), d6(), d6(), d6()].some((x) => x === 6)); } }
    }),
    entry({
      id: "birthday-23", num: "25", topic: "probability", difficulty: "medium",
      title: "Birthday collision at 23",
      blurb: "The complement product drops fast. 23 is already about a coin flip.",
      statement: String.raw`<p>Assume 365 days and independent uniform birthdays. What is \(\mathbb{P}\) that among 23 people at least two share a birthday? Give the exact product and a numerical value.</p>`,
      solution: String.raw`<h3>Complement</h3>\[ \mathbb{P}(\text{all distinct})=\prod_{k=1}^{22}\left(1-\frac{k}{365}\right)=\frac{365^{\underline{23}}}{365^{23}}. \] <p>Then \(\mathbb{P}(\text{collision})=1-\) that product \(\approx 0.5073\).</p><div class="answer-box"><strong>Answer.</strong> \(1-365^{\underline{23}}/365^{23}\approx 50.7\%\).</div><h3>Interview hygiene</h3><p>The naive \(23/365\) is an expected-count of matches against one person, not a collision probability among all pairs. There are \(\binom{23}{2}=253\) pairs.</p>`,
      sim: { title: "23 birthdays", theory: 0.507297, caption: "23 uniform days among 365. Collision rate sits near 50.7%.", trial() { const s = new Set(); for (let i = 0; i < 23; i += 1) { const d = Math.floor(Math.random() * 365); if (s.has(d)) return 1; s.add(d); } return 0; } }
    }),
    entry({
      id: "hh-ht-wait", num: "26", topic: "probability", difficulty: "medium",
      title: "Waiting for HH vs HT",
      blurb: "Same length, different overlap. HT is faster.",
      statement: String.raw`<p>A fair coin is flipped until a two-flip pattern appears. Find \(E[T_{\mathrm{HH}}]\) and \(E[T_{\mathrm{HT}}]\).</p>`,
      solution: String.raw`<h3>HH</h3><p>States \(\emptyset,\mathrm{H},\mathrm{HH}\). From \(\mathrm{H}\), another \(\mathrm{H}\) finishes and a \(\mathrm{T}\) resets. Solving the linear system gives \(E[T_{\mathrm{HH}}]=6\).</p><h3>HT</h3><p>From \(\mathrm{H}\), tails finishes and heads stays at \(\mathrm{H}\). The system gives \(E[T_{\mathrm{HT}}]=4\).</p><div class="answer-box"><strong>Answer.</strong> \(E[T_{\mathrm{HH}}]=6\) and \(E[T_{\mathrm{HT}}]=4\).</div><h3>Interview hygiene</h3><p>HH wastes a tail completely. HT recycles a trailing H as a new start. Naive \(2^2=4\) is right for HT and wrong for HH.</p>`,
      sim: { title: "HH waiting time", theory: 6, caption: "Waiting time for HH. The sibling HT has mean 4.", trial() { let s = ""; let t = 0; while (true) { t += 1; s = (s + coin()).slice(-2); if (s === "HH") return t; } } }
    }),
    entry({
      id: "two-headed-bayes", num: "27", topic: "probability", difficulty: "medium",
      title: "Two-headed coin",
      blurb: "Three faces that look like heads, two of them from the double-headed coin.",
      statement: String.raw`<p>A bag has two coins: one fair, one with heads on both sides. You pick a coin uniformly, flip it, and see heads. Find \(\mathbb{P}(\text{two-headed coin}\mid H)\).</p>`,
      solution: String.raw`<h3>Faces</h3><p>Label the three head-faces: fair H, double H1, double H2. Each coin is equally likely, and each face of the chosen coin is equally likely, so those three faces are equally likely given that you see a head. Two of them belong to the double-headed coin.</p>\[ \mathbb{P}(\text{double}\mid H)=\frac{\tfrac12\cdot 1}{\tfrac12\cdot 1+\tfrac12\cdot\tfrac12}=\frac{2}{3}. \]<div class="answer-box"><strong>Answer.</strong> \(2/3\).</div><h3>Interview hygiene</h3><p>The posterior is not \(1/2\). You oversampled the coin that can only show heads.</p>`,
      sim: { title: "P(double | H)", theory: 2 / 3, caption: "Trials that landed heads. Fraction whose coin was two-headed.", trial() { while (true) { const dbl = Math.random() < 0.5; const heads = dbl ? true : Math.random() < 0.5; if (heads) return Number(dbl); } } }
    }),
    entry({
      id: "left-to-right-max", num: "28", topic: "probability", difficulty: "medium",
      title: "Left-to-right maxima",
      blurb: "Records in a random permutation. Expectation is harmonic.",
      statement: String.raw`<p>Let \(\pi\) be a uniform random permutation of \(n\). A position \(i\) is a left-to-right maximum if \(\pi(i)=\max\{\pi(1),\dots,\pi(i)\}\). Find the expected number of left-to-right maxima.</p>`,
      solution: String.raw`<h3>Indicators</h3><p>Let \(I_i\) be the event that \(i\) is a record. Among the first \(i\) values, the maximum is equally likely to sit at any of those \(i\) places, so \(\mathbb{P}(I_i)=1/i\).</p>\[ E=\sum_{i=1}^n \frac1i=H_n. \]<div class="answer-box"><strong>Answer.</strong> \(H_n\). For \(n=10\), \(H_{10}\approx 2.928\).</div><h3>Interview hygiene</h3><p>This is the same harmonic number as the expected cycle count, for a different family of indicators.</p>`,
      sim: { title: "Records in n=10", theory: 7381 / 2520, caption: "Number of left-to-right maxima in a random 10-permutation.", trial() { const a = window.Viz.shuffle([...Array(10).keys()]); let m = -1, c = 0; for (let i = 0; i < a.length; i += 1) { if (a[i] > m) { m = a[i]; c += 1; } } return c; } }
    }),
    entry({
      id: "bertrand-box", num: "29", topic: "probability", difficulty: "hard",
      title: "Bertrand's boxes",
      blurb: "Gold-gold, gold-silver, silver-silver. Seeing gold does not make the other gold even money.",
      statement: String.raw`<p>Three boxes: GG, GS, SS. You pick a box uniformly, then a drawer uniformly from that box, and see gold. Find \(\mathbb{P}(\text{the other drawer is gold}\mid\text{this drawer is gold})\).</p>`,
      solution: String.raw`<h3>Label the golds</h3><p>There are three equally likely gold drawers you could have opened: G1 and G2 from GG, and G from GS. In two of those three cases the other drawer is gold.</p><p>Bayes: prior of GG is \(1/3\), likelihood of drawing gold is \(1\) from GG and \(1/2\) from GS, so</p>\[ \mathbb{P}(\mathrm{GG}\mid\mathrm{gold})=\frac{(1/3)\cdot 1}{(1/3)\cdot 1+(1/3)\cdot(1/2)}=\frac23. \] <p>The other drawer is gold if and only if the box is GG.</p><div class="answer-box"><strong>Answer.</strong> \(2/3\).</div><h3>Interview hygiene</h3><p>Do not collapse GG into one gold. The box with two golds is twice as likely to produce the observation.</p>`,
      sim: { title: "Other drawer gold", theory: 2 / 3, caption: "Draw a random drawer; keep trials that show gold. Fraction whose box is GG.", trial() { const boxes = [["G","G"],["G","S"],["S","S"]]; while (true) { const b = boxes[Math.floor(Math.random()*3)]; const i = Math.random() < 0.5 ? 0 : 1; if (b[i] !== "G") continue; return Number(b[1-i] === "G"); } } }
    }),
    entry({
      id: "derangement-prob", num: "30", topic: "probability", difficulty: "hard",
      title: "Probability of a derangement",
      blurb: "No fixed points. The probability tends to 1/e, not to 0.",
      statement: String.raw`<p>Let \(\pi\) be uniform in \(S_n\). Find \(\mathbb{P}(\pi(i)\ne i\text{ for all }i)\), exactly and as \(n\to\infty\).</p>`,
      solution: String.raw`<h3>Inclusion-exclusion</h3>\[ \mathbb{P}= \sum_{k=0}^n \frac{(-1)^k}{k!}. \] <p>The remainder after \(n\) terms is smaller than \(1/(n+1)!\). As \(n\to\infty\) the sum is \(e^{-1}\).</p><div class="answer-box"><strong>Answer.</strong> \(\sum_{k=0}^n (-1)^k/k! \to 1/e\approx 0.367879\).</div><h3>Interview hygiene</h3><p>People guess the probability vanishes because “more points must match.” Linearity already said E[fixed points]=1 for every \(n\), so a Poisson(1) limit, hence P(0)=1/e, is the right picture.</p>`,
      sim: { title: "Derangement, n=10", theory: 1 / Math.E, caption: "10-permutations with no fixed point. Limit 1/e.", trial() { const a = window.Viz.shuffle([...Array(10).keys()]); return Number(a.every((v, i) => v !== i)); } }
    }),
    entry({
      id: "secretary", num: "31", topic: "probability", difficulty: "hard",
      title: "Secretary problem",
      blurb: "Reject the first n/e, then take the next candidate better than all of them. Success tends to 1/e.",
      statement: String.raw`<p>\(n\) candidates arrive in random order. You see them one by one and must accept or reject irrevocably. You win only if you take the best overall. Give a strategy whose success probability tends to \(1/e\), and name that limit.</p>`,
      solution: String.raw`<h3>Strategy</h3><p>Let \(r=\lfloor n/e\rfloor\). Auto-reject the first \(r\) (the sample). Then accept the first later candidate who is the best so far.</p><h3>Limit</h3><p>The success probability is \(\frac{r}{n}\sum_{k=r+1}^n \frac1{k-1}\to \int_{1/e}^1 \frac1x\cdot\frac{1}{e}\,dx\) in the usual scaling, which equals \(1/e\).</p><div class="answer-box"><strong>Answer.</strong> Skip about \(n/e\), then take the next record. Success probability \(\to 1/e\).</div><h3>Interview hygiene</h3><p>Random guessing at a fixed position wins with probability \(1/n\). The sample-and-threshold policy is the classic asymptotically optimal rule among non-adaptive cutoffs.</p>`,
      sim: { title: "Secretary n=40", theory: 1 / Math.E, caption: "Skip first floor(n/e), then take the next record. Win if that person is the global max.", trial() { const n = 40; const a = window.Viz.shuffle([...Array(n).keys()]); const best = n - 1; const r = Math.floor(n / Math.E); let sample = -1; for (let i = 0; i < r; i += 1) sample = Math.max(sample, a[i]); for (let i = r; i < n; i += 1) { if (a[i] > sample) return Number(a[i] === best); } return Number(a[n - 1] === best); } }
    }),
    entry({
      id: "gamblers-ruin", num: "32", topic: "probability", difficulty: "hard",
      title: "Gambler's ruin",
      blurb: "Fair random walk on 0..N. Hitting probabilities are linear.",
      statement: String.raw`<p>A gambler starts with \(k\) units, \(0\lt k\lt N\). Each bet is even-money and fair. Play until 0 or \(N\). Find \(\mathbb{P}(\text{hit }N\text{ before }0)\).</p>`,
      solution: String.raw`<h3>Harmonic function</h3><p>Let \(p_k\) be the probability of hitting \(N\) from \(k\). Then \(p_0=0\), \(p_N=1\), and \(p_k=\tfrac12 p_{k-1}+\tfrac12 p_{k+1}\). The general solution is linear, so \(p_k=k/N\).</p><div class="answer-box"><strong>Answer.</strong> \(k/N\). For \(k=5\), \(N=10\), this is \(1/2\).</div><h3>Interview hygiene</h3><p>If the game is subfair, the solution is exponential in the odds ratio, not linear. Fairness is what makes wealth a martingale and the probability linear.</p>`,
      sim: { title: "Hit 10 before 0", theory: 0.5, caption: "Start at 5, fair ±1 steps, absorb at 0 or 10.", trial() { let k = 5; while (k > 0 && k < 10) k += Math.random() < 0.5 ? 1 : -1; return Number(k === 10); } }
    })
  ]);
})();
