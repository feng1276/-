/* ============================================================
   世界考古发现档案馆 — 主交互脚本
   ============================================================ */
'use strict';

const ArchaeologyArchive = (function() {
  'use strict';

  // ==================== State ====================
  let bookmarks = [];
  let currentFilter = 'all';
  let isDarkMode = false;

  // ==================== Initialize ====================
  function init() {
    loadBookmarks();
    initDarkMode();
    initMobileMenu();
    initSearch();
    initFilters();
    initReadingProgress();
    initBackToTop();
    initSidebar();
    initDiscoveryOfDay();
    initDiscoveriesGrid();
    initArchaeologists();
    initTimelinePreview();
    initStatCounters();
    initNewsletter();
    initKeyboardShortcuts();
    initLazyAnimations();
  }

  // ==================== Bookmarks ====================
  function loadBookmarks() {
    try {
      const saved = localStorage.getItem('archaeology_bookmarks');
      if (saved) bookmarks = JSON.parse(saved);
    } catch(e) { bookmarks = []; }
    updateBookmarkCount();
  }

  function saveBookmarks() {
    try {
      localStorage.setItem('archaeology_bookmarks', JSON.stringify(bookmarks));
    } catch(e) {}
    updateBookmarkCount();
  }

  function toggleBookmark(id) {
    const index = bookmarks.indexOf(id);
    if (index >= 0) {
      bookmarks.splice(index, 1);
      showNotification('已取消收藏');
    } else {
      bookmarks.push(id);
      showNotification('已加入收藏 📿');
    }
    saveBookmarks();
    renderBookmarkList();
  }

  function isBookmarked(id) {
    return bookmarks.includes(id);
  }

  function updateBookmarkCount() {
    const el = document.getElementById('bookmarkCount');
    if (el) {
      el.textContent = bookmarks.length;
      el.style.display = bookmarks.length > 0 ? 'flex' : 'none';
    }
  }

  function renderBookmarkList() {
    const container = document.getElementById('bookmarkList');
    if (!container) return;

    if (bookmarks.length === 0) {
      container.innerHTML = '<p class="sidebar-empty">还没有收藏任何内容。点击 🔖 按钮开始收藏吧！</p>';
      return;
    }

    const items = bookmarks.map(id => {
      const d = getDiscoveryById(id);
      if (!d) return '';
      return `
        <div class="sidebar-bookmark-item">
          <span class="bookmark-icon">${d.icon}</span>
          <div class="bookmark-info">
            <strong>${d.name}</strong>
            <small>${d.location} | ${d.year}</small>
          </div>
          <button class="btn-remove" data-id="${id}" title="移除">✕</button>
        </div>
      `;
    }).join('');

    container.innerHTML = items;

    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleBookmark(this.dataset.id);
      });
    });
  }

  // ==================== Dark Mode ====================
  function initDarkMode() {
    const saved = localStorage.getItem('archaeology_dark_mode');
    if (saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      isDarkMode = true;
    }

    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
      toggle.addEventListener('click', toggleDarkMode);
    }
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('archaeology_dark_mode', isDarkMode);
    showNotification(isDarkMode ? '已切换至深色模式 🌙' : '已切换至浅色模式 ☀️');
  }

  // ==================== Mobile Menu ====================
  function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mainNavList');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==================== Search ====================
  function initSearch() {
    const toggle = document.getElementById('searchToggle');
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const close = document.getElementById('searchClose');
    const resultsContainer = document.getElementById('searchResultsContainer');

    if (!toggle || !overlay || !input) return;

    toggle.addEventListener('click', function() {
      overlay.classList.toggle('active');
      if (overlay.classList.contains('active')) {
        setTimeout(() => input.focus(), 100);
      }
    });

    close.addEventListener('click', function() {
      overlay.classList.remove('active');
      input.value = '';
      if (resultsContainer) resultsContainer.innerHTML = '';
    });

    let debounceTimer;
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (query.length < 1) {
          if (resultsContainer) resultsContainer.innerHTML = '';
          return;
        }
        performSearch(query);
      }, 200);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        input.value = '';
        if (resultsContainer) resultsContainer.innerHTML = '';
      }
    });
  }

  function performSearch(query) {
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (!resultsContainer) return;

    const results = searchDiscoveries(query);

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--color-text-muted);">未找到相关考古发现。试试其他关键词？</p>';
      return;
    }

    resultsContainer.innerHTML = results.slice(0, 12).map(d => `
      <a href="${d.pageUrl || '#'}" class="search-result-item">
        <span class="search-result-icon">${d.icon}</span>
        <div class="search-result-info">
          <strong>${d.name}</strong>
          <small>${d.location} | ${d.era} | ${d.year === 0 ? '持续研究' : d.year + '年'}</small>
        </div>
      </a>
    `).join('');
  }

  // ==================== Filters ====================
  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderDiscoveriesGrid();
      });
    });
  }

  function renderDiscoveriesGrid() {
    const grid = document.getElementById('discoveriesGrid');
    if (!grid) return;

    const discoveries = currentFilter === 'all'
      ? getFeaturedDiscoveries(12)
      : getDiscoveriesByRegion(currentFilter).slice(0, 12);

    grid.innerHTML = discoveries.map(d => `
      <article class="discovery-card fade-in-element" data-id="${d.id}">
        <div class="discovery-card-image" style="background:${getRegionBgColor(d.region)};">
          <span class="artifact-icon">${d.icon}</span>
        </div>
        <div class="discovery-card-body">
          <div class="discovery-card-tags" style="margin-bottom:0.5rem;">
            ${d.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <h3 class="discovery-card-title">${d.name}</h3>
          <p class="discovery-card-meta">📍 ${d.location} | 📅 ${d.year === 0 ? '远古' : d.year + '年'} | ${d.era}</p>
          <p class="discovery-card-text">${d.description}</p>
        </div>
        <div class="discovery-card-footer">
          <a href="${d.pageUrl || '#'}" class="btn btn-ghost btn-sm">查看详情 →</a>
          <button class="btn btn-ghost btn-sm bookmark-btn" data-id="${d.id}" aria-label="${isBookmarked(d.id) ? '已收藏' : '加入收藏'}">
            ${isBookmarked(d.id) ? '📿' : '🔖'}
          </button>
        </div>
      </article>
    `).join('');

    // Re-bind bookmark buttons
    grid.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(this.dataset.id);
        renderDiscoveriesGrid();
      });
    });

    // Observe for animations
    observeElements();
  }

  function getRegionBgColor(region) {
    const colors = {
      'egypt': '#f5e6c8',
      'china': '#fae8e0',
      'mesopotamia': '#faf0d8',
      'greek-roman': '#e8e4f0',
      'americas': '#e0f0e0',
      'prehistoric': '#e8e0d8'
    };
    return colors[region] || 'var(--color-papyrus)';
  }

  // ==================== Discovery of Day ====================
  function initDiscoveryOfDay() {
    const discovery = getDiscoveryOfDay();
    if (!discovery) return;

    const titleEl = document.getElementById('dotdTitle');
    const tagsEl = document.getElementById('dotdTags');
    const metaEl = document.getElementById('dotdMeta');
    const descEl = document.getElementById('dotdDescription');
    const linkEl = document.getElementById('dotdLink');
    const bookmarkEl = document.getElementById('dotdBookmark');

    if (titleEl) titleEl.textContent = discovery.name;
    if (tagsEl) tagsEl.innerHTML = discovery.tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('');
    if (metaEl) metaEl.textContent = `📍 ${discovery.location} | 📅 ${discovery.era} (${discovery.eraYear}) | 发现于 ${discovery.year}年`;
    if (descEl) descEl.textContent = discovery.description;
    if (linkEl) linkEl.href = discovery.pageUrl || '#';
    if (bookmarkEl) {
      bookmarkEl.addEventListener('click', function() {
        toggleBookmark(discovery.id);
        this.textContent = isBookmarked(discovery.id) ? '📿 已收藏' : '🔖 收藏';
      });
    }
  }

  // ==================== Archaeologists ====================
  function initArchaeologists() {
    const grid = document.getElementById('archaeologistsGrid');
    if (!grid) return;

    grid.innerHTML = ARCHAEOLOGISTS_DATABASE.map(a => `
      <div class="archaeologist-card fade-in-element">
        <div class="archaeologist-portrait">${a.icon}</div>
        <h3>${a.name}</h3>
        <p class="archaeologist-nationality">${a.nationality} | ${a.years}</p>
        <p class="archaeologist-desc">${a.description}</p>
        <p class="archaeologist-discovery">🏺 ${a.discovery}</p>
      </div>
    `).join('');

    observeElements();
  }

  // ==================== Timeline Preview ====================
  function initTimelinePreview() {
    const container = document.getElementById('timelinePreview');
    if (!container) return;

    const milestones = DISCOVERY_DATABASE.filter(d => d.year > 0)
      .sort((a, b) => a.year - b.year)
      .slice(0, 8);

    container.innerHTML = milestones.map(d => `
      <div class="timeline-preview-item fade-in-element">
        <div class="timeline-year">${d.year}年</div>
        <div class="timeline-event-title">${d.name} — ${d.discoverer || '未知发现者'}</div>
        <div class="timeline-event-desc">${d.description.substring(0, 100)}...</div>
      </div>
    `).join('');

    observeElements();
  }

  // ==================== Reading Progress Bar ====================
  function initReadingProgress() {
    const bar = document.getElementById('readingProgressBar');
    if (!bar) return;

    window.addEventListener('scroll', throttle(function() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
      bar.setAttribute('aria-valuenow', Math.round(progress));
    }, 30));
  }

  // ==================== Back to Top ====================
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', throttle(function() {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, 100));

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== Sidebar ====================
  function initSidebar() {
    const toggle = document.getElementById('readingListToggle');
    const sidebar = document.getElementById('bookmarkSidebar');
    const close = document.getElementById('sidebarClose');

    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function() {
      sidebar.classList.add('open');
      renderBookmarkList();
    });

    if (close) {
      close.addEventListener('click', function() {
        sidebar.classList.remove('open');
      });
    }

    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }

  // ==================== Stats Counter Animation ====================
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          animateCount(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  function animateCount(el, target) {
    const duration = 2000;
    const start = performance.now();
    const startVal = 0;

    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (target - startVal) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ==================== Newsletter ====================
  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      showNotification(`感谢订阅！考古快报将发送至 ${email} 📬`);
      form.reset();
    });
  }

  // ==================== Keyboard Shortcuts ====================
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const overlay = document.getElementById('searchOverlay');
        const input = document.getElementById('searchInput');
        if (overlay && input) {
          overlay.classList.add('active');
          input.focus();
        }
      }
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        toggleStudyMode();
      }
    });
  }

  function toggleStudyMode() {
    document.body.classList.toggle('study-mode-active');
    const isActive = document.body.classList.contains('study-mode-active');
    showNotification(isActive ? '已进入专注阅读模式 📖' : '已退出专注阅读模式');
  }

  // ==================== Lazy Animations ====================
  function initLazyAnimations() {
    observeElements();
  }

  function observeElements() {
    const elements = document.querySelectorAll('.fade-in-element');
    if (!elements.length) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  // ==================== Notification ====================
  function showNotification(message, duration = 3000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // ==================== Utility ====================
  function throttle(fn, delay) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  // ==================== Public API ====================
  return {
    init,
    toggleDarkMode,
    toggleBookmark,
    isBookmarked,
    showNotification,
    toggleStudyMode
  };
})();

// ==================== Boot ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { ArchaeologyArchive.init(); });
} else {
  ArchaeologyArchive.init();
}

// Export
window.ArchaeologyArchive = ArchaeologyArchive;