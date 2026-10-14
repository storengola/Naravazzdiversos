# Site + Admin Blueprint

Reusable architecture for small e‑commerce / brochure sites with a staff admin panel.

---

### Stack

* Pure HTML / CSS / JS (no framework, no build step)
* **Cloudflare Pages** (static site) + **Cloudflare Worker** (publish API)
* **Cloudinary** — media (unsigned) + live catalog JSON (signed via Worker)
* **localStorage** — admin draft / same-browser preview
* Optional later: **Cloudflare KV** instead of Cloudinary for the catalog

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
│   ├── products.js            # Default catalog + delivery zones (fallback)
│   ├── app.js                 # Cart, i18n, shop logic + loads live catalog
│   └── admin.js               # Admin CRUD, Cloudinary media, publish via Worker
├── images/                    # Fallback / static assets
├── videos/
├── worker/                    # Cloudflare Worker — holds Cloudinary secret
│   ├── src/index.js
│   ├── wrangler.toml
│   └── README.md
└── README.md / BLUEPRINT.md
```

---

### Public site (how data is read)

1. Page loads `products.js` → defines `PRODUCTS` and `DELIVERY_ZONES`.
2. `app.js` then applies live data (in order):
   - `localStorage` keys (admin preview on the **same browser**)
   - Remote **Cloudinary JSON** (published catalog for **all** visitors)
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
| Products | `localStorage` `nv_products_override` | `catalog.json` → Cloudinary (via Worker) |
| Delivery zones | `nv_zones_override` | Same JSON |
| Site texts (i18n) | `nv_texts_override` | Same JSON |
| Media (images/videos) | Upload → Cloudinary CDN URL | URL saved on product / used in pages |

**Login:** simple password in `sessionStorage` / `localStorage` (change default after first use). Not bank-grade; enough to keep the URL from casual visitors.

**Buttons:**

* **Guardar rascunho** — write overrides to `localStorage` (preview on this browser only).
* **Publicar na loja** — POST catalog + admin password to the **Cloudflare Worker**. Worker verifies password, signs the upload, writes `naravazz/catalog.json` to Cloudinary. Live site fetches it on next load.

---

### Publish architecture (Worker)

**Problem solved:** Cloudinary signed uploads need the API secret. Putting the secret in the browser (or asking staff to type it on a phone) is unsafe and painful.

**Solution:** a small Cloudflare Worker holds the secrets. The admin frontend only sends:

```json
{ "password": "…", "catalog": { "products": [], "zones": [], "texts": {} } }
```

to:

```text
https://naravazz-api.storengola.workers.dev/publish
```

Worker checks `ADMIN_PASSWORD`, then performs the signed Cloudinary raw upload.

**Deploy (once):**

```bash
cd worker
npx wrangler deploy
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

Staff flow on any device (including phones):

1. Open `/admin.html` → log in with admin password.
2. Edit → **Publicar na loja**.
3. Worker authenticates → signed upload → shop loads new JSON.

No Cloudinary secret on the phone. No manual `products.js` export required.

**Fallback:** if the Worker URL is empty in Definições, admin can still publish with API Key + Secret stored only in that browser’s `localStorage` (desktop convenience; avoid on shared/phone browsers).

---

### Cloudinary

| Item | Role |
|------|------|
| **Cloud name** | Account id in URLs (`mir8iioo`) |
| **API key + secret** | Stored only on the **Worker** (or optionally in one browser’s localStorage as fallback) — **never** committed to the repo |
| **Upload preset (unsigned)** | Browser media uploads only (`naravazz_unsigned`) |
| **Folder** | e.g. `naravazz` — keeps assets grouped |
| **Catalog public_id** | `naravazz/catalog` (fixed; overwrite on each publish) |

**Preset (example `naravazz_unsigned`):**

* Mode: **Unsigned**
* Folder: `naravazz`
* Allowed formats: jpg, png, webp, gif, jpeg, mp4, webm
* Overwrite: off for media (unique filenames)

**Media upload (browser, unsigned):**

```http
POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
POST https://api.cloudinary.com/v1_1/{cloud_name}/video/upload
```

Form fields: `file`, `upload_preset`, optional `folder`.

**Catalog publish (Worker, signed):**

```http
POST https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload
```

Signed with `public_id` + `timestamp` + API secret (handled entirely inside the Worker).

---

### Security model

**Media (unsigned preset)**  
Anyone who knows cloud name + preset name can upload new files into the folder. They cannot open the Cloudinary dashboard or change billing. Keep overwrite **off** and use unique filenames.

**Catalog (signed via Worker)**  
Only requests that present the correct admin password are accepted by the Worker. The API secret never leaves Cloudflare. This is the recommended path for phones and day-to-day publishing.

**Hardening options later:**

1. Rate-limit the Worker.
2. Move catalog to **Cloudflare KV** (free tier) instead of Cloudinary raw files.
3. Stronger auth (token / Cloudflare Access) if the admin URL becomes widely known.

---

### Cloudflare deploy

* **Pages:** connect GitHub repo → build command none → output root of static files.
* **Worker:** deploy from `worker/` with Wrangler; set the four secrets listed above.
* After adding `admin.html`, `css/admin.css`, `js/admin.js`, redeploy Pages so `/admin.html` is live.

Env you might document in README (not secrets):

```text
CLOUDINARY_CLOUD_NAME=mir8iioo
CLOUDINARY_UPLOAD_PRESET=naravazz_unsigned
CLOUDINARY_FOLDER=naravazz
CATALOG_URL=https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json
PUBLISH_URL=https://naravazz-api.storengola.workers.dev/publish
```

---

### Staff workflow (target)

1. Open `/admin.html` → password.
2. Edit products / zones / texts / upload media.
3. **Guardar rascunho** → check the shop in the same browser.
4. **Publicar na loja** → Worker writes `catalog.json` → all visitors get the new data on next load (cache-bust with `?t=timestamp` is already applied in `app.js`).

No manual `products.js` upload or site redeploy required for catalog changes.

---

### Copy-paste checklist for a new website

- [ ] Static HTML/CSS/JS structure as above  
- [ ] `products.js` defaults + `app.js` loader (localStorage → remote JSON → defaults)  
- [ ] Cloudinary account + **unsigned** preset + folder (media only)  
- [ ] `admin.html` / `admin.css` / `admin.js` (CRUD + media upload + publish)  
- [ ] Cloudflare Worker with secrets (password + Cloudinary key/secret)  
- [ ] Change default admin password  
- [ ] Deploy Pages + deploy Worker  
- [ ] Optional later: KV instead of Cloudinary for the catalog  

---

### What this stack is good for

* Small shops, beauty, local delivery, WhatsApp orders  
* Staff editing prices and photos from any phone without a developer  
* Zero/low cost (Cloudinary free credits + Cloudflare free tier)  
* Secrets stay on the server (Worker), not on staff devices  

### What it is not

* Multi-warehouse inventory with strong auth  
* PCI card payments (use WhatsApp / external checkout)  
* High-security admin without a backend (Worker is the minimal backend)

---

*Derived from the Naravazz Diversos project (Luanda). Adapt names, WhatsApp number, Cloudinary folder, and Worker name per client.*
