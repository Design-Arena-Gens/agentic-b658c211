"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { blockPalette } from "./components/WorldScene";
import type { BlockType } from "./lib/world";

const WorldScene = dynamic(() => import("./components/WorldScene"), {
  ssr: false
});

const blockLabels: Record<BlockType, string> = {
  grass: "Grass",
  dirt: "Dirt",
  stone: "Stone",
  sand: "Sand",
  water: "Water",
  wood: "Wood",
  leaf: "Leaf"
};

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<BlockType>("grass");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };
    document.addEventListener("pointerlockchange", handleLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", handleLockChange);
  }, []);

  useEffect(() => {
    const container = document.getElementById("mindcraft-entry");
    if (!container) return;
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    container.addEventListener("contextmenu", handleContextMenu);
    return () => container.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const palette = useMemo(
    () =>
      blockPalette.filter(
        (block) => block !== "water" // avoid placing water for now
      ),
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const index = parseInt(event.key, 10);
      if (!Number.isNaN(index) && index > 0 && index <= palette.length) {
        setSelectedBlock(palette[index - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [palette]);

  return (
    <main id="mindcraft-entry">
      <WorldScene selectedBlock={selectedBlock} />
      <div className="hud">
        <div className="hud__crosshair" />
        <div className="hud__controls">
          <div className="hud__title">Mindcraft</div>
          <div className="hud__grid">
            {palette.map((block) => (
              <button
                key={block}
                type="button"
                className={clsx("hud__block", {
                  "hud__block--active": selectedBlock === block
                })}
                onClick={() => setSelectedBlock(block)}
              >
                <span
                  className="hud__swatch"
                  style={
                    {
                      "--swatch-color": BLOCK_SWATCHES[block]
                    } as React.CSSProperties
                  }
                />
                <span className="hud__label">{blockLabels[block]}</span>
              </button>
            ))}
          </div>
          <p className="hud__hint">
            Click to lock cursor • WASD to move • Shift to sprint • Space to jump
            • Left click to mine • Right click to place
          </p>
        </div>
        {!isLocked && (
          <div
            className="hud__overlay"
            onClick={() => {
              const target = document.getElementById("mindcraft-entry");
              target?.requestPointerLock();
            }}
            role="presentation"
          >
            <div className="hud__overlay-content">
              <h1>Mindcraft</h1>
              <p>Click anywhere to enter the world.</p>
              <p>
                Use WASD to explore, and craft the terrain with your mouse. Press
                Escape to release the cursor.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const BLOCK_SWATCHES: Record<BlockType, string> = {
  grass: "#3e9945",
  dirt: "#8a5a3b",
  stone: "#8c8f96",
  sand: "#e2d9a4",
  water: "#3a74c4",
  wood: "#553423",
  leaf: "#2c7a3d"
};
