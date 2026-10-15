import localCategories from '@/data/categories.json';
import localProducts from '@/data/products.json';

const API_URLS = [
  'https://openapi.programming-hero.com/api/bazardor',
  'https://api.api-store.workers.dev/api/bazardor',
  'https://api.abcz.workers.dev/api/bazardor',
];

function pickArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.products)) return result.products;
  if (Array.isArray(result?.categories)) return result.categories;
  return [];
}

async function fetchList(endpoint, fallback) {
  for (const base of API_URLS) {
    try {
      const response = await fetch(`${base}/${endpoint}`, {
        next: { revalidate: 300 },
      });
      if (!response.ok) continue;

      const list = pickArray(await response.json());
      if (list.length > 0) return list;
    } catch (error) {
      console.error(`API error (${base}/${endpoint}):`, error);
    }
  }

  return fallback;
}

export function fetchProducts() {
  return fetchList('products', localProducts);
}

export function fetchCategories() {
  return fetchList('categories', localCategories);
}

export async function fetchProductBySlug(slug) {
  const products = await fetchProducts();
  return products.find(product => product.slug === slug) ?? null;
}

export async function fetchProductsByCategory(categorySlug) {
  const products = await fetchProducts();
  return products.filter(
    product =>
      product.category === categorySlug ||
      product.categorySlug === categorySlug,
  );
}

export function getCategories() {
  return localCategories;
}

export function getProducts() {
  return localProducts;
}

export function getProductBySlug(slug) {
  return localProducts.find(product => product.slug === slug) ?? null;
}

export function getCategoryBySlug(slug) {
  return localCategories.find(category => category.slug === slug) ?? null;
}

export function getProductsByCategory(categorySlug) {
  return localProducts.filter(
    product =>
      product.categorySlug === categorySlug ||
      product.category === categorySlug,
  );
}

export function bn(value, options = {}) {
  const number = Number(value);
  return new Intl.NumberFormat('bn-BD', {
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(number) ? number : 0);
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function parseNumber(value) {
  if (typeof value === 'number') return value;

  const normalized = String(value ?? '')
    .replace(/[০-৯]/g, digit => BN_DIGITS.indexOf(digit))
    .replace(/[^0-9.]/g, '');

  const number = parseFloat(normalized);
  return Number.isFinite(number) ? number : 0;
}

const UNITS = {
  kg: 'কেজি',
  litre: 'লিটার',
  liter: 'লিটার',
  dozen: 'ডজন',
  piece: 'পিস',
};

export function unitShort(unit) {
  return UNITS[unit?.toLowerCase()] || unit || 'একক';
}

// per kg
export function unitLabel(unit) {
  return `প্রতি ${unitShort(unit)}`;
}

export function formatTaka(value) {
  return `${bn(value)} টাকা`;
}

export function getChange(change) {
  const pct = Math.abs(Number(change?.pct || 0));
  const text = bn(pct, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  if (change?.dir === 'up') {
    return { dir: 'up', symbol: '▲', pct, label: `▲ ${text}%` };
  }
  if (change?.dir === 'down') {
    return { dir: 'down', symbol: '▼', pct, label: `▼ ${text}%` };
  }
  return {
    dir: 'flat',
    symbol: '—',
    pct: 0,
    label: `—${bn(0, { minimumFractionDigits: 1 })}%`,
  };
}

export function sortProducts(products, mode = 'default') {
  const list = [...products];
  if (mode === 'asc') {
    return list.sort((a, b) => parseNumber(a.today) - parseNumber(b.today));
  }
  if (mode === 'desc') {
    return list.sort((a, b) => parseNumber(b.today) - parseNumber(a.today));
  }
  return list;
}

export function getTopRisers(products, limit = 6) {
  return products
    .filter(product => product.change?.dir === 'up')
    .sort((a, b) => parseNumber(b.change?.pct) - parseNumber(a.change?.pct))
    .slice(0, limit);
}

export function getTopFallers(products, limit = 6) {
  return products
    .filter(product => product.change?.dir === 'down')
    .sort((a, b) => parseNumber(b.change?.pct) - parseNumber(a.change?.pct))
    .slice(0, limit);
}

export function getPriceStats(product) {
  const markets = product?.markets ?? [];

  if (markets.length === 0) {
    const today = parseNumber(product?.today);
    return { min: today, max: today, avg: today, marketCount: 0 };
  }

  const mins = markets.map(m => parseNumber(m.min));
  const maxs = markets.map(m => parseNumber(m.max));
  const mids = markets.map((m, i) => (mins[i] + maxs[i]) / 2);

  return {
    min: Math.min(...mins),
    max: Math.max(...maxs),
    avg: mids.reduce((sum, value) => sum + value, 0) / mids.length,
    marketCount: markets.length,
  };
}

export function groupMarketsByDivision(markets = []) {
  const groups = new Map();

  for (const market of markets) {
    const division = market.division || 'অন্যান্য';
    if (!groups.has(division)) groups.set(division, []);
    groups.get(division).push(market);
  }

  return [...groups.entries()].map(([division, items]) => ({
    division,
    markets: items,
  }));
}
