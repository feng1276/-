// ============================================================
// 美食菜谱网站 — 核心交互逻辑
// ============================================================

// ===== 状态管理 =====
const state = {
  currentPage: 'home',
  currentType: null,       // 当前筛选的分类
  currentRecipeId: null,   // 当前查看的菜谱 ID
  currentStep: 0,          // 当前步骤索引
  favorites: JSON.parse(localStorage.getItem('recipe_fav') || '[]'),
  history: JSON.parse(localStorage.getItem('recipe_hist') || '[]'),
  filters: {
    time: null,    // null | 'quick'(<20) | 'medium'(20-60) | 'slow'(>60)
    difficulty: null, // null | '简单' | '中等' | '困难'
    ingredient: '',
  }
};

// ===== DOM 缓存 =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const $pages = {
  home: $('#page-home'),
  list: $('#page-list'),
  detail: $('#page-detail'),
  favorites: $('#page-favorites'),
};

const $navLinks = $$('.nav-links a');
const $hamburger = $('#hamburger');
const $navMenu = $('#nav-menu');
const $searchOverlay = $('#search-overlay');
const $searchInput = $('#search-input');
const $searchResults = $('#search-results');
const $toast = $('#toast');

// ===== 工具函数 =====
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function getTypeLabel(type) {
  const map = { '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '甜点': 'dessert', '汤品': 'soup', '小吃': 'snack' };
  return map[type] || 'breakfast';
}

function getTypeEmoji(type) {
  const map = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '甜点': '🍰', '汤品': '🍲', '小吃': '🥢' };
  return map[type] || '🍽️';
}

function getSpicyStr(level) {
  if (!level || level === 0) return '';
  return '🌶️'.repeat(level);
}

function getDiffClass(difficulty) {
  if (difficulty === '简单') return 'tag-diff-easy';
  if (difficulty === '中等') return 'tag-diff-medium';
  return 'tag-diff-hard';
}

function getTimeLabel(minutes) {
  if (minutes < 20) return '快速';
  if (minutes <= 60) return '中等';
  return '慢炖';
}

function getTimeCategory(minutes) {
  if (minutes < 20) return 'quick';
  if (minutes <= 60) return 'medium';
  return 'slow';
}

function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout($toast._timeout);
  $toast._timeout = setTimeout(() => $toast.classList.remove('show'), 2000);
}

function saveFavorites() {
  localStorage.setItem('recipe_fav', JSON.stringify(state.favorites));
}

function saveHistory() {
  // 只保留最近20条
  if (state.history.length > 20) state.history = state.history.slice(-20);
  localStorage.setItem('recipe_hist', JSON.stringify(state.history));
}

function addToHistory(recipeId) {
  // 移除重复的
  state.history = state.history.filter(id => id !== recipeId);
  state.history.push(recipeId);
  saveHistory();
}

// ===== 页面导航 =====
function navigateTo(page, params = {}) {
  state.currentPage = page;
  // 更新页面显示
  Object.keys($pages).forEach(key => {
    $pages[key].classList.toggle('active', key === page);
  });

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 关闭移动端菜单
  $navMenu.classList.remove('active');
  $hamburger.classList.remove('active');

  // 根据页面执行渲染
  switch (page) {
    case 'home': renderHome(); break;
    case 'list': renderList(params.type); break;
    case 'detail': renderDetail(params.id); break;
    case 'favorites': renderFavorites(); break;
  }
}

// ===== 首页渲染 =====
function renderHome() {
  // 今日推荐：随机选一道
  const featured = recipes[Math.floor(Math.random() * recipes.length)];
  const $featured = $('#featured-recipe');
  $featured.querySelector('.featured-img').textContent = featured.emoji;
  $featured.querySelector('.featured-img').className = 'featured-img bg-' + getTypeLabel(featured.type);
  $featured.querySelector('h3').textContent = featured.name;
  $featured.querySelector('p').textContent = featured.description;
  $featured.querySelector('.featured-meta').innerHTML = `
    <span><span class="icon">⏱️</span> ${featured.time} 分钟</span>
    <span><span class="icon">📊</span> ${featured.difficulty}</span>
    <span><span class="icon">🍽️</span> ${featured.servings} 人份</span>
  `;
  $featured.onclick = () => navigateTo('detail', { id: featured.id });

  // 分类卡片数量
  $$('.cat-count').forEach(el => {
    const type = el.dataset.type;
    const count = recipes.filter(r => r.type === type).length;
    el.textContent = `${count} 道菜谱`;
  });

  // 更新导航高亮
  $navLinks.forEach(a => a.classList.remove('active'));
  $navLinks[0]?.classList.add('active');
}

// ===== 菜谱列表渲染 =====
function renderList(type) {
  state.currentType = type;
  state.filters = { time: null, difficulty: null, ingredient: '' };

  const $listTitle = $('#list-title');
  const $listEmoji = $('#list-emoji');
  const $recipesGrid = $('#recipes-grid');
  const $recipesCount = $('#recipes-count');
  const $filterChips = $$('#filter-time .filter-chip, #filter-diff .filter-chip');

  $listEmoji.textContent = getTypeEmoji(type);
  $listTitle.textContent = type;
  $filterChips.forEach(c => c.classList.remove('active'));

  // 重置筛选按钮
  $$('.filter-chip').forEach(chip => {
    if (chip.dataset.value === 'all') chip.classList.add('active');
  });

  // 更新导航高亮
  $navLinks.forEach(a => a.classList.remove('active'));

  renderFilteredRecipes();
}

function renderFilteredRecipes() {
  let filtered = recipes;

  // 按分类筛选
  if (state.currentType) {
    filtered = filtered.filter(r => r.type === state.currentType);
  }

  // 按时间筛选
  if (state.filters.time) {
    filtered = filtered.filter(r => getTimeCategory(r.time) === state.filters.time);
  }

  // 按难度筛选
  if (state.filters.difficulty) {
    filtered = filtered.filter(r => r.difficulty === state.filters.difficulty);
  }

  // 按食材筛选
  if (state.filters.ingredient) {
    const keyword = state.filters.ingredient.toLowerCase();
    filtered = filtered.filter(r =>
      r.ingredients.some(ing => ing.toLowerCase().includes(keyword))
    );
  }

  const $recipesGrid = $('#recipes-grid');
  const $recipesCount = $('#recipes-count');

  $recipesCount.textContent = `找到 ${filtered.length} 道菜谱`;

  if (filtered.length === 0) {
    $recipesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:4rem 2rem; color:var(--gray-400);">
        <div style="font-size:4rem; margin-bottom:1rem;">🍳</div>
        <p style="font-size:1.1rem;">没有找到匹配的菜谱，试试调整筛选条件吧~</p>
      </div>`;
    return;
  }

  $recipesGrid.innerHTML = filtered.map(r => `
    <div class="recipe-card" onclick="navigateTo('detail', {id: ${r.id}})">
      <div class="recipe-card-img bg-${getTypeLabel(r.type)}">
        <span style="font-size:4rem;">${r.emoji}</span>
        <span class="card-time">⏱ ${r.time}分钟</span>
      </div>
      <div class="recipe-card-body">
        <h3>${r.name}</h3>
        <p>${r.description}</p>
        <div class="recipe-card-tags">
          <span class="tag tag-type">${r.type}</span>
          <span class="tag ${getDiffClass(r.difficulty)}">${r.difficulty}</span>
          <span class="tag tag-time">${getTimeLabel(r.time)}</span>
          ${r.region ? `<span class="tag tag-region">📍 ${r.region}</span>` : ''}
          ${r.method ? `<span class="tag tag-method">🔪 ${r.method}</span>` : ''}
          ${getSpicyStr(r.spicy) ? `<span class="tag tag-spicy">${getSpicyStr(r.spicy)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ===== 详情页渲染 =====
function renderDetail(id) {
  state.currentRecipeId = id;
  state.currentStep = 0;

  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return navigateTo('home');

  // 加入历史记录
  addToHistory(id);

  const $detail = $('#page-detail');

  // Hero区域
  $detail.querySelector('.detail-hero').textContent = recipe.emoji;
  $detail.querySelector('.detail-hero').className = 'detail-hero bg-' + getTypeLabel(recipe.type);

  // 头部信息
  $detail.querySelector('.detail-header h2').textContent = recipe.name;
  $detail.querySelector('.detail-desc').textContent = recipe.description;
  $detail.querySelector('.detail-meta-row').innerHTML = `
    <div class="detail-meta-item"><span class="meta-icon">⏱️</span> ${recipe.time} 分钟</div>
    <div class="detail-meta-item"><span class="meta-icon">📊</span> ${recipe.difficulty}</div>
    <div class="detail-meta-item"><span class="meta-icon">🍽️</span> ${recipe.servings} 人份</div>
    <div class="detail-meta-item"><span class="meta-icon">🏷️</span> ${recipe.type}</div>
    ${recipe.region ? `<div class="detail-meta-item"><span class="meta-icon">📍</span> ${recipe.region}</div>` : ''}
    ${recipe.method ? `<div class="detail-meta-item"><span class="meta-icon">🔪</span> ${recipe.method}</div>` : ''}
    ${getSpicyStr(recipe.spicy) ? `<div class="detail-meta-item"><span class="meta-icon">🌶️</span> 辣度 ${getSpicyStr(recipe.spicy)}</div>` : ''}
  `;

  // 收藏按钮状态
  const isFav = state.favorites.includes(id);
  const $favBtn = $detail.querySelector('.btn-fav');
  $favBtn.classList.toggle('favorited', isFav);
  $favBtn.innerHTML = isFav ? '❤️ 已收藏' : '🤍 收藏';
  $favBtn.onclick = () => toggleFavorite(id);

  // 食材列表
  $detail.querySelector('.ingredients-list').innerHTML = recipe.ingredients.map(ing =>
    `<li>${ing}</li>`
  ).join('');

  // 步骤列表
  renderSteps(recipe);

  // 小贴士
  const $tipsBox = $detail.querySelector('.tips-box');
  if (recipe.tips) {
    $tipsBox.style.display = 'block';
    $tipsBox.innerHTML = `<strong>💡 小贴士：</strong>${recipe.tips}`;
  } else {
    $tipsBox.style.display = 'none';
  }

  // 初始化步骤控制
  initStepControls(recipe);
}

function renderSteps(recipe) {
  const $stepsList = $('#steps-list');
  $stepsList.innerHTML = recipe.steps.map((step, i) => `
    <div class="step-item ${i === 0 ? 'current' : ''}" data-step="${i}">
      <div class="step-num">${i + 1}</div>
      <div class="step-content">
        <div class="step-text">${step}</div>
      </div>
    </div>
  `).join('');
}

function initStepControls(recipe) {
  const total = recipe.steps.length;
  state.currentStep = 0;

  const $progressFill = $('#step-progress-fill');
  const $progressText = $('#step-progress-text');
  const $prevBtn = $('#btn-step-prev');
  const $nextBtn = $('#btn-step-next');
  const $resetBtn = $('#btn-step-reset');

  function updateUI() {
    const pct = total > 1 ? Math.round((state.currentStep / (total - 1)) * 100) : 100;
    $progressFill.style.width = pct + '%';
    $progressText.textContent = `${state.currentStep + 1} / ${total}`;

    $prevBtn.disabled = state.currentStep === 0;
    $nextBtn.disabled = state.currentStep >= total - 1;

    // 更新步骤显示
    $$('.step-item').forEach((item, i) => {
      item.classList.remove('done', 'current');
      if (i < state.currentStep) item.classList.add('done');
      if (i === state.currentStep) item.classList.add('current');
    });

    // 滚动当前步骤到可见区域
    const currentItem = $(`.step-item[data-step="${state.currentStep}"]`);
    if (currentItem) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  $prevBtn.onclick = () => {
    if (state.currentStep > 0) {
      state.currentStep--;
      updateUI();
    }
  };

  $nextBtn.onclick = () => {
    if (state.currentStep < total - 1) {
      state.currentStep++;
      updateUI();
    }
  };

  $resetBtn.onclick = () => {
    state.currentStep = 0;
    updateUI();
    document.querySelector('.steps-list').scrollIntoView({ behavior: 'smooth' });
  };

  // 点击步骤也可以跳转
  $$('.step-item').forEach((item, i) => {
    item.onclick = () => {
      state.currentStep = i;
      updateUI();
    };
  });

  updateUI();
}

// ===== 收藏功能 =====
function toggleFavorite(id) {
  const idx = state.favorites.indexOf(id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    showToast('已取消收藏');
  } else {
    state.favorites.push(id);
    showToast('已加入收藏 ❤️');
  }
  saveFavorites();

  // 如果在详情页，更新按钮
  if (state.currentPage === 'detail' && state.currentRecipeId === id) {
    const isFav = state.favorites.includes(id);
    const $favBtn = $('#page-detail .btn-fav');
    $favBtn.classList.toggle('favorited', isFav);
    $favBtn.innerHTML = isFav ? '❤️ 已收藏' : '🤍 收藏';
  }

  // 如果在收藏页，刷新列表
  if (state.currentPage === 'favorites') {
    renderFavorites();
  }
}

function renderFavorites() {
  const favRecipes = state.favorites.map(id => recipes.find(r => r.id === id)).filter(Boolean);
  const $favGrid = $('#fav-recipes-grid');
  const $favEmpty = $('#fav-empty');

  $navLinks.forEach(a => a.classList.remove('active'));

  if (favRecipes.length === 0) {
    $favGrid.innerHTML = '';
    $favEmpty.style.display = 'block';
    return;
  }

  $favEmpty.style.display = 'none';
  $favGrid.innerHTML = favRecipes.map(r => `
    <div class="recipe-card" onclick="navigateTo('detail', {id: ${r.id}})">
      <div class="recipe-card-img bg-${getTypeLabel(r.type)}">
        <span style="font-size:4rem;">${r.emoji}</span>
        <span class="card-time">⏱ ${r.time}分钟</span>
      </div>
      <div class="recipe-card-body">
        <h3>${r.name}</h3>
        <p>${r.description}</p>
        <div class="recipe-card-tags">
          <span class="tag tag-type">${r.type}</span>
          <span class="tag ${getDiffClass(r.difficulty)}">${r.difficulty}</span>
          <span class="tag tag-time">${getTimeLabel(r.time)}</span>
          ${r.region ? `<span class="tag tag-region">📍 ${r.region}</span>` : ''}
          ${r.method ? `<span class="tag tag-method">🔪 ${r.method}</span>` : ''}
          ${getSpicyStr(r.spicy) ? `<span class="tag tag-spicy">${getSpicyStr(r.spicy)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ===== 随机推荐 =====
function randomRecipe() {
  const $display = $('#random-display');
  const $btn = $('#btn-random');

  // 禁用按钮防抖
  $btn.disabled = true;

  // 滚动动画
  $display.classList.add('rolling');

  // 快速切换动画
  let count = 0;
  const maxFlicker = 8;
  const flickerInterval = 80;

  function flicker() {
    const randomR = recipes[Math.floor(Math.random() * recipes.length)];
    $display.querySelector('.random-emoji').textContent = randomR.emoji;
    $display.querySelector('.random-name').textContent = randomR.name;
    count++;
    if (count < maxFlicker) {
      setTimeout(flicker, flickerInterval + count * 20);
    } else {
      // 最终结果
      const final = recipes[Math.floor(Math.random() * recipes.length)];
      $display.classList.remove('rolling');
      $display.classList.add('flipped');
      setTimeout(() => {
        $display.querySelector('.random-emoji').textContent = final.emoji;
        $display.querySelector('.random-name').textContent = final.name;
        $display.querySelector('.random-meta').innerHTML = `
          <span>⏱️ ${final.time} 分钟</span>
          <span>📊 ${final.difficulty}</span>
          <span>🍽️ ${final.servings} 人份</span>
        `;
        $display.querySelector('.random-desc').textContent = final.description;
        // 点击跳转详情
        $display.onclick = () => navigateTo('detail', { id: final.id });
        $display.style.cursor = 'pointer';
        $display.title = '点击查看详细做法';
        $display.classList.remove('flipped');
        $btn.disabled = false;
      }, 400);
    }
  }

  flicker();
}

// ===== 搜索功能 =====
function openSearch() {
  $searchOverlay.classList.add('show');
  setTimeout(() => $searchInput.focus(), 100);
  $searchInput.value = state.filters.ingredient || '';
  if ($searchInput.value) performSearch($searchInput.value);
}

function closeSearch() {
  $searchOverlay.classList.remove('show');
}

function performSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    $searchResults.innerHTML = '';
    return;
  }

  const results = recipes.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.ingredients.some(ing => ing.toLowerCase().includes(q)) ||
    r.type.includes(q) ||
    r.description.toLowerCase().includes(q) ||
    (r.region && r.region.includes(q)) ||
    (r.method && r.method.includes(q))
  );

  if (results.length === 0) {
    $searchResults.innerHTML = `
      <div style="text-align:center; padding:2rem; color:var(--gray-400);">
        <div style="font-size:3rem; margin-bottom:0.5rem;">🔍</div>
        <p>没有找到包含"${query}"的菜谱</p>
      </div>`;
    return;
  }

  $searchResults.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="navigateTo('detail', {id: ${r.id}}); closeSearch();">
      <span class="sr-emoji">${r.emoji}</span>
      <div class="sr-info">
        <div class="sr-name">${highlightMatch(r.name, query)}</div>
        <div class="sr-meta">${r.type} · ⏱${r.time}分钟 · ${r.difficulty}</div>
      </div>
    </div>
  `).join('');
}

function highlightMatch(text, query) {
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:#fde68a;padding:0 2px;border-radius:2px;">$1</mark>');
}

// ===== 波纹效果 =====
function createRipple(e, el) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// ===== 滚动动画 =====
function initScrollAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== 事件绑定 =====
function bindEvents() {
  // 导航链接
  $navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page === 'home') navigateTo('home');
      else if (page === 'favorites') navigateTo('favorites');
      else if (page === 'breakfast') navigateTo('list', { type: '早餐' });
      else if (page === 'lunch') navigateTo('list', { type: '午餐' });
      else if (page === 'dinner') navigateTo('list', { type: '晚餐' });
      else if (page === 'dessert') navigateTo('list', { type: '甜点' });
      else if (page === 'soup') navigateTo('list', { type: '汤品' });
      else if (page === 'snack') navigateTo('list', { type: '小吃' });
    });
  });

  // Logo 点击回首页
  $('#logo').addEventListener('click', () => navigateTo('home'));

  // 汉堡菜单
  $hamburger.addEventListener('click', () => {
    $hamburger.classList.toggle('active');
    $navMenu.classList.toggle('active');
  });

  // 搜索
  $('#btn-search').addEventListener('click', openSearch);
  $('#search-close').addEventListener('click', closeSearch);
  $searchOverlay.addEventListener('click', (e) => {
    if (e.target === $searchOverlay) closeSearch();
  });
  $searchInput.addEventListener('input', debounce((e) => performSearch(e.target.value), 250));

  // ESC 关闭搜索
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // 分类卡片
  $$('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      navigateTo('list', { type });
    });
  });

  // 今日推荐
  $('#featured-recipe').addEventListener('click', () => {
    // 已通过 onclick 处理
  });

  // 随机推荐按钮
  $('#btn-random').addEventListener('click', randomRecipe);

  // 列表筛选按钮
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.filter-group');
      group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterType = group.dataset.filter;
      const value = chip.dataset.value;

      if (value === 'all') {
        state.filters[filterType] = null;
      } else {
        state.filters[filterType] = value;
      }

      renderFilteredRecipes();
    });
  });

  // 列表中的食材搜索
  const $ingSearch = $('#list-ingredient-search');
  if ($ingSearch) {
    $ingSearch.addEventListener('input', debounce((e) => {
      state.filters.ingredient = e.target.value;
      renderFilteredRecipes();
    }, 300));
  }

  // 波纹效果
  document.querySelectorAll('.btn-random, .btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => createRipple(e, btn));
  });

  // 导航栏滚动阴影
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 首页英雄按钮
  $('#btn-explore').addEventListener('click', () => {
    document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });
  });

  $('#btn-random-nav').addEventListener('click', () => {
    document.getElementById('random-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(randomRecipe, 600);
  });

  // 返回按钮
  $('#btn-detail-back').addEventListener('click', () => {
    if (state.history.length > 1) {
      // 回到上一页逻辑简化：回到列表或首页
      const recipe = recipes.find(r => r.id === state.currentRecipeId);
      if (recipe && state.currentType) {
        navigateTo('list', { type: recipe.type });
      } else {
        navigateTo('home');
      }
    } else {
      navigateTo('home');
    }
  });
}

// ===== 初始化 =====
function init() {
  bindEvents();
  renderHome();
  initScrollAnimation();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
