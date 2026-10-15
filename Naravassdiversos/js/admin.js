/* Nara Vazz Admin Panel */
(function () {
  'use strict';

  const STORAGE = {
    auth: 'nv_admin_auth',
    password: 'nv_admin_password',
    products: 'nv_products_override',
    zones: 'nv_zones_override',
    texts: 'nv_texts_override',
    images: 'nv_images_override',
    media: 'nv_media_library',
    cloudinary: 'nv_cloudinary_cfg'
  };

  /** Site-wide image slots (staff-editable). Defaults match shipped HTML/CSS. */
  const SITE_IMAGE_SLOTS = [
    { key: 'hero', label: 'Hero (página inicial)', hint: 'Fundo grande do topo' },
    { key: 'promo', label: 'Banner promo / CTA', hint: 'Secção “Cuide da sua pele…”' },
    { key: 'shop_hero', label: 'Hero da loja', hint: 'Topo da página shop' },
    { key: 'owner', label: 'Foto da Nara (Sobre)', hint: 'Homepage + página Sobre' },
    { key: 'cat_pele', label: 'Categoria — Pele' },
    { key: 'cat_corpo', label: 'Categoria — Corpo' },
    { key: 'cat_cabelo', label: 'Categoria — Cabelo' },
    { key: 'cat_perfume', label: 'Categoria — Perfumes' },
    { key: 'cat_solar', label: 'Categoria — Solar' },
    { key: 'cat_intimo', label: 'Categoria — Íntimos' },
    { key: 'gallery_1', label: 'Galeria 1' },
    { key: 'gallery_2', label: 'Galeria 2' },
    { key: 'gallery_3', label: 'Galeria 3' },
    { key: 'gallery_4', label: 'Galeria 4' },
    { key: 'poster_soaps', label: 'Poster vídeo Soaps' },
    { key: 'poster_exp_loja', label: 'Poster vídeo — Na loja' },
    { key: 'poster_exp_clientes', label: 'Poster vídeo — Clientes' },
    { key: 'poster_exp_depoimento', label: 'Poster vídeo — Depoimento' }
  ];

  const DEFAULT_SITE_IMAGES = {
    hero: 'images/hero-store.jpg',
    promo: 'images/cat-pele.jpg',
    shop_hero: 'images/categories-hero.jpg',
    owner: 'images/owner-nara.jpg',
    cat_pele: 'images/cat-pele.jpg',
    cat_corpo: 'images/SaveClip.App_791561045_18096113048410000_5270708848669191931_n.webp',
    cat_cabelo: 'images/cat-cabelo.jpg',
    cat_perfume: 'images/SaveClip.App_696167307_18082318238410000_1403620707140573358_n.webp',
    cat_solar: 'images/SaveClip.App_753231556_18089414354410000_5250035109845978277_n.webp',
    cat_intimo: 'images/SaveClip.App_708891319_18083530490410000_1292920650234186326_n.webp',
    gallery_1: 'images/gallery-1.jpg',
    gallery_2: 'images/gallery-2.jpg',
    gallery_3: 'images/gallery-3.jpg',
    gallery_4: 'images/gallery-4.jpg',
    poster_soaps: 'images/poster-soaps.jpg',
    poster_exp_loja: 'images/poster-experiencia-loja.jpg',
    poster_exp_clientes: 'images/poster-experiencia-clientes.jpg',
    poster_exp_depoimento: 'images/poster-experiencia-depoimento.jpg'
  };

  const DEFAULT_PASSWORD = 'naravazz2026';

  const CATEGORY_LABELS = {
    pele: { pt: 'Pele', en: 'Skincare' },
    corpo: { pt: 'Corpo', en: 'Body' },
    cabelo: { pt: 'Cabelo', en: 'Hair' },
    perfume: { pt: 'Perfumes', en: 'Perfumes' },
    intimo: { pt: 'Cuidados Íntimos', en: 'Intimate Care' },
    solar: { pt: 'Proteção Solar', en: 'Sun Care' }
  };

  /* ---- State ---- */
  let products = [];
  let zones = [];
  let texts = { pt: {}, en: {} };
  let siteImages = Object.assign({}, DEFAULT_SITE_IMAGES);
  let mediaLibrary = [];
  let cloudinaryCfg = {
    cloudName: 'mir8iioo',
    uploadPreset: 'naravazz_unsigned',
    folder: 'naravazz',
    apiKey: '',
    apiSecret: '',
    publishUrl: 'https://naravazz-api.storengola.workers.dev/publish'
  };
  const CATALOG_PUBLIC_ID = 'naravazz/catalog';
  let editingProductIndex = -1;
  let siteImagePickKey = null;

  /* Default i18n keys editable in admin (subset of app.js) */
  const DEFAULT_TEXTS = {
    pt: {
      announce: 'Entrega em toda Luanda · Encomende agora pelo WhatsApp',
      heroTitle: 'Realçando a sua <strong>beleza</strong> todos os dias',
      heroDesc: 'Cosméticos, maquiagem, perfumes e cuidados pessoais selecionados com amor para si.',
      heroCta1: 'Ver todos os produtos',
      catTitle: 'Comprar por categoria',
      catDesc: 'Explore o nosso universo de beleza',
      bestSelling: 'Mais vendidos',
      favoritos: 'Naravazz Favoritos',
      novosNaLoja: 'Novos na loja',
      experienceTitle: 'A experiência Naravazz',
      soapsEyebrow: 'Na loja',
      soapsTitle: 'Soaps',
      soapsDesc: 'Lavanda, girassol, rosas, canela, alecrim, carvão, enxofre, açafrão e mais. A Nara apresenta os sabonetes da loja.',
      aboutTitle: 'Sobre a Nara Vazz',
      aboutText: 'Na Nara Vazz, acreditamos que a beleza é um encanto diário. Oferecemos cosméticos, maquiagem, perfumes e cuidados pessoais de qualidade, com entrega rápida em Luanda e atendimento próximo.',
      promoTitle: 'Cuide da sua pele todos os dias',
      promoText: 'Protetores solares, hidratantes e kits exclusivos com a qualidade que você merece.',
      promoCta: 'Explorar proteção solar',
      instaTitle: 'Siga-nos no Instagram',
      newsletterLabel: 'Receba novidades e promoções',
      shopTitle: 'A nossa loja',
      shopDesc: 'Todos os produtos de beleza e cuidados pessoais',
      deliveryTitle: 'Tabela de Entregas',
      deliveryDesc: 'Entregamos com rapidez e segurança em vários pontos da cidade.',
      contactTitle: 'Contacte-nos',
      contactText: 'Estamos em Benfica, Rua Direita do Banco BFA, antes do Colégio Os Brilhantes.'
    },
    en: {
      announce: 'Delivery across Luanda · Order now via WhatsApp',
      heroTitle: 'Enhancing your <strong>beauty</strong> every day',
      heroDesc: 'Cosmetics, makeup, perfumes and personal care selected with love for you.',
      heroCta1: 'View all products',
      catTitle: 'Shop by category',
      catDesc: 'Explore our beauty universe',
      bestSelling: 'Best selling',
      favoritos: 'Naravazz Favorites',
      novosNaLoja: 'New in store',
      experienceTitle: 'The Naravazz experience',
      soapsEyebrow: 'In store',
      soapsTitle: 'Soaps',
      soapsDesc: 'Lavender, sunflower, roses, cinnamon, rosemary, charcoal, sulfur, saffron and more. Nara presents the store soaps.',
      aboutTitle: 'About Nara Vazz',
      aboutText: 'At Nara Vazz, we believe beauty is a daily charm. We offer quality cosmetics, makeup, perfumes and personal care, with fast delivery in Luanda and close service.',
      promoTitle: 'Care for your skin every day',
      promoText: 'Sunscreens, moisturizers and exclusive kits with the quality you deserve.',
      promoCta: 'Explore sun protection',
      instaTitle: 'Follow us on Instagram',
      newsletterLabel: 'Get news and promotions',
      shopTitle: 'Our shop',
      shopDesc: 'All beauty and personal care products',
      deliveryTitle: 'Delivery rates',
      deliveryDesc: 'We deliver quickly and safely across the city.',
      contactTitle: 'Contact us',
      contactText: 'We are in Benfica, Rua Direita do Banco BFA, before Colégio Os Brilhantes.'
    }
  };

  /* ---- Utils ---- */
  function toast(msg, isError) {
    const el = document.getElementById('admin-toast');
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3200);
  }

  function getPassword() {
    return localStorage.getItem(STORAGE.password) || DEFAULT_PASSWORD;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(STORAGE.auth) === '1';
  }

  function loadState() {
    try {
      const p = localStorage.getItem(STORAGE.products);
      products = p ? JSON.parse(p) : JSON.parse(JSON.stringify(typeof PRODUCTS !== 'undefined' ? PRODUCTS : []));
    } catch (e) {
      products = typeof PRODUCTS !== 'undefined' ? JSON.parse(JSON.stringify(PRODUCTS)) : [];
    }
    try {
      const z = localStorage.getItem(STORAGE.zones);
      zones = z ? JSON.parse(z) : JSON.parse(JSON.stringify(typeof DELIVERY_ZONES !== 'undefined' ? DELIVERY_ZONES : []));
    } catch (e) {
      zones = typeof DELIVERY_ZONES !== 'undefined' ? JSON.parse(JSON.stringify(DELIVERY_ZONES)) : [];
    }
    try {
      const t = localStorage.getItem(STORAGE.texts);
      if (t) {
        texts = JSON.parse(t);
      } else {
        texts = JSON.parse(JSON.stringify(DEFAULT_TEXTS));
      }
    } catch (e) {
      texts = JSON.parse(JSON.stringify(DEFAULT_TEXTS));
    }
    try {
      const img = localStorage.getItem(STORAGE.images);
      if (img) {
        siteImages = Object.assign({}, DEFAULT_SITE_IMAGES, JSON.parse(img));
      } else {
        siteImages = Object.assign({}, DEFAULT_SITE_IMAGES);
      }
    } catch (e) {
      siteImages = Object.assign({}, DEFAULT_SITE_IMAGES);
    }
    try {
      mediaLibrary = JSON.parse(localStorage.getItem(STORAGE.media) || '[]');
    } catch (e) {
      mediaLibrary = [];
    }
    try {
      const c = localStorage.getItem(STORAGE.cloudinary);
      if (c) {
        const parsed = JSON.parse(c);
        cloudinaryCfg = Object.assign({}, cloudinaryCfg, parsed);
        if (!cloudinaryCfg.cloudName) cloudinaryCfg.cloudName = 'mir8iioo';
        if (!cloudinaryCfg.uploadPreset) cloudinaryCfg.uploadPreset = 'naravazz_unsigned';
        if (!cloudinaryCfg.folder) cloudinaryCfg.folder = 'naravazz';
      }
    } catch (e) { /* keep defaults */ }
  }

  async function sha1Hex(message) {
    const data = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function cloudinarySignedRawUpload(blob, publicId) {
    if (!cloudinaryCfg.cloudName || !cloudinaryCfg.apiKey || !cloudinaryCfg.apiSecret) {
      throw new Error('Configure API Key e API Secret em Definições para publicar.');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    // Params signed alphabetically: public_id, timestamp
    const toSign = 'public_id=' + publicId + '&timestamp=' + timestamp + cloudinaryCfg.apiSecret;
    const signature = await sha1Hex(toSign);

    const fd = new FormData();
    fd.append('file', blob, 'catalog.json');
    fd.append('api_key', cloudinaryCfg.apiKey);
    fd.append('timestamp', String(timestamp));
    fd.append('signature', signature);
    fd.append('public_id', publicId);

    const url = 'https://api.cloudinary.com/v1_1/' + cloudinaryCfg.cloudName + '/raw/upload';
    const res = await fetch(url, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error((data.error && data.error.message) || 'Falha ao publicar catalog.json');
    }
    return data;
  }

  async function publishViaWorker(catalog) {
    const endpoint = (cloudinaryCfg.publishUrl || '').trim();
    if (!endpoint) throw new Error('URL do Worker de publicação não configurada');

    // Prefer session password prompt only if needed — use stored admin password flow
    let password = sessionStorage.getItem('nv_publish_password') || '';
    if (!password) {
      password = window.prompt('Palavra-passe do admin para publicar:') || '';
      if (!password) throw new Error('Publicação cancelada');
      sessionStorage.setItem('nv_publish_password', password);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, catalog })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      if (res.status === 401) sessionStorage.removeItem('nv_publish_password');
      throw new Error(data.error || 'Falha ao publicar via Worker');
    }
    return data;
  }

  async function publishCatalog() {
    collectTextsFromEditor();
    saveProducts();
    saveZones();
    saveTexts();
    saveImages();

    const catalog = {
      products: products,
      zones: zones,
      texts: texts,
      images: siteImages
    };

    let data;
    if ((cloudinaryCfg.publishUrl || '').trim()) {
      data = await publishViaWorker(catalog);
    } else if (cloudinaryCfg.apiKey && cloudinaryCfg.apiSecret) {
      const payload = {
        updatedAt: new Date().toISOString(),
        ...catalog
      };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      data = await cloudinarySignedRawUpload(blob, CATALOG_PUBLIC_ID);
      data.updatedAt = payload.updatedAt;
    } else {
      throw new Error('Configure o Worker (publish URL) ou API Key/Secret em Definições');
    }

    localStorage.setItem('nv_catalog_published_at', data.updatedAt || new Date().toISOString());
    localStorage.setItem('nv_catalog_url', data.secure_url || '');
    return data;
  }

  function saveProducts() {
    localStorage.setItem(STORAGE.products, JSON.stringify(products));
  }
  function saveZones() {
    localStorage.setItem(STORAGE.zones, JSON.stringify(zones));
  }
  function saveTexts() {
    localStorage.setItem(STORAGE.texts, JSON.stringify(texts));
  }
  function saveImages() {
    localStorage.setItem(STORAGE.images, JSON.stringify(siteImages));
  }
  function saveMedia() {
    localStorage.setItem(STORAGE.media, JSON.stringify(mediaLibrary.slice(0, 80)));
  }
  function saveCloudinary() {
    localStorage.setItem(STORAGE.cloudinary, JSON.stringify(cloudinaryCfg));
  }

  function formatPrice(v) {
    return Number(v).toLocaleString('pt-AO') + ' Kz';
  }

  function slugify(str) {
    return String(str || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }

  /* ---- Cloudinary upload ---- */
  function cloudinaryReady() {
    return !!(cloudinaryCfg.cloudName && cloudinaryCfg.uploadPreset);
  }

  function updateCloudinaryStatus() {
    const el = document.getElementById('cloudinary-status');
    if (!el) return;
    if (cloudinaryReady()) {
      el.textContent = 'Cloudinary · ' + cloudinaryCfg.cloudName;
      el.className = 'cloudinary-status ok';
    } else {
      el.textContent = 'Cloudinary · não configurado';
      el.className = 'cloudinary-status warn';
    }
  }

  async function uploadToCloudinary(file) {
    if (!cloudinaryReady()) {
      throw new Error('Configure Cloudinary em Definições (cloud name + upload preset).');
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', cloudinaryCfg.uploadPreset);
    if (cloudinaryCfg.folder) fd.append('folder', cloudinaryCfg.folder);

    const resourceType = file.type && file.type.startsWith('video/') ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryCfg.cloudName}/${resourceType}/upload`;

    const res = await fetch(url, { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Upload falhou (' + res.status + ')');
    }
    const data = await res.json();
    const entry = {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      resourceType: data.resource_type,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      createdAt: data.created_at || new Date().toISOString()
    };
    mediaLibrary.unshift(entry);
    saveMedia();
    return entry;
  }

  /* ---- Login ---- */
  function showShell() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-shell').classList.add('active');
    loadState();
    updateCloudinaryStatus();
    renderDashboard();
    renderProducts();
    renderZones();
    renderSiteImages();
    renderTexts();
    renderMedia();
    fillSettingsForm();
  }

  function tryLogin() {
    const input = document.getElementById('admin-password');
    const err = document.getElementById('login-error');
    if (input.value === getPassword()) {
      sessionStorage.setItem(STORAGE.auth, '1');
      sessionStorage.setItem('nv_publish_password', input.value);
      err.classList.remove('show');
      showShell();
    } else {
      err.classList.add('show');
      input.focus();
    }
  }

  /* ---- Navigation ---- */
  const PANEL_TITLES = {
    dashboard: 'Dashboard',
    products: 'Produtos',
    delivery: 'Entregas',
    texts: 'Textos do site',
    images: 'Imagens do site',
    media: 'Média',
    settings: 'Definições'
  };

  function switchPanel(name) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#admin-nav button').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById('panel-' + name);
    const btn = document.querySelector('#admin-nav button[data-panel="' + name + '"]');
    if (panel) panel.classList.add('active');
    if (btn) btn.classList.add('active');
    document.getElementById('panel-title').textContent = PANEL_TITLES[name] || name;
    document.getElementById('admin-sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  }

  /* ---- Dashboard ---- */
  function renderDashboard() {
    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-zones').textContent = zones.length;
    document.getElementById('stat-media').textContent = mediaLibrary.length;
    const hasP = !!localStorage.getItem(STORAGE.products);
    const hasZ = !!localStorage.getItem(STORAGE.zones);
    const hasT = !!localStorage.getItem(STORAGE.texts);
    const hasI = !!localStorage.getItem(STORAGE.images);
    document.getElementById('stat-overrides').textContent =
      [hasP && 'produtos', hasZ && 'entregas', hasT && 'textos', hasI && 'imagens'].filter(Boolean).join(', ') || 'nenhum';
  }

  /* ---- Products ---- */
  function renderProducts() {
    const q = (document.getElementById('product-search').value || '').toLowerCase().trim();
    const cat = document.getElementById('product-filter-cat').value;
    const tbody = document.getElementById('products-tbody');
    const cards = document.getElementById('products-cards');
    const filtered = products.filter(p => {
      if (cat && p.category !== cat) return false;
      if (!q) return true;
      const hay = [p.name, p.nameEn, p.brand, p.id, p.badge].join(' ').toLowerCase();
      return hay.includes(q);
    });

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px">Nenhum produto encontrado</td></tr>';
      if (cards) cards.innerHTML = '<div class="admin-empty"><p>Nenhum produto encontrado</p></div>';
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const idx = products.indexOf(p);
      const img = p.image || '';
      return `<tr>
        <td><img class="admin-thumb" src="${escapeAttr(img)}" alt="" onerror="this.src='images/favicon.png'"></td>
        <td><strong>${escapeHtml(p.name)}</strong><br><span style="font-size:0.75rem;color:var(--muted)">${escapeHtml(p.id)}</span></td>
        <td>${escapeHtml(p.categoryLabel || p.category)}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${escapeHtml(p.brand || '—')}</td>
        <td>${p.badge ? '<span class="admin-badge">' + escapeHtml(p.badge) + '</span>' : '—'}</td>
        <td class="admin-actions-cell">
          <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm" data-edit-product="${idx}">Editar</button>
          <button type="button" class="btn-admin btn-admin-danger btn-admin-sm" data-del-product="${idx}">Apagar</button>
        </td>
      </tr>`;
    }).join('');

    if (cards) {
      cards.innerHTML = filtered.map(p => {
        const idx = products.indexOf(p);
        const img = p.image || '';
        return `<div class="product-card-admin">
          <img class="admin-thumb" src="${escapeAttr(img)}" alt="" onerror="this.src='images/favicon.png'">
          <div class="product-card-admin-body">
            <strong>${escapeHtml(p.name)}</strong>
            <div class="product-card-admin-meta">
              ${escapeHtml(p.categoryLabel || p.category)} · ${formatPrice(p.price)}
              ${p.badge ? ' · <span class="admin-badge">' + escapeHtml(p.badge) + '</span>' : ''}
            </div>
            <div class="product-card-admin-actions">
              <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm" data-edit-product="${idx}">Editar</button>
              <button type="button" class="btn-admin btn-admin-danger btn-admin-sm" data-del-product="${idx}">Apagar</button>
            </div>
          </div>
        </div>`;
      }).join('');
    }
  }

  function openProductModal(index) {
    editingProductIndex = index;
    const isNew = index < 0;
    document.getElementById('product-modal-title').textContent = isNew ? 'Novo produto' : 'Editar produto';
    const p = isNew ? {
      id: '', name: '', nameEn: '', price: 0, category: 'corpo', brand: '', badge: '',
      desc: '', descEn: '', image: ''
    } : products[index];

    document.getElementById('p-id').value = isNew ? '' : String(index);
    document.getElementById('p-slug').value = p.id || '';
    document.getElementById('p-slug').disabled = !isNew;
    document.getElementById('p-name').value = p.name || '';
    document.getElementById('p-nameEn').value = p.nameEn || '';
    document.getElementById('p-price').value = p.price || 0;
    document.getElementById('p-category').value = p.category || 'corpo';
    document.getElementById('p-brand').value = p.brand || '';
    document.getElementById('p-badge').value = p.badge || '';
    document.getElementById('p-desc').value = p.desc || '';
    document.getElementById('p-descEn').value = p.descEn || '';
    document.getElementById('p-image').value = p.image || '';
    updateProductImagePreview(p.image);
    document.getElementById('product-modal').classList.add('open');
  }

  function updateProductImagePreview(url) {
    const wrap = document.getElementById('p-image-preview');
    const img = document.getElementById('p-image-preview-img');
    if (url) {
      img.src = url;
      wrap.classList.add('show');
    } else {
      wrap.classList.remove('show');
    }
  }

  function saveProductFromModal() {
    const isNew = editingProductIndex < 0;
    let id = document.getElementById('p-slug').value.trim();
    const name = document.getElementById('p-name').value.trim();
    if (!name) {
      toast('Indique o nome do produto', true);
      return;
    }
    if (isNew) {
      if (!id) id = slugify(name);
      if (products.some(p => p.id === id)) {
        toast('Já existe um produto com este ID', true);
        return;
      }
    } else {
      id = products[editingProductIndex].id;
    }

    const cat = document.getElementById('p-category').value;
    const labels = CATEGORY_LABELS[cat] || { pt: cat, en: cat };
    const product = {
      id,
      name,
      nameEn: document.getElementById('p-nameEn').value.trim() || name,
      price: Number(document.getElementById('p-price').value) || 0,
      category: cat,
      categoryLabel: labels.pt,
      categoryLabelEn: labels.en,
      image: document.getElementById('p-image').value.trim(),
      badge: document.getElementById('p-badge').value.trim() || undefined,
      desc: document.getElementById('p-desc').value.trim(),
      descEn: document.getElementById('p-descEn').value.trim(),
      brand: document.getElementById('p-brand').value.trim()
    };
    if (!product.badge) delete product.badge;

    if (isNew) {
      products.push(product);
    } else {
      products[editingProductIndex] = product;
    }
    saveProducts();
    closeProductModal();
    renderProducts();
    renderDashboard();
    toast(isNew ? 'Produto adicionado' : 'Produto actualizado');
  }

  function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
    editingProductIndex = -1;
  }

  function deleteProduct(index) {
    if (!confirm('Apagar o produto «' + products[index].name + '»?')) return;
    products.splice(index, 1);
    saveProducts();
    renderProducts();
    renderDashboard();
    toast('Produto apagado');
  }

  /* ---- Zones ---- */
  function renderZones() {
    const tbody = document.getElementById('zones-tbody');
    const cards = document.getElementById('zones-cards');
    if (!zones.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:32px">Sem zonas</td></tr>';
      if (cards) cards.innerHTML = '<div class="admin-empty"><p>Sem zonas</p></div>';
      return;
    }
    tbody.innerHTML = zones.map((z, i) => `<tr>
      <td>${escapeHtml(z.name)}</td>
      <td>${formatPrice(z.price)}</td>
      <td class="admin-actions-cell">
        <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm" data-edit-zone="${i}">Editar</button>
        <button type="button" class="btn-admin btn-admin-danger btn-admin-sm" data-del-zone="${i}">Apagar</button>
      </td>
    </tr>`).join('');
    if (cards) {
      cards.innerHTML = zones.map((z, i) => `<div class="zone-card-admin">
        <div class="zone-card-admin-body">
          <strong>${escapeHtml(z.name)}</strong>
          <div class="zone-card-admin-meta">${formatPrice(z.price)}</div>
          <div class="zone-card-admin-actions">
            <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm" data-edit-zone="${i}">Editar</button>
            <button type="button" class="btn-admin btn-admin-danger btn-admin-sm" data-del-zone="${i}">Apagar</button>
          </div>
        </div>
      </div>`).join('');
    }
  }

  function openZoneModal(index) {
    const isNew = index < 0;
    document.getElementById('zone-modal-title').textContent = isNew ? 'Nova zona' : 'Editar zona';
    document.getElementById('z-index').value = isNew ? '-1' : String(index);
    document.getElementById('z-name').value = isNew ? '' : zones[index].name;
    document.getElementById('z-price').value = isNew ? 2500 : zones[index].price;
    document.getElementById('zone-modal').classList.add('open');
  }

  function saveZoneFromModal() {
    const idx = Number(document.getElementById('z-index').value);
    const name = document.getElementById('z-name').value.trim();
    const price = Number(document.getElementById('z-price').value) || 0;
    if (!name) {
      toast('Indique o nome da zona', true);
      return;
    }
    if (idx < 0) {
      zones.push({ name, price });
    } else {
      zones[idx] = { name, price };
    }
    saveZones();
    document.getElementById('zone-modal').classList.remove('open');
    renderZones();
    renderDashboard();
    toast('Zona guardada');
  }

  function deleteZone(index) {
    if (!confirm('Apagar a zona «' + zones[index].name + '»?')) return;
    zones.splice(index, 1);
    saveZones();
    renderZones();
    renderDashboard();
    toast('Zona apagada');
  }

  /* ---- Texts ---- */
  function renderTexts() {
    const q = (document.getElementById('text-search').value || '').toLowerCase().trim();
    const keys = Object.keys(texts.pt || {}).filter(k => !q || k.toLowerCase().includes(q) || (texts.pt[k] || '').toLowerCase().includes(q));
    const container = document.getElementById('texts-editor');
    if (!keys.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:20px;text-align:center">Nenhuma chave encontrada</p>';
      return;
    }
    container.innerHTML = keys.map(key => `
      <div class="text-row" data-key="${escapeAttr(key)}">
        <div class="key">${escapeHtml(key)}</div>
        <textarea data-lang="pt" rows="2" placeholder="Português">${escapeHtml(texts.pt[key] || '')}</textarea>
        <textarea data-lang="en" rows="2" placeholder="English">${escapeHtml(texts.en[key] || '')}</textarea>
      </div>
    `).join('');
  }

  function collectTextsFromEditor() {
    document.querySelectorAll('#texts-editor .text-row').forEach(row => {
      const key = row.getAttribute('data-key');
      const pt = row.querySelector('[data-lang="pt"]');
      const en = row.querySelector('[data-lang="en"]');
      if (pt) texts.pt[key] = pt.value;
      if (en) texts.en[key] = en.value;
    });
  }

  /* ---- Site images ---- */
  function renderSiteImages() {
    const container = document.getElementById('site-images-editor');
    if (!container) return;
    container.innerHTML = SITE_IMAGE_SLOTS.map(slot => {
      const url = siteImages[slot.key] || DEFAULT_SITE_IMAGES[slot.key] || '';
      return `<div class="admin-card site-image-slot" data-key="${escapeAttr(slot.key)}">
        <div class="site-image-preview">
          <img src="${escapeAttr(url)}" alt="" onerror="this.style.opacity=0.3">
        </div>
        <div class="site-image-meta">
          <strong>${escapeHtml(slot.label)}</strong>
          ${slot.hint ? '<p class="hint">' + escapeHtml(slot.hint) + '</p>' : ''}
          <div class="site-image-actions">
            <button type="button" class="btn-admin btn-admin-primary btn-admin-sm" data-si-upload="${escapeAttr(slot.key)}">Carregar</button>
            <button type="button" class="btn-admin btn-admin-secondary btn-admin-sm" data-si-pick="${escapeAttr(slot.key)}">Escolher da média</button>
            <button type="button" class="btn-admin btn-admin-ghost btn-admin-sm" data-si-reset="${escapeAttr(slot.key)}">Original</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function setSiteImage(key, url) {
    if (!key || !url) return;
    siteImages[key] = url;
    saveImages();
    renderSiteImages();
    renderDashboard();
    toast('Imagem actualizada — publique para a loja ver');
  }

  function openMediaPicker(key) {
    siteImagePickKey = key;
    const grid = document.getElementById('media-picker-grid');
    const empty = document.getElementById('media-picker-empty');
    const images = mediaLibrary.filter(m => !m.resourceType || m.resourceType === 'image');
    if (!images.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
    } else {
      if (empty) empty.style.display = 'none';
      grid.innerHTML = images.map((m, i) => `
        <button type="button" class="media-item media-picker-item" data-pick-url="${escapeAttr(m.url)}" style="cursor:pointer;border:none;padding:0;text-align:left">
          <img src="${escapeAttr(m.url)}" alt="" loading="lazy">
          <div class="media-meta">Usar esta</div>
        </button>
      `).join('');
    }
    document.getElementById('media-picker-modal').classList.add('open');
  }

  function closeMediaPicker() {
    siteImagePickKey = null;
    document.getElementById('media-picker-modal').classList.remove('open');
  }

  /* ---- Media ---- */
  function renderMedia() {
    const grid = document.getElementById('media-grid');
    const empty = document.getElementById('media-empty');
    if (!mediaLibrary.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = mediaLibrary.map((m, i) => {
      const isVideo = m.resourceType === 'video';
      const thumb = isVideo
        ? (m.url.replace('/upload/', '/upload/so_0/') + (m.url.includes('.mp4') ? '' : ''))
        : m.url;
      return `<div class="media-item">
        ${isVideo
          ? `<video src="${escapeAttr(m.url)}" muted style="width:100%;aspect-ratio:1;object-fit:cover"></video>`
          : `<img src="${escapeAttr(thumb)}" alt="">`}
        <div class="media-actions">
          <button type="button" data-copy-url="${i}" title="Copiar URL">URL</button>
          <button type="button" data-del-media="${i}" title="Remover da biblioteca">✕</button>
        </div>
        <div class="media-meta">${escapeHtml((m.publicId || '').split('/').pop() || 'ficheiro')}</div>
      </div>`;
    }).join('');
  }

  function deleteMediaFromLibrary(index) {
    const item = mediaLibrary[index];
    if (!item) return;
    const name = (item.publicId || '').split('/').pop() || 'este ficheiro';
    if (!confirm('Remover «' + name + '» da biblioteca deste browser?\n\nA loja continua a mostrar a imagem se ainda estiver ligada a um produto ou a Imagens do site. O ficheiro no armazenamento online só se apaga no painel Cloudinary (ou pelo programador).')) return;
    mediaLibrary.splice(index, 1);
    saveMedia();
    renderMedia();
    renderDashboard();
    toast('Removido da biblioteca');
  }

  async function handleFilesUpload(fileList) {
    if (!fileList || !fileList.length) return;
    if (!cloudinaryReady()) {
      toast('Configure Cloudinary em Definições primeiro', true);
      switchPanel('settings');
      return;
    }
    const progress = document.getElementById('upload-progress');
    progress.style.display = 'block';
    const files = Array.from(fileList);
    let done = 0;
    for (const file of files) {
      progress.textContent = `A carregar ${done + 1}/${files.length}: ${file.name}…`;
      try {
        await uploadToCloudinary(file);
        done++;
      } catch (err) {
        toast(err.message || 'Erro no upload', true);
      }
    }
    progress.style.display = 'none';
    renderMedia();
    renderDashboard();
    if (done) toast(done + ' ficheiro(s) carregado(s)');
  }

  /* ---- Settings ---- */
  function fillSettingsForm() {
    document.getElementById('cfg-cloud-name').value = cloudinaryCfg.cloudName || '';
    document.getElementById('cfg-upload-preset').value = cloudinaryCfg.uploadPreset || '';
    document.getElementById('cfg-folder').value = cloudinaryCfg.folder || 'naravazz';
    const pub = document.getElementById('cfg-publish-url');
    if (pub) pub.value = cloudinaryCfg.publishUrl || '';
    const key = document.getElementById('cfg-api-key');
    const sec = document.getElementById('cfg-api-secret');
    if (key) key.value = cloudinaryCfg.apiKey || '';
    if (sec) sec.value = cloudinaryCfg.apiSecret || '';
  }

  /* ---- Escape helpers ---- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  /* ---- Events ---- */
  function bindEvents() {
    document.getElementById('login-btn').addEventListener('click', tryLogin);
    const pwdToggle = document.getElementById('password-toggle');
    if (pwdToggle) {
      pwdToggle.addEventListener('click', () => {
        const input = document.getElementById('admin-password');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        pwdToggle.classList.toggle('is-visible', show);
        pwdToggle.setAttribute('aria-label', show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe');
      });
    }
    document.getElementById('admin-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') tryLogin();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE.auth);
      location.reload();
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('open');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('open');
    });

    document.querySelectorAll('#admin-nav button').forEach(btn => {
      btn.addEventListener('click', () => switchPanel(btn.getAttribute('data-panel')));
    });

    document.getElementById('product-search').addEventListener('input', renderProducts);
    document.getElementById('product-filter-cat').addEventListener('change', renderProducts);
    document.getElementById('btn-add-product').addEventListener('click', () => openProductModal(-1));

    const onProductAction = e => {
      const editBtn = e.target.closest('[data-edit-product]');
      const delBtn = e.target.closest('[data-del-product]');
      if (editBtn) {
        openProductModal(Number(editBtn.getAttribute('data-edit-product')));
      } else if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-del-product'));
        if (confirm('Apagar este produto?')) deleteProduct(idx);
      }
    };
    document.getElementById('products-tbody').addEventListener('click', onProductAction);
    const cardsEl = document.getElementById('products-cards');
    if (cardsEl) cardsEl.addEventListener('click', onProductAction);

    document.getElementById('product-modal-close').addEventListener('click', closeProductModal);
    document.getElementById('product-modal-cancel').addEventListener('click', closeProductModal);
    document.getElementById('product-modal-save').addEventListener('click', saveProductFromModal);
    document.getElementById('product-modal').addEventListener('click', e => {
      if (e.target.id === 'product-modal') closeProductModal();
    });

    document.getElementById('p-image').addEventListener('input', e => updateProductImagePreview(e.target.value));
    document.getElementById('btn-upload-product-img').addEventListener('click', () => {
      document.getElementById('p-image-file').click();
    });
    document.getElementById('p-image-file').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        toast('A carregar imagem…');
        const entry = await uploadToCloudinary(file);
        document.getElementById('p-image').value = entry.url;
        updateProductImagePreview(entry.url);
        renderMedia();
        toast('Imagem carregada');
      } catch (err) {
        toast(err.message || 'Erro no upload', true);
      }
      e.target.value = '';
    });

    document.getElementById('btn-add-zone').addEventListener('click', () => openZoneModal(-1));
    const onZoneAction = e => {
      const edit = e.target.closest('[data-edit-zone]');
      const del = e.target.closest('[data-del-zone]');
      if (edit) openZoneModal(Number(edit.getAttribute('data-edit-zone')));
      if (del) deleteZone(Number(del.getAttribute('data-del-zone')));
    };
    document.getElementById('zones-tbody').addEventListener('click', onZoneAction);
    const zonesCardsEl = document.getElementById('zones-cards');
    if (zonesCardsEl) zonesCardsEl.addEventListener('click', onZoneAction);
    document.getElementById('zone-modal-close').addEventListener('click', () => {
      document.getElementById('zone-modal').classList.remove('open');
    });
    document.getElementById('zone-modal-cancel').addEventListener('click', () => {
      document.getElementById('zone-modal').classList.remove('open');
    });
    document.getElementById('zone-modal-save').addEventListener('click', saveZoneFromModal);

    document.getElementById('text-search').addEventListener('input', () => {
      collectTextsFromEditor();
      renderTexts();
    });
    document.getElementById('btn-reset-texts').addEventListener('click', () => {
      if (!confirm('Restaurar todos os textos para os valores originais?')) return;
      texts = JSON.parse(JSON.stringify(DEFAULT_TEXTS));
      saveTexts();
      renderTexts();
      toast('Textos restaurados');
    });

    /* Site images panel */
    const siteEditor = document.getElementById('site-images-editor');
    const siteFileInput = document.getElementById('site-image-file-input');
    if (siteEditor) {
      siteEditor.addEventListener('click', async e => {
        const uploadBtn = e.target.closest('[data-si-upload]');
        const pickBtn = e.target.closest('[data-si-pick]');
        const resetBtn = e.target.closest('[data-si-reset]');
        if (uploadBtn) {
          siteImagePickKey = uploadBtn.getAttribute('data-si-upload');
          if (siteFileInput) siteFileInput.click();
        } else if (pickBtn) {
          openMediaPicker(pickBtn.getAttribute('data-si-pick'));
        } else if (resetBtn) {
          const key = resetBtn.getAttribute('data-si-reset');
          siteImages[key] = DEFAULT_SITE_IMAGES[key] || '';
          saveImages();
          renderSiteImages();
          toast('Imagem reposta ao original');
        }
      });
    }
    if (siteFileInput) {
      siteFileInput.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        const key = siteImagePickKey;
        e.target.value = '';
        if (!file || !key) return;
        try {
          toast('A carregar imagem…');
          const entry = await uploadToCloudinary(file);
          setSiteImage(key, entry.url);
          renderMedia();
        } catch (err) {
          toast(err.message || 'Erro no upload', true);
        }
        siteImagePickKey = null;
      });
    }
    document.getElementById('media-picker-close')?.addEventListener('click', closeMediaPicker);
    document.getElementById('media-picker-cancel')?.addEventListener('click', closeMediaPicker);
    document.getElementById('media-picker-modal')?.addEventListener('click', e => {
      if (e.target.id === 'media-picker-modal') closeMediaPicker();
    });
    document.getElementById('media-picker-grid')?.addEventListener('click', e => {
      const item = e.target.closest('[data-pick-url]');
      if (!item || !siteImagePickKey) return;
      const url = item.getAttribute('data-pick-url');
      setSiteImage(siteImagePickKey, url);
      closeMediaPicker();
    });

    const dropzone = document.getElementById('media-dropzone');
    const fileInput = document.getElementById('media-file-input');
    dropzone.addEventListener('click', () => fileInput.click());
    document.getElementById('btn-upload-media').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      handleFilesUpload(e.target.files);
      e.target.value = '';
    });
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      handleFilesUpload(e.dataTransfer.files);
    });

    document.getElementById('media-grid').addEventListener('click', e => {
      const delBtn = e.target.closest('[data-del-media]');
      if (delBtn) {
        deleteMediaFromLibrary(Number(delBtn.getAttribute('data-del-media')));
        return;
      }
      const btn = e.target.closest('[data-copy-url]');
      if (!btn) return;
      const i = Number(btn.getAttribute('data-copy-url'));
      const url = mediaLibrary[i] && mediaLibrary[i].url;
      if (!url) return;
      navigator.clipboard.writeText(url).then(() => toast('URL copiada')).catch(() => {
        prompt('Copiar URL:', url);
      });
    });

    document.getElementById('btn-save-cloudinary').addEventListener('click', () => {
      cloudinaryCfg.cloudName = document.getElementById('cfg-cloud-name').value.trim();
      cloudinaryCfg.uploadPreset = document.getElementById('cfg-upload-preset').value.trim();
      cloudinaryCfg.folder = document.getElementById('cfg-folder').value.trim() || 'naravazz';
      const pub = document.getElementById('cfg-publish-url');
      if (pub) cloudinaryCfg.publishUrl = pub.value.trim();
      const key = document.getElementById('cfg-api-key');
      const sec = document.getElementById('cfg-api-secret');
      if (key) cloudinaryCfg.apiKey = key.value.trim();
      if (sec) cloudinaryCfg.apiSecret = sec.value.trim();
      saveCloudinary();
      updateCloudinaryStatus();
      toast('Cloudinary / Worker guardado');
    });

    document.getElementById('btn-save-password').addEventListener('click', () => {
      const a = document.getElementById('cfg-new-password').value;
      const b = document.getElementById('cfg-new-password2').value;
      if (!a) {
        toast('Indique a nova palavra-passe', true);
        return;
      }
      if (a !== b) {
        toast('As palavras-passe não coincidem', true);
        return;
      }
      if (a.length < 6) {
        toast('Use pelo menos 6 caracteres', true);
        return;
      }
      localStorage.setItem(STORAGE.password, a);
      document.getElementById('cfg-new-password').value = '';
      document.getElementById('cfg-new-password2').value = '';
      toast('Palavra-passe actualizada');
    });

    document.getElementById('btn-clear-overrides').addEventListener('click', () => {
      if (!confirm('Limpar produtos, zonas, textos e imagens guardados neste browser?')) return;
      localStorage.removeItem(STORAGE.products);
      localStorage.removeItem(STORAGE.zones);
      localStorage.removeItem(STORAGE.texts);
      localStorage.removeItem(STORAGE.images);
      loadState();
      renderDashboard();
      renderProducts();
      renderZones();
      renderSiteImages();
      renderTexts();
      toast('Overrides limpos — a loja volta aos ficheiros originais');
    });

    document.getElementById('btn-save-all').addEventListener('click', () => {
      collectTextsFromEditor();
      saveProducts();
      saveZones();
      saveTexts();
      saveImages();
      renderDashboard();
      toast('Rascunho guardado — só neste browser');
    });

    document.getElementById('btn-publish').addEventListener('click', async () => {
      const n = products.length;
      if (!confirm(
        'Publicar na loja para todos os visitantes?\n\n' +
        'Isto actualiza produtos (' + n + '), zonas de entrega, textos e imagens do site.'
      )) return;
      const btn = document.getElementById('btn-publish');
      btn.disabled = true;
      btn.textContent = 'A publicar…';
      try {
        const data = await publishCatalog();
        renderDashboard();
        toast('Publicado — a loja já pode carregar o catálogo novo');
        if (navigator.vibrate) navigator.vibrate(40);
        console.info('Catalog URL:', data.secure_url);
      } catch (err) {
        toast(err.message || 'Erro ao publicar', true);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Publicar na loja';
      }
    });

  }

  /* ---- Init ---- */
  bindEvents();
  if (isLoggedIn()) {
    showShell();
  }
})();
