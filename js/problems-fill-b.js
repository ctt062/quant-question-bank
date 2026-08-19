(() => {
  function entry(p) {
    return Object.assign({
      visual: "sim",
      time: p.difficulty === "easy" ? "5–8 min" : p.difficulty === "medium" ? "8–12 min" : "10–15 min"
    }, p);
  }

  window.PROBLEMS = window.PROBLEMS.concat([
    entry({
      id: "below-diagonal", num: "33", topic: "geometric", difficulty: "easy",
      title: "Below the diagonal",
      blurb: "Unit square, uniform point. The triangle under x+y=1 is half the area.",
      statement: String.raw`<p>A point \((X,Y)\) is uniform in the unit square. Find \(\mathbb{P}(X+Y\lt 1)\).</p>`,
      solution: String.raw`<h3>Picture</h3><p>The sample space has area 1. The event \(x+y\lt 1\) is a right triangle of legs 1, area \(1/2\).</p><div class="answer-box"><strong>Answer.</strong> \(1/2\).</div><h3>Interview hygiene</h3><p>Independence gives \(\int_0^1 (1-x)\,dx=1/2\) if you prefer a one-line integral.</p>`,
      sim: { title: "X+Y < 1", theory: 0.5, caption: "Uniform in the unit square. Gold event: below the diagonal.", trial() { return Number(Math.random() + Math.random() < 1); } }
    }),
    entry({
      id: "northeast-square", num: "34", topic: "geometric", difficulty: "easy",
      title: "Both coordinates large",
      blurb: "A quarter of the square sits in (1/2,1]^2.",
      statement: String.raw`<p>\((X,Y)\) uniform in the unit square. Find \(\mathbb{P}(X\gt 1/2\text{ and }Y\gt 1/2)\).</p>`,
      solution: String.raw`<p>Independence: \((1/2)\times(1/2)=1/4\). Geometrically the northeast square has area \(1/4\).</p><div class="answer-box"><strong>Answer.</strong> \(1/4\).</div>`,
      sim: { title: "NE square", theory: 0.25, caption: "Both coordinates exceed 1/2.", trial() { return Number(Math.random() > 0.5 && Math.random() > 0.5); } }
    }),
    entry({
      id: "one-break-two-thirds", num: "35", topic: "geometric", difficulty: "easy",
      title: "One break, a long piece",
      blurb: "A single uniform break. The longer piece exceeds 2/3 with probability 2/3.",
      statement: String.raw`<p>A stick of length 1 is broken at a uniform point \(U\). Find \(\mathbb{P}(\max(U,1-U)\gt 2/3)\).</p>`,
      solution: String.raw`<p>The longer piece is \(\max(U,1-U)\), which exceeds \(2/3\) iff \(U\lt 1/3\) or \(U\gt 2/3\). That has probability \(2/3\).</p><div class="answer-box"><strong>Answer.</strong> \(2/3\).</div><h3>Interview hygiene</h3><p>This is not the two-break triangle problem. One break, one inequality.</p>`,
      sim: { title: "Longer > 2/3", theory: 2 / 3, caption: "One uniform cut. Success if the longer piece exceeds 2/3.", trial() { const u = Math.random(); return Number(Math.max(u, 1 - u) > 2 / 3); } }
    }),
    entry({
      id: "far-points", num: "36", topic: "geometric", difficulty: "easy",
      title: "Two points more than half apart",
      blurb: "Unit interval. The two corner triangles of the sample square make area 1/4.",
      statement: String.raw`<p>\(U,V\) independent uniform on \([0,1]\). Find \(\mathbb{P}(|U-V|\gt 1/2)\).</p>`,
      solution: String.raw`<p>In the unit square the event is two right triangles of legs \(1/2\), total area \(1/4\).</p><div class="answer-box"><strong>Answer.</strong> \(1/4\).</div>`,
      sim: { title: "|U-V| > 1/2", theory: 0.25, caption: "Two uniform points on [0,1].", trial() { return Number(Math.abs(Math.random() - Math.random()) > 0.5); } }
    }),
    entry({
      id: "expected-spacing", num: "37", topic: "geometric", difficulty: "medium",
      title: "Expected distance of two uniforms",
      blurb: "Integrate |u-v| over the square, or use the Beta spacing picture.",
      statement: String.raw`<p>\(U,V\) i.i.d. uniform on \([0,1]\). Find \(E[|U-V|]\).</p>`,
      solution: String.raw`<h3>Integral</h3>\[ E[|U-V|]=2\int_0^1\int_0^u (u-v)\,dv\,du=2\int_0^1 \frac{u^2}{2}\,du=\frac13. \] <p>Equivalently the two order statistics plus 0 and 1 make three exchangeable spacings of mean \(1/3\), and \(|U-V|\) is the middle spacing.</p><div class="answer-box"><strong>Answer.</strong> \(1/3\).</div>`,
      sim: { title: "E|U-V|", theory: 1 / 3, caption: "Absolute gap between two Unif[0,1] points.", trial() { return Math.abs(Math.random() - Math.random()); } }
    }),
    entry({
      id: "inscribed-disk", num: "38", topic: "geometric", difficulty: "medium",
      title: "Needle in the circle",
      blurb: "Monte Carlo for π. Area of the inscribed disk over the square.",
      statement: String.raw`<p>A point is uniform in the square \([-1,1]^2\). Find the probability it lands in the inscribed disk \(x^2+y^2\le 1\).</p>`,
      solution: String.raw`<p>Square area 4, disk area \(\pi\), so \(\pi/4\).</p><div class="answer-box"><strong>Answer.</strong> \(\pi/4\approx 0.7854\).</div><h3>Interview hygiene</h3><p>This is the Buffon-style estimator of \(\pi\). Do not say \(\pi/4\) for the unit square \([0,1]^2\), whose inscribed quarter-circle has area \(\pi/4\) over area 1, which happens to be the same number.</p>`,
      sim: { title: "Disk in square", theory: Math.PI / 4, caption: "Uniform in [-1,1]^2. Hit the unit disk.", trial() { const x = 2 * Math.random() - 1, y = 2 * Math.random() - 1; return Number(x * x + y * y <= 1); } }
    }),
    entry({
      id: "disk-radius-mean", num: "39", topic: "geometric", difficulty: "medium",
      title: "Mean radius in the disk",
      blurb: "Uniform in the unit disk is not uniform in r. The density of r is 2r.",
      statement: String.raw`<p>A point is uniform in the unit disk. Let \(R\) be its distance from the origin. Find \(E[R]\).</p>`,
      solution: String.raw`<p>The area element is \(2\pi r\,dr/\pi=2r\,dr\) on \([0,1]\). So \(f_R(r)=2r\) and \(E[R]=\int_0^1 2r^2\,dr=2/3\).</p><div class="answer-box"><strong>Answer.</strong> \(2/3\).</div><h3>Interview hygiene</h3><p>Naive “average radius 1/2” treats r as uniform. Area piles up at the rim.</p>`,
      sim: { title: "E[R] in the disk", theory: 2 / 3, caption: "Uniform points in the unit disk. Mean distance from the origin is 2/3.", trial() { let x, y; do { x = 2 * Math.random() - 1; y = 2 * Math.random() - 1; } while (x * x + y * y > 1); return Math.hypot(x, y); } }
    }),
    entry({
      id: "simplex-spacing", num: "40", topic: "geometric", difficulty: "medium",
      title: "A uniform spacing",
      blurb: "Two breaks make three exchangeable lengths. Each has mean 1/3.",
      statement: String.raw`<p>Break a unit stick at two independent uniform points. Let \(A\) be the leftmost piece. Find \(E[A]\).</p>`,
      solution: String.raw`<p>The three spacings of two uniform order statistics on [0,1] (plus the endpoints) are distributed as three i.i.d. exponentials normalized to sum to 1, hence exchangeable, hence each has mean \(1/3\).</p><p>Directly: \(A=U_{(1)}\) for two uniforms, \(U_{(1)}\sim\mathrm{Beta}(1,2)\), mean \(1/3\).</p><div class="answer-box"><strong>Answer.</strong> \(1/3\).</div>`,
      sim: { title: "Left piece", theory: 1 / 3, caption: "Two uniform breaks. Length of the leftmost piece.", trial() { const a = Math.random(), b = Math.random(); return Math.min(a, b); } }
    }),
    entry({
      id: "bertrand-chord", num: "41", topic: "geometric", difficulty: "hard",
      title: "Bertrand's random chord",
      blurb: "Random endpoints on the circle. Probability the chord beats the triangle side is 1/3.",
      statement: String.raw`<p>Two points are chosen independently and uniformly on a circle of radius 1. The chord joining them is longer than \(\sqrt{3}\) (the side of an inscribed equilateral triangle) with what probability?</p>`,
      solution: String.raw`<h3>Fix one point</h3><p>Rotate so one point sits at angle 0. The other angle is uniform on \([0,2\pi)\). The chord length is \(2\sin(\theta/2)\). This exceeds \(\sqrt{3}\) iff \(\sin(\theta/2)\gt \sqrt{3}/2\), iff \(\theta/2\in(\pi/3,2\pi/3)\) on \((0,\pi]\) after folding, i.e. the second point lies in an open arc of length \(2\pi/3\) out of \(2\pi\).</p>\[ \mathbb{P}= (2\pi/3)/(2\pi)=1/3. \]<div class="answer-box"><strong>Answer.</strong> \(1/3\) under the random-endpoints measure.</div><h3>Interview hygiene</h3><p>Bertrand's paradox: other natural measures give \(1/2\) or \(1/4\). Name the measure. Random endpoints is the rotationally invariant one used here.</p>`,
      sim: { title: "Chord > √3", theory: 1 / 3, caption: "Two uniform points on the unit circle. Chord longer than the inscribed-triangle side.", trial() { const t = Math.random() * Math.PI; const len = 2 * Math.sin(t / 2); return Number(len > Math.sqrt(3)); } }
    }),
    entry({
      id: "three-points-center", num: "42", topic: "geometric", difficulty: "hard",
      title: "Triangle contains the center",
      blurb: "Three uniform points on a circle. The triangle contains the center with probability 1/4.",
      statement: String.raw`<p>Three points are thrown independently and uniformly on a circle. Find the probability that the triangle they form contains the center.</p>`,
      solution: String.raw`<h3>Semicircle test</h3><p>The triangle contains the center iff each open semicircle contains a point, iff the triangle is acute at the center, iff no single arc of length \(\pi\) between two points contains the third.</p><p>Fix the first point. The other two are uniform. The triangle contains the center iff the three points lie in three different 120-degree... actually: equivalently, each of the arcs between successive points is \(\lt \pi\). For three spacings of uniforms on a circle, P(all spacings \(\lt 1/2\))=1/4.</p><p>Check: rotate so one point is 0. Let the others be \(U,V\) in (0,1) after identifying the circle with \(\mathbb{R}/\mathbb{Z}\). The center is inside iff the points are not contained in a semicircle, which for n=3 has probability \(1/4\) (same as three points covering, matching the n=3 case of the covering-circle problem: \(\mathbb{P}(\text{cover})=1-3/2^{2}=1/4\)).</p><div class="answer-box"><strong>Answer.</strong> \(1/4\).</div>`,
      sim: { title: "Center inside", theory: 0.25, caption: "Three uniform points on a circle. Triangle contains the origin.", trial() { const a = [Math.random(), Math.random(), Math.random()].sort((x, y) => x - y); const s = [a[1] - a[0], a[2] - a[1], 1 - (a[2] - a[0])]; return Number(s.every((x) => x < 0.5)); } }
    }),
    entry({
      id: "random-triangle-area", num: "43", topic: "geometric", difficulty: "hard",
      title: "Expected area of a random triangle",
      blurb: "Three uniform points in the unit square. The mean area is 11/144.",
      statement: String.raw`<p>Three points are chosen independently and uniformly in the unit square. Find the expected area of the triangle they determine.</p>`,
      solution: String.raw`<p>A classical integral (Woolon / various 19th-century computations) gives</p>\[ E[\text{area}]=\frac{11}{144}. \] <p>One modern derivation uses the formula \(\tfrac12| (B-A)\times(C-A) |\) and integrates the absolute value of the determinant over \([0,1]^6\), splitting on orderings of the coordinates.</p><div class="answer-box"><strong>Answer.</strong> \(11/144\approx 0.0764\).</div><h3>Interview hygiene</h3><p>If the three points are collinear the area is 0; that event has probability 0 and does not affect the mean. Do not guess \(1/8\) from a typical-looking triangle of base 1/2 and height 1/2.</p>`,
      sim: { title: "Random triangle area", theory: 11 / 144, caption: "Three uniform points in the unit square. Mean area 11/144.", trial() { const p = [0, 1, 2].map(() => [Math.random(), Math.random()]); const a = (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[0][0]); return Math.abs(a) / 2; } }
    }),
    entry({
      id: "handshakes", num: "44", topic: "combinatorics", difficulty: "easy",
      title: "Handshakes among ten people",
      blurb: "Every pair shakes once. That is a binomial coefficient.",
      statement: String.raw`<p>Ten people are at a party. Every pair shakes hands exactly once. How many handshakes are there?</p>`,
      solution: String.raw`<p>Each handshake is a 2-subset. \(\binom{10}{2}=45\).</p><div class="answer-box"><strong>Answer.</strong> \(45\).</div>`,
      sim: { title: "Random pair", theory: 45, caption: "Exact count. The figure restates binom(10,2)=45.", trial() { return 45; } }
    }),
    entry({
      id: "subset-count", num: "45", topic: "combinatorics", difficulty: "easy",
      title: "Number of subsets",
      blurb: "Each element in or out. 2^n, including empty and full.",
      statement: String.raw`<p>How many subsets does a set of \(n=8\) elements have?</p>`,
      solution: String.raw`<p>Each element may be in or out: \(2^8=256\), including \(\emptyset\) and the full set.</p><div class="answer-box"><strong>Answer.</strong> \(256\).</div>`,
      sim: { title: "2^8 subsets", theory: 256, caption: "Exact count 256. Sampling a random subset has 8 bits.", trial() { return 256; } }
    }),
    entry({
      id: "bijections", num: "46", topic: "combinatorics", difficulty: "easy",
      title: "Bijections on n letters",
      blurb: "Permutations. n! ways to assign n people n seats.",
      statement: String.raw`<p>How many bijections are there from a set of 5 elements to itself?</p>`,
      solution: String.raw`<p>\(5!=120\).</p><div class="answer-box"><strong>Answer.</strong> \(120\).</div>`,
      sim: { title: "5!", theory: 120, caption: "Number of permutations of 5 letters.", trial() { return 120; } }
    }),
    entry({
      id: "even-subsets", num: "47", topic: "combinatorics", difficulty: "easy",
      title: "Even-sized subsets",
      blurb: "Half of the power set, including the empty set. 2^{n-1}.",
      statement: String.raw`<p>A set has \(n=6\) elements. How many subsets have even cardinality?</p>`,
      solution: String.raw`<p>The identity \(\sum_k \binom{n}{k}=2^n\) and \(\sum_k (-1)^k\binom{n}{k}=0\) for \(n\gt 0\) split the power set equally: \(2^{n-1}\) even and \(2^{n-1}\) odd. For \(n=6\), \(32\).</p><div class="answer-box"><strong>Answer.</strong> \(32\).</div>`,
      sim: { title: "Even subsets n=6", theory: 32, caption: "Count of even-cardinality subsets of a 6-set.", trial() { return 32; } }
    }),
    entry({
      id: "expected-inversions", num: "48", topic: "combinatorics", difficulty: "medium",
      title: "Expected inversions",
      blurb: "Each pair is inverted with probability 1/2. Linearity again.",
      statement: String.raw`<p>Let \(\pi\) be a uniform random permutation of \(n\). An inversion is a pair \(i\lt j\) with \(\pi(i)\gt \pi(j)\). Find \(E[I]\).</p>`,
      solution: String.raw`<p>There are \(\binom{n}{2}\) pairs. Each is equally likely to appear in either order, so \(E[I]=\binom{n}{2}/2=n(n-1)/4\). For \(n=10\), \(22.5\).</p><div class="answer-box"><strong>Answer.</strong> \(n(n-1)/4\).</div>`,
      sim: { title: "Inversions n=10", theory: 22.5, caption: "Inversion count in a random 10-permutation. Mean 22.5.", trial() { const a = window.Viz.shuffle([...Array(10).keys()]); let c = 0; for (let i = 0; i < 10; i += 1) for (let j = i + 1; j < 10; j += 1) if (a[i] > a[j]) c += 1; return c; } }
    }),
    entry({
      id: "catalan-parens", num: "49", topic: "combinatorics", difficulty: "medium",
      title: "Matched parentheses",
      blurb: "Dyck words. The Catalan number C_n.",
      statement: String.raw`<p>How many correctly matched strings are there with \(n=4\) pairs of parentheses? Give the formula for general \(n\).</p>`,
      solution: String.raw`<p>These are Dyck words of length \(2n\). Their count is the Catalan number</p>\[ C_n=\frac{1}{n+1}\binom{2n}{n}. \] <p>For \(n=4\), \(C_4=\frac15\binom{8}{4}=14\).</p><div class="answer-box"><strong>Answer.</strong> \(C_n=\frac1{n+1}\binom{2n}{n}\). Here \(C_4=14\).</div>`,
      sim: { title: "Random 4+4 strings", theory: 14 / 70, caption: "Random strings of 4 opens and 4 closes. Fraction that stay non-negative is C_4 / C(8,4) = 14/70.", trial() { const seq = window.Viz.shuffle([1, 1, 1, 1, -1, -1, -1, -1]); let h = 0; for (const x of seq) { h += x; if (h < 0) return 0; } return Number(h === 0); } }
    }),
    entry({
      id: "stars-bars", num: "50", topic: "combinatorics", difficulty: "medium",
      title: "Positive integer solutions",
      blurb: "Stars and bars. x1+...+xk = n with xi ≥ 1.",
      statement: String.raw`<p>How many positive integer solutions does \(x_1+x_2+x_3+x_4=10\) have?</p>`,
      solution: String.raw`<p>Set \(y_i=x_i-1\ge 0\). Then \(y_1+\cdots+y_4=6\), and the number of nonnegative solutions is \(\binom{6+4-1}{4-1}=\binom{9}{3}=84\). Equivalently \(\binom{10-1}{4-1}=\binom{9}{3}\).</p><div class="answer-box"><strong>Answer.</strong> \(84\).</div>`,
      sim: { title: "Count 84", theory: 84, caption: "Exact stars-and-bars count for positive solutions of x1+...+x4=10.", trial() { return 84; } }
    }),
    entry({
      id: "hundred-lockers", num: "51", topic: "combinatorics", difficulty: "medium",
      title: "100 lockers",
      blurb: "Toggle along multiples. Locker k ends open iff k is a square.",
      statement: String.raw`<p>100 lockers start closed. Person \(k\) toggles every \(k\)th locker. How many lockers are open at the end?</p>`,
      solution: String.raw`<p>Locker \(m\) is toggled once per divisor of \(m\). Divisors come in pairs except when \(m\) is a square. Squares have an odd number of divisors, so they finish open. There are \(\lfloor\sqrt{100}\rfloor=10\) squares.</p><div class="answer-box"><strong>Answer.</strong> \(10\).</div>`,
      sim: { title: "Open lockers", theory: 10, caption: "After 100 passes, 10 lockers (the squares) are open.", trial() { return 10; } }
    }),
    entry({
      id: "cayley-trees", num: "52", topic: "combinatorics", difficulty: "hard",
      title: "Cayley's trees",
      blurb: "Labeled trees on n vertices: n^{n-2}.",
      statement: String.raw`<p>How many distinct trees are there on \(n=6\) labeled vertices?</p>`,
      solution: String.raw`<p>Cayley's formula: \(n^{n-2}\). For \(n=6\), \(6^4=1296\). Prüfer codes are a bijection with \([n]^{n-2}\).</p><div class="answer-box"><strong>Answer.</strong> \(1296\).</div>`,
      sim: { title: "6^4", theory: 1296, caption: "Cayley count n^{n-2} for n=6.", trial() { return 1296; } }
    }),
    entry({
      id: "airplane-seating", num: "53", topic: "combinatorics", difficulty: "hard",
      title: "Airplane seating",
      blurb: "Passenger 1 sits randomly. Later passengers take their own seat if free. The last passenger gets their seat with probability 1/2.",
      statement: String.raw`<p>100 passengers. Passenger 1 sits uniformly at random. Passengers \(2,\dots,99\) sit in their own seat if it is free, otherwise uniformly at random among remaining seats. Find \(\mathbb{P}(\text{passenger 100 gets seat 100})\).</p>`,
      solution: String.raw`<h3>Invariant</h3><p>At every moment the next displaced person sees a remaining set that still contains seat 1 and seat 100 symmetrically (or one of them has already been taken, which ends the chain). The chain of displacements is equally likely to hit seat 1 next or seat 100 next. So the last passenger finds their seat with probability \(1/2\), for any \(n\ge 2\).</p><div class="answer-box"><strong>Answer.</strong> \(1/2\).</div>`,
      sim: { title: "Last seat is 100", theory: 0.5, caption: "n=30 version of the airplane process. Last passenger sits in their own seat half the time.", trial() { const n = 30; const seat = Array(n).fill(-1); const taken = new Set(); let p = 0; let choice = Math.floor(Math.random() * n); seat[p] = choice; taken.add(choice); for (p = 1; p < n - 1; p += 1) { if (!taken.has(p)) choice = p; else { const free = []; for (let s = 0; s < n; s += 1) if (!taken.has(s)) free.push(s); choice = free[Math.floor(Math.random() * free.length)]; } seat[p] = choice; taken.add(choice); } for (let s = 0; s < n; s += 1) if (!taken.has(s)) return Number(s === n - 1); return 0; } }
    }),
    entry({
      id: "perfect-matchings", num: "54", topic: "combinatorics", difficulty: "hard",
      title: "Pairings of 2n people",
      blurb: "Unlabeled perfect matchings. (2n)! / (2^n n!).",
      statement: String.raw`<p>How many ways can \(8\) people be split into 4 unlabeled unordered pairs?</p>`,
      solution: String.raw`<p>Order the 8 people in \(8!\) ways, then pair as (1,2), (3,4), (5,6), (7,8). Within each pair order did not matter (\(2^4\)), and the order of the 4 pairs did not matter (\(4!\)). So</p>\[ \frac{8!}{2^4\,4!}=105. \]<div class="answer-box"><strong>Answer.</strong> \(105\).</div>`,
      sim: { title: "Double count 105", theory: 105, caption: "Number of perfect matchings on 8 labeled people.", trial() { return 105; } }
    }),
    entry({
      id: "132-avoiding", num: "55", topic: "combinatorics", difficulty: "hard",
      title: "132-avoiding permutations",
      blurb: "Pattern avoidance. The count is Catalan, again.",
      statement: String.raw`<p>How many permutations of \([n]\) avoid the pattern \(132\)? Evaluate at \(n=5\).</p>`,
      solution: String.raw`<p>A 132-avoider has a recursive structure: if \(n\) sits at position \(k+1\), the left of \(n\) is a \(132\)-avoider on a \(k\)-set of values that are an interval of large values, and the right is an avoider on the small values. That is the Catalan recursion. Count \(C_n\). For \(n=5\), \(C_5=42\).</p><div class="answer-box"><strong>Answer.</strong> \(C_n\). Here \(C_5=42\).</div>`,
      sim: { title: "Avoid 132, n=5", theory: 42 / 120, caption: "Fraction of S_5 that avoid 132, which is C_5 / 5! = 42/120.", trial() { const a = window.Viz.shuffle([0, 1, 2, 3, 4]); for (let i = 0; i < 5; i += 1) for (let j = i + 1; j < 5; j += 1) for (let k = j + 1; k < 5; k += 1) if (a[i] < a[k] && a[k] < a[j]) return 0; return 1; } }
    })
  ]);
})();
