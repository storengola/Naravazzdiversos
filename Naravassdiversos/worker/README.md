# naravazz-api — Catalog publish Worker

Holds Cloudinary secrets on the server. Staff phones only need the **admin password**.

## Deploy (once)

From this folder (`worker/`), with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged into the **storengola** Cloudflare account:

```bash
cd worker
npx wrangler deploy
```

Set secrets (values never appear in admin HTML/JS):

```bash
npx wrangler secret put ADMIN_PASSWORD
# enter: naravazz2026   (or the same password you use on admin.html)

npx wrangler secret put CLOUDINARY_CLOUD_NAME
# enter: mir8iioo

npx wrangler secret put CLOUDINARY_API_KEY
# enter: 993519668886874

npx wrangler secret put CLOUDINARY_API_SECRET
# enter: your Cloudinary API secret
```

After deploy, note the URL, e.g.:

```text
https://naravazz-api.storengola.workers.dev
```

Admin default publish endpoint:

```text
https://naravazz-api.storengola.workers.dev/publish
```

## API

| Method | Path | Body | Result |
|--------|------|------|--------|
| GET | `/health` | — | `{ ok: true }` |
| POST | `/publish` | `{ "password": "…", "catalog": { "products": [], "zones": [], "texts": {} } }` | Uploads `naravazz/catalog.json` to Cloudinary |

## Staff flow

1. Open `/admin.html` → log in (password).
2. Edit → **Publicar na loja**.
3. Worker checks password → signed Cloudinary upload → shop loads new JSON.

No Cloudinary secret on the phone. No `products.js` download.
