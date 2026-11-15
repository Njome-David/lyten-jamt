// src/three/stage/proceduralTextures.ts
import * as THREE from 'three';

/**
 * Procedural texture generator for celestial bodies.
 * Pure code without external images or network dependencies.
 */

function isBrowser(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

/**
 * Procedural Earth Texture: deep blue oceans, green/brown continents,
 * white cloud swirls and polar ice caps.
 */
export function createEarthTexture(width = 512, height = 256): THREE.CanvasTexture | undefined {
  if (!isBrowser()) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // 1. Deep Ocean Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c2340');
  oceanGrad.addColorStop(0.3, '#0369a1');
  oceanGrad.addColorStop(0.7, '#1e40af');
  oceanGrad.addColorStop(1, '#081a36');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Continents (procedural organic landmasses)
  ctx.fillStyle = '#15803d';
  for (let c = 0; c < 12; c++) {
    const cx = ((c * 83) % width);
    const cy = 60 + ((c * 47) % (height - 120));
    const r = 25 + (c % 5) * 12;

    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.6, r, (c * 0.4), 0, Math.PI * 2);
    ctx.fill();

    // Mountain/desert interior accents
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 4, r * 0.8, r * 0.5, (c * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
  }

  // 3. Polar Ice Caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, 18);
  ctx.fillRect(0, height - 18, width, 18);

  // 4. Atmospheric Cloud Swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 18; i++) {
    const x = (i * 37) % width;
    const y = 30 + ((i * 53) % (height - 60));
    ctx.beginPath();
    ctx.ellipse(x, y, 45, 12, (i * 0.2), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Mars Texture: rusty ochre regolith with dark basaltic volcanic maria
 * and polar dry-ice cap.
 */
export function createMarsTexture(width = 512, height = 256): THREE.CanvasTexture | undefined {
  if (!isBrowser()) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // 1. Rust / Ochre Martian Base
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#7c2d12');
  baseGrad.addColorStop(0.3, '#c2410c');
  baseGrad.addColorStop(0.5, '#ea580c');
  baseGrad.addColorStop(0.8, '#9a3412');
  baseGrad.addColorStop(1, '#431407');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Dark Basaltic Highlands & Canyons (Syrtis Major, Valles Marineris style)
  ctx.fillStyle = 'rgba(67, 20, 7, 0.75)';
  for (let i = 0; i < 14; i++) {
    const x = (i * 47) % width;
    const y = 50 + ((i * 39) % (height - 100));
    ctx.beginPath();
    ctx.ellipse(x, y, 35, 18, (i * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. North Polar Cap
  ctx.fillStyle = '#ffedd5';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, 6, 45, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Moon Texture: lunar maria (dark basaltic plains), crater rings
 * and highlands.
 */
export function createMoonTexture(width = 512, height = 256): THREE.CanvasTexture | undefined {
  if (!isBrowser()) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // 1. Lunar Highlands Base (Grey)
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, width, height);

  // 2. Lunar Maria (Darker basalt plains: Tranquillitatis, Serenitatis)
  ctx.fillStyle = 'rgba(51, 65, 85, 0.7)';
  for (let m = 0; m < 8; m++) {
    const mx = (m * 67 + 30) % width;
    const my = 40 + ((m * 37) % (height - 80));
    ctx.beginPath();
    ctx.ellipse(mx, my, 40, 28, m * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Impact Craters with Bright Ejecta Rims
  for (let c = 0; c < 30; c++) {
    const cx = (c * 31) % width;
    const cy = 15 + ((c * 43) % (height - 30));
    const r = 4 + (c % 6) * 3;

    // Rim highlight
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Crater pit floor
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Regolith Bump Texture: fine high-frequency noise for surface roughness
 */
export function createRegolithBumpTexture(size = 256): THREE.CanvasTexture | undefined {
  if (!isBrowser()) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = 110 + Math.floor(Math.random() * 60);
    data[i] = v;     // R
    data[i + 1] = v; // G
    data[i + 2] = v; // B
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}
