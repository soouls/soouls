// Mathematical utilities for canvas calculations

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate angle between two 3D points
 */
export function calculateAngle(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number },
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;
  return Math.atan2(Math.sqrt(dx * dx + dy * dy), dz);
}
