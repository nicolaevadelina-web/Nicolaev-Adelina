/* ================================================
   Sweet Dreams Cahul — script.js
   Autor: Nicolaev Adelina | Grupa W2421
   ================================================ */

/* ── Utilitare DOM ── */
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

/* ================================================
   1. NAVBAR — umbra la scroll + hamburger
   ================================================ */
(function initNav() {
  var header = $('header');
  if (!header) return;

  /* Umbra la scroll */
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* Hamburger */
  var hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Deschide meniu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  $('nav').appendChild(hamburger);

  var navLinks = $('.nav-links');

  hamburger.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Închide meniul la click pe un link */
  $$('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Închide meniul la Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
})();

/* ================================================
   2. REVEAL ON SCROLL — animație la derulare
   ================================================ */
(function initReveal() {
  var elements = $$('.reveal');
  if (!elements.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        /* Întârziere scalonată pentru grupuri de carduri */
        var siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
          : [];
        var index = siblings.indexOf(entry.target);
        var delay = Math.min(index * 80, 400); /* max 400ms delay */

        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ================================================
   3. FLOATING ITEMS — adaugă automat pe hero
   ================================================ */
(function initFloatingItems() {
  var hero = $('.hero');
  if (!hero) return;

  /* Evităm duplicarea dacă elementele există deja în HTML */
  if ($('.floating-items')) return;

  var items = [
    { emoji: '🌸', cls: 'fi1' },
    { emoji: '✨', cls: 'fi2' },
    { emoji: '🍓', cls: 'fi3' },
    { emoji: '🌹', cls: 'fi4' },
    { emoji: '💫', cls: 'fi5' },
  ];

  var container = document.createElement('div');
  container.className = 'floating-items';

  items.forEach(function (item) {
    var el = document.createElement('div');
    el.className = 'float-item ' + item.cls;
    el.textContent = item.emoji;
    container.appendChild(el);
  });

  hero.insertBefore(container, hero.firstChild);
})();

/* ================================================
   4. FILTRU MENIU (meniu.html)
   ================================================ */
(function initMenuFilter() {
  var filterBtns = $$('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var categorie = btn.getAttribute('data-cat') || 'toate';
      filtreazaMeniu(categorie, btn);
    });
  });
})();

function filtreazaMeniu(categorie, buton) {
  /* Activează butonul apăsat */
  $$('.filter-btn').forEach(function (b) {
    b.classList.remove('activ');
  });
  if (buton) buton.classList.add('activ');

  /* Arată/ascunde cardurile cu animație */
  $$('.menu-card').forEach(function (card, i) {
    var potrivit = (categorie === 'toate' || card.dataset.cat === categorie);
    if (potrivit) {
      card.style.display = '';
      card.style.animationDelay = (i * 40) + 'ms';
      card.style.animation = 'none';
      /* forțăm reflow pentru a reseta animația */
      void card.offsetWidth;
      card.style.animation = 'fadeUp 0.4s ease both';
    } else {
      card.style.display = 'none';
    }
  });
}

/* Suport pentru atribut data-cat pe butoane — adaugă automat dacă lipsește */
(function addDataCatToFilterBtns() {
  var map = {
    'toate': 'toate', '✦ toate': 'toate',
    'torturi': 'torturi', '🎂 torturi': 'torturi',
    'éclere': 'eclere', '🍮 éclere': 'eclere', 'eclere': 'eclere',
    'tarte': 'tarte', '🥧 tarte': 'tarte',
    'macarons': 'macarons', '🍬 macarons': 'macarons',
  };
  $$('.filter-btn').forEach(function (btn) {
    if (!btn.getAttribute('data-cat')) {
      var text = btn.textContent.toLowerCase().trim();
      var cat = map[text];
      if (!cat) {
        /* încearcă o potrivire parțială */
        Object.keys(map).forEach(function (key) {
          if (text.includes(key)) cat = map[key];
        });
      }
      if (cat) btn.setAttribute('data-cat', cat);
    }
  });
})();

/* ================================================
   5. FORMULAR COMANDĂ TORT (torturi.html)
   ================================================ */
(function initFormComanda() {
  /* Există două elemente cu id="formComanda" în HTML original —
     selectăm formularul <form> corect */
  var form = document.querySelector('form#formComanda, #formComanda form, form[id="formComanda"]');

  /* Fallback: orice formular din secțiunea cu clasa order-form */
  if (!form) {
    var orderSection = $('.order-form');
    if (orderSection) form = orderSection.querySelector('form');
  }

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Validare minimă vizuală */
    var requiredFields = form.querySelectorAll('[required]');
    var valid = true;
    requiredFields.forEach(function (field) {
      if (!field.value.trim()) {
        field.style.borderColor = '#E05C6E';
        valid = false;
        field.addEventListener('input', function () {
          field.style.borderColor = '';
        }, { once: true });
      }
    });
    if (!valid) {
      requiredFields[0] && requiredFields[0].focus();
      return;
    }

    /* Afișare mesaj succes */
    var mesaj = $('#mesajSucces');
    if (!mesaj) {
      mesaj = document.createElement('div');
      mesaj.id = 'mesajSucces';
      mesaj.className = 'mesaj-succes';
      form.appendChild(mesaj);
    }
    mesaj.textContent = '🎉 Comanda a fost trimisă cu succes! Vă vom contacta în maxim 24 ore. Mulțumim!';
    mesaj.classList.add('show');
    mesaj.style.display = 'block';
    form.reset();
    mesaj.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

/* ================================================
   6. FORMULAR CONTACT (contact.html)
   ================================================ */
(function initFormContact() {
  var form = $('#formContact');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var mesaj = $('#mesajContact');
    if (!mesaj) {
      mesaj = document.createElement('div');
      mesaj.id = 'mesajContact';
      mesaj.className = 'mesaj-succes';
      form.appendChild(mesaj);
    }
    mesaj.textContent = '✅ Mesajul a fost trimis! Vă răspundem în curând. Mulțumim că ne-ați contactat!';
    mesaj.classList.add('show');
    mesaj.style.display = 'block';
    form.reset();
  });
})();

/* ================================================
   7. SMOOTH SCROLL pentru linkuri ancora (#)
   ================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = 80; /* înălțimea navbarului */
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();

/* ================================================
   8. ACTIVE NAV LINK — marchează pagina curentă
   ================================================ */
(function initActiveNav() {
  var path = window.location.pathname;
  $$('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    /* normalizăm calea */
    var hrefBase = href.replace(/^.*\//, '').replace('.html', '');
    var pathBase = path.replace(/^.*\//, '').replace('.html', '');

    if (
      (pathBase === '' || pathBase === 'index') && (hrefBase === '' || hrefBase === 'index') ||
      hrefBase === pathBase
    ) {
      link.classList.add('activ');
    }
  });
})();