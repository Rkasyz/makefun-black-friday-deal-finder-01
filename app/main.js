// FridayFinds wiring — state, events and hash routing.
// Renders the grid from deals.js through render.js; filters.js does the math.

import { CATEGORIES, DEALS, STORES } from './deals.js';
import { applyFilters, sortDeals } from './filters.js';
import { dealCard, dealDetail, emptyState, statsBar } from './render.js';

const state = {
  query: '',
  category: 'all',
  store: 'all',
  minDiscount: 0,
  sort: 'discount',
};

const grid = document.getElementById('grid');
const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');
const resultCount = document.getElementById('result-count');
const searchInput = document.getElementById('search');
const categoryChips = document.getElementById('category-chips');
const storeSelect = document.getElementById('store-filter');
const discountSelect = document.getElementById('discount-filter');
const sortSelect = document.getElementById('sort');

function buildCategoryChips() {
  const chips = ['All', ...CATEGORIES].map((name) => {
    const value = name === 'All' ? 'all' : name;
    const active = value === state.category ? ' chip-active' : '';
    return `<button type="button" class="chip${active}" data-category="${value}">${name}</button>`;
  });
  categoryChips.innerHTML = chips.join('');
}

function buildStoreOptions() {
  storeSelect.innerHTML =
    '<option value="all">All stores</option>' +
    STORES.map((s) => `<option value="${s}">${s}</option>`).join('');
}

function renderList() {
  const filtered = sortDeals(applyFilters(DEALS, state), state.sort);
  grid.innerHTML = filtered.length ? filtered.map(dealCard).join('') : emptyState();
  const word = filtered.length === 1 ? 'deal' : 'deals';
  resultCount.textContent = `${filtered.length} ${word} · sorted by ${sortSelect.options[sortSelect.selectedIndex].text.toLowerCase()}`;
}

function renderDetail(id) {
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) {
    location.hash = '#/';
    return;
  }
  detailView.innerHTML = dealDetail(deal);
  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo(0, 0);
}

function renderRoute() {
  const match = location.hash.match(/^#\/deal\/([\w-]+)$/);
  if (match) {
    renderDetail(match[1]);
  } else {
    detailView.innerHTML = '';
    detailView.hidden = true;
    listView.hidden = false;
    renderList();
  }
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  renderList();
});

categoryChips.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  buildCategoryChips();
  renderList();
});

storeSelect.addEventListener('change', () => {
  state.store = storeSelect.value;
  renderList();
});

discountSelect.addEventListener('change', () => {
  state.minDiscount = Number(discountSelect.value);
  renderList();
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  renderList();
});

window.addEventListener('hashchange', renderRoute);

function readStateFromUrl() {
  // Shareable filtered links: ?q=airpods&category=Audio&store=Amazon&discount=40&sort=savings
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) {
    state.query = q;
    searchInput.value = q;
  }
  const category = params.get('category');
  if (category && (category === 'all' || CATEGORIES.includes(category))) {
    state.category = category;
    buildCategoryChips();
  }
  const store = params.get('store');
  if (store && (store === 'all' || STORES.includes(store))) {
    state.store = store;
    storeSelect.value = store;
  }
  const discount = Number(params.get('discount'));
  if ([20, 30, 40, 50].includes(discount)) {
    state.minDiscount = discount;
    discountSelect.value = String(discount);
  }
  const sort = params.get('sort');
  if (['discount', 'savings', 'price', 'verdict'].includes(sort)) {
    state.sort = sort;
    sortSelect.value = sort;
  }
}

document.getElementById('stats').innerHTML = statsBar(DEALS);
buildCategoryChips();
buildStoreOptions();
readStateFromUrl();
renderRoute();
