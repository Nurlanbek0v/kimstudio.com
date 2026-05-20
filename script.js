// Loader
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hide = () => loader.classList.add('hidden');

  if (document.readyState === 'complete') {
    setTimeout(hide, 800);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 800));
  }
})();

// Scroll progress bar
(function () {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();

// Scrollspy
(function () {
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navAnchors.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-10% 0px -55% 0px' });

  sections.forEach(s => spy.observe(s));
})();

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Burger menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.setAttribute('aria-expanded', 'false');
burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('active');
  burger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('active');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    burger.classList.remove('active');
  }
});

// Animated counters with SVG ring
const RING_R = 68;
const RING_C = parseFloat((2 * Math.PI * RING_R).toFixed(2));

function animateCounter(el, target, ring, duration = 1800) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target);
    if (ring) ring.style.strokeDashoffset = (RING_C * (1 - e)).toFixed(2);
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
      if (ring) ring.style.strokeDashoffset = '0';
    }
  };
  requestAnimationFrame(step);
}

// Intersection Observer for counters and reveal animations
const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -40px 0px' };

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target), el._ring);
      counterObserver.unobserve(el);
    }
  });
}, observerOptions);

// Inject SVG ring into each stat item and observe
const NS = 'http://www.w3.org/2000/svg';
const RING_SIZE = 2 * (RING_R + 10);

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  const item = el.closest('.stat-item') || el.parentElement;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'stat-ring');
  svg.setAttribute('width', RING_SIZE);
  svg.setAttribute('height', RING_SIZE);
  svg.setAttribute('viewBox', `0 0 ${RING_SIZE} ${RING_SIZE}`);

  const cx = RING_SIZE / 2;

  const track = document.createElementNS(NS, 'circle');
  track.setAttribute('cx', cx); track.setAttribute('cy', cx);
  track.setAttribute('r', RING_R); track.setAttribute('stroke-width', '2');
  track.setAttribute('class', 'stat-ring-track');

  const fill = document.createElementNS(NS, 'circle');
  fill.setAttribute('cx', cx); fill.setAttribute('cy', cx);
  fill.setAttribute('r', RING_R); fill.setAttribute('stroke-width', '2');
  fill.setAttribute('class', 'stat-ring-fill');
  fill.style.strokeDasharray = RING_C;
  fill.style.strokeDashoffset = RING_C;

  svg.appendChild(track);
  svg.appendChild(fill);
  item.appendChild(svg);
  el._ring = fill;

  counterObserver.observe(el);
});

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, entry.target.dataset.delay || 0);
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const revealMap = [
  { sel: '.direction-card',  cls: '' },
  { sel: '.about-text',      cls: 'from-left' },
  { sel: '.about-image',     cls: 'from-right' },
  { sel: '.contact-item',    cls: 'from-left' },
  { sel: '.contact-form',    cls: 'from-right' },
  { sel: '.rule-item',       cls: 'scale-in' },
  { sel: '.teacher-card',    cls: '' },
  { sel: '.show-text',       cls: 'from-left' },
  { sel: '.show-visual',     cls: 'from-right' },
  { sel: '.stat-item',       cls: 'scale-in' },
];

revealMap.forEach(({ sel, cls }) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    if (cls) el.classList.add(cls);
    el.dataset.delay = (i % 4) * 80;
    revealObserver.observe(el);
  });
});

// Form submit → WhatsApp
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn  = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  const name      = data.get('name')      || '';
  const phone     = data.get('phone')     || '';
  const direction = data.get('direction') || '';
  const message   = data.get('message')  || '';

  const text = [
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Направление: ${direction}`,
    message ? `Сообщение: ${message}` : '',
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/996707430777?text=${encodeURIComponent(text)}`, '_blank');

  btn.textContent       = 'Заявка отправлена!';
  btn.style.background  = '#4caf50';
  btn.style.borderColor = '#4caf50';
  formNote.textContent  = 'Спасибо! Мы свяжемся с вами в течении дня';
  formNote.style.color  = '#4caf50';
  form.reset();

  setTimeout(() => {
    btn.textContent       = 'Отправить заявку';
    btn.style.background  = '';
    btn.style.borderColor = '';
    formNote.textContent  = 'Мы свяжемся с вами в течение дня';
    formNote.style.color  = '';
  }, 5000);
});

// Video placeholders — click to embed YouTube when data-video is set
document.querySelectorAll('.video-placeholder').forEach(el => {
  el.addEventListener('click', () => {
    const url = el.dataset.video;
    if (!url) return;
    const id = url.match(/(?:youtu\.be\/|v=|shorts\/)([^&?/]+)/)?.[1];
    if (!id) return;
    el.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  });
});

// Today's schedule widget
(function () {
  const DAY_NAMES = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  const GROUPS = [
    {
      days: [1, 3, 5],
      blockIndex: 0,
      rows: [
        { time: '13:30', end: '14:30', name: 'Хип-хоп',      age: '9–13 лет', teacher: 'Диара / Арууке' },
        { time: '16:30', end: '17:30', name: 'Бейби 1',       age: '4–6 лет',  teacher: 'Алиша' },
        { time: '17:30', end: '18:30', name: 'Бейби 2',       age: '7–9 лет',  teacher: 'Бема' },
        { time: '18:30', end: '19:30', name: 'Бейби 3',       age: '7–9 лет',  teacher: 'Бема' },
        { time: '19:40', end: '20:40', name: 'Lady Dance',    age: '25+',      teacher: 'Алиша', onlyDays: [1, 3] },
      ]
    },
    {
      days: [2, 4],
      blockIndex: 1,
      rows: [
        { time: '16:40', end: '17:40', name: 'Choreo',  age: '9–13 лет',  teacher: 'Сагын' },
        { time: '16:40', end: '17:40', name: 'Choreo',  age: '14+ лет',   teacher: 'Аризат' },
        { time: '17:40', end: '19:00', name: 'Афро',    age: '12+ лет',   teacher: 'Аризат / Саша' },
        { time: '18:30', end: '19:30', name: 'Choreo',  age: '9–13 лет',  teacher: 'Сагын' },
      ]
    },
    {
      days: [6, 0],
      blockIndex: 2,
      rows: [
        { time: '13:00', end: '14:10', name: 'Хип-хоп',       age: '9–11 лет',  teacher: 'Риана' },
        { time: '14:20', end: '15:30', name: 'Хип-хоп',       age: '12+ лет',   teacher: 'Риана' },
        { time: '15:30', end: '16:40', name: 'Girly Choreo',   age: '14+ лет',   teacher: 'Айтунук' },
        { time: '16:40', end: '17:40', name: 'KPOP + Choreo',  age: '12+ лет',   teacher: 'Ясмин' },
        { time: '17:40', end: '18:40', name: 'Choreo',         age: '9–13 лет',  teacher: 'Алиша' },
      ]
    }
  ];

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function kgTime() {
    // Kyrgyzstan is UTC+6, no DST
    const kg = new Date(Date.now() + 6 * 60 * 60 * 1000);
    return { day: kg.getUTCDay(), minutes: kg.getUTCHours() * 60 + kg.getUTCMinutes() };
  }

  function isNow(row, curMinutes) {
    return curMinutes >= toMinutes(row.time) && curMinutes < toMinutes(row.end);
  }

  const { day: today, minutes: nowMinutes } = kgTime();
  const group = GROUPS.find(g => g.days.includes(today));
  const widget = document.getElementById('todayWidget');
  if (!widget || !group) return;

  const rows = group.rows.filter(r => !r.onlyDays || r.onlyDays.includes(today));

  const rowsHTML = rows.map(row => {
    const now = isNow(row, nowMinutes);
    return `
      <div class="today-row${now ? ' today-row--now' : ''}">
        <span class="sched-time">${row.time} – ${row.end}</span>
        <span class="sched-info">
          <span class="sched-name">${row.name}</span>
          <span class="sched-age">${row.age}</span>
        </span>
        <span class="sched-teacher">${now ? '<span class="now-badge">Сейчас</span>' : row.teacher}</span>
      </div>`;
  }).join('');

  widget.innerHTML = `
    <div class="today-header">
      <span class="today-label">Занятия сегодня</span>
      <span class="today-day-name">${DAY_NAMES[today]}</span>
    </div>
    <div class="today-rows">${rowsHTML}</div>`;

  // Highlight the matching schedule-block
  const blocks = document.querySelectorAll('.schedule-block');
  const activeBlock = blocks[group.blockIndex];
  if (activeBlock) {
    activeBlock.classList.add('schedule-block--today');
    const badge = document.createElement('span');
    badge.className = 'today-block-badge';
    badge.textContent = 'Сегодня';
    activeBlock.querySelector('.schedule-block-header').appendChild(badge);
  }
})();

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

// Smooth active link highlight based on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current
      ? 'var(--pink)'
      : '';
  });
}, { passive: true });
