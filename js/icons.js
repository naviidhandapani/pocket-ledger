/* icons.js — Supermoney Style Icons (Bold Minimalist) */
const S='stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const ICO = {
  x:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  back:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><polyline points="15 18 9 12 15 6"/></svg>`,
  chevron:`<svg viewBox="0 0 24 24" width="16" height="16" ${S}><polyline points="9 18 15 12 9 6"/></svg>`,
  
  // Tab Bar Icons
  home:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  trending:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  history:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  settings:`<svg viewBox="0 0 24 24" width="24" height="24" ${S}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,

  // Quick Actions (Filled variants or bold outline)
  cardBuy:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  cashLent:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><circle cx="10" cy="7" r="4"/><path d="M10 11H6a4 4 0 0 0-4 4v2"/><path d="M19 13V5"/><path d="m16 8 3-3 3 3"/></svg>`,
  borrow:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><circle cx="10" cy="7" r="4"/><path d="M10 11H6a4 4 0 0 0-4 4v2"/><path d="M16 5v8"/><path d="m16 13 3-3-3-3"/></svg>`,
  expense:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>`,
  group:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  chart:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  
  // Transaction Icons
  payment:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><polyline points="20 6 9 17 4 12"/></svg>`,
  card:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  handshake:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
  coin:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="20"/><line x1="12" y1="4" x2="12" y2="6"/></svg>`,
  wallet:`<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>`,
  
  // Utilities
  trash:`<svg viewBox="0 0 24 24" width="18" height="18" ${S}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  salary:`<svg viewBox="0 0 24 24" width="18" height="18" ${S}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  paste:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  sync:`<svg viewBox="0 0 24 24" width="18" height="18" ${S}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
  upload:`<svg viewBox="0 0 24 24" width="18" height="18" ${S}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  download:`<svg viewBox="0 0 24 24" width="18" height="18" ${S}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  ghost:`<svg viewBox="0 0 24 24" width="32" height="32" ${S}><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>`,
  emptybox:`<svg viewBox="0 0 24 24" width="32" height="32" ${S}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" width="22" height="22" ${S}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,

  // Categories
  cat: {
    food: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
    stay: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M3 21h18"/><path d="M3 7v14"/><path d="M21 7v14"/><path d="M3 7l9-4 9 4"/></svg>`,
    travel: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M1.5 9l2.8 6.9c.1.3.4.5.7.5H19c.3 0 .6-.2.7-.5L22.5 9h-21z"/><path d="M6.6 9L12 2l5.4 7"/></svg>`,
    fuel: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 12h2a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0V8l-4-4"/><rect x="5" y="7" width="8" height="5"/></svg>`,
    shopping: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    fun: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/></svg>`,
    bills: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>`,
    drinks: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><path d="M18 2H6v2l6 10v6l-4 4h8l-4-4v-6l6-10V2z"/></svg>`,
    other: `<svg viewBox="0 0 24 24" width="20" height="20" ${S}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  }
};
