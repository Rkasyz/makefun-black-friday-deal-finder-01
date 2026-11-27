// FridayFinds rendering — turns deal data into HTML strings.
// No state here: main.js decides what to render, this file only builds it.

import { CHECKED_DATE, VERDICTS } from './deals.js';
import { discountPct, savings } from './filters.js';

/** $1,299 or $169.99 — cents only when the price has them. */
export function money(amount) {
  const cents = Math.round(amount * 100) % 100;
  return cents === 0
    ? `$${Math.round(amount).toLocaleString('en-US')}`
    : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CATEGORY_ICONS = {
  Audio:
    '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="7" rx="1.5"/><rect x="17" y="13" width="4" height="7" rx="1.5"/>',
  Laptops: '<rect x="4" y="5" width="16" height="10" rx="1.5"/><path d="M2 18.5h20"/>',
  TVs: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M9 21h6"/>',
  'Wearables & Tablets':
    '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M10.5 6.5h3"/>',
  Gaming:
    '<path d="M7 8h10a5 5 0 0 1 5 5v1a3 3 0 0 1-5.4 1.8L15 14H9l-1.6 1.8A3 3 0 0 1 2 14v-1a5 5 0 0 1 5-5Z"/><path d="M7.5 11v2.5M6.2 12.2h2.6"/><circle cx="16" cy="11.5" r="0.9"/><circle cx="18" cy="13.5" r="0.9"/>',
  'Home & Kitchen': '<path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/>',
};

export function categoryIcon(category) {
  const body = CATEGORY_ICONS[category] ?? '';
  return `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/** One deal card for the grid. */
export function dealCard(deal) {
  const pct = discountPct(deal);
  const verdict = VERDICTS[deal.verdict];
  return `
  <article class="card" data-id="${deal.id}">
    <a class="card-link" href="#/deal/${deal.id}" aria-label="${deal.name} — details">
      <div class="card-top">
        ${categoryIcon(deal.category)}
        <span class="card-category">${deal.category}</span>
        <span class="verdict verdict-${deal.verdict}">${verdict.label}</span>
      </div>
      <h3 class="card-name">${deal.name}</h3>
      <p class="card-spec">${deal.spec}</p>
      <div class="card-prices">
        <span class="sale">${money(deal.sale)}</span>
        <span class="usual">${money(deal.usual)}</span>
        <span class="pct">−${pct}%</span>
      </div>
      <p class="card-save">You save ${money(savings(deal))} at ${deal.store}</p>
      <p class="card-evidence">${deal.evidence}</p>
      <p class="card-checked">Checked ${CHECKED_DATE} · ${deal.store}</p>
    </a>
    <a class="store-btn" href="${deal.url}" target="_blank" rel="noopener">View at ${deal.store} ↗</a>
  </article>`;
}

/** Full detail view for one deal (hash route #/deal/<id>). */
export function dealDetail(deal) {
  const pct = discountPct(deal);
  const verdict = VERDICTS[deal.verdict];
  return `
  <div class="detail">
    <a class="back-link" href="#/">← Back to all deals</a>
    <div class="detail-head">
      ${categoryIcon(deal.category)}
      <div>
        <p class="detail-category">${deal.category} · ${deal.store}</p>
        <h2 class="detail-name">${deal.name}</h2>
        <p class="detail-spec">${deal.spec}</p>
      </div>
      <span class="verdict verdict-${deal.verdict} verdict-big">${verdict.label}</span>
    </div>
    <div class="detail-prices">
      <div><span class="detail-label">Sale price</span><span class="detail-sale">${money(deal.sale)}</span></div>
      <div><span class="detail-label">Usual price</span><span class="detail-usual">${money(deal.usual)}</span></div>
      <div><span class="detail-label">Discount</span><span class="detail-pct">−${pct}%</span></div>
      <div><span class="detail-label">You save</span><span class="detail-save">${money(savings(deal))}</span></div>
    </div>
    <h3 class="detail-sub">Is it really a deal?</h3>
    <p class="detail-why"><strong>${verdict.label} — ${verdict.hint}.</strong> ${deal.detail}</p>
    <p class="detail-source">Price read from: ${deal.source}. Checked ${CHECKED_DATE}.</p>
    <a class="store-btn store-btn-big" href="${deal.url}" target="_blank" rel="noopener">View at ${deal.store} ↗</a>
    <p class="detail-note">Prices change fast on Black Friday — the store’s price at checkout is the one that counts.</p>
  </div>`;
}

/** Header stats strip, computed live from the deal list. */
export function statsBar(deals) {
  const totalSaved = deals.reduce((sum, d) => sum + savings(d), 0);
  const newLows = deals.filter((d) => d.verdict === 'new-low').length;
  const best = Math.max(...deals.map((d) => discountPct(d)));
  return `
    <div class="stat"><span class="stat-num">${deals.length}</span><span class="stat-label">deals checked</span></div>
    <div class="stat"><span class="stat-num">${money(totalSaved)}</span><span class="stat-label">total savings</span></div>
    <div class="stat"><span class="stat-num">${newLows}</span><span class="stat-label">new lows</span></div>
    <div class="stat"><span class="stat-num">−${best}%</span><span class="stat-label">biggest cut</span></div>
    <div class="stat"><span class="stat-num">${CHECKED_DATE}</span><span class="stat-label">prices checked</span></div>`;
}

/** Shown when no deal matches the current search and filters. */
export function emptyState() {
  return `
  <div class="empty">
    <p class="empty-title">No deals match that search.</p>
    <p class="empty-body">Try a different word, or clear a filter — every deal here was checked on ${CHECKED_DATE}.</p>
  </div>`;
}
