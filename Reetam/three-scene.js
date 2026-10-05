/**
 * Three.js 3D Interactive Scene - Saturn Core System & Polymath Geometries
 * Portfolio of Reetam Mukhopadhyay | Midnight Navy, Cobalt Blue & Bright Red
 */

class Portfolio3DScene {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Groups & Meshes
    this.coreGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.currentMesh = null;
    this.orbitalRings = [];
    this.nodes = [];
    this.saturnMoons = [];

    // Interaction State
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0.35; // Default tilt for Saturn
    this.targetRotationY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.activePresetIndex = 0;

    // Presets with Saturn as the flagship #1 core
    this.presets = [
      { name: 'Cosmic Saturn & Rings', type: 'saturn' },
      { name: 'EE Gyroscope & Signals', type: 'gyroscope' },
      { name: 'Polymath Crystal', type: 'crystal' },
      { name: 'Quantum Science Knot', type: 'torus' }
    ];

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 14);

    // 3. Renderer with high DPR and antialias
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting: Midnight Navy, Cobalt Blue, Bright Red
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0047ab, 2.0); // Cobalt Blue Sun
    keyLight.position.set(12, 14, 10);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x0a1931, 1.0); // Midnight Navy Fill
    fillLight.position.set(-12, -10, -5);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xef233c, 2.2, 40); // Bright Red Rim Glow
    rimLight.position.set(0, -6, 8);
    this.scene.add(rimLight);

    // 5. Build Initial Scene Elements
    this.scene.add(this.coreGroup);
    this.scene.add(this.particlesGroup);

    // Offset position to right side on desktop so it balances with hero text on the left
    if (window.innerWidth > 900) {
      this.coreGroup.position.set(3.2, 0.2, 0);
    } else {
      this.coreGroup.position.set(0, -1.5, -2);
    }

    this.createSpaceParticles();
    this.buildGeometryPreset(0);

    // 6. Bind Events
    this.bindEvents();

    // 7. Start Render Loop
    this.animate();
  }

  // Create procedural texture for Saturn's atmospheric bands
  createSaturnTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Gradient bands matching Midnight Navy, Cobalt Blue, and Red Accents
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, '#040914'); // North Pole Dark Navy
    grad.addColorStop(0.15, '#0047ab'); // Cobalt band
    grad.addColorStop(0.28, '#1e3a8a'); // Deep Blue
    grad.addColorStop(0.40, '#0a1931'); // Navy
    grad.addColorStop(0.48, '#ef233c'); // Bright Red Storm Stream
    grad.addColorStop(0.52, '#ff3366'); // Crimson Ribbon
    grad.addColorStop(0.60, '#1d4ed8'); // Cobalt
    grad.addColorStop(0.72, '#0c2340'); // Midnight Navy
    grad.addColorStop(0.85, '#0047ab'); // Cobalt band
    grad.addColorStop(1.00, '#040914'); // South Pole

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Add delicate storm swirl noise
    for (let i = 0; i < 60; i++) {
      const y = Math.random() * 512;
      const h = Math.random() * 8 + 2;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 71, 171, 0.4)' : 'rgba(239, 35, 60, 0.25)';
      ctx.fillRect(0, y, 512, h);
    }

    return new THREE.CanvasTexture(canvas);
  }

  // Create procedural texture for Saturn's Rings (Cassini Division & ring bands)
  createSaturnRingsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.00, 'rgba(0,0,0,0)');       // Inner gap
    grad.addColorStop(0.12, 'rgba(0,0,0,0)');
    grad.addColorStop(0.18, 'rgba(0,71,171,0.5)');   // Ring C (Cobalt)
    grad.addColorStop(0.35, 'rgba(147,197,253,0.85)');// Ring B (Bright Ice)
    grad.addColorStop(0.60, 'rgba(239,35,60,0.75)'); // Crimson Sheen
    grad.addColorStop(0.68, 'rgba(0,0,0,0)');        // Cassini Division Gap
    grad.addColorStop(0.73, 'rgba(0,71,171,0.7)');   // Ring A (Cobalt)
    grad.addColorStop(0.92, 'rgba(96,165,250,0.6)'); // Outer edge
    grad.addColorStop(1.00, 'rgba(0,0,0,0)');       // Space

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createSpaceParticles() {
    const count = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x0047ab), // Cobalt Blue
      new THREE.Color(0xef233c), // Bright Red
      new THREE.Color(0x38bdf8), // Cyan Star
      new THREE.Color(0xffffff)  // White Star
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26;
      positions[i3 + 1] = (Math.random() - 0.5) * 26;
      positions[i3 + 2] = (Math.random() - 0.5) * 18 - 2;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(96,165,250,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    this.particlesGroup.add(particles);
  }

  buildGeometryPreset(index) {
    // Clean old objects
    while (this.coreGroup.children.length > 0) {
      const obj = this.coreGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.coreGroup.remove(obj);
    }
    this.orbitalRings = [];
    this.nodes = [];
    this.saturnMoons = [];

    const preset = this.presets[index];

    // Shared Materials
    const outerGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x0047ab,
      emissive: 0xef233c,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.85
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0047ab,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    if (preset.type === 'saturn') {
      // ==========================================
      // 1. SATURN PLANET SYSTEM & GLOWING RINGS
      // ==========================================
      
      // Saturn Planet Body
      const saturnGeo = new THREE.SphereGeometry(1.8, 64, 64);
      const saturnTex = this.createSaturnTexture();
      const saturnMat = new THREE.MeshStandardMaterial({
        map: saturnTex,
        roughness: 0.4,
        metalness: 0.3,
        emissive: 0x002266,
        emissiveIntensity: 0.35
      });
      const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
      
      // Atmospheric Glow Layer (Fresnel)
      const atmoGeo = new THREE.SphereGeometry(1.86, 64, 64);
      const atmoMat = new THREE.MeshStandardMaterial({
        color: 0x0047ab,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);

      // Saturn Rings System
      const ringGeo = new THREE.RingGeometry(2.3, 4.4, 128);
      
      // Adjust Ring UVs for radial mapping
      const pos = ringGeo.attributes.position;
      const v3 = new THREE.Vector3();
      const uvs = ringGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        const radius = Math.sqrt(v3.x * v3.x + v3.y * v3.y);
        const normR = (radius - 2.3) / (4.4 - 2.3);
        uvs.setXY(i, normR, 0.5);
      }

      const ringTex = this.createSaturnRingsTexture();
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x001133,
        emissiveIntensity: 0.2
      });

      const ringsMesh = new THREE.Mesh(ringGeo, ringMat);
      ringsMesh.rotation.x = Math.PI / 2;

      // Outer Glowing Ringlet (Bright Red & Cobalt Accent)
      const haloRingGeo = new THREE.TorusGeometry(4.6, 0.025, 16, 120);
      const haloRingMat = new THREE.MeshStandardMaterial({
        color: 0xef233c,
        emissive: 0xef233c,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.75
      });
      const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
      haloRing.rotation.x = Math.PI / 2;

      // Group Saturn components with realistic axial tilt (~26.7 deg)
      const saturnSystem = new THREE.Group();
      saturnSystem.add(saturnMesh);
      saturnSystem.add(atmoMesh);
      saturnSystem.add(ringsMesh);
      saturnSystem.add(haloRing);
      saturnSystem.rotation.z = 0.45; // Realistic Saturn axial tilt
      saturnSystem.rotation.x = 0.35;

      this.coreGroup.add(saturnSystem);
      this.currentMesh = saturnMesh;
      this.orbitalRings.push(ringsMesh);
      this.saturnSystem = saturnSystem;

      // Orbiting Moons (Titan & Enceladus)
      const moon1Geo = new THREE.SphereGeometry(0.18, 16, 16);
      const moon1Mat = new THREE.MeshStandardMaterial({ color: 0xef233c, emissive: 0xef233c, emissiveIntensity: 0.9 });
      const moon1 = new THREE.Mesh(moon1Geo, moon1Mat);
      saturnSystem.add(moon1);
      this.saturnMoons.push({ mesh: moon1, radius: 5.2, speed: 0.6, angle: 0 });

      const moon2Geo = new THREE.SphereGeometry(0.12, 16, 16);
      const moon2Mat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x60a5fa, emissiveIntensity: 0.8 });
      const moon2 = new THREE.Mesh(moon2Geo, moon2Mat);
      saturnSystem.add(moon2);
      this.saturnMoons.push({ mesh: moon2, radius: 6.0, speed: 0.35, angle: Math.PI });

    } else if (preset.type === 'gyroscope') {
      // 2. Science & Electrical Engineering Gyroscope Rings
      const ringColors = [0x0047ab, 0xef233c, 0x0a1931];
      const radii = [2.8, 2.2, 1.6];

      radii.forEach((radius, i) => {
        const rGeo = new THREE.TorusGeometry(radius, 0.06, 16, 80);
        const rMat = new THREE.MeshStandardMaterial({
          color: ringColors[i],
          emissive: ringColors[i],
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.5
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = (i + 1) * 0.7;
        ring.rotation.y = (i + 1) * 0.5;
        this.coreGroup.add(ring);
        this.orbitalRings.push(ring);
      });

      const coreSphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const coreSphere = new THREE.Mesh(coreSphereGeo, innerCoreMat);
      this.coreGroup.add(coreSphere);
      this.currentMesh = coreSphere;

    } else if (preset.type === 'crystal') {
      // 3. Polymath Crystalline Icosahedron
      const geoOuter = new THREE.IcosahedronGeometry(2.4, 0);
      const outerMesh = new THREE.Mesh(geoOuter, outerGlassMat);

      const wireMesh = new THREE.Mesh(geoOuter, wireframeMat);
      wireMesh.scale.set(1.02, 1.02, 1.02);

      const geoInner = new THREE.OctahedronGeometry(1.2, 0);
      const innerMesh = new THREE.Mesh(geoInner, innerCoreMat);

      const ringGeo = new THREE.TorusGeometry(3.4, 0.04, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xef233c,
        emissive: 0xef233c,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;

      this.coreGroup.add(outerMesh);
      this.coreGroup.add(wireMesh);
      this.coreGroup.add(innerMesh);
      this.coreGroup.add(ring);
      this.orbitalRings.push(ring);
      this.currentMesh = outerMesh;

    } else if (preset.type === 'torus') {
      // 4. Torus Knot
      const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.45, 128, 32, 2, 3);
      const knotMesh = new THREE.Mesh(knotGeo, outerGlassMat);
      const knotWire = new THREE.Mesh(knotGeo, wireframeMat);
      knotWire.scale.set(1.01, 1.01, 1.01);

      this.coreGroup.add(knotMesh);
      this.coreGroup.add(knotWire);
      this.currentMesh = knotMesh;
    }

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        this.coreGroup.scale,
        { x: 0.7, y: 0.7, z: 0.7 },
        { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.7)' }
      );
    }
  }

  cyclePreset() {
    this.activePresetIndex = (this.activePresetIndex + 1) % this.presets.length;
    this.buildGeometryPreset(this.activePresetIndex);
    return this.presets[this.activePresetIndex].name;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      const aspect = window.innerWidth / window.innerHeight;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth > 900) {
        this.coreGroup.position.set(3.2, 0.2, 0);
      } else {
        this.coreGroup.position.set(0, -1.5, -2);
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetRotationY += deltaX * 0.008;
      this.targetRotationX += deltaY * 0.008;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetRotationY += deltaX * 0.008;
      this.targetRotationX += deltaY * 0.008;

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Smoothly interpolate core group rotation with mouse & drag
    this.coreGroup.rotation.y += (this.targetRotationY + this.mouseX * 0.4 - this.coreGroup.rotation.y) * 0.05;
    this.coreGroup.rotation.x += (this.targetRotationX + this.mouseY * 0.3 - this.coreGroup.rotation.x) * 0.05;

    // Automatic slow ambient planetary spin
    this.targetRotationY += 0.004;

    // Subtle floating wave
    this.coreGroup.position.y += (Math.sin(elapsedTime * 1.5) * 0.15 - (this.coreGroup.position.y - (window.innerWidth > 900 ? 0.2 : -1.5))) * 0.05;

    // Animate Saturn moons
    this.saturnMoons.forEach(moon => {
      const angle = elapsedTime * moon.speed + moon.angle;
      moon.mesh.position.x = Math.cos(angle) * moon.radius;
      moon.mesh.position.y = Math.sin(angle) * (moon.radius * 0.3);
      moon.mesh.position.z = Math.sin(angle) * moon.radius;
    });

    // Animate other orbital rings
    this.orbitalRings.forEach((ring, i) => {
      if (this.saturnSystem) {
        ring.rotation.z += 0.002;
      } else {
        ring.rotation.z += 0.01 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x += 0.008;
      }
    });

    // Space particles rotation
    this.particlesGroup.rotation.y = elapsedTime * 0.015;
    this.particlesGroup.rotation.x = Math.sin(elapsedTime * 0.01) * 0.08;

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate globally
window.portfolio3D = null;
document.addEventListener('DOMContentLoaded', () => {
  window.portfolio3D = new Portfolio3DScene();
});
