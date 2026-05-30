import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Creator Video RAG Analyst - Premium Comparative Dashboard',
  description: 'Extract transcripts, analyze engagement metrics, and converse with a RAG comparative AI regarding YouTube videos and Instagram Reels side-by-side.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased bg-[#080B11] text-[#F3F4F6] min-h-screen relative selection:bg-brandPurple/30 selection:text-white">
        {/* Glow backdrop layer */}
        <div className="absolute top-[-10%] left-[-10%] glow-bg" />
        <div className="absolute bottom-[20%] right-[-10%] glow-bg bg-brandPink/5" />
        <main className="relative z-10 w-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
