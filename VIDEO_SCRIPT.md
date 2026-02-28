# KARM AI — Video Presentation Script

### Theme 7: AI in Consumer Experiences
### Duration: ~5 minutes
### Team: AMD

---

## 🎬 SCENE 1 — THE HOOK (0:00 – 0:30)

**[VISUAL: Dark screen. A single glowing dot appears center screen — the Karm AI "K" logo animates in with its conic-gradient spinning ring, orbiting neural dots, and purple-teal glow. Lo-fi ambient music fades in.]**

**NARRATOR (V/O):**

> "You walk to the same canteen counter every day. You sit with the same three people. You attend the same CS workshops. You think you're experiencing college — but you're actually trapped inside a bubble you can't even see."

**[VISUAL: A tiny circle with repeating icons — food, friends, route — going in circles. The circle pulses like a cage.]**

> "What if AI could gently crack that cage open — without telling you who to meet, or what to think?"

**[VISUAL: The circle fractures. Light pours out. Title card fades in with gradient text:]**

### **KARM AI — Structured Serendipity Engine**

---

## 🎬 SCENE 2 — THE PROBLEM (0:30 – 1:15)

**[VISUAL: Split-screen — one student eating alone at Counter 2 again, another scrolling past events they'll never attend. A generic recommendation feed zooms in: "Based on what you already like…"]**

**NARRATOR (V/O):**

> "Every recommendation engine today does the same thing. It looks at what you already do — and gives you more of the same. Netflix shows more thrillers. Spotify plays the same genre. Your campus app suggests the same CS workshops."

**[VISUAL: A filter bubble visualized — the student's world shrinking into a smaller and smaller circle. Stats fade in:]**

- 🔴 **78% of students** eat at the same canteen counter daily
- 🔴 **65% never attend** an event outside their department
- 🔴 **2 out of 14 departments** — average student exploration

> "This is the **filter bubble problem**. On a college campus, it's devastating. Students graduate having explored only 15% of their campus. They never meet the architecture student whose spatial thinking could transform their robotics project. They never find the philosophy lecture that rewires how they think about AI ethics."

> "The real loss isn't missed events. It's missed **creative collisions** — the accidental meetings where different worlds combine into something new."

---

## 🎬 SCENE 3 — INTRODUCING KARM AI (1:15 – 1:55)

**[VISUAL: Phone screen — the Onboarding page loads. Animated concentric rings SVG pulses with "You" at center, "Your usual spots" in the mid-ring, "Unknown campus 82%" on the outer ring. Three stat cards slide in: Departments 2/14, Canteen 18%, Connections 0.]**

**NARRATOR (V/O):**

> "Karm AI is the first **anti-recommendation engine** for campus life. We call it a Structured Serendipity Engine. Instead of trapping you in what you already know, it calculates the **Minimum Effective Drift** — the smallest, lowest-friction change in your routine that creates the biggest expansion of your world."

**[VISUAL: The MED formula appears elegantly on a dark card:]**

$$MED(s) = \arg\min_d \|d\|_{\text{friction}} \quad \text{s.t.} \quad \Delta B(s,d) \geq \varepsilon$$

> "In plain English — what's the tiniest shift that makes the biggest difference?"

**[VISUAL: Onboarding Step 2 — two figure silhouettes with a dashed arc between them, "91% collision potential" badge glows. Concept text: "Not who to meet. Where to be."]**

> "And the key design principle: Karm AI never says 'meet this person.' It says 'be at Counter 7 at noon.' It creates the **conditions** for serendipity — without forcing anything."

---

## 🎬 SCENE 4 — LIVE DEMO WALKTHROUGH (1:55 – 3:40)

### 4A — Onboarding: The Mirror Moment (1:55 – 2:05)

**[SCREEN RECORDING: Walk through Onboarding — 3-step flow with animated transitions.]**

**NARRATOR (V/O):**

> "Setup takes 30 seconds. You choose your department, interests, skills, and — crucially — your accessibility needs. Wheelchair access, visual aids, hearing support, sensory preferences. And your daily drift budget — how much time can you spare for discovery?"

**[VISUAL: Onboarding Step 3 — chips for department, skills, interests, accessibility checkboxes, time budget selector, free-only toggle. "Start Drifting →" button glows.]**

---

### 4B — Home: Your Daily Drift (2:05 – 2:25)

**[SCREEN RECORDING: Home page loads. Personalized greeting "Good afternoon, Aryan" with bubble exploration pill (⬡ 23% explored 🔴). Daily drift card appears with spring animation.]**

**NARRATOR (V/O):**

> "Every day, you get one drift — one nudge towards something meaningfully different. This isn't a random 'try something new' — it's algorithmically chosen using an **ε-greedy multi-armed bandit**. 80% of the time, it exploits your best drift patterns. 20% of the time, it explores something completely new."

**[VISUAL: The Hero Drift Card — "Try Counter 7 instead of Counter 2 today — a Philosophy + Fine Arts student eats here regularly. 91% creative collision potential." The gentle note: "You don't have to talk to anyone. Just be somewhere different. 🌱"]**

> "Notice the language. No pressure. No obligations. Just possibility."

**[VISUAL: User taps "Accept" — floating "+1 Drift 🌱" animation rises and fades. Below: Micro Drift card ("5-min alternate route to Library passes Photography Exhibition") and Tonight's Collision Zone card ("Open Mic — Music Dept, 3 complementary profiles").]**

---

### 4C — Transparent Recommender: "Why This Drift?" — Criterion 1 (2:25 – 2:50)

**[SCREEN RECORDING: User taps "Why This?" on the drift card. DriftReasoningModal slides up.]**

**NARRATOR (V/O):**

> "This is **Criterion 1** — transparent recommendations. Every single nudge has a visible 'Why this?' breakdown."

**[VISUAL: Modal shows three sections:]**

> "**Section 1 — The Gap.** A timeline visualization shows: 'Your profile hasn't intersected with Design & Architecture in 47 days.' The algorithm detected the gap."

**[VISUAL: Animated gap timeline — start dot → line → "47-day gap 🔴" → end dot.]**

> "**Section 2 — The Collision Score.** Four animated progress bars count up in sequence: Complementary Skills 94%, Shared Hidden Interests 82%, Timing Alignment 90%, Gap Profile Match 86%. Overall collision potential: 91%."

**[VISUAL: Bars slide in with staggered delays, filling with gradient colors. Score counts up from 0 to 91%.]**

> "Behind this is a **complementarity scoring formula** — not similarity. We score how different you are from who you'd meet."

$$C(a,b) = \alpha \cdot \Phi + \beta \cdot \Theta + \gamma \cdot \Omega + \delta \cdot \Gamma$$

> "Skill complement, hidden domain threads, timing overlap, and gap-profile match. And the privacy note: 'Based on anonymised profiles. We never reveal who.'"

**[VISUAL: Section 3 — Scenario chips animate in: 💡 Creative collaboration, 🔄 Skill exchange, 🌐 New perspective. Reassurance: "Or nothing. That's fine too."]**

---

### 4D — KarmBot: AI Assistant — Criterion 2 (2:50 – 3:05)

**[SCREEN RECORDING: User taps the floating KarmBot FAB. Chat panel slides up. Custom animated "K" logo with orbiting neural dots and "AI" badge.]**

**NARRATOR (V/O):**

> "**Criterion 2** — conversational assistants. KarmBot is powered by multi-model AI through OpenRouter — Llama 3, Mistral, Qwen — with a **tightly scoped system prompt** that only knows campus discovery."

**[VISUAL: Quick prompt chips appear: "What's happening tonight?", "Find something free & short", "Help me break my bubble". User taps "What's happening tonight? I have 60 min and no budget."]**

> "It understands time, budget, and your bubble state. It won't Google things for you — it finds the event that breaks your bubble the most."

**[VISUAL: KarmBot responds with campus-specific recommendations. Typing indicator with animated dots.]**

---

### 4E — Campus Life Planner — Criterion 3 (3:05 – 3:20)

**[SCREEN RECORDING: Navigate to Planner page from Explore. Constraint chips visible.]**

**NARRATOR (V/O):**

> "**Criterion 3** — campus-life planner. This balances **time, cost, accessibility, and interests** to build an optimized schedule."

**[VISUAL: User selects 120-min budget, checks "Wheelchair" accessibility, picks interests (AI, Music, Photography), selects "Main Gate" starting location. Taps "🧠 Generate Optimized Plan".]**

> "The optimizer uses a **greedy knapsack algorithm** — scoring every event on interest match, accessibility, walking distance, cross-departmental value, and discovery potential. Inaccessible venues are automatically excluded."

**[VISUAL: Plan appears — summary stats (4 Activities, 110m Event Time, 24m Walking, Free, ✓ Accessible). SVG walking route map with gradient dots and zone labels. Timeline cards with "💡 Why this" explanations on every activity.]**

> "Every scheduled activity has transparent reasoning. And at the bottom — a full explanation of how the plan was built."

**[VISUAL: Transparency note: "Scored 13 activities on interest match, accessibility, walking distance from Main Gate, cross-departmental value, and discovery potential."]**

---

### 4F — Creator Studio — Criterion 4 (3:20 – 3:30)

**[SCREEN RECORDING: Navigate to Creator Studio. 6-step workflow.]**

**NARRATOR (V/O):**

> "**Criterion 4** — creator tools. Clubs and teams get a full 6-step studio: pick a template, enter event details, get **AI-generated copy suggestions**, choose brand colors, see a live poster preview, and publish directly as a Discovery Slot."

**[VISUAL: Quick montage — Workshop template selected, "AI Hackathon" entered, AI generates 3 copy variants, brand color swatch picked, live poster preview renders with gradient, "Publish as Discovery Slot" tapped. Toast: "🎉 Event published!"]**

---

### 4G — Bubble Dashboard & Feedback Loops — Criterion 5 (3:30 – 3:40)

**[SCREEN RECORDING: Navigate to Bubble Dashboard. SVG visualization renders.]**

**NARRATOR (V/O):**

> "**Criterion 5** — feedback loops that prevent filter bubbles. The Bubble Dashboard shows your campus footprint across all 14 departments — visited segments glow, unvisited ones pulse."

**[VISUAL: Radial segment chart (14 departments), bubble percentage counts up to 23%. Stats grid: Departments 2/14, Canteen Variety 18%, Event Diversity 12.5%, Connections 0. Filter Bubble Risk: HIGH 🔴.]**

> "Below: a **Diversity Score** combining department reach, canteen variety, event types, and connections. Plus a **filter bubble risk indicator** — High, Medium, or Low."

**[VISUAL: ε-greedy explanation card: "Karm AI uses ε-greedy exploration (20% random) + MAB to ensure you always discover new areas." Unexplored areas list with "Drift here →" buttons.]**

---

## 🎬 SCENE 5 — DRIFT HISTORY & SERENDIPITY FINGERPRINT (3:40 – 4:05)

**[SCREEN RECORDING: Navigate to Drift History. Visual timeline loads with staggered animations.]**

**NARRATOR (V/O):**

> "Every drift you accept becomes data. Meaningful encounters — 'Met a 3rd-year who needed a developer for their art-tech installation' — update your **Serendipity Fingerprint**, a 6-axis radar chart of **how** you discover."

**[VISUAL: Drift History timeline — meaningful drifts (✨ with outcome quotes), neutral, pending with "Log Outcome" form, skipped. FingerprintRadar SVG shows 6 axes: Cross-dept 20, Spontaneous 30, Social 25, Creative 15, Exploratory 20, Timing 40. Current shape (solid purple) vs Full Potential (dashed outline).]**

> "Six axes: cross-departmental reach, spontaneity, social openness, creative exposure, exploratory range, and timing flexibility. Built with **Bayesian-smoothed Laplace scoring** — it gets smarter with every drift."

$$F_k(s) = \frac{\sum_{d \in H^*_s} \mathbf{1}[d \in \text{cat}_k] \cdot o_d}{\sum_{d \in H_s} \mathbf{1}[d \in \text{cat}_k] + \lambda}$$

> "Your fingerprint evolves. The more you drift, the sharper the AI gets at knowing **how** to nudge you."

---

## 🎬 SCENE 6 — WHAT MAKES KARM AI DIFFERENT (4:05 – 4:30)

**[VISUAL: Clean comparison table animates in:]**

| Normal Engines | Karm AI |
|---|---|
| Maximize engagement | Maximize exploration |
| Show more of the same | Show the minimum-effective different |
| Black-box "for you" | Transparent "why this" on every card |
| Similarity scoring | **Complementarity scoring** — opposites collide |
| Static preferences | Living **Serendipity Fingerprint** that evolves |
| No friction awareness | MED — smallest friction, biggest impact |
| Content consumption | Real-world campus action |
| Ignores accessibility | Built-in wheelchair, visual, hearing, sensory filters |

**NARRATOR (V/O):**

> "Most AI recommenders score **similarity**. Karm AI scores **complementarity** — it finds people whose skills fill your gaps and whose perspectives challenge yours."

> "The Bubble Percentage uses a **product-complement function** — mathematically, neglecting even one dimension of campus life drags your entire exploration score down."

$$B(s,t) = 1 - \prod_{k=1}^{K}\left(1 - \frac{|V_k|}{|U_k|}\right)^{w_k}$$

> "And accessibility isn't an afterthought. It's built into onboarding, into the planner, into every drift. Because breaking your bubble shouldn't require breaking your body."

---

## 🎬 SCENE 7 — TECH STACK (4:30 – 4:40)

**[VISUAL: Clean architecture diagram:]**

```
┌───────────────────────────────────────────────────┐
│  Frontend: React + Framer Motion + Zustand        │
│  Glassmorphism UI / Custom SVG Data Viz / PWA     │
│  Pages: Home, Bubble, Explore, Planner, Creator,  │
│         Drift History, Profile, Onboarding        │
├───────────────────────────────────────────────────┤
│  Backend: FastAPI + Python                        │
│  NudgeEngine ─── ε-Greedy MAB (ε=0.2)            │
│  CollisionScorer ─── Complementarity C(a,b)       │
│  FingerprintBuilder ─── Bayesian 6-Axis Update    │
│  AttractorMapper ─── Product-Complement B(s,t)     │
├───────────────────────────────────────────────────┤
│  AI: OpenRouter Multi-Model Fallback              │
│  Llama 3.3 → Mistral → Qwen → Free fallback      │
│  Scoped system prompt — campus discovery only     │
└───────────────────────────────────────────────────┘
```

**NARRATOR (V/O):**

> "React with Framer Motion for fluid animations, Zustand for state. FastAPI backend with four core algorithms. AI powered by OpenRouter with multi-model fallback — if one model is down, the next takes over. All through a tightly constrained system prompt."

---

## 🎬 SCENE 8 — THE CLOSE (4:40 – 5:00)

**[VISUAL: The student from Scene 2 — but now at a different counter, talking to someone from Architecture. The Bubble Dashboard shows their circle has expanded from 23% to 41%. The Serendipity Fingerprint has grown sharper.]**

**NARRATOR (V/O):**

> "College is four years. But most students experience only 15% of it. Karm AI doesn't tell you what to consume — it tells you where to **drift**. Because the best version of your campus life isn't the one you planned. It's the one you discovered."

**[VISUAL: Karm AI animated K logo pulses with gradient glow. Tagline fades in:]**

### **KARM AI — Break Your Bubble. Find Your Drift.**

**[VISUAL: GitHub link, team name (AMD), fade to black.]**

---

## 📋 SCREEN RECORDING CHECKLIST

Capture these screens in this exact order:

| # | Screen | What to Show | Duration |
|---|--------|-------------|----------|
| 1 | **Onboarding** | Animated rings, 3 stats, concept slide, form with accessibility inputs | 8s |
| 2 | **Home** | Greeting, bubble pill, Hero Drift Card with 91% score, accept animation | 12s |
| 3 | **Why This? Modal** | Tap "Why This?" → gap timeline, 4 animated bars, scenario chips | 15s |
| 4 | **KarmBot** | Open FAB, quick prompt, type question, get AI response | 10s |
| 5 | **Planner** | Set constraints (time, access, interests), tap Generate, show timeline + route map | 12s |
| 6 | **Creator Studio** | Quick: template → details → AI copy → brand color → poster → publish | 8s |
| 7 | **Bubble Dashboard** | SVG bubble viz, stats grid, diversity score, filter bubble risk, unexplored areas | 8s |
| 8 | **Drift History** | Timeline, meaningful drift outcome, Log Outcome form, Fingerprint Radar | 8s |
| 9 | **Profile** | Drift score, skills/interests, edit preferences (accessibility), mini fingerprint | 5s |
| 10 | **Bottom Nav** | Navigate between tabs — show sliding pill animation, haptic | 4s |

---

## 🎙️ SPEAKER NOTES

- **Tone:** Confident, warm, slightly idealistic. Passionate about the problem, not salesy.
- **Pace:** Moderate. Pause after the hook. Let animations breathe. Don't rush the formula slides.
- **Music:** Lo-fi ambient electronic. No lyrics. Build energy at Scene 6 comparison, soften at close.
- **Math:** Show formulas briefly — they add credibility. Don't read them aloud, narrate in plain English.
- **Length target:** 4:45–5:00. If running long, trim Scene 7 (tech stack) — judges can ask in Q&A.
- **Key selling points to emphasize:**
  1. Anti-recommendation — complementarity, not similarity
  2. Full transparency — every nudge has visible reasoning
  3. Accessibility-first — not an afterthought
  4. No pressure — "be somewhere different, that's all"
  5. Living fingerprint — the AI evolves with you

---

## 📊 CRITERIA MAPPING

| Criterion | Where it Lives | What to Show |
|-----------|---------------|-------------|
| **1. Transparent Recommenders** | Home → "Why This?" modal, Explore → match scores, Planner → "Why this" per activity | DriftReasoningModal with animated bars |
| **2. Conversational Assistant** | KarmBot FAB + chat panel | Budget/time-aware query → contextual response |
| **3. Campus-Life Planner** | /planner page + Explore preview | Constraint selection → optimized schedule + route map |
| **4. Creator Tools** | /create — Creator Studio | 6-step flow: template → AI copy → brand → publish |
| **5. Feedback Loops** | Bubble Dashboard + Drift History + Fingerprint | Bubble %, Diversity Score, Filter Bubble Risk, ε-greedy, Radar |
