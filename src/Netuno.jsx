import { useState, useEffect, useMemo } from "react";

// ─────────────────────────────────────────────
// CONSTANTES & DADOS INICIAIS
// ─────────────────────────────────────────────

const STORAGE_KEY = "financy_transactions";

const INITIAL_TRANSACTIONS = [
  { id: 1, name: "Salário",      value: 5000, type: "income",  date: "2025-06-01" },
  { id: 2, name: "Aluguel",      value: 1200, type: "expense", date: "2025-06-05" },
  { id: 3, name: "Freelance",    value: 800,  type: "income",  date: "2025-06-10" },
  { id: 4, name: "Supermercado", value: 450,  type: "expense", date: "2025-06-12" },
];

const FILTER_TABS = [
  ["all",     "Todas"   ],
  ["income",  "Receitas"],
  ["expense", "Despesas"],
];

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

function saveTransactions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ─────────────────────────────────────────────
// ÍCONES SVG
// ─────────────────────────────────────────────

const Icon = {
  Plus: () => (
    <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Back: () => (
    <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Edit: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  ArrowUp: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="rgba(160,230,160,0.12)" stroke="rgba(160,230,160,0.35)" strokeWidth="1.5" />
      <path d="M12 16V8M8.5 11.5L12 8l3.5 3.5" stroke="rgba(160,230,160,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowDown: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="rgba(230,150,150,0.12)" stroke="rgba(230,150,150,0.35)" strokeWidth="1.5" />
      <path d="M12 8v8M8.5 12.5L12 16l3.5-3.5" stroke="rgba(230,150,150,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// ESTILOS GLOBAIS
// ─────────────────────────────────────────────

const styles = `
  html, body, #root {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
      "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: #0c1530;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── LAYOUT BASE ── */
  .app {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 100vh;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
    border: none !important;
    outline: none !important;
    background:
      radial-gradient(ellipse 90% 55% at 15% 10%,  rgba(30, 100, 240, 0.55) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 88% 8%,   rgba(0, 160, 255, 0.40) 0%, transparent 50%),
      radial-gradient(ellipse 60% 45% at 75% 88%,  rgba(0, 100, 200, 0.35) 0%, transparent 55%),
      radial-gradient(ellipse 55% 40% at 5%  80%,  rgba(10, 80, 200, 0.38) 0%, transparent 55%),
      radial-gradient(ellipse 40% 35% at 50% 50%,  rgba(0, 130, 255, 0.18) 0%, transparent 60%),
      linear-gradient(160deg, #0e1a3a 0%, #0c1630 50%, #0a1228 100%);
  }

  .content { position: relative; z-index: 1; }

  /* ── BLOBS DE LUZ AMBIENTE ── */
  .blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
  .blob-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(0,100,255,0.45) 0%, rgba(0,140,255,0.25) 40%, transparent 70%);
    top: -220px; right: -180px;
  }
  .blob-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,80,210,0.38) 0%, rgba(0,120,220,0.22) 40%, transparent 70%);
    bottom: -100px; left: -160px;
  }
  .blob-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,180,255,0.22) 0%, transparent 70%);
    top: 40%; left: 25%;
  }

  /* ── HEADER ── */
  .header {
    padding: 40px 10px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    width: 100%;
  }
  .header-left  { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .header-actions { display: flex; gap: 9px; flex-shrink: 0; }

  .avatar {
    width: 45px; height: 45px;
    flex-shrink: 0;
    background: transparent;
  }
  .avatar-img { width: 100%; height: 100%; object-fit: contain; }

  .header-welcome { font-size: 11px; color: rgba(255,255,255,0.32); letter-spacing: 0.6px; }
  .header-name    { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.92); }

  /* Botão circular glass (header) */
  .hbtn {
    width: 42px; height: 42px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.22);
    background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 12px rgba(0,0,0,0.18);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(255,255,255,0.85);
    position: relative; overflow: hidden;
    transition: all 0.18s;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .hbtn svg { display: block; flex-shrink: 0; }
  .hbtn::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: rgba(255,255,255,0); transition: background 0.15s;
  }
  .hbtn:hover  { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.18); }
  .hbtn:active { transform: scale(0.88); background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.28); box-shadow: 0 0 0 6px rgba(255,255,255,0.07); }
  .hbtn:active::after { background: rgba(255,255,255,0.12); }

  /* ── CARDS ── */
  .cards-stack { display: flex; flex-direction: column; padding: 10px 10px 0; width: 100%; }

  .gcard {
    border-radius: 26px;
    background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.08) 100%);
    backdrop-filter: blur(60px) saturate(180%) brightness(1.12);
    -webkit-backdrop-filter: blur(60px) saturate(180%) brightness(1.12);
    border: 1px solid rgba(255,255,255,0.22);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.35) inset,
      0 -1px 0 rgba(255,255,255,0.06) inset,
      1px 0 0 rgba(255,255,255,0.12) inset,
      0 24px 60px rgba(0,0,0,0.28),
      0 6px 20px rgba(0,0,0,0.16);
    padding: 40px 20px;
    margin-bottom: 20px;
    position: relative; overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
    cursor: default;
    -webkit-tap-highlight-color: transparent;
  }
  /* Reflexo superior — linha de luz */
  .gcard::before {
    content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.55) 70%, transparent 100%);
    border-radius: 0;
  }
  /* Brilho difuso no canto superior esquerdo — igual ao card da imagem */
  .gcard::after {
    content: ''; position: absolute; top: -30px; left: -20px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 65%);
    pointer-events: none;
  }

  .gcard.clickable { cursor: pointer; }
  .gcard.clickable:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.11) 100%);
    transform: translateY(-2px);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.4) inset,
      0 -1px 0 rgba(255,255,255,0.07) inset,
      1px 0 0 rgba(255,255,255,0.15) inset,
      0 32px 70px rgba(0,0,0,0.30),
      0 8px 24px rgba(0,0,0,0.18);
  }
  .gcard.clickable:active {
    transform: scale(0.96) translateY(1px);
    background: linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.14) 100%);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.3) inset,
      0 6px 24px rgba(0,0,0,0.25),
      0 0 0 4px rgba(255,255,255,0.07);
    transition: transform 0.08s, box-shadow 0.08s, background 0.08s;
    animation: cardPulse 0.4s ease-out;
  }

  @keyframes cardPulse {
    0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.18), 0 20px 60px rgba(0,0,0,0.35); }
    60%  { box-shadow: 0 0 0 10px rgba(255,255,255,0), 0 20px 60px rgba(0,0,0,0.35); }
    100% { box-shadow: 0 0 0 0 rgba(255,255,255,0), 0 20px 60px rgba(0,0,0,0.35); }
  }

  .card-top    { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .card-label  { font-size: 14px; font-weight: 400; color: rgba(255, 255, 255, 0.7); }
  .card-amount { text-align: left; font-size: 40px; font-weight: 400; color: rgba(255,255,255,0.93); letter-spacing: -2px; line-height: 1; margin-bottom: 12px; }
  .card-amount.sm    { font-size: 32px; letter-spacing: -1.5px; }
  .card-amount.muted { color: rgba(255,255,255,0.55); }

  .income-amt  { color: rgba(255,255,255,0.93); }
  .expense-amt { color: rgba(255,255,255,0.93); }

  /* ── LISTA DE TRANSAÇÕES ── */
  .section        { padding: 10px 10px 0; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .section-title  { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.88); }
  .section-count  {
    font-size: 11px; color: rgba(255,255,255,0.70);
    background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.22);
    box-shadow: 0 1px 0 rgba(255,255,255,0.28) inset;
    padding: 3px 12px; border-radius: 20px;
  }

  /* Filtros */
  .filter-row { display: flex; gap: 7px; margin-bottom: 14px; }
  .ftab {
    padding: 6px 14px; border-radius: 20px;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
    border: 1px solid rgba(255,255,255,0.16);
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    color: rgba(255,255,255,0.40);
    box-shadow: 0 1px 0 rgba(255,255,255,0.16) inset;
    transition: all 0.15s;
  }
  .ftab:active { transform: scale(0.94); }
  .ftab.active  {
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
    color: rgba(255,255,255,0.90); border-color: rgba(255,255,255,0.28);
    box-shadow: 0 1px 0 rgba(255,255,255,0.30) inset;
  }

  /* Item de transação */
  .tx-item {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 15px; margin-bottom: 15px;
    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.07) 100%);
    backdrop-filter: blur(40px) saturate(160%) brightness(1.1);
    -webkit-backdrop-filter: blur(40px) saturate(160%) brightness(1.1);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 20px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.28) inset, 0 4px 16px rgba(0,0,0,0.12);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .tx-item:hover  {
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.07) 60%, rgba(255,255,255,0.10) 100%);
    border-color: rgba(255,255,255,0.26);
  }
  .tx-item:active { transform: scale(0.98); }

  .tx-dot {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset;
  }
  .tx-info  { flex: 1; min-width: 0; }
  .tx-name  { text-align: left; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.82); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .tx-val   { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7); }
  .tx-val.income  { color: rgba(160,230,160,0.8); }
  .tx-val.expense { color: rgba(230,150,150,0.8); }

  .tx-btns { display: flex; gap: 5px; }
  .tbtn {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1px solid rgba(180,224,255,0.2);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.55);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .tbtn svg    { display: block; }
  .tbtn:hover  { background: rgba(255,255,255,0.11); color: rgba(255,255,255,0.85); }
  .tbtn:active { transform: scale(0.85); background: rgba(255,255,255,0.16); }

  /* ── CONTEXT MENU ── */
  .ctx-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(5, 15, 50, 0.45);
    backdrop-filter: blur(6px) saturate(160%) brightness(0.75);
    -webkit-backdrop-filter: blur(6px) saturate(160%) brightness(0.75);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .ctx-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.10) 100%);
    backdrop-filter: blur(60px) saturate(200%) brightness(1.15);
    -webkit-backdrop-filter: blur(60px) saturate(200%) brightness(1.15);
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 22px;
    padding: 8px;
    min-width: 220px;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.38) inset,
      0 -1px 0 rgba(255,255,255,0.06) inset,
      1px 0 0 rgba(255,255,255,0.12) inset,
      0 24px 60px rgba(0,0,0,0.35),
      0 6px 20px rgba(0,0,0,0.20);
    animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes popIn { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .ctx-label {
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.75); padding: 8px 14px 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ctx-value {
    font-size: 12px; font-weight: 500;
    padding: 0 14px 8px;
    white-space: nowrap;
  }
  .ctx-value.income  { color: rgba(160,230,160,0.75); }
  .ctx-value.expense { color: rgba(230,150,150,0.75); }
  .ctx-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 4px 0; }
  .ctx-btn {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 13px 14px; border-radius: 14px;
    border: none; background: transparent;
    color: rgba(255,255,255,0.82); font-size: 15px; font-weight: 500;
    cursor: pointer; font-family: inherit; text-align: left;
    transition: background 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  .ctx-btn:hover  { background: rgba(255,255,255,0.07); }
  .ctx-btn:active { background: rgba(255,255,255,0.12); transform: scale(0.98); }
  .ctx-btn.danger { color: rgba(230,100,100,0.9); }
  .ctx-btn svg { flex-shrink: 0; }

  .empty      { padding: 40px 0; color: rgba(255,255,255,0.18); font-size: 13px; }
  .empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.4; }

  /* ── MODAL (bottom sheet) ── */
  .overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(5, 15, 50, 0.45);
    backdrop-filter: blur(6px) saturate(160%) brightness(0.75);
    -webkit-backdrop-filter: blur(6px) saturate(160%) brightness(0.75);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet {
    width: 100%; max-width: 430px;
    background: linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%);
    backdrop-filter: blur(60px) saturate(200%) brightness(1.15);
    -webkit-backdrop-filter: blur(60px) saturate(200%) brightness(1.15);
    border: 1px solid rgba(255,255,255,0.22);
    border-bottom: none; border-radius: 28px 28px 0 0;
    padding: 10px 10px 20px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.38) inset, 0 -24px 60px rgba(0,0,0,0.35);
    animation: slideUp 0.3s cubic-bezier(0.32,0.72,0,1);
  }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.20); margin: 0 auto 16px; }
  .sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding: 0 4px; }
  .sheet-title { font-size: 17px; font-weight: 700; color: #ffffff; }
  .sheet-close {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.22);
    background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
    box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(255,255,255,0.65);
    transition: all 0.15s; outline: none;
    -webkit-tap-highlight-color: transparent;
    font-size: 16px; line-height: 1;
  }
  .sheet-close:hover  { background: linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.10) 100%); color: rgba(255,255,255,0.9); }
  .sheet-close:active { transform: scale(0.88); }

  .type-row { display: flex; gap: 8px; margin-bottom: 18px; }
  .type-opt {
    flex: 1; padding: 11px 0; border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.16);
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    color: rgba(255,255,255,0.35);
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .type-opt:active { transform: scale(0.96); }
  .type-opt.sel {
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
    color: rgba(255,255,255,0.92); border-color: rgba(255,255,255,0.28);
    box-shadow: 0 1px 0 rgba(255,255,255,0.28) inset;
  }

  .fg     { margin-bottom: 12px; }
  .flabel { font-size: 10px; color: rgba(255, 255, 255, 0.99); font-weight: 700; letter-spacing: 0.8px; margin-bottom: 6px; }
  .finput {
    width: 100%; padding: 12px 14px;
    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 13px; color: rgba(255,255,255,0.90);
    font-size: 15px; font-family: inherit;
    outline: none; transition: all 0.15s;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.20) inset;
  }
  .finput:focus       { border-color: rgba(255,255,255,0.32); background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.07) 100%); box-shadow: 0 1px 0 rgba(255,255,255,0.28) inset; }
  .finput::placeholder { color: rgba(255,255,255,0.22); }

  .sbtn {
    width: 100%; padding: 14px; margin-top: 6px;
    background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 60%, rgba(255,255,255,0.11) 100%);
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255,255,255,0.26);
    border-radius: 14px; color: rgba(255,255,255,0.92);
    font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
    box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 16px rgba(0,0,0,0.15);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .sbtn:hover  { background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.15) 100%); border-color: rgba(255,255,255,0.34); }
  .sbtn:active { transform: scale(0.97); background: linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.12) 100%); }
`;

// ─────────────────────────────────────────────
// COMPONENTE: LISTA DE TRANSAÇÕES
// ─────────────────────────────────────────────

function TxList({ items, onEdit, onDelete }) {
  const [ctxTx, setCtxTx] = useState(null);

  if (!items.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        Nenhum lançamento encontrado
      </div>
    );
  }

  return (
    <>
      {items.map(tx => {
        return (
          <div
            className="tx-item"
            key={tx.id}
            onClick={() => setCtxTx(tx)}
            style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}
          >
            <div className="tx-dot">
              {tx.type === "income" ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
            </div>
            <div className="tx-info">
              <div className="tx-name">{tx.name}</div>
            </div>
            <div className="tx-right">
              <span className={`tx-val ${tx.type}`}>
                {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.value)}
              </span>
            </div>
          </div>
        );
      })}

      {ctxTx && (
        <div className="ctx-overlay" onClick={() => setCtxTx(null)}>
          <div className="ctx-card" onClick={e => e.stopPropagation()}>
            <div className="ctx-label">{ctxTx.name}</div>
            <div className={`ctx-value ${ctxTx.type}`}>
              {ctxTx.type === "income" ? "+" : "−"}{formatCurrency(ctxTx.value)}
            </div>
            <div className="ctx-divider" />
            <button className="ctx-btn" onClick={() => { onEdit(ctxTx); setCtxTx(null); }}>
              <Icon.Edit />
              Editar lançamento
            </button>
            <button className="ctx-btn danger" onClick={() => { onDelete(ctxTx.id); setCtxTx(null); }}>
              <Icon.Trash />
              Excluir lançamento
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

const EMPTY_FORM = { name: "", value: "", type: "income" };

const VIEW_TITLES = {
  income:  "Receitas",
  expense: "Despesas",
};

export default function Financy() {
  const [transactions, setTransactions] = useState(loadTransactions);
  const [view,         setView        ] = useState("home");
  const [filterTab,    setFilterTab   ] = useState("all");
  const [modalOpen,    setModalOpen   ] = useState(false);
  const [editingId,    setEditingId   ] = useState(null);
  const [form,         setForm        ] = useState(EMPTY_FORM);

  // Persiste no localStorage sempre que as transações mudam
  useEffect(() => { saveTransactions(transactions); }, [transactions]);

  // Totais calculados apenas quando transactions muda
  const totals = useMemo(() => {
    const income  = transactions.filter(t => t.type === "income" ).reduce((sum, t) => sum + t.value, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.value, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  // ── Handlers do modal ──

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  // Formata centavos enquanto digita (ex: "15025" → "150,25")
  function formatBRL(raw) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    const cents = parseInt(digits, 10);
    return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseBRL(formatted) {
    return parseFloat(formatted.replace(/\./g, "").replace(",", ".")) || 0;
  }

  function handleValueChange(raw) {
    setForm(f => ({ ...f, value: formatBRL(raw) }));
  }

  function openEdit(tx) {
    setEditingId(tx.id);
    const cents = Math.round(tx.value * 100);
    const formatted = (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setForm({ name: tx.name, value: formatted, type: tx.type });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit() {
    const val = parseBRL(form.value);
    if (!form.name.trim() || isNaN(val) || val <= 0) return;

    if (editingId !== null) {
      setTransactions(prev =>
        prev.map(t => t.id === editingId
          ? { ...t, name: form.name.trim(), value: val, type: form.type }
          : t
        )
      );
    } else {
      setTransactions(prev => [
        { id: Date.now(), name: form.name.trim(), value: val, type: form.type },
        ...prev,
      ]);
    }

    closeModal();
  }

  function handleDelete(id) {
    if (confirm("Apagar este lançamento?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }

  // ── Lista filtrada conforme a view e o filtro ativo ──

  function getFilteredList() {
    if (view === "income" || view === "expense") {
      return transactions.filter(t => t.type === view);
    }
    if (filterTab !== "all") {
      return transactions.filter(t => t.type === filterTab);
    }
    return transactions;
  }

  const filteredList = getFilteredList();
  const viewTitle    = VIEW_TITLES[view] ?? "Todas";

  // ── Render ──

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Blobs de luz ambiente */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="content">

          {/* HEADER */}
          <header className="header">
            <div className="header-left">
              <div className="avatar">
                <img src="/assets/logo.png" alt="Netuno" className="avatar-img" />
              </div>
              <div>
                <div className="header-name">Netuno</div>
              </div>
            </div>
            <div className="header-actions">
              {view !== "home" && (
                <button className="hbtn" onClick={() => setView("home")} title="Voltar">
                  <Icon.Back />
                </button>
              )}
              <button className="hbtn" onClick={openAdd} title="Adicionar lançamento">
                <Icon.Plus />
              </button>
            </div>
          </header>

          {/* HOME — cards de resumo */}
          {view === "home" && (
            <div className="cards-stack">
              <div className="gcard">
                <div className="card-top">
                  <span className="card-label">Total Líquido</span>
                </div>
                <div className={`card-amount ${totals.net < 0 ? "muted" : ""}`}>
                  {formatCurrency(totals.net)}
                </div>
              </div>

              <div className="gcard clickable" onClick={() => setView("income")}>
                <div className="card-top">
                  <span className="card-label">Receitas Totais</span>
                </div>
                <div className="card-amount sm income-amt">{formatCurrency(totals.income)}</div>
              </div>

              <div className="gcard clickable" onClick={() => setView("expense")}>
                <div className="card-top">
                  <span className="card-label">Despesas Totais</span>
                </div>
                <div className="card-amount sm expense-amt">{formatCurrency(totals.expense)}</div>
              </div>
            </div>
          )}

          {/* LISTA — receitas, despesas ou todas */}
          {view !== "home" && (
            <div className="section">
              <div className="section-header">
                <span className="section-title">{viewTitle}</span>
                <span className="section-count">{filteredList.length} itens</span>
              </div>

              {view === "all" && (
                <div className="filter-row">
                  {FILTER_TABS.map(([key, label]) => (
                    <button
                      key={key}
                      className={`ftab ${filterTab === key ? "active" : ""}`}
                      onClick={() => setFilterTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <TxList items={filteredList} onEdit={openEdit} onDelete={handleDelete} />
            </div>
          )}

        </div>

        {/* MODAL — adicionar / editar lançamento */}
        {modalOpen && (
          <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="sheet">
              <div className="sheet-header">
                <div className="sheet-title">
                  {editingId ? "Editar lançamento" : "Novo lançamento"}
                </div>
                <button className="sheet-close" onClick={closeModal} title="Fechar">✕</button>
              </div>

              <div className="type-row">
                <button
                  className={`type-opt ${form.type === "income" ? "sel" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type: "income" }))}
                >
                  ↑ Receita
                </button>
                <button
                  className={`type-opt ${form.type === "expense" ? "sel" : ""}`}
                  onClick={() => setForm(f => ({ ...f, type: "expense" }))}
                >
                  ↓ Despesa
                </button>
              </div>

              <div className="fg">
                <div className="flabel">Descrição</div>
                <input
                  className="finput"
                  placeholder="Ex: Salário, Aluguel..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="fg">
                <div className="flabel">Valor (R$)</div>
                <input
                  className="finput"
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={form.value}
                  onChange={e => handleValueChange(e.target.value)}
                />
              </div>

              <button className="sbtn" onClick={handleSubmit}>
                {editingId ? "Salvar alterações" : "Adicionar lançamento"}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}