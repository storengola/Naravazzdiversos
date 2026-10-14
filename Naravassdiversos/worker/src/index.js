/**
 * Nara Vazz — Catalog publish API
 * POST /publish  { password, catalog } → uploads catalog.json to Cloudinary (signed)
 * GET  /health   → ok
 *
 * Secrets (wrangler secret put …):
 *   ADMIN_PASSWORD
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const CATALOG_PUBLIC_ID = 'naravazz/catalog';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });
}

async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function uploadCatalogToCloudinary(env, catalogObject) {
  const cloud = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !apiSecret) {
    throw new Error('Cloudinary secrets not configured on Worker');
  }

  const publicId = env.CATALOG_PUBLIC_ID || CATALOG_PUBLIC_ID;
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1Hex(toSign);

  const blob = new Blob([JSON.stringify(catalogObject)], { type: 'application/json' });
  const fd = new FormData();
  fd.append('file', blob, 'catalog.json');
  fd.append('api_key', apiKey);
  fd.append('timestamp', String(timestamp));
  fd.append('signature', signature);
  fd.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, {
    method: 'POST',
    body: fd
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error((data.error && data.error.message) || `Cloudinary upload failed (${res.status})`);
  }
  return data;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'GET' && (path === '/health' || path === '/')) {
      return json({ ok: true, service: 'naravazz-api' }, 200, origin);
    }

    if (request.method === 'POST' && path === '/publish') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body' }, 400, origin);
      }

      const password = body && body.password;
      const catalog = body && body.catalog;

      if (!env.ADMIN_PASSWORD) {
        return json({ error: 'ADMIN_PASSWORD not set on Worker' }, 500, origin);
      }
      if (!password || password !== env.ADMIN_PASSWORD) {
        return json({ error: 'Password incorrect' }, 401, origin);
      }
      if (!catalog || typeof catalog !== 'object' || !Array.isArray(catalog.products)) {
        return json({ error: 'catalog.products array required' }, 400, origin);
      }

      try {
        const payload = {
          updatedAt: new Date().toISOString(),
          products: catalog.products,
          zones: Array.isArray(catalog.zones) ? catalog.zones : [],
          texts: catalog.texts && typeof catalog.texts === 'object' ? catalog.texts : { pt: {}, en: {} },
          images: catalog.images && typeof catalog.images === 'object' ? catalog.images : {}
        };
        const data = await uploadCatalogToCloudinary(env, payload);
        return json({
          ok: true,
          secure_url: data.secure_url,
          version: data.version,
          public_id: data.public_id,
          updatedAt: payload.updatedAt
        }, 200, origin);
      } catch (err) {
        return json({ error: err.message || 'Publish failed' }, 500, origin);
      }
    }

    return json({ error: 'Not found' }, 404, origin);
  }
};
