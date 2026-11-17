'use client';

import React, { useMemo } from 'react';

interface Props {
  text?: string;
  opacity?: number;
  fontSize?: number;
  angle?: number;
  spacingX?: number;
  spacingY?: number;
}

export function DynamicWatermark({
  text = 'CODATHAN 2K27 • CONFIDENTIAL EXAMINATION',
  opacity = 0.055, // 5.5% subtle official opacity
  fontSize = 13,
  angle = -25,
  spacingX = 320,
  spacingY = 160,
}: Props) {
  // Generate repeatable SVG background pattern
  const svgDataUrl = useMemo(() => {
    const cleanText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${spacingX}" height="${spacingY}">
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dominant-baseline="central"
        transform="rotate(${angle}, ${spacingX / 2}, ${spacingY / 2})"
        font-family="Inter, sans-serif" 
        font-size="${fontSize}px" 
        font-weight="500" 
        fill="#c5a059" 
        letter-spacing="1px"
      >${cleanText}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }, [text, fontSize, angle, spacingX, spacingY]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden"
      style={{
        backgroundImage: `url("${svgDataUrl}")`,
        backgroundRepeat: 'repeat',
        opacity: opacity,
        mixBlendMode: 'screen',
      }}
    />
  );
}
