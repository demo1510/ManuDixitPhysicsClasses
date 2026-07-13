/* =============================================
   MANU DIXIT PHYSICS CLASSES — script.js
   All animations, interactions, counters, etc.
   ============================================= */
'use strict';

/* ── UTILITY ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = requestAnimationFrame;

/* ============================================================
   1. PAGE LOADER
   ============================================================ */
(function initLoader() {
  document.body.classList.add('loader-active');
  const loader = $('#page-loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loader-active');
    }, 1800);
  });
})();

/* ============================================================
   2. NAVBAR
   ============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#nav-links');
  const links = $$('.nav-link');

  // Scroll class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = $(`a[href="#${e.target.id}"]`, navbar);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   3. SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = $('#scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   4. PARTICLE CANVAS (hero background)
   ============================================================ */
(function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = Math.min(70, Math.floor(window.innerWidth / 20));

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? '245,200,66' : '26,94,255';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticleList() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(26,94,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    raf(loop);
  }

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas.parentElement);
  resize();
  initParticleList();
  loop();
})();

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay) : 0;
        setTimeout(() => e.target.classList.add('revealed'), delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const nums = $$('[data-target]');
  if (!nums.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function format(val) {
      if (target >= 1000) return (val / 1000).toFixed(val >= 1000 ? 1 : 0) + 'K';
      return Math.round(val).toString();
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = eased * target;

      el.textContent = (target >= 4000 ? format(current) : Math.round(current)) + suffix;

      if (progress < 1) raf(tick);
    }

    raf(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  nums.forEach(el => observer.observe(el));
})();

/* ============================================================
   7. MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  const btns = $$('.magnetic');
  const strength = 0.35;

  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   8. TESTIMONIAL CAROUSEL
   ============================================================ */
(function initTestimonials() {
  const track = $('#testimonial-track');
  const dotsWrap = $('#t-dots');
  if (!track) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let autoTimer;

  // Determine visible count
  function visibleCount() {
    return window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
  }

  const total = cards.length;

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = total - visibleCount() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    const vc = visibleCount();
    const maxIdx = Math.max(0, total - vc);
    current = Math.max(0, Math.min(idx, maxIdx));

    const cardW = cards[0].offsetWidth + 20; // gap = 20px
    track.style.transform = `translateX(-${current * cardW}px)`;

    $$('.t-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1 > total - visibleCount() ? 0 : current + 1); }
  function prev() { goTo(current - 1 < 0 ? total - visibleCount() : current - 1); }

  $('#t-next').addEventListener('click', () => { next(); resetAuto(); });
  $('#t-prev').addEventListener('click', () => { prev(); resetAuto(); });

  function startAuto() { autoTimer = setInterval(next, 4000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  buildDots();
  startAuto();

  window.addEventListener('resize', () => { buildDots(); goTo(0); });

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) { dx > 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });
})();

/* ============================================================
   9. GALLERY LIGHTBOX
   ============================================================ */
(function initGallery() {
  const items = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lbContent = $('#lb-content');
  const lbClose = $('#lb-close');

  if (!lightbox) return;

  items.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View ' + (item.dataset.label || 'image'));

    function open() {
      lbContent.innerHTML = `<p style="font-size:1.1rem;color:rgba(255,255,255,.7);padding:40px;">${item.dataset.label || 'Gallery Image'}<br><br><small style="color:rgba(255,255,255,.4);font-size:.8rem;">Add your actual image here by replacing the placeholder in assets/gallery/</small></p>`;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    item.addEventListener('click', open);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  function closeLB() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLB(); });
})();

/* ============================================================
   10. CONTACT FORM
   ============================================================ */
(function initContactForm() {
  const form = $('#contact-form');
  const msg = $('#form-msg');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = $('#name').value.trim();
    const phone = $('#phone').value.trim();
    const course = $('#course').value;

    if (!name) { showMsg('Please enter your full name.', 'error'); return; }
    if (!phone || phone.length < 10) { showMsg('Please enter a valid phone number.', 'error'); return; }
    if (!course) { showMsg('Please select a course.', 'error'); return; }

    // Simulate submission
    const btn = form.querySelector('button[type=submit]');
    const origText = btn.querySelector('span').textContent;
    btn.querySelector('span').textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      showMsg('Thank you! We\'ll contact you within 24 hours. 🎉', 'success');
      form.reset();
      btn.querySelector('span').textContent = origText;
      btn.disabled = false;
    }, 1500);
  });

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = 'form-message ' + type;
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { msg.className = 'form-message'; msg.textContent = ''; }, 5000);
  }
})();

/* ============================================================
   11. SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   12. PARALLAX on hero formulas (mouse movement)
   ============================================================ */
(function initParallax() {
  const hero = $('.hero');
  const formulas = $$('.hero-formulas span');
  if (!hero || !formulas.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
  });

  function update() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    formulas.forEach((span, i) => {
      const factor = (i % 4 + 1) * 8;
      span.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
    });

    raf(update);
  }
  update();
})();

/* ============================================================
   13. WHY CARDS — stagger reveal with delay
   ============================================================ */
(function initWhyCards() {
  const cards = $$('.why-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay) : 0;
        setTimeout(() => e.target.classList.add('revealed'), delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => observer.observe(c));
})();

/* ============================================================
   14. COURSE CARDS hover 3D tilt
   ============================================================ */
(function initCardTilt() {
  const cards = $$('.course-card, .why-card, .result-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
})();

/* ============================================================
   15. NAVBAR Mobile — show enroll button inside menu
   ============================================================ */
(function injectMobileEnroll() {
  const navLinks = $('#nav-links');
  if (!navLinks) return;

  // Add enroll button at the end of mobile menu
  const enrollClone = document.createElement('a');
  enrollClone.href = '#contact';
  enrollClone.className = 'btn-enroll';
  enrollClone.style.display = 'none'; // will be shown via CSS when .open
  enrollClone.textContent = 'Enroll Now';
  navLinks.appendChild(enrollClone);
})();

/* ============================================================
   16. INTERSECTION OBSERVER for course cards stagger
   ============================================================ */
(function initCourseReveal() {
  const cards = $$('.course-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay) : 0;
        setTimeout(() => e.target.classList.add('revealed'), delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => observer.observe(c));
})();

/* ============================================================
   17. TOPPER CARDS reveal
   ============================================================ */
(function initTopperReveal() {
  const cards = $$('.topper-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(c);
  });
})();

/* ============================================================
   18. INSTAGRAM POST HOVER
   ============================================================ */
$$('.insta-post').forEach(post => {
  post.addEventListener('click', () => {
    window.open('https://www.instagram.com/manudixitphysicsclasses/', '_blank', 'noopener');
  });
});
