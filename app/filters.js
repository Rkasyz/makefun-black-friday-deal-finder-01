// FridayFinds filtering and sorting — pure functions over the deal list.
// No DOM here: render.js owns the page, main.js owns the events.

/** Whole-percent discount, computed from the two prices. */
export function discountPct(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

/** Dollars saved, rounded to cents. */
export function savings(deal) {
  return Math.round((deal.usual - deal.sale) * 100) / 100;
}

function verdictRank(deal) {
  // New lows first, then strong deals, then routine ones.
  return { 'new-low': 0, strong: 1, routine: 2 }[deal.verdict] ?? 3;
}

/**
 * Filter deals by the shopper's choices.
 * query: free text matched against name, spec, store and category.
 * category / store: exact match, or 'all'.
 * minDiscount: minimum whole-percent discount, 0 means no floor.
 */
export function applyFilters(deals, { query = '', category = 'all', store = 'all', minDiscount = 0 }) {
  const needle = query.trim().toLowerCase();
  return deals.filter((deal) => {
    if (category !== 'all' && deal.category !== category) return false;
    if (store !== 'all' && deal.store !== store) return false;
    if (discountPct(deal) < minDiscount) return false;
    if (needle) {
      const haystack = `${deal.name} ${deal.spec} ${deal.store} ${deal.category}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

/**
 * Sort a filtered list. Keys:
 * - 'discount': biggest discount first, then biggest saving
 * - 'price': lowest sale price first
 * - 'savings': biggest dollar saving first
 * - 'verdict': best verdict first, then biggest discount
 */
export function sortDeals(deals, key) {
  const list = [...deals];
  switch (key) {
    case 'price':
      return list.sort((a, b) => a.sale - b.sale);
    case 'savings':
      return list.sort((a, b) => savings(b) - savings(a));
    case 'verdict':
      return list.sort((a, b) => verdictRank(a) - verdictRank(b) || discountPct(b) - discountPct(a));
    case 'discount':
    default:
      return list.sort((a, b) => discountPct(b) - discountPct(a) || savings(b) - savings(a));
  }
}
