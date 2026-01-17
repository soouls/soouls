// Pure functions for 3D canvas calculations
// These run in both browser and server for optimistic UI

export interface Node {
  id: string;
  x: number;
  y: number;
  z: number;
  emotion?: string;
  timestamp: number;
}

export interface Connection {
  from: string;
  to: string;
  strength: number;
}

/**
 * Calculate distance between two nodes in 3D space
 */
export function calculateDistance(node1: Node, node2: Node): number {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  const dz = node1.z - node2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate optimal position for a new node based on time and emotion
 */
export function calculateNodePosition(
  existingNodes: Node[],
  timestamp: number,
  emotion?: string,
): { x: number; y: number; z: number } {
  // Time-based positioning (x-axis)
  const timeRange =
    existingNodes.length > 0
      ? Math.max(...existingNodes.map((n) => n.timestamp)) -
        Math.min(...existingNodes.map((n) => n.timestamp))
      : 1000;

  const normalizedTime =
    (timestamp - Math.min(...existingNodes.map((n) => n.timestamp))) / timeRange;
  const x = normalizedTime * 1000;

  // Emotion-based positioning (y-axis)
  const y = emotion ? hashEmotion(emotion) * 500 : Math.random() * 500;

  // Random z for depth
  const z = Math.random() * 500;

  return { x, y, z };
}

function hashEmotion(emotion: string): number {
  let hash = 0;
  for (let i = 0; i < emotion.length; i++) {
    hash = (hash << 5) - hash + emotion.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) / 1000000;
}
