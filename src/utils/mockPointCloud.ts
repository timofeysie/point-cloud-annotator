import * as THREE from 'three';

/**
 * Creates a mock point cloud for development when potree-loader doesn't work.
 * This provides a 3D scene that can be clicked for annotations.
 * 
 * The mock uses the same bounding box as the real lion_takanawa point cloud
 * to maintain consistent camera positioning and annotation coordinates.
 */
export function createMockPointCloud(): THREE.Group {
  const group = new THREE.Group();
  
  // Use the same bounding box as the real lion_takanawa point cloud
  // This ensures annotations work with consistent coordinates
  const boundingBox = {
    lx: -0.748212993144989,
    ly: -2.78040599822998,
    lz: 2.54782128334045,
    ux: 3.89967638254166,
    uy: 1.86748337745667,
    uz: 7.1957106590271
  };
  
  const center = new THREE.Vector3(
    (boundingBox.lx + boundingBox.ux) / 2,
    (boundingBox.ly + boundingBox.uy) / 2,
    (boundingBox.lz + boundingBox.uz) / 2
  );
  
  const size = new THREE.Vector3(
    boundingBox.ux - boundingBox.lx,
    boundingBox.uy - boundingBox.ly,
    boundingBox.uz - boundingBox.lz
  );
  
  // Create a point cloud using Three.js Points
  // Generate points in a grid pattern within the bounding box
  const pointCount = 5000; // Enough points to look like a point cloud
  const points: THREE.Vector3[] = [];
  const colors: number[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    // Random points within the bounding box
    const x = boundingBox.lx + Math.random() * size.x;
    const y = boundingBox.ly + Math.random() * size.y;
    const z = boundingBox.lz + Math.random() * size.z;
    
    points.push(new THREE.Vector3(x, y, z));
    
    // Add some color variation (simulate RGB colors)
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(r, g, b);
  }
  
  // Create geometry and material for the point cloud
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    sizeAttenuation: true,
  });
  
  const pointCloud = new THREE.Points(geometry, material);
  group.add(pointCloud);
  
  // Add a wireframe box to show the bounding box
  const boxHelper = new THREE.Box3Helper(
    new THREE.Box3(
      new THREE.Vector3(boundingBox.lx, boundingBox.ly, boundingBox.lz),
      new THREE.Vector3(boundingBox.ux, boundingBox.uy, boundingBox.uz)
    ),
    0x00ff00
  );
  boxHelper.material.opacity = 0.2;
  boxHelper.material.transparent = true;
  group.add(boxHelper);
  
  // Store bounding box info for camera positioning
  (group as any).boundingBox = new THREE.Box3(
    new THREE.Vector3(boundingBox.lx, boundingBox.ly, boundingBox.lz),
    new THREE.Vector3(boundingBox.ux, boundingBox.uy, boundingBox.uz)
  );
  
  return group;
}

/**
 * Checks if we should use the mock point cloud (development mode)
 */
export function shouldUseMockPointCloud(): boolean {
  // Disable mock if explicitly disabled
  if (import.meta.env.VITE_USE_MOCK_POINT_CLOUD === 'false') {
    return false;
  }
  // Use mock in development mode, or if explicitly enabled
  return import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_POINT_CLOUD === 'true';
}

