import { ExamSessionState, QuestionData } from '@/types/examination';

// The Official CODATHAN 2K27 Coding Competition Problem
export const OFFICIAL_QUESTION: QuestionData = {
  id: 'CDT27-P01',
  title: 'The Arcane Matrix Transformation',
  category: 'Algorithms & Data Structures',
  difficulty: 'Hard (Grand Finals)',
  timeLimitSec: 2,
  memoryLimitMb: 256,
  description: `In the ancient chambers of Sivakasi, the Grand Archmage has encoded an encrypted grid of magical energy represented as an N x M matrix of integers.

To stabilize the energy flow for CODATHAN 2K27, you are tasked with finding the maximum possible sum of an "Arcane Subsegment" within the matrix, where an Arcane Subsegment is defined as a contiguous subgrid such that:
1. The subgrid has dimensions at least 1 x 1.
2. The greatest common divisor (GCD) of all boundary elements of the subgrid is greater than 1 (or if all boundary elements are equal in magnitude).
3. If no such subsegment satisfies the boundary condition with GCD > 1, the answer is simply the maximum contiguous subgrid sum (standard 2D Kadane's maximum sum).

Your program must read the matrix dimensions and values from standard input, process the optimal subgrid, and output the maximum sum achievable.`,
  inputFormat: `The first line contains two integers N and M (1 <= N, M <= 200), denoting the number of rows and columns.
The next N lines each contain M space-separated integers, representing the matrix elements A[i][j] (-10^4 <= A[i][j] <= 10^4).`,
  outputFormat: `Print a single integer: the maximum subgrid sum satisfying the arcane condition.`,
  constraints: [
    '1 <= N, M <= 200',
    '-10^4 <= A[i][j] <= 10^4',
    'Time Limit: 2.0 seconds',
    'Memory Limit: 256 MB',
  ],
  sampleCases: [
    {
      id: 'SAMPLE-1',
      input: '3 3\n1 2 -1\n-2 4 2\n1 2 3',
      expectedOutput: '12',
      isSample: true,
      explanation: 'The entire 3x3 matrix has sum (1 + 2 - 1) + (-2 + 4 + 2) + (1 + 2 + 3) = 2 + 4 + 6 = 12.',
      weight: 0,
    },
    {
      id: 'SAMPLE-2',
      input: '2 2\n-1 -2\n-3 -4',
      expectedOutput: '-1',
      isSample: true,
      explanation: 'All elements are negative. The optimal 1x1 subgrid is [-1].',
      weight: 0,
    },
  ],
  hiddenCases: [
    {
      id: 'HIDDEN-TC-1',
      input: '3 4\n2 4 6 8\n-1 -2 10 12\n4 8 12 16',
      expectedOutput: '79',
      isSample: false,
      weight: 20,
    },
    {
      id: 'HIDDEN-TC-2',
      input: '4 4\n0 0 0 0\n0 5 7 0\n0 9 11 0\n0 0 0 0',
      expectedOutput: '32',
      isSample: false,
      weight: 20,
    },
    {
      id: 'HIDDEN-TC-3',
      input: '1 5\n-5 10 -2 30 -4',
      expectedOutput: '38',
      isSample: false,
      weight: 20,
    },
    {
      id: 'HIDDEN-TC-4',
      input: '5 1\n100\n-50\n75\n-20\n30',
      expectedOutput: '135',
      isSample: false,
      weight: 20,
    },
    {
      id: 'HIDDEN-TC-5',
      input: '5 5\n1 2 3 4 5\n6 7 8 9 10\n11 12 13 14 15\n16 17 18 19 20\n21 22 23 24 25',
      expectedOutput: '325',
      isSample: false,
      weight: 20,
    },
  ],
  status: 'PUBLISHED',
};

const DEFAULT_CPP_STARTER = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, m;
    if (!(cin >> n >> m)) return 0;
    
    vector<vector<long long>> a(n, vector<long long>(m));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> a[i][j];
        }
    }
    
    // 2D Kadane Algorithm for maximum subgrid sum
    long long maxSum = -1e18;
    for (int top = 0; top < n; top++) {
        vector<long long> temp(m, 0);
        for (int bottom = top; bottom < n; bottom++) {
            for (int j = 0; j < m; j++) {
                temp[j] += a[bottom][j];
            }
            long long current = 0;
            for (int j = 0; j < m; j++) {
                current += temp[j];
                maxSum = max(maxSum, current);
                if (current < 0) current = 0;
            }
        }
    }
    
    // Check if all elements were negative
    if (maxSum <= 0) {
        long long singleMax = -1e18;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                singleMax = max(singleMax, a[i][j]);
            }
        }
        maxSum = singleMax;
    }
    
    cout << maxSum << "\\n";
    return 0;
}
`;

const DEFAULT_JAVA_STARTER = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        
        int n = sc.nextInt();
        int m = sc.nextInt();
        long[][] a = new long[n][m];
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                a[i][j] = sc.nextLong();
            }
        }
        
        long maxSum = Long.MIN_VALUE;
        for (int top = 0; top < n; top++) {
            long[] temp = new long[m];
            for (int bottom = top; bottom < n; bottom++) {
                for (int j = 0; j < m; j++) {
                    temp[j] += a[bottom][j];
                }
                long current = 0;
                for (int j = 0; j < m; j++) {
                    current += temp[j];
                    if (current > maxSum) maxSum = current;
                    if (current < 0) current = 0;
                }
            }
        }
        
        if (maxSum <= 0) {
            long singleMax = Long.MIN_VALUE;
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < m; j++) {
                    if (a[i][j] > singleMax) singleMax = a[i][j];
                }
            }
            maxSum = singleMax;
        }
        
        System.out.println(maxSum);
    }
}
`;

export const STARTERS = {
  cpp: DEFAULT_CPP_STARTER,
  java: DEFAULT_JAVA_STARTER,
};

declare global {
  // eslint-disable-next-line no-var
  var __codathon_exam_sessions: Map<string, ExamSessionState> | undefined;
}

if (!global.__codathon_exam_sessions) {
  global.__codathon_exam_sessions = new Map<string, ExamSessionState>();
}

const examSessions = global.__codathon_exam_sessions;
const EXAM_DURATION_MS = 120 * 60 * 1000; // 120 minutes = 7,200,000 ms

export const ExamStore = {
  getQuestion(includeHidden = false): QuestionData {
    if (includeHidden) return OFFICIAL_QUESTION;
    // Strip hidden cases before sending to student frontend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hiddenCases, ...publicQuestion } = OFFICIAL_QUESTION;
    return publicQuestion as QuestionData;
  },

  getOrCreateSession(teamId: string): ExamSessionState {
    const normTeamId = teamId.toUpperCase().trim();
    let session = examSessions.get(normTeamId);

    if (!session) {
      session = {
        examId: 'CDT27-ROUND-1',
        teamId: normTeamId,
        startTime: null,
        durationMs: EXAM_DURATION_MS,
        deadline: null,
        status: 'READY',
        questionViewsCount: 0,
        currentLanguage: 'cpp',
        currentCode: DEFAULT_CPP_STARTER,
        lastSavedAt: Date.now(),
      };
      examSessions.set(normTeamId, session);
    }

    // Check if time expired
    if (session.status === 'ACTIVE' && session.deadline && Date.now() > session.deadline) {
      session.status = 'TIME_EXPIRED';
      examSessions.set(normTeamId, session);
    }

    return session;
  },

  startExam(teamId: string): ExamSessionState {
    const session = this.getOrCreateSession(teamId);
    if (session.status === 'READY' || session.status === 'NOT_STARTED' || !session.startTime) {
      const now = Date.now();
      session.startTime = now;
      session.deadline = now + EXAM_DURATION_MS;
      session.status = 'ACTIVE';
      session.lastSavedAt = now;
      examSessions.set(session.teamId, session);
    }
    return session;
  },

  autosave(teamId: string, code: string, language: 'cpp' | 'java'): ExamSessionState {
    const session = this.getOrCreateSession(teamId);
    session.currentCode = code;
    session.currentLanguage = language;
    session.lastSavedAt = Date.now();

    // Check deadline
    if (session.status === 'ACTIVE' && session.deadline && Date.now() > session.deadline) {
      session.status = 'TIME_EXPIRED';
    }

    examSessions.set(session.teamId, session);
    return session;
  },

  incrementQuestionView(teamId: string): number {
    const session = this.getOrCreateSession(teamId);
    session.questionViewsCount += 1;
    examSessions.set(session.teamId, session);
    return session.questionViewsCount;
  },

  markSubmitted(teamId: string): ExamSessionState {
    const session = this.getOrCreateSession(teamId);
    session.status = 'SUBMITTED';
    examSessions.set(session.teamId, session);
    return session;
  },

  getAllExamSessions(): ExamSessionState[] {
    return Array.from(examSessions.values());
  },
};
