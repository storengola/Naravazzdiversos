# Site + Admin Blueprint

Reusable architecture for small e‑commerce / brochure sites with a **staff admin panel**.  
Derived from Naravazz Diversos (Luanda). Copy this pattern to a new brand by renaming folders, WhatsApp number, Cloudinary folder, and Worker name.

---

### Stack

* Pure HTML / CSS / JS (no framework, no build step)
* **Cloudflare Pages** — static site
* **Cloudflare Worker** — publish API (holds Cloudinary secrets; phones only need admin password)
* **Cloudinary** — media uploads (unsigned preset) + live `catalog.json` (signed upload via Worker)
* **localStorage** — admin drafts / same-browser preview
* Orders via **WhatsApp** (no payment backend)

Optional later: Cloudflare KV for the catalog instead of Cloudinary raw JSON.

---

### Folders

```
project/
├── index.html, shop.html, product.html, cart.html, checkout.html …
├── admin.html                 # Staff panel (password-gated)
├── css/
│   ├── styles.css             # Public site (mobile-first, safe-area)
│   └── admin.css              # Admin UI (sticky actions, product cards, full-screen modals)
├── js/
│   ├── products.js            # Default PRODUCTS + DELIVERY_ZONES (fallback)
│   ├── app.js                 # Cart, i18n, shop + loads live catalog/images
│   └── admin.js               # CRUD, media, site images, publish via Worker
├── images/                    # Default static assets (hero, categories, gallery…)
├── videos/
├── worker/                    # Cloudflare Worker
│   ├── src/index.js
│   ├── wrangler.toml          # workers_dev = true, preview_urls = true
│   └── README.md
├── BLUEPRINT.md               # This file (reuse)
└── README.md                  # Client-specific notes
```

---

### Data model (live catalog)

Published file: **`catalog.json`** on Cloudinary (fixed `public_id`, e.g. `{folder}/catalog`).

```json
{
  "updatedAt": "2026-10-14T21:00:00.000Z",
  "products": [ { "id": "…", "name": "…", "price": 3500, "image": "…", … } ],
  "zones":    [ { "name": "Talatona", "price": 2000 } ],
  "texts":    { "pt": { "heroTitle": "…" }, "en": { "heroTitle": "…" } },
  "images":   { "hero": "https://…", "promo": "https://…", "cat_pele": "…" }
}
```

Remote URL pattern:

```text
https://res.cloudinary.com/{CLOUD_NAME}/raw/upload/{FOLDER}/catalog.json
```

---

### Public site (how data is read)

1. Load `products.js` → default `PRODUCTS` and `DELIVERY_ZONES`.
2. `app.js` fetches remote `catalog.json` (cache-bust `?t=`).
3. Apply in order:
   - **localStorage** drafts (admin preview on the **same browser**)
   - **Remote catalog** (everyone after publish)
4. If remote fails → keep defaults from `products.js` / static HTML images.
5. Cart: `localStorage` key `nv_cart`.
6. Checkout builds a WhatsApp deep link (`wa.me`). On mobile use `location.href` (Safari often blocks `window.open`).

**Site images on the page**

* Mark slots with `data-site-img="key"` on `<img>` / `<video poster>` and `data-site-img-bg="key"` on sections that use CSS backgrounds.
* CSS uses variables with fallbacks, e.g. `background: var(--hero-bg, url('../images/hero-store.jpg'))`.
* `applySiteImages()` merges remote `images` + `nv_images_override` and sets `src` / CSS variables.

---

### Admin panel (staff)

| Area | localStorage draft | Publish (everyone) |
|------|--------------------|--------------------|
| Products | `nv_products_override` | `catalog.json` → products |
| Delivery zones | `nv_zones_override` | zones |
| Site texts (i18n) | `nv_texts_override` | texts |
| Site images (hero, promo, categories…) | `nv_images_override` | images |
| Media library list | `nv_media_library` | not published as a list; URLs used on products/slots |

**Login:** password in `sessionStorage` / `localStorage` (simple gate, not bank-grade).

**Buttons**

* **Guardar rascunho** — write overrides to this browser only.
* **Publicar na loja** — POST `{ password, catalog }` to the Worker → signed Cloudinary upload of `catalog.json`.

**Site images UX (no manual URLs)**

* Panel **Imagens do site**: one card per slot (preview + **Carregar** / **Escolher da média** / **Original**).
* **Carregar** uploads to Cloudinary and assigns the returned URL to the slot.
* **Escolher da média** opens the media library grid; tap an image to assign.
* Staff never need to copy-paste CDN URLs for site slots.

**Media library**

* Upload via unsigned preset (browser).
* **URL** copies link; **✕** removes the entry from the **browser library only** (does not destroy the Cloudinary asset — free storage via Cloudinary dashboard or a signed destroy API later).

**Dashboard**

* Stats + written staff guide (language of the market) explaining draft vs publish, each menu, mobile tips, and “if something breaks → contact the developer”.

---

### Publish architecture (Worker)

**Problem:** signed Cloudinary uploads need the API secret; putting it in the browser or on a phone is unsafe.

**Solution:** small Worker holds secrets. Admin sends only:

```json
{ "password": "…", "catalog": { "products": [], "zones": [], "texts": {}, "images": {} } }
```

to e.g. `https://{name}.{account}.workers.dev/publish`.

Worker checks `ADMIN_PASSWORD`, signs the raw upload, writes `{folder}/catalog`.

**Deploy**

```bash
cd worker
npx wrangler deploy
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

`wrangler.toml`: `workers_dev = true`, `preview_urls = true` (avoids Wrangler warning).

**Fallback:** if publish URL is empty, admin can still use API key/secret stored only in that browser’s `localStorage` (avoid on shared phones).

---

### Cloudinary

| Item | Role |
|------|------|
| Cloud name | In public URLs |
| Unsigned upload preset | Browser media + product photos |
| API key + secret | **Only on the Worker** (or one desktop localStorage as fallback) |
| Folder | e.g. `clientname` — group assets |
| Catalog `public_id` | e.g. `clientname/catalog` (overwrite each publish) |

Media preset: unsigned, overwrite off, unique filenames.  
Catalog: signed raw upload via Worker only.

---

### Mobile UX (required pattern)

**Admin**

* Sticky bottom **Guardar / Publicar** under ~900px + `safe-area-inset-bottom`
* Product list → **cards** on small screens (hide table)
* Full-viewport product modal on mobile
* Touch targets ≥ 44px; inputs `font-size: 16px` (no iOS zoom)
* `inputmode="decimal"` / `tel` on price and phone fields
* Toast centered above sticky bar
* Confirm before publish (mention products + zones + texts + images)

**Public**

* `viewport-fit=cover` + safe-area on fixed header / cart / sticky CTAs
* Sticky product **Add to cart** bar on mobile
* Larger qty controls in cart drawer
* WhatsApp via `location.href` on mobile UA

---

### Security model

* **Unsigned media:** anyone who knows cloud name + preset can upload; cannot access dashboard or secret. Keep overwrite off.
* **Catalog:** only Worker with correct admin password can overwrite `catalog.json`.
* Change default admin password after handoff.
* Media “delete” in admin = library list only; true file deletion needs Cloudinary dashboard or signed destroy.

---

### Staff workflow

1. `/admin.html` → password.
2. Edit products / zones / texts / site images / upload media.
3. Optional **Guardar rascunho** → preview shop in the same browser.
4. **Publicar na loja** → all visitors get new catalog on next load.

No manual `products.js` export. No site redeploy for catalog or site-image changes (only for HTML/CSS/JS code changes).

---

### Copy-paste checklist for a **new** website

- [ ] Clone structure: static pages + `admin.html` + `css/` + `js/` + `worker/`
- [ ] Rename brand, WhatsApp, Instagram, address, currency label
- [ ] New Cloudinary cloud/folder + **unsigned** preset (media only)
- [ ] New Worker name + four secrets; set `PUBLISH_URL` default in admin.js
- [ ] Point `CATALOG_JSON_URL` in `app.js` at the new catalog URL
- [ ] Set `DEFAULT_SITE_IMAGES` + `SITE_IMAGE_SLOTS` to match this site’s `data-site-img*` hooks
- [ ] Seed `products.js` + default images under `images/`
- [ ] Change default admin password
- [ ] Deploy Pages (or static host) + deploy Worker
- [ ] Smoke-test: upload image → assign site slot → publish → hard-refresh public site
- [ ] Optional: Cloudflare Access in front of `/admin.html`

---

### What this stack is good for

* Small shops, beauty, local delivery, WhatsApp orders  
* Staff updating prices, photos, and homepage imagery from a phone  
* Low cost (Cloudinary free credits + Cloudflare free tier)  
* Secrets stay on the server  

### What it is not

* Multi-warehouse inventory / strong multi-user auth  
* PCI card payments  
* Automatic deletion of Cloudinary binaries from the admin UI (without extra Worker endpoints)

---

*Adapt names, WhatsApp number, Cloudinary folder, Worker name, and image slot keys per client.*
