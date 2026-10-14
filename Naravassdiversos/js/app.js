/* Nara Vazz - Core Application Logic */

(function () {
  'use strict';

  /* Live catalog published by admin → Cloudinary JSON */
  const CATALOG_JSON_URL = 'https://res.cloudinary.com/mir8iioo/raw/upload/naravazz/catalog.json';

  function applyCatalogObject(data) {
    if (!data || typeof data !== 'object') return;
    try {
      if (Array.isArray(data.products) && data.products.length && typeof PRODUCTS !== 'undefined') {
        PRODUCTS.length = 0;
        data.products.forEach(p => PRODUCTS.push(p));
      }
      if (Array.isArray(data.zones) && data.zones.length && typeof DELIVERY_ZONES !== 'undefined') {
        DELIVERY_ZONES.length = 0;
        data.zones.forEach(z => DELIVERY_ZONES.push(z));
      }
      if (data.texts) {
        window.__NV_REMOTE_TEXTS = data.texts;
      }
      if (data.images && typeof data.images === 'object') {
        window.__NV_REMOTE_IMAGES = data.images;
      }
    } catch (e) { /* keep defaults */ }
  }

  function applyLocalDraftOverrides() {
    try {
      const rawP = localStorage.getItem('nv_products_override');
      if (rawP && typeof PRODUCTS !== 'undefined') {
        const parsed = JSON.parse(rawP);
        if (Array.isArray(parsed) && parsed.length) {
          PRODUCTS.length = 0;
          parsed.forEach(p => PRODUCTS.push(p));
        }
      }
    } catch (e) { /* keep */ }
    try {
      const rawZ = localStorage.getItem('nv_zones_override');
      if (rawZ && typeof DELIVERY_ZONES !== 'undefined') {
        const parsed = JSON.parse(rawZ);
        if (Array.isArray(parsed) && parsed.length) {
          DELIVERY_ZONES.length = 0;
          parsed.forEach(z => DELIVERY_ZONES.push(z));
        }
      }
    } catch (e) { /* keep */ }
  }

  /** Merge remote + local draft site images, then apply to DOM */
  function applySiteImages() {
    const images = {};
    try {
      if (window.__NV_REMOTE_IMAGES) {
        Object.assign(images, window.__NV_REMOTE_IMAGES);
      }
    } catch (e) { /* */ }
    try {
      const raw = localStorage.getItem('nv_images_override');
      if (raw) Object.assign(images, JSON.parse(raw));
    } catch (e) { /* */ }

    function isUsableImageUrl(url) {
      if (!url || typeof url !== 'string') return false;
      const u = url.trim();
      if (!u || u === 'undefined' || u === 'null') return false;
      // allow relative paths and absolute http(s) / data / blob
      return /^(https?:|data:|blob:|\/|\.\/|images\/)/i.test(u) || !/^[a-z]+:/i.test(u);
    }

    // CSS background slots (shop hero etc.)
    const bgMap = {
      hero: { el: document.querySelector('[data-site-img-bg="hero"]'), prop: '--hero-bg' },
      shop_hero: { el: document.querySelector('[data-site-img-bg="shop_hero"]'), prop: '--shop-hero-bg' }
    };
    Object.keys(bgMap).forEach(key => {
      const url = images[key];
      if (!isUsableImageUrl(url) || !bgMap[key].el) return;
      bgMap[key].el.style.setProperty(bgMap[key].prop, 'url("' + url.replace(/"/g, '\\"') + '")');
    });

    // <img> and video poster slots (hero uses real <img> for Safari reliability)
    document.querySelectorAll('[data-site-img]').forEach(el => {
      const key = el.getAttribute('data-site-img');
      const url = images[key];
      if (!isUsableImageUrl(url)) return;
      if (el.tagName === 'IMG') {
        el.src = url;
      } else if (el.tagName === 'VIDEO') {
        el.setAttribute('poster', url);
      }
    });
  }

  async function loadRemoteCatalog() {
    try {
      const bust = Math.floor(Date.now() / 30000); // ~30s cache window
      const res = await fetch(CATALOG_JSON_URL + '?t=' + bust, { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data || !Array.isArray(data.products)) return false;
      const prev = localStorage.getItem('nv_catalog_seen_at') || '';
      applyCatalogObject(data);
      if (data.updatedAt && data.updatedAt !== prev) {
        const isFirst = !prev;
        localStorage.setItem('nv_catalog_seen_at', data.updatedAt);
        if (!isFirst) {
          setTimeout(() => {
            const msg = (localStorage.getItem('nv_lang') || 'pt') === 'en'
              ? 'Catalog updated'
              : 'Catálogo actualizado';
            if (typeof showToast === 'function') showToast(msg);
          }, 600);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /** Open WhatsApp reliably on mobile Safari (window.open is often blocked) */
  function openWhatsApp(text) {
    const url = 'https://wa.me/244938890975?text=' + encodeURIComponent(text);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      const w = window.open(url, '_blank');
      if (!w) window.location.href = url;
    }
  }

  /* ---------- Language ---------- */
  const LANG_KEY = 'nv_lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'pt';

  const i18n = {
    pt: {
      announce: 'Entrega em toda Luanda · Encomende agora pelo WhatsApp',
      navHome: 'Início',
      navShop: 'Loja',
      navSkincare: 'Pele',
      navBody: 'Corpo',
      navHair: 'Cabelo',
      navPerfume: 'Perfumes',
      navAbout: 'Sobre',
      navContact: 'Contacto',
      heroTitle: 'Realçando a sua <strong>beleza</strong> todos os dias',
      heroDesc: 'Cosméticos, maquiagem, perfumes e cuidados pessoais selecionados com amor para si.',
      heroCta1: 'Ver todos os produtos',
      catTitle: 'Comprar por categoria',
      catDesc: 'Explore o nosso universo de beleza',
      bestSelling: 'Mais vendidos',
      favoritos: 'Naravazz Favoritos',
      novosNaLoja: 'Novos na loja',
      experienceTitle: 'A experiência Naravazz',
      expLoja: 'Na loja',
      expClientes: 'Nossas clientes',
      expDepoimento: 'Depoimento',
      soapsEyebrow: 'Na loja',
      soapsTitle: 'Soaps',
      soapsDesc: 'Lavanda, girassol, rosas, canela, alecrim, carvão, enxofre, açafrão e mais. A Nara apresenta os sabonetes da loja.',
      viewAll: 'Ver todos',
      addToCart: 'Adicionar',
      aboutTitle: 'Sobre a Nara Vazz',
      aboutText: 'Na Nara Vazz, acreditamos que a beleza é um encanto diário. Oferecemos cosméticos, maquiagem, perfumes e cuidados pessoais de qualidade, com entrega rápida em Luanda e atendimento próximo.',
      aboutCta: 'Conheça-nos',
      promoTitle: 'Cuide da sua pele todos os dias',
      promoText: 'Protetores solares, hidratantes e kits exclusivos com a qualidade que você merece.',
      promoCta: 'Explorar proteção solar',
      instaTitle: 'Siga-nos no Instagram',
      newsletterLabel: 'Receba novidades e promoções',
      newsletterPlaceholder: 'O seu número WhatsApp',
      newsletterBtn: 'Subscrever',
      newsletterNote: 'Ao subscrever, aceita receber novidades e actualizações directamente no seu telemóvel.',
      footerHome: 'Início',
      footerShop: 'Loja',
      footerAbout: 'Sobre',
      footerContact: 'Contacto',
      footerDelivery: 'Entregas',
      footerPrivacy: 'Privacidade',
      footerTerms: 'Termos',
      copyright: '© 2026 Nara Vazz. Todos os direitos reservados.',
      cartTitle: 'Carrinho',
      cartEmpty: 'O seu carrinho está vazio.',
      cartContinue: 'Continuar a comprar',
      cartSubtotal: 'Subtotal',
      cartDelivery: 'Entrega',
      cartTotal: 'Total',
      cartCheckout: 'Finalizar encomenda',
      cartView: 'Ver carrinho',
      productAdd: 'Adicionar ao carrinho',
      qty: 'Quantidade',
      related: 'Pode também gostar',
      contactTitle: 'Contacte-nos',
      contactText: 'Estamos em Benfica, Rua Direita do Banco BFA, antes do Colégio Os Brilhantes.',
      contactFormName: 'Nome',
      contactFormEmail: 'Email',
      contactFormMsg: 'Mensagem',
      contactFormSend: 'Enviar mensagem',
      shopTitle: 'A nossa loja',
      shopDesc: 'Todos os produtos de beleza e cuidados pessoais',
      sortTrending: 'Trending',
      sortPriceAsc: 'Preço baixo para alto',
      sortPriceDesc: 'Preço alto para baixo',
      sortNew: 'Novos',
      addedToast: 'Adicionado ao carrinho',
      deliveryTitle: 'Tabela de Entregas',
      deliveryDesc: 'Entregamos com rapidez e segurança em vários pontos da cidade.',
      checkoutTitle: 'Finalizar encomenda',
      checkoutDesc: 'Preencha os seus dados para confirmar o pedido via WhatsApp',
      checkoutFirstName: 'Nome',
      checkoutLastName: 'Apelido',
      checkoutPhone: 'Telefone / WhatsApp',
      checkoutAddress: 'Morada / Rua',
      checkoutApt: 'Apartamento, suite, etc. (opcional)',
      checkoutCity: 'Cidade',
      checkoutMunicipality: 'Município',
      checkoutZone: 'Zona de entrega',
      checkoutZonePlaceholder: 'Selecione a zona…',
      checkoutNotes: 'Notas (opcional)',
      checkoutSubmit: 'Enviar encomenda via WhatsApp',
      checkoutEmpty: 'O seu carrinho está vazio.',
      checkoutBack: 'Voltar à loja',
      checkoutSelectZone: 'Selecione a zona de entrega',
      productBack: 'Voltar',
      cartClear: 'Limpar tudo',
      resultsCount: 'produtos'
    },
    en: {
      announce: 'Delivery across Luanda · Order now via WhatsApp',
      navHome: 'Home',
      navShop: 'Shop',
      navSkincare: 'Skincare',
      navBody: 'Body',
      navHair: 'Hair',
      navPerfume: 'Perfumes',
      navAbout: 'About',
      navContact: 'Contact',
      heroTitle: 'Enhancing your <strong>beauty</strong> every day',
      heroDesc: 'Cosmetics, makeup, perfumes and personal care selected with love for you.',
      heroCta1: 'View all products',
      catTitle: 'Shop by category',
      catDesc: 'Explore our beauty universe',
      bestSelling: 'Best selling',
      favoritos: 'Naravazz Favorites',
      novosNaLoja: 'New in store',
      experienceTitle: 'The Naravazz experience',
      expLoja: 'In store',
      expClientes: 'Our clients',
      expDepoimento: 'Testimonial',
      soapsEyebrow: 'In store',
      soapsTitle: 'Soaps',
      soapsDesc: 'Lavender, sunflower, roses, cinnamon, rosemary, charcoal, sulfur, saffron and more. Nara presents the soaps in store.',
      viewAll: 'View all',
      addToCart: 'Add',
      aboutTitle: 'About Nara Vazz',
      aboutText: 'At Nara Vazz, we believe beauty is a daily charm. We offer quality cosmetics, makeup, perfumes and personal care, with fast delivery in Luanda and close customer service.',
      aboutCta: 'Learn more',
      promoTitle: 'Care for your skin every day',
      promoText: 'Sunscreens, moisturizers and exclusive kits with the quality you deserve.',
      promoCta: 'Explore sun protection',
      instaTitle: 'Follow us on Instagram',
      newsletterLabel: 'Get news and offers',
      newsletterPlaceholder: 'Your WhatsApp number',
      newsletterBtn: 'Subscribe',
      newsletterNote: 'By subscribing you agree to receive news and updates directly on your phone.',
      footerHome: 'Home',
      footerShop: 'Shop',
      footerAbout: 'About',
      footerContact: 'Contact',
      footerDelivery: 'Delivery',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms',
      copyright: '© 2026 Nara Vazz. All rights reserved.',
      cartTitle: 'Cart',
      cartEmpty: 'Your cart is empty.',
      cartContinue: 'Continue shopping',
      cartSubtotal: 'Subtotal',
      cartDelivery: 'Delivery',
      cartTotal: 'Total',
      cartCheckout: 'Checkout',
      cartView: 'View cart',
      productAdd: 'Add to cart',
      qty: 'Quantity',
      related: 'You may also like',
      contactTitle: 'Contact us',
      contactText: 'We are in Benfica, Rua Direita do Banco BFA, before Colégio Os Brilhantes.',
      contactFormName: 'Name',
      contactFormEmail: 'Email',
      contactFormMsg: 'Message',
      contactFormSend: 'Send message',
      shopTitle: 'Our shop',
      shopDesc: 'All beauty and personal care products',
      sortTrending: 'Trending',
      sortPriceAsc: 'Price low to high',
      sortPriceDesc: 'Price high to low',
      sortNew: 'New',
      addedToast: 'Added to cart',
      deliveryTitle: 'Delivery Rates',
      deliveryDesc: 'We deliver quickly and safely to many areas of the city.',
      checkoutTitle: 'Checkout',
      checkoutDesc: 'Fill in your details to confirm the order via WhatsApp',
      checkoutFirstName: 'First name',
      checkoutLastName: 'Last name',
      checkoutPhone: 'Phone / WhatsApp',
      checkoutAddress: 'Street address',
      checkoutApt: 'Apartment, suite, etc. (optional)',
      checkoutCity: 'City',
      checkoutMunicipality: 'Municipality',
      checkoutZone: 'Delivery zone',
      checkoutZonePlaceholder: 'Select a zone…',
      checkoutNotes: 'Notes (optional)',
      checkoutSubmit: 'Send order via WhatsApp',
      checkoutEmpty: 'Your cart is empty.',
      checkoutBack: 'Back to shop',
      checkoutSelectZone: 'Please select a delivery zone',
      productBack: 'Back',
      cartClear: 'Clear all',
      resultsCount: 'products'
    }
  };

  const CAT_TITLES = {
    pt: {
      all: { title: 'A nossa loja', desc: 'Todos os produtos de beleza e cuidados pessoais' },
      pele: { title: 'Pele', desc: 'Cuidados para a pele' },
      corpo: { title: 'Corpo', desc: 'Cuidados para o corpo' },
      cabelo: { title: 'Cabelo', desc: 'Produtos e extensões de cabelo' },
      perfume: { title: 'Perfumes', desc: 'Fragrâncias selecionadas' },
      intimo: { title: 'Íntimos', desc: 'Cuidados íntimos' },
      solar: { title: 'Solar', desc: 'Proteção solar' }
    },
    en: {
      all: { title: 'Our shop', desc: 'All beauty and personal care products' },
      pele: { title: 'Skincare', desc: 'Skin care products' },
      corpo: { title: 'Body', desc: 'Body care' },
      cabelo: { title: 'Hair', desc: 'Hair products and extensions' },
      perfume: { title: 'Perfumes', desc: 'Selected fragrances' },
      intimo: { title: 'Intimate', desc: 'Intimate care' },
      solar: { title: 'Sun', desc: 'Sun protection' }
    }
  };

  function applyTextOverrides() {
    try {
      if (window.__NV_REMOTE_TEXTS) {
        const ov = window.__NV_REMOTE_TEXTS;
        if (ov.pt) Object.keys(ov.pt).forEach(k => { i18n.pt[k] = ov.pt[k]; });
        if (ov.en) Object.keys(ov.en).forEach(k => { i18n.en[k] = ov.en[k]; });
      }
    } catch (e) { /* keep */ }
    try {
      const raw = localStorage.getItem('nv_texts_override');
      if (!raw) return;
      const ov = JSON.parse(raw);
      if (ov.pt) Object.keys(ov.pt).forEach(k => { i18n.pt[k] = ov.pt[k]; });
      if (ov.en) Object.keys(ov.en).forEach(k => { i18n.en[k] = ov.en[k]; });
    } catch (e) { /* keep defaults */ }
  }

  function t(key) {
    return (i18n[currentLang] && i18n[currentLang][key]) || i18n.pt[key] || key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t(key);
        } else {
          el.innerHTML = t(key);
        }
      }
    });
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt';
    const langBtn = document.querySelector('.lang-toggle');
    if (langBtn) langBtn.textContent = currentLang === 'pt' ? 'EN' : 'PT';
    updateShopTitles();
  }

  /* ---------- Cart ---------- */
  const CART_KEY = 'nv_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCartPanel();
    if (typeof renderCartPage === 'function' && document.getElementById('cart-content')) renderCartPage();
    if (document.getElementById('checkout-content')) renderCheckout();
  }

  function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function addToCart(productId, qty = 1) {
    const product = getProductById(productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: productId, qty });
    }
    saveCart(cart);
    showToast(t('addedToast'));
    openCartPanel();
  }

  function removeFromCart(productId) {
    let cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function setQty(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      if (qty < 1) {
        removeFromCart(productId);
        return;
      }
      item.qty = qty;
      saveCart(cart);
    }
  }

  /* ---------- Cart Panel ---------- */
  function openCartPanel() {
    document.querySelector('.cart-panel')?.classList.add('open');
    document.querySelector('.cart-panel-overlay')?.classList.add('open');
    document.body.classList.add('menu-open');
    renderCartPanel();
  }

  function closeCartPanel() {
    document.querySelector('.cart-panel')?.classList.remove('open');
    document.querySelector('.cart-panel-overlay')?.classList.remove('open');
    if (!document.querySelector('.mobile-drawer')?.classList.contains('open')) {
      document.body.classList.remove('menu-open');
    }
  }

  function renderCartPanel() {
    const body = document.getElementById('cart-panel-body');
    const footer = document.getElementById('cart-panel-footer');
    if (!body) return;
    const cart = getCart();

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-panel-empty">
          <p>${t('cartEmpty')}</p>
          <a href="shop.html" class="btn btn-primary btn-sm">${t('cartContinue')}</a>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    let subtotal = 0;
    body.innerHTML = cart.map(item => {
      const p = getProductById(item.id);
      if (!p) return '';
      const name = currentLang === 'en' ? (p.nameEn || p.name) : p.name;
      const line = p.price * item.qty;
      subtotal += line;
      return `
        <div class="cart-panel-item">
          <img src="${p.image}" alt="${name}">
          <div class="cart-panel-item-info">
            <div class="cart-panel-item-name">${name}</div>
            <div class="cart-panel-item-price">${formatPrice(p.price)}</div>
            <div class="qty-control">
              <button type="button" data-panel-minus="${p.id}">−</button>
              <span>${item.qty}</span>
              <button type="button" data-panel-plus="${p.id}">+</button>
            </div>
          </div>
          <button type="button" class="cart-panel-item-remove" data-panel-remove="${p.id}" aria-label="Remove">✕</button>
        </div>
      `;
    }).join('');

    if (footer) {
      footer.style.display = 'block';
      footer.innerHTML = `
        <div class="cart-panel-subtotal">
          <span>${t('cartSubtotal')}</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-full">${t('cartCheckout')}</a>
        <a href="cart.html" class="btn btn-outline btn-full">${t('cartView')}</a>
        <button type="button" class="btn-clear-cart" id="cart-clear-btn">${t('cartClear')}</button>
      `;
      footer.querySelector('#cart-clear-btn')?.addEventListener('click', () => {
        clearCart();
      });
    }

    body.querySelectorAll('[data-panel-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-panel-remove')));
    });
    body.querySelectorAll('[data-panel-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-panel-minus');
        const item = getCart().find(i => i.id === id);
        if (item) setQty(id, item.qty - 1);
      });
    });
    body.querySelectorAll('[data-panel-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-panel-plus');
        const item = getCart().find(i => i.id === id);
        if (item) setQty(id, item.qty + 1);
      });
    });
  }

  function initCartPanel() {
    document.querySelectorAll('.cart-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCartPanel();
        // close mobile drawer if open
        document.querySelector('.hamburger')?.classList.remove('open');
        document.querySelector('.mobile-drawer')?.classList.remove('open');
        document.querySelector('.drawer-overlay')?.classList.remove('open');
      });
    });
    document.querySelector('.cart-panel-overlay')?.addEventListener('click', closeCartPanel);
    document.querySelector('.cart-panel-close')?.addEventListener('click', closeCartPanel);
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    // Force reflow so re-showing always animates
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toastTimer = null;
    }, 2200);
  }

  /* ---------- Header behavior ---------- */
  function initHeader() {
    const header = document.querySelector('.site-header');
    const announce = document.querySelector('.announce-bar');
    let lastScroll = 0;
    const isInnerPage = header && header.classList.contains('scrolled') && !document.querySelector('.hero');

    function onScroll() {
      const y = window.scrollY;
      if (header && !isInnerPage) {
        if (y > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
      // Hide announcement bar on scroll down; show on scroll up or near top
      if (announce) {
        if (y > 60 && y > lastScroll) {
          announce.classList.add('hidden');
          if (header) header.style.top = '0';
        } else {
          announce.classList.remove('hidden');
          if (header) header.style.top = '';
        }
      }
      lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Ensure scrolled state on non-home pages
    if (isInnerPage) {
      header.classList.add('scrolled');
    }

    // Hamburger
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.drawer-overlay');
    const closeBtn = document.querySelector('.drawer-close');

    function openDrawer() {
      hamburger?.classList.add('open');
      drawer?.classList.add('open');
      overlay?.classList.add('open');
      document.body.classList.add('menu-open');
    }

    function closeDrawer() {
      hamburger?.classList.remove('open');
      drawer?.classList.remove('open');
      overlay?.classList.remove('open');
      if (!document.querySelector('.cart-panel')?.classList.contains('open')) {
        document.body.classList.remove('menu-open');
      }
    }

    hamburger?.addEventListener('click', () => {
      if (drawer?.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
    overlay?.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    // Lang toggle
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem(LANG_KEY, currentLang);
        applyTranslations();
        if (document.getElementById('product-grid')) renderShop();
        if (document.getElementById('carousel-bestselling') || document.getElementById('featured-grid')) {
          renderFeatured();
          showCollection(activeCollectionIndex);
        }
        if (document.getElementById('cart-content')) renderCartPage();
        if (document.getElementById('checkout-content')) renderCheckout();
        renderCartPanel();
      });
    });
  }

  /* ---------- Product Cards ---------- */
  function productCardHTML(p) {
    const name = currentLang === 'en' ? (p.nameEn || p.name) : p.name;
    const cat = currentLang === 'en' ? (p.categoryLabelEn || p.categoryLabel) : p.categoryLabel;
    return `
      <article class="product-card">
        <a href="product.html?id=${p.id}" class="product-card-img">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${name}" loading="lazy">
        </a>
        <div class="product-card-body">
          <span class="product-cat">${cat}</span>
          <a href="product.html?id=${p.id}" class="product-name">${name}</a>
          <div class="product-price">${formatPrice(p.price)}</div>
          <div class="product-card-actions">
            <button class="btn btn-primary btn-sm btn-full" data-add="${p.id}">${t('addToCart')}</button>
          </div>
        </div>
      </article>
    `;
  }

  function bindAddButtons(container) {
    container.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(btn.getAttribute('data-add'));
      });
    });
  }

  /* ---------- Home: Product collections (Top G style) ---------- */
  const COLLECTION_KEYS = ['bestselling', 'favoritos', 'novos'];
  const COLLECTION_I18N = {
    bestselling: 'bestSelling',
    favoritos: 'favoritos',
    novos: 'novosNaLoja'
  };
  let activeCollectionIndex = 0;

  function fillCarousel(id, list) {
    const track = document.getElementById(id);
    if (!track) return;
    const items = list.length ? list : PRODUCTS.slice(0, 8);
    track.innerHTML = items.map(productCardHTML).join('');
    bindAddButtons(track);
  }

  function productsByIds(ids) {
    const map = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
    return ids.map(id => map[id]).filter(Boolean);
  }

  function renderFeatured() {
    // Disjoint curated lists so each collection feels different in demos
    const best = productsByIds([
      'sabonete-intimo-rosa',
      'yara-lattafa-kit',
      'herbissimo-care-rosa',
      'la-roche-anthelios',
      'kit-vitamina-c',
      'anthelios-uvmune',
      'keratin-kit',
      'clareador-kit'
    ]);
    const fav = productsByIds([
      'lucky-lily-reafirmante',
      'mixia-body-lotion',
      'dear-body-oil',
      'baba-soul-sexy-morango',
      'baba-soul-sexy-frutas',
      'lucky-lily-granada',
      'lucky-lily-laranja',
      'lucky-lily-blue-iris',
      'lucky-lily-maca',
      'baba-bell-sexy'
    ]);
    const novos = productsByIds([
      'wepink-obsessed',
      'lumalux-full-blind-ombre',
      'peruca-curly-ombre',
      'peruca-bob-preto',
      'peruca-bob-loiro',
      'peruca-curly-preto',
      'derma-citem-fps85',
      'acnezi-tratamento',
      'body-splash-soul',
      'perfume-calcinha-algodao'
    ]);

    fillCarousel('carousel-bestselling', best);
    fillCarousel('carousel-favoritos', fav);
    fillCarousel('carousel-novos', novos);
  }

  function updateCollectionNav() {
    const prev = document.getElementById('collection-prev');
    const next = document.getElementById('collection-next');
    const atStart = activeCollectionIndex <= 0;
    const atEnd = activeCollectionIndex >= COLLECTION_KEYS.length - 1;
    if (prev) {
      prev.disabled = atStart;
      prev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
    }
    if (next) {
      next.disabled = atEnd;
      next.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
    }
  }

  function showCollection(index) {
    const panels = document.querySelectorAll('.collection-panel');
    const titleEl = document.getElementById('collection-title');
    if (!panels.length) return;

    // No infinite loop - clamp to first / last collection
    activeCollectionIndex = Math.max(0, Math.min(index, COLLECTION_KEYS.length - 1));
    const key = COLLECTION_KEYS[activeCollectionIndex];

    panels.forEach(panel => {
      const isActive = panel.getAttribute('data-collection') === key;
      panel.classList.toggle('is-active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
        const track = panel.querySelector('.carousel-track');
        if (track) track.scrollLeft = 0;
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    if (titleEl) {
      const i18nKey = COLLECTION_I18N[key];
      titleEl.setAttribute('data-i18n', i18nKey);
      titleEl.textContent = t(i18nKey);
    }

    updateCollectionNav();
  }

  function initCarousels() {
    const prev = document.getElementById('collection-prev');
    const next = document.getElementById('collection-next');
    if (!prev && !next) return;

    prev?.addEventListener('click', () => {
      if (activeCollectionIndex > 0) showCollection(activeCollectionIndex - 1);
    });
    next?.addEventListener('click', () => {
      if (activeCollectionIndex < COLLECTION_KEYS.length - 1) showCollection(activeCollectionIndex + 1);
    });

    document.addEventListener('langchange', () => showCollection(activeCollectionIndex));

    showCollection(0);
  }

  /* ---------- Experience videos ---------- */
  function initExperience() {
    const track = document.getElementById('experience-track');
    if (!track) return;

    const prev = document.querySelector('.experience-prev');
    const next = document.querySelector('.experience-next');
    const cards = track.querySelectorAll('.experience-card');
    const section = track.closest('.experience-section');

    function stepSize() {
      const card = track.querySelector('.experience-card');
      return card ? card.offsetWidth + 16 : 300;
    }

    prev?.addEventListener('click', () => {
      track.scrollBy({ left: -stepSize(), behavior: 'smooth' });
    });
    next?.addEventListener('click', () => {
      track.scrollBy({ left: stepSize(), behavior: 'smooth' });
    });

    function pauseAll(except) {
      cards.forEach(c => {
        const v = c.querySelector('video');
        if (v && v !== except) {
          try { v.pause(); } catch (e) {}
          c.classList.remove('is-playing');
          const btn = c.querySelector('.experience-play');
          if (btn) btn.setAttribute('aria-label', 'Play');
        }
      });
    }

    cards.forEach(card => {
      const video = card.querySelector('video');
      const playBtn = card.querySelector('.experience-play');
      if (!video || !playBtn) return;

      // Inline playback on iOS; sound is allowed after a user gesture
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      try { video.playsInline = true; } catch (e) {}
      video.muted = false;
      video.defaultMuted = false;
      video.removeAttribute('muted');

      // Safari often shows a black frame until play — force first frame paint
      const showFirstFrame = () => {
        try {
          if (video.readyState >= 1 && video.currentTime < 0.05) {
            video.currentTime = 0.001;
          }
        } catch (e) {}
      };
      video.addEventListener('loadedmetadata', showFirstFrame);
      video.addEventListener('loadeddata', showFirstFrame);
      if (video.readyState >= 1) showFirstFrame();

      let touchStartX = 0;
      let touchStartY = 0;
      let moved = false;
      let lastToggleAt = 0;

      const setPlayingUI = (playing) => {
        if (playing) {
          card.classList.add('is-playing');
          playBtn.setAttribute('aria-label', 'Pause');
        } else {
          card.classList.remove('is-playing');
          playBtn.setAttribute('aria-label', 'Play');
        }
      };

      const playVideo = () => {
        pauseAll(video);
        // User-initiated play → with sound
        video.muted = false;
        const p = video.play();
        if (p && typeof p.then === 'function') {
          p.then(() => setPlayingUI(true)).catch(() => {
            // Safari may still block unmuted in rare cases; retry muted then unmute
            video.muted = true;
            video.play().then(() => {
              video.muted = false;
              setPlayingUI(true);
            }).catch(() => setPlayingUI(false));
          });
        } else {
          setPlayingUI(!video.paused);
        }
      };

      const pauseVideo = () => {
        try { video.pause(); } catch (e) {}
        setPlayingUI(false);
      };

      // Debounce protects against iOS firing both touchend + click
      const toggle = () => {
        const now = Date.now();
        if (now - lastToggleAt < 350) return;
        lastToggleAt = now;
        if (video.paused) playVideo();
        else pauseVideo();
      };

      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      });

      card.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        moved = false;
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        const t = e.changedTouches[0];
        if (Math.abs(t.clientX - touchStartX) > 12 || Math.abs(t.clientY - touchStartY) > 12) {
          moved = true;
        }
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        if (moved) return;
        if (playBtn.contains(e.target)) return;
        e.preventDefault();
        toggle();
      }, { passive: false });

      card.addEventListener('click', (e) => {
        if (playBtn.contains(e.target)) return;
        toggle();
      });

      video.addEventListener('ended', () => setPlayingUI(false));
      video.addEventListener('pause', () => {
        if (video.paused) setPlayingUI(false);
      });
      video.addEventListener('play', () => setPlayingUI(true));
    });

    // Pause + stop sound when the whole experience section leaves the viewport
    if (section && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) pauseAll(null);
        });
      }, { threshold: 0.15 });
      io.observe(section);
    }
  }

  /* ---------- Soaps video: pause (stop sound) when scrolled past ---------- */
  function initSoapsVideo() {
    const video = document.querySelector('.soaps-video');
    if (!video) return;

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    try { video.playsInline = true; } catch (e) {}

    // Safari black frame fix: show first frame before play
    const showFirstFrame = () => {
      try {
        if (video.readyState >= 1 && video.currentTime < 0.05) {
          video.currentTime = 0.001;
        }
      } catch (e) {}
    };
    video.addEventListener('loadedmetadata', showFirstFrame);
    video.addEventListener('loadeddata', showFirstFrame);
    if (video.readyState >= 1) showFirstFrame();

    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          try {
            video.pause();
            // Ensure audio stops even if browser keeps buffering
            video.muted = true;
          } catch (e) {}
        } else {
          // Restore ability to hear when user plays again via controls
          video.muted = false;
        }
      });
    }, { threshold: 0.25 });

    io.observe(video);
  }

  /* ---------- Shop ---------- */
  let currentFilter = 'all';
  let currentSort = 'trending';

  function updateShopTitles() {
    const titleEl = document.getElementById('shop-page-title');
    const descEl = document.getElementById('shop-page-desc');
    if (!titleEl) return;
    const titles = CAT_TITLES[currentLang] || CAT_TITLES.pt;
    const info = titles[currentFilter] || titles.all;
    titleEl.textContent = info.title;
    if (descEl) descEl.textContent = info.desc;
    document.title = info.title + ' · Nara Vazz';
  }

  function renderShop() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    let list = getProductsByCategory(currentFilter);

    if (currentSort === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (currentSort === 'new') {
      list = [...list].reverse();
    } else {
      // trending: badge first, then original order
      list = [...list].sort((a, b) => {
        const aB = a.badge ? 1 : 0;
        const bB = b.badge ? 1 : 0;
        return bB - aB;
      });
    }

    grid.innerHTML = list.map(productCardHTML).join('');
    bindAddButtons(grid);

    const countEl = document.getElementById('results-count');
    if (countEl) {
      countEl.textContent = list.length + ' ' + t('resultsCount');
    }
    updateShopTitles();
  }

  function initShop() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) currentFilter = cat;

    // Highlight active nav link for category
    document.querySelectorAll('.desktop-nav .nav-link, .drawer-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (cat && href.includes('cat=' + cat)) {
        a.classList.add('active');
        document.querySelectorAll('.desktop-nav .nav-link').forEach(l => {
          if (l.getAttribute('href') === 'shop.html') l.classList.remove('active');
        });
      }
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = currentSort;
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        renderShop();
      });
    }
    renderShop();
  }

  /* ---------- Product Detail ---------- */
  function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const product = id ? getProductById(id) : null;
    const container = document.getElementById('product-detail');
    if (!container) return;

    if (!product) {
      container.innerHTML = `<div class="container"><p>Produto não encontrado. <a href="shop.html">Voltar à loja</a></p></div>`;
      return;
    }

    const name = currentLang === 'en' ? (product.nameEn || product.name) : product.name;
    const desc = currentLang === 'en' ? (product.descEn || product.desc) : product.desc;
    const cat = currentLang === 'en' ? (product.categoryLabelEn || product.categoryLabel) : product.categoryLabel;

    const shopHref = product.category ? `shop.html?cat=${product.category}` : 'shop.html';

    container.innerHTML = `
      <div class="container">
        <button type="button" class="product-back" id="product-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          <span>${t('productBack')}</span>
        </button>
        <div class="product-detail-grid">
          <div class="product-gallery">
            <img src="${product.image}" alt="${name}">
          </div>
          <div class="product-info">
            <span class="product-cat">${cat} · ${product.brand || ''}</span>
            <h1>${name}</h1>
            <div class="price">${formatPrice(product.price)}</div>
            <p class="desc">${desc}</p>
            <div class="qty-row">
              <span>${t('qty')}</span>
              <div class="qty-control">
                <button type="button" id="qty-minus">−</button>
                <span id="qty-value">1</span>
                <button type="button" id="qty-plus">+</button>
              </div>
            </div>
            <button class="btn btn-primary btn-full" id="add-detail">${t('productAdd')}</button>
            <dl class="product-meta">
              <dt>Marca / Brand</dt>
              <dd>${product.brand || 'Nara Vazz'}</dd>
              <dt>Categoria / Category</dt>
              <dd>${cat}</dd>
            </dl>
          </div>
        </div>
        <div class="section" style="padding-top:3rem">
          <div class="section-header">
            <h2 class="section-title">${t('related')}</h2>
          </div>
          <div class="product-grid" id="related-grid"></div>
        </div>
      </div>
      <div class="product-sticky-bar" id="product-sticky-bar">
        <span class="price">${formatPrice(product.price)}</span>
        <button type="button" class="btn btn-primary" id="add-detail-sticky">${t('productAdd')}</button>
      </div>
    `;

    document.getElementById('product-back')?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = shopHref;
      }
    });

    let qty = 1;
    const qtyEl = document.getElementById('qty-value');
    document.getElementById('qty-minus')?.addEventListener('click', () => {
      qty = Math.max(1, qty - 1);
      if (qtyEl) qtyEl.textContent = qty;
    });
    document.getElementById('qty-plus')?.addEventListener('click', () => {
      qty += 1;
      if (qtyEl) qtyEl.textContent = qty;
    });
    const doAdd = () => addToCart(product.id, qty);
    document.getElementById('add-detail')?.addEventListener('click', doAdd);
    document.getElementById('add-detail-sticky')?.addEventListener('click', doAdd);

    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    const relGrid = document.getElementById('related-grid');
    if (relGrid) {
      relGrid.innerHTML = related.map(productCardHTML).join('');
      bindAddButtons(relGrid);
    }
  }

  /* ---------- Cart Page ---------- */
  function renderCartPage() {
    const container = document.getElementById('cart-content');
    if (!container) return;
    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <p>${t('cartEmpty')}</p>
          <a href="shop.html" class="btn btn-primary">${t('cartContinue')}</a>
        </div>
      `;
      return;
    }

    let subtotal = 0;
    const itemsHTML = cart.map(item => {
      const p = getProductById(item.id);
      if (!p) return '';
      const name = currentLang === 'en' ? (p.nameEn || p.name) : p.name;
      const line = p.price * item.qty;
      subtotal += line;
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${name}">
          <div>
            <div class="cart-item-name">${name}</div>
            <div class="cart-item-price">${formatPrice(p.price)}</div>
          </div>
          <div class="qty-control">
            <button type="button" data-qty-minus="${p.id}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty-plus="${p.id}">+</button>
          </div>
          <div class="cart-item-price">${formatPrice(line)}</div>
          <button type="button" data-remove="${p.id}" style="color:var(--muted);font-size:0.8rem;cursor:pointer">✕</button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="cart-items">${itemsHTML}</div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>${t('cartSubtotal')}</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span>${t('cartDelivery')}</span>
          <span>A calcular</span>
        </div>
        <div class="cart-summary-row total">
          <span>${t('cartTotal')}</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-full" style="margin-top:1.25rem">${t('cartCheckout')}</a>
      </div>
    `;

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-remove')));
    });
    container.querySelectorAll('[data-qty-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-qty-minus');
        const item = getCart().find(i => i.id === id);
        if (item) setQty(id, item.qty - 1);
      });
    });
    container.querySelectorAll('[data-qty-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-qty-plus');
        const item = getCart().find(i => i.id === id);
        if (item) setQty(id, item.qty + 1);
      });
    });
  }

  /* ---------- Checkout ---------- */
  function renderCheckout() {
    const container = document.getElementById('checkout-content');
    if (!container) return;
    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <p>${t('checkoutEmpty')}</p>
          <a href="shop.html" class="btn btn-primary">${t('checkoutBack')}</a>
        </div>
      `;
      return;
    }

    let subtotal = 0;
    const lines = cart.map(item => {
      const p = getProductById(item.id);
      if (!p) return '';
      const name = currentLang === 'en' ? (p.nameEn || p.name) : p.name;
      const line = p.price * item.qty;
      subtotal += line;
      return `<div class="checkout-line"><span>${name} × ${item.qty}</span><span>${formatPrice(line)}</span></div>`;
    }).join('');

    const zoneOptions = (typeof DELIVERY_ZONES !== 'undefined' ? DELIVERY_ZONES : [])
      .map(z => `<option value="${z.name}" data-price="${z.price}">${z.name} — ${formatPrice(z.price)}</option>`)
      .join('');

    container.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-form-card">
          <h2>${t('checkoutTitle')}</h2>
          <form id="checkout-form">
            <div class="form-row-2">
              <div class="form-group">
                <label for="co-first">${t('checkoutFirstName')}</label>
                <input type="text" id="co-first" name="firstName" required autocomplete="given-name">
              </div>
              <div class="form-group">
                <label for="co-last">${t('checkoutLastName')}</label>
                <input type="text" id="co-last" name="lastName" required autocomplete="family-name">
              </div>
            </div>
            <div class="form-group">
              <label for="co-phone">${t('checkoutPhone')}</label>
              <input type="tel" id="co-phone" name="phone" required autocomplete="tel" inputmode="tel" placeholder="+244 ...">
            </div>
            <div class="form-group">
              <label for="co-zone">${t('checkoutZone')}</label>
              <select id="co-zone" name="zone" required>
                <option value="">${t('checkoutZonePlaceholder')}</option>
                ${zoneOptions}
              </select>
            </div>
            <div class="form-group">
              <label for="co-address">${t('checkoutAddress')}</label>
              <input type="text" id="co-address" name="address" required autocomplete="street-address">
            </div>
            <div class="form-group">
              <label for="co-apt">${t('checkoutApt')}</label>
              <input type="text" id="co-apt" name="apt" autocomplete="address-line2">
            </div>
            <div class="form-group">
              <label for="co-city">${t('checkoutCity')}</label>
              <input type="text" id="co-city" name="city" required autocomplete="address-level2" value="Luanda">
            </div>
            <div class="form-group">
              <label for="co-notes">${t('checkoutNotes')}</label>
              <textarea id="co-notes" name="notes" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="checkout-summary-card">
          <h2>${t('cartTitle')}</h2>
          ${lines}
          <div class="checkout-totals">
            <div class="row"><span>${t('cartSubtotal')}</span><span id="co-subtotal">${formatPrice(subtotal)}</span></div>
            <div class="row"><span>${t('cartDelivery')}</span><span id="co-delivery">—</span></div>
            <div class="row total"><span>${t('cartTotal')}</span><span id="co-total">${formatPrice(subtotal)}</span></div>
          </div>
          <button type="submit" form="checkout-form" class="btn btn-primary btn-full" style="margin-top:1.25rem">${t('checkoutSubmit')}</button>
          <p class="checkout-hint" style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-soft);text-align:center">
            <a href="delivery.html">${t('footerDelivery')}</a>
          </p>
        </div>
      </div>
    `;

    const zoneSelect = document.getElementById('co-zone');
    const deliveryEl = document.getElementById('co-delivery');
    const totalEl = document.getElementById('co-total');

    function updateDeliveryTotal() {
      const opt = zoneSelect?.selectedOptions[0];
      const fee = opt && opt.value ? Number(opt.dataset.price) || 0 : 0;
      if (deliveryEl) deliveryEl.textContent = fee > 0 ? formatPrice(fee) : '—';
      if (totalEl) totalEl.textContent = formatPrice(subtotal + fee);
      return fee;
    }

    zoneSelect?.addEventListener('change', updateDeliveryTotal);
    updateDeliveryTotal();

    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const zone = zoneSelect?.value || '';
      if (!zone) {
        alert(t('checkoutSelectZone'));
        zoneSelect?.focus();
        return;
      }
      const fee = updateDeliveryTotal();
      const first = document.getElementById('co-first').value.trim();
      const last = document.getElementById('co-last').value.trim();
      const phone = document.getElementById('co-phone').value.trim();
      const address = document.getElementById('co-address').value.trim();
      const apt = document.getElementById('co-apt').value.trim();
      const city = document.getElementById('co-city').value.trim();
      const notes = document.getElementById('co-notes').value.trim();

      let msg = `Olá Nara Vazz! Gostaria de encomendar:\n\n`;
      cart.forEach(item => {
        const p = getProductById(item.id);
        if (p) msg += `• ${p.name} x${item.qty} - ${formatPrice(p.price * item.qty)}\n`;
      });
      msg += `\nSubtotal: ${formatPrice(subtotal)}`;
      msg += `\nEntrega (${zone}): ${formatPrice(fee)}`;
      msg += `\nTotal: ${formatPrice(subtotal + fee)}\n`;
      msg += `\nNome: ${first} ${last}\nTelefone: ${phone}`;
      msg += `\nMorada: ${address}`;
      if (apt) msg += `, ${apt}`;
      msg += `\nCidade: ${city}\nZona de entrega: ${zone}`;
      if (notes) msg += `\nNotas: ${notes}`;

      openWhatsApp(msg);
    });
  }

  function renderDeliveryTable() {
    const tbody = document.getElementById('delivery-tbody');
    if (!tbody || typeof DELIVERY_ZONES === 'undefined') return;
    tbody.innerHTML = DELIVERY_ZONES.map(z =>
      `<tr><td>${z.name}</td><td>${z.price.toLocaleString('pt-AO')}</td></tr>`
    ).join('');
  }

  function initPageBack() {
    document.querySelectorAll('.page-back').forEach(btn => {
      btn.addEventListener('click', () => {
        const fallback = btn.getAttribute('data-fallback') || 'index.html';
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = fallback;
        }
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadRemoteCatalog();
    applyLocalDraftOverrides();
    applyTextOverrides();
    applySiteImages();

    initHeader();
    initCartPanel();
    applyTranslations();
    updateCartCount();
    renderCartPanel();
    renderFeatured();
    initCarousels();
    initExperience();
    initSoapsVideo();
    initShop();
    initProductPage();
    renderCartPage();
    renderCheckout();
    renderDeliveryTable();
    initPageBack();

    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[name="whatsapp"], input[type="tel"]');
        const number = (input?.value || '').trim();
        if (!number) return;

        const msg = currentLang === 'pt'
          ? `Olá Nara Vazz! Quero receber novidades e promoções no meu WhatsApp.\n\nO meu número: ${number}`
          : `Hello Nara Vazz! I want to receive news and offers on my WhatsApp.\n\nMy number: ${number}`;

        openWhatsApp(msg);
        showToast(currentLang === 'pt' ? 'Obrigado pela subscrição!' : 'Thank you for subscribing!');
        form.reset();
      });
    });
  });

  window.NaraVazz = { addToCart, t, currentLang, openCartPanel };
})();
