# CODATHAN 2K27 - Secure Online Coding Competition & Examination Platform
### Ayya Nadar Janaki Ammal College (Autonomous), Sivakasi
**Department of Computer Applications (UG & PG)**

---

## 🌟 Executive Summary

This platform is the official, production-ready coding examination platform for **CODATHAN 2K27**. It integrates the official wizarding aesthetic and visual identity from the registration portal (`https://codathon2k27.vercel.app/`), while providing an impenetrable, audited examination environment for competing college teams.

---

## 🛡️ Core Security & Feature Highlights

1. **Official Registration Integration**
   - Seamlessly maps the exact schema from the official registration site (e.g., `CDT-001-ZX0L` - edvs's Team).
   - Validates payment verification status (`verified`), check-in status, and block lists.

2. **Atomic One-PC-Per-Team Session Locking**
   - Each three-member team is strictly limited to **ONE physical computer**.
   - Server-side atomic locks bind the session to hardware client fingerprints.
   - Any second laptop or PC attempting to sign in with the same credentials is automatically rejected with **HTTP 409 Conflict** and the mandatory alert:
     > *"ALREADY LOGGED IN! This team is already active on another computer. Only ONE PC or laptop is permitted per team. Please contact the event administrator if you need assistance."*
   - Heartbeat monitoring (every 20s) maintains the active lock, while allowing seamless browser refresh and tab crash recovery on the same device.

3. **Three-Member Face Verification**
   - All 3 registered team members must individually verify their identity using the single workstation webcam before accessing the dashboard or exam.
   - Authoritative biometric verification evaluates face count, liveness, image quality, and face similarity.
   - Multi-face detection flags multiple people standing in frame.
   - Administrators possess manual review override capabilities for technical false negatives.

4. **Advanced Dynamic Watermark Protection & Forensic Traceability**
   - In accordance with Section 23, a participant-specific diagonal repeating watermark is overlaid across the entire question content area:
     `CODATHAN 2K27 • TEAM-CDT-001-ZX0L • P-23MCA001 • TRK-8F29A`
   - Strict 4%–7% subtle opacity (default 0.055) guarantees **100% question text and sample I/O readability**.
   - **Zero leakage into Monaco Editor**: Stays strictly isolated to question display containers.
   - Admin Forensic Leak Investigation Tool: Allows organizers to enter any leaked photo tracking ID to instantly identify the workstation, team, and participant.

5. **Unlimited Question View & Animated Focus Editor Mode**
   - Participants can toggle the Question Panel unlimited times without penalty or warnings.
   - Features a unique animated gradient button and real-time view counter: `"Question Views: 5"`.
   - Monaco Editor dynamically expands to 100% width in Focus Editor Mode with zero reload, zero flickering, and complete preservation of cursor, code, and language.

6. **Monaco Editor with Safe Textarea Fallback**
   - Supports **C++ (GCC)** and **Java (OpenJDK)**.
   - Syntax highlighting, dark theme, font-size zoom, bracket pairing, line numbers, and starter template resets.
   - If Monaco CDN fails, a component-level basic textarea fallback immediately activates, ensuring the screen **NEVER turns white or blank**.

7. **Simultaneous Execution Queue (34 Teams)**
   - Engineered for 34 simultaneous teams running and compiling code concurrently.
   - Worker pool concurrency control (8 parallel execution slots) with fair per-team rate-limiting (1 run per 2s).
   - High-priority queue ordering ensures final submissions immediately bypass regular test runs.

8. **Server-Authoritative 120-Minute Timer**
   - Timer counts down strictly from the server-established start timestamp.
   - Browser refreshes, internet reconnects, or tab closures **NEVER reset or alter the 120-minute deadline**.

9. **Leader-Only Submission & Hidden Test-Case Evaluation**
   - Only the registered team leader is authorized to submit the final solution.
   - Backend evaluates source code against 5 confidential hidden test cases.
   - **Participant Screen Restriction (ABSOLUTE RULE)**:
     * Participants NEVER see marks, scores, percentages, passed counts, failed counts, or hidden test inputs.
     * Case A (All Passed): Displays `# TASK COMPLETED SUCCESSFULLY!`
     * Case B / C: Displays `# SUBMISSION RECEIVED SUCCESSFULLY!`

10. **Comprehensive Administrator Dashboard**
    - Executive command center for event organizers.
    - Real-time team monitoring, active PC locks, and one-click hardware lock resets.
    - Watermark opacity/font/angle controls and forensic leak tracking.
    - Private leaderboard with internal scores, pass/fail test breakdowns, submitted source code, and one-click CSV/Excel export.
    - System health monitoring tracking HTTP status codes (400-505) and active error boundaries.

---

## 🚀 Running the Application

### 1. Development Mode
```bash
npm run dev
```

### 2. Production Build & Start
```bash
npm run build
npm run start
```

### 3. Automated Master Test Suite
```bash
node scripts/test-all-systems.js
```

---

## 🔑 Default Competition Credentials

### Sample Registered Teams:
- **Team ID:** `CDT-001-ZX0L`
  - **Leader Email:** `softtech.admin.st.1@gmail.com`
  - **Passcode:** `codathon@2027`
- **Team ID:** `CDT-007-GOLD`
  - **Leader Email:** `hariprasath@anjac.edu`
  - **Passcode:** `codathon@2027`
- **Team ID:** `CDT-012-TITAN`
  - **Leader Email:** `suresh@nec.edu.in`
  - **Passcode:** `codathon@2027`

### Admin Portal:
- **URL:** `/admin/login`
- **Admin Email:** `admin@anjac.edu`
- **Master Security Key:** `anjac@admin2027`
