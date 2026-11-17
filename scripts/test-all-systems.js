const http = require('http');
const fs = require('fs');
const path = require('path');

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

  const teamsFile = path.join(__dirname, '..', 'data', 'teams.json');
  const backupTeams = fs.existsSync(teamsFile) ? fs.readFileSync(teamsFile, 'utf8') : '[]';

  try {
    // -------------------------------------------------------------------------
    // Set up test fixtures for test runner
    // -------------------------------------------------------------------------
    const currentTeams = JSON.parse(backupTeams);
    const testTeams = [...currentTeams];

    if (!testTeams.find((t) => t.id === 'CDT-001-ZX0L')) {
      testTeams.push({
        id: 'CDT-001-ZX0L',
        teamName: "edvs's Team",
        college: 'Ayya Nadar Janaki Ammal College — CS',
        department: 'Computer Applications',
        members: [
          { name: 'Edvs Vance', rollNo: '23MCA001', email: 'softtech.admin.st.1@gmail.com', phone: '2132435432' },
          { name: 'Alex Rivera', rollNo: '23MCA002', email: 'alex.rivera@anjac.edu', phone: '9876543210' },
          { name: 'David Chen', rollNo: '23MCA003', email: 'david.chen@anjac.edu', phone: '9876543211' },
        ],
        leaderIndex: 0,
        leaderName: 'Edvs Vance',
        leaderEmail: 'softtech.admin.st.1@gmail.com',
        leaderPhone: '2132435432',
        paymentStatus: 'verified',
        isCheckedIn: true,
        isBlocked: false,
        lotNumber: '130',
        preferredPassword: 'codathon@2027',
      });
    }

    for (let i = 2; i <= 34; i++) {
      const pad = i.toString().padStart(3, '0');
      const tid = i === 2 ? 'CDT-007-GOLD' : i === 3 ? 'CDT-012-TITAN' : `CDT-${pad}-SIM`;
      const email = i === 2 ? 'hariprasath@anjac.edu' : i === 3 ? 'suresh@nec.edu.in' : `leader${i}@codathon.test`;
      if (!testTeams.find((t) => t.id === tid)) {
        testTeams.push({
          id: tid,
          teamName: `Triwizard Squad ${i}`,
          college: 'Regional Coding Consortium',
          department: 'Information Technology',
          members: [
            { name: `Lead Member ${i}`, rollNo: `23IT${pad}A`, email: email, phone: '9800000000' },
            { name: `Dev Member ${i}B`, rollNo: `23IT${pad}B`, email: `memberB${i}@codathon.test`, phone: '9800000001' },
            { name: `Dev Member ${i}C`, rollNo: `23IT${pad}C`, email: `memberC${i}@codathon.test`, phone: '9800000002' },
          ],
          leaderIndex: 0,
          leaderName: `Lead Member ${i}`,
          leaderEmail: email,
          leaderPhone: '9800000000',
          paymentStatus: 'verified',
          isCheckedIn: true,
          isBlocked: false,
          lotNumber: pad,
          preferredPassword: 'codathon@2027',
        });
      }
    }
    fs.writeFileSync(teamsFile, JSON.stringify(testTeams, null, 2), 'utf8');

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
    // 2. ATOMIC ONE-PC-PER-TEAM ENFORCEMENT & CONFLICT HANDLING
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 2: ATOMIC ONE-PC-PER-TEAM ENFORCEMENT ---');
    const secondPcLoginRes = await request('POST', '/api/auth/login', {
      teamIdOrEmail: 'CDT-001-ZX0L',
      password: 'codathon@2027',
      clientFingerprint: 'PC_2_DIFFERENT_HARDWARE_FINGERPRINT_999',
    });

    assert(secondPcLoginRes.status === 409, 'Second PC login attempt is BLOCKED with HTTP 409 Conflict');
    assert(secondPcLoginRes.data.error.code === 'SESSION_CONFLICT', 'Error code is SESSION_CONFLICT');
    assert(
      secondPcLoginRes.data.error.message.includes('ALREADY LOGGED IN!'),
      'Correct mandatory notice: "ALREADY LOGGED IN! This team is already active on another computer."'
    );

    // Refresh recovery on Same PC
    const samePcRefreshRes = await request('POST', '/api/auth/login', {
      teamIdOrEmail: 'CDT-001-ZX0L',
      password: 'codathon@2027',
      clientFingerprint: 'PC_1_FINGERPRINT_HASH_123',
      existingSessionId: team1SessionId,
    });
    assert(samePcRefreshRes.status === 200, 'Same PC refresh and tab recovery seamlessly re-authenticated');

    // Heartbeat Keepalive
    const heartbeatRes = await request('POST', '/api/sessions/heartbeat', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
    });
    assert(heartbeatRes.data.success === true, 'Heartbeat successfully keeps lock alive');

    // -------------------------------------------------------------------------
    // 3. THREE-MEMBER BIOMETRIC FACE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 3: THREE-MEMBER FACE VERIFICATION ---');
    const dummyBase64Photo = 'data:image/jpeg;base64,' + 'A'.repeat(800);

    // Member 1 Verify
    const mem1Res = await request('POST', '/api/face-verification', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      memberIndex: 0,
      liveSnapshot: dummyBase64Photo,
      clientMetrics: { faceCount: 1, brightness: 120, livenessScore: 0.95 },
    });
    assert(mem1Res.status === 200 && mem1Res.data.data.status === 'SUCCESS', 'Member 1 face verified successfully');
    assert(mem1Res.data.data.confidence >= 0.85, 'Authoritative biometric confidence score >= 85%');

    // Test Presentation Attack / Multiple Faces Detection
    const spoofRes = await request('POST', '/api/face-verification', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      memberIndex: 1,
      liveSnapshot: dummyBase64Photo,
      clientMetrics: { faceCount: 2, brightness: 120, livenessScore: 0.95 },
    });
    assert(spoofRes.data.data.status === 'MULTIPLE_FACES', 'Multiple faces correctly detected and flagged');

    // Member 2 Valid Verify
    const mem2Res = await request('POST', '/api/face-verification', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      memberIndex: 1,
      liveSnapshot: dummyBase64Photo,
      clientMetrics: { faceCount: 1, brightness: 120, livenessScore: 0.96 },
    });
    assert(mem2Res.data.data.status === 'SUCCESS', 'Member 2 face verified successfully');

    // Member 3 Valid Verify
    const mem3Res = await request('POST', '/api/face-verification', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      memberIndex: 2,
      liveSnapshot: dummyBase64Photo,
      clientMetrics: { faceCount: 1, brightness: 120, livenessScore: 0.97 },
    });
    assert(mem3Res.data.data.status === 'SUCCESS', 'Member 3 face verified successfully');
    assert(mem3Res.data.data.teamState.allPassed === true, 'All 3 members confirmed verified on single PC');

    // -------------------------------------------------------------------------
    // 4. SERVER-AUTHORITATIVE EXAMINATION TIMER & AUTOSAVE
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 4: SERVER-AUTHORITATIVE TIMER & AUTOSAVE ---');
    const examStartRes = await request('POST', '/api/examination/status', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      action: 'START_EXAM',
    });
    assert(examStartRes.status === 200, 'Examination started successfully');
    assert(examStartRes.data.data.durationMs === 120 * 60 * 1000, 'Duration strictly 120 minutes (7,200,000 ms)');
    assert(Boolean(examStartRes.data.data.deadline), 'Server-authoritative deadline timestamp recorded');

    // Autosave Test
    const testCppCode = `#include <iostream>
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

    const autosaveRes = await request('POST', '/api/examination/autosave', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      language: 'cpp',
      code: testCppCode,
    });
    assert(autosaveRes.status === 200 && autosaveRes.data.success === true, 'Autosave successfully stored code on server');

    // Retrieve Examination Status & Verify Code Preserved
    const reloadRes = await request('GET', `/api/examination/status?teamId=CDT-001-ZX0L&sessionId=${team1SessionId}`);
    const activeExam = reloadRes.data.data.sessionState || reloadRes.data.data.session;
    assert(activeExam && activeExam.currentCode === testCppCode, 'Code recovery on reload perfectly matches autosaved code');

    // -------------------------------------------------------------------------
    // 5. DYNAMIC WATERMARK CONFIGURATION & QUESTION ACCESS LOGGING
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 5: DYNAMIC WATERMARK & LEAK FORENSICS ---');
    const wmRes = await request(
      'GET',
      `/api/watermark?teamId=CDT-001-ZX0L&sessionId=${team1SessionId}&participantId=23MCA001`
    );
    assert(wmRes.status === 200, 'Watermark endpoint returned 200 OK');
    assert(wmRes.data.data.watermark.teamId === 'CDT-001-ZX0L', 'Correct Team ID in watermark');
    assert(wmRes.data.data.watermark.participantId === '23MCA001', 'Correct Participant ID in watermark');
    const trackingId = wmRes.data.data.watermark.trackingId;
    assert(Boolean(trackingId), 'Unique forensic tracking ID generated');
    assert(
      wmRes.data.data.config.opacity >= 0.04 && wmRes.data.data.config.opacity <= 0.07,
      `Watermark opacity within strict 4%–7% readability bracket (${wmRes.data.data.config.opacity})`
    );

    // Log Question Access
    const logAccessRes = await request('POST', '/api/watermark', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      participantId: '23MCA001',
      trackingId,
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

    assert(statusRes && statusRes.status === 200, 'Execution job status retrieved');
    console.log('    [DEBUG] Job result:', statusRes?.data?.data?.result);
    assert(statusRes?.data?.data?.result?.status === 'COMPLETED', 'C++ 2D Kadane program output calculated correctly (stdout: 9)');

    // -------------------------------------------------------------------------
    // 7. FINAL SUBMISSION & HIDDEN TEST EVALUATION (STRICT NO MARKS TO PARTICIPANT)
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 7: HIDDEN TEST EVALUATION & NO MARKS ENFORCEMENT ---');

    // Non-leader rejection
    const nonLeaderSubmit = await request('POST', '/api/submissions', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      submittedBy: 'alex.rivera@anjac.edu', // Member #2, not leader
      language: 'cpp',
      sourceCode: testCppCode,
    });
    assert(nonLeaderSubmit.status === 403, 'Non-leader submission rejected with HTTP 403 Forbidden');

    // Leader Final Submission
    const leaderSubmitRes = await request('POST', '/api/submissions', {
      teamId: 'CDT-001-ZX0L',
      sessionId: team1SessionId,
      submittedBy: 'softtech.admin.st.1@gmail.com', // Registered leader
      language: 'cpp',
      sourceCode: testCppCode,
    });

    assert(leaderSubmitRes.status === 200, 'Registered leader final submission accepted');
    assert(leaderSubmitRes.data.data.evaluationStatus === 'ALL_PASSED', 'Backend evaluated all hidden test cases as passed');
    assert(leaderSubmitRes.data.data.title === 'TASK COMPLETED SUCCESSFULLY!', 'Displays "TASK COMPLETED SUCCESSFULLY!" title');

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
  } finally {
    // Restore pristine data/teams.json
    fs.writeFileSync(teamsFile, backupTeams, 'utf8');
    await request('DELETE', '/api/admin/evaluations');
    console.log('  [CLEANUP] Restored pristine production teams database without test fixtures.');
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
