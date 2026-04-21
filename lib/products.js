import Papa from 'papaparse';

const SHEET_ODS_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSo_ix7sDuQx8z-8B_ptsJ6rVtw4AIBjXsZUcQ9k_KCPK2fph9OMf_G1j9hXKIVaxeAzLVtQh8Xtu1M/pub?output=ods';

const SHEET_CSV_URL = SHEET_ODS_URL.replace('output=ods', 'output=csv');

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function slugify(value = '') {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toNumber(value) {
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function capitalize(value = '') {
  if (!value) return '';
  const clean = String(value).trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function dedupe(array) {
  return [...new Set(array.filter(Boolean))];
}

function cleanLabel(value = '', fallback = '') {
  const clean = String(value || fallback)
    .replace(/^\d+\s*[-.]\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || fallback;
}

function cleanName(value = '') {
  const raw = String(value).trim();
  if (!raw) return 'Producto sin nombre';

  const pieces = raw.split('|').map((piece) => piece.trim()).filter(Boolean);
  if (pieces.length >= 2) {
    const lastPiece = pieces[pieces.length - 1];
    const looksLikeSize = /^[a-z0-9]{1,5}$/i.test(lastPiece);
    return looksLikeSize ? pieces.slice(0, -1).join(' | ') : pieces.join(' | ');
  }

  return raw;
}

function getPriceRange(rows, key) {
  const values = dedupe(rows.map((row) => toNumber(row[key])).filter((value) => value > 0));
  if (!values.length) return 0;
  return Math.min(...values);
}

function buildProductGroup(rows) {
  const first = rows[0];
  const department = cleanLabel(first.DEP, 'Catálogo');
  const category = cleanLabel(first.CLASE, department);
  const name = cleanName(first.NOM);
  const image = first['URL imagen'] || '/placeholder-product.svg';
  const sizes = dedupe(rows.map((row) => capitalize(row.talla)));
  const price = getPriceRange(rows, 'precio_venta');
  const compareCandidate = getPriceRange(rows, 'precio_lista');
  const compareAtPrice = compareCandidate > price ? compareCandidate : null;

  return {
    id: first['id-PRD'],
    skuIds: dedupe(rows.map((row) => row['id-SKU']).filter(Boolean)),
    slug: `${first['id-PRD']}-${slugify(name)}`,
    name,
    department,
    category,
    image,
    price,
    compareAtPrice,
    sizes,
    type: first.Tipo || 'Normal',
    description: `${name}. Disponible en tallas ${sizes.join(', ') || 'por confirmar'}.`,
    badges: dedupe([department, category]).filter(Boolean)
  };
}

async function readSheetRows() {
  const response = await fetch(SHEET_CSV_URL, {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar la Google Sheet publicada.');
  }

  const csvText = await response.text();
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => String(header).trim()
  });

  return data;
}

export async function getProducts() {
  const data = await readSheetRows();
  const grouped = new Map();

  for (const row of data) {
    const productId = row['id-PRD'];
    if (!productId) continue;
    const existing = grouped.get(productId) ?? [];
    existing.push(row);
    grouped.set(productId, existing);
  }

  return [...grouped.values()]
    .map(buildProductGroup)
    .filter((product) => product.name && product.image)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getProductBySlug(slug) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCatalogMeta() {
  const products = await getProducts();
  const categories = dedupe(products.map((product) => product.category));
  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    categories
  };
}
