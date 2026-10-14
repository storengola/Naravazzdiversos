# Naravazz Diversos - Encanto Feminino

Luxury beauty, cosmetics & personal care e-commerce for **Naravazz Diversos** (Luanda, Angola).

**Live contact**
- WhatsApp: [+244 938 890 975](https://wa.me/244938890975)
- Instagram: [@naravazz_diversos](https://www.instagram.com/naravazz_diversos/)
- Store: Benfica - Rua Direita do Banco BFA, before Colégio Os Brilhantes

For the **reusable architecture** (copy to another client site), see **[BLUEPRINT.md](./BLUEPRINT.md)**.

---

## Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 |
| Styles | Pure CSS (custom properties, mobile-first, safe-area) |
| Logic | Vanilla JavaScript |
| Hosting | Cloudflare Pages |
| Media & live catalog | Cloudinary |
| Publish API | Cloudflare Worker `naravazz-api` (secrets server-side) |
| Build | None — static files only |

---

## Project structure

```
Naravassdiversos/
├── index.html … delivery.html
├── admin.html              # Staff panel
├── css/styles.css          # Public site
├── css/admin.css           # Admin UI
├── js/products.js          # Default catalog + zones (fallback)
├── js/app.js               # Cart, i18n, live catalog + site images
├── js/admin.js             # Admin CRUD, media, site images, publish
├── images/                 # Default static assets
├── videos/
├── worker/                 # Publish API
│   ├── src/index.js
│   ├── wrangler.toml
│   └── README.md
├── BLUEPRINT.md
└── README.md
```

---

## Features (site)

- Mobile-first layout, PT default + EN toggle
- Shop by category, sort, sliding cart, WhatsApp checkout
- Homepage collections, category cards, experience videos, soaps video
- Delivery zones table (Luanda)
- Live catalog: staff publish without redeploying the static site

---

## Admin — what staff can change

| Panel | Purpose |
|-------|---------|
| **Dashboard** | Stats + written how-to guide |
| **Produtos** | Add / edit / delete products, prices, photos |
| **Entregas** | Delivery zone names and prices |
| **Textos do site** | PT / EN copy (hero, promo, about…) |
| **Imagens do site** | Hero, promo, shop hero, categories, owner, gallery, video posters |
| **Média** | Upload library; copy URL; remove from library list |
| **Definições** | Password, Worker publish URL, optional API fallback |

### Draft vs publish

1. Edit in admin.
2. **Guardar rascunho** — only this browser (preview).
3. **Publicar na loja** — Worker writes `catalog.json`; **all visitors** see products, zones, texts, and site images.

Staff do **not** export `products.js` and do **not** paste image URLs for site slots: **Carregar** or **Escolher da média** fills the URL automatically.

### Site image slots (Naravazz)

`hero`, `promo`, `shop_hero`, `owner`, `cat_pele` … `cat_intimo`, `gallery_1`…`4`, `poster_soaps`, `poster_exp_*`.

Marked in HTML with `data-site-img` / `data-site-img-bg`; applied by `app.js`.

### Media delete

**✕** in Média removes the item from the **browser library** only. Files still on Cloudinary until deleted in the Cloudinary dashboard (or a future signed destroy API).

---

## Live catalog

```text
https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json
```

Shape: `{ updatedAt, products, zones, texts, images }`.

Load order: remote catalog → localStorage drafts override on the editing browser → defaults from `products.js` / static images if remote fails.

---

## Cloudflare Worker

| Item | Value |
|------|--------|
| Name | `naravazz-api` |
| URL | `https://naravazz-api.storengola.workers.dev` |
| Publish | `POST /publish` with `{ password, catalog }` |
| Health | `GET /health` |

```bash
cd worker
npx wrangler deploy
# secrets: ADMIN_PASSWORD, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

`wrangler.toml`: `workers_dev = true`, `preview_urls = true`.

---

## Cloudinary (this project)

| Setting | Value |
|---------|--------|
| Cloud name | `mir8iioo` |
| Upload preset | `naravazz_unsigned` (media only) |
| Folder | `naravazz` |
| Catalog public_id | `naravazz/catalog` |

---

## Adding products (developer fallback)

Prefer admin. For a permanent default offline catalog, edit `js/products.js`:

```js
{
  id: "unique-slug",
  name: "Nome PT",
  nameEn: "Name EN",
  price: 4500,
  category: "corpo",
  categoryLabel: "Corpo",
  categoryLabelEn: "Body",
  image: "images/file.jpg",
  badge: "Popular",
  desc: "…",
  descEn: "…",
  brand: "…"
}
```

---

## Cart & checkout

1. Add to cart → side panel  
2. Checkout form → WhatsApp message with lines + customer + zone fee  
3. Cart key: `nv_cart`

---

## Category URLs

| Category | URL |
|----------|-----|
| All | `shop.html` |
| Pele | `shop.html?cat=pele` |
| Corpo | `shop.html?cat=corpo` |
| Cabelo | `shop.html?cat=cabelo` |
| Perfumes | `shop.html?cat=perfume` |
| Íntimos | `shop.html?cat=intimo` |
| Solar | `shop.html?cat=solar` |

---

## Deploy

**Pages:** GitHub → Cloudflare Pages → no build command → output `/`.

**Worker:** from `worker/` with Wrangler (see above). Redeploy Worker whenever `worker/src/index.js` changes (e.g. new catalog fields like `images`).

**Local preview:** `npx serve .` or `python3 -m http.server 8080`.

---

## Mobile notes

- Admin: sticky publish bar, product cards, full-screen modals, 16px inputs  
- Shop: safe-area, sticky add-to-cart, larger qty controls, reliable WhatsApp open on iOS  

---

## Changelog (recent)

**2026-10-14**
- Live catalog via Cloudinary JSON + Worker (password-only publish on phones)
- Site images editable in admin (hero, promo, categories, gallery, posters)
- Media library: remove from list; upload / pick without copying URLs
- Mobile admin + public UX (sticky bars, cards, safe-area)
- Staff guide on Dashboard
- Confirm publish covers products, zones, texts, and images

**2026-10-11** — homepage collections, experience/soaps videos, owner photo, header polish (see git history)

---

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge).

---

## License / ownership

Client project for **Naravazz Diversos**. Product images and brand assets belong to the client.

Reuse the same system on another site: follow **BLUEPRINT.md**.
