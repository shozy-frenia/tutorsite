"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Interactive 3D grade badges.
 *
 * Deliberately *flat* 3D: basic materials, no gradients, no environment maps,
 * hard black edge lines on every solid. The scene reads like printed shapes
 * that happen to have depth — which is the only way a 3D hero can coexist with
 * a design system whose first rule is "no gradients, no glassmorphism".
 *
 * Letters are drawn into a CanvasTexture rather than loaded as a 3D font, so
 * the scene has no external asset dependency and cannot fail to render.
 */

const INK = "#151515";
const YELLOW = "#fff824";
const LIME = "#b8f000";
const CANVAS_BG = "#f3f3f3";

const GRADES = ["A*", "A", "B", "C", "D", "E", "U"] as const;

/** Half-width of the ladder in world units. Badges are 1 unit wide. */
const HALF_SPREAD = 2.15;

/** Draw a grade letter into a canvas texture: yellow plate, black letter. */
function useBadgeTexture(label: string, accent: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, size, size);

    // Hairline frame, matching the ruled-rectangle grammar of the 2D system.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, size - 14, size - 14);

    ctx.fillStyle = INK;
    ctx.font = `700 ${label.length > 1 ? 118 : 150}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, size / 2, size / 2 + 6);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [label, accent]);
}

interface BadgeProps {
  label: string;
  position: [number, number, number];
  accent: string;
  spin: number;
  phase: number;
  onGrab: (label: string) => void;
}

function Badge({ label, position, accent, spin, phase, onGrab }: BadgeProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useBadgeTexture(label, accent);

  // Six side faces in ink, front face carrying the letter texture.
  const materials = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ color: INK });
    const face = texture
      ? new THREE.MeshBasicMaterial({ map: texture })
      : new THREE.MeshBasicMaterial({ color: accent });
    return [side, side, side, side, face, side];
  }, [texture, accent]);

  useFrame((state) => {
    const mesh = group.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    mesh.position.y = position[1] + Math.sin(t * 0.7 + phase) * 0.16;
    mesh.rotation.y = Math.sin(t * spin + phase) * 0.55;
    mesh.rotation.z = Math.cos(t * spin * 0.6 + phase) * 0.12;

    // Pointer parallax — the whole board leans toward the cursor.
    const target = hovered ? 1.28 : 1;
    mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  return (
    <group ref={group} position={position}>
      <mesh
        material={materials}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onGrab(label);
        }}
      >
        <boxGeometry args={[1, 1, 0.18]} />
      </mesh>
      {/* Hard black outline, drawn as real edges rather than a shader */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 0.18)]} />
        <lineBasicMaterial color={INK} />
      </lineSegments>
    </group>
  );
}

/** Wireframe solids drifting behind the badges. */
function Scaffold() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.08;
    group.current.rotation.x = Math.sin(t * 0.14) * 0.1;
  });

  return (
    <group ref={group}>
      <lineSegments position={[-2.7, 1.35, -2.2]}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(0.82, 0)]} />
        <lineBasicMaterial color={INK} transparent opacity={0.42} />
      </lineSegments>
      <lineSegments position={[2.9, -1.15, -2.6]}>
        <edgesGeometry args={[new THREE.TorusGeometry(0.72, 0.26, 6, 12)]} />
        <lineBasicMaterial color={INK} transparent opacity={0.34} />
      </lineSegments>
      <lineSegments position={[1.9, 1.75, -3]}>
        <edgesGeometry args={[new THREE.TetrahedronGeometry(0.72)]} />
        <lineBasicMaterial color={INK} transparent opacity={0.36} />
      </lineSegments>
      <lineSegments position={[-3.1, -1.5, -1.8]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.7, 0.7, 0.7)]} />
        <lineBasicMaterial color={INK} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/** Tilts the whole rig toward the pointer for a parallax read. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.x * 0.32 - group.current.rotation.y) * 0.045;
    group.current.rotation.x += (-pointer.y * 0.22 - group.current.rotation.x) * 0.045;
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Lays the grade ladder out to fit whatever viewport it lands in.
 *
 * The badges are 1 unit wide and lean on hover, so the arc has to end a full
 * badge-width inside the frustum or A* and U get clipped at the edges. The
 * spread is therefore derived from the visible width rather than hardcoded,
 * and the whole rig scales down on narrow frames.
 */
function Ladder({ onGrab }: { onGrab: (label: string) => void }) {
  const { viewport } = useThree();

  // Fixed design layout — the badges keep their proportions and their overlap
  // at every size. Only the whole rig scales, so nothing is ever squashed.
  const badges = useMemo(
    () =>
      GRADES.map((label, i) => {
        const t = i / (GRADES.length - 1);
        const x = -HALF_SPREAD + t * HALF_SPREAD * 2;
        // Shallow arc, descending left to right: A* rides highest, U lowest.
        const y = 0.72 - Math.pow(t * 2 - 1, 2) * 0.42 - t * 0.92;
        return {
          label,
          position: [x, y, -t * 0.5] as [number, number, number],
          accent: i === 0 ? LIME : YELLOW,
          spin: 0.35 + i * 0.05,
          phase: i * 0.9,
        };
      }),
    []
  );

  // Design footprint: the ladder's span plus a badge width of hover headroom.
  const scale = useMemo(
    () =>
      Math.min(1, viewport.width / (HALF_SPREAD * 2 + 1.9), viewport.height / 4.1),
    [viewport.width, viewport.height]
  );

  return (
    <group scale={scale}>
      <Scaffold />
      {badges.map((badge) => (
        <Badge key={badge.label} {...badge} onGrab={onGrab} />
      ))}
    </group>
  );
}

export default function Hero3D({ onGrab }: { onGrab?: (label: string) => void }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.6], fov: 42 }}
      gl={{ antialias: true }}
      style={{ background: CANVAS_BG, touchAction: "pan-y" }}
    >
      <Rig>
        <Ladder onGrab={onGrab ?? (() => {})} />
      </Rig>
    </Canvas>
  );
}
