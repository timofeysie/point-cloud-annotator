import { useEffect, useRef, useState } from 'react';
import { Annotation } from '../types/annotation';
import { annotationService } from '../services/annotationService';
import { AnnotationDialog } from './AnnotationDialog';

/**
 * PotreeViewer - Component that exactly mirrors the working lion.html example
 * Uses the actual Potree library (not potree-loader npm package)
 * 
 * Based on: potree/examples/lion.html
 * Extended with annotation functionality
 */
export function PotreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const pointCloudRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ x: number; y: number; z: number } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load annotations on mount
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        setIsLoading(true);
        const loadedAnnotations = await annotationService.getAll();
        setAnnotations(loadedAnnotations);
      } catch (error) {
        console.error('Failed to load annotations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnotations();
  }, []);


  // Initialize Potree viewer
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
      viewer.setDescription('');

      // Load point cloud exactly as in lion.html
      const pointCloudPath = '/pointclouds/lion_takanawa/cloud.js';
      const pointCloudName = 'lion';

      console.log('Loading point cloud:', { path: pointCloudPath, name: pointCloudName });

      Potree.loadPointCloud(pointCloudPath, pointCloudName, function(e: any) {
        console.log('✓ Point cloud loaded:', e);
        
        viewer.scene.addPointCloud(e.pointcloud);
        pointCloudRef.current = e.pointcloud;
        
        let material = e.pointcloud.material;
        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        
        viewer.fitToScreen();
        
        console.log('✓ Point cloud added to scene and camera fitted');
        console.log('[Potree] Setup complete:', {
          hasWindowTHREE: !!(window as any).THREE,
          pointCloudType: typeof e.pointcloud,
          hasPickMethod: typeof e.pointcloud.pick === 'function',
          pointCloudName: e.pointcloud.name
        });
      });
    };

    // Start checking for Potree
    checkPotree();
  }, []);

  // Handle annotation creation
  const handleAnnotationSave = async (text: string) => {
    if (!pendingCoordinates) return;

    try {
      const newAnnotation = await annotationService.create(
        pendingCoordinates.x,
        pendingCoordinates.y,
        pendingCoordinates.z,
        text
      );
      setAnnotations((prev) => [...prev, newAnnotation]);
      setPendingCoordinates(null);
    } catch (error) {
      console.error('Failed to create annotation:', error);
      alert('Failed to create annotation. Please try again.');
    }
  };

  // Handle annotation deletion
  const handleAnnotationDelete = async (id: string) => {
    try {
      await annotationService.delete(id);
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      setSelectedAnnotation(null);
      
      // Remove marker from scene
      const marker = markersRef.current.get(id);
      if (marker && viewerRef.current) {
        const potreeScene = viewerRef.current.scene;
        let threeScene: any = potreeScene.scene || potreeScene.sceneNode || viewerRef.current.sceneNode;
        
        if (!threeScene && typeof potreeScene.add === 'function') {
          threeScene = potreeScene;
        }
        
        if (threeScene && typeof threeScene.remove === 'function') {
          threeScene.remove(marker);
          console.log('[Annotation] Removed marker from scene:', id);
        }
        markersRef.current.delete(id);
      }
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      alert('Failed to delete annotation. Please try again.');
    }
  };

  // Render annotation markers
  useEffect(() => {
    if (!viewerRef.current || isLoading) {
      console.log('[Annotation] Skipping marker render:', { 
        hasViewer: !!viewerRef.current, 
        isLoading 
      });
      return;
    }

    // Potree bundles Three.js - try to access it through Potree or window
    const Potree = (window as any).Potree;
    const THREE = (window as any).THREE || (Potree?.THREE);

    if (!THREE) {
      console.error('[Annotation] Three.js not available for marker rendering');
      console.log('[Annotation] Available globals:', {
        hasPotree: !!Potree,
        hasWindowTHREE: !!(window as any).THREE,
        hasPotreeTHREE: !!Potree?.THREE,
        potreeKeys: Potree ? Object.keys(Potree).slice(0, 10) : []
      });
      return;
    }

    console.log('[Annotation] Rendering markers:', { count: annotations.length });

    // Potree's scene is a wrapper - we need to access the underlying Three.js scene
    const potreeScene = viewerRef.current.scene;
    let threeScene: any = null;

    // Try different ways to access the Three.js scene
    if (potreeScene.scene) {
      // Potree scene might have a .scene property with the Three.js scene
      threeScene = potreeScene.scene;
      console.log('[Annotation] Found Three.js scene via potreeScene.scene');
    } else if (potreeScene.sceneNode) {
      threeScene = potreeScene.sceneNode;
      console.log('[Annotation] Found Three.js scene via potreeScene.sceneNode');
    } else if (viewerRef.current.sceneNode) {
      threeScene = viewerRef.current.sceneNode;
      console.log('[Annotation] Found Three.js scene via viewer.sceneNode');
    } else if (viewerRef.current.scene && (viewerRef.current.scene as any).scene) {
      threeScene = (viewerRef.current.scene as any).scene;
      console.log('[Annotation] Found Three.js scene via viewer.scene.scene');
    } else {
      // Last resort: check if Potree scene itself is a Three.js scene
      if (typeof potreeScene.add === 'function') {
        threeScene = potreeScene;
        console.log('[Annotation] Potree scene has add method, using directly');
      } else {
        console.error('[Annotation] Could not find Three.js scene in Potree viewer');
        console.log('[Annotation] Potree scene structure:', {
          keys: Object.keys(potreeScene),
          type: typeof potreeScene,
          hasAdd: typeof potreeScene.add === 'function',
          hasScene: !!potreeScene.scene,
          hasSceneNode: !!potreeScene.sceneNode
        });
        return;
      }
    }

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!annotations.find((ann) => ann.id === id)) {
        if (threeScene && typeof threeScene.remove === 'function') {
          threeScene.remove(marker);
        }
        markersRef.current.delete(id);
        console.log('[Annotation] Removed marker:', id);
      }
    });

    // Add new markers
    annotations.forEach((annotation) => {
      if (markersRef.current.has(annotation.id)) {
        // Update existing marker position if coordinates changed
        const existingMarker = markersRef.current.get(annotation.id);
        existingMarker.position.set(annotation.x, annotation.y, annotation.z);
        return;
      }

      // Create a red sphere marker
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(geometry, material);
      
      // Position marker at annotation coordinates
      marker.position.set(annotation.x, annotation.y, annotation.z);
      marker.userData.annotation = annotation;
      marker.userData.isAnnotationMarker = true;

      if (threeScene && typeof threeScene.add === 'function') {
        threeScene.add(marker);
        markersRef.current.set(annotation.id, marker);
        console.log('[Annotation] Added marker:', annotation.id, 'at', { x: annotation.x, y: annotation.y, z: annotation.z });
      } else {
        console.error('[Annotation] Cannot add marker - threeScene.add is not a function');
      }
    });
  }, [annotations, isLoading]);

  // Handle marker clicks and point cloud clicks
  useEffect(() => {
    if (!viewerRef.current || !containerRef.current) {
      console.log('[Click Handler] Not ready:', { 
        hasViewer: !!viewerRef.current, 
        hasContainer: !!containerRef.current 
      });
      return;
    }

    if (!pointCloudRef.current) {
      console.log('[Click Handler] Point cloud not loaded yet, skipping click handler setup');
      return;
    }

    console.log('[Click Handler] Setting up click handler');

    const handleClick = (event: MouseEvent) => {
      console.log('[Click Handler] Click detected:', {
        target: (event.target as HTMLElement)?.tagName,
        isDialogOpen,
        hasSelectedAnnotation: !!selectedAnnotation,
        hasPointCloud: !!pointCloudRef.current
      });

      // Don't handle if dialog is open
      if (isDialogOpen) {
        console.log('[Click Handler] Dialog is open, ignoring click');
        return;
      }

      const Potree = (window as any).Potree;
      const THREE = (window as any).THREE || (Potree?.THREE);
      
      if (!THREE) {
        console.error('[Click Handler] Three.js not available');
        return;
      }

      if (!viewerRef.current) {
        console.error('[Click Handler] Viewer not available');
        return;
      }

      const mouse = new THREE.Vector2();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      console.log('[Click Handler] Mouse coordinates:', { 
        mouseX: mouse.x, 
        mouseY: mouse.y,
        rect: { width: rect.width, height: rect.height }
      });

      // Raycast to check if we clicked on a marker
      const raycaster = new THREE.Raycaster();
      const camera = viewerRef.current.scene.getActiveCamera();
      
      if (!camera) {
        console.error('[Click Handler] Camera not available');
        return;
      }

      raycaster.setFromCamera(mouse, camera);

      // Check all markers for intersection
      let clickedMarker: any = null;
      markersRef.current.forEach((marker, id) => {
        const intersects = raycaster.intersectObject(marker, false);
        if (intersects.length > 0) {
          console.log('[Click Handler] Clicked on marker:', id);
          clickedMarker = marker;
        }
      });

      if (clickedMarker?.userData?.annotation) {
        // Clicked on a marker - show annotation details
        console.log('[Click Handler] Showing annotation details:', clickedMarker.userData.annotation.id);
        setSelectedAnnotation(clickedMarker.userData.annotation);
        return;
      }

      // Not clicking on a marker - try to create new annotation
      if (!selectedAnnotation && pointCloudRef.current) {
        console.log('[Click Handler] Attempting to pick point on point cloud');
        
        // Use Potree's pick method or Three.js raycasting to find intersection
        try {
          // Try Potree's pick method first
          const point = pointCloudRef.current.pick(
            camera,
            mouse,
            viewerRef.current.scene.pointclouds,
            {}
          );
          
          console.log('[Click Handler] Potree pick result:', point);
          
          if (point && point.position) {
            const coords = {
              x: point.position.x,
              y: point.position.y,
              z: point.position.z,
            };
            console.log('[Click Handler] Point picked, opening dialog:', coords);
            setPendingCoordinates(coords);
            setIsDialogOpen(true);
            return;
          } else {
            console.log('[Click Handler] Potree pick returned no point');
          }
        } catch (error) {
          console.warn('[Click Handler] Potree pick method failed, trying fallback:', error);
        }

        // Fallback: use Three.js raycasting with bounding box
        try {
          console.log('[Click Handler] Trying fallback raycasting');
          const box = new THREE.Box3().setFromObject(pointCloudRef.current);
          if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3());
            // Use a point along the ray for better accuracy
            raycaster.ray.direction.normalize();
            const distance = raycaster.ray.origin.distanceTo(center);
            const pointOnRay = raycaster.ray.origin.clone().add(
              raycaster.ray.direction.clone().multiplyScalar(distance * 0.5)
            );
            
            const coords = {
              x: pointOnRay.x,
              y: pointOnRay.y,
              z: pointOnRay.z,
            };
            console.log('[Click Handler] Fallback raycasting succeeded, opening dialog:', coords);
            setPendingCoordinates(coords);
            setIsDialogOpen(true);
          } else {
            console.log('[Click Handler] Bounding box is empty');
          }
        } catch (error) {
          console.error('[Click Handler] Raycasting failed:', error);
        }
      } else if (selectedAnnotation) {
        // Clicking elsewhere - close annotation details
        console.log('[Click Handler] Closing annotation details');
        setSelectedAnnotation(null);
      } else {
        console.log('[Click Handler] No point cloud or selected annotation, ignoring click');
      }
    };

    const container = containerRef.current;
    container.addEventListener('click', handleClick);
    console.log('[Click Handler] Click listener attached to container');

    return () => {
      container.removeEventListener('click', handleClick);
      console.log('[Click Handler] Click listener removed');
    };
  }, [isDialogOpen, selectedAnnotation, pointCloudRef.current]);

  return (
    <>
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
      
      {isDialogOpen && pendingCoordinates && (
        <AnnotationDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setPendingCoordinates(null);
          }}
          onSave={handleAnnotationSave}
          x={pendingCoordinates.x}
          y={pendingCoordinates.y}
          z={pendingCoordinates.z}
        />
      )}

      {selectedAnnotation && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-40">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">Annotation</h3>
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Coordinates: ({selectedAnnotation.x.toFixed(2)}, {selectedAnnotation.y.toFixed(2)}, {selectedAnnotation.z.toFixed(2)})
          </p>
          <p className="text-gray-800 mb-4">{selectedAnnotation.text}</p>
          <button
            onClick={() => handleAnnotationDelete(selectedAnnotation.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Annotation
          </button>
        </div>
      )}
    </>
  );
}

