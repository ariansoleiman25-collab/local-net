// ===== QUESTIONS DATA =====
const mcQuestions = [
    { q: "Which area is required in OSPF?", opts: ["Area 1","Area 2","Area 0","Area 10"], answer: 2 },
    { q: "If the IP address is 192.168.1.1/24, what is the wildcard mask?", opts: ["0.0.0.0","0.0.0.255","0.0.255.0","255.255.255.0"], answer: 1 },
    { q: "What does EIGRP stand for?", opts: ["Enhanced Interior Gateway Routing Protocol","Enhanced Internet Gateway Routing Protocol","External Interior Gateway Routing Protocol","Extended Interior Global Routing Protocol"], answer: 0 },
    { q: "EIGRP sometimes is called a:", opts: ["Link-state protocol","Static routing protocol","Hybrid routing protocol","RIP protocol"], answer: 2 },
    { q: "Connecting two office LANs together results in:", opts: ["A bigger LAN","A subnet","A VLAN","A WAN"], answer: 3 },
    { q: "How often does RIP send its routing table?", opts: ["Every 10 seconds","Every 30 seconds","Every 60 seconds","Only once"], answer: 1 },
    { q: "RIP chooses the best path using:", opts: ["Bandwidth","Cost","Hop count","Delay"], answer: 2 },
    { q: "RIP works best in:", opts: ["Very small networks","Large networks","Internet backbone","Wireless-only networks"], answer: 0 },
    { q: "How many main classes of routing protocols are there?", opts: ["One","Two","Three","Four"], answer: 2 },
    { q: "OSPF is which type of routing protocol?", opts: ["Distance vector","Static","Default","Link state"], answer: 3 },
    { q: "What is the administrative distance of OSPF?", opts: ["90","100","110","120"], answer: 2 },
    { q: "What is the administrative distance of EIGRP (internal)?", opts: ["90","100","110","120"], answer: 0 },
    { q: "Which protocol uses Dijkstra's algorithm?", opts: ["RIP","EIGRP","OSPF","BGP"], answer: 2 },
    { q: "What is the maximum hop count for RIP?", opts: ["10","15","20","30"], answer: 1 },
    { q: "Which routing protocol converges the fastest?", opts: ["RIP","OSPF","EIGRP","Static routing"], answer: 2 },
    { q: "What is the default metric used by OSPF?", opts: ["Bandwidth","Cost","Hop count","Delay"], answer: 1 },
    { q: "Which protocol uses bandwidth and delay as metrics?", opts: ["RIP","OSPF","EIGRP","BGP"], answer: 2 },
    { q: "What type of routing protocol is RIP?", opts: ["Link-state","Hybrid","Distance vector","Static"], answer: 2 },
    { q: "What is the full form of OSPF?", opts: ["Open Shortest Path First","Open Static Path First","Optimal Shortest Path Forward","Open Secure Path First"], answer: 0 },
    { q: "Which protocol is used mainly on the Internet?", opts: ["RIP","OSPF","EIGRP","BGP"], answer: 3 },
];

const essayQuestions = [
    {
        q: "What is Circuit switched connection types? With example.",
        model: "Circuit switching is a connection type where a dedicated communication path (circuit) is established between two devices for the entire duration of the communication session. The circuit reserves bandwidth end-to-end before any data is transferred, and the path remains open until the session ends.\n\nExample: The traditional telephone network (PSTN — Public Switched Telephone Network). When you make a phone call, a dedicated circuit is set up between you and the person you are calling. That circuit stays open for the entire call and is released when you hang up."
    },
    {
        q: "Which routing protocol class that RIP is belong to?",
        model: "RIP (Routing Information Protocol) belongs to the Distance Vector routing protocol class. Distance vector protocols determine the best route based on distance (hop count) and direction (vector) to any destination in the network. RIP uses hop count as its metric, with a maximum of 15 hops."
    },
    {
        q: "List three routing protocols, one from each class.",
        model: "The three main classes of routing protocols and one example from each:\n\n1. Distance Vector — RIP (Routing Information Protocol)\n2. Link-State — OSPF (Open Shortest Path First)\n3. Hybrid (Advanced Distance Vector) — EIGRP (Enhanced Interior Gateway Routing Protocol)"
    },
];

const letters = ['a', 'b', 'c', 'd'];
const totalQuestions = mcQuestions.length + essayQuestions.length;

// ===== STATE =====
let currentIndex = 0;
let userAnswers = new Array(totalQuestions).fill(null);
let questionLocked = new Array(totalQuestions).fill(false); // tracks if feedback was shown
let timerInterval = null;
let seconds = 0;

// ===== DOM REFS =====
const landingScreen = document.getElementById('landingScreen');
const examScreen = document.getElementById('examScreen');
const resultsScreen = document.getElementById('resultsScreen');
const questionsContainer = document.getElementById('questionsContainer');
const questionDots = document.getElementById('questionDots');
const progressBar = document.getElementById('progressBar');
const currentQEl = document.getElementById('currentQ');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitContainer = document.getElementById('submitContainer');
const timerText = document.getElementById('timerText');

// ===== HELPERS =====
function toArabicNum(n) {
    const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(n).split('').map(d => ar[+d] || d).join('');
}

// ===== START EXAM =====
function startExam() {
    landingScreen.classList.remove('active');
    setTimeout(() => {
        examScreen.classList.add('active');
        buildQuestions();
        buildDots();
        showQuestion(0);
        startTimer();
    }, 300);
}

// ===== BUILD QUESTIONS =====
function buildQuestions() {
    let html = '';

    // MCQ
    mcQuestions.forEach((mc, i) => {
        html += `<div class="question-card" id="q${i}">
            <div class="question-number">Question ${i + 1} of ${totalQuestions}</div>
            <div class="question-text">${mc.q}</div>
            <div class="options-list">
                ${mc.opts.map((opt, oi) => `
                    <button class="option-btn" data-q="${i}" data-opt="${oi}" onclick="selectOption(${i}, ${oi})">
                        <span class="option-letter">${letters[oi]}</span>
                        <span class="option-label">${opt}</span>
                    </button>
                `).join('')}
            </div>
        </div>`;
    });

    // Essay
    essayQuestions.forEach((eq, i) => {
        const idx = mcQuestions.length + i;
        html += `<div class="question-card" id="q${idx}">
            <div class="question-number">Question ${idx + 1} of ${totalQuestions}</div>
            <div class="question-text">${eq.q}</div>
            <textarea class="essay-textarea" id="essay${i}" placeholder="Write your answer here..." oninput="saveEssay(${i})"></textarea>
        </div>`;
    });

    questionsContainer.innerHTML = html;
}

// ===== DOTS =====
function buildDots() {
    let html = '';
    for (let i = 0; i < totalQuestions; i++) {
        html += `<div class="q-dot" data-i="${i}" onclick="goToQuestion(${i})"></div>`;
    }
    questionDots.innerHTML = html;
}

function updateDots() {
    document.querySelectorAll('.q-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
        dot.classList.toggle('answered', userAnswers[i] !== null);
        // Color dots by correctness for MCQs
        dot.classList.remove('dot-correct', 'dot-wrong');
        if (i < mcQuestions.length && questionLocked[i]) {
            if (userAnswers[i] === mcQuestions[i].answer) {
                dot.classList.add('dot-correct');
            } else {
                dot.classList.add('dot-wrong');
            }
        }
    });
    // scroll active dot into view
    const activeDot = document.querySelector('.q-dot.active');
    if (activeDot) activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

// ===== SHOW QUESTION =====
function showQuestion(idx) {
    currentIndex = idx;

    document.querySelectorAll('.question-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`q${idx}`);
    if (card) card.classList.add('active');

    // Update top bar
    currentQEl.textContent = toArabicNum(idx + 1);
    progressBar.style.width = `${((idx + 1) / totalQuestions) * 100}%`;

    // Nav buttons
    prevBtn.disabled = idx === 0;
    nextBtn.style.display = idx === totalQuestions - 1 ? 'none' : 'flex';
    submitContainer.classList.toggle('show', idx === totalQuestions - 1);

    // Highlight selected option
    if (idx < mcQuestions.length) {
        const btns = card.querySelectorAll('.option-btn');
        btns.forEach(b => b.classList.remove('selected'));
        if (userAnswers[idx] !== null) {
            btns[userAnswers[idx]].classList.add('selected');
        }
    }

    updateDots();
}

// ===== SELECT MCQ =====
function selectOption(qIdx, optIdx) {
    // If already answered, ignore
    if (questionLocked[qIdx]) return;

    userAnswers[qIdx] = optIdx;
    questionLocked[qIdx] = true;

    const card = document.getElementById(`q${qIdx}`);
    const btns = card.querySelectorAll('.option-btn');
    const correctIdx = mcQuestions[qIdx].answer;
    const isCorrect = optIdx === correctIdx;

    // Lock all buttons
    btns.forEach(b => {
        b.classList.add('locked');
        b.classList.remove('selected');
    });

    if (isCorrect) {
        // Correct! Green glow + pop
        btns[optIdx].classList.add('is-correct');
        // Dim the others
        btns.forEach((b, i) => { if (i !== optIdx) b.classList.add('is-dimmed'); });
        // Add feedback badge
        addFeedbackBadge(card, true, `Correct! ✓`);
    } else {
        // Wrong! Red shake on selected, reveal correct
        btns[optIdx].classList.add('is-wrong');
        btns[correctIdx].classList.add('reveal-correct');
        // Dim the rest
        btns.forEach((b, i) => { if (i !== optIdx && i !== correctIdx) b.classList.add('is-dimmed'); });
        // Add feedback badge
        addFeedbackBadge(card, false, `Wrong — The correct answer is: ${letters[correctIdx]}) ${mcQuestions[qIdx].opts[correctIdx]}`);
    }

    updateDots();

    // Auto-advance after delay so user can see feedback
    if (qIdx < totalQuestions - 1) {
        setTimeout(() => nextQuestion(), isCorrect ? 1000 : 2200);
    }
}

function addFeedbackBadge(card, isCorrect, text) {
    // Remove existing badge if any
    const existing = card.querySelector('.feedback-badge');
    if (existing) existing.remove();

    const badge = document.createElement('div');
    badge.className = `feedback-badge ${isCorrect ? 'correct-badge' : 'wrong-badge'}`;
    badge.innerHTML = `<span>${isCorrect ? '🎉' : '💡'}</span><span>${text}</span>`;
    card.appendChild(badge);
}

// ===== ESSAY =====
function saveEssay(i) {
    const val = document.getElementById(`essay${i}`).value.trim();
    userAnswers[mcQuestions.length + i] = val || null;
    updateDots();
}

// ===== NAVIGATION =====
function nextQuestion() {
    if (currentIndex < totalQuestions - 1) showQuestion(currentIndex + 1);
}
function prevQuestion() {
    if (currentIndex > 0) showQuestion(currentIndex - 1);
}
function goToQuestion(idx) { showQuestion(idx); }

// ===== TIMER =====
function startTimer() {
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerText.textContent = `${m}:${s}`;
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

// ===== SUBMIT =====
function submitExam() {
    stopTimer();
    examScreen.classList.remove('active');
    setTimeout(() => {
        resultsScreen.classList.add('active');
        calculateResults();
    }, 300);
}

// ===== RESULTS =====
function calculateResults() {
    let correct = 0, wrong = 0, skipped = 0;

    mcQuestions.forEach((mc, i) => {
        if (userAnswers[i] === null) skipped++;
        else if (userAnswers[i] === mc.answer) correct++;
        else wrong++;
    });

    // Essay = counted as answered/skipped
    essayQuestions.forEach((_, i) => {
        if (!userAnswers[mcQuestions.length + i]) skipped++;
    });

    const pct = Math.round((correct / mcQuestions.length) * 100);

    // Animate score
    document.getElementById('scoreNumber').textContent = `${pct}%`;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    document.getElementById('skipCount').textContent = skipped;

    // Score circle
    const fill = document.getElementById('scoreFill');
    const circumference = 339.292;
    setTimeout(() => {
        fill.style.strokeDashoffset = circumference - (circumference * pct / 100);
    }, 200);

    // Change color based on score
    if (pct >= 80) {
        fill.style.stroke = 'var(--green)';
        document.getElementById('scoreNumber').style.color = 'var(--green)';
        document.getElementById('resultsSubtitle').textContent = 'زۆر باشە! بەرەکەت بێت 🎉';
    } else if (pct >= 50) {
        fill.style.stroke = 'var(--yellow)';
        document.getElementById('scoreNumber').style.color = 'var(--yellow)';
        document.getElementById('resultsSubtitle').textContent = 'باشە، بەڵام زیاتر خوێندنەوە پێویستە 📚';
    } else {
        fill.style.stroke = 'var(--red)';
        document.getElementById('scoreNumber').style.color = 'var(--red)';
        document.getElementById('resultsSubtitle').textContent = 'پێویستە زیاتر خوێندنەوە بکەیت 💪';
    }

    // Build review
    buildReview();
}

function buildReview() {
    const reviewList = document.getElementById('reviewList');
    let html = '';

    // MCQ review
    mcQuestions.forEach((mc, i) => {
        const ans = userAnswers[i];
        let cls = 'skipped';
        if (ans !== null) cls = ans === mc.answer ? 'correct' : 'wrong';

        html += `<div class="review-card ${cls}" style="animation-delay: ${i * 0.05}s">
            <div class="review-q-num">Question ${i + 1}</div>
            <div class="review-q-text">${mc.q}</div>`;

        if (ans !== null && ans !== mc.answer) {
            html += `<div class="review-answer review-your">Your answer: ${letters[ans]}) ${mc.opts[ans]}</div>`;
        }
        if (ans === null) {
            html += `<div class="review-answer review-your" style="background:rgba(245,158,11,0.1);color:var(--yellow)">Not answered</div>`;
        }
        html += `<div class="review-answer review-correct-ans">Correct: ${letters[mc.answer]}) ${mc.opts[mc.answer]}</div>`;
        html += `</div>`;
    });

    // Essay review
    essayQuestions.forEach((eq, i) => {
        const idx = mcQuestions.length + i;
        const ans = userAnswers[idx];
        html += `<div class="review-card essay-review" style="animation-delay: ${(mcQuestions.length + i) * 0.05}s">
            <div class="review-q-num">Question ${idx + 1} — Essay</div>
            <div class="review-q-text">${eq.q}</div>
            <div class="review-essay-label">Your Answer:</div>
            <div class="review-essay-answer">${ans || '<em style="color:var(--text-muted)">Not answered</em>'}</div>
            <div class="review-model-answer">
                <div class="review-essay-label">✅ Model Answer:</div>
                <div class="review-essay-answer">${eq.model}</div>
            </div>
        </div>`;
    });

    reviewList.innerHTML = html;
}

// ===== RESTART =====
function restartExam() {
    resultsScreen.classList.remove('active');
    userAnswers = new Array(totalQuestions).fill(null);
    questionLocked = new Array(totalQuestions).fill(false);
    currentIndex = 0;
    seconds = 0;
    timerText.textContent = '00:00';
    setTimeout(() => {
        landingScreen.classList.add('active');
    }, 300);
}

// ===== KEYBOARD NAV =====
document.addEventListener('keydown', (e) => {
    if (!examScreen.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') nextQuestion();
    if (e.key === 'ArrowRight') prevQuestion();
    if (currentIndex < mcQuestions.length) {
        if (e.key === '1' || e.key === 'a') selectOption(currentIndex, 0);
        if (e.key === '2' || e.key === 'b') selectOption(currentIndex, 1);
        if (e.key === '3' || e.key === 'c') selectOption(currentIndex, 2);
        if (e.key === '4' || e.key === 'd') selectOption(currentIndex, 3);
    }
});

// ===== SWIPE SUPPORT (MOBILE) =====
let touchStartX = 0;
let touchEndX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', e => {
    if (!examScreen.classList.contains('active')) return;
    // Don't swipe if typing in textarea
    if (e.target.tagName === 'TEXTAREA') return;
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
        if (diff > 0) prevQuestion(); // swipe left (RTL: go prev)
        else nextQuestion(); // swipe right (RTL: go next)
    }
});
