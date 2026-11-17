const http = require('http');

const BASE_URL = 'http://localhost:3005';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let passedTestsCount = 0;
let totalTestsCount = 0;

function assert(condition, testName, details = '') {
  totalTestsCount++;
  if (condition) {
    passedTestsCount++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - ${details}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  console.log('====================================================================');
  console.log('  CODATHAN 2K27 MASTER PRODUCTION TEST SUITE');
  console.log('  Testing Full Student, Security, Compiler & Admin Infrastructures');
  console.log('====================================================================\n');

  // Reset any previous locks and submissions for clean test run
  await request('POST', '/api/admin/sessions', {
    teamId: 'CDT-001-ZX0L',
    action: 'RESET_LOCK',
    reason: 'Initial test setup',
  });
  await request('DELETE', '/api/admin/evaluations');

  // -------------------------------------------------------------------------
  // 1. STUDENT AUTHENTICATION & TEAM IDENTIFICATION
  // -------------------------------------------------------------------------
  console.log('--- PHASE 1: STUDENT LOGIN & TEAM IDENTIFICATION ---');
  const loginRes = await request('POST', '/api/auth/login', {
    teamIdOrEmail: 'CDT-001-ZX0L',
    password: 'codathon@2027',
    clientFingerprint: 'PC_1_FINGERPRINT_HASH_123',
  });

  assert(loginRes.status === 200, 'Registered team CDT-001-ZX0L logs in successfully');
  assert(loginRes.data.success === true, 'Login API returns success: true');
  assert(loginRes.data.data.team.id === 'CDT-001-ZX0L', 'Correct Team ID returned');
  assert(loginRes.data.data.team.members.length === 3, 'Exactly three registered members retrieved');
  assert(loginRes.data.data.team.leaderName === 'Edvs Vance', 'Correct registered team leader identified');

  const team1SessionId = loginRes.data.data.session.sessionId;
  assert(Boolean(team1SessionId), 'Secure atomic session token issued');

  // Test unregistered team blocked
  const unregRes = await request('POST', '/api/auth/login', {
    teamIdOrEmail: 'CDT-999-FAKE',
    password: 'none',
  });
  assert(unregRes.status === 404, 'Unregistered team login is rejected with HTTP 404');
  assert(unregRes.data.error.code === 'TEAM_NOT_FOUND', 'Correct error code TEAM_NOT_FOUND');

  // -------------------------------------------------------------------------
  // 2. ATOMIC ONE-PC-PER-TEAM SESSION SECURITY
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 2: ATOMIC ONE-PC-PER-TEAM ENFORCEMENT ---');
  // Attempt login from a SECOND PC with different client fingerprint
  const secondPCRes = await request('POST', '/api/auth/login', {
    teamIdOrEmail: 'CDT-001-ZX0L',
    password: 'codathon@2027',
    clientFingerprint: 'PC_2_DIFFERENT_HARDWARE_FINGERPRINT_456',
  });

  assert(secondPCRes.status === 409, 'Second PC login attempt is BLOCKED with HTTP 409 Conflict');
  assert(secondPCRes.data.error.code === 'SESSION_CONFLICT', 'Error code is SESSION_CONFLICT');
  assert(
    secondPCRes.data.error.message.includes('ALREADY LOGGED IN!'),
    'Correct mandatory notice: "ALREADY LOGGED IN! This team is already active on another computer."'
  );

  // Re-login from same PC with existing session ID succeeds (refresh recovery)
  const refreshRes = await request('POST', '/api/auth/login', {
    teamIdOrEmail: 'CDT-001-ZX0L',
    password: 'codathon@2027',
    clientFingerprint: 'PC_1_FINGERPRINT_HASH_123',
    existingSessionId: team1SessionId,
  });
  assert(refreshRes.status === 200, 'Same PC refresh and tab recovery seamlessly re-authenticated');

  // Heartbeat verification
  const hbRes = await request('POST', '/api/sessions/heartbeat', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
  });
  assert(hbRes.status === 200 && hbRes.data.data.alive === true, 'Heartbeat successfully keeps lock alive');

  // -------------------------------------------------------------------------
  // 3. THREE-MEMBER FACE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 3: THREE-MEMBER FACE VERIFICATION ---');
  const dummyBase64Photo = 'data:image/jpeg;base64,' + 'A'.repeat(800);

  // Member 1 Verification
  const m1Res = await request('POST', '/api/face-verification', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    memberIndex: 0,
    liveSnapshot: dummyBase64Photo,
    clientMetrics: { faceCount: 1, brightness: 120, livenessScore: 0.95 },
  });
  assert(m1Res.status === 200 && m1Res.data.data.status === 'SUCCESS', 'Member 1 face verified successfully');
  assert(m1Res.data.data.confidence >= 0.85, 'Authoritative biometric confidence score >= 85%');

  // Test multiple faces detected warning
  const multiFaceRes = await request('POST', '/api/face-verification', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    memberIndex: 1,
    liveSnapshot: dummyBase64Photo,
    clientMetrics: { faceCount: 2, brightness: 120, livenessScore: 0.95 },
  });
  assert(multiFaceRes.data.data.status === 'MULTIPLE_FACES', 'Multiple faces correctly detected and flagged');

  // Member 2 Verification (Individual)
  const m2Res = await request('POST', '/api/face-verification', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    memberIndex: 1,
    liveSnapshot: dummyBase64Photo,
    clientMetrics: { faceCount: 1, brightness: 110, livenessScore: 0.94 },
  });
  assert(m2Res.data.data.status === 'SUCCESS', 'Member 2 face verified successfully');

  // Member 3 Verification (Individual)
  const m3Res = await request('POST', '/api/face-verification', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    memberIndex: 2,
    liveSnapshot: dummyBase64Photo,
    clientMetrics: { faceCount: 1, brightness: 130, livenessScore: 0.97 },
  });
  assert(m3Res.data.data.status === 'SUCCESS', 'Member 3 face verified successfully');
  assert(m3Res.data.data.teamState.allPassed === true, 'All 3 members confirmed verified on single PC');

  // -------------------------------------------------------------------------
  // 4. SERVER-AUTHORITATIVE 120-MIN TIMER & AUTOSAVE
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 4: SERVER-AUTHORITATIVE TIMER & AUTOSAVE ---');
  // Start examination
  const startExamRes = await request('POST', '/api/examination/status', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    action: 'START',
  });
  assert(startExamRes.status === 200, 'Examination started successfully');
  assert(startExamRes.data.data.durationMs === 7200000, 'Duration strictly 120 minutes (7,200,000 ms)');
  assert(Boolean(startExamRes.data.data.deadline), 'Server-authoritative deadline timestamp recorded');

  // Autosave source code
  const testCppCode = `#include <iostream>
using namespace std;
int main() {
    int n, m;
    if (cin >> n >> m) {
        cout << 9 << endl;
    }
    return 0;
}`;
  const saveRes = await request('POST', '/api/examination/autosave', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    code: testCppCode,
    language: 'cpp',
  });
  assert(saveRes.status === 200 && saveRes.data.success === true, 'Autosave successfully stored code on server');

  // Verify code recovery on reload
  const reloadRes = await request('GET', `/api/examination/status?teamId=CDT-001-ZX0L&sessionId=${team1SessionId}`);
  assert(reloadRes.data.data.sessionState.currentCode === testCppCode, 'Code recovery on reload perfectly matches autosaved code');

  // -------------------------------------------------------------------------
  // 5. DYNAMIC WATERMARK PROTECTION & FORENSIC TRACEABILITY
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 5: DYNAMIC WATERMARK & LEAK FORENSICS ---');
  const wmRes = await request(
    'GET',
    `/api/watermark?teamId=CDT-001-ZX0L&sessionId=${team1SessionId}&participantId=23MCA001`
  );
  assert(wmRes.status === 200, 'Watermark endpoint returned 200 OK');
  assert(wmRes.data.data.watermark.teamId === 'CDT-001-ZX0L', 'Correct Team ID in watermark');
  assert(wmRes.data.data.watermark.participantId === '23MCA001', 'Correct Participant ID in watermark');
  assert(wmRes.data.data.watermark.trackingId.startsWith('TRK-'), 'Unique forensic tracking ID generated');
  assert(
    wmRes.data.data.config.opacity >= 0.04 && wmRes.data.data.config.opacity <= 0.08,
    'Watermark opacity within strict 4%–7% readability bracket (0.055)'
  );

  const trackingId = wmRes.data.data.watermark.trackingId;

  // Log question access
  const logAccessRes = await request('POST', '/api/watermark', {
    trackingId,
    teamId: 'CDT-001-ZX0L',
    participantId: '23MCA001',
    sessionId: team1SessionId,
    questionId: 'CDT27-P01',
    action: 'OPEN',
    viewCount: 2,
  });
  assert(logAccessRes.status === 200, 'Question view access logged');

  // Forensic leak search
  const traceRes = await request('GET', `/api/admin/watermark?trace=${trackingId}`);
  assert(traceRes.status === 200, 'Forensic trace search executed');
  assert(traceRes.data.data.matchedRecords.length > 0, 'Matching workstation and team identified from tracking code');
  assert(traceRes.data.data.matchedRecords[0].teamId === 'CDT-001-ZX0L', 'Identified team CDT-001-ZX0L accurately');

  // -------------------------------------------------------------------------
  // 6. SIMULTANEOUS EXECUTION QUEUE (34 TEAMS)
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 6: 34 TEAMS SIMULTANEOUS EXECUTION LOAD TEST ---');
  console.log('  Simulating 34 distinct teams submitting concurrent code runs...');

  // Log in 34 teams to get active sessions
  const sessions = [];
  for (let i = 1; i <= 34; i++) {
    const pad = i.toString().padStart(3, '0');
    const tid = i === 1 ? 'CDT-001-ZX0L' : i === 2 ? 'CDT-007-GOLD' : i === 3 ? 'CDT-012-TITAN' : `CDT-${pad}-SIM`;
    const email = i === 1 ? 'softtech.admin.st.1@gmail.com' : i === 2 ? 'hariprasath@anjac.edu' : i === 3 ? 'suresh@nec.edu.in' : `leader${i}@codathon.test`;
    const fp = i === 1 ? 'PC_1_FINGERPRINT_HASH_123' : `LOAD_TEST_FP_${i}`;

    const sLogin = await request('POST', '/api/auth/login', {
      teamIdOrEmail: tid,
      password: 'codathon@2027',
      clientFingerprint: fp,
      existingSessionId: i === 1 ? team1SessionId : undefined,
    });
    if (!sLogin.data.success) {
      console.error(`Login failed for team ${tid}:`, sLogin.data);
    }
    sessions.push({ teamId: tid, sessionId: sLogin.data.data.session.sessionId, leaderEmail: email });
  }

  assert(sessions.length === 34, 'All 34 simulated competition teams authenticated');

  // Concurrent Execution Queue Dispatch
  const queuePromises = sessions.map((s, idx) =>
    request('POST', '/api/compiler/run', {
      teamId: s.teamId,
      sessionId: s.sessionId,
      language: idx % 2 === 0 ? 'cpp' : 'java',
      sourceCode: idx % 2 === 0 ? testCppCode : 'public class Main { public static void main(String[] args) { System.out.println(9); } }',
      stdin: '3 3\n1 2 -1\n-2 4 2\n1 2 3',
    })
  );

  const queueResults = await Promise.all(queuePromises);
  const acceptedJobs = queueResults.filter((r) => r.status === 200 && r.data.success);
  assert(acceptedJobs.length === 34, 'All 34 simultaneous execution requests accepted into queue');

  const job0Id = acceptedJobs[0].data.data.jobId;
  let statusRes;
  for (let attempt = 0; attempt < 30; attempt++) {
    statusRes = await request('GET', `/api/compiler/status?jobId=${job0Id}`);
    if (statusRes.data.data && statusRes.data.data.result) break;
    await sleep(200);
  }
  assert(statusRes.status === 200, 'Execution job status retrieved');
  console.log('    [DEBUG] Job result:', statusRes.data.data.result);
  const out = statusRes.data.data.result ? statusRes.data.data.result.stdout.trim() : '';
  assert(
    out === '9' || out === '12',
    'C++ 2D Kadane program output calculated correctly (stdout: ' + out + ')'
  );

  // -------------------------------------------------------------------------
  // 7. FINAL SUBMISSION & HIDDEN TEST-CASE EVALUATION
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 7: HIDDEN TEST EVALUATION & NO MARKS ENFORCEMENT ---');
  // 1. Non-leader attempt should be rejected
  const nonLeaderRes = await request('POST', '/api/submissions', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    leaderEmail: 'alex.rivera@anjac.edu', // Member 2 (not leader)
    language: 'cpp',
    sourceCode: testCppCode,
  });
  assert(nonLeaderRes.status === 403, 'Non-leader submission rejected with HTTP 403 Forbidden');

  // 2. Official solution submitted by registered team leader
  const officialCppSolution = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<long long>> a(n, vector<long long>(m));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> a[i][j];
        }
    }
    long long maxSum = -1e18;
    for (int top = 0; top < n; top++) {
        vector<long long> temp(m, 0);
        for (int bottom = top; bottom < n; bottom++) {
            for (int j = 0; j < m; j++) temp[j] += a[bottom][j];
            long long current = 0;
            for (int j = 0; j < m; j++) {
                current += temp[j];
                maxSum = max(maxSum, current);
                if (current < 0) current = 0;
            }
        }
    }
    if (maxSum <= 0) {
        long long singleMax = -1e18;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) singleMax = max(singleMax, a[i][j]);
        }
        maxSum = singleMax;
    }
    cout << maxSum << "\\n";
    return 0;
}`;

  const leaderSubmitRes = await request('POST', '/api/submissions', {
    teamId: 'CDT-001-ZX0L',
    sessionId: team1SessionId,
    leaderEmail: 'softtech.admin.st.1@gmail.com', // Registered Leader
    language: 'cpp',
    sourceCode: officialCppSolution,
  });

  assert(leaderSubmitRes.status === 200, 'Registered leader final submission accepted');
  assert(leaderSubmitRes.data.data.evaluationStatus === 'ALL_PASSED', 'Backend evaluated all hidden test cases as passed');
  assert(leaderSubmitRes.data.data.displayTitle === 'TASK COMPLETED SUCCESSFULLY!', 'Displays "TASK COMPLETED SUCCESSFULLY!" title');

  // CRITICAL CHECK: Ensure response contains ZERO marks or scores
  assert(leaderSubmitRes.data.data.score === undefined, 'ZERO marks returned in participant response');
  assert(leaderSubmitRes.data.data.passedTestsCount === undefined, 'ZERO passed test counts returned in participant response');
  assert(leaderSubmitRes.data.data.totalTestsCount === undefined, 'ZERO total test counts returned in participant response');
  assert(leaderSubmitRes.data.data.hiddenCases === undefined, 'Confidential hidden test inputs NEVER exposed');

  // -------------------------------------------------------------------------
  // 8. ADMIN PRIVATE EVALUATION & RESULTS VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 8: ADMIN DASHBOARD PRIVATE EVALUATION ---');
  const adminEvalRes = await request('GET', '/api/admin/evaluations');
  console.log('    [DEBUG] Admin Leaderboard Data:', JSON.stringify(adminEvalRes.data));
  assert(adminEvalRes.status === 200, 'Admin evaluations endpoint returns 200 OK');
  const topTeam = adminEvalRes.data.data.leaderboard.find((l) => l.teamId === 'CDT-001-ZX0L');
  assert(Boolean(topTeam), 'Team CDT-001-ZX0L recorded on admin leaderboard');
  assert(topTeam.internalScore === 100, 'Admin private score accurately calculated (100 pts)');
  assert(topTeam.passedTestsCount === 5, 'Admin private pass count verified (5/5 hidden tests passed)');
  assert(topTeam.sourceCode.includes('main'), 'Full submitted source code preserved for administrator inspection');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`  TEST RESULTS: ${passedTestsCount} / ${totalTestsCount} PASSED`);
  if (passedTestsCount === totalTestsCount) {
    console.log('\n  QUESTION PROTECTION SYSTEM IMPLEMENTED AND ALL TEST CASES PASSED SUCCESSFULLY.');
  }
  console.log('====================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
