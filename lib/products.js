import Papa from 'papaparse';
import colorFallback from './color-fallback.json';

const SHEET_PUBLISHED_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSo_ix7sDuQx8z-8B_ptsJ6rVtw4AIBjXsZUcQ9k_KCPK2fph9OMf_G1j9hXKIVaxeAzLVtQh8Xtu1M/pub';
const DEFAULT_CATALOG_CSV_URL = `${SHEET_PUBLISHED_URL}?output=csv`;
const PUBLISHED_HTML_URL = SHEET_PUBLISHED_URL.replace('/pub', '/pubhtml');
const FALLBACK_SWATCH = '#d1d5db';

let publishedSheetMapPromise;

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeKey(value = '') {
  return normalizeText(value).toLowerCase();
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

function dedupe(array) {
  return [...new Set(array.filter(Boolean))];
}

function capitalizeWords(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ');
}

function cleanLabel(value = '', fallback = '') {
  const clean = String(value || fallback)
    .replace(/^\d+\s*[-.]\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || fallback;
}

function isHexColor(value = '') {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value).trim());
}

function buildColorLookup(rows = []) {
  const lookup = new Map();

  [...colorFallback, ...rows].forEach((row) => {
    const rawName = row?.Color ?? row?.color ?? '';
    const key = normalizeKey(rawName);
    if (!key) return;

    const rawHex = row?.Hexadecimal ?? row?.hex ?? null;
    const hex = isHexColor(rawHex) ? String(rawHex).trim() : null;

    lookup.set(key, {
      name: capitalizeWords(rawName),
      hex
    });
  });

  return lookup;
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function getPublishedSheetMap() {
  if (!publishedSheetMapPromise) {
    publishedSheetMapPromise = (async () => {
      try {
        const response = await fetch(PUBLISHED_HTML_URL, { next: { revalidate: 300 } });
        if (!response.ok) return {};
        const html = await response.text();
        const entries = [...html.matchAll(/href="[^"]*gid=(\d+)[^"]*"[^>]*>(.*?)<\/a>/gis)]
          .map((match) => {
            const gid = match[1];
            const name = decodeEntities(match[2].replace(/<[^>]+>/g, '').trim());
            return [normalizeKey(name), gid];
          })
          .filter(([name, gid]) => name && gid);

        return Object.fromEntries(entries);
      } catch {
        return {};
      }
    })();
  }

  return publishedSheetMapPromise;
}

async function parseCsvUrl(url) {
  const response = await fetch(url, { next: { revalidate: 300 } });
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

async function readCatalogRows() {
  return parseCsvUrl(DEFAULT_CATALOG_CSV_URL);
}

async function readColorRows() {
  const sheetMap = await getPublishedSheetMap();
  const gid = sheetMap[normalizeKey('tb_colores')];

  if (!gid) {
    return colorFallback;
  }

  try {
    return await parseCsvUrl(`${SHEET_PUBLISHED_URL}?gid=${gid}&single=true&output=csv`);
  } catch {
    return colorFallback;
  }
}

function getPriceRange(rows, key) {
  const values = dedupe(rows.map((row) => toNumber(row[key])).filter((value) => value > 0));
  if (!values.length) return 0;
  return Math.min(...values);
}

function cleanName(value = '', row = {}) {
  const raw = String(value).trim();
  if (!raw) return 'Producto sin nombre';

  const pieces = raw.split('|').map((piece) => piece.trim()).filter(Boolean);
  if (!pieces.length) return raw;

  const normalizedColor = normalizeKey(row.color);
  const normalizedSize = normalizeKey(row.talla);

  while (pieces.length) {
    const lastPiece = pieces[pieces.length - 1];
    const normalizedLast = normalizeKey(lastPiece);
    const looksLikeSize = normalizedLast === normalizedSize || /^[a-z0-9]{1,5}$/i.test(lastPiece);

    if (looksLikeSize || normalizedLast === normalizedColor) {
      pieces.pop();
      continue;
    }

    break;
  }

  return pieces.join(' | ') || raw;
}

function buildVariant(row, colorLookup) {
  const colorKey = normalizeKey(row.color || 'color por confirmar');
  const colorData = colorLookup.get(colorKey);
  const inventory = Math.max(0, Math.trunc(toNumber(row.inventario)));
  const price = toNumber(row.precio_venta);
  const compareCandidate = toNumber(row.precio_lista);
  const compareAtPrice = compareCandidate > price ? compareCandidate : null;

  return {
    sku: row['id-SKU'] || '',
    size: String(row.talla || '').trim().toUpperCase(),
    colorKey,
    colorName: colorData?.name || capitalizeWords(row.color || 'Color por confirmar'),
    colorHex: colorData?.hex || null,
    swatchColor: colorData?.hex || FALLBACK_SWATCH,
    inventory,
    price,
    compareAtPrice,
    image: row['URL imagen'] || '/placeholder-product.svg'
  };
}

function buildProductGroup(rows, colorLookup) {
  const first = rows[0];
  const variants = rows
    .map((row) => buildVariant(row, colorLookup))
    .sort((a, b) => {
      if (a.colorName !== b.colorName) return a.colorName.localeCompare(b.colorName, 'es');
      return a.size.localeCompare(b.size, 'es');
    });

  const colors = Array.from(
    variants.reduce((map, variant) => {
      if (!map.has(variant.colorKey)) {
        map.set(variant.colorKey, {
          key: variant.colorKey,
          name: variant.colorName,
          hex: variant.colorHex,
          swatchColor: variant.swatchColor,
          hasPattern: !variant.colorHex
        });
      }
      return map;
    }, new Map()).values()
  );

  const sizes = dedupe(variants.map((variant) => variant.size));
  const availableInventory = variants.reduce((total, variant) => total + variant.inventory, 0);
  const price = getPriceRange(rows, 'precio_venta');
  const compareCandidate = getPriceRange(rows, 'precio_lista');
  const compareAtPrice = compareCandidate > price ? compareCandidate : null;
  const baseName = cleanName(first.NOM, first);
  const department = cleanLabel(first.DEP, 'Catálogo');
  const category = cleanLabel(first.CLASE, department);

  return {
    id: first['id-PRD'],
    skuIds: dedupe(rows.map((row) => row['id-SKU']).filter(Boolean)),
    slug: `${first['id-PRD']}-${slugify(baseName)}`,
    name: baseName,
    department,
    category,
    image: first['URL imagen'] || '/placeholder-product.svg',
    price,
    compareAtPrice,
    sizes,
    colors,
    variants,
    totalInventory: availableInventory,
    hasLowStock: variants.some((variant) => variant.inventory > 0 && variant.inventory < 3),
    type: first.Tipo || 'Normal',
    description: `${baseName}. Disponible en ${colors.length} color${colors.length === 1 ? '' : 'es'} y tallas ${sizes.join(', ') || 'por confirmar'}.`,
    badges: dedupe([department, category]).filter(Boolean)
  };
}

export async function getProducts() {
  const [catalogRows, colorRows] = await Promise.all([readCatalogRows(), readColorRows()]);
  const colorLookup = buildColorLookup(colorRows);
  const grouped = new Map();

  const filteredRows = catalogRows.filter((row) => normalizeKey(row.Tipo) === 'normal');

  for (const row of filteredRows) {
    const productId = row['id-PRD'];
    if (!productId) continue;
    const existing = grouped.get(productId) ?? [];
    existing.push(row);
    grouped.set(productId, existing);
  }

  return [...grouped.values()]
    .map((rows) => buildProductGroup(rows, colorLookup))
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
