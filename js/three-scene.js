/* ==========================================================================
   FENYX INTERIORS — LUXURY 3D ARCHITECTURAL WEBGL CANVAS
   Interactive 3D Material Sculpture & Ambient Lighting (Three.js)
   ========================================================================== */

(function () {
  'use strict';

  const canvasContainer = document.getElementById('hero-3d-canvas');
  if (!canvasContainer) return;

  // Verify Three.js availability
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Falling back to ambient background.');
    return;
  }

  let scene, camera, renderer, compositionGroup;
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let isDragging = false, previousMousePosition = { x: 0, y: 0 };
  let isVisible = true;

  function init() {
    const width = canvasContainer.clientWidth || window.innerWidth * 0.55;
    const height = canvasContainer.clientHeight || window.innerHeight;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b0d, 0.045);

    // Camera
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    canvasContainer.appendChild(renderer.domElement);

    // Architectural Composition Group
    compositionGroup = new THREE.Group();
    scene.add(compositionGroup);

    buildArchitecturalSculpture();
    setupLighting();
    setupEventListeners();
    setupIntersectionObserver();

    animate();
  }

  function buildArchitecturalSculpture() {
    // Luxury Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.2
    });

    const travertineMaterial = new THREE.MeshStandardMaterial({
      color: 0xded8cc,
      metalness: 0.05,
      roughness: 0.68
    });

    const charcoalMatteMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      metalness: 0.2,
      roughness: 0.85
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
      ior: 1.5
    });

    // 1. Base Pedestal Slab (Travertine stone)
    const baseGeo = new THREE.BoxGeometry(2.4, 0.12, 1.8);
    const baseMesh = new THREE.Mesh(baseGeo, travertineMaterial);
    baseMesh.position.y = -1.1;
    baseMesh.receiveShadow = true;
    compositionGroup.add(baseMesh);

    // 2. Monolithic Architectural Column / Slab (Charcoal)
    const monolithGeo = new THREE.BoxGeometry(0.7, 2.2, 0.45);
    const monolithMesh = new THREE.Mesh(monolithGeo, charcoalMatteMaterial);
    monolithMesh.position.set(-0.65, 0.05, -0.2);
    monolithMesh.castShadow = true;
    monolithMesh.receiveShadow = true;
    compositionGroup.add(monolithMesh);

    // 3. Fluted Gold Accent Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 32);
    const pillarMesh = new THREE.Mesh(pillarGeo, goldMaterial);
    pillarMesh.position.set(0.6, -0.05, 0.2);
    pillarMesh.castShadow = true;
    compositionGroup.add(pillarMesh);

    // 4. Floating Luxury Brass Ring / Torus
    const torusGeo = new THREE.TorusGeometry(0.85, 0.035, 24, 64);
    const torusMesh = new THREE.Mesh(torusGeo, goldMaterial);
    torusMesh.position.set(0.1, 0.35, 0.1);
    torusMesh.rotation.x = Math.PI / 3;
    torusMesh.rotation.y = Math.PI / 6;
    torusMesh.castShadow = true;
    compositionGroup.add(torusMesh);

    // 5. Floating Smoked Glass Cantilever Plate
    const glassGeo = new THREE.BoxGeometry(1.6, 0.04, 1.1);
    const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
    glassMesh.position.set(0.2, 0.65, 0.3);
    glassMesh.rotation.y = -Math.PI / 10;
    glassMesh.rotation.z = Math.PI / 36;
    compositionGroup.add(glassMesh);

    // 6. Floating Sphere (Orb of Interior Illumination)
    const sphereGeo = new THREE.SphereGeometry(0.26, 32, 32);
    const sphereMesh = new THREE.Mesh(sphereGeo, goldMaterial);
    sphereMesh.position.set(0.2, 1.15, 0.15);
    sphereMesh.castShadow = true;
    compositionGroup.add(sphereMesh);
  }

  function setupLighting() {
    // Ambient Light (Warm moody fill)
    const ambientLight = new THREE.AmbientLight(0xf5e8d3, 0.8);
    scene.add(ambientLight);

    // Key Light (Warm Champagne Directional)
    const keyLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Rim / Backlight (Cool subtle edge contrast)
    const rimLight = new THREE.DirectionalLight(0xc5a059, 1.5);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Point Light (Soft glow near floating sphere)
    const pointLight = new THREE.PointLight(0xdfc082, 1.2, 6);
    pointLight.position.set(0.2, 1.2, 0.3);
    scene.add(pointLight);
  }

  function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);

    // Mouse Move Parallax
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Touch & Mouse Drag on Canvas
    const el = renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }

  function onWindowResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const width = canvasContainer.clientWidth || window.innerWidth * 0.55;
    const height = canvasContainer.clientHeight || window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    observer.observe(canvasContainer);
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const elapsedTime = clock.getElapsedTime();

    // Subtle breathing floating movement
    compositionGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;

    // Smooth rotation interpolation
    const ease = 0.05;
    const defaultRotation = Math.sin(elapsedTime * 0.2) * 0.15;

    compositionGroup.rotation.y += (targetRotationY + mouseX * 0.25 + defaultRotation - compositionGroup.rotation.y) * ease;
    compositionGroup.rotation.x += (targetRotationX + mouseY * 0.15 - compositionGroup.rotation.x) * ease;

    renderer.render(scene, camera);
  }

  // Start after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
