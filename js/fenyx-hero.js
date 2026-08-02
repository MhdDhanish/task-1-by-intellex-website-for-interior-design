/**
 * =============================================================================
 * FENYX INTERIORS — APPLE-STYLE SCROLL-DRIVEN CANVAS HERO
 * =============================================================================
 * Engine   : HTML5 Canvas 2D + GSAP ScrollTrigger
 * Frames   : 270 sequential JPG frames (frames2/ezgif-frame-001.jpg … 270.jpg)
 * Journey  : Exterior → Entrance → Living Hall → Bedroom → Bathroom
 *
 * Architecture
 * ─────────────
 *  FrameCache     — singleton image store, prevents double-loading
 *  FrameLoader    — priority queue + background progressive loader
 *  CanvasRenderer — high-DPI cover-fit draw engine (RAF-gated)
 *  ScrollEngine   — GSAP ScrollTrigger integration
 *  TextOverlays   — 5-stage synchronized narrative typography
 *  HeroController — top-level coordinator
 * =============================================================================
 */

; (function FenyxHeroModule(global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * CONFIG
   * ───────────────────────────────────────────────────────────────────────── */
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const CFG = Object.freeze({
    TOTAL_FRAMES: isMobile ? 300 : 240,
    FRAME_PATH: isMobile ? 'frames-for-mobile/mobile_frame_' : 'frames-for-desktop/frame_',
    FRAME_EXT: '.webp',
    PRIORITY_COUNT: 45,      // First N frames loaded before ScrollTrigger fires
    CONCURRENCY: 10,      // Background parallel downloads
    SCROLL_DISTANCE: '600%',  // Pin scroll travel — premium, unhurried feel
    SCRUB: 2.5,     // GSAP scrub lag (higher = silkier, Apple-like inertia)
    MAX_DPR: 2.5,     // Cap for very high-DPI screens
    CANVAS_ID: 'fenyx-hero-canvas',
    SECTION_ID: 'fenyx-hero',
    LOADER_ID: 'fenyx-hero-loader',
    PROGRESS_FILL_ID: 'fenyx-progress-fill',
    ROOM_LABEL_ID: 'fenyx-room-label',
    ROOM_NAME_ID: 'fenyx-room-name',
    ROOM_NUM_ID: 'fenyx-room-num',
    SCROLL_CUE_ID: 'fenyx-scroll-cue',
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * TEXT STAGE DEFINITIONS
   * Maps scroll progress [0..1] → visible text stage
   * ───────────────────────────────────────────────────────────────────────── */
  const TEXT_STAGES = [
    {
      id: 'fenyx-stage-1',
      start: 0.00,
      end: 0.20,
      fade: 0.045,
      isFinal: false,
      room: 'Exterior Architecture',
      roomNum: '01 / 05',
    },
    {
      id: 'fenyx-stage-2',
      start: 0.20,
      end: 0.45,
      fade: 0.050,
      isFinal: false,
      room: 'Grand Living Hall',
      roomNum: '02 / 05',
    },
    {
      id: 'fenyx-stage-3',
      start: 0.45,
      end: 0.70,
      fade: 0.050,
      isFinal: false,
      room: 'Master Bedroom Suite',
      roomNum: '03 / 05',
    },
    {
      id: 'fenyx-stage-4',
      start: 0.70,
      end: 0.88,
      fade: 0.045,
      isFinal: false,
      room: 'Spa-Inspired Bathroom',
      roomNum: '04 / 05',
    },
    {
      id: 'fenyx-stage-5',
      start: 0.88,
      end: 1.00,
      fade: 0.040,
      isFinal: true,
      room: 'Fenyx Signature Atelier',
      roomNum: '05 / 05',
    },
  ];

  /* ─────────────────────────────────────────────────────────────────────────
   * EASING
   * ───────────────────────────────────────────────────────────────────────── */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * FRAME CACHE
   * Singleton object image store. Loaded images are never evicted.
   * ───────────────────────────────────────────────────────────────────────── */
  const FrameCache = (function () {
    const _cache = new Array(CFG.TOTAL_FRAMES).fill(null);
    const _ready = new Array(CFG.TOTAL_FRAMES).fill(false);

    function src(index) {
      let frameNum = index + 1;
      if (isMobile) {
        frameNum = (index * 2) + 1; // Stride by 2 (1, 3, 5...) to prevent 1.5GB RAM usage on mobile
      }
      const pad = String(frameNum).padStart(3, '0');
      return `${CFG.FRAME_PATH}${pad}${CFG.FRAME_EXT}`;
    }

    function get(index) { return _cache[index]; }
    function isReady(index) { return _ready[index]; }

    /**
     * Load a single frame. Returns a Promise<HTMLImageElement|null>.
     * Uses image.decode() for async off-main-thread decoding when available.
     */
    function load(index) {
      return new Promise(function (resolve) {
        // Already loaded
        if (_ready[index] && _cache[index]) {
          return resolve(_cache[index]);
        }

        var img = new Image();
        img.src = src(index);

        function onReady() {
          _cache[index] = img;
          _ready[index] = true;
          resolve(img);
        }

        if (typeof img.decode === 'function') {
          img.decode()
            .then(onReady)
            .catch(function () {
              // decode() failed — fall back to onload
              if (img.complete && img.naturalWidth) {
                onReady();
              } else {
                img.onload = onReady;
                img.onerror = function () { resolve(null); };
              }
            });
        } else {
          img.onload = onReady;
          img.onerror = function () { resolve(null); };
        }
      });
    }

    /**
     * Nearest-neighbour fallback: find closest loaded frame to targetIndex.
     * Guarantees zero blank frames during rapid scrubbing.
     */
    function nearest(targetIndex) {
      if (_ready[targetIndex] && _cache[targetIndex]) {
        return _cache[targetIndex];
      }
      for (var off = 1; off < CFG.TOTAL_FRAMES; off++) {
        var lo = targetIndex - off;
        if (lo >= 0 && _ready[lo] && _cache[lo]) return _cache[lo];
        var hi = targetIndex + off;
        if (hi < CFG.TOTAL_FRAMES && _ready[hi] && _cache[hi]) return _cache[hi];
      }
      return null;
    }

    return { load: load, get: get, isReady: isReady, nearest: nearest };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * FRAME LOADER
   * Two-phase loading:
   *   Phase 1 — priority burst: first PRIORITY_COUNT frames in parallel
   *   Phase 2 — background progressive: remaining frames via worker pool
   * ───────────────────────────────────────────────────────────────────────── */
  var FrameLoader = (function () {
    var _onFirstFrameReady = null;

    function _runWorkerPool(startIndex) {
      var cursor = startIndex;

      function next() {
        if (cursor >= CFG.TOTAL_FRAMES) return;
        var idx = cursor++;
        FrameCache.load(idx).then(function () { next(); });
      }

      for (var w = 0; w < CFG.CONCURRENCY; w++) {
        next();
      }
    }

    function start(onFirstReady) {
      _onFirstFrameReady = onFirstReady || null;

      // Phase 1a: Frame 0 — highest priority
      FrameCache.load(0).then(function (img) {
        if (img && typeof _onFirstFrameReady === 'function') {
          _onFirstFrameReady(img);
        }
      });

      // Phase 1b: Remaining priority frames 1…PRIORITY_COUNT
      var priorityBatch = [];
      for (var i = 1; i < Math.min(CFG.PRIORITY_COUNT, CFG.TOTAL_FRAMES); i++) {
        priorityBatch.push(FrameCache.load(i));
      }

      // Phase 2: Background remaining frames
      Promise.all(priorityBatch).then(function () {
        _runWorkerPool(CFG.PRIORITY_COUNT);
      });
    }

    return { start: start };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * CANVAS RENDERER
   * High-DPI, object-fit: cover, RAF-gated (skips redraw if same frame).
   * ───────────────────────────────────────────────────────────────────────── */
  var CanvasRenderer = (function () {
    var _canvas = null;
    var _ctx = null;
    var _cw = 0, _ch = 0;   // logical CSS pixels
    var _dpr = 1;
    var _lastFrame = -1;
    var _rafId = null;
    var _pendingFrame = 0;

    function init(canvas) {
      _canvas = canvas;
      _ctx = canvas.getContext('2d', { alpha: false });
      _ctx.imageSmoothingEnabled = true;
      _ctx.imageSmoothingQuality = 'high';
      resize();
    }

    function resize() {
      if (!_canvas) return;
      var parent = _canvas.parentElement || document.documentElement;
      var w = parent.clientWidth || window.innerWidth;
      var h = parent.clientHeight || window.innerHeight;
      _dpr = Math.min(window.devicePixelRatio || 1, CFG.MAX_DPR);
      _cw = w;
      _ch = h;
      _canvas.width = Math.round(w * _dpr);
      _canvas.height = Math.round(h * _dpr);
      _canvas.style.width = w + 'px';
      _canvas.style.height = h + 'px';
      _ctx.imageSmoothingEnabled = true;
      _ctx.imageSmoothingQuality = 'high';
      _lastFrame = -1; // Force redraw after resize
      _flush();
    }

    function _drawCover(img) {
      var cw = _canvas.width;
      var ch = _canvas.height;
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;

      var canvasRatio = cw / ch;
      var imgRatio = iw / ih;

      var dw, dh, dx, dy;
      if (canvasRatio > imgRatio) {
        dw = cw;
        dh = cw / imgRatio;
        dx = 0;
        dy = (ch - dh) / 2;
      } else {
        dh = ch;
        dw = ch * imgRatio;
        dx = (cw - dw) / 2;
        dy = 0;
      }

      _ctx.clearRect(0, 0, cw, ch);
      _ctx.drawImage(img, dx, dy, dw, dh);
    }

    function _flush() {
      if (!_ctx || !_canvas) return;
      var img = FrameCache.nearest(_pendingFrame);
      if (!img || !img.naturalWidth) return;
      _drawCover(img);
      _lastFrame = _pendingFrame;
    }

    function draw(frameIndex) {
      _pendingFrame = Math.max(0, Math.min(CFG.TOTAL_FRAMES - 1, Math.round(frameIndex)));

      // Skip RAF if frame hasn't changed
      if (_pendingFrame === _lastFrame) return;

      if (_rafId) return; // Already scheduled
      _rafId = requestAnimationFrame(function () {
        _rafId = null;
        _flush();
      });
    }

    return { init: init, resize: resize, draw: draw };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * TEXT OVERLAYS
   * Smooth fade + slight translateY driven by scroll progress.
   * ───────────────────────────────────────────────────────────────────────── */
  var TextOverlays = (function () {
    function update(progress) {
      TEXT_STAGES.forEach(function (stage) {
        var el = document.getElementById(stage.id);
        if (!el) return;

        var opacity = 0;
        var ty = 22;

        if (stage.isFinal) {
          // Final stage: fades in and stays fully visible at 100%
          if (progress >= stage.start) {
            var p = Math.min(1, (progress - stage.start) / stage.fade);
            opacity = easeOutCubic(p);
            ty = (1 - opacity) * 26;
          }
        } else {
          if (progress >= stage.start && progress <= stage.end) {
            var fadeInEnd = stage.start + stage.fade;
            var fadeOutStart = stage.end - stage.fade;

            if (progress < fadeInEnd) {
              // Fading in
              var p = (progress - stage.start) / stage.fade;
              opacity = easeOutCubic(p);
              ty = (1 - opacity) * 22;
            } else if (progress > fadeOutStart) {
              // Fading out
              var p = (stage.end - progress) / stage.fade;
              opacity = easeOutCubic(p);
              ty = -(1 - opacity) * 16;
            } else {
              opacity = 1;
              ty = 0;
            }
          }
        }

        el.style.opacity = opacity.toFixed(3);
        el.style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0)';
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
        el.setAttribute('aria-hidden', opacity < 0.05 ? 'true' : 'false');
      });
    }

    return { update: update };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * ROOM INDICATOR — bottom-left animated location tag
   * ───────────────────────────────────────────────────────────────────────── */
  var RoomIndicator = (function () {
    var _lastRoom = '';

    function update(progress) {
      var nameEl = document.getElementById(CFG.ROOM_NAME_ID);
      var numEl = document.getElementById(CFG.ROOM_NUM_ID);
      if (!nameEl || !numEl) return;

      var active = TEXT_STAGES[0]; // default
      for (var i = TEXT_STAGES.length - 1; i >= 0; i--) {
        if (progress >= TEXT_STAGES[i].start) {
          active = TEXT_STAGES[i];
          break;
        }
      }

      if (active.room !== _lastRoom) {
        nameEl.textContent = active.room;
        numEl.textContent = active.roomNum;
        _lastRoom = active.room;
      }
    }

    return { update: update };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * PROGRESS BAR
   * ───────────────────────────────────────────────────────────────────────── */
  var ProgressBar = (function () {
    var _el = null;
    function init() { _el = document.getElementById(CFG.PROGRESS_FILL_ID); }
    function update(p) { if (_el) _el.style.transform = 'scaleX(' + p + ')'; }
    return { init: init, update: update };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * SCROLL ENGINE — GSAP ScrollTrigger
   * ───────────────────────────────────────────────────────────────────────── */
  var ScrollEngine = (function () {
    function init(section, onProgress) {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[FenyxHero] GSAP / ScrollTrigger not loaded.');
        // Reduced fallback: show final stage
        onProgress(0.95);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // Prefers-reduced-motion: skip animation
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        onProgress(0);
        return;
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=' + CFG.SCROLL_DISTANCE,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: CFG.SCRUB,
        onUpdate: function (self) {
          onProgress(self.progress);
        },
      });
    }

    return { init: init };
  }());

  /* ─────────────────────────────────────────────────────────────────────────
   * LOADER OVERLAY — spinner shown until frame 0 renders
   * ───────────────────────────────────────────────────────────────────────── */
  function hideLoader() {
    var el = document.getElementById(CFG.LOADER_ID);
    if (!el) return;
    el.classList.add('fenyx-loader--out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * SCROLL CUE — fade out on first scroll
   * ───────────────────────────────────────────────────────────────────────── */
  function initScrollCue() {
    var cue = document.getElementById(CFG.SCROLL_CUE_ID);
    if (!cue) return;
    var removed = false;

    function onScroll() {
      if (removed) return;
      if (window.scrollY > 60) {
        cue.style.opacity = '0';
        removed = true;
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * HERO CONTROLLER — top-level orchestrator
   * ───────────────────────────────────────────────────────────────────────── */
  var HeroController = {
    _section: null,
    _canvas: null,

    init: function () {
      this._section = document.getElementById(CFG.SECTION_ID);
      this._canvas = document.getElementById(CFG.CANVAS_ID);

      if (!this._section || !this._canvas) {
        console.warn('[FenyxHero] Required DOM elements not found.');
        return;
      }

      // Initialize canvas renderer
      CanvasRenderer.init(this._canvas);

      // Progress bar
      ProgressBar.init();

      // Scroll cue
      initScrollCue();

      // Initial text state
      TextOverlays.update(0);
      RoomIndicator.update(0);

      // Start frame loading pipeline
      var self = this;
      FrameLoader.start(function onFirstFrameReady() {
        // Draw frame 0 and remove loader
        CanvasRenderer.draw(0);
        hideLoader();

        // Fire ScrollTrigger AFTER first frame is visible
        ScrollEngine.init(self._section, function onProgress(progress) {
          var frameIndex = progress * (CFG.TOTAL_FRAMES - 1);
          CanvasRenderer.draw(frameIndex);
          TextOverlays.update(progress);
          RoomIndicator.update(progress);
          ProgressBar.update(progress);
        });
      });

      // Responsive resize handler
      var resizeTimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          CanvasRenderer.resize();
        }, 120);
      }, { passive: true });
    },
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * BOOT
   * ───────────────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { HeroController.init(); });
  } else {
    HeroController.init();
  }

}(window));
