/* ==========================================================================
   FENYX INTERIORS — PROJECT DETAIL CONTROLLER (Sanity CMS)
   ========================================================================== */

(function () {
  'use strict';

  const container = document.getElementById('project-detail-container');

  // ---- Image Helper ----
  function buildImageUrl(imageRef, width, height, quality) {
    if (!imageRef) return '';
    if (typeof imageRef === 'string') return imageRef;
    if (window.FenyxSanity) {
      return window.FenyxSanity.imageUrl(imageRef, { width, height, quality: quality || 85, fit: 'crop' });
    }
    return '';
  }

  // ---- Render Full Page ----
  function renderProject(proj) {
    if (!container) return;

    // Use a large banner image
    const coverUrl = buildImageUrl(proj.coverImage, 2000, 1000, 90);
    const tags     = Array.isArray(proj.tags) ? proj.tags.join(' • ') : (proj.category || '');

    document.title = `${proj.title} | Fenyx Interiors Portfolio`;

    let html = `
      <section class="detail-hero">
        <div class="container detail-hero-content reveal-fade">
          <span class="detail-eyebrow">${tags} — ${proj.location}</span>
          <h1 class="detail-title">${proj.title}</h1>
          ${proj.subtitle ? `<p class="detail-subtitle">${proj.subtitle}</p>` : ''}
        </div>
      </section>

      <section class="section" style="padding-top: 0;">
        <div class="container reveal-fade reveal-delay-1">
          <div class="detail-cover">
            ${coverUrl ? `<img src="${coverUrl}" alt="${proj.title} Cover" />` : ''}
          </div>

          <div class="detail-grid">
            <!-- Left Column: Content -->
            <div>
              ${proj.clientBrief ? `
                <h3 class="detail-section-title">The Vision & Brief</h3>
                <div class="detail-text">${proj.clientBrief}</div>
              ` : ''}
              
              ${proj.longDescription ? `
                <h3 class="detail-section-title">Architectural Narrative</h3>
                <div class="detail-text">
                  <!-- Minimal parsing of Sanity Block Content for now -->
                  ${proj.longDescription.map(block => `<p>${block.children ? block.children.map(c => c.text).join('') : ''}</p>`).join('')}
                </div>
              ` : (proj.shortDescription ? `
                <h3 class="detail-section-title">Architectural Summary</h3>
                <div class="detail-text"><p>${proj.shortDescription}</p></div>
              ` : '')}

              ${proj.result ? `
                <div class="result-box">
                  <strong style="color:var(--accent-gold);display:block;margin-bottom:8px;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.12em;">Design Result & Recognition</strong>
                  <div class="detail-text" style="margin-bottom:0;">${proj.result}</div>
                </div>
              ` : ''}
            </div>

            <!-- Right Column: Metrics & Materials -->
            <div>
              <div class="detail-metrics">
                <h3 class="detail-section-title" style="margin-bottom: 24px;">Project Metrics</h3>
                ${proj.location ? `<div class="metric-row"><span class="metric-label">Location</span><span class="metric-value">${proj.location}</span></div>` : ''}
                ${proj.clientName ? `<div class="metric-row"><span class="metric-label">Client</span><span class="metric-value">${proj.clientName}</span></div>` : ''}
                ${proj.area ? `<div class="metric-row"><span class="metric-label">Spatial Footprint</span><span class="metric-value">${proj.area}</span></div>` : ''}
                ${proj.year ? `<div class="metric-row"><span class="metric-label">Completion Year</span><span class="metric-value">${proj.year}</span></div>` : ''}
                ${proj.timeline ? `<div class="metric-row"><span class="metric-label">Timeline</span><span class="metric-value">${proj.timeline}</span></div>` : ''}
                ${proj.scope ? `<div class="metric-row"><span class="metric-label">Scope</span><span class="metric-value">${proj.scope}</span></div>` : ''}
                
                ${Array.isArray(proj.materials) && proj.materials.length > 0 ? `
                  <h3 class="detail-section-title" style="margin-top: 36px; margin-bottom: 16px;">Material Palette</h3>
                  <div class="materials-tags">
                    ${proj.materials.map(m => `<span class="material-tag">${m}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Gallery Section -->
          ${Array.isArray(proj.galleryImages) && proj.galleryImages.length > 0 ? `
            <div class="detail-gallery">
              ${proj.galleryImages.map(img => {
                const url = buildImageUrl(img, 1000, 1000, 85);
                if (!url) return '';
                return `
                  <div class="gallery-img-wrapper">
                    <img src="${url}" alt="${img.caption || 'Project Gallery Image'}" loading="lazy" />
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </section>
    `;

    container.innerHTML = html;

    // Trigger animations if main.js functions are available
    if (window.Fenyx && window.Fenyx.revealElements) {
       setTimeout(() => {
         document.querySelectorAll('.reveal-fade').forEach(el => el.classList.add('is-visible'));
       }, 100);
    } else {
       // Fallback make visible instantly
       document.querySelectorAll('.reveal-fade').forEach(el => {
           el.style.opacity = 1;
           el.style.transform = 'translateY(0)';
       });
    }
  }

  function showError(msg) {
    if (!container) return;
    container.innerHTML = `
      <div style="text-align: center; padding: 120px 20px;">
        <div style="font-size: 2.5rem; margin-bottom: 16px; opacity: 0.3;">✦</div>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 30px;">${msg}</p>
        <a href="projects.html" class="btn btn-primary">Return to Portfolio</a>
      </div>
    `;
  }

  async function init() {
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
      showError('Project not specified.');
      return;
    }

    if (!window.FenyxSanity || !window.FenyxQueries) {
      console.error('[Fenyx] Sanity client not loaded.');
      showError('Unable to load project data. Please refresh.');
      return;
    }

    try {
      const isSanityConfigured = window.FenyxSanity.config && window.FenyxSanity.config.projectId !== 'YOUR_PROJECT_ID';
      
      let proj = null;
      if (isSanityConfigured) {
        proj = await window.FenyxSanity.fetch(window.FenyxQueries.projectBySlug, { slug });
      } else {
        console.warn("[Fenyx] Sanity not configured. Falling back to local projects-data.js");
        if (typeof window.PROJECTS_DATA !== 'undefined') {
          // In local data, id might be used instead of slug
          proj = window.PROJECTS_DATA.find(p => p.slug === slug || p.id === slug);
        }
      }
      
      if (!proj) {
        showError('Project not found or has been removed.');
        return;
      }

      renderProject(proj);
    } catch (err) {
      console.error('[Fenyx] Error loading project detail:', err);
      showError('An error occurred while loading this case study.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
