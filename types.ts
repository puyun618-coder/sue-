import { Vector3 } from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export enum AppMode {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export enum GestureType {
  OPEN_PALM = 'OPEN_PALM',
  CLOSED_FIST = 'CLOSED_FIST',
  PINCH = 'PINCH',
  NONE = 'NONE',
}

export interface PhotoData {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface TreeConfig {
  height: number;
  radius: number;
  needleCount: number;
  ornamentCount: number;
}