window.PROBLEMS = window.PROBLEMS.concat([
  {
    id: "first-six",
    num: "08",
    topic: "probability",
    difficulty: "easy",
    time: "5–8 min",
    title: "Waiting for the first six",
    blurb: "A geometric waiting time. The mean is 1/p, not a story about luck.",
    statement: String.raw`
      <p>A fair six-sided die is rolled independently until the first 6 appears. Let \(T\) be the number of rolls, including the successful one. Find \(E[T]\).</p>
    `,
    solution: String.raw`
      <h3>Setup</h3>
      <p>\(T\) is geometric with success probability \(p=1/6\), counting the trial that succeeds. Then \(\mathbb{P}(T=k)=(1-p)^{k-1}p\) for \(k=1,2,\dots\).</p>

      <h3>The mean</h3>
      <p>Condition on the first roll, or sum the series:</p>
      \[
      E[T]=\sum_{k=1}^\infty k(1-p)^{k-1}p=\frac1p.
      \]
      <p>The one-step argument is cleaner in an interview. Let \(E=E[T]\). The first roll is a 6 with probability \(p\), and otherwise you have spent 1 and start over:</p>
      \[
      E=1+ (1-p)E \implies pE=1 \implies E=\frac1p=6.
      \]

      <div class="answer-box"><strong>Answer.</strong> \(E[T]=6\).</div>

      <h3>Interview hygiene</h3>
      <p>Do not argue “it should be around 3 because 6 is in the middle.” The remaining waiting time after a failure is still 6. The figure rolls until 6 and tracks the running mean of \(T\); it sits on 6, not on 3.5.</p>
    `,
    visual: "firstsix"
  },
  {
    id: "coupon",
    num: "09",
    topic: "probability",
    difficulty: "medium",
    time: "8–12 min",
    title: "Coupon collector",
    blurb: "n types, uniform draws. The last coupon is the whole story.",
    statement: String.raw`
      <p>There are \(n\) coupon types. Each pack contains one coupon, independently and uniformly. Let \(T\) be the number of packs needed to hold every type. Find \(E[T]\).</p>
    `,
    solution: String.raw`
      <h3>Setup</h3>
      <p>Let \(T_i\) be the additional packs needed to see a new type when you already hold \(i\) distinct types, \(i=0,\dots,n-1\). Then \(T=T_0+\cdots+T_{n-1}\), the \(T_i\) are independent, and \(T_i\) is geometric with success probability \(p_i=(n-i)/n\).</p>

      <h3>Linearity</h3>
      \[
      E[T_i]=\frac{n}{n-i},\qquad E[T]=\sum_{i=0}^{n-1}\frac{n}{n-i}=n\sum_{k=1}^{n}\frac1k=n H_n.
      \]
      <p>The first coupon is instant (\(E[T_0]=1\)). The last coupon takes about \(n\) packs by itself. That last term is why \(E[T]\) is \(n\log n\), not \(n\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[T]=n H_n\), where \(H_n\) is the \(n\)th harmonic number. Asymptotically \(n\log n+\gamma n+O(1)\).</div>

      <h3>Interview hygiene</h3>
      <p>Write the geometric decomposition before quoting \(n\log n\). Variance is \(\sum_i (1-p_i)/p_i^2\), which is order \(n^2\), so \(T\) is not tightly concentrated on the mean. The figure fills an album and overlays the remaining-coupon waiting times against \(n/(n-i)\).</p>
    `,
    visual: "coupon"
  },
  {
    id: "same-half",
    num: "10",
    topic: "geometric",
    difficulty: "easy",
    time: "5–8 min",
    title: "Two points in the same half",
    blurb: "Not the triangle problem. The sample-space square is enough.",
    statement: String.raw`
      <p>Two points are chosen independently and uniformly on a stick of length 1. What is the probability that both lie in \([0,1/2]\) or both lie in \([1/2,1]\)?</p>
    `,
    solution: String.raw`
      <h3>Setup</h3>
      <p>Let the positions be \(U,V\sim\mathrm{Unif}[0,1]\) independent. The sample space is the unit square, with uniform measure.</p>

      <h3>Picture</h3>
      <p>Both in the left half is the square \([0,1/2]^2\) of area \(1/4\). Both in the right half is \([1/2,1]^2\), also area \(1/4\). The two squares are disjoint, so</p>
      \[
      \mathbb{P}=\tfrac14+\tfrac14=\tfrac12.
      \]
      <p>Independently: \(\mathbb{P}(U\le 1/2)=1/2\), and given that, \(\mathbb{P}(V\le 1/2)=1/2\), plus the symmetric right-half term, again \(1/2\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(1/2\).</div>

      <h3>Do not confuse with the triangle</h3>
      <p>The broken-stick triangle event is “no piece exceeds \(1/2\),” which lives in the ordered triangle \(0\lt x\lt y\lt 1\) and has probability \(1/4\). This problem never orders the points and never asks about three lengths. Same stick, different event, different answer. The figure shows both the stick and the unit square.</p>
    `,
    visual: "samehalf"
  },
  {
    id: "buffon",
    num: "11",
    topic: "geometric",
    difficulty: "medium",
    time: "8–12 min",
    title: "Buffon's needle",
    blurb: "A needle, ruled paper, and \(\pi\) from a crossing probability.",
    statement: String.raw`
      <p>A needle of length \(L\) is dropped at random onto a plane ruled with parallel lines a distance \(D\) apart, with \(L\le D\). Find the probability that the needle crosses a line.</p>
    `,
    solution: String.raw`
      <h3>Coordinates</h3>
      <p>Let \(X\) be the distance from the needle’s centre to the nearest line, so \(X\sim\mathrm{Unif}[0,D/2]\). Let \(\Theta\) be the acute angle between the needle and the lines, or more conveniently the angle with the normal: take \(\Theta\sim\mathrm{Unif}[0,\pi]\) independent of \(X\). The needle crosses if and only if</p>
      \[
      X \le \tfrac L2 \lvert\sin\Theta\rvert.
      \]

      <h3>The integral</h3>
      <p>The sample space \((x,\theta)\in[0,D/2]\times[0,\pi]\) has area \((D/2)\pi\). The favorable region has area</p>
      \[
      \int_0^\pi \frac L2 \lvert\sin\theta\rvert\,d\theta = L.
      \]
      <p>(Over a full period \(\int_0^\pi\sin\theta\,d\theta=2\), times \(L/2\).) Therefore</p>
      \[
      \mathbb{P}(\text{cross})=\frac{L}{(D/2)\pi}=\frac{2L}{\pi D}.
      \]

      <div class="answer-box"><strong>Answer.</strong> \(\dfrac{2L}{\pi D}\) when \(L\le D\). For \(L=D\) this is \(2/\pi\approx 0.637\).</div>

      <h3>Interview hygiene</h3>
      <p>The short-needle hypothesis \(L\le D\) keeps the geometry a single inequality. Longer needles can straddle two lines; the formula changes. The figure drops needles on ruled paper and tracks the empirical crossing rate against \(2L/(\pi D)\).</p>
    `,
    visual: "buffon"
  },
  {
    id: "fixed-points",
    num: "12",
    topic: "combinatorics",
    difficulty: "easy",
    time: "5–8 min",
    title: "Expected number of fixed points",
    blurb: "Linearity, not the distribution. The mean is 1 for every \(n\ge 1\).",
    statement: String.raw`
      <p>Let \(\pi\) be a uniform random permutation of \(\{1,\dots,n\}\), \(n\ge 1\). Let \(X=\#\{i:\pi(i)=i\}\) be the number of fixed points. Find \(E[X]\).</p>
    `,
    solution: String.raw`
      <h3>Linearity</h3>
      <p>Write \(X=\sum_{i=1}^n \mathbf{1}_{\{\pi(i)=i\}}\). For each \(i\), \(\mathbb{P}(\pi(i)=i)=1/n\cdot (n-1)! \times n!^{-1}\) wait: there are \((n-1)!\) permutations fixing \(i\), so</p>
      \[
      \mathbb{P}(\pi(i)=i)=\frac{(n-1)!}{n!}=\frac1n.
      \]
      <p>Thus \(E[X]=n\cdot(1/n)=1\).</p>
      <p>The indicators are not independent, but linearity does not care. For \(n\ge 2\) one also has \(E[X(X-1)]=1\), so \(\mathrm{Var}(X)=1\), and \(X\) is approximately \(\mathrm{Poisson}(1)\) for large \(n\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[X]=1\) for every \(n\ge 1\).</div>

      <h3>Interview hygiene</h3>
      <p>People guess \(E[X]\) grows with \(n\). It does not. The figure shuffles and highlights fixed points; the running mean sits at 1.</p>
    `,
    visual: "fixedpoints"
  },
  {
    id: "cycle-count",
    num: "13",
    topic: "combinatorics",
    difficulty: "medium",
    time: "8–12 min",
    title: "Expected number of cycles",
    blurb: "A random permutation’s cycle count has mean \(H_n\).",
    statement: String.raw`
      <p>Let \(\pi\) be a uniform random permutation of \(n\) elements. Let \(C\) be the number of cycles of \(\pi\), including 1-cycles. Find \(E[C]\).</p>
    `,
    solution: String.raw`
      <h3>Indicators on cycle lengths</h3>
      <p>Let \(I_k\) be the number of cycles of length \(k\). Then \(C=\sum_{k=1}^n I_k\). The probability that a given \(k\)-set is a cycle, in one of \((k-1)!\) cyclic orders, with the rest arbitrary, is</p>
      \[
      E[I_k]=\binom{n}{k}\frac{(k-1)!(n-k)!}{n!}=\frac1k.
      \]
      <p>Hence \(E[C]=\sum_{k=1}^n 1/k=H_n\).</p>

      <h3>Another decomposition</h3>
      <p>Let \(J_i\) be the indicator that \(i\) is the smallest entry of its cycle. Then \(C=\sum_i J_i\) and \(\mathbb{P}(J_i)=1/i\) after placing \(1,\dots,i\) relative to each other (the minimum of those \(i\) records is uniform). Same sum \(H_n\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[C]=H_n\).</div>

      <h3>Relatives</h3>
      <p>The number of cycles is also \(\sum_{i=1}^n Z_i\) for independent Bernoulli\(1/i\) in the Feller coupling, which makes the Poisson\(H_n\) limit obvious. The figure draws the permutation as rings and tracks the mean against \(H_n\).</p>
    `,
    visual: "cyclecount"
  },
  {
    id: "longest-cycle",
    num: "14",
    topic: "combinatorics",
    difficulty: "hard",
    time: "10–15 min",
    title: "Longest cycle past n/2",
    blurb: "The same tail that makes 100 prisoners work. There is at most one such cycle.",
    statement: String.raw`
      <p>Let \(\pi\) be a uniform random permutation of \(n\) elements, \(n\) even. Let \(L\) be the length of the longest cycle. Show that</p>
      \[
      \mathbb{P}(L \gt n/2)=\sum_{k=n/2+1}^{n}\frac1k,
      \]
      <p>and explain why there cannot be two cycles longer than \(n/2\).</p>
    `,
    solution: String.raw`
      <h3>At most one long cycle</h3>
      <p>Two disjoint cycles of length \(\gt n/2\) would need more than \(n\) elements. So the events \(\{\)there exists a cycle of length \(k\}\) for \(k \gt n/2\) are pairwise disjoint, and \(\{L \gt n/2\}\) is their union.</p>

      <h3>The \(1/k\) probability</h3>
      <p>The expected number of \(k\)-cycles is \(1/k\), as in the cycle-count problem. For \(k \gt n/2\) that count is 0 or 1, so expectation equals probability:</p>
      \[
      \mathbb{P}(\text{a \(k\)-cycle exists})=\frac1k,\qquad \tfrac n2 \lt k\le n.
      \]
      <p>Summing the disjoint events gives the tail. For large even \(n\),</p>
      \[
      \sum_{k=n/2+1}^{n}\frac1k=H_n-H_{n/2}=\ln 2+O(n^{-1}).
      \]

      <div class="answer-box"><strong>Answer.</strong> \(\mathbb{P}(L \gt n/2)=\sum_{k \gt n/2}1/k=H_n-H_{n/2}\). At most one such cycle exists.</div>

      <h3>Interview hygiene</h3>
      <p>This is the failure event of the 100-prisoners strategy with opening budget \(n/2\). Do not quote \(\ln 2\) without writing the harmonic difference. The figure varies \(n\), shows a cycle histogram, and overlays the harmonic tail.</p>
    `,
    visual: "longestcycle"
  },
  {
    id: "monty-hall",
    num: "15",
    topic: "games",
    difficulty: "easy",
    time: "5–8 min",
    title: "Monty Hall",
    blurb: "Stay is 1/3. Switch is 2/3. The host’s information is the mechanism.",
    statement: String.raw`
      <p>Three doors, one car, two goats. You pick a door. The host, who knows where the car is, always opens a different door that has a goat. You may stay or switch to the remaining closed door. Find the success probabilities of staying and of switching.</p>
    `,
    solution: String.raw`
      <h3>Stay</h3>
      <p>Your first pick is the car with probability \(1/3\), and the host’s reveal does not change that if you refuse to move. So staying wins with probability \(1/3\).</p>

      <h3>Switch</h3>
      <p>Switching wins if and only if the first pick was a goat, which has probability \(2/3\). In that case the host is forced to open the other goat, and the remaining door is the car.</p>
      <p>Enumerate: car behind door 1 without loss (or not). You pick door 1 with probability \(1/3\) and switching loses; you pick 2 or 3 with total probability \(2/3\) and switching wins.</p>

      <div class="answer-box"><strong>Answer.</strong> Stay \(1/3\), switch \(2/3\).</div>

      <h3>Interview hygiene</h3>
      <p>The host’s policy matters. If the host sometimes opens the car, or sometimes offers no switch, the numbers change. The figure plays the standard policy and tallies stay vs switch.</p>
    `,
    visual: "monty"
  },
  {
    id: "penney",
    num: "16",
    topic: "games",
    difficulty: "medium",
    time: "8–12 min",
    title: "Penney's game",
    blurb: "Length-3 coin patterns are not transitive. Overlap is an edge.",
    statement: String.raw`
      <p>Two players each name a distinct length-3 pattern of fair coin flips. A coin is flipped until one of the two patterns appears as three consecutive flips. That player wins.</p>
      <p>Compute \(\mathbb{P}(\mathrm{HTH}\text{ appears before }\mathrm{HHH})\). Then give a reply to \(\mathrm{HHH}\) with winning probability at least \(2/3\).</p>
    `,
    solution: String.raw`
      <h3>A race on suffixes</h3>
      <p>The same prefix states as the waiting-time problem now have two absorbing winners. Let \(p_s\) be the probability HTH wins from suffix \(s\).</p>
      \[
      \begin{aligned}
      p_{\mathrm{HTH}}&=1,\qquad p_{\mathrm{HHH}}=0,\\
      p_\emptyset&=\tfrac12 p_\emptyset+\tfrac12 p_{\mathrm{H}},\\
      p_{\mathrm{H}}&=\tfrac12 p_{\mathrm{HH}}+\tfrac12 p_{\mathrm{HT}},\\
      p_{\mathrm{HH}}&=\tfrac12\cdot 0+\tfrac12 p_{\mathrm{HT}},\\
      p_{\mathrm{HT}}&=\tfrac12\cdot 1+\tfrac12 p_\emptyset.
      \end{aligned}
      \]
      <p>From \(\mathrm{HH}\), tails lands on \(\mathrm{HHT}\), whose suffix \(\mathrm{HT}\) is a prefix of \(\mathrm{HTH}\). Solving gives \(p_\emptyset=3/5\).</p>
      <p>A common slip is to quote \(2/3\). That is \(\mathbb{P}(\mathrm{HHT}\text{ before }\mathrm{HTH})\), a different pair. Conway’s correlation formula reproduces \(3/5\) for HTH vs HHH.</p>

      <h3>The non-transitive reply</h3>
      <p>If the opponent names \(XYZ\), play \((\text{not }Y)XY\). Against \(\mathrm{HHH}\) that is \(\mathrm{THH}\), and</p>
      \[
      \mathbb{P}(\mathrm{THH}\text{ before }\mathrm{HHH})=\tfrac34.
      \]
      <p>Every length-3 pattern has a counter with odds \(2:1\) or \(3:1\). There is no best first-player pattern.</p>

      <div class="answer-box"><strong>Answer.</strong> \(\mathbb{P}(\mathrm{HTH}\text{ before }\mathrm{HHH})=3/5\). Optimal-style reply to \(\mathrm{HHH}\) is \(\mathrm{THH}\), which wins with probability \(3/4\).</div>

      <h3>Interview hygiene</h3>
      <p>Waiting time and race probability are different functionals of the same chain. \(E[T_{\mathrm{HTH}}]=10\) does not decide who wins a head-to-head. The figure races HTH against HHH on one stream.</p>
    `,
    visual: "penney"
  },
  {
    id: "medical-test",
    num: "17",
    topic: "statistics",
    difficulty: "easy",
    time: "5–8 min",
    title: "A rare disease and a good test",
    blurb: "99% accurate is not 99% posterior when the base rate is 1%.",
    statement: String.raw`
      <p>A disease has prevalence \(1\%\). A test has sensitivity \(99\%\) and specificity \(99\%\). You test positive. What is \(\mathbb{P}(\text{disease}\mid +)\)?</p>
    `,
    solution: String.raw`
      <h3>Bayes</h3>
      <p>Let \(D\) be the disease. Then</p>
      \[
      \mathbb{P}(D\mid +)=\frac{\mathbb{P}(+ \mid D)\,\mathbb{P}(D)}{\mathbb{P}(+)}=\frac{0.99\times 0.01}{0.99\times 0.01+0.01\times 0.99}=\frac{0.0099}{0.0198}=\frac12.
      \]

      <h3>Counts</h3>
      <p>In 10{,}000 people: 100 have the disease, of whom 99 test positive (true positives). 9{,}900 are healthy, of whom \(1\%=99\) test positive (false positives). Among 198 positives, 99 are true. Posterior \(99/198=1/2\), not \(0.99\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(1/2\), not \(99\%\).</div>

      <h3>Interview hygiene</h3>
      <p>Quote prevalence, sensitivity, and specificity as three separate numbers, then run the table. “The test is 99% accurate” is not a posterior. The figure pours 10{,}000 people into TP / FP boxes.</p>
    `,
    visual: "medical"
  },
  {
    id: "sampling-mean",
    num: "18",
    topic: "statistics",
    difficulty: "medium",
    time: "8–12 min",
    title: "Standard error of the sample mean",
    blurb: "The parent stays put. The histogram of means shrinks like \(1/\sqrt{n}\).",
    statement: String.raw`
      <p>Let \(X_1,\dots,X_n\) be i.i.d. with mean \(\mu\) and variance \(\sigma^2\in(0,\infty)\). Let \(\bar X_n=n^{-1}\sum_{i=1}^n X_i\). Find \(E[\bar X_n]\) and \(\mathrm{SD}(\bar X_n)\). How does the sampling distribution of \(\bar X_n\) change with \(n\)?</p>
    `,
    solution: String.raw`
      <h3>Mean and variance</h3>
      \[
      E[\bar X_n]=\mu,\qquad \mathrm{Var}(\bar X_n)=\frac{\sigma^2}{n},\qquad \mathrm{SD}(\bar X_n)=\frac{\sigma}{\sqrt{n}}.
      \]
      <p>The last quantity is the standard error of the mean. Doubling \(n\) does not halve the error; you need \(4n\) to cut it in half.</p>

      <h3>Shape</h3>
      <p>If the \(X_i\) are Gaussian, so is \(\bar X_n\). If not, the CLT still sends \(\sqrt{n}(\bar X_n-\mu)/\sigma\) to \(N(0,1)\). The parent distribution does not get less noisy; the mean of several copies does.</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[\bar X_n]=\mu\) and \(\mathrm{SE}=\sigma/\sqrt{n}\). The sampling histogram concentrates at \(\mu\) on the \(n^{-1/2}\) scale.</div>

      <h3>Interview hygiene</h3>
      <p>Do not confuse \(\mathrm{SD}(X_i)\) with \(\mathrm{SE}(\bar X_n)\). The figure draws the parent and many sample means; a slider on \(n\) tightens the means to the overlay \(\sigma/\sqrt{n}\).</p>
    `,
    visual: "sampling"
  },
  {
    id: "three-prisoners",
    num: "19",
    topic: "strategy",
    difficulty: "easy",
    time: "8–10 min",
    title: "Three prisoners",
    blurb: "A named death is not a coin flip between the two who remain.",
    statement: String.raw`
      <p>Prisoners A, B, and C. The warden has chosen one uniformly at random to be pardoned; the other two will be executed. A asks a guard (who knows the outcome) to name one prisoner <em>other than A</em> who will be executed. If both B and C are to be executed, the guard names B or C with equal probability. The guard says “B will be executed.” What is \(\mathbb{P}(\text{A is pardoned}\mid\text{guard says B})\), and what is \(\mathbb{P}(\text{C is pardoned}\mid\text{guard says B})\)?</p>
    `,
    solution: String.raw`
      <h3>Prior</h3>
      <p>Pardoned prisoner is uniform on \(\{A,B,C\}\). A’s survival probability is \(1/3\) before any speech.</p>

      <h3>The three equally likely worlds</h3>
      <ul class="clean">
        <li>A pardoned (prob \(1/3\)): guard says B or C each with probability \(1/2\). Contribution to “says B”: \(1/6\).</li>
        <li>B pardoned (prob \(1/3\)): guard must say C. Contribution to “says B”: \(0\).</li>
        <li>C pardoned (prob \(1/3\)): guard must say B. Contribution to “says B”: \(1/3\).</li>
      </ul>
      <p>Total \(\mathbb{P}(\text{says B})=1/6+1/3=1/2\). Then</p>
      \[
      \mathbb{P}(\text{A pardoned}\mid\text{says B})=\frac{1/6}{1/2}=\frac13,
      \]
      \[
      \mathbb{P}(\text{C pardoned}\mid\text{says B})=\frac{1/3}{1/2}=\frac23.
      \]
      <p>A is still dead with probability \(2/3\). The news reallocated the \(2/3\) death-mass of “B or C” onto C, not onto a fair coin between A and C.</p>

      <div class="answer-box"><strong>Answer.</strong> A still pardoned with probability \(1/3\) (dies with \(2/3\)). C is pardoned with probability \(2/3\).</div>

      <h3>Interview hygiene</h3>
      <p>This is Monty Hall in prison clothes. The figure labels the three condemned triples and shows where the “B dies” mass sits.</p>
    `,
    visual: "threeprisoners"
  },
  {
    id: "hat-puzzle",
    num: "20",
    topic: "strategy",
    difficulty: "medium",
    time: "8–12 min",
    title: "Three hats, seeing the others",
    blurb: "Pass when you see a mix. Speak when you see a match. Win with probability 3/4.",
    statement: String.raw`
      <p>Three players. Each hat is independently red or blue with equal probability. Each player sees the other two hats but not their own. They may pass or announce a color, simultaneously. They win if at least one announces and every announcement is correct.</p>
      <p>Give a strategy with success probability \(3/4\).</p>
    `,
    solution: String.raw`
      <h3>Strategy</h3>
      <p>If you see two different colors, pass. If you see two of the same color, announce the opposite color.</p>

      <h3>When it wins</h3>
      <p>There are 8 equally likely color triples.</p>
      <ul class="clean">
        <li>All three the same (2 of 8): everyone sees a match, everyone announces the opposite, everyone is wrong. Loss.</li>
        <li>Two of one color, one of the other (6 of 8): the singleton sees two matching hats and announces the opposite, which is their own color. The other two see a mix and pass. Exactly one correct announcement. Win.</li>
      </ul>
      <p>Success probability \(6/8=3/4\).</p>
      <p>They have coded the event “not all hats equal.” The 2-bit majority pattern is the Hamming code of length 3, in miniature.</p>

      <div class="answer-box"><strong>Answer.</strong> Pass on a mix, announce the opposite of a match. Success probability \(3/4\).</div>

      <h3>Interview hygiene</h3>
      <p>Random guessing by one designated speaker wins with probability \(1/2\). The pass/speak protocol correlates the three views so they fail only on the two monochrome configurations. The figure shows the 8 triples and the seeing-two partitions.</p>
    `,
    visual: "hats"
  }
]);
