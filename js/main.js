/* ==========================================================================
   FENYX INTERIORS — MASTER INTERACTIONS CONTROLLER
   Preloader, Sticky Nav, Cursor, Theme, Reveal Animations, Clocks, Contact
   ========================================================================== */

(function () {
  'use strict';

  // 1. Luxury Preloader
  function setupPreloader() {
    const preloader = document.querySelector('.preloader');
    const progressBar = document.querySelector('.preloader-progress-bar');
    const counter = document.querySelector('.preloader-counter');

    if (!preloader) return;

    // Fast simulation of luxury load
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress > 100) progress = 100;

      if (progressBar) progressBar.style.width = progress + '%';
      if (counter) counter.textContent = `${progress}%`;

      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
        }, 350);
      }
    }, 45);
  }

  // 2. Sticky Header Blur
  function setupHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Active Link Highlighting
  function setupActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // 4. Mobile Menu Drawer
  function setupMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer) return;

    function toggleMenu() {
      const isOpen = drawer.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function openMenu() {
      toggleBtn.classList.add('is-active');
      drawer.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      toggleBtn.classList.remove('is-active');
      drawer.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  }

  // 5. Luxury Custom Cursor Follower
  function setupCustomCursor() {
    // Only enable on fine pointer / desktop
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let cursor = document.querySelector('.custom-cursor');
    let follower = document.querySelector('.custom-cursor-follower');

    if (!cursor) {
      cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
    }

    if (!follower) {
      follower = document.createElement('div');
      follower.className = 'custom-cursor-follower';
      document.body.appendChild(follower);
    }

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function renderFollower() {
      posX += (mouseX - posX) * 0.18;
      posY += (mouseY - posY) * 0.18;

      follower.style.left = `${posX}px`;
      follower.style.top = `${posY}px`;

      requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Hover state on links & buttons
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .project-card, .swatch-card, .estimator-option-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // 6. Scroll Reveal Observer
  function setupScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-fade');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // 7. Theme Switcher (Dark Luxury / Light Ivory)
  function setupThemeToggle() {
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('fenyx_theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);

    function updateIcons(theme) {
      themeButtons.forEach(btn => {
        btn.innerHTML = theme === 'light' 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      });
    }

    updateIcons(savedTheme);

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const nextTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('fenyx_theme', nextTheme);
        updateIcons(nextTheme);
      });
    });
  }

  // 8. FAQ Accordions
  function setupFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-active');
        // Close siblings
        faqItems.forEach(i => i.classList.remove('is-active'));
        if (!isOpen) {
          item.classList.add('is-active');
        }
      });
    });
  }

  // 9. World Clock in Footer
  function setupWorldClocks() {
    function updateTimes() {
      const nyEl = document.getElementById('tz-ny');
      const lonEl = document.getElementById('tz-lon');
      const dxbEl = document.getElementById('tz-dxb');
      const bomEl = document.getElementById('tz-bom');

      const now = new Date();

      const timeFormat = (tz) => {
        try {
          return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: tz
          }).format(now);
        } catch (e) {
          return '12:00 PM';
        }
      };

      if (nyEl) nyEl.textContent = timeFormat('America/New_York');
      if (lonEl) lonEl.textContent = timeFormat('Europe/London');
      if (dxbEl) dxbEl.textContent = timeFormat('Asia/Dubai');
      if (bomEl) bomEl.textContent = timeFormat('Asia/Kolkata');
    }

    updateTimes();
    setInterval(updateTimes, 30000);
  }

  // 10. Multi-Step Consultation Booking on contact.html
  function setupContactForm() {
    const contactForm = document.getElementById('consultation-form');
    if (!contactForm) return;

    const steps = document.querySelectorAll('.contact-wizard-step');
    const stepIndicators = document.querySelectorAll('.wizard-step-indicator');
    const nextButtons = document.querySelectorAll('.btn-wizard-next');
    const prevButtons = document.querySelectorAll('.btn-wizard-prev');
    const successModal = document.getElementById('booking-success-modal');
    const successModalClose = document.getElementById('booking-success-close');

    let currentStep = 1;

    // Check if coming from Estimator
    const storedEstimate = sessionStorage.getItem('fenyx_estimate');
    if (storedEstimate) {
      try {
        const parsed = JSON.parse(storedEstimate);
        const serviceSelect = document.getElementById('form-service-type');
        const scopeNotes = document.getElementById('form-project-details');
        if (serviceSelect && parsed.projectType) {
          serviceSelect.value = parsed.projectType;
        }
        if (scopeNotes && parsed.areaSqFt) {
          scopeNotes.value = `Estimated Space: ${parsed.areaSqFt} sq.ft | Style: ${parsed.designStyle} | Scope: ${parsed.scope}`;
        }
      } catch (e) {}
    }

    function showStep(stepNumber) {
      steps.forEach((step, idx) => {
        step.style.display = (idx + 1 === stepNumber) ? 'block' : 'none';
      });

      stepIndicators.forEach((ind, idx) => {
        ind.classList.remove('active', 'completed');
        if (idx + 1 === stepNumber) {
          ind.classList.add('active');
        } else if (idx + 1 < stepNumber) {
          ind.classList.add('completed');
        }
      });

      currentStep = stepNumber;
    }

    nextButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep < steps.length) {
          showStep(currentStep + 1);
        }
      });
    });

    prevButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 1) {
          showStep(currentStep - 1);
        }
      });
    });

    // Option Button Selection in Contact Wizard
    const optionCards = document.querySelectorAll('.wizard-option-card');
    optionCards.forEach(card => {
      card.addEventListener('click', () => {
        const parent = card.closest('.wizard-options-group');
        if (parent) {
          parent.querySelectorAll('.wizard-option-card').forEach(c => c.classList.remove('selected'));
        }
        card.classList.add('selected');
        const inputTarget = card.getAttribute('data-input-target');
        const inputValue = card.getAttribute('data-value');
        if (inputTarget && inputValue) {
          const hiddenInput = document.getElementById(inputTarget);
          if (hiddenInput) hiddenInput.value = inputValue;
        }
      });
    });

    // Simulated File Upload
    const fileZone = document.querySelector('.file-upload-zone');
    const fileInput = document.getElementById('floorplan-upload');
    const fileNameDisplay = document.getElementById('uploaded-file-name');

    if (fileZone && fileInput) {
      fileZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          if (fileNameDisplay) {
            fileNameDisplay.textContent = `Attached: ${fileInput.files[0].name} (${(fileInput.files[0].size / 1024 / 1024).toFixed(2)} MB)`;
            fileNameDisplay.style.display = 'block';
          }
        }
      });
    }

    // Direct Background Submission to Google Form & Linked Google Sheet
    const GOOGLE_FORM_RESPONSE_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfXhZ9pk3n8wuu3nxLYp_-fCj8AhbD-3A25FJugY_-Npf6izg/formResponse';

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Mapping values to match EXACT Google Form options
      const serviceMap = {
        'residential': 'Luxury Residential',
        'office': 'Executive Office',
        'retail': 'Retail / Hospitality',
        'turnkey-renovation': 'Full Turnkey Renovation'
      };

      const budgetMap = {
        '200k-500k': '$200,000 — $500,000',
        '500k-1m': '$500,000 — $1,000,000',
        '1m-3m': '$1,000,000 — $3,000,000',
        '3m-plus': '$3,000,000+'
      };

      const timelineMap = {
        'immediate': 'Immediate (Within 30 days)',
        '3-6-months': '3 – 6 Months (Design & procurement stage)'
      };

      const rawService = document.getElementById('form-service-type')?.value || 'residential';
      const rawBudget = document.getElementById('form-budget-tier')?.value || '200k-500k';
      const rawTimeline = document.getElementById('form-timeline')?.value || 'immediate';

      const serviceVal = serviceMap[rawService] || rawService;
      const budgetVal = budgetMap[rawBudget] || rawBudget;
      const timelineVal = timelineMap[rawTimeline] || rawTimeline;
      const locationVal = document.getElementById('form-property-location')?.value || '';
      const nameVal = document.getElementById('form-full-name')?.value || '';
      const emailVal = document.getElementById('form-email')?.value || '';
      const phoneVal = document.getElementById('form-phone')?.value || '';
      const notesVal = document.getElementById('form-project-details')?.value || '';

      // Reliable cross-origin POST using a hidden iframe
      let iframe = document.getElementById('google-form-target-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'google-form-target-iframe';
        iframe.name = 'google-form-target-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      const tempForm = document.createElement('form');
      tempForm.action = GOOGLE_FORM_RESPONSE_URL;
      tempForm.method = 'POST';
      tempForm.target = 'google-form-target-iframe';
      tempForm.style.display = 'none';

      const entries = {
        'entry.610110659': serviceVal,
        'entry.1085914167': budgetVal,
        'entry.1849750114': locationVal,
        'entry.1281561757': timelineVal,
        'entry.1279355805': nameVal,
        'entry.1871198526': emailVal,
        'entry.779963795': phoneVal,
        'entry.1314425078': notesVal
      };

      for (const [key, val] of Object.entries(entries)) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = key;
        hiddenInput.value = val;
        tempForm.appendChild(hiddenInput);
      }

      document.body.appendChild(tempForm);
      tempForm.submit();
      setTimeout(() => tempForm.remove(), 1000);

      const bookingRef = 'INTX-' + Math.floor(100000 + Math.random() * 900000);
      const refElement = document.getElementById('booking-reference-code');
      if (refElement) refElement.textContent = bookingRef;

      if (successModal) {
        successModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }

      contactForm.reset();
      sessionStorage.removeItem('fenyx_estimate');
    });

    if (successModalClose) {
      successModalClose.addEventListener('click', () => {
        successModal.classList.remove('is-open');
        document.body.style.overflow = '';
        showStep(1);
      });
    }

    // Initial step
    showStep(1);
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    setupPreloader();
    setupHeader();
    setupActiveNav();
    setupMobileMenu();
    setupCustomCursor();
    setupScrollReveals();
    setupThemeToggle();
    setupFAQs();
    setupWorldClocks();
    setupContactForm();
  });
})();
