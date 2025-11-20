"use client";

import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { Edges, useCursor } from "@react-three/drei";
import { deserializeBlockKey } from "../lib/world";

const blockColors: Record<string, string> = {
  grass: "#3e9945",
  dirt: "#8a5a3b",
  stone: "#8c8f96",
  sand: "#e2d9a4",
  water: "#3a74c4",
  wood: "#553423",
  leaf: "#2c7a3d"
};

const emissiveColors: Record<string, string> = {
  water: "#1c3b70"
};

interface BlockProps {
  blockKey: string;
  type: string;
  onHover: (blockKey: string | null) => void;
  selected: boolean;
  onRemove: (position: [number, number, number]) => void;
  onPlace: (position: [number, number, number]) => void;
}

export default function Block({
  blockKey,
  type,
  onHover,
  selected,
  onRemove,
  onPlace
}: BlockProps) {
  const [x, y, z] = deserializeBlockKey(blockKey);
  const blockColor = blockColors[type] ?? "#888";
  const emissive = emissiveColors[type];
  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: blockColor,
      roughness: type === "water" ? 0.2 : 0.8,
      metalness: type === "water" ? 0.2 : 0.05
    });
    if (emissive) {
      mat.emissive.set(emissive);
      mat.emissiveIntensity = type === "water" ? 0.6 : 0.3;
    }
    return mat;
  }, [blockColor, emissive, type]);

  useCursor(type !== "water");

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    if (type === "water") return;
    const faceNormal = event.face?.normal;
    if (event.nativeEvent.button === 2 && faceNormal) {
      const placePosition: [number, number, number] = [
        Math.round(x + faceNormal.x),
        Math.round(y + faceNormal.y),
        Math.round(z + faceNormal.z)
      ];
      onPlace(placePosition);
    } else if (event.nativeEvent.button === 0) {
      onRemove([x, y, z]);
    }
  };

  return (
    <mesh
      position={[x + 0.5, y + 0.5, z + 0.5]}
      material={material}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(blockKey);
      }}
      onPointerLeave={() => onHover(null)}
      onPointerDown={handlePointerDown}
      castShadow={type !== "water"}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      {selected && <Edges scale={1.02} color="#ffffff" threshold={15} />}
    </mesh>
  );
}
