/* ==========================================================================
   FENYX INTERIORS — INTERACTIVE SPACE & STYLE COST ESTIMATOR
   Calculates Bespoke Spatial Budget Ranges, Timelines & Material Specs
   ========================================================================== */

(function () {
  'use strict';

  function initEstimator() {
    const estimatorContainer = document.getElementById('project-estimator');
    if (!estimatorContainer) return;

    let state = {
      projectType: 'residential',
      areaSqFt: 3500,
      designStyle: 'luxury-modern',
      scope: 'turnkey'
    };

    // Rates per sq.ft based on high-end luxury benchmarks
    const rates = {
      types: {
        residential: 185,
        penthouse: 240,
        office: 160,
        retail: 210
      },
      styles: {
        'minimal-zen': 1.0,
        'luxury-modern': 1.25,
        'heritage-classical': 1.35,
        'biophilic-organic': 1.15
      },
      scopes: {
        'turnkey': 1.0,
        'concept-3d': 0.35,
        'custom-joinery': 0.65
      }
    };

    const areaInput = document.getElementById('estimator-area-input');
    const areaDisplay = document.getElementById('estimator-area-val');
    const priceDisplay = document.getElementById('estimator-price-val');
    const timelineDisplay = document.getElementById('estimator-timeline-val');
    const typeButtons = document.querySelectorAll('[data-estimator-type]');
    const styleButtons = document.querySelectorAll('[data-estimator-style]');
    const scopeButtons = document.querySelectorAll('[data-estimator-scope]');
    const bookEstimateBtn = document.getElementById('estimator-book-btn');

    function calculateEstimate() {
      const baseRate = rates.types[state.projectType] || 185;
      const styleMultiplier = rates.styles[state.designStyle] || 1.0;
      const scopeMultiplier = rates.scopes[state.scope] || 1.0;

      const totalCost = state.areaSqFt * baseRate * styleMultiplier * scopeMultiplier;
      const minCost = Math.round((totalCost * 0.9) / 1000) * 1000;
      const maxCost = Math.round((totalCost * 1.15) / 1000) * 1000;

      // Calculate approximate timeline
      let months = Math.round(state.areaSqFt / 1200) + 3;
      if (state.scope === 'concept-3d') months = Math.max(2, Math.round(months * 0.4));
      if (months > 18) months = 18;

      if (priceDisplay) {
        priceDisplay.textContent = `$${minCost.toLocaleString()} — $${maxCost.toLocaleString()}`;
      }

      if (timelineDisplay) {
        timelineDisplay.textContent = `Approx. ${months} – ${months + 2} Months`;
      }
    }

    // Event Listeners for Type
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.projectType = btn.getAttribute('data-estimator-type');
        calculateEstimate();
      });
    });

    // Event Listeners for Style
    styleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        styleButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.designStyle = btn.getAttribute('data-estimator-style');
        calculateEstimate();
      });
    });

    // Event Listeners for Scope
    scopeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        scopeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.scope = btn.getAttribute('data-estimator-scope');
        calculateEstimate();
      });
    });

    // Area Slider Listener
    if (areaInput) {
      areaInput.addEventListener('input', (e) => {
        state.areaSqFt = parseInt(e.target.value, 10);
        if (areaDisplay) {
          areaDisplay.textContent = `${state.areaSqFt.toLocaleString()} sq.ft`;
        }
        calculateEstimate();
      });
    }

    // Book Consultation prefill
    if (bookEstimateBtn) {
      bookEstimateBtn.addEventListener('click', () => {
        sessionStorage.setItem('fenyx_estimate', JSON.stringify(state));
        window.location.href = 'contact.html?source=estimator';
      });
    }

    calculateEstimate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEstimator);
  } else {
    initEstimator();
  }
})();
