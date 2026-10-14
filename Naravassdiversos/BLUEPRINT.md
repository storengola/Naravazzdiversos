# Site + Admin Blueprint

Reusable architecture for small e‑commerce / brochure sites with a staff admin panel.

---

### Stack

* Pure HTML / CSS / JS (no framework, no build step)
* Ready for **Cloudflare Pages** or **Workers** + **GitHub**
* **Cloudinary** — images, videos, and optional live catalog JSON
* **localStorage** — admin draft / same-browser preview
* Optional later: **Cloudflare KV** (free, no card) instead of Cloudinary JSON

---

### Folders

```
project/
├── index.html
├── shop.html / product.html / cart.html / checkout.html …
├── admin.html                 # Staff panel (password-gated)
├── css/
│   ├── styles.css             # Public site
│   └── admin.css              # Admin UI
├── js/
│   ├── products.js            # Default catalog + delivery zones (shipped with site)
│   ├── app.js                 # Cart, i18n, shop logic + loads live overrides
│   └── admin.js               # Admin CRUD, Cloudinary upload, publish
├── images/                    # Fallback / static assets
├── videos/
└── README.md / BLUEPRINT.md
```

---

### Public site (how data is read)

1. Page loads `products.js` → defines `PRODUCTS` and `DELIVERY_ZONES`.
2. `app.js` then tries **live overrides** (in order):
   - `localStorage` keys (admin preview on same browser)
   - Remote **Cloudinary JSON** (published catalog for all visitors)
3. If remote JSON fails or is empty → keep defaults from `products.js`.
4. Cart stays in `localStorage` (`nv_cart`).
5. Orders go out via **WhatsApp** link (no backend checkout).

**Remote catalog URL pattern (Cloudinary):**

```text
https://res.cloudinary.com/{CLOUD_NAME}/raw/upload/{FOLDER}/catalog.json
```

Example:

```text
https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json
```

`catalog.json` shape:

```json
{
  "updatedAt": "2026-10-14T17:00:00.000Z",
  "products": [ { "id": "...", "name": "...", "price": 3500, ... } ],
  "zones":    [ { "name": "Talatona", "price": 2000 }, ... ],
  "texts":    { "pt": { "heroTitle": "..." }, "en": { "heroTitle": "..." } }
}
```

---

### Admin panel (how staff change things)

| Area | Storage while editing | Publish (everyone sees it) |
|------|------------------------|----------------------------|
| Products | `localStorage` `nv_products_override` | Upload `catalog.json` to Cloudinary |
| Delivery zones | `nv_zones_override` | Same JSON |
| Site texts (i18n) | `nv_texts_override` | Same JSON |
| Media (images/videos) | Upload → Cloudinary CDN URL | URL saved on product / used in pages |

**Login:** simple password in `sessionStorage` / `localStorage` (change default after first use). Not bank-grade; enough to keep the URL from casual visitors.

**Buttons:**

* **Guardar rascunho** — write overrides to `localStorage` (preview on this browser only).
* **Publicar na loja** — build `catalog.json` + **signed** raw upload (`public_id` `naravazz/catalog`) using API key/secret from staff browser localStorage → live site fetches it.
* **Exportar products.js** — optional backup / offline deploy.

Note: Cloudinary **disallows overwrite on unsigned presets**. Media stays unsigned; catalog publish is signed.

---

### Cloudinary

| Item | Role |
|------|------|
| **Cloud name** | Account id in URLs (`mir8iioo`) |
| **API key + secret** | Dashboard / server only — **never** in frontend JS |
| **Upload preset (unsigned)** | Allows browser upload without secret |
| **Folder** | e.g. `naravazz` — keeps assets grouped |

**Preset (example `naravazz_unsigned`):**

* Mode: **Unsigned**
* Folder: `naravazz`
* Allowed formats: jpg, png, webp, gif, jpeg, mp4, webm (+ `json` if you publish catalog this way)
* Overwrite: decide deliberately (see security below)

**Upload (browser):**

```http
POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
POST https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload   ← for catalog.json
```

Form fields: `file`, `upload_preset`, optional `folder`, optional `public_id` (e.g. `naravazz/catalog`).

---

### Security model (unsigned preset)

**What a preset is:** a named rule set on Cloudinary so uploads can skip the API secret.

**Who can upload:** anyone who knows **cloud name + preset name** (both appear in frontend JS / Network tab).

**They can:** upload new files into the folder; if overwrite is on and they know `public_id`, replace a file.

**They cannot:** open your Cloudinary dashboard, read the API secret, or change billing.

**Hardening options:**

1. Overwrite **off** for media; use unique filenames.
2. For `catalog.json`, use a fixed `public_id` + overwrite **on** only if you accept that risk, **or** publish via a small Worker with signed upload.
3. Long term: **Cloudflare KV** (free, no card) + Worker with a staff token — no public write of the catalog.

---

### Cloudflare deploy

* **Pages:** connect GitHub repo → build command none → output root of static files.
* **Workers (static assets):** upload/sync the same folder; route `/*` to assets.
* After adding `admin.html`, `css/admin.css`, `js/admin.js`, redeploy so `/admin.html` is live.

Env you might document in README (not secrets):

```text
CLOUDINARY_CLOUD_NAME=mir8iioo
CLOUDINARY_UPLOAD_PRESET=naravazz_unsigned
CLOUDINARY_FOLDER=naravazz
CATALOG_URL=https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json
```

---

### Staff workflow (target)

1. Open `/admin.html` → password.
2. Edit products / zones / texts / upload media.
3. **Guardar** → check the shop in the same browser.
4. **Publicar** → `catalog.json` goes to Cloudinary → all visitors get the new data on next load (cache-bust with `?v=timestamp` if needed).

No manual `products.js` upload required once Publicar is wired.

---

### Copy-paste checklist for a new website

- [ ] Static HTML/CSS/JS structure as above  
- [ ] `products.js` defaults + `app.js` loader (localStorage → remote JSON → defaults)  
- [ ] Cloudinary account + **unsigned** preset + folder  
- [ ] `admin.html` / `admin.css` / `admin.js` (CRUD + upload + publish JSON)  
- [ ] Change default admin password  
- [ ] Deploy to Pages/Workers  
- [ ] Optional: Worker + KV when you outgrow unsigned catalog writes  

---

### What this stack is good for

* Small shops, beauty, local delivery, WhatsApp orders  
* Staff editing prices and photos without a developer every time  
* Zero/low cost (Cloudinary free credits + Cloudflare free tier)

### What it is not

* Multi-warehouse inventory with strong auth  
* PCI card payments (use WhatsApp / external checkout)  
* High-security admin without a backend

---

*Derived from the Naravazz Diversos project (Luanda). Adapt names, WhatsApp number, and Cloudinary folder per client.*
