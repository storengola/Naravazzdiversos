# Naravazz Diversos - Encanto Feminino

Luxury beauty, cosmetics & personal care e-commerce website for **Naravazz Diversos** (Luanda, Angola).

**Live contact**
- WhatsApp: [+244 938 890 975](https://wa.me/244938890975)
- Instagram: [@naravazz_diversos](https://www.instagram.com/naravazz_diversos/)
- Store: Benfica - Rua Direita do Banco BFA, before Colégio Os Brilhantes

---

## Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 |
| Styles | Pure CSS (custom properties, mobile-first) |
| Logic | Vanilla JavaScript |
| Hosting | Cloudflare Pages |
| Media & live catalog | Cloudinary |
| Publish API | Cloudflare Worker (`worker/`) — holds secrets |
| Build | None — static files only |

No frameworks, no bundler, no dependencies in the frontend.

---

## Project structure

```
Naravassdiversos/
├── index.html          # Home (hero with store photo)
├── shop.html           # Catalog by category + sort dropdown
├── product.html        # Single product (query: ?id=)
├── cart.html           # Full cart page
├── checkout.html       # Checkout form → WhatsApp order
├── about.html          # Brand & location
├── contact.html        # Contact form → WhatsApp
├── delivery.html       # Luanda delivery rates
├── admin.html          # Staff admin panel (products, texts, media)
├── css/
│   ├── styles.css      # Design system & layout
│   └── admin.css       # Admin panel styles
├── js/
│   ├── products.js     # Default catalog + delivery zones (fallback)
│   ├── app.js          # Cart, i18n, shop, checkout + loads live catalog
│   └── admin.js        # Admin CRUD, Cloudinary media upload, publish via Worker
├── images/
│   ├── favicon.png     # Favicon (from logo)
│   ├── favicon-*.png   # 16 / 32 / 48 / 180 sizes
│   ├── logo.webp       # Brand logo
│   ├── hero-store.jpg  # Homepage hero background
│   ├── owner-nara.jpg  # Owner photo (homepage + about)
│   ├── cat-cabelo.jpg  # Category card - Cabelo
│   ├── cat-pele.jpg    # Category card - Pele
│   └── …               # Product images
├── videos/
│   ├── soaps.mp4                 # Owner presenting store soaps
│   ├── experiencia-loja.mp4
│   ├── experiencia-clientes.mp4
│   └── experiencia-depoimento.mp4
├── worker/             # Cloudflare Worker — catalog publish API
│   ├── src/index.js
│   ├── wrangler.toml
│   └── README.md
├── BLUEPRINT.md
└── README.md
```

---

## Features

- **Mobile-first** fully responsive layout
- **Portuguese (default)** + English language toggle (persisted in `localStorage`)
- **Favicon** generated from brand logo
- **Category pages** via `shop.html?cat=` (pele, corpo, cabelo, perfume, intimo, solar)
- **Sort dropdown** per category: Trending · Preço baixo para alto · Preço alto para baixo · Novos
- **Sliding cart panel** (side drawer) - open from header icon or mobile menu
- **Dedicated checkout page** with customer form (name, phone, address, notes)
- Shopping cart stored in `localStorage`
- **WhatsApp order** with pre-filled items + customer details
- Homepage **hero** uses store opening photo; CTA “Ver todos os produtos”
- Homepage product section after hero: single Top G-style block - arrows switch **Mais vendidos** / **Naravazz Favoritos** / **Novos na loja**; products scroll horizontally by hand (no infinite loop; arrows disable at ends; disjoint product lists)
- Homepage **Soaps** feature video (owner presents store soaps) after product collections, before categories - pauses when scrolled out of view
- Homepage **Kylie-style category cards** (full-bleed stacked on mobile, centered label overlay)
- Perucas merged under **Cabelo** (no separate category card)
- Homepage **A experiência Naravazz** video section (horizontal stories; play on tap with sound; mobile Safari playsinline)
- Homepage + About: **owner photo** (`images/owner-nara.jpg`) in about teaser
- Promo banner “Cuide da sua pele…” uses full-bleed solar products image
- Delivery zones table (Luanda areas)
- Luxury thin-line aesthetic (1px borders, light type, generous whitespace)
- Transparent header over hero → solid + blur on scroll
- Header brand name **Naravazz Diversos** larger than tagline **Nara Vazz** (Kylie-style hierarchy)
- Announcement bar always fixed on top above the header
- Hamburger bars switch to dark color when header is scrolled / on inner pages
- Thin hamburger → animated X + left slide-in drawer
- Full mobile drawer nav (categories) on About & Contact pages
- About page without page hero; Contact page without hero image
- Product count removed from shop toolbar

---

## Design system (summary)

- Primary: `#DF6D48` (brand orange)
- Surface: warm off-white `#FDF9F6`
- Radius: cards `14px`, buttons `10px`
- Typography: Inter (300–600), generous letter-spacing
- Buttons: filled, sentence case, soft corners (not capsules)

---

## Local preview

```bash
# Option 1 - any static server
npx serve .

# Option 2
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or `8080`).

You can also open `index.html` directly in the browser.

---

## Deploy on Cloudflare Pages

1. Push this folder to a GitHub repository.
2. Cloudflare Dashboard → **Pages** → Create project → Connect to Git.
3. Select the repository.
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (repository root)
5. Deploy.

Custom domain and HTTPS are handled by Cloudflare.

The **Worker** (`worker/`) is deployed separately — see [Admin panel → Publish via Worker](#publish-via-cloudflare-worker) and `worker/README.md`.

---

## Deploy on GitHub Pages

1. Push to a repository.
2. Settings → Pages → Source: Deploy from branch → `main` / root.
3. Site will be available at `https://<user>.github.io/<repo>/`.

---

## Adding / editing products

### Preferred (staff, any device)

Use **`admin.html`** → edit products / zones / texts → **Publicar na loja**.

This uploads a live `catalog.json` to Cloudinary. Every visitor loads it automatically. No need to touch `products.js` or redeploy the site.

### Fallback / defaults

Edit `js/products.js` only if you need a permanent default when the remote catalog is unavailable. Each product object looks like:

```js
{
  id: "unique-slug",
  name: "Nome em Português",
  nameEn: "Name in English",
  price: 4500,                    // Kz
  category: "corpo",              // pele | corpo | cabelo | perfume | intimo | solar
  categoryLabel: "Corpo",
  categoryLabelEn: "Body",
  image: "images/filename.jpg",
  badge: "Popular",               // optional - used for Trending sort
  desc: "Descrição PT...",
  descEn: "Description EN...",
  brand: "Brand name"
}
```

---

## Cart & checkout flow

1. **Add to cart** - opens the sliding cart panel automatically.
2. **Cart panel** - change quantities, remove items, go to checkout or full cart page.
3. **Cart page** (`cart.html`) - full list + summary.
4. **Checkout** (`checkout.html`) - customer form (name, phone, address, notes).
5. **Submit** - opens WhatsApp with order lines + customer details pre-filled.

- Cart data key: `nv_cart` in `localStorage`
- Delivery cost is calculated offline using the rates on `delivery.html`

---

## Category URLs

| Category | URL |
|----------|-----|
| All products | `shop.html` |
| Pele | `shop.html?cat=pele` |
| Corpo | `shop.html?cat=corpo` |
| Cabelo | `shop.html?cat=cabelo` |
| Perfumes | `shop.html?cat=perfume` |
| Íntimos | `shop.html?cat=intimo` |
| Solar | `shop.html?cat=solar` |

---

## Changelog (important)

**2026-10-14 (live catalog + Worker)**
- **Publicar na loja** writes `catalog.json` to Cloudinary so all visitors see updates without exporting `products.js` or redeploying
- Cloudflare Worker (`worker/`) holds Cloudinary API secret; phones only need the admin password to publish
- Admin settings: Worker publish URL is the primary path; API Key/Secret fields are optional fallback only

**2026-10-11 (owner photo + copy)**
- Homepage about teaser and About page use owner photo (`images/owner-nara.jpg`)
- Em dashes (`—`) removed from all site-facing text
- Soaps video replaced with longer owner presentation (lavanda, girassol, rosas, canela, alecrim, carvão, enxofre, açafrão…); description updated PT/EN

**2026-10-11 (collections polish)**
- Collection arrows no longer infinite-loop; prev/next disabled at first/last
- Mais vendidos / Naravazz Favoritos / Novos na loja use **disjoint** curated product lists (no overlap for demos)

**2026-10-11 (promo)**
- “Cuide da sua pele todos os dias” card: full-bleed background using solar products image

**2026-10-11 (homepage)**
- After hero: Top G-style single section - Mais vendidos · Naravazz Favoritos · Novos na loja (arrows switch collections; horizontal product scroll)
- Categories: Kylie-style full-width cards on mobile, name centered on image; Perucas merged into Cabelo (card removed)

**2026-10-11 (experience + soaps videos)**
- After categories: **A experiência Naravazz** (Kylie-style horizontal video stories)
- Three experience videos: loja tour, clientes / abertura, depoimento
- Tap to play **with sound**; only one at a time; pause when section leaves viewport
- Mobile Safari: `playsinline` + user-gesture play; scroll-vs-tap detection; debounce
- After product collections / before categories: **Soaps** feature video - **pauses / mutes when scrolled past**
- Videos in `videos/` (`soaps.mp4`, experiencia-*.mp4)

**2026-10-11 (header / pages)**
- Header brand **Naravazz Diversos** larger than tagline **Nara Vazz** (Kylie-style)
- Announcement bar always fixed on top
- Product count removed from shop toolbar
- About: no page hero; eyebrow “Naravazz Diversos”
- Contact: no page hero
- Full mobile drawer (categories) on About & Contact

**2026-10-11 (earlier)**
- Cart panel: “Limpar tudo / Clear all”; sliding cart + dedicated `checkout.html`
- Favicon from logo; project folder `Naravassdiversos`
- Category sort dropdown; hero store photo; CTA “Ver todos os produtos”
- Hamburger / header fixes on scroll and inner pages

---

## Admin panel

Staff can manage products, delivery zones, site copy and media at **`admin.html`**.

| Item | Detail |
|------|--------|
| URL | `/admin.html` |
| Default password | `naravazz2026` (change in Definições after first login) |
| Cloudinary account | `storengola@gmail.com` |

### What you can edit
- **Products** — add / edit / delete, price, category, badge, bilingual name & description, product image
- **Delivery zones** — names and prices (synced with checkout)
- **Site texts** — hero, promo banner, about, shop titles, etc. (PT + EN)
- **Media** — upload images/videos to Cloudinary; copy CDN URLs into products

### Cloudinary (configured)

| Setting | Value |
|---------|--------|
| Account | storengola@gmail.com |
| Cloud name | `mir8iioo` |
| Upload preset | `naravazz_unsigned` (unsigned) — used for **media** only |
| Folder | `naravazz` |
| Live catalog | `https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json` |

### How changes are applied

1. Edit in the admin
2. **Guardar rascunho** — saves overrides to `localStorage` (preview on the **same browser** only)
3. **Publicar na loja** — sends the catalog to the **Cloudflare Worker**, which does a signed upload of `catalog.json` to Cloudinary. **All visitors** then load the new data.

Storage keys: `nv_products_override`, `nv_zones_override`, `nv_texts_override`, `nv_cloudinary_cfg`, `nv_media_library`.

### Publish via Cloudflare Worker

The Worker (`worker/`, name `naravazz-api`) stores the Cloudinary API secret on the server. Staff phones **never** need the secret — only the admin password.

**Default publish URL (already set in admin):**

```text
https://naravazz-api.storengola.workers.dev/publish
```

**Deploy / secrets (once, from `worker/`):**

```bash
cd worker
npx wrangler deploy

npx wrangler secret put ADMIN_PASSWORD          # same as admin.html password
npx wrangler secret put CLOUDINARY_CLOUD_NAME   # mir8iioo
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

See `worker/README.md` for the full API.

**Fallback:** if the Worker URL is empty, admin can still publish with API Key + Secret stored only in that browser’s `localStorage` (not recommended for phones).

---

## Public site — how the catalog is loaded

1. Page loads `js/products.js` → default `PRODUCTS` and `DELIVERY_ZONES`.
2. `app.js` fetches the live catalog:
   ```text
   https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json
   ```
3. If the remote JSON is present, it replaces products, zones and texts for all visitors.
4. Same-browser admin drafts (`localStorage`) still take priority for the person editing.
5. If the remote fetch fails → defaults from `products.js` remain.

---

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge).  
Uses CSS custom properties, `backdrop-filter`, and ES6+.

---

## License / ownership

Client project for **Naravazz Diversos**.  
All product images and brand assets belong to the client.
