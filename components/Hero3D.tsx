"use client";

import * as React from "react";
import * as THREE from "three";

/**
 * Interactive WebGL hero object: a glossy pharmaceutical capsule floating
 * inside a halo, orbited by gold particles. Auto-rotates and responds to
 * the pointer. Rendered on a transparent canvas so it floats over the
 * hero's gradient. Client-only (uses WebGL); import with ssr:false.
 */
export default function Hero3D() {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 480;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ---- Lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 5);
    scene.add(key);

    const gold = new THREE.PointLight(0xf0cd83, 3.5, 30);
    gold.position.set(-4, -2, 4);
    scene.add(gold);

    const rim = new THREE.PointLight(0x1f7a6c, 3, 30);
    rim.position.set(3, -3, -4);
    scene.add(rim);

    // ---- Root group ----
    const root = new THREE.Group();
    scene.add(root);

    // Halo glow behind the capsule
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x0f4c43,
        transparent: true,
        opacity: 0.18,
      })
    );
    root.add(halo);

    // ---- Capsule (two-tone glossy pill) ----
    const capsuleGroup = new THREE.Group();
    capsuleGroup.rotation.z = Math.PI / 5;
    root.add(capsuleGroup);

    const emeraldMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f4c43,
      roughness: 0.18,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      emissive: 0x08221d,
      emissiveIntensity: 0.35,
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xc9a24b,
      roughness: 0.22,
      metalness: 0.55,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      emissive: 0x6e5220,
      emissiveIntensity: 0.3,
    });

    // Body: full capsule (emerald), then a shorter gold cap over one half.
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.85, 1.9, 24, 48),
      emeraldMat
    );
    capsuleGroup.add(body);

    // Gold half-shell (slightly larger radius) covering the top half.
    const goldCap = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.865, 1.9, 24, 48),
      goldMat
    );
    // Clip the gold to the top half using a plane on the material.
    goldMat.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)];
    renderer.localClippingEnabled = true;
    capsuleGroup.add(goldCap);

    // Thin seam ring where the two halves meet.
    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.87, 0.03, 16, 64),
      new THREE.MeshStandardMaterial({
        color: 0xfaf9f6,
        roughness: 0.4,
        metalness: 0.2,
      })
    );
    seam.rotation.x = Math.PI / 2;
    capsuleGroup.add(seam);

    // ---- Orbiting gold particles ----
    const particles = new THREE.Group();
    root.add(particles);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xc9a24b,
      emissive: 0xc9a24b,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.6,
    });
    const orbits: { mesh: THREE.Mesh; r: number; speed: number; phase: number; tilt: number; y: number }[] =
      [];
    for (let i = 0; i < 7; i++) {
      const s = 0.05 + Math.random() * 0.07;
      const m = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 16), particleMat);
      particles.add(m);
      orbits.push({
        mesh: m,
        r: 2.4 + Math.random() * 1.1,
        speed: 0.25 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 1.2,
        y: (Math.random() - 0.5) * 1.8,
      });
    }

    // ---- Interaction ----
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    function onPointerMove(e: PointerEvent) {
      const rect = mount!.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    window.addEventListener("pointermove", onPointerMove);

    // ---- Resize ----
    function resize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      if (!prefersReduced) {
        capsuleGroup.rotation.y = t * 0.5;
        root.position.y = Math.sin(t * 0.8) * 0.12;
        particles.rotation.y = t * 0.15;
      }

      root.rotation.y = pointer.x * 0.4;
      root.rotation.x = pointer.y * 0.3;
      halo.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);

      orbits.forEach((o) => {
        const a = t * o.speed + o.phase;
        o.mesh.position.set(
          Math.cos(a) * o.r,
          o.y + Math.sin(a * 1.3) * 0.3,
          Math.sin(a) * o.r * Math.cos(o.tilt)
        );
      });

      renderer.render(scene, camera);
    }
    animate();

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      renderer.dispose();
      scene.traverse((obj: THREE.Object3D) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="h-full w-full"
      style={{ minHeight: 320 }}
    />
  );
}
