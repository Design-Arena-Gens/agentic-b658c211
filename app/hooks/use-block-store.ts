"use client";

import { create } from "zustand";
import {
  BlockType,
  GeneratedWorld,
  deserializeBlockKey,
  generateInitialWorld,
  serializeBlockKey
} from "../lib/world";

interface BlockStore {
  world: GeneratedWorld;
  addBlock: (position: [number, number, number], type: BlockType) => void;
  removeBlock: (position: [number, number, number]) => void;
  getTopHeight: (x: number, z: number) => number;
  reset: () => void;
}

const createWorld = () => generateInitialWorld();

const rebuildHeightForColumn = (
  blocks: Record<string, BlockType>,
  x: number,
  z: number
) => {
  let maxY = -Infinity;
  Object.keys(blocks).forEach((key) => {
    const [bx, by, bz] = deserializeBlockKey(key);
    if (bx === x && bz === z && blocks[key] !== undefined) {
      maxY = Math.max(maxY, by);
    }
  });
  return maxY === -Infinity ? 0 : maxY;
};

export const useBlockStore = create<BlockStore>((set, get) => ({
  world: createWorld(),
  addBlock: (position, type) =>
    set((state) => {
      const key = serializeBlockKey(...position);
      if (state.world.blocks[key]) return state;
      const heightKey = `${position[0]}|${position[2]}`;
      const blocks = { ...state.world.blocks, [key]: type };
      const heightMap = { ...state.world.heightMap };
      heightMap[heightKey] = Math.max(
        position[1],
        state.world.heightMap[heightKey] ?? position[1]
      );
      return { world: { blocks, heightMap } };
    }),
  removeBlock: (position) =>
    set((state) => {
      const key = serializeBlockKey(...position);
      if (!state.world.blocks[key]) return state;
      const blocks = { ...state.world.blocks };
      delete blocks[key];
      const heightKey = `${position[0]}|${position[2]}`;
      const height = rebuildHeightForColumn(blocks, position[0], position[2]);
      const heightMap = { ...state.world.heightMap, [heightKey]: height };
      return { world: { blocks, heightMap } };
    }),
  getTopHeight: (x, z) => {
    const height = get().world.heightMap[`${Math.round(x)}|${Math.round(z)}`];
    return height ?? 0;
  },
  reset: () =>
    set(() => ({
      world: createWorld()
    }))
}));
