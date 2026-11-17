'use client';

import React, { useState, useEffect } from 'react';
import { CompletionView } from '@/components/CompletionView';

export default function CompletionPage() {
  const [data, setData] = useState<{
    displayTitle: string;
    displayMessage: string;
    submissionId: string;
    teamName: string;
    allPassed: boolean;
  }>({
    displayTitle: 'SUBMISSION RECEIVED SUCCESSFULLY!',
    displayMessage:
      'Your submission has been recorded. Thank you for participating in CODATHAN 2K27.',
    submissionId: 'CDT27-FINAL',
    teamName: 'Your Team',
    allPassed: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cdt_completion_data');
      const rawTeam = localStorage.getItem('cdt_team_info');
      const team = rawTeam ? JSON.parse(rawTeam) : null;

      if (raw) {
        const parsed = JSON.parse(raw);
        setData({
          displayTitle: parsed.displayTitle || 'SUBMISSION RECEIVED SUCCESSFULLY!',
          displayMessage:
            parsed.displayMessage ||
            'Your submission has been recorded. Thank you for participating in CODATHAN 2K27.',
          submissionId: parsed.submissionId || 'CDT27-FINAL',
          teamName: team?.teamName || 'Your Team',
          allPassed: parsed.evaluationStatus === 'ALL_PASSED',
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  return (
    <CompletionView
      title={data.displayTitle}
      message={data.displayMessage}
      submissionId={data.submissionId}
      teamName={data.teamName}
      allPassed={data.allPassed}
    />
  );
}
