
export const COLORS = {
  emerald: '#00574B',
  gold: '#FFD700',
  white: '#FFFFFF',
  warmLight: '#FFD1A6',
  darkBg: '#000000'
};

export const TREE_CONFIG = {
  height: 14,
  radius: 5,
  needleCount: 15000,
  ornamentCount: 150
};

// Moved camera back (z: 14 -> 22) to fit full tree in frame while keeping it centered
export const CAMERA_POS = [0, 0, 22] as const;

export const ORNAMENT_PALETTE = [
  '#FFD700', // Gold
  '#C0C0C0', // Silver
  '#B22222', // Deep Red
  '#00574B', // Emerald
];
