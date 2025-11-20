"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useKeyboardControls } from "@react-three/drei";
import { Vector3 } from "three";
import { useBlockStore } from "../hooks/use-block-store";
import type { ControlName } from "../lib/controls";

const MOVEMENT_SPEED = 6;
const SPRINT_MULTIPLIER = 1.6;
const JUMP_FORCE = 7;
const GRAVITY = 18;
const PLAYER_HEIGHT = 1.8;

export default function PlayerControls() {
  const camera = useThree((state) => state.camera);
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [, getKeys] = useKeyboardControls<ControlName>();
  const velocity = useRef(new Vector3());
  const direction = useMemo(() => new Vector3(), []);
  const frontVector = useMemo(() => new Vector3(), []);
  const sideVector = useMemo(() => new Vector3(), []);
  const getTopHeight = useBlockStore((state) => state.getTopHeight);

  useEffect(() => {
    const top = getTopHeight(0, 0);
    camera.position.set(0, top + PLAYER_HEIGHT + 2, 0);
  }, [camera, getTopHeight]);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement !== null;
      setHasPointerLock(locked);
    };
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
  }, []);

  useFrame((_, delta) => {
    const { forward, backward, left, right, jump, sprint } = getKeys();
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    const isMoving = frontVector.lengthSq() > 0 || sideVector.lengthSq() > 0;

    direction
      .copy(frontVector)
      .add(sideVector)
      .normalize()
      .multiplyScalar((sprint ? SPRINT_MULTIPLIER : 1) * MOVEMENT_SPEED * delta);

    direction.applyAxisAngle(new Vector3(0, 1, 0), camera.rotation.y);
    camera.position.add(direction);

    const columnTop = getTopHeight(camera.position.x, camera.position.z);
    const ground = columnTop + 1 + PLAYER_HEIGHT * 0.5;

    velocity.current.y -= GRAVITY * delta;

    const nextY = camera.position.y + velocity.current.y * delta;

    if (nextY <= ground) {
      velocity.current.y = 0;
      camera.position.y = ground;
      if (jump) {
        velocity.current.y = JUMP_FORCE;
      }
    } else {
      camera.position.y = nextY;
    }

    if (!isMoving) {
      velocity.current.x = 0;
      velocity.current.z = 0;
    }
  });

  return (
    <PointerLockControls
      selector="#mindcraft-entry"
      onLock={() => setHasPointerLock(true)}
      onUnlock={() => setHasPointerLock(false)}
    />
  );
}
