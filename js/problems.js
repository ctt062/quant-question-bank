window.PROBLEMS = [
  {
    id: "hth-hhh",
    num: "01",
    topic: "Probability",
    time: "10–15 min",
    title: "Waiting time for HTH vs HHH",
    blurb: "Same length, same coin, different expectations. The overlap structure is the whole point.",
    statement: `
      <p>A fair coin is flipped independently until a target pattern first appears.</p>
      <p>Find \(E[T_{\mathrm{HTH}}]\) and \(E[T_{\mathrm{HHH}}]\), the expected number of flips until the first occurrence of each pattern. Explain why they differ.</p>
    `,
    solution: `
      <h3>Setup</h3>
      <p>Track only the current suffix that is a prefix of the target. That finite-state Markov chain is enough: the future waiting time is a function of how much of the pattern you already hold.</p>

      <h3>HTH</h3>
      <p>States: \(\emptyset\), \(\mathrm{H}\), \(\mathrm{HT}\), and absorbing \(\mathrm{HTH}\). Let \(E_s\) be expected additional flips from state \(s\).</p>
      $$
      \\begin{aligned}
      E_\\emptyset &= 1 + \\tfrac12 E_\\emptyset + \\tfrac12 E_{\\mathrm{H}} \\\\
      E_{\\mathrm{H}} &= 1 + \\tfrac12 E_{\\mathrm{H}} + \\tfrac12 E_{\\mathrm{HT}} \\\\
      E_{\\mathrm{HT}} &= 1 + \\tfrac12 \\cdot 0 + \\tfrac12 E_\\emptyset
      \\end{aligned}
      $$
      <p>From \(\mathrm{H}\), another \(\mathrm{H}\) stays at \(\mathrm{H}\) (the sequence still ends in \(\mathrm{H}\)). From \(\mathrm{HT}\), \(\mathrm{H}\) finishes and \(\mathrm{T}\) returns to \(\emptyset\), because a trailing \(\mathrm{T}\) is not a prefix of \(\mathrm{HTH}\).</p>
      <p>Back-substituting: \(E_{\mathrm{HT}}=1+\tfrac12 E_\emptyset\), then \(E_{\mathrm{H}}=3+\tfrac12 E_\emptyset\), then</p>
      $$
      E_\\emptyset = 1 + \\tfrac12 E_\\emptyset + \\tfrac12\\bigl(3+\\tfrac12 E_\\emptyset\\bigr) = \\tfrac52 + \\tfrac34 E_\\emptyset
      $$
      so \(\tfrac14 E_\emptyset=\tfrac52\) and \(E_\emptyset=10\). Thus \(E[T_{\mathrm{HTH}}]=10\).</p>
      <p class="callout">A common slip is to report \(8\). That is the waiting time for \(\mathrm{HHT}\) (or \(\mathrm{HTT}\)), not \(\mathrm{HTH}\). The algebra above is the check.</p>

      <h3>HHH</h3>
      <p>States: \(\emptyset\), \(\mathrm{H}\), \(\mathrm{HH}\), absorbing \(\mathrm{HHH}\).</p>
      $$
      \\begin{aligned}
      E_\\emptyset &= 1 + \\tfrac12 E_\\emptyset + \\tfrac12 E_{\\mathrm{H}} \\\\
      E_{\\mathrm{H}} &= 1 + \\tfrac12 E_\\emptyset + \\tfrac12 E_{\\mathrm{HH}} \\\\
      E_{\\mathrm{HH}} &= 1 + \\tfrac12 E_\\emptyset + \\tfrac12 \\cdot 0
      \\end{aligned}
      $$
      <p>From \(\mathrm{HH}\), tails wipes everything: the sequence now ends in \(\mathrm{T}\), which is useless for a pattern of heads. From \(\mathrm{H}\), tails is likewise a full reset.</p>
      <p>Then \(E_{\mathrm{HH}}=1+\tfrac12 E_\emptyset\), \(E_{\mathrm{H}}=\tfrac32+\tfrac34 E_\emptyset\), and</p>
      $$
      E_\\emptyset = 1 + \\tfrac12 E_\\emptyset + \\tfrac12\\bigl(\\tfrac32+\\tfrac34 E_\\emptyset\\bigr) = \\tfrac74 + \\tfrac78 E_\\emptyset
      $$
      so \(\tfrac18 E_\emptyset=\tfrac74\) and \(E_\emptyset=14\). Thus \(E[T_{\mathrm{HHH}}]=14\).</p>

      <div class="answer-box">
        <strong>Answer.</strong> \(E[T_{\mathrm{HTH}}]=10\) and \(E[T_{\mathrm{HHH}}]=14\).
      </div>

      <h3>Why they differ</h3>
      <p>Both patterns have length 3, so the naive \(2^3=8\) guess is the same. The difference is autocorrelation:</p>
      <ul class="clean">
        <li>\(\mathrm{HTH}\) recycles its last letter. After any failed or partial path that ends in \(\mathrm{H}\), you are already one step into a new attempt.</li>
        <li>\(\mathrm{HHH}\) is brittle. The only way to sit in \(\mathrm{HH}\) is a run of heads, and the first tail throws you all the way back to \(\emptyset\). Progress does not leave a useful residue.</li>
      </ul>
      <p>The same phenomenon is the Conway / gambling embedding: if \(\,C(A,A)\) is the autocorrelation polynomial of pattern \(A\) over a fair coin, then \(E[T_A]=2\,C(A,A)\). That gives \(C(\mathrm{HTH},\mathrm{HTH})=5\) and \(C(\mathrm{HHH},\mathrm{HHH})=7\).</p>
    `,
    visual: "hthhhh"
  },
  {
    id: "broken-stick",
    num: "02",
    topic: "Geometric probability",
    time: "8–12 min",
    title: "Broken stick forms a triangle",
    blurb: "Two uniform breaks on a unit stick. Triangle inequalities become a picture.",
    statement: `
      <p>A stick of length \(1\) is broken at two points chosen independently and uniformly at random. What is the probability that the three pieces can form a triangle?</p>
    `,
    solution: `
      <h3>Setup</h3>
      <p>Let the break points be \(U,V\sim\mathrm{Unif}[0,1]\) independent, and write \(0<X<Y<1\) for the ordered pair. The three lengths are the spacings</p>
      $$
      A=X,\\qquad B=Y-X,\\qquad C=1-Y.
      $$
      <p>The sample space of \((X,Y)\) is the triangle \(\{0<x<y<1\}\) of area \(1/2\). Equivalently, \((A,B,C)\) is uniform on the simplex \(A+B+C=1\), \(A,B,C>0\).</p>

      <h3>Triangle inequalities</h3>
      <p>Three positive lengths that sum to \(1\) form a triangle if and only if each is strictly less than \(1/2\):</p>
      $$
      X<\\tfrac12,\\qquad Y-X<\\tfrac12,\\qquad 1-Y<\\tfrac12.
      $$
      The last is \(Y>1/2\). So the favorable set inside \(0<x<y<1\) is
      $$
      x<\\tfrac12<y,\\qquad y-x<\\tfrac12.
      $$
      That region is itself a right triangle of legs \(1/2\), hence area \(1/8\).</p>
      $$
      \\mathbb{P} = \\frac{1/8}{1/2} = \\frac14.
      $$

      <h3>Simplex picture</h3>
      <p>On the equilateral 2-simplex, the set \(\{A,B,C<1/2\}\) is the central quarter: cutting off the three corners where one piece exceeds \(1/2\) removes three congruent triangles that together make three-quarters of the area.</p>

      <div class="answer-box"><strong>Answer.</strong> \(1/4\).</div>

      <h3>Why this is the interview version</h3>
      <p>The work is not the arithmetic. It is choosing coordinates whose uniform measure is obvious, writing the three inequalities without missing the ordering Jacobian, and recognizing that “can form a triangle” is exactly “no piece is a majority.”</p>
    `,
    visual: "stick"
  },
  {
    id: "circle-cover",
    num: "03",
    topic: "Geometric probability",
    time: "12–15 min",
    title: "Covering the circle",
    blurb: "Throw uniform points on a circle until no open semicircle is empty.",
    statement: `
      <p>Points are thrown independently and uniformly on a circle. Let \(N\) be the number of points needed until every open semicircle contains at least one point. Find \(E[N]\).</p>
      <p>Equivalently: continue until the points are not contained in any open semicircle, or until the maximum circular gap is at most \(1/2\).</p>
    `,
    solution: `
      <h3>Setup</h3>
      <p>Identify the circle with \(\mathbb{R}/\mathbb{Z}\). For \(n\) uniform points the spacings (including the wrap-around) are distributed as \(n\) i.i.d. exponentials normalized to sum to \(1\), i.e. uniform on the simplex. The covering event is</p>
      $$
      \\max_i S_i \\le \\tfrac12.
      $$
      This fails if and only if all \(n\) points lie in some open semicircle.</p>

      <h3>Fixed-\(n\) probability</h3>
      <p>A standard counting argument: rotate so that a distinguished point sits at \(0\). The remaining \(n-1\) points fall in the opposite open semicircle with probability \(2^{1-n}\) for each of the \(n\) choices of “leftmost” point of a containing semicircle, and these events are almost disjoint. The result is</p>
      $$
      \\mathbb{P}(n\\text{ points all lie in some open semicircle}) = \\frac{n}{2^{n-1}}, \\qquad n\\ge 1.
      $$
      Check the small cases: \(n=1,2\) give probability \(1\), and two points never cover. For \(n=3\) the probability of covering is \(1-3/4=1/4\), which matches “the triangle contains the center.”</p>

      <h3>Waiting time</h3>
      <p>Thus \(N\\ge 3\) almost surely and</p>
      $$
      \\mathbb{P}(N>n) = \\frac{n}{2^{n-1}}, \\qquad n\\ge 1,
      $$
      with \(\mathbb{P}(N>0)=1\). Therefore
      $$
      E[N] = \\sum_{n=0}^\\infty \\mathbb{P}(N>n) = 1 + \\sum_{n=1}^\\infty n\\,\\Bigl(\\tfrac12\\Bigr)^{n-1}.
      $$
      The generating function \(\sum_{n\\ge 1} n x^{n-1}=1/(1-x)^2\) at \(x=1/2\) equals \(4\), so \(E[N]=5\).</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[N]=5\).</div>

      <h3>Interview hygiene</h3>
      <p>Write \(P(N>n)=n/2^{n-1}\) first, then sum. Do not guess \(3\) from “you need at least three points.” The tail after \(3\) still contributes \(2\) to the expectation. The figure on this page samples coverings so you can watch the empirical mean sit near \(5\).</p>
    `,
    visual: "circle"
  },
  {
    id: "prisoners",
    num: "04",
    topic: "Strategy / information",
    time: "12–15 min",
    title: "100 prisoners",
    blurb: "A permutation’s cycle structure turns an impossible search into a 31% shot.",
    statement: `
      <p>There are 100 prisoners and 100 boxes. Box \(i\) contains a random permutation of the numbers \(1,\dots,100\). Each prisoner may open 50 boxes and must find their own number. They may plan beforehand, but cannot communicate once the process starts. All must succeed.</p>
      <p>Give a strategy whose success probability is greater than \(30\%\), rather than the \(2^{-100}\) of independent guessing.</p>
    `,
    solution: `
      <h3>Strategy</h3>
      <p>Treat the boxes as the functional graph of the permutation: box \(i\) points to the number inside it. Prisoner \(k\) starts at box \(k\), opens it, and walks to the box labeled with the number just found, for at most 50 steps.</p>
      <p>Each prisoner is walking the unique cycle that contains their number. They all succeed if and only if that walk never needs more than 50 steps, i.e. if and only if the longest cycle of the random permutation has length at most 50.</p>

      <h3>The probability</h3>
      <p>In a uniform random permutation of \(n=100\),</p>
      $$
      \\mathbb{P}(\\text{there exists a cycle of length }k) = \\frac1k, \\qquad 1\\le k\\le n,
      $$
      and there can be at most one cycle longer than \(n/2\). Therefore
      $$
      \\mathbb{P}(\\text{longest cycle}>50) = \\sum_{k=51}^{100}\\frac1k = H_{100}-H_{50}.
      $$
      The harmonic difference is
      $$
      H_{100}-H_{50} = \\ln 2 + O\\!\\left(\\frac1{50}\\right) \\approx 0.688172,
      $$
      so the success probability is
      $$
      1-(H_{100}-H_{50}) \\approx 0.311828 > 30\\%.
      $$
      As \(n\\to\\infty\) with a \(50\%\) opening budget the probability tends to \(1-\\ln 2\\approx 30.7\%\). For finite even \(n\) it is slightly larger.</p>

      <div class="answer-box">
        <strong>Answer.</strong> Follow the cycle from your own box. Success probability \(1-(H_{100}-H_{50})\\approx 31.2\%\).
      </div>

      <h3>Why it is optimal-order</h3>
      <p>Independent random opening of 50 boxes succeeds with probability \(2^{-100}\). The cycle strategy correlates the 100 searches so that they fail together or succeed together, and the only failure mode is a single long cycle. That is essentially the cheapest failure event the permutation measure allows. The figure walks a smaller instance so the pointer-following is visible.</p>
    `,
    visual: "prisoners"
  },
  {
    id: "multiple-testing",
    num: "05",
    topic: "Statistics / inference",
    time: "8–12 min",
    title: "Multiple testing and false discovery",
    blurb: "500 expected false positives, Bonferroni, and when FDR is the right control.",
    statement: `
      <p>You test \(m=10\\,000\) independent hypotheses, each at level \(\\alpha=0.05\).</p>
      <ol class="clean">
        <li>Under the global null (every hypothesis true), what is the expected number of false positives?</li>
        <li>If you want family-wise error rate \(\\mathrm{FWER}\\le 0.05\), what Bonferroni threshold do you use?</li>
        <li>Briefly contrast this with Benjamini–Hochberg FDR control, and say when you prefer each.</li>
      </ol>
    `,
    solution: `
      <h3>Expected false positives</h3>
      <p>Under the global null each \(p\)-value is \(\\mathrm{Unif}[0,1]\), so</p>
      $$
      E[\\#\\{\\text{false positives}\\}] = m\\alpha = 10000\\times 0.05 = 500.
      $$
      The count is exactly \(\\mathrm{Bin}(m,\\alpha)\). Five percent of a large screen is not a rare event; it is the design.</p>

      <h3>Bonferroni / FWER</h3>
      <p>The family-wise error rate is \(\\mathbb{P}(\\text{at least one false positive})\). Bonferroni tests each hypothesis at \(\\alpha/m\):</p>
      $$
      \\frac{0.05}{10000} = 5\\times 10^{-6}.
      $$
      Union bound gives \(\\mathrm{FWER}\\le 0.05\) with no independence assumption. Under independence the sharper Šidák threshold \(1-(1-\\alpha)^{1/m}\) is almost the same number here.</p>

      <h3>Benjamini–Hochberg FDR</h3>
      <p>Order the \(p\)-values \(p_{(1)}\\le\\cdots\\le p_{(m)}\). For target FDR \(q\), let</p>
      $$
      k^\\star = \\max\\bigl\\{k: p_{(k)}\\le (k/m)q\\bigr\\}
      $$
      and reject \(p_{(1)},\\dots,p_{(k^\\star)}\) (or reject nothing if the set is empty). This controls the expected fraction of false discoveries among the rejected set.</p>
      <p>Graphically, BH is the largest \(p\)-value that still sits under the sloped line of height \(q\) from \(0\) to \(m\). Bonferroni is the flat line at \(q/m\).</p>

      <div class="answer-box">
        <strong>Answer.</strong> \(500\) expected false positives; Bonferroni threshold \(5\\times 10^{-6}\); use FWER when any false rejection is catastrophic, FDR when you can live with a controlled share of mistakes among the discoveries.
      </div>

      <h3>Which one</h3>
      <ul class="clean">
        <li><strong>Bonferroni / FWER</strong> for a confirmatory claim: a drug approval, a single published “effect exists” statement, anything where one false positive is the failure mode.</li>
        <li><strong>BH / FDR</strong> for large exploratory screens (genomics, feature ranking, many assets). You expect some false leads and want the list still mostly real.</li>
      </ul>
      <p>Do not quote “we used \(p<0.05\)” on \(10\\,000\) tests. That is a machine for manufacturing 500 stories.</p>
    `,
    visual: "fdr"
  },
  {
    id: "order-stats",
    num: "06",
    topic: "Statistics / probability",
    time: "8–10 min",
    title: "Uniform order-statistic means",
    blurb: "The k-th uniform order statistic is Beta. Its mean is the obvious spacing.",
    statement: `
      <p>Let \(U_{(1)}<U_{(2)}<\\cdots<U_{(n)}\) be the order statistics of \(n\) i.i.d. \(\\mathrm{Uniform}[0,1]\) random variables. Find \(E[U_{(k)}]\) for general \(k\).</p>
    `,
    solution: `
      <h3>Distribution</h3>
      <p>The joint density of the order statistics is \(n!\) on \(0<u_1<\\cdots<u_n<1\). The marginal of \(U_{(k)}\) is \(\\mathrm{Beta}(k,\\,n-k+1)\):</p>
      $$
      f_{U_{(k)}}(u) = \\frac{n!}{(k-1)!(n-k)!}\\, u^{k-1}(1-u)^{n-k}, \\qquad 0<u<1.
      $$
      A Beta\((\\alpha,\\beta)\) random variable has mean \(\\alpha/(\\alpha+\\beta)\), so</p>
      $$
      E[U_{(k)}] = \\frac{k}{k+(n-k+1)} = \\frac{k}{n+1}.
      $$

      <h3>Spacing argument</h3>
      <p>The \(n\) points plus the two endpoints \(\{0,1\}\) cut \([0,1]\) into \(n+1\) spacings. Those spacings are exchangeable (they are normalized i.i.d. exponentials). Each therefore has mean \(1/(n+1)\), and \(U_{(k)}\) is the sum of the first \(k\) spacings.</p>

      <div class="answer-box"><strong>Answer.</strong> \(E[U_{(k)}]=k/(n+1)\). Equivalently \(U_{(k)}\\sim\\mathrm{Beta}(k,n-k+1)\).</div>

      <h3>Useful relatives</h3>
      <p>\(\\mathrm{Var}(U_{(k)})=k(n-k+1)/[(n+1)^2(n+2)]\). The mid-range \(U_{((n+1)/2)}\) concentrates at \(1/2\) like \(n^{-1/2}\), while the extremes \(U_{(1)}\) and \(U_{(n)}\) live on the \(1/n\) scale. The figure lets you move \(n\) and \(k\) and watch the Beta density sit over \(k/(n+1)\).</p>
    `,
    visual: "orderstats"
  }
];
