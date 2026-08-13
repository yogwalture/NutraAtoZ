"use client";

import * as React from "react";
import * as THREE from "three";

/**
 * Citrus hero object: a glossy cluster of vitamin capsules + gummy spheres in
 * coral / berry / amber, floating over a soft gradient card. Bright studio
 * lighting so the glossy shapes pop on the light theme. Balanced motion:
 * gentle auto-rotation + pointer parallax. Client-only (WebGL); ssr:false.
 */
export default function Hero3D() {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 480;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ---- Bright, warm studio lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(5, 7, 6);
    scene.add(key);

    const coralLight = new THREE.PointLight(0xff6b4a, 3.2, 40);
    coralLight.position.set(-5, -1, 5);
    scene.add(coralLight);

    const berryLight = new THREE.PointLight(0xe63980, 2.6, 40);
    berryLight.position.set(4, -4, -3);
    scene.add(berryLight);

    const amberLight = new THREE.PointLight(0xffb020, 2.4, 40);
    amberLight.position.set(0, 5, -4);
    scene.add(amberLight);

    // ---- Root group ----
    const root = new THREE.Group();
    scene.add(root);

    // soft halo behind the cluster
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffb020,
        transparent: true,
        opacity: 0.1,
      })
    );
    root.add(halo);

    function glossy(color: number, emissive: number) {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.16,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        emissive,
        emissiveIntensity: 0.25,
      });
    }

    const coralMat = glossy(0xff6b4a, 0x5a1a0d);
    const berryMat = glossy(0xe63980, 0x4a1030);
    const amberMat = glossy(0xffb020, 0x5a3a00);
    const creamMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff3e6,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1,
    });

    // ---- Central coral capsule (two-tone with cream cap) ----
    const capsule = new THREE.Group();
    capsule.rotation.z = Math.PI / 5;
    capsule.position.set(-0.25, 0.15, 0);
    root.add(capsule);

    const capBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.82, 1.7, 24, 48),
      coralMat
    );
    capsule.add(capBody);

    const creamCap = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.835, 1.7, 24, 48),
      creamMat
    );
    creamMat.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)];
    renderer.localClippingEnabled = true;
    capsule.add(creamCap);

    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.028, 16, 64),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.2,
      })
    );
    seam.rotation.x = Math.PI / 2;
    capsule.add(seam);

    // ---- Gummy spheres (berry + amber) ----
    const berryBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 48, 48),
      berryMat
    );
    berryBall.position.set(1.85, 1.25, 0.4);
    root.add(berryBall);

    const amberBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 48, 48),
      amberMat
    );
    amberBall.position.set(1.65, -1.35, -0.2);
    root.add(amberBall);

    const coralBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 40, 40),
      coralMat
    );
    coralBall.position.set(-1.9, -1.5, 0.5);
    root.add(coralBall);

    // gentle bob targets for the balls
    const bobbers: { mesh: THREE.Mesh; baseY: number; amp: number; speed: number; phase: number }[] =
      [
        { mesh: berryBall, baseY: 1.25, amp: 0.18, speed: 0.9, phase: 0 },
        { mesh: amberBall, baseY: -1.35, amp: 0.22, speed: 1.1, phase: 1.5 },
        { mesh: coralBall, baseY: -1.5, amp: 0.2, speed: 0.8, phase: 3 },
      ];

    // ---- Orbiting sparkle particles ----
    const particles = new THREE.Group();
    root.add(particles);
    const sparkMat = new THREE.MeshStandardMaterial({
      color: 0xffd27a,
      emissive: 0xffb020,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.4,
    });
    const orbits: {
      mesh: THREE.Mesh;
      r: number;
      speed: number;
      phase: number;
      tilt: number;
      y: number;
    }[] = [];
    for (let i = 0; i < 9; i++) {
      const s = 0.04 + Math.random() * 0.06;
      const m = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 14), sparkMat);
      particles.add(m);
      orbits.push({
        mesh: m,
        r: 2.8 + Math.random() * 1.2,
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 1.4,
        y: (Math.random() - 0.5) * 2.2,
      });
    }

    // ---- Thin orbiting ring ----
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.15, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({
        color: 0xe63980,
        transparent: true,
        opacity: 0.5,
      })
    );
    ring.rotation.x = Math.PI / 2.2;
    root.add(ring);

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
        capsule.rotation.y = t * 0.45;
        root.position.y = Math.sin(t * 0.8) * 0.1;
        particles.rotation.y = t * 0.12;
        ring.rotation.z = t * 0.22;
        berryBall.rotation.y = t * 0.4;
        amberBall.rotation.y = -t * 0.5;
        bobbers.forEach((b) => {
          b.mesh.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * b.amp;
        });
      }

      root.rotation.y = pointer.x * 0.35;
      root.rotation.x = pointer.y * 0.25;
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
      style={{ minHeight: 340 }}
    />
  );
}
