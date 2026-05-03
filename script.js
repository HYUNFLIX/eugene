document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════
     다크/라이트 토글
  ══════════════════════════════════════ */
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const icon = toggleBtn.querySelector('.toggle-icon');

  const saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
    icon.textContent = saved === 'light' ? '🌙' : '☀️';
  }

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    icon.textContent = next === 'light' ? '🌙' : '☀️';
  });

  /* ══════════════════════════════════════
     D-Day 카운트다운 (킥오프 5/20 13:00)
  ══════════════════════════════════════ */
  const TARGET = new Date('2026-05-20T13:00:00+09:00').getTime();

  function updateCountdown() {
    const diff = TARGET - Date.now();
    const $d = document.getElementById('cd-days');
    if (!$d) return;

    if (diff <= 0) {
      $d.textContent = '0';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      return;
    }

    $d.textContent = Math.floor(diff / 86400000);
    document.getElementById('cd-hours').textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ══════════════════════════════════════
     마우스 추적 파티클
  ══════════════════════════════════════ */
  (function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    let mouse = { x: -9999, y: -9999 };
    let smoothMouse = { x: -9999, y: -9999 };
    const SMOOTH_FACTOR = 0.04;   // 낮을수록 더 느리게 따라옴

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // 첫 진입 시 즉시 동기화
      if (smoothMouse.x === -9999) {
        smoothMouse.x = mouse.x;
        smoothMouse.y = mouse.y;
      }
    });

    const COLORS = ['139,92,246', '56,189,248', '251,191,36', '52,211,153'];
    const COUNT = 55;
    const CONNECT_DIST = 130;
    const MOUSE_RADIUS = 220;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.3,
    }));

    function loop() {
      ctx.clearRect(0, 0, W, H);

      // 부드러운 마우스 보간 (lerp)
      smoothMouse.x += (mouse.x - smoothMouse.x) * SMOOTH_FACTOR;
      smoothMouse.y += (mouse.y - smoothMouse.y) * SMOOTH_FACTOR;

      particles.forEach(p => {
        const dx = smoothMouse.x - p.x;
        const dy = smoothMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 마우스 쪽으로 부드럽게 끌림
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.008;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // 감속
        p.vx *= 0.97;
        p.vy *= 0.97;

        // 최소 움직임 유지
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.2) {
          p.vx += (Math.random() - 0.5) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.15;
        }

        p.x += p.vx;
        p.y += p.vy;

        // 경계 반사
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > W) { p.x = W; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > H) { p.y = H; p.vy *= -1; }
      });

      // 파티클 간 연결선
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = 0.12 * (1 - dist / CONNECT_DIST);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${particles[i].color},${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 마우스와 가까운 파티클 연결
      particles.forEach(p => {
        const dx = smoothMouse.x - p.x;
        const dy = smoothMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const opacity = 0.25 * (1 - dist / MOUSE_RADIUS);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${p.color},${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(smoothMouse.x, smoothMouse.y);
          ctx.stroke();
        }
      });

      // 파티클 점
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }

    loop();
  })();

  /* ══════════════════════════════════════
     아코디언 (일정 + FAQ)
  ══════════════════════════════════════ */
  document.querySelectorAll('.stage-header').forEach(header => {
    header.addEventListener('click', () => {
      const stage = header.parentElement;
      const body = stage.querySelector('.stage-body');
      if (stage.classList.contains('open')) {
        body.style.maxHeight = '0';
        stage.classList.remove('open');
      } else {
        stage.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  const firstStage = document.querySelector('.stage');
  if (firstStage) {
    firstStage.classList.add('open');
    firstStage.querySelector('.stage-body').style.maxHeight = '2000px';
  }

  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-a');
      if (item.classList.contains('open')) {
        answer.style.maxHeight = '0';
        item.classList.remove('open');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ══════════════════════════════════════
     미니 캘린더
  ══════════════════════════════════════ */
  const events = {
    '2026-5-15': 's1',
    '2026-5-20': 's1',
    '2026-5-27': 's1',
    '2026-6-3': 's1',
    '2026-6-10': 's2',
    '2026-6-11': 's2',
    '2026-6-17': 's2',
    '2026-6-24': 's2',
    '2026-7-1': 's3',
    '2026-7-8': 's3',
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  function buildMonth(containerId, year, month, label) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDay = (firstDay + 6) % 7;

    let html = `<div class="cal-month-title">${label}</div><div class="cal-grid">`;
    ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(h => { html += `<span class="cal-head">${h}</span>`; });
    for (let i = 0; i < startDay; i++) html += '<span class="cal-day empty"></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${month}-${d}`;
      let cls = 'cal-day';
      if (events[key]) cls += ' event ' + events[key];
      if (key === todayKey) cls += ' today';
      html += `<span class="${cls}">${d}</span>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  buildMonth('cal-may', 2026, 5, '5월');
  buildMonth('cal-jun', 2026, 6, '6월');
  buildMonth('cal-jul', 2026, 7, '7월');

  /* ══════════════════════════════════════
     스크롤 reveal
  ══════════════════════════════════════ */
  const els = document.querySelectorAll('[data-reveal]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });

  /* ══════════════════════════════════════
     네비게이션 active 상태
  ══════════════════════════════════════ */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
});
