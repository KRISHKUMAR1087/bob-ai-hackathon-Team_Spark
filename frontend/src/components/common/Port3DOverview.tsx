import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Maximize2,
  Minimize2,
  Anchor
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Port3DOverviewProps {
  className?: string;
  heightClass?: string;
}

export const Port3DOverview: React.FC<Port3DOverviewProps> = ({
  className = '',
  heightClass = 'h-[440px] sm:h-[500px] lg:h-[560px]',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [activeView, setActiveView] = useState<'aerial' | 'ship' | 'cranes' | 'yard' | 'entrance'>('aerial');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const oceanRef = useRef<THREE.Mesh | null>(null);
  const radarRef = useRef<THREE.Mesh | null>(null);
  const beaconLightRef = useRef<THREE.PointLight | null>(null);
  const trucksRef = useRef<THREE.Group[]>([]);
  const craneSpreaderRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Scene & Fog Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x071a24 : 0xe0f2fe, isDark ? 0.005 : 0.0035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 1200);
    camera.position.set(65, 45, 75);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1e3a5f : 0xffffff,
      isDark ? 1.4 : 2.0
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      isDark ? 0x70b0ff : 0xfff7e6,
      isDark ? 1.8 : 2.8
    );
    sunLight.position.set(70, 90, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -90;
    sunLight.shadow.camera.right = 90;
    sunLight.shadow.camera.top = 90;
    sunLight.shadow.camera.bottom = -90;
    scene.add(sunLight);

    // Night Quayside Floodlights & Navigation Lights
    const dockLight1 = new THREE.PointLight(0x0ea5a8, isDark ? 4.0 : 1.0, 60);
    dockLight1.position.set(10, 18, 0);
    scene.add(dockLight1);

    const dockLight2 = new THREE.PointLight(0x38bdf8, isDark ? 4.0 : 1.0, 60);
    dockLight2.position.set(-25, 18, 0);
    scene.add(dockLight2);

    const beaconLight = new THREE.PointLight(0x10b981, isDark ? 5.0 : 1.5, 45);
    beaconLight.position.set(55, 16, 40);
    beaconLightRef.current = beaconLight;
    scene.add(beaconLight);

    // Helper to create standard materials
    const makeMat = (color: number, roughness = 0.5, metalness = 0.2) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    const concreteMat = makeMat(isDark ? 0x1e293b : 0x94a3b8, 0.8, 0.1);
    const asphaltMat = makeMat(isDark ? 0x0f172a : 0x475569, 0.9, 0.05);
    const yellowStripeMat = makeMat(0xf59e0b, 0.3, 0.2);
    const darkNavyHullMat = makeMat(0x071e2e, 0.4, 0.5);
    const redKeelMat = makeMat(0xc53030, 0.4, 0.2);
    const superstructureMat = makeMat(0xf8fafc, 0.3, 0.1);
    const bridgeGlassMat = makeMat(0x0284c7, 0.1, 0.9);
    const craneOrangeMat = makeMat(0xf97316, 0.3, 0.4);
    const craneWhiteMat = makeMat(0xffffff, 0.3, 0.1);
    const rtgBlueMat = makeMat(0x2563eb, 0.4, 0.3);

    const containerPalette = [
      0x0ea5a8, // Teal (Maersk)
      0x168a63, // Emerald (Evergreen)
      0xea580c, // Deep Orange (Hapag-Lloyd)
      0x2563eb, // Royal Blue (CMA CGM)
      0xf8fafc, // Pure White (Reefer Cold-Chain)
      0xd97706, // Industrial Amber
      0x9333ea, // Purple (ONE)
      0xdc2626, // Crimson Alert
    ];

    // ==========================================
    // 5. BUILD COMPLETE 3D PORT ENVIRONMENT
    // ==========================================
    const portGroup = new THREE.Group();

    // A. Quayside Concrete Wharf (Dock Wall)
    const wharfGeo = new THREE.BoxGeometry(110, 4.0, 48);
    const wharf = new THREE.Mesh(wharfGeo, concreteMat);
    wharf.position.set(5, 2.0, -25);
    wharf.receiveShadow = true;
    wharf.castShadow = true;
    portGroup.add(wharf);

    // Terminal Asphalt Access Road
    const roadGeo = new THREE.BoxGeometry(108, 0.15, 14);
    const road = new THREE.Mesh(roadGeo, asphaltMat);
    road.position.set(5, 4.08, -12);
    road.receiveShadow = true;
    portGroup.add(road);

    // Quayside Caution Edge Stripe (Hazard Yellow)
    const edgeGeo = new THREE.BoxGeometry(110, 0.2, 0.8);
    const edge = new THREE.Mesh(edgeGeo, yellowStripeMat);
    edge.position.set(5, 4.1, -1.4);
    portGroup.add(edge);

    // Quayside Crane Rails
    [-2.2, -8.5].forEach((zPos) => {
      const railGeo = new THREE.BoxGeometry(108, 0.12, 0.3);
      const rail = new THREE.Mesh(railGeo, makeMat(0x64748b, 0.2, 0.8));
      rail.position.set(5, 4.12, zPos);
      portGroup.add(rail);
    });

    // Dockside Mooring Bollards along the quay
    for (let bx = -45; bx <= 55; bx += 10) {
      const bollardGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12);
      const bollard = new THREE.Mesh(bollardGeo, makeMat(0x0f172a, 0.3, 0.7));
      bollard.position.set(bx, 4.4, -1.8);
      bollard.castShadow = true;
      portGroup.add(bollard);
    }

    // B. Giant Ultra Large Container Vessel (ULCV Mega-Ship: MV Ocean Star)
    const megaShip = new THREE.Group();
    megaShip.position.set(8, 0, 7.5); // Docked right along the quay

    // Lower Keel (Crimson)
    const keelGeo = new THREE.BoxGeometry(68, 3.2, 12.8);
    const keel = new THREE.Mesh(keelGeo, redKeelMat);
    keel.position.y = 1.6;
    keel.castShadow = true;
    keel.receiveShadow = true;
    megaShip.add(keel);

    // Upper Hull (Dark Navy)
    const hullGeo = new THREE.BoxGeometry(68.5, 4.4, 13.4);
    const hull = new THREE.Mesh(hullGeo, darkNavyHullMat);
    hull.position.y = 4.4;
    hull.castShadow = true;
    hull.receiveShadow = true;
    megaShip.add(hull);

    // Bulbous Bow (Front hydrodynamic bulb)
    const bulbGeo = new THREE.SphereGeometry(2.4, 16, 16);
    bulbGeo.scale(2.5, 1, 1);
    const bulb = new THREE.Mesh(bulbGeo, redKeelMat);
    bulb.position.set(36, 1.6, 0);
    megaShip.add(bulb);

    // Bow Flare Wedge (Front aerodynamic tapered bow)
    const bowShape = new THREE.Shape();
    bowShape.moveTo(0, -6.7);
    bowShape.lineTo(9.5, 0);
    bowShape.lineTo(0, 6.7);
    bowShape.closePath();

    const bowExtrude = new THREE.ExtrudeGeometry(bowShape, { depth: 7.6, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.2 });
    const bowMesh = new THREE.Mesh(bowExtrude, darkNavyHullMat);
    bowMesh.rotation.x = Math.PI / 2;
    bowMesh.rotation.z = Math.PI / 2;
    bowMesh.position.set(34.2, 7.6, 0);
    bowMesh.castShadow = true;
    megaShip.add(bowMesh);

    // Ship Main Deck Plate
    const deckGeo = new THREE.BoxGeometry(64, 0.4, 12.8);
    const shipDeck = new THREE.Mesh(deckGeo, makeMat(0x1e293b, 0.7, 0.2));
    shipDeck.position.y = 6.6;
    shipDeck.receiveShadow = true;
    megaShip.add(shipDeck);

    // Towering Superstructure (Stern Navigation Accommodation Block)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-22, 6.8, 0);

    // Lower Accommodation block (Decks 1-4)
    const bridgeLowerGeo = new THREE.BoxGeometry(9.5, 5.8, 11.2);
    const bridgeLower = new THREE.Mesh(bridgeLowerGeo, superstructureMat);
    bridgeLower.position.y = 2.9;
    bridgeLower.castShadow = true;
    bridgeGroup.add(bridgeLower);

    // Upper Bridge Deck with Navigation Wings
    const bridgeUpperGeo = new THREE.BoxGeometry(8.2, 2.8, 14.2);
    const bridgeUpper = new THREE.Mesh(bridgeUpperGeo, superstructureMat);
    bridgeUpper.position.y = 6.8;
    bridgeUpper.castShadow = true;
    bridgeGroup.add(bridgeUpper);

    // Panoramic Bridge Glass Ribbon
    const bridgeGlazingGeo = new THREE.BoxGeometry(8.4, 1.1, 14.4);
    const bridgeGlazing = new THREE.Mesh(bridgeGlazingGeo, bridgeGlassMat);
    bridgeGlazing.position.y = 7.0;
    bridgeGroup.add(bridgeGlazing);

    // Exhaust Funnel Stack (Teal with brand band)
    const funnelGeo = new THREE.CylinderGeometry(1.4, 1.8, 5.5, 16);
    const funnel = new THREE.Mesh(funnelGeo, makeMat(0x0ea5a8, 0.3, 0.4));
    funnel.position.set(-2.8, 9.8, 0);
    funnel.rotation.z = -0.12;
    funnel.castShadow = true;
    bridgeGroup.add(funnel);

    // Radar Mast & Rotating Scanner
    const mastGeo = new THREE.CylinderGeometry(0.2, 0.3, 6.0, 8);
    const mast = new THREE.Mesh(mastGeo, superstructureMat);
    mast.position.set(1.5, 10.2, 0);
    bridgeGroup.add(mast);

    const radarGeo = new THREE.BoxGeometry(3.2, 0.35, 0.5);
    const radar = new THREE.Mesh(radarGeo, makeMat(0x0ea5a8, 0.2, 0.8));
    radar.position.set(1.5, 13.0, 0);
    radarRef.current = radar;
    bridgeGroup.add(radar);

    megaShip.add(bridgeGroup);

    // Dense Mega-Ship Container Bays (Hundreds of TEU containers in 8 bays)
    const shipContainersGroup = new THREE.Group();
    shipContainersGroup.position.set(0, 6.8, 0);

    const cW = 4.8;
    const cL = 2.4;
    const cH = 1.9;

    for (let bay = 0; bay < 8; bay++) {
      const posX = -13.5 + bay * 5.6;
      for (let row = -2; row <= 2; row++) {
        const posZ = row * 2.5;
        const maxTier = (bay >= 6 && Math.abs(row) === 2) ? 2 : (bay === 7 ? 3 : 4);
        for (let tier = 0; tier < maxTier; tier++) {
          const posY = tier * (cH + 0.06) + cH / 2;
          const colorIdx = (bay * 5 + Math.abs(row) * 3 + tier * 2) % containerPalette.length;
          const cGeo = new THREE.BoxGeometry(cW - 0.2, cH, cL - 0.15);
          const cMesh = new THREE.Mesh(cGeo, makeMat(containerPalette[colorIdx], 0.6, 0.1));
          cMesh.position.set(posX, posY, posZ);
          cMesh.castShadow = true;
          cMesh.receiveShadow = true;
          shipContainersGroup.add(cMesh);
        }
      }
    }
    megaShip.add(shipContainersGroup);
    portGroup.add(megaShip);

    // C. 4 Giant STS (Ship-to-Shore) Quayside Gantry Cranes
    const cranePositionsX = [-18, -2, 14, 30];
    cranePositionsX.forEach((cx, idx) => {
      const crane = new THREE.Group();
      crane.position.set(cx, 4.0, -5.5);

      // 4 Heavy Lattice Gantry Legs
      [-3.2, 3.2].forEach((lx) => {
        [-2.5, 2.5].forEach((lz) => {
          const legGeo = new THREE.BoxGeometry(1.1, 22, 1.1);
          const leg = new THREE.Mesh(legGeo, craneOrangeMat);
          leg.position.set(lx, 11, lz);
          leg.castShadow = true;
          crane.add(leg);
        });
      });

      // Upper Cross Bracing & Machinery Portal
      const portalGeo = new THREE.BoxGeometry(8.2, 3.0, 7.0);
      const portal = new THREE.Mesh(portalGeo, craneWhiteMat);
      portal.position.set(0, 22, 0);
      portal.castShadow = true;
      crane.add(portal);

      // Overhead Boom Arm extending over the Mega-Ship deck
      const boomGeo = new THREE.BoxGeometry(2.4, 2.4, 36);
      const boom = new THREE.Mesh(boomGeo, craneOrangeMat);
      boom.position.set(0, 24, 11);
      boom.castShadow = true;
      crane.add(boom);

      // Crane Operator Cab & Trolley
      const trolleyGeo = new THREE.BoxGeometry(3.0, 1.2, 3.0);
      const trolley = new THREE.Mesh(trolleyGeo, craneWhiteMat);
      trolley.position.set(0, 22.2, 12);
      crane.add(trolley);

      // Active Spreader on Crane 2 (loading a container in mid-air!)
      if (idx === 1) {
        const spreaderGroup = new THREE.Group();
        spreaderGroup.position.set(0, 15.5, 12);

        // Spreader Cables
        const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 6.0);
        [-1.2, 1.2].forEach((caX) => {
          const cable = new THREE.Mesh(cableGeo, makeMat(0x0f172a, 0.2, 0.9));
          cable.position.set(caX, 3.0, 0);
          spreaderGroup.add(cable);
        });

        // Suspended 40ft TEU Container (Teal)
        const suspendedCGeo = new THREE.BoxGeometry(4.8, 1.9, 2.4);
        const suspendedC = new THREE.Mesh(suspendedCGeo, makeMat(0x0ea5a8, 0.5, 0.2));
        suspendedC.position.y = 0;
        suspendedC.castShadow = true;
        spreaderGroup.add(suspendedC);

        craneSpreaderRef.current = spreaderGroup;
        crane.add(spreaderGroup);
      }

      portGroup.add(crane);
    });

    // D. Sprawling Container Storage Yard (CY-01 to CY-04)
    const yardGroup = new THREE.Group();
    yardGroup.position.set(0, 4.15, -34);

    // 4 Yard Blocks
    for (let block = 0; block < 4; block++) {
      const blockX = -36 + block * 24;
      for (let stackRow = 0; stackRow < 5; stackRow++) {
        const stackZ = -4.5 + stackRow * 2.4;
        for (let stackCol = 0; stackCol < 4; stackCol++) {
          const stackX = blockX + stackCol * 4.5;
          const maxStack = Math.floor(Math.random() * 2) + 3; // 3-4 tiers
          for (let tier = 0; tier < maxStack; tier++) {
            const yPos = tier * 1.95 + 0.95;
            const cColor = containerPalette[(block * 7 + stackRow * 3 + stackCol * 2 + tier) % containerPalette.length];
            const cBox = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.9, 2.2), makeMat(cColor, 0.6, 0.1));
            cBox.position.set(stackX, yPos, stackZ);
            cBox.castShadow = true;
            cBox.receiveShadow = true;
            yardGroup.add(cBox);
          }
        }
      }

      // RTG (Rubber Tyred Gantry) Yard Crane over each block
      const rtg = new THREE.Group();
      rtg.position.set(blockX + 6.8, 0, 0);

      const rtgLegGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
      [-8.5, 8.5].forEach((rx) => {
        [-5.8, 5.8].forEach((rz) => {
          const rLeg = new THREE.Mesh(rtgLegGeo, rtgBlueMat);
          rLeg.position.set(rx, 6, rz);
          rLeg.castShadow = true;
          rtg.add(rLeg);
        });
      });

      const rtgTopGeo = new THREE.BoxGeometry(18, 1.4, 12.4);
      const rtgTop = new THREE.Mesh(rtgTopGeo, makeMat(0xffffff, 0.4, 0.1));
      rtgTop.position.set(0, 12, 0);
      rtgTop.castShadow = true;
      rtg.add(rtgTop);

      yardGroup.add(rtg);
    }
    portGroup.add(yardGroup);

    // E. Harbour Master Operations Control Tower & Lighthouse
    const controlTower = new THREE.Group();
    controlTower.position.set(52, 4.0, 36);

    const baseTowerGeo = new THREE.CylinderGeometry(2.4, 3.2, 16, 16);
    const baseTower = new THREE.Mesh(baseTowerGeo, makeMat(0xf8fafc, 0.3, 0.2));
    baseTower.position.y = 8;
    baseTower.castShadow = true;
    controlTower.add(baseTower);

    // 360° Panoramic Glass Control Cab
    const cabGeo = new THREE.CylinderGeometry(3.6, 3.0, 3.2, 16);
    const cab = new THREE.Mesh(cabGeo, bridgeGlassMat);
    cab.position.y = 17;
    controlTower.add(cab);

    // Roof & Rotating Light Dome
    const domeGeo = new THREE.SphereGeometry(2.0, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, makeMat(0x0ea5a8, 0.2, 0.8));
    dome.position.y = 18.6;
    controlTower.add(dome);

    portGroup.add(controlTower);

    // F. Navigation Channel Buoys (Flashing Green & Red)
    const buoys = [
      { pos: [45, 1.2, 28], color: 0x10b981 }, // Green Starboard
      { pos: [15, 1.2, 38], color: 0xef4444 }, // Red Port
      { pos: [-35, 1.2, 32], color: 0x10b981 },
    ];
    buoys.forEach((b) => {
      const buoyGeo = new THREE.CylinderGeometry(0.8, 1.2, 2.4, 12);
      const buoyMesh = new THREE.Mesh(buoyGeo, makeMat(b.color, 0.4, 0.3));
      buoyMesh.position.set(b.pos[0], b.pos[1], b.pos[2]);
      portGroup.add(buoyMesh);
    });

    // G. Terminal ITV Logistics Trucks (Moving container trucks on road)
    const truckList: THREE.Group[] = [];
    [-20, 10, 35].forEach((tx, i) => {
      const truck = new THREE.Group();
      truck.position.set(tx, 4.25, -12);

      // Cab
      const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 1.8), makeMat(0x38bdf8, 0.4, 0.3));
      cabMesh.position.set(1.8, 0.9, 0);
      cabMesh.castShadow = true;
      truck.add(cabMesh);

      // Trailer with 40ft Container
      const contMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.8, 2.0), makeMat(containerPalette[i * 2], 0.6, 0.1));
      contMesh.position.set(-1.8, 1.0, 0);
      contMesh.castShadow = true;
      truck.add(contMesh);

      truckList.push(truck);
      portGroup.add(truck);
    });
    trucksRef.current = truckList;

    // H. Dynamic Ocean Waterway
    const oceanGeo = new THREE.PlaneGeometry(240, 240, 48, 48);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x051d2d : 0x0ea5e9,
      roughness: 0.18,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 1.0;
    ocean.receiveShadow = true;
    oceanRef.current = ocean;
    scene.add(ocean);

    scene.add(portGroup);

    // ==========================================
    // 6. INTERACTIVE ORBIT & MOUSE CONTROLS
    // ==========================================
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    let spherical = { radius: 105, theta: Math.PI / 3.2, phi: Math.PI / 3.6 };

    const updateCamera = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 5, -6);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMouse.x;
      const dy = e.clientY - previousMouse.y;
      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.006));
      updateCamera();
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(35, Math.min(190, spherical.radius + e.deltaY * 0.08));
      updateCamera();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // ==========================================
    // 7. ANIMATION LOOP
    // ==========================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotate Radars & Searchlights
      if (radarRef.current) {
        radarRef.current.rotation.y = time * 3.5;
      }

      // Flash lighthouse beacon
      if (beaconLightRef.current) {
        beaconLightRef.current.intensity = (Math.sin(time * 4.0) + 1.2) * (isDark ? 3.0 : 1.0);
      }

      // Crane Spreader Gentle Motion
      if (craneSpreaderRef.current) {
        craneSpreaderRef.current.position.y = 15.0 + Math.sin(time * 0.8) * 1.8;
      }

      // Animate Logistics Trucks along terminal road
      truckList.forEach((tr, idx) => {
        tr.position.x += 0.08 * (idx % 2 === 0 ? 1 : -1);
        if (tr.position.x > 50) tr.position.x = -45;
        if (tr.position.x < -45) tr.position.x = 50;
      });

      // Ocean wave vertex displacement
      if (oceanRef.current) {
        const pos = (oceanRef.current.geometry as THREE.PlaneGeometry).attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const wave = Math.sin(u * 0.12 + time * 1.8) * 0.22 + Math.cos(v * 0.14 + time * 1.4) * 0.18;
          pos.setZ(i, wave);
        }
        pos.needsUpdate = true;
      }

      // Auto-Orbit cinematic tour
      if (isAutoRotate && !isDragging) {
        spherical.theta += 0.0022;
        updateCamera();
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Set Camera Angles
  const setPresetView = (view: 'aerial' | 'ship' | 'cranes' | 'yard' | 'entrance') => {
    setActiveView(view);
    setIsAutoRotate(false);
    if (!cameraRef.current) return;

    if (view === 'aerial') {
      cameraRef.current.position.set(65, 50, 75);
    } else if (view === 'ship') {
      cameraRef.current.position.set(22, 16, 32);
    } else if (view === 'cranes') {
      cameraRef.current.position.set(-15, 26, -14);
    } else if (view === 'yard') {
      cameraRef.current.position.set(0, 36, -55);
    } else if (view === 'entrance') {
      cameraRef.current.position.set(70, 14, 48);
    }
    cameraRef.current.lookAt(0, 5, -6);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border-subtle bg-surface shadow-elevated transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : className
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className={`w-full relative cursor-grab active:cursor-grabbing select-none ${
          isFullscreen ? 'flex-1 h-full' : heightClass
        }`}
      />

      {/* Top Left HUD: Port Identity & Telemetry */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-xl glass-card text-xs">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-text-main flex items-center gap-2">
              <span className="text-sm">Sector Alpha Container Terminal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40">
                LIVE 3D
              </span>
            </div>
            <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5 font-medium">
              <span>Berths: <strong>B01 – B06</strong></span>
              <span>•</span>
              <span>STS Cranes: <strong>18 Units</strong></span>
              <span>•</span>
              <span>Flagship: <strong className="text-brand-teal">MV Ocean Star</strong> (15.2k TEU)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Controls & Indicators */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs text-text-main font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive 3D Port Twin</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Preset Angle Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-xl glass-card">
          {([] as { id: 'aerial' | 'ship' | 'cranes' | 'yard' | 'entrance'; label: string }[]).concat([
            { id: 'aerial', label: '🚁 Port Panorama' },
            { id: 'ship', label: '🚢 Mega-Ship' },
            { id: 'cranes', label: '🏗️ STS Cranes' },
            { id: 'yard', label: '📦 Container Yard' },
            { id: 'entrance', label: '🌊 Harbour Approach' },
          ]).map((item) => (
            <button
              key={item.id}
              onClick={() => setPresetView(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === item.id
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl glass-card">
          <button
            onClick={() => setIsAutoRotate((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isAutoRotate
                ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/40'
                : 'text-text-muted hover:text-text-main hover:bg-surface-subtle'
            }`}
            title={isAutoRotate ? 'Pause Camera Tour' : 'Start Camera Tour'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutoRotate ? 'Touring' : 'Orbit'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
