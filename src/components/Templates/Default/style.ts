// ============================
// Global Styles for DefaultTemplate
// ============================

export const globalStyles = `
  /* ============================
   Fonts
   ============================ */
  @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap");
  @import url("https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css");

  /* ============================
   Design Tokens
   ============================ */
  :root {
    /* Colors */
    --bg-main: hsl(271, 81%, 56%);
    --bg-card: hsl(0, 0%, 12%);
    --border-main: hsl(0, 0%, 25%);
    --text-main: hsl(0, 0%, 98%);
    --text-muted: hsl(0, 0%, 70%);
    --accent: hsl(330, 85%, 55%);
    --accent-2: hsl(260, 80%, 60%);
    --accent-soft: hsl(330, 85%, 65%);
    --accent-glow: hsla(330, 85%, 55%, 0.35);

    /* Typography */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --text-xl: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
    --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
    --text-3xl: clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem);
    --text-4xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem);
    --text-5xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
    --text-6xl: clamp(2.75rem, 2rem + 3.75vw, 3.75rem);
    --text-7xl: clamp(3.25rem, 2.25rem + 5vw, 4.5rem);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
  }

  /* ============================
   Base Reset
   ============================ */
  *,
  html {
    scroll-behavior: smooth;
  }

  body {
    
    overflow-x: hidden;
    font-family: "Poppins", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    line-height: 1.6;
  }
  h1,
  h2,
  h3 {
    letter-spacing: -0.02em;
  }

  html[dir="rtl"] body,
  html[lang="ar"] body {
    font-family: "Cairo", sans-serif;
  }

  .font-cairo {
    font-family: "Cairo", sans-serif;
  }
  .font-poppins {
    font-family: "Poppins", sans-serif;
  }

  /* ============================
   Animations
   ============================ */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-18px);
    }
  }

  @keyframes shimmer {
    from {
      background-position: -200% 0;
    }
    to {
      background-position: 200% 0;
    }
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(16px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes modalOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.96) translateY(16px);
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  .animate-modal-in {
    animation: modalIn 0.35s ease-out forwards;
  }
  .animate-modal-out {
    animation: modalOut 0.3s ease-in forwards;
  }

  /* ============================
   Utilities
   ============================ */
  .line-clamp-1,
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-1 {
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    -webkit-line-clamp: 2;
  }

  /* ============================
   Scrollbar
   ============================ */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-main);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border-main);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }
`;

export const globalStylesSky = `
  /* ============================
   Fonts
   ============================ */
  @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap");
  @import url("https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css");

  /* ============================
   Design Tokens
   ============================ */
  :root {
    /* Colors */
    --bg-main: #2196F3;
    // --bg-main: hsl(291, 64%, 42%);
    --bg-card: hsl(0, 0%, 12%);
    --border-main: hsl(0, 0%, 25%);
    --text-main: hsl(0, 0%, 98%);
    --text-muted: hsl(0, 0%, 70%);
    --accent: hsl(330, 85%, 55%);
    --accent-2: hsl(260, 80%, 60%);
    --accent-soft: hsl(330, 85%, 65%);
    --accent-glow: hsla(330, 85%, 55%, 0.35);

    /* Typography */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --text-xl: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
    --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
    --text-3xl: clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem);
    --text-4xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem);
    --text-5xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
    --text-6xl: clamp(2.75rem, 2rem + 3.75vw, 3.75rem);
    --text-7xl: clamp(3.25rem, 2.25rem + 5vw, 4.5rem);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
  }

  /* ============================
   Base Reset
   ============================ */
  *,
  html {
    scroll-behavior: smooth;
  }

  body {
 
    overflow-x: hidden;
    font-family: "Poppins", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    line-height: 1.6;
  }
  h1,
  h2,
  h3 {
    letter-spacing: -0.02em;
  }

  html[dir="rtl"] body,
  html[lang="ar"] body {
    font-family: "Cairo", sans-serif;
  }

  .font-cairo {
    font-family: "Cairo", sans-serif;
  }
  .font-poppins {
    font-family: "Poppins", sans-serif;
  }

  /* ============================
   Animations
   ============================ */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-18px);
    }
  }

  @keyframes shimmer {
    from {
      background-position: -200% 0;
    }
    to {
      background-position: 200% 0;
    }
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(16px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  .animate-modal-in {
    animation: modalIn 0.35s ease-out forwards;
  }
  @keyframes modalOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.96) translateY(16px);
    }
  }
  .animate-modal-out {
    animation: modalOut 0.3s ease-in forwards;
  }

  /* ============================
   Utilities
   ============================ */
  .line-clamp-1,
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-1 {
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    -webkit-line-clamp: 2;
  }

  /* ============================
   Scrollbar
   ============================ */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-main);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border-main);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }
`;
