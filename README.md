# Catalogo P-Store

Catalogo web responsive en Next.js conectado a una Google Sheet publicada.

## Caracteristicas

- Catalogo visual con imagen tipo baldosa
- PDP de producto con imagen grande, precio y tallas
- Filtros por texto y categoria
- Orden por nombre o precio
- Datos cargados desde Google Sheets
- Optimizado para desplegarse en Vercel

## Fuente de datos

La app toma la URL publicada en ODS y la transforma a CSV para leerla facilmente desde el servidor:

```txt
https://docs.google.com/spreadsheets/d/e/2PACX-1vSo_ix7sDuQx8z-8B_ptsJ6rVtw4AIBjXsZUcQ9k_KCPK2fph9OMf_G1j9hXKIVaxeAzLVtQh8Xtu1M/pub?output=csv
```

## Instalar

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Sube esta carpeta a un repositorio en GitHub.
2. Conecta el repo a Vercel.
3. Vercel detectara Next.js automaticamente.
4. Haz deploy.

## Archivos clave

- `app/page.js` -> Home del catalogo
- `app/producto/[id]/page.js` -> PDP
- `components/catalog-view.js` -> Filtros y grid
- `lib/products.js` -> Conexion y normalizacion de datos
- `app/globals.css` -> Estilos de la experiencia

## Siguiente mejora sugerida

- Definir precio de venta real usando margen
- Agregar WhatsApp real por producto
- Añadir favoritos
- Añadir stock disponible exacto por talla
- Cambiar logo y branding final
