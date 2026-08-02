/* ==========================================================================
   FENYX INTERIORS — BEFORE & AFTER RENOVATION COMPARISON SLIDER
   Fluid Drag, Pointer Capture, Touch & Keyboard Accessible Split Screen
   ========================================================================== */

(function () {
  'use strict';

  function initComparisonSliders() {
    const sliders = document.querySelectorAll('.slider-comparison-container');

    sliders.forEach((slider) => {
      const beforeWrapper = slider.querySelector('.slider-before-wrapper');
      const beforeImg = beforeWrapper ? beforeWrapper.querySelector('.slider-img') : null;
      const handle = slider.querySelector('.slider-divider-handle');
      const button = slider.querySelector('.slider-button');

      if (!beforeWrapper || !handle || !beforeImg) return;

      let isDragging = false;

      function syncImageWidth() {
        const width = slider.getBoundingClientRect().width || slider.offsetWidth;
        if (width > 0) {
          beforeImg.style.width = width + 'px';
          beforeImg.style.maxWidth = width + 'px';
          beforeImg.style.minWidth = width + 'px';
        }
      }

      function updateSliderPosition(percent) {
        // Clamp between 0% and 100%
        const clamped = Math.max(0, Math.min(100, percent));
        beforeWrapper.style.width = clamped + '%';
        handle.style.left = clamped + '%';
        if (button) {
          button.setAttribute('aria-valuenow', Math.round(clamped));
        }
        syncImageWidth();
      }

      function getPointerX(e) {
        if (e.touches && e.touches.length > 0) {
          return e.touches[0].clientX;
        }
        return e.clientX;
      }

      function onMove(e) {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        const clientX = getPointerX(e);
        const offset = clientX - rect.left;
        const percent = (offset / rect.width) * 100;
        updateSliderPosition(percent);
      }

      function startDrag(e) {
        isDragging = true;
        slider.classList.add('is-dragging');
        onMove(e);
      }

      function stopDrag() {
        if (isDragging) {
          isDragging = false;
          slider.classList.remove('is-dragging');
        }
      }

      // Pointer Events (supports Mouse, Touch, Pen seamlessly with pointer capture)
      if (window.PointerEvent) {
        slider.addEventListener('pointerdown', (e) => {
          slider.setPointerCapture?.(e.pointerId);
          startDrag(e);
        });
        slider.addEventListener('pointermove', onMove);
        slider.addEventListener('pointerup', (e) => {
          slider.releasePointerCapture?.(e.pointerId);
          stopDrag();
        });
        slider.addEventListener('pointercancel', (e) => {
          slider.releasePointerCapture?.(e.pointerId);
          stopDrag();
        });
      } else {
        // Mouse Fallback
        slider.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', stopDrag);

        // Touch Fallback
        slider.addEventListener('touchstart', startDrag, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', stopDrag);
      }

      // Accessibility - Keyboard Navigation
      if (button) {
        button.setAttribute('tabindex', '0');
        button.setAttribute('aria-label', 'Drag to compare before and after interior transformation');
        button.addEventListener('keydown', (e) => {
          const currentPercent = parseFloat(handle.style.left) || 50;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateSliderPosition(currentPercent - 5);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateSliderPosition(currentPercent + 5);
          }
        });
      }

      // Resize Sync
      window.addEventListener('resize', syncImageWidth, { passive: true });

      // Initial layout setup & image load sync
      syncImageWidth();
      updateSliderPosition(50);

      // Recalculate after images load
      const imgs = slider.querySelectorAll('.slider-img');
      imgs.forEach((img) => {
        if (img.complete) {
          syncImageWidth();
        } else {
          img.addEventListener('load', syncImageWidth);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComparisonSliders);
  } else {
    initComparisonSliders();
  }
})();
