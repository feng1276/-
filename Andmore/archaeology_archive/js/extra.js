/* ============================================================
   世界考古发现档案馆 — 扩展交互脚本
   虚拟挖掘、3D文物旋转、分享系统、主题系统等
   ============================================================ */
'use strict';

// ==================== Excavation Simulation ====================
(function() {
  function initExcavationSim() {
    const sims = document.querySelectorAll('.excavation-sim');
    sims.forEach(sim => {
      let dug = 0;
      const maxDug = 5;
      const revealArea = sim.querySelector('.excavation-reveal');
      const clickArea = sim.querySelector('.excavation-click-area');

      if (!clickArea) return;

      clickArea.addEventListener('click', function() {
        if (dug < maxDug) {
          dug++;
          const revealPercent = (dug / maxDug) * 100;
          if (revealArea) {
            revealArea.style.clipPath = `inset(0 ${100 - revealPercent}% 0 0)`;
          }
          const digSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
          digSound.volume = 0.1;
          digSound.play().catch(() => {});

          if (dug === maxDug && sim.querySelector('.excavation-find')) {
            sim.querySelector('.excavation-find').style.display = 'block';
            sim.querySelector('.excavation-find').style.animation = 'stoneDrop 0.8s ease forwards';
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExcavationSim);
  } else {
    initExcavationSim();
  }
})();

// ==================== 3D Artifact Rotator ====================
(function() {
  function initArtifactRotator() {
    const rotators = document.querySelectorAll('.artifact-rotator');
    rotators.forEach(rotator => {
      const cube = rotator.querySelector('.artifact-3d-cube');
      if (!cube) return;

      let isDragging = false;
      let startX, startY, rotX = 0, rotY = 0;

      rotator.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        rotator.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        rotY += dx * 0.5;
        rotX -= dy * 0.5;
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        startX = e.clientX;
        startY = e.clientY;
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
        rotator.style.cursor = 'grab';
      });

      // Touch support
      rotator.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, {passive: true});

      document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        rotY += dx * 0.5;
        rotX -= dy * 0.5;
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, {passive: true});

      document.addEventListener('touchend', function() { isDragging = false; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArtifactRotator);
  } else {
    initArtifactRotator();
  }
})();

// ==================== Exploration Statistics Tracker ====================
const ExplorationStats = (function() {
  const STORAGE_KEY = 'archaeology_explore_stats';
  let stats = {
    totalDiscoveriesViewed: 0,
    discoveriesViewed: {},
    lastDiscoveryId: null,
    lastVisitDate: null,
    sessionsCount: 0,
    totalTimeOnSiteSeconds: 0
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) stats = { ...stats, ...JSON.parse(saved) };
    } catch(e) {}
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch(e) {}
  }

  function trackDiscoveryView(discoveryId) {
    stats.discoveriesViewed[discoveryId] = (stats.discoveriesViewed[discoveryId] || 0) + 1;
    stats.totalDiscoveriesViewed++;
    stats.lastDiscoveryId = discoveryId;
    stats.lastVisitDate = new Date().toISOString();
    stats.sessionsCount++;
    save();
  }

  function getStats() {
    return { ...stats };
  }

  load();
  return { trackDiscoveryView, getStats };
})();

// ==================== Share System ====================
const ShareSystem = (function() {
  function shareViaWebAPI(title, text, url) {
    if (navigator.share) {
      return navigator.share({ title, text, url }).catch(() => {});
    }
    return Promise.reject(new Error('Web Share API not supported'));
  }

  function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }

  function generateShareText(discovery) {
    return `🏺《${discovery.name}》\n📍 ${discovery.location} | 📅 ${discovery.era}\n${discovery.description?.substring(0, 80) || ''}...\n\n—— 来自「世界考古发现档案馆」\n🔗 ${window.location.origin}${window.location.pathname}`;
  }

  return { shareViaWebAPI, copyToClipboard, generateShareText };
})();

// ==================== Theme System ====================
const ThemeSystem = (function() {
  const THEMES = ['desert', 'oasis', 'stone'];

  function applyTheme(themeName) {
    document.body.classList.remove(...THEMES.map(t => `theme-${t}`));
    if (THEMES.includes(themeName)) {
      document.body.classList.add(`theme-${themeName}`);
      localStorage.setItem('archaeology_theme', themeName);
    }
  }

  function getCurrentTheme() {
    for (const t of THEMES) {
      if (document.body.classList.contains(`theme-${t}`)) return t;
    }
    return null;
  }

  function init() {
    const savedTheme = localStorage.getItem('archaeology_theme');
    if (savedTheme) applyTheme(savedTheme);
  }

  init();
  return { applyTheme, getCurrentTheme, THEMES };
})();

// ==================== Page View Counter ====================
(function() {
  function incrementPageView() {
    try {
      const key = 'archaeology_page_views_' + (window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_') || 'home');
      let views = parseInt(localStorage.getItem(key) || '0');
      views++;
      localStorage.setItem(key, views.toString());

      const totalKey = 'archaeology_total_views';
      let total = parseInt(localStorage.getItem(totalKey) || '0');
      total++;
      localStorage.setItem(totalKey, total.toString());
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', incrementPageView);
  } else {
    incrementPageView();
  }
})();

// ==================== Artifact Lightbox ====================
(function() {
  function initLightboxes() {
    document.querySelectorAll('.gallery-item, .artifact-mini-card, .discovery-card').forEach(item => {
      item.addEventListener('click', function(e) {
        if (e.target.closest('button') || e.target.closest('a.btn')) return;

        const icon = this.querySelector('.artifact-icon, .gallery-item-image, .artifact-mini-icon');
        const title = this.querySelector('.discovery-card-title, .gallery-item-title, .artifact-mini-name');
        const meta = this.querySelector('.discovery-card-meta, .gallery-item-meta');
        const text = this.querySelector('.discovery-card-text');

        if (!icon) return;

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
          <button class="lightbox-close" aria-label="关闭">✕</button>
          <div class="lightbox-content">
            <div class="lightbox-image">${icon.textContent || icon.innerHTML || '🏺'}</div>
            <div class="lightbox-info">
              <h3>${title ? title.textContent : '文物详情'}</h3>
              ${meta ? `<p style="color:var(--color-text-muted);margin-bottom:0.5rem;">${meta.textContent}</p>` : ''}
              ${text ? `<p>${text.textContent}</p>` : ''}
            </div>
          </div>
        `;

        document.body.appendChild(overlay);

        const close = function() {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.3s ease';
          setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('.lightbox-close').addEventListener('click', close);
        overlay.addEventListener('click', function(ev) {
          if (ev.target === overlay) close();
        });
        document.addEventListener('keydown', function esc(e) {
          if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightboxes);
  } else {
    initLightboxes();
  }
})();

// ==================== Interactive Timeline Animate ====================
(function() {
  function initTimelineAnimation() {
    const entries = document.querySelectorAll('.timeline-entry-card, .timeline-preview-item');
    const observer = new IntersectionObserver(function(observed) {
      observed.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

    entries.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimelineAnimation);
  } else {
    initTimelineAnimation();
  }
})();

// ==================== Artifact Comparison Slider ====================
(function() {
  function initComparisonSliders() {
    document.querySelectorAll('.comparison-slider').forEach(slider => {
      const after = slider.querySelector('.comparison-after');
      const handle = slider.querySelector('.comparison-handle');
      if (!after || !handle) return;

      let isDragging = false;

      function updatePosition(clientX) {
        const rect = slider.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(5, Math.min(95, percent));
        after.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        handle.style.left = percent + '%';
      }

      slider.addEventListener('mousedown', function(e) {
        isDragging = true;
        updatePosition(e.clientX);
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        updatePosition(e.clientX);
      });

      document.addEventListener('mouseup', function() { isDragging = false; });

      slider.addEventListener('touchstart', function(e) {
        isDragging = true;
        updatePosition(e.touches[0].clientX);
      });

      document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        updatePosition(e.touches[0].clientX);
      });

      document.addEventListener('touchend', function() { isDragging = false; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComparisonSliders);
  } else {
    initComparisonSliders();
  }
})();

// ==================== Idle Detection ====================
(function() {
  let idleTimer;
  const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    document.body.classList.remove('is-idle');
    idleTimer = setTimeout(function() {
      document.body.classList.add('is-idle');
    }, IDLE_TIMEOUT);
  }

  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, { passive: true });
  });

  resetIdleTimer();
})();

// ==================== Carousel Auto-play ====================
(function() {
  function initCarousels() {
    document.querySelectorAll('.artifact-carousel').forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const dots = carousel.querySelectorAll('.carousel-dot');
      if (!track || !dots.length) return;

      let currentSlide = 0;
      const totalSlides = dots.length;

      function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', function() { goToSlide(i); });
      });

      setInterval(function() {
        if (document.body.classList.contains('is-idle')) return;
        goToSlide((currentSlide + 1) % totalSlides);
      }, 5000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
})();

// ==================== Audio Guide Enhancement ====================
(function() {
  function enhanceAudioPlayers() {
    document.querySelectorAll('audio').forEach(audio => {
      if (audio.dataset.enhanced) return;
      audio.dataset.enhanced = 'true';
      audio.addEventListener('play', function() {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAudioPlayers);
  } else {
    enhanceAudioPlayers();
  }
})();

// ==================== Smooth Page Transitions ====================
(function() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    if (link.getAttribute('target') === '_blank') return;
    if (link.getAttribute('href')?.startsWith('#')) return;
    if (link.hostname !== window.location.hostname) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    const href = link.getAttribute('href');
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      document.body.style.opacity = '0.6';
      document.body.style.transition = 'opacity 0.2s ease';
    }
  });

  window.addEventListener('pageshow', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease';
  });
})();

// ==================== Newsletter Quote Rotator ====================
(function() {
  function rotateQuote() {
    const quotes = window.ARCHAEOLOGY_QUOTES || [];
    if (!quotes.length) return;
    const quoteEl = document.querySelector('.footer-quote');
    if (!quoteEl) return;

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = `"${randomQuote.text}" — ${randomQuote.author}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setInterval(rotateQuote, 30000); rotateQuote(); });
  } else {
    setTimeout(function() { setInterval(rotateQuote, 30000); rotateQuote(); }, 1000);
  }
})();

// ==================== Announcement System ====================
(function() {
  const announcements = [
    { text: '📢 2026年埃及卢克索新发现18座古墓，包含大量彩绘木乃伊', date: '2026-06-10' },
    { text: '🎉 三星堆新一轮发掘出土完整黄金面具，震惊考古学界', date: '2026-06-11' },
    { text: '🏺 庞贝古城新发现保存完好的壁画和中产阶级住宅', date: '2026-06-12' },
    { text: '📡 LiDAR扫描揭示玛雅低地数百座未知金字塔遗址', date: '2026-06-13' },
    { text: '🔬 哥贝克力石阵新研究表明其建造年代可能更早', date: '2026-06-14' },
    { text: '🌍 本馆访问量突破 ' + (parseInt(localStorage.getItem('archaeology_total_views') || '5000')) + ' 次！', date: '2026-06-15' },
    { text: '📿 文物长廊新增3D旋转观赏功能，欢迎体验', date: '2026-06-16' },
    { text: '⛏️ 本周推荐发掘现场：土耳其哥贝克力石阵', date: '2026-06-18' }
  ];

  function getLatestAnnouncement() {
    const today = new Date().toISOString().split('T')[0];
    const recent = announcements.filter(a => a.date <= today);
    return recent.length > 0 ? recent[recent.length - 1] : announcements[0];
  }

  window.ArchaeologyAnnouncements = { getLatest: getLatestAnnouncement, all: announcements };
})();

// Export
window.ExplorationStats = ExplorationStats;
window.ShareSystem = ShareSystem;
window.ThemeSystem = ThemeSystem;