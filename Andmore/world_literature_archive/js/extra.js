/* ============================================================
   世界文学名著档案馆 — 扩展交互脚本
   额外功能：虚拟书架、阅读统计、分享系统、主题切换等
   ============================================================ */

'use strict';

// ==================== Virtual Bookshelf 3D Effect ====================
(function() {
  function initBookshelf() {
    const shelves = document.querySelectorAll('.bookshelf');
    shelves.forEach(shelf => {
      const books = shelf.querySelectorAll('.book');
      books.forEach((book, index) => {
        book.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-8px) rotate(-2deg) scale(1.05)';
          this.style.zIndex = '10';
          this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        book.addEventListener('mouseleave', function() {
          this.style.transform = '';
          this.style.zIndex = '';
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookshelf);
  } else {
    initBookshelf();
  }
})();

// ==================== Reading Statistics Tracker ====================
const ReadingStats = (function() {
  const STORAGE_KEY = 'lit_archive_reading_stats';

  let stats = {
    totalReadingTimeSeconds: 0,
    booksOpened: {},
    lastBookId: null,
    lastReadDate: null,
    sessionsCount: 0,
    pagesReadTotal: 0,
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        stats = { ...stats, ...parsed };
      }
    } catch(e) {}
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch(e) {}
  }

  function trackBookOpen(bookId) {
    stats.booksOpened[bookId] = (stats.booksOpened[bookId] || 0) + 1;
    stats.lastBookId = bookId;
    stats.lastReadDate = new Date().toISOString();
    stats.sessionsCount++;
    save();
  }

  function addReadingTime(seconds) {
    stats.totalReadingTimeSeconds += seconds;
    save();
  }

  function getStats() {
    return { ...stats };
  }

  function getFormattedStats() {
    const hours = Math.floor(stats.totalReadingTimeSeconds / 3600);
    const mins = Math.floor((stats.totalReadingTimeSeconds % 3600) / 60);
    return {
      totalHours: hours,
      totalMinutes: mins,
      booksOpenedCount: Object.keys(stats.booksOpened).length,
      sessionsCount: stats.sessionsCount,
      formattedTime: `${hours}小时${mins}分钟`,
    };
  }

  load();
  return { trackBookOpen, addReadingTime, getStats, getFormattedStats };
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

  function generateShareText(book) {
    return `📚《${book.title}》— ${book.author}\n${book.description?.substring(0, 80) || ''}...\n\n—— 来自「世界文学名著档案馆」\n🔗 ${window.location.origin}${window.location.pathname}`;
  }

  function generateShareHTML(book) {
    return `
      <div style="text-align:center;padding:1rem;">
        <p style="font-weight:600;color:var(--color-gold-dark);">分享《${book.title}》</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;">
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${generateShareText(book).replace(/'/g, "\\'")}').then(()=>LiteratureArchive.showNotification('已复制到剪贴板 📋'))">📋 复制文本</button>
          <button class="btn btn-outline btn-sm" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText(book))}','_blank')">🐦 推特分享</button>
          <button class="btn btn-outline btn-sm" onclick="window.open('https://service.weibo.com/share/share.php?title=${encodeURIComponent(generateShareText(book))}','_blank')">📱 微博分享</button>
        </div>
      </div>
    `;
  }

  return { shareViaWebAPI, copyToClipboard, generateShareText, generateShareHTML };
})();

// ==================== Theme Switcher ====================
const ThemeSystem = (function() {
  const THEMES = ['spring', 'summer', 'autumn', 'winter'];

  function applyTheme(themeName) {
    document.body.classList.remove(...THEMES.map(t => `theme-${t}`));
    if (THEMES.includes(themeName)) {
      document.body.classList.add(`theme-${themeName}`);
      localStorage.setItem('lit_archive_theme', themeName);
    }
  }

  function getCurrentTheme() {
    for (const t of THEMES) {
      if (document.body.classList.contains(`theme-${t}`)) return t;
    }
    return null;
  }

  function autoDetectSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  function init() {
    const savedTheme = localStorage.getItem('lit_archive_theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }

  init();
  return { applyTheme, getCurrentTheme, autoDetectSeason, THEMES };
})();

// ==================== Page View Counter ====================
(function() {
  function incrementPageView() {
    try {
      const key = 'lit_archive_page_views_' + (window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_') || 'home');
      let views = parseInt(localStorage.getItem(key) || '0');
      views++;
      localStorage.setItem(key, views.toString());

      const totalKey = 'lit_archive_total_views';
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

// ==================== Reading Focus Mode ====================
(function() {
  function toggleFocusMode() {
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const sidebar = document.querySelector('.sidebar');

    if (!mainContent) return;

    const isActive = mainContent.classList.toggle('focus-mode');

    if (isActive) {
      if (header) header.style.opacity = '0.3';
      if (footer) footer.style.opacity = '0.3';
      if (sidebar) sidebar.style.display = 'none';
      mainContent.style.maxWidth = '750px';
      mainContent.style.margin = '0 auto';
      document.body.style.background = 'var(--color-ivory)';
      LiteratureArchive.showNotification('已进入专注阅读模式 📖');
    } else {
      if (header) header.style.opacity = '1';
      if (footer) footer.style.opacity = '1';
      if (sidebar) sidebar.style.display = '';
      mainContent.style.maxWidth = '';
      mainContent.style.margin = '';
      document.body.style.background = '';
      LiteratureArchive.showNotification('已退出专注阅读模式');
    }
  }

  // Bind to F key when not in input
  document.addEventListener('keydown', function(e) {
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.getAttribute('contenteditable') !== 'true') {
      toggleFocusMode();
    }
  });

  window.toggleFocusMode = toggleFocusMode;
})();

// ==================== Audio Player Enhancement ====================
(function() {
  function enhanceAudioPlayers() {
    document.querySelectorAll('audio').forEach(audio => {
      if (audio.dataset.enhanced) return;
      audio.dataset.enhanced = 'true';

      audio.addEventListener('play', function() {
        console.log('🎧 Audio playback started');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAudioPlayers);
  } else {
    enhanceAudioPlayers();
  }
})();

// ==================== Print Handler ====================
(function() {
  function setupPrintButton() {
    const printBtns = document.querySelectorAll('.print-page-btn');
    printBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupPrintButtons);
})();

// ==================== Context Menu Enhancement ====================
(function() {
  document.addEventListener('contextmenu', function(e) {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 10) {
      // Custom context menu could be implemented here
      // For now, just log
      console.log('Selected text:', selectedText.substring(0, 50) + '...');
    }
  });
})();

// ==================== Idle Detection ====================
(function() {
  let idleTimer;
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    document.body.classList.remove('is-idle');
    idleTimer = setTimeout(() => {
      document.body.classList.add('is-idle');
      console.log('💤 User is idle');
    }, IDLE_TIMEOUT);
  }

  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, { passive: true });
  });

  resetIdleTimer();
})();

// ==================== Announcement Banner ====================
(function() {
  const announcements = [
    { text: '📢 新书上架：《卡拉马佐夫兄弟》深度解读已更新', date: '2026-06-15' },
    { text: '🎉 档案馆迎来了第 ' + (parseInt(localStorage.getItem('lit_archive_total_views') || '1000')) + ' 位访客！', date: '2026-06-16' },
    { text: '📖 阅读室新增「分栏阅读」功能，欢迎体验', date: '2026-06-17' },
    { text: '🌟 本周推荐：《百年孤独》— 马尔克斯的魔幻世界', date: '2026-06-18' },
  ];

  function getLatestAnnouncement() {
    const today = new Date().toISOString().split('T')[0];
    const recent = announcements.filter(a => a.date <= today);
    return recent.length > 0 ? recent[recent.length - 1] : announcements[0];
  }

  window.LiteratureArchiveAnnouncements = {
    getLatest: getLatestAnnouncement,
    all: announcements,
  };
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

    // Add transition overlay
    const href = link.getAttribute('href');
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      document.body.style.opacity = '0.6';
      document.body.style.transition = 'opacity 0.2s ease';
    }
  });

  window.addEventListener('pageshow', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease';
  });
})();

// Export
window.ReadingStats = ReadingStats;
window.ShareSystem = ShareSystem;
window.ThemeSystem = ThemeSystem;
