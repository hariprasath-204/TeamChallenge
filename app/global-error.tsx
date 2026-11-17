'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#06070a] text-white flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold text-[#e7ca7a] mb-2">CODATHAN 2K27 - Critical Application Error</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error.message || 'System error detected.'}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#c5a059] text-black font-semibold rounded hover:bg-[#e7ca7a]"
        >
          Reload Examination Application
        </button>
      </body>
    </html>
  );
}
