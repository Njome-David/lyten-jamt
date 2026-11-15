import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Archetype, Body, Loadout, OptionStyle, SiteId, SolarLevel } from "../engine/types";

export type SceneViewMode = "orbit" | "planet-select" | "loadout" | "mission" | "debrief";

export interface ExecutionVisualState {
  active: boolean;
  archetype: Archetype;
  style: OptionStyle;
  progress: number; // 0..1
}

export interface OutpostSceneProps {
  viewMode: SceneViewMode;
  body: Body;
  siteId: SiteId;
  loadout: Loadout;
  solarLevel: SolarLevel;
  completedSteps: number;
  nightActive: boolean;
  dustActive: boolean;
  panelsRetracted: boolean;
  flareAlertActive: boolean;
  shieldBoostActive: boolean;
  hydroHarvestActive: boolean;
  execution: ExecutionVisualState | null;
  onSelectOrbitBody?: (body: Body) => void;
}

function createPlanetTexture(kind: "earth" | "moon" | "mars"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  if (kind === "earth") {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#dbeafe");
    grad.addColorStop(0.12, "#1d4ed8");
    grad.addColorStop(0.5, "#0284c7");
    grad.addColorStop(0.88, "#1e40af");
    grad.addColorStop(1, "#e0f2fe");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Continents
    const patches = [
      [95, 85, 58, 36, "#15803d"],
      [135, 145, 36, 48, "#166534"],
      [255, 78, 65, 34, "#15803d"],
      [275, 130, 44, 52, "#ca8a04"],
      [370, 92, 74, 42, "#16a34a"],
      [420, 170, 38, 26, "#d97706"],
    ] as const;
    for (const [x, y, rx, ry, col] of patches) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud wisps
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    for (let i = 0; i < 18; i++) {
      const x = (i * 73) % 490;
      const y = 25 + ((i * 41) % 205);
      ctx.beginPath();
      ctx.ellipse(x, y, 42, 7, 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "moon") {
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(0, 0, 512, 256);
    // Maria plains
    const maria = [
      [160, 105, 68, 46],
      [235, 128, 54, 40],
      [340, 96, 48, 34],
    ];
    ctx.fillStyle = "#64748b";
    for (const [x, y, rx, ry] of maria) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Craters
    for (let i = 0; i < 65; i++) {
      const x = (i * 89 + 17) % 500;
      const y = 16 + ((i * 53 + 11) % 224);
      const r = 4 + (i % 14);
      ctx.fillStyle = i % 2 === 0 ? "#cbd5e1" : "#475569";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(x + 1.2, y + 1.2, r * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#fff7ed");
    grad.addColorStop(0.08, "#ea580c");
    grad.addColorStop(0.5, "#c2410c");
    grad.addColorStop(0.92, "#9a3412");
    grad.addColorStop(1, "#ffedd5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 45; i++) {
      const x = (i * 97 + 25) % 496;
      const y = 26 + ((i * 61 + 9) % 204);
      const r = 6 + (i % 18);
      ctx.fillStyle = i % 3 === 0 ? "rgba(124,45,18,0.55)" : "rgba(251,146,60,0.4)";
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.4, r * 0.8, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createAstronautMesh(suitAccent: number): THREE.Group {
  const g = new THREE.Group();
  const suitMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
  const trimMat = new THREE.MeshStandardMaterial({ color: suitAccent, roughness: 0.35 });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.15,
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.36, 6, 12), suitMat);
  torso.position.y = 0.56;
  g.add(torso);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), trimMat);
  pack.position.set(0, 0.6, -0.2);
  g.add(pack);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), suitMat);
  helmet.position.y = 1.02;
  g.add(helmet);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), visorMat);
  visor.position.set(0, 1.02, 0.09);
  g.add(visor);

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), suitMat);
  legL.position.set(-0.1, 0.17, 0);
  const legR = legL.clone();
  legR.position.set(0.1, 0.17, 0);
  g.add(legL, legR);

  return g;
}

export const OutpostScene3D: React.FC<OutpostSceneProps> = (props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef<OutpostSceneProps>(props);
  propsRef.current = props;
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.FogExp2(0x050914, 0.012);

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      400,
    );
    camera.position.set(0, 6, 22);
    const currentLookAt = new THREE.Vector3(0, 1, 0);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(18, 22, 14);
    scene.add(sunLight);

    const baseFloodLight = new THREE.PointLight(0x38bdf8, 1.4, 22);
    baseFloodLight.position.set(0, 3.6, 1.5);
    scene.add(baseFloodLight);

    // Starfield (shared)
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 95 + (i % 65);
      const theta = (i * 2.39996) % (Math.PI * 2);
      const phi = Math.acos(1 - (2 * ((i * 17) % starCount)) / starCount);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.42,
      transparent: true,
      opacity: 0.9,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ================= ORBITAL GROUP ================= */
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const earthTex = createPlanetTexture("earth");
    const moonTex = createPlanetTexture("moon");
    const marsTex = createPlanetTexture("mars");

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.1, 40, 40),
      new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.65 }),
    );
    earthMesh.position.set(-8.5, -0.8, -2);
    orbitGroup.add(earthMesh);

    const earthHalo = new THREE.Mesh(
      new THREE.SphereGeometry(3.36, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide,
      }),
    );
    earthMesh.add(earthHalo);

    const moonOrbitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 36, 36),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.88 }),
    );
    moonOrbitMesh.position.set(-1.1, 0.9, 2.2);
    moonOrbitMesh.userData = { body: "moon" };
    orbitGroup.add(moonOrbitMesh);

    const marsOrbitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.25, 36, 36),
      new THREE.MeshStandardMaterial({ map: marsTex, roughness: 0.78 }),
    );
    marsOrbitMesh.position.set(6.8, 0.2, 0.5);
    marsOrbitMesh.userData = { body: "mars" };
    orbitGroup.add(marsOrbitMesh);

    const marsHalo = new THREE.Mesh(
      new THREE.SphereGeometry(2.48, 28, 28),
      new THREE.MeshBasicMaterial({
        color: 0xfb923c,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide,
      }),
    );
    marsOrbitMesh.add(marsHalo);

    // Subtle orbital trajectory rings
    const arcRingMoon = new THREE.Mesh(
      new THREE.RingGeometry(8.1, 8.18, 80),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      }),
    );
    arcRingMoon.position.copy(earthMesh.position);
    arcRingMoon.rotation.x = Math.PI * 0.43;
    orbitGroup.add(arcRingMoon);

    /* ================= SURFACE OUTPOST GROUP ================= */
    const surfaceGroup = new THREE.Group();
    scene.add(surfaceGroup);

    // Sculpted planetary terrain
    const terrainGeo = new THREE.PlaneGeometry(90, 90, 72, 72);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const distFromBase = Math.hypot(x, z);
      // Flatten landing pad around radius 7
      const padMask = THREE.MathUtils.smoothstep(distFromBase, 5.5, 13);
      const ridge =
        (Math.sin(x * 0.11) * Math.cos(z * 0.11) * 1.6 +
          Math.sin(x * 0.27 + 1.2) * 0.45 +
          (distFromBase > 20 ? (distFromBase - 20) * 0.22 : 0)) *
        padMask;
      // Small crater bowls
      const c1 = Math.hypot(x - 10, z - 6);
      const craterDip = c1 < 4.2 ? -Math.cos((c1 / 4.2) * (Math.PI / 2)) * 1.1 : 0;
      posAttr.setY(i, ridge + craterDip);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.92,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    surfaceGroup.add(terrainMesh);

    // Distant sky body (Earth in Lunar sky)
    const skyEarth = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 28, 28),
      new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.6 }),
    );
    skyEarth.position.set(-18, 15, -42);
    surfaceGroup.add(skyEarth);

    // Landing Pad Ring
    const padBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.35 }),
    );
    padBase.position.set(-1.6, 0.09, -0.5);
    surfaceGroup.add(padBase);

    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(4.35, 4.55, 40),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
    );
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.set(-1.6, 0.19, -0.5);
    surfaceGroup.add(padRing);

    // Main Pressurized Habitat Dome
    const habGroup = new THREE.Group();
    habGroup.position.set(-1.6, 0.18, -0.5);
    surfaceGroup.add(habGroup);

    const habShellMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.38,
      metalness: 0.25,
    });
    const habDome = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
      habShellMat,
    );
    habGroup.add(habDome);

    const habCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(2.18, 2.28, 0.55, 28),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 }),
    );
    habCollar.position.y = 0.26;
    habGroup.add(habCollar);

    // Glowing Habitat Viewport Window
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const habWindow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 0.16), windowMat);
    habWindow.position.set(0, 1.05, 1.98);
    habGroup.add(habWindow);

    // Airlock Tunnel
    const airlock = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 1.5, 16), habShellMat);
    airlock.rotation.x = Math.PI / 2;
    airlock.position.set(0, 0.65, 2.35);
    habGroup.add(airlock);

    // Solar Panels Group (when loadout.power === 'panels')
    const solarWingsGroup = new THREE.Group();
    solarWingsGroup.position.set(-5.4, 0.2, -2.0);
    surfaceGroup.add(solarWingsGroup);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.18,
      metalness: 0.65,
      roughness: 0.25,
    });
    const wingPivots: THREE.Group[] = [];
    for (let i = 0; i < 2; i++) {
      const pylon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 1.4, 10),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 }),
      );
      pylon.position.set(i * 2.2, 0.7, 0);
      solarWingsGroup.add(pylon);

      const pivot = new THREE.Group();
      pivot.position.set(i * 2.2, 1.4, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.07, 2.7), panelMat);
      blade.rotation.x = 0.32;
      pivot.add(blade);
      solarWingsGroup.add(pivot);
      wingPivots.push(pivot);
    }

    // Battery Silos Group (when loadout.power === 'batteries')
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(-5.2, 0.2, -1.8);
    surfaceGroup.add(batteryGroup);
    for (let i = 0; i < 2; i++) {
      const silo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.68, 1.85, 20),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.35 }),
      );
      silo.position.set(i * 1.65, 0.92, 0);
      const glowBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.24, 20),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
      );
      glowBand.position.set(i * 1.65, 1.15, 0);
      batteryGroup.add(silo, glowBand);
    }

    // Reinforced Magnetic Shield Dome
    const shieldDomeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      wireframe: true,
    });
    const shieldDome = new THREE.Mesh(
      new THREE.SphereGeometry(5.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      shieldDomeMat,
    );
    shieldDome.position.set(-1.6, 0.1, -0.5);
    surfaceGroup.add(shieldDome);

    // Hydroponics Greenhouse Biodome vs Sealed Rations Crates
    const hydroGroup = new THREE.Group();
    hydroGroup.position.set(2.4, 0.18, -2.4);
    surfaceGroup.add(hydroGroup);
    const bioGlass = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0.42,
        roughness: 0.15,
      }),
    );
    const cropRack = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.1, 0.45, 16),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.45,
      }),
    );
    cropRack.position.y = 0.25;
    hydroGroup.add(bioGlass, cropRack);

    const rationsGroup = new THREE.Group();
    rationsGroup.position.set(2.2, 0.18, -2.2);
    surfaceGroup.add(rationsGroup);
    for (let i = 0; i < 3; i++) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.62, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.55 }),
      );
      crate.position.set((i % 2) * 0.98, 0.31 + (i === 2 ? 0.62 : 0), i === 2 ? 0.2 : 0);
      rationsGroup.add(crate);
    }

    // Crew Astronauts (up to 4)
    const crewMeshes: THREE.Group[] = [
      createAstronautMesh(0x0284c7),
      createAstronautMesh(0xf97316),
      createAstronautMesh(0x10b981),
      createAstronautMesh(0xa855f7),
    ];
    crewMeshes.forEach((m) => surfaceGroup.add(m));

    // 6-Wheeled Pressurized Rover
    const roverGroup = new THREE.Group();
    roverGroup.position.set(2.8, 0.22, 2.2);
    surfaceGroup.add(roverGroup);

    const roverBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.72, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.2 }),
    );
    roverBody.position.y = 0.56;
    roverGroup.add(roverBody);

    const roverCab = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.45, 0.88),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    roverCab.position.set(0.42, 0.66, 0);
    roverGroup.add(roverCab);

    for (const wx of [-0.55, 0, 0.55]) {
      for (const wz of [-0.58, 0.58]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.18, 14),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }),
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.24, wz);
        roverGroup.add(wheel);
      }
    }

    // Lidar Scan Fan on Rover (for Careful Traverse)
    const lidarCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, 2.4, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    );
    lidarCone.rotation.z = Math.PI / 2;
    lidarCone.position.set(1.9, 0.35, 0);
    roverGroup.add(lidarCone);

    // Deployable Relay Dish & Mast (grows & slews during deploy / uplink)
    const relayGroup = new THREE.Group();
    relayGroup.position.set(4.8, 0.15, -0.6);
    surfaceGroup.add(relayGroup);

    const relayMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.14, 2.8, 10),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6 }),
    );
    relayMast.position.y = 1.4;
    relayGroup.add(relayMast);

    const dishHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 0.45, 20, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.5,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
    );
    dishHead.position.y = 2.85;
    dishHead.rotation.x = -0.6;
    relayGroup.add(dishHead);

    // Radio Uplink Expanding Wave Rings
    const uplinkRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.45 + i * 0.35, 0.045, 10, 32),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0 }),
      );
      ring.position.set(4.8, 3.2, -0.6);
      ring.rotation.x = Math.PI * 0.42;
      surfaceGroup.add(ring);
      uplinkRings.push(ring);
    }

    // Rotary Core Drill Rig (for Drill steps)
    const drillGroup = new THREE.Group();
    drillGroup.position.set(0.9, 0.15, 3.6);
    surfaceGroup.add(drillGroup);
    const drillFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.6, 1.9, 6, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true }),
    );
    drillFrame.position.y = 0.95;
    const drillBit = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 }),
    );
    drillBit.rotation.x = Math.PI;
    drillBit.position.y = 0.85;
    drillGroup.add(drillFrame, drillBit);

    // Science Holographic Scanner Ring (for Experiment / Repair steps)
    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.055, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0 }),
    );
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.set(-1.6, 0.8, -0.5);
    surfaceGroup.add(scanRing);

    // Weather Particle System (Dust Squall / Solar Flare Particles / Wheel Sparks)
    const weatherCount = 420;
    const weatherPos = new Float32Array(weatherCount * 3);
    for (let i = 0; i < weatherCount; i++) {
      weatherPos[i * 3] = (i % 28) - 14;
      weatherPos[i * 3 + 1] = 0.3 + ((i * 7) % 90) * 0.1;
      weatherPos[i * 3 + 2] = ((i * 13) % 24) - 12;
    }
    const weatherGeo = new THREE.BufferGeometry();
    weatherGeo.setAttribute("position", new THREE.BufferAttribute(weatherPos, 3));
    const weatherMat = new THREE.PointsMaterial({
      color: 0xfb923c,
      size: 0.22,
      transparent: true,
      opacity: 0,
    });
    const weatherParticles = new THREE.Points(weatherGeo, weatherMat);
    surfaceGroup.add(weatherParticles);

    // Click picking for Orbit / Planet-Select
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (ev: PointerEvent) => {
      const cur = propsRef.current;
      if (cur.viewMode !== "orbit" && cur.viewMode !== "planet-select") return;
      if (!cur.onSelectOrbitBody) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([moonOrbitMesh, marsOrbitMesh], false);
      if (hits.length > 0) {
        const b = hits[0].object.userData.body as Body | undefined;
        if (b) cur.onSelectOrbitBody(b);
      }
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let rafId = 0;
    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const bgTarget = new THREE.Color();
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      const p = propsRef.current;
      const motionScale = reducedMotion ? 0 : 1;

      const inOrbit = p.viewMode === "orbit" || p.viewMode === "planet-select";
      orbitGroup.visible = inOrbit;
      surfaceGroup.visible = !inOrbit;

      if (inOrbit) {
        bgTarget.setHex(0x050914);
        scene.background = bgTarget;
        (scene.fog as THREE.FogExp2).color.copy(bgTarget);
        (scene.fog as THREE.FogExp2).density = 0.004;
        sunLight.intensity = 2.3;

        earthMesh.rotation.y += 0.08 * dt * motionScale;
        moonOrbitMesh.rotation.y += 0.14 * dt * motionScale;
        marsOrbitMesh.rotation.y += 0.12 * dt * motionScale;
        stars.rotation.y += 0.012 * dt * motionScale;

        if (p.viewMode === "orbit") {
          targetCamPos.set(0.5, 3.2, 18.5);
          targetLookAt.set(0, 0.2, 0);
        } else if (p.body === "moon") {
          targetCamPos.set(-2.9, 1.35, 7.2);
          targetLookAt.set(-2.2, 0.75, 2.0);
        } else {
          targetCamPos.set(4.8, 0.7, 6.8);
          targetLookAt.set(5.6, 0.15, 0.5);
        }
      } else {
        // Surface Outpost Environment
        const isMars = p.body === "mars";
        if (isMars) {
          bgTarget.setHex(p.dustActive ? 0x451a03 : 0x1e1118);
          terrainMat.color.setHex(p.siteId === "gale" ? 0x9a3412 : 0xb45309);
          skyEarth.visible = false;
          padRing.material.color.setHex(0xfb923c);
        } else {
          bgTarget.setHex(0x040711);
          terrainMat.color.setHex(p.siteId === "shackleton" ? 0x94a3b8 : 0x64748b);
          skyEarth.visible = true;
          skyEarth.rotation.y += 0.05 * dt * motionScale;
          padRing.material.color.setHex(0x38bdf8);
        }

        scene.background = bgTarget;
        (scene.fog as THREE.FogExp2).color.copy(bgTarget);
        (scene.fog as THREE.FogExp2).density = p.dustActive ? 0.042 : isMars ? 0.018 : 0.008;

        // Lighting (Lunar Night / Dust / Solar Storm)
        const targetSun = p.nightActive ? 0.12 : p.dustActive ? 0.85 : isMars ? 1.55 : 2.35;
        sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, targetSun, 0.08);
        baseFloodLight.intensity = p.nightActive ? 2.8 : 1.2;

        // Outpost Loadout Visibility
        solarWingsGroup.visible = p.loadout.power === "panels";
        batteryGroup.visible = p.loadout.power === "batteries";
        hydroGroup.visible = p.loadout.food === "hydroponics";
        rationsGroup.visible = p.loadout.food === "rations";

        // Solar wings fold when retracted
        const targetFold = p.panelsRetracted ? 0.18 : 1.0;
        wingPivots.forEach((piv) => {
          piv.scale.z = THREE.MathUtils.lerp(piv.scale.z, targetFold, 0.12);
        });

        // Hydroponics crop height
        const cropScale = p.hydroHarvestActive ? 1.45 : 0.85;
        cropRack.scale.y = THREE.MathUtils.lerp(cropRack.scale.y, cropScale, 0.08);

        // Shield Dome
        const wantShield = p.shieldBoostActive
          ? 0.42
          : p.loadout.shield === "reinforced"
            ? 0.14
            : 0.0;
        shieldDomeMat.opacity = THREE.MathUtils.lerp(shieldDomeMat.opacity, wantShield, 0.1);
        shieldDome.rotation.y += 0.15 * dt * motionScale;

        // Completed mission structures visibility
        relayGroup.visible =
          p.completedSteps >= 2 ||
          p.execution?.archetype === "deploy" ||
          p.execution?.archetype === "uplink";
        drillGroup.visible = p.completedSteps >= 3 || p.execution?.archetype === "drill";

        // Crew astronauts placement & subtle bob
        crewMeshes.forEach((astro, idx) => {
          astro.visible = idx < p.loadout.crew;
          if (!astro.visible) return;
          const baseAngle = -0.6 + idx * 0.52;
          const walkOffset = p.execution?.active && motionScale ? Math.sin(t * 7 + idx) * 0.06 : 0;
          astro.position.set(
            -1.6 + Math.sin(baseAngle) * 3.1,
            0.18 + Math.abs(walkOffset),
            0.2 + Math.cos(baseAngle) * 3.1,
          );
          astro.rotation.y = baseAngle + Math.PI * 0.15;
        });

        // Reset transient effects before applying active execution
        lidarCone.material.opacity = 0;
        scanRing.material.opacity = 0;
        uplinkRings.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0;
        });

        // Camera & Live Step Execution Animations
        const ex = p.execution;
        if (ex && ex.active) {
          const prog = ex.progress;
          const speedMult = ex.style === "fast" ? 2.0 : ex.style === "balanced" ? 1.25 : 0.75;

          if (ex.archetype === "travel") {
            const travelDist = Math.sin(prog * Math.PI) * 5.2;
            roverGroup.position.set(2.8 + travelDist * 0.85, 0.22, 2.2 - travelDist * 0.45);
            roverGroup.rotation.y = -0.45 + Math.sin(t * 9 * speedMult) * 0.03 * motionScale;
            if (ex.style === "careful") {
              lidarCone.material.opacity = 0.28;
              lidarCone.rotation.y = Math.sin(t * 4) * 0.35 * motionScale;
            }
            targetCamPos.set(5.5, 4.2, 10.5);
            targetLookAt.set(roverGroup.position.x, 0.9, roverGroup.position.z);
          } else if (ex.archetype === "deploy") {
            const grow = THREE.MathUtils.clamp(prog * 1.25, 0.15, 1);
            relayGroup.scale.set(1, grow, 1);
            scanRing.position.set(4.8, 0.3 + prog * 2.2, -0.6);
            scanRing.scale.setScalar(0.55);
            scanRing.material.opacity = 0.55;
            targetCamPos.set(6.2, 4.1, 8.2);
            targetLookAt.set(3.8, 1.4, -0.4);
          } else if (ex.archetype === "drill") {
            drillBit.rotation.y += 14 * speedMult * dt * motionScale;
            drillBit.position.y = 0.95 - Math.sin(prog * Math.PI) * 0.45;
            targetCamPos.set(2.8, 3.4, 9.2);
            targetLookAt.set(0.9, 0.9, 3.6);
          } else if (ex.archetype === "experiment") {
            scanRing.position.set(-1.6, 0.4 + ((t * 1.4) % 2.1), -0.5);
            scanRing.scale.setScalar(1.05);
            scanRing.material.opacity = 0.55;
            targetCamPos.set(-0.8, 4.2, 8.8);
            targetLookAt.set(-0.6, 1.2, -1.1);
          } else if (ex.archetype === "repair") {
            scanRing.position.set(-4.3, 0.9 + Math.sin(t * 5) * 0.4, -1.8);
            scanRing.scale.setScalar(0.75);
            scanRing.material.opacity = 0.5;
            targetCamPos.set(-4.8, 3.9, 7.8);
            targetLookAt.set(-3.8, 1.1, -1.5);
          } else if (ex.archetype === "uplink") {
            dishHead.rotation.z = Math.sin(t * 2.5) * 0.25 * motionScale;
            uplinkRings.forEach((ring, idx) => {
              const wave = (prog * 2.2 + idx * 0.33) % 1;
              ring.position.set(4.8 - wave * 2.2, 3.1 + wave * 4.5, -0.6 - wave * 3.0);
              ring.scale.setScalar(0.6 + wave * 1.8);
              (ring.material as THREE.MeshBasicMaterial).opacity = (1 - wave) * 0.75;
            });
            targetCamPos.set(5.8, 4.5, 9.6);
            targetLookAt.set(3.6, 2.8, -1.2);
          }
        } else {
          // Idle Outpost Commander Framing
          roverGroup.position.lerp(new THREE.Vector3(2.8, 0.22, 2.2), 0.08);
          relayGroup.scale.set(1, 1, 1);
          if (p.viewMode === "loadout") {
            targetCamPos.set(-0.4, 5.2, 11.4);
            targetLookAt.set(-1.2, 1.1, -0.8);
          } else if (p.viewMode === "debrief") {
            const orbitAngle = t * 0.14 * motionScale;
            targetCamPos.set(Math.sin(orbitAngle) * 13.5, 5.6, Math.cos(orbitAngle) * 13.5);
            targetLookAt.set(0, 1.1, 0);
          } else {
            targetCamPos.set(1.2, 5.4, 12.6);
            targetLookAt.set(0.2, 1.0, 0.2);
          }
        }

        // Weather Particles (Dust Squall or Solar Storm Aurora)
        if (p.dustActive || p.flareAlertActive || p.solarLevel === "stormy") {
          weatherMat.opacity = p.dustActive ? 0.65 : p.flareAlertActive ? 0.55 : 0.22;
          weatherMat.color.setHex(p.dustActive ? 0xf97316 : 0xfbbf24);
          const pos = weatherGeo.attributes.position as THREE.BufferAttribute;
          if (motionScale) {
            for (let i = 0; i < weatherCount; i++) {
              let x = pos.getX(i) + (p.dustActive ? 11 : 3.5) * dt;
              let y = pos.getY(i) + (p.flareAlertActive ? -3.2 * dt : 0);
              if (x > 14) x = -14;
              if (y < 0.2) y = 9.2;
              pos.setX(i, x);
              pos.setY(i, y);
            }
            pos.needsUpdate = true;
          }
        } else {
          weatherMat.opacity = THREE.MathUtils.lerp(weatherMat.opacity, 0, 0.1);
        }
      }

      camera.position.lerp(targetCamPos, reducedMotion ? 1 : 0.06);
      currentLookAt.lerp(targetLookAt, reducedMotion ? 1 : 0.08);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      earthTex.dispose();
      moonTex.dispose();
      marsTex.dispose();
      terrainGeo.dispose();
      starGeo.dispose();
      weatherGeo.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    // Clean 2D CSS Space Backdrop Fallback when WebGL is disabled
    const isMars = props.body === "mars" && props.viewMode !== "orbit";
    return (
      <div
        className={`fixed inset-0 -z-10 ${
          isMars
            ? "bg-gradient-to-b from-stone-950 via-orange-950/60 to-stone-900"
            : "bg-gradient-to-b from-slate-950 via-sky-950/35 to-slate-900"
        }`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true" />
  );
};

export default OutpostScene3D;
