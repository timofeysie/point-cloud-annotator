import { useEffect, useRef } from 'react';

/**
 * PotreeViewer - Component that exactly mirrors the working lion.html example
 * Uses the actual Potree library (not potree-loader npm package)
 * 
 * Based on: potree/examples/lion.html
 */
export function PotreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for Potree to be fully loaded (from script tag in index.html)
    const checkPotree = () => {
      if (typeof (window as any).Potree === 'undefined') {
        console.warn('Potree not loaded yet, retrying...');
        setTimeout(checkPotree, 100);
        return;
      }

      const Potree = (window as any).Potree;
      
      // Verify Potree.Viewer exists
      if (!Potree.Viewer) {
        console.error('Potree.Viewer is not available. Potree may not have loaded correctly.');
        console.log('Available Potree properties:', Object.keys(Potree));
        return;
      }

      // Create viewer exactly as in lion.html
      const viewer = new Potree.Viewer(containerRef.current);
      viewerRef.current = viewer;

      // Configure viewer exactly as in lion.html
      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(1_000_000);
      // viewer.loadSettingsFromURL(); // Skip for minimal version
      viewer.setDescription('');

      // Load point cloud exactly as in lion.html
      // Potree.loadPointCloud(path, name, callback)
      const pointCloudPath = '/pointclouds/lion_takanawa/cloud.js';
      const pointCloudName = 'lion';

      console.log('Loading point cloud:', { path: pointCloudPath, name: pointCloudName });

      Potree.loadPointCloud(pointCloudPath, pointCloudName, function(e: any) {
        console.log('✓ Point cloud loaded:', e);
        
        viewer.scene.addPointCloud(e.pointcloud);
        
        let material = e.pointcloud.material;
        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        
        viewer.fitToScreen();
        
        console.log('✓ Point cloud added to scene and camera fitted');
      });
    };

    // Start checking for Potree
    checkPotree();

    // Cleanup
    return () => {
      if (viewerRef.current) {
        // Potree.Viewer cleanup if needed
        // The viewer manages its own resources
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}

