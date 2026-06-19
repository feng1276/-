/* ═══════════════════════════════════════════════════════════════
   🧠 MNEMOS Cloud — Search & Filter Engine
   Real-time memory search, category/tag filtering, sorting
   ═══════════════════════════════════════════════════════════════ */

const SearchEngine = (() => {
  let activeCategory = 'all';
  let activeTag = null;
  let searchQuery = '';
  let sortBy = 'newest'; // newest | oldest | intensity | accessed

  // ── Filter memories ────────────────────────────────────────
  function filter(memories) {
    let results = [...memories];

    // Category filter
    if (activeCategory !== 'all') {
      results = results.filter(m => m.type === activeCategory);
    }

    // Tag filter
    if (activeTag) {
      results = results.filter(m =>
        m.keywords && m.keywords.some(k => k.includes(activeTag))
      );
    }

    // Search query (match against title, keywords, narrative, id, subcategory)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(m => {
        const searchable = [
          m.id?.toLowerCase(),
          m.subcategory?.toLowerCase(),
          m.category?.toLowerCase(),
          m.location?.toLowerCase(),
          m.narrative?.toLowerCase().slice(0, 500),
          ...(m.keywords || []).map(k => k.toLowerCase()),
        ].join(' ');
        return searchable.includes(q);
      });
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.timestamp || '').localeCompare(b.timestamp || '');
        case 'intensity':
          return (b.emotionIntensity || 0) - (a.emotionIntensity || 0);
        case 'accessed':
          return (b.accessCount || 0) - (a.accessCount || 0);
        case 'newest':
        default:
          return (b.timestamp || '').localeCompare(a.timestamp || '');
      }
    });

    return results;
  }

  // ── Search by query ────────────────────────────────────────
  function search(query) {
    searchQuery = query;
  }

  // ── Set category ───────────────────────────────────────────
  function setCategory(categoryId) {
    activeCategory = categoryId;
  }

  // ── Set tag ────────────────────────────────────────────────
  function setTag(tag) {
    activeTag = activeTag === tag ? null : tag;
  }

  // ── Set sort ───────────────────────────────────────────────
  function setSort(sortType) {
    sortBy = sortType;
  }

  // ── Get all unique tags ────────────────────────────────────
  function getAllTags(memories) {
    const tagSet = new Set();
    memories.forEach(m => {
      (m.keywords || []).forEach(k => tagSet.add(k));
    });
    return Array.from(tagSet).sort();
  }

  // ── Get category counts ────────────────────────────────────
  function getCategoryCounts(memories) {
    const counts = { all: memories.length };
    memories.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return counts;
  }

  // ── Reset all filters ──────────────────────────────────────
  function reset() {
    activeCategory = 'all';
    activeTag = null;
    searchQuery = '';
    sortBy = 'newest';
  }

  return {
    filter,
    search,
    setCategory,
    setTag,
    setSort,
    getAllTags,
    getCategoryCounts,
    reset,
    getState: () => ({ activeCategory, activeTag, searchQuery, sortBy }),
  };
})();
