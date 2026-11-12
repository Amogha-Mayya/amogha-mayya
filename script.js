(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  /* ═════════ Greeting preloader: once per session, click to skip ═════════ */
  var messages = ['Hello', 'स्वागत है', 'ಸ್ವಾಗತ'];
  var preloader = document.getElementById('preloader');
  var greeting = document.getElementById('greeting');

  function finishIntro() {
    if (root.classList.contains('ready')) return;
    root.classList.add('ready');
    preloader.classList.add('lift');
    setTimeout(function () { preloader.style.display = 'none'; }, 800);
    try { sessionStorage.setItem('greeted', '1'); } catch (e) {}
  }

  if (!root.classList.contains('skip-intro')) {
    if (reduceMotion) {
      finishIntro();
    } else {
      var msgIndex = 0;
      var msgTimer = setInterval(function () {
        msgIndex++;
        if (msgIndex < messages.length) {
          greeting.textContent = messages[msgIndex];
        } else {
          clearInterval(msgTimer);
          finishIntro();
        }
      }, 520);
      preloader.addEventListener('click', function () {
        clearInterval(msgTimer);
        finishIntro();
      });
    }
  }

  /* ═════════ Scroll reveal ═════════ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (shown++ * 90) + 'ms';
        el.classList.add('in');
        revealObserver.unobserve(el);
        // hand the element back to its normal hover styles once it has settled
        setTimeout(function () {
          el.classList.remove('reveal', 'in');
          el.style.transitionDelay = '';
        }, 1100 + shown * 90);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.remove('reveal'); });
  }

  /* ═════════ Nav: highlight the current section ═════════ */
  var navLinks = {};
  document.querySelectorAll('.nav a').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('main > section').forEach(function (s) { navObserver.observe(s); });
  }

  /* ═════════ Project cards: light follows the pointer ═════════ */
  var grid = document.getElementById('projects-grid');
  if (grid) {
    grid.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.project-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ═════════ Starfield: drifting stars + shooting stars on one canvas ═════════ */
  var starCanvas = document.getElementById('stars');
  var sctx = starCanvas.getContext('2d');
  var stars = [];
  var shots = [];
  var nextShot = 4000;
  var W = 0, H = 0, lastStarFrame = 0;

  function buildStars() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    starCanvas.width = W * dpr;
    starCanvas.height = H * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.min(240, Math.round((W * H) / 5200));
    stars = [];
    for (var n = 0; n < count; n++) {
      var depth = Math.random();             // 0 = far, 1 = near
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        depth: depth,
        r: 0.4 + depth * 1.2,
        peak: 0.3 + Math.random() * 0.7,
        speed: 0.7 + Math.random() * 1.6,
        phase: Math.random() * TAU,
        tint: Math.random() < 0.12 ? '#9cc9ff' : (Math.random() < 0.08 ? '#ffc7b0' : '#fff')
      });
    }
  }

  function spawnShot(time) {
    var fromLeft = Math.random() < 0.65;
    var len = 0.25 + Math.random() * 0.3;
    shots.push({
      start: time,
      duration: 2200 + Math.random() * 1200,
      x: fromLeft ? Math.random() * W * 0.7 : W * (0.3 + Math.random() * 0.7),
      y: Math.random() * H * 0.5,
      dx: (fromLeft ? 1 : -1) * (W * len + 140),
      dy: H * (0.12 + Math.random() * 0.22) + 50,
      width: 1 + Math.random() * 1.2
    });
  }

  function drawStars(time, dt) {
    var t = time / 1000;
    var scrollShift = window.scrollY * 0.06;
    sctx.clearRect(0, 0, W, H);
    for (var n = 0; n < stars.length; n++) {
      var s = stars[n];
      // travel slowly across the sky, nearer stars faster
      s.x -= (2 + s.depth * 9) * dt;
      if (s.x < -2) s.x += W + 4;
      var y = (s.y - scrollShift * (0.3 + s.depth)) % H;
      if (y < 0) y += H;
      sctx.globalAlpha = s.peak * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
      sctx.fillStyle = s.tint;
      sctx.beginPath();
      sctx.arc(s.x, y, s.r, 0, TAU);
      sctx.fill();
    }

    if (time > nextShot && shots.length < 1) {
      spawnShot(time);
      nextShot = time + 8000 + Math.random() * 8000;
    }
    for (var k = shots.length - 1; k >= 0; k--) {
      var sh = shots[k];
      var p = (time - sh.start) / sh.duration;
      if (p < 0) continue;
      if (p >= 1) { shots.splice(k, 1); continue; }
      var x = sh.x + sh.dx * p;
      var yy = sh.y + sh.dy * p;
      var tx = x - sh.dx * 0.2;
      var ty = yy - sh.dy * 0.2;
      var g = sctx.createLinearGradient(x, yy, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.globalAlpha = Math.sin(p * Math.PI);
      sctx.strokeStyle = g;
      sctx.lineWidth = sh.width;
      sctx.lineCap = 'round';
      sctx.beginPath();
      sctx.moveTo(x, yy);
      sctx.lineTo(tx, ty);
      sctx.stroke();
      sctx.fillStyle = '#fff';
      sctx.beginPath();
      sctx.arc(x, yy, sh.width * 0.9, 0, TAU);
      sctx.fill();
    }
    sctx.globalAlpha = 1;
  }

  /* ═════════ Animation loop ═════════ */
  var rafId = 0;

  function frame(time) {
    rafId = requestAnimationFrame(frame);
    var gap = time - lastStarFrame;
    if (gap < 32) return;                                  // ~30fps is plenty
    drawStars(time, gap > 100 ? 0.033 : gap / 1000);
    lastStarFrame = time;
  }

  buildStars();
  if (reduceMotion) {
    drawStars(1000, 0);
  } else {
    rafId = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function () {
      cancelAnimationFrame(rafId);
      if (!document.hidden) {
        lastStarFrame = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // ignore the small height changes mobile browsers fire while scrolling
      if (window.innerWidth !== W || Math.abs(window.innerHeight - H) > 160) buildStars();
      if (reduceMotion) drawStars(1000, 0);
    }, 150);
  });
})();
