/* ─── utils.js — Helpers for PocketLedger ─── */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
  if (amount === 0) return '₹0';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return (amount < 0 ? '-₹' : '₹') + formatted;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  if (hrs < 24) return hrs + 'h ago';
  if (days < 7) return days + 'd ago';
  return formatDateShort(dateStr);
}

function calcEffective(amount, cbPercent) {
  return amount - (amount * (cbPercent || 0) / 100);
}

function calcMonthlyEMI(effective, months) {
  return Math.ceil(effective / months);
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}
