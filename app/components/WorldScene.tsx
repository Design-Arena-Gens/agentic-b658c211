"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky, Stars } from "@react-three/drei";
import Block from "./Block";
import PlayerControls from "./PlayerControls";
import { useBlockStore } from "../hooks/use-block-store";
import { BlockType } from "../lib/world";
import { controlMap } from "../lib/controls";

export const blockPalette: BlockType[] = [
  "grass",
  "dirt",
  "stone",
  "sand",
  "wood",
  "leaf"
];

export default function WorldScene({
  selectedBlock
}: {
  selectedBlock: BlockType;
}) {
  const { world, addBlock, removeBlock } = useBlockStore();
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const blockEntries = useMemo(
    () => Object.entries(world.blocks),
    [world.blocks]
  );

  return (
    <KeyboardControls map={controlMap}>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 2000, position: [0, 20, 20] }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <color attach="background" args={["#1a1f2a"]} />
        <fog attach="fog" args={["#1a1f2a", 10, 120]} />

        <Sky
          distance={450000}
          inclination={0.49}
          azimuth={0.25}
          mieCoefficient={0.01}
          mieDirectionalG={0.8}
          rayleigh={2}
          turbidity={10}
        />
        <Stars
          radius={200}
          depth={60}
          count={8000}
          factor={20}
          saturation={0}
          fade
        />

        <ambientLight intensity={0.45} />
        <directionalLight
          position={[35, 60, 25]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        >
          <orthographicCamera
            args={[-80, 80, 80, -80, 1, 200]}
            attach="shadow-camera"
          />
        </directionalLight>

        <Suspense fallback={null}>
          {blockEntries.map(([key, type]) => (
            <Block
              key={key}
              blockKey={key}
              type={type}
              selected={hoveredBlock === key}
              onHover={setHoveredBlock}
              onRemove={(position) => removeBlock(position)}
              onPlace={(position) => {
                if (type === "water") return;
                addBlock(position, selectedBlock);
              }}
            />
          ))}
        </Suspense>

        <PlayerControls />
      </Canvas>
    </KeyboardControls>
  );
}
