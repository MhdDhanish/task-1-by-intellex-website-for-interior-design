/* ==========================================================================
   FENYX INTERIORS — PORTFOLIO CONTROLLER (Sanity CMS Edition)
   Dynamic Filtering, Masonry Arrangement & Editorial Case Study Viewer
   Data source: Sanity Content Lake via js/sanity-client.js
   ========================================================================== */

(function () {
  'use strict';

  // ---- In-memory store for fetched projects (replaces PROJECTS_DATA) ----
  let PROJECTS = [];

  // ---- DOM References ----
  const portfolioGrid  = document.getElementById('portfolio-grid');
  const featuredGrid   = document.getElementById('featured-projects-grid');
  const filterButtons  = document.querySelectorAll('.filter-btn');
  const modalBackdrop  = document.getElementById('case-study-modal');
  const modalBody      = document.getElementById('case-study-modal-body');
  const modalCloseBtn  = document.getElementById('case-study-modal-close');

  // ---- Image helper ----
  function buildImageUrl(imageRef, width, height, quality) {
    if (!imageRef) return '';
    if (typeof imageRef === 'string') return imageRef;
    if (window.FenyxSanity) {
      return window.FenyxSanity.imageUrl(imageRef, { width, height, quality: quality || 85, fit: 'crop' });
    }
    return '';
  }

  // ---- Loading skeleton ----
  function showLoadingSkeletons(container, count) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="project-card portfolio-item" aria-hidden="true">
        <div class="project-card-img-wrapper" style="height:360px;background:var(--surface-card);border-radius:var(--radius-md);animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>
        <div class="project-card-content" style="padding:16px 0;">
          <div style="height:12px;width:60%;background:var(--surface-card);border-radius:4px;margin-bottom:10px;animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>
          <div style="height:20px;width:85%;background:var(--surface-card);border-radius:4px;animation:skeleton-pulse 1.5s ease-in-out infinite;"></div>
        </div>
      </div>`).join('');
  }

  // ---- Empty state ----
  function showEmptyState(container, message) {
    if (!container) return;
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <div style="font-size:2.5rem;margin-bottom:16px;opacity:0.3;">◈</div>
        <p style="color:var(--text-muted);font-size:1rem;">${message}</p>
      </div>`;
  }

  // ---- Error state ----
  function showErrorState(container) {
    if (!container) return;
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <div style="font-size:2.5rem;margin-bottom:16px;opacity:0.3;">✦</div>
        <p style="color:var(--text-muted);font-size:1rem;">Portfolio temporarily unavailable. Please refresh the page.</p>
      </div>`;
  }

  // ---- Portfolio card HTML ----
  function createPortfolioCardHTML(proj, idx) {
    const isTall   = idx % 3 === 0;
    const imgUrl   = buildImageUrl(proj.coverImage, 1200, isTall ? 920 : 720, 85);
    const tags     = Array.isArray(proj.tags) ? proj.tags.join(' / ') : (proj.category || '');
    return `
      <div class="project-card portfolio-item ${isTall ? 'tall' : ''}"
           data-project-slug="${proj.slug}" data-category="${proj.category}" style="cursor:pointer;">
        <div class="project-card-img-wrapper" style="height:${isTall ? '460px' : '360px'};">
          ${imgUrl ? `<img class="project-card-img" src="${imgUrl}" alt="${proj.title}" loading="lazy" />` : ''}
          <div class="project-card-overlay"></div>
        </div>
        <div class="project-card-content">
          <div class="project-card-meta">
            <span>${tags}</span>
            ${proj.area ? `<span>•</span><span>${proj.area}</span>` : ''}
          </div>
          <h3 class="project-card-title">${proj.title}</h3>
          <p class="project-card-location">${proj.location}</p>
          <div class="project-card-cta">
            <span>View Full Architecture Brief</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>
      </div>`;
  }

  // ---- Featured card HTML (home page) ----
  function createFeaturedCardHTML(proj) {
    const imgUrl = buildImageUrl(proj.coverImage, 1200, 800, 85);
    const tags   = Array.isArray(proj.tags) ? proj.tags.join(' / ') : (proj.category || '');
    return `
      <div class="project-card portfolio-item featured"
           data-project-slug="${proj.slug}" data-category="${proj.category}" style="cursor:pointer;">
        <div class="project-card-img-wrapper">
          ${imgUrl ? `<img class="project-card-img" src="${imgUrl}" alt="${proj.title}" loading="lazy" />` : ''}
          <div class="project-card-overlay"></div>
        </div>
        <div class="project-card-content">
          <div class="project-card-meta">
            <span>${tags}</span>
            ${proj.area ? `<span>•</span><span>${proj.area}</span>` : ''}
          </div>
          <h3 class="project-card-title">${proj.title}</h3>
          <p class="project-card-location">${proj.location}</p>
          <div class="project-card-cta">
            <span>Explore Case Study</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>
      </div>`;
  }

  // ---- Render portfolio grid with filter ----
  function renderPortfolioGrid(filter) {
    if (!portfolioGrid) return;
    const filtered = filter === 'all'
      ? PROJECTS
      : PROJECTS.filter(p =>
          (p.category || '').toLowerCase() === filter.toLowerCase() ||
          (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === filter.toLowerCase()))
        );

    if (filtered.length === 0) {
      showEmptyState(portfolioGrid, `No projects found in the "${filter}" category yet.`);
      return;
    }
    portfolioGrid.innerHTML = filtered.map((p, i) => createPortfolioCardHTML(p, i)).join('');
    attachCardClickListeners();
  }

  // ---- Case Study Modal ----
  function openCaseStudyModal(slug) {
    const proj = PROJECTS.find(p => p.slug === slug);
    if (!proj) { window.location.href = `project-detail.html?slug=${encodeURIComponent(slug)}`; return; }
    if (!modalBackdrop || !modalBody) { window.location.href = `project-detail.html?slug=${encodeURIComponent(slug)}`; return; }

    const imgUrl   = buildImageUrl(proj.coverImage, 1400, 800, 85);
    const tags     = Array.isArray(proj.tags) ? proj.tags.join(' • ') : (proj.category || '');

    modalBody.innerHTML = `
      <div class="modal-case-study">
        <div class="eyebrow">${tags} — ${proj.location}</div>
        <h2 style="font-size:clamp(2rem,3.5vw,3rem);margin-bottom:12px;">${proj.title}</h2>
        ${proj.subtitle ? `<p class="text-editorial text-gold" style="font-size:1.25rem;margin-bottom:24px;">${proj.subtitle}</p>` : ''}

        <div style="width:100%;height:clamp(300px,40vw,480px);border-radius:var(--radius-md);overflow:hidden;margin-bottom:30px;border:1px solid var(--border-subtle);">
          ${imgUrl ? `<img src="${imgUrl}" alt="${proj.title}" style="width:100%;height:100%;object-fit:cover;" />` : ''}
        </div>

        <div class="grid grid-2" style="margin-bottom:36px;gap:30px;">
          <div>
            ${proj.clientBrief ? `<h4 style="color:var(--accent-gold);margin-bottom:10px;font-size:1.1rem;text-transform:uppercase;letter-spacing:0.1em;">The Vision &amp; Brief</h4><p style="margin-bottom:18px;">${proj.clientBrief}</p>` : ''}
            <h4 style="color:var(--accent-gold);margin-bottom:10px;font-size:1.1rem;text-transform:uppercase;letter-spacing:0.1em;">Architectural Summary</h4>
            <p>${proj.shortDescription || ''}</p>
          </div>
          <div style="background:var(--surface-card);padding:24px;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <h4 style="color:var(--accent-gold);margin-bottom:16px;font-size:1.1rem;text-transform:uppercase;letter-spacing:0.1em;">Project Metrics</h4>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;">
              ${proj.location ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;"><span style="color:var(--text-muted);">Location</span><span style="font-weight:500;">${proj.location}</span></div>` : ''}
              ${proj.area     ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;"><span style="color:var(--text-muted);">Spatial Footprint</span><span style="font-weight:500;">${proj.area}</span></div>` : ''}
              ${proj.year     ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;"><span style="color:var(--text-muted);">Completion Year</span><span style="font-weight:500;">${proj.year}</span></div>` : ''}
              ${proj.timeline ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;"><span style="color:var(--text-muted);">Timeline</span><span style="font-weight:500;">${proj.timeline}</span></div>` : ''}
              ${proj.scope    ? `<div style="display:flex;justify-content:space-between;padding-bottom:8px;"><span style="color:var(--text-muted);">Scope</span><span style="font-weight:500;">${proj.scope}</span></div>` : ''}
            </div>
            ${Array.isArray(proj.materials) && proj.materials.length ? `
              <h4 style="color:var(--accent-gold);margin-top:24px;margin-bottom:12px;font-size:1rem;text-transform:uppercase;letter-spacing:0.1em;">Material Palette</h4>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${proj.materials.map(m => `<span style="background:rgba(197,160,89,0.12);color:var(--accent-champagne);border:1px solid var(--border-gold);padding:4px 10px;border-radius:var(--radius-xs);font-size:0.76rem;">${m}</span>`).join('')}
              </div>` : ''}
          </div>
        </div>

        ${proj.result ? `
          <div style="background:linear-gradient(135deg,rgba(197,160,89,0.1) 0%,transparent 100%);border-left:3px solid var(--accent-gold);padding:20px 24px;border-radius:var(--radius-xs);margin-bottom:30px;">
            <strong style="color:var(--accent-gold);display:block;margin-bottom:4px;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;">Design Result &amp; Recognition</strong>
            <p style="margin:0;">${proj.result}</p>
          </div>` : ''}

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;padding-top:20px;border-top:1px solid var(--border-subtle);">
          <a href="project-detail.html?slug=${encodeURIComponent(proj.slug)}" class="btn btn-outline" style="font-size:0.78rem;border-radius:var(--radius-pill);padding:8px 18px;">
            <span>View Full Case Study</span>
          </a>
          <a href="contact.html?project=${encodeURIComponent(proj.title)}" class="btn btn-primary">
            <span>Commission a Similar Project</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      </div>`;

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function attachCardClickListeners() {
    document.querySelectorAll('.project-card[data-project-slug]').forEach(card => {
      card.addEventListener('click', () => openCaseStudyModal(card.getAttribute('data-project-slug')));
    });
  }

  function wireFilterButtons() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPortfolioGrid(btn.getAttribute('data-filter') || 'all');
      });
    });
  }

  function wireModalClose() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  // ---- Main init ----
  async function initProjects() {
    if (portfolioGrid) showLoadingSkeletons(portfolioGrid, 4);
    if (featuredGrid)  showLoadingSkeletons(featuredGrid, 4);

    if (!window.FenyxSanity || !window.FenyxQueries) {
      console.error('[Fenyx] Sanity client not loaded. Include sanity-client.js and sanity-queries.js before projects.js.');
      showErrorState(portfolioGrid);
      showErrorState(featuredGrid);
      wireModalClose();
      return;
    }

    try {
      const isSanityConfigured = window.FenyxSanity.config && window.FenyxSanity.config.projectId !== 'YOUR_PROJECT_ID';

      if (portfolioGrid) {
        if (isSanityConfigured) {
          PROJECTS = await window.FenyxSanity.fetch(window.FenyxQueries.allProjects);
        } else {
          console.warn("[Fenyx] Sanity not configured. Falling back to local projects-data.js");
          PROJECTS = typeof window.PROJECTS_DATA !== 'undefined' ? window.PROJECTS_DATA : [];
        }

        if (!PROJECTS || PROJECTS.length === 0) {
          showEmptyState(portfolioGrid, 'No projects published yet. Check back soon.');
        } else {
          renderPortfolioGrid('all');
          wireFilterButtons();
        }
      }

      if (featuredGrid) {
        let featured = [];
        if (isSanityConfigured) {
          featured = await window.FenyxSanity.fetch(window.FenyxQueries.featuredProjects);
        } else {
          featured = typeof window.PROJECTS_DATA !== 'undefined' ? window.PROJECTS_DATA.filter(p => p.featured || true).slice(0, 4) : [];
        }

        if (!featured || featured.length === 0) {
          showEmptyState(featuredGrid, 'No featured projects yet.');
        } else {
          if (PROJECTS.length === 0) PROJECTS = featured;
          featuredGrid.innerHTML = featured.map(p => createFeaturedCardHTML(p)).join('');
          attachCardClickListeners();
        }
      }
    } catch (err) {
      console.error('[Fenyx] Failed to load portfolio from Sanity:', err);
      showErrorState(portfolioGrid);
      showErrorState(featuredGrid);
    }

    wireModalClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
  } else {
    initProjects();
  }

})();
