import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  RotateCw,
  Compass,
  Layers,
  Sun,
  Moon,
  Eye,
  Ship,
  Anchor,
  Activity,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Vessel3DViewerProps {
  vesselName?: string;
  imo?: string;
  teu?: number;
  loa?: number;
  draught?: number;
  berth?: string;
  status?: string;
  className?: string;
  compact?: boolean;
}

export const Vessel3DViewer: React.FC<Vessel3DViewerProps> = ({
  vesselName = 'Ocean Star',
  imo = '9811002',
  teu = 15200,
  loa = 366,
  draught = 15.2,
  berth = 'Berth B02',
  status = 'Berthing Optimized',
  className = '',
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [cameraView, setCameraView] = useState<'iso' | 'side' | 'top' | 'bow'>('iso');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const radarRef = useRef<THREE.Mesh | null>(null);
  const oceanRef = useRef<THREE.Mesh | null>(null);
  const shipGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dir: THREE.DirectionalLight;
    deckLights: THREE.PointLight[];
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 18, 32);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x223344 : 0xffffff,
      isDark ? 1.2 : 1.8
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      isDark ? 0x66aacc : 0xfffaed,
      isDark ? 1.5 : 2.4
    );
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Deck & Nav Spotlights
    const deckLight1 = new THREE.PointLight(0x00ffff, isDark ? 2.5 : 0.8, 25);
    deckLight1.position.set(-8, 6, 0);
    scene.add(deckLight1);

    const deckLight2 = new THREE.PointLight(0x35c98b, isDark ? 2.5 : 0.8, 25);
    deckLight2.position.set(10, 6, 0);
    scene.add(deckLight2);

    lightsRef.current = {
      ambient: ambientLight,
      dir: dirLight,
      deckLights: [deckLight1, deckLight2],
    };

    // 5. Build 3D Container Vessel
    const shipGroup = new THREE.Group();
    shipGroupRef.current = shipGroup;

    // Materials helper
    const mats: THREE.Material[] = [];
    materialsRef.current = mats;

    const createMat = (color: number, roughness = 0.4, metalness = 0.2) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        wireframe: isWireframe,
      });
      mats.push(m);
      return m;
    };

    const hullMat = createMat(0x0f2231, 0.5, 0.4); // Dark slate hull
    const redWaterlineMat = createMat(0xbe2525, 0.4, 0.3); // Red keel
    const deckMat = createMat(0x243b4d, 0.6, 0.2); // Deck plate
    const bridgeMat = createMat(0xedf2f7, 0.2, 0.1); // White superstructure
    const glassMat = createMat(0x19c3c8, 0.1, 0.9); // Tinted cyan bridge glass
    const funnelMat = createMat(0x0ea5a8, 0.3, 0.5); // Teal funnel

    // --- Main Hull ---
    // Lower Keel (Red)
    const keelGeo = new THREE.BoxGeometry(28, 2.2, 7.5);
    const keelMesh = new THREE.Mesh(keelGeo, redWaterlineMat);
    keelMesh.position.y = 0.8;
    keelMesh.castShadow = true;
    keelMesh.receiveShadow = true;
    shipGroup.add(keelMesh);

    // Upper Hull (Slate Blue)
    const upperHullGeo = new THREE.BoxGeometry(28.4, 3.2, 8.0);
    const upperHullMesh = new THREE.Mesh(upperHullGeo, hullMat);
    upperHullMesh.position.y = 2.8;
    upperHullMesh.castShadow = true;
    upperHullMesh.receiveShadow = true;
    shipGroup.add(upperHullMesh);

    // Bow Taper (Front Wedge)
    const bowShape = new THREE.Shape();
    bowShape.moveTo(0, -4.0);
    bowShape.lineTo(6.5, 0);
    bowShape.lineTo(0, 4.0);
    bowShape.closePath();

    const extrudeSettings = { depth: 5.4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
    const bowGeo = new THREE.ExtrudeGeometry(bowShape, extrudeSettings);
    const bowMesh = new THREE.Mesh(bowGeo, hullMat);
    bowMesh.rotation.x = Math.PI / 2;
    bowMesh.rotation.z = Math.PI / 2;
    bowMesh.position.set(14.0, 5.0, 0);
    bowMesh.castShadow = true;
    shipGroup.add(bowMesh);

    // Bulbous Bow (Underwater forward protrusion)
    const bulbousGeo = new THREE.SphereGeometry(1.6, 16, 16);
    bulbousGeo.scale(2.2, 1, 1);
    const bulbousMesh = new THREE.Mesh(bulbousGeo, redWaterlineMat);
    bulbousMesh.position.set(15.5, 0.8, 0);
    shipGroup.add(bulbousMesh);

    // Deck Surface
    const deckGeo = new THREE.BoxGeometry(26, 0.3, 7.4);
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = 4.5;
    deckMesh.receiveShadow = true;
    shipGroup.add(deckMesh);

    // --- Bridge Superstructure (Stern Accommodation Block) ---
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-9.5, 4.6, 0);

    // Tier 1 Block
    const bTier1Geo = new THREE.BoxGeometry(4.8, 3.0, 6.2);
    const bTier1 = new THREE.Mesh(bTier1Geo, bridgeMat);
    bTier1.position.y = 1.5;
    bTier1.castShadow = true;
    bridgeGroup.add(bTier1);

    // Tier 2 (Bridge Deck & Windows)
    const bTier2Geo = new THREE.BoxGeometry(4.2, 1.8, 7.4);
    const bTier2 = new THREE.Mesh(bTier2Geo, bridgeMat);
    bTier2.position.y = 3.8;
    bTier2.castShadow = true;
    bridgeGroup.add(bTier2);

    // Bridge Glazing Ribbon
    const glassGeo = new THREE.BoxGeometry(4.3, 0.7, 7.5);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 3.9;
    bridgeGroup.add(glassMesh);

    // Exhaust Funnel Stack
    const funnelGeo = new THREE.CylinderGeometry(0.8, 1.0, 3.2, 12);
    const funnelMesh = new THREE.Mesh(funnelGeo, funnelMat);
    funnelMesh.position.set(-1.4, 5.8, 0);
    funnelMesh.rotation.z = -0.15;
    bridgeGroup.add(funnelMesh);

    // Radar Mast
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.18, 3.5, 8);
    const mastMesh = new THREE.Mesh(mastGeo, bridgeMat);
    mastMesh.position.set(0.6, 6.0, 0);
    bridgeGroup.add(mastMesh);

    // Rotating Radar Scanner
    const radarGeo = new THREE.BoxGeometry(1.8, 0.2, 0.3);
    const radarMesh = new THREE.Mesh(radarGeo, createMat(0x0ea5a8, 0.2, 0.8));
    radarMesh.position.set(0.6, 7.7, 0);
    radarRef.current = radarMesh;
    bridgeGroup.add(radarMesh);

    shipGroup.add(bridgeGroup);

    // --- Container Stacks (Multi-tier TEU Blocks) ---
    const containerColors = [
      0x0ea5a8, // Teal / Maersk
      0x168a63, // Evergreen Green
      0xd97706, // Hapag Orange / Amber
      0x3b82f6, // Ocean Blue
      0xf1f5f9, // Reefer White
      0xd64545, // Alert Crimson
    ];

    const containerGroup = new THREE.Group();
    containerGroup.position.set(0, 4.65, 0);

    const cWidth = 3.6;
    const cLength = 1.6;
    const cHeight = 1.3;

    // 5 Bays along the ship
    for (let bay = 0; bay < 5; bay++) {
      const posX = -5.0 + bay * 3.8;
      // 3 Rows across
      for (let row = -1; row <= 1; row++) {
        const posZ = row * 2.1;
        // 2 to 3 tiers high
        const maxTier = bay === 4 ? 2 : 3;
        for (let tier = 0; tier < maxTier; tier++) {
          const posY = tier * (cHeight + 0.05) + cHeight / 2;
          const colorIdx = (bay * 3 + Math.abs(row) * 2 + tier) % containerColors.length;
          const cMat = createMat(containerColors[colorIdx], 0.6, 0.1);

          const cGeo = new THREE.BoxGeometry(cWidth - 0.2, cHeight, cLength - 0.15);
          const cMesh = new THREE.Mesh(cGeo, cMat);
          cMesh.position.set(posX, posY, posZ);
          cMesh.castShadow = true;
          cMesh.receiveShadow = true;
          containerGroup.add(cMesh);
        }
      }
    }
    shipGroup.add(containerGroup);

    // --- STS Quayside Crane Model (Dockside Loading Arm) ---
    const craneGroup = new THREE.Group();
    craneGroup.position.set(4.0, 0, -13.0);

    const craneMat = createMat(0xf59e0b, 0.4, 0.5); // Industrial yellow
    const craneWhiteMat = createMat(0xffffff, 0.3, 0.1);

    // Crane Legs
    const legGeo = new THREE.BoxGeometry(0.8, 14, 0.8);
    [-3, 3].forEach((lx) => {
      [-2, 2].forEach((lz) => {
        const leg = new THREE.Mesh(legGeo, craneMat);
        leg.position.set(lx, 7, lz);
        leg.castShadow = true;
        craneGroup.add(leg);
      });
    });

    // Overhead Boom
    const boomGeo = new THREE.BoxGeometry(1.4, 1.4, 26);
    const boom = new THREE.Mesh(boomGeo, craneMat);
    boom.position.set(0, 14, 6);
    boom.castShadow = true;
    craneGroup.add(boom);

    // Trolley & Spreader Spreader
    const trolleyGeo = new THREE.BoxGeometry(2.0, 0.8, 2.0);
    const trolley = new THREE.Mesh(trolleyGeo, craneWhiteMat);
    trolley.position.set(0, 13.0, 10.5);
    craneGroup.add(trolley);

    shipGroup.add(craneGroup);

    // --- Dynamic Ocean Water Mesh ---
    const oceanGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x072233 : 0x1d6688,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88,
    });
    mats.push(oceanMat);

    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 1.0;
    ocean.receiveShadow = true;
    oceanRef.current = ocean;
    scene.add(ocean);

    scene.add(shipGroup);

    // 6. Interaction Controls (Mouse Drag Orbit & Touch)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 46, theta: Math.PI / 4, phi: Math.PI / 3.4 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 3, 0);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(18, Math.min(85, spherical.radius + e.deltaY * 0.04));
      updateCameraFromSpherical();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate Radar Scanner
      if (radarRef.current) {
        radarRef.current.rotation.y = elapsedTime * 4.0;
      }

      // Gentle Ship Buoyancy & Roll Motion
      if (shipGroupRef.current) {
        shipGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.18;
        shipGroupRef.current.rotation.z = Math.sin(elapsedTime * 1.2) * 0.012;
        shipGroupRef.current.rotation.x = Math.cos(elapsedTime * 1.0) * 0.008;

        if (isAutoRotate && !isDragging) {
          spherical.theta += 0.003;
          updateCameraFromSpherical();
        }
      }

      // Ocean wave animation
      if (oceanRef.current) {
        const positionAttr = (oceanRef.current.geometry as THREE.PlaneGeometry).attributes.position;
        for (let i = 0; i < positionAttr.count; i++) {
          const u = positionAttr.getX(i);
          const v = positionAttr.getY(i);
          const waveZ = Math.sin(u * 0.2 + elapsedTime * 2.0) * 0.15 + Math.cos(v * 0.2 + elapsedTime * 1.5) * 0.15;
          positionAttr.setZ(i, waveZ);
        }
        positionAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 340;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Update Wireframe mode
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.wireframe = isWireframe;
      }
    });
  }, [isWireframe]);

  // Handle preset camera views
  const handleSetView = (view: 'iso' | 'side' | 'top' | 'bow') => {
    setCameraView(view);
    if (!cameraRef.current) return;
    setIsAutoRotate(false);

    if (view === 'iso') {
      cameraRef.current.position.set(28, 18, 32);
    } else if (view === 'side') {
      cameraRef.current.position.set(0, 10, 44);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, 48, 2);
    } else if (view === 'bow') {
      cameraRef.current.position.set(38, 8, 0);
    }
    cameraRef.current.lookAt(0, 3, 0);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border-subtle bg-surface transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : className
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className={`w-full relative cursor-grab active:cursor-grabbing select-none ${
          isFullscreen ? 'flex-1 h-full' : compact ? 'h-64' : 'h-[360px] lg:h-[400px]'
        }`}
      />

      {/* Top HUD Overlay Banner */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Vessel Badge & Telemetry */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-card text-xs">
          <div className="w-7 h-7 rounded-lg bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-text-main flex items-center gap-1.5">
              <span>{vesselName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-teal/10 text-brand-teal border border-brand-teal/20 font-semibold">
                IMO {imo}
              </span>
            </div>
            <div className="text-[10px] text-text-muted flex items-center gap-2 mt-0.5">
              <span>LOA: {loa}m</span>
              <span>•</span>
              <span>Draft: {draught}m</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">{status}</span>
            </div>
          </div>
        </div>

        {/* Live Quayside Radar Indicator */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
          <span className="text-text-main font-semibold">{berth}</span>
          <span className="text-[10px] text-text-muted">Digital Twin 3D</span>
        </div>
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Preset Angle Selectors */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl glass-card">
          {(['iso', 'side', 'top', 'bow'] as const).map((view) => (
            <button
              key={view}
              onClick={() => handleSetView(view)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                cameraView === view
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Interactive Utility Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl glass-card">
          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotate((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isAutoRotate ? 'bg-brand-teal/15 text-brand-teal' : 'text-text-muted hover:text-text-main'
            }`}
            title={isAutoRotate ? 'Pause Rotation' : 'Enable Auto-Rotate'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Wireframe / Solid Mode */}
          <button
            onClick={() => setIsWireframe((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isWireframe ? 'bg-brand-teal/15 text-brand-teal' : 'text-text-muted hover:text-text-main'
            }`}
            title={isWireframe ? 'Solid Render' : 'Wireframe Digital Mesh'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Inspection'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
