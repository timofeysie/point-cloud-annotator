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
  const pointCloudLoadedRef = useRef<boolean>(false); // Track if point cloud has been loaded
  const initializationStartedRef = useRef<boolean>(false); // Track if initialization has started
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ x: number; y: number; z: number } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [pointCloudReady, setPointCloudReady] = useState(false);

  // Load annotations on mount
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const loadedAnnotations = await annotationService.getAll();
        setAnnotations(loadedAnnotations);
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    };

    loadAnnotations();
  }, []);


  // Initialize Potree viewer - CRITICAL: This must only run once
  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent multiple initializations - check both viewer and initialization flag
    if (viewerRef.current || initializationStartedRef.current) {
      console.log('[Potree] Viewer already initialized or initialization started, skipping');
      return;
    }
    
    // Mark initialization as started immediately to prevent race conditions
    initializationStartedRef.current = true;
      
    // Wait for Potree to be fully loaded (from script tag in index.html)
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const checkPotree = () => {
      if (typeof (window as any).Potree === 'undefined') {
        console.warn('Potree not loaded yet, retrying...');
        retryTimeout = setTimeout(checkPotree, 100);
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

      // Prevent multiple point cloud loads
      if (pointCloudLoadedRef.current) {
        console.warn('[Potree] Point cloud load already initiated, skipping');
        return;
      }

      pointCloudLoadedRef.current = true;
      
      Potree.loadPointCloud(pointCloudPath, pointCloudName, function(e: any) {
        console.log('✓ Point cloud loaded:', e);
        
        // CRITICAL: Multiple checks to prevent duplicate point cloud addition
        // This prevents the point cloud from being split/fragmented on re-renders
        
        // Check 1: Is point cloud ref already set?
        if (pointCloudRef.current) {
          console.warn('[Potree] Point cloud ref already exists, skipping add');
          return;
        }
        
        // Check 2: Does the point cloud already exist in the scene?
        const existingPointClouds = viewer.scene.pointclouds || [];
        const alreadyAdded = existingPointClouds.some((pc: any) => {
          return pc && (pc.name === pointCloudName || pc === e.pointcloud);
        });
        
        if (alreadyAdded) {
          console.warn('[Potree] Point cloud already in scene, using existing');
          const existing = existingPointClouds.find((pc: any) => pc.name === pointCloudName) || existingPointClouds[0];
          pointCloudRef.current = existing;
          // Still mark as ready since point cloud exists
          setTimeout(() => {
            setPointCloudReady(true);
          }, 100);
          return;
        }
        
        // Check 3: Verify viewer is still valid (not recreated)
        if (!viewerRef.current || viewerRef.current !== viewer) {
          console.warn('[Potree] Viewer changed, skipping point cloud add');
          return;
        }
        
        // All checks passed - add point cloud
        try {
          viewer.scene.addPointCloud(e.pointcloud);
          pointCloudRef.current = e.pointcloud;
          
          let material = e.pointcloud.material;
          material.size = 1;
          material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
          
          // Enable vertex colors so we can highlight annotated points
          if (material.vertexColors !== undefined) {
            material.vertexColors = true;
          }
          
          viewer.fitToScreen();
        
          console.log('✓ Point cloud added to scene and camera fitted');
          
          // Mark point cloud as ready to trigger click handler setup
          setTimeout(() => {
            setPointCloudReady(true);
          }, 100);
      } catch (error) {
          console.error('[Potree] Error adding point cloud:', error);
          // If error, still set ref to prevent retry
          pointCloudRef.current = e.pointcloud;
          // Still mark as ready if we have the point cloud object
          if (e.pointcloud) {
            setTimeout(() => {
              setPointCloudReady(true);
            }, 100);
          }
        }
        
        console.log('[Potree] Setup complete:', {
          hasWindowTHREE: !!(window as any).THREE,
          pointCloudType: typeof e.pointcloud,
          hasPickMethod: typeof e.pointcloud.pick === 'function',
          pointCloudName: e.pointcloud.name,
          pointCloudsInScene: existingPointClouds.length
        });
      });
    };

    // Start checking for Potree
    checkPotree();
    
    // Cleanup function
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      // Note: Potree viewer cleanup is handled by React unmounting the container
      // We don't manually destroy the viewer here to avoid issues on re-renders
    };
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
      console.log('[Annotation] Deleted annotation:', id);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      alert('Failed to delete annotation. Please try again.');
    }
  };

  // Track annotation markers to prevent duplicates (same approach as point cloud)
  const annotationMarkersRef = useRef<Map<string, any>>(new Map());

  // Highlight annotated points with red square borders
  // CRITICAL: Apply same duplicate prevention logic as point cloud to avoid fractured markers
  useEffect(() => {
    if (!viewerRef.current || !pointCloudRef.current || annotations.length === 0) {
      return;
    }

    const Potree = (window as any).Potree;
    const THREE = (window as any).THREE;
    
    if (!THREE || !Potree) {
      return;
    }

    try {
      // Access the Three.js scene to add highlight markers
      const potreeScene = viewerRef.current.scene;
      let threeScene: any = null;
      
      // Find the Three.js scene (same logic as before)
      if (potreeScene.scene) {
        threeScene = potreeScene.scene;
      } else if (potreeScene.sceneNode) {
        threeScene = potreeScene.sceneNode;
      } else if (viewerRef.current.sceneNode) {
        threeScene = viewerRef.current.sceneNode;
      } else if (typeof potreeScene.add === 'function') {
        threeScene = potreeScene;
      }
      
      if (!threeScene || typeof threeScene.add !== 'function') {
        console.warn('[Annotation] Could not find Three.js scene for highlighting');
        return;
      }
      
      // CRITICAL: Remove markers that no longer exist in annotations (same as point cloud logic)
      const existingMarkerIds = new Set(annotations.map(a => a.id));
      const markersToRemove: any[] = [];
      
      annotationMarkersRef.current.forEach((marker, annotationId) => {
        if (!existingMarkerIds.has(annotationId)) {
          markersToRemove.push(marker);
          annotationMarkersRef.current.delete(annotationId);
        }
      });
      
      markersToRemove.forEach((marker) => {
        // Remove from point cloud if it's a child, otherwise from scene
        if (marker.parent) {
          marker.parent.remove(marker);
        } else if (threeScene && typeof threeScene.remove === 'function') {
          threeScene.remove(marker);
        }
        if (marker.geometry) marker.geometry.dispose();
        if (marker.material) marker.material.dispose();
      });
      
      // Create red square border markers at each annotation location
      annotations.forEach((annotation) => {
        // CRITICAL: Check if marker already exists (prevent duplicates)
        if (annotationMarkersRef.current.has(annotation.id)) {
          const existingMarker = annotationMarkersRef.current.get(annotation.id);
          // Check if it's still in the scene
          if (existingMarker && existingMarker.parent === threeScene) {
            // Marker already exists and is valid, skip
            return;
          } else {
            // Marker exists but was removed, clean up ref
            annotationMarkersRef.current.delete(annotation.id);
          }
        }
        
        // Check if marker already exists in point cloud or scene (double-check)
        let existingInScene: any = null;
        if (pointCloudRef.current && pointCloudRef.current.children) {
          existingInScene = pointCloudRef.current.children.find((child: any) => 
            child.userData && child.userData.annotationId === annotation.id
          );
        }
        if (!existingInScene && threeScene.children) {
          existingInScene = threeScene.children.find((child: any) => 
            child.userData && child.userData.annotationId === annotation.id
          );
        }
        
        if (existingInScene) {
          // Already in scene, use existing
          annotationMarkersRef.current.set(annotation.id, existingInScene);
          return;
        }
        
        // Create a square border using LineSegments
        // Make it slightly larger than a normal point to create a border effect
        const squareSize = 0.15; // Size of the border square (slightly larger than points)
        
        // Create vertices for a square border (just the edges, not filled)
        const vertices = new Float32Array([
          -squareSize/2, -squareSize/2, 0,  // Bottom-left
          squareSize/2, -squareSize/2, 0,   // Bottom-right
          squareSize/2, -squareSize/2, 0,   // Bottom-right
          squareSize/2, squareSize/2, 0,     // Top-right
          squareSize/2, squareSize/2, 0,     // Top-right
          -squareSize/2, squareSize/2, 0,    // Top-left
          -squareSize/2, squareSize/2, 0,    // Top-left
          -squareSize/2, -squareSize/2, 0    // Bottom-left
        ]);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        // Create red line material for the border
        const material = new THREE.LineBasicMaterial({
          color: 0xff0000, // Bright red
          linewidth: 2,
          transparent: true,
          opacity: 1.0
        });
        
        // Create the square border using LineSegments
        const border = new THREE.LineSegments(geometry, material);
        
        // CRITICAL: Add marker as child of point cloud to ensure same coordinate system
        // Potree point clouds may have local coordinate systems, so we need to add
        // markers in the same space as the point cloud
        if (pointCloudRef.current && typeof pointCloudRef.current.add === 'function') {
          // Add as child of point cloud (same coordinate space)
          pointCloudRef.current.add(border);
        } else {
          // Fallback: add to scene
          threeScene.add(border);
        }
        
        // CRITICAL: Use annotation coordinates in point cloud's local space
        // Potree's pick() returns coordinates in the point cloud's local coordinate system
        border.position.set(annotation.x, annotation.y, annotation.z);
        
        // Store annotation coordinates for reference
        border.userData.annotationCoords = { x: annotation.x, y: annotation.y, z: annotation.z };
        border.userData.annotationId = annotation.id;
        border.userData.isAnnotationHighlight = true;
        border.userData.updateOrientation = true;
        
        // Store in ref to prevent duplicates
        annotationMarkersRef.current.set(annotation.id, border);
      });
      
      // Set up animation loop to keep borders facing camera (billboard effect)
      if (viewerRef.current && !viewerRef.current._annotationHighlightUpdate) {
        viewerRef.current._annotationHighlightUpdate = () => {
          const camera = viewerRef.current?.scene?.getActiveCamera();
          if (!camera || !threeScene) return;
          
          threeScene.children.forEach((child: any) => {
            if (child.userData && child.userData.isAnnotationHighlight && child.userData.updateOrientation) {
              // Get original annotation coordinates
              const coords = child.userData.annotationCoords;
              if (!coords) return;
              
              // Reset position to ensure it's exactly at annotation coordinates
              child.position.set(coords.x, coords.y, coords.z);
              
              // Make square appear as a square (billboard effect)
              // The square geometry is defined in the XY plane (z=0)
              // We want it to always face the camera so it appears as a square
              const cameraWorldPos = new THREE.Vector3();
              camera.getWorldPosition(cameraWorldPos);
              
              // Get the square's world position
              const squareWorldPos = child.getWorldPosition(new THREE.Vector3());
              
              // Calculate direction from square to camera
              const toCamera = new THREE.Vector3();
              toCamera.subVectors(cameraWorldPos, squareWorldPos).normalize();
              
              // For a billboard, we want the square's normal (local -Z) to point toward camera
              // The square is in XY plane, so its normal is -Z
              // We'll use lookAt but need to account for the square's orientation
              
              // Simple approach: make the square face the camera
              // lookAt makes the object's -Z axis point toward the target
              child.lookAt(cameraWorldPos);
            }
          });
        };
        
        // Hook into Potree's update/render loop
        const originalUpdate = viewerRef.current.update;
        if (originalUpdate) {
          viewerRef.current.update = function(...args: any[]) {
            const result = originalUpdate.apply(this, args);
            if (this._annotationHighlightUpdate) {
              this._annotationHighlightUpdate();
            }
            return result;
          };
        }
      }
      
      console.log('[Annotation] Added red square borders for', annotations.length, 'annotations');
      
    } catch (error) {
      console.warn('[Annotation] Error creating highlight markers:', error);
    }
  }, [annotations, pointCloudReady]);

  // Use refs to track state without causing re-renders
  const isDialogOpenRef = useRef(false);
  const selectedAnnotationRef = useRef<Annotation | null>(null);
  const annotationsRef = useRef<Annotation[]>([]);
  const clickHandlerSetupRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isDialogOpenRef.current = isDialogOpen;
  }, [isDialogOpen]);

  useEffect(() => {
    selectedAnnotationRef.current = selectedAnnotation;
  }, [selectedAnnotation]);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  // Handle marker clicks and point cloud clicks
  useEffect(() => {
    if (!viewerRef.current || !containerRef.current) {
      console.log('[Click Handler] Not ready:', { 
        hasViewer: !!viewerRef.current, 
        hasContainer: !!containerRef.current,
        pointCloudReady: pointCloudReady
      });
      return;
    }

    // Wait for point cloud to be ready
    if (!pointCloudReady) {
      console.log('[Click Handler] Point cloud not ready yet, waiting...', {
        pointCloudReady: pointCloudReady,
        hasPointCloudRef: !!pointCloudRef.current
      });
      return;
    }

    if (!pointCloudRef.current) {
      console.warn('[Click Handler] Point cloud ready but ref not set - this should not happen');
      return;
    }

    // Prevent multiple setups
    if (clickHandlerSetupRef.current) {
      console.log('[Click Handler] Click handler already set up, skipping');
      return;
    }

    console.log('[Click Handler] Setting up click handler', {
      hasViewer: !!viewerRef.current,
      hasContainer: !!containerRef.current,
      hasPointCloud: !!pointCloudRef.current,
      pointCloudReady: pointCloudReady
    });
    clickHandlerSetupRef.current = true;

    const handleClick = (event: MouseEvent) => {
      console.log('[Click Handler] Click event received', {
        target: event.target,
        currentTarget: event.currentTarget,
        clientX: event.clientX,
        clientY: event.clientY
      });
      
      // Use refs to check current state without causing re-renders
      if (isDialogOpenRef.current) {
        console.log('[Click Handler] Dialog is open, ignoring click');
        return;
      }
      
      // Don't prevent default or stop propagation - let Potree handle it too if needed
      // We'll just process the click in parallel

      const Potree = (window as any).Potree;
      const THREE = (window as any).THREE || (Potree?.THREE);
      
      if (!THREE) {
        console.warn('[Click Handler] Three.js not available');
        return;
      }
      
      if (!viewerRef.current) {
        console.warn('[Click Handler] Viewer not available');
        return;
      }
      
      if (!pointCloudRef.current) {
        console.warn('[Click Handler] Point cloud not available');
        return;
      }

      console.log('[Click Handler] Processing click...');

      const mouse = new THREE.Vector2();
      if (!containerRef.current) {
        console.warn('[Click Handler] Container not available');
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const camera = viewerRef.current.scene.getActiveCamera();
      
      if (!camera) {
        console.warn('[Click Handler] Camera not available');
        return;
      }

      raycaster.setFromCamera(mouse, camera);

      // Pick a point on the point cloud - only if we actually hit a point
      if (!selectedAnnotationRef.current && pointCloudRef.current) {
        console.log('[Click Handler] Attempting to pick point on point cloud');
        
        let clickedPoint: any = null;
        let clickedCoords: { x: number; y: number; z: number } | null = null;
        
        // Try to use Potree's pick method first (most accurate)
        const viewer = viewerRef.current;
        if (viewer && viewer.renderer) {
          try {
            // Potree pick method - this should only return a point if we actually hit one
            clickedPoint = pointCloudRef.current.pick(
              viewer,
              camera,
              mouse
            );
            
            if (clickedPoint && clickedPoint.position) {
              clickedCoords = {
                x: clickedPoint.position.x,
                y: clickedPoint.position.y,
                z: clickedPoint.position.z,
              };
              console.log('[Click Handler] Potree pick found point:', clickedCoords);
            } else {
              console.log('[Click Handler] Potree pick returned no point');
            }
          } catch (error) {
            console.warn('[Click Handler] Potree pick failed:', error);
          }
        }
        
        // Fallback: Use raycasting with point cloud bounding box if Potree pick didn't work
        // This is more permissive but still requires hitting the bounding box
        if (!clickedCoords) {
          try {
            // Get point cloud bounding box for intersection test
            const boundingBox = pointCloudRef.current.boundingBox;
            
            if (boundingBox) {
              // Use Three.js Box3.intersectRay to check if ray hits the bounding box
              const box3 = new THREE.Box3().copy(boundingBox);
              const ray = new THREE.Ray(raycaster.ray.origin, raycaster.ray.direction);
              const intersectionPoint = new THREE.Vector3();
              
              const hit = ray.intersectBox(box3, intersectionPoint);
              
              if (hit) {
                // We hit the bounding box - use the intersection point
                // This is less accurate than Potree pick but better than nothing
                clickedCoords = {
                  x: intersectionPoint.x,
                  y: intersectionPoint.y,
                  z: intersectionPoint.z,
                };
                console.log('[Click Handler] Fallback: raycast found point on bounding box:', clickedCoords);
              } else {
                // No intersection with bounding box - clicked on empty space
                console.log('[Click Handler] No point found - clicked on empty space (no bounding box intersection)');
                return; // Don't open modal
              }
            } else {
              // No bounding box available - can't verify we hit a point
              console.log('[Click Handler] No bounding box available - cannot verify point hit');
              return; // Don't open modal
            }
          } catch (error) {
            console.warn('[Click Handler] Fallback raycast failed:', error);
            return; // Don't open modal if raycasting fails
          }
        }
        
        // We found a point - check if clicking near an existing annotation
        if (clickedCoords) {
          const currentAnnotations = annotationsRef.current;
          if (currentAnnotations.length > 0) {
            const threshold = 0.5;
            let nearestAnnotation: Annotation | null = null;
            let minDistance = Infinity;
            
            for (const ann of currentAnnotations) {
              const distance = Math.sqrt(
                Math.pow(ann.x - clickedCoords.x, 2) +
                Math.pow(ann.y - clickedCoords.y, 2) +
                Math.pow(ann.z - clickedCoords.z, 2)
              );
              if (distance < minDistance && distance < threshold) {
                minDistance = distance;
                nearestAnnotation = ann;
              }
            }
            
            if (nearestAnnotation) {
              console.log('[Click Handler] Found nearby annotation:', nearestAnnotation.id);
              setSelectedAnnotation(nearestAnnotation);
              return;
            }
          }
          
          // Not near an annotation - create new annotation at the actual point
          console.log('[Click Handler] Opening dialog for new annotation at point:', clickedCoords);
          setPendingCoordinates(clickedCoords);
          setIsDialogOpen(true);
        }
      } else if (selectedAnnotationRef.current) {
        // Clicking elsewhere - close annotation details
        console.log('[Click Handler] Closing annotation details');
        setSelectedAnnotation(null);
      } else {
        console.log('[Click Handler] No point cloud or selected annotation');
      }
    };

    const container = containerRef.current;
    container.addEventListener('click', handleClick, false); // Use capture phase to catch clicks before Potree
    
    console.log('[Click Handler] Click listener attached to container');

    return () => {
      container.removeEventListener('click', handleClick, false);
      clickHandlerSetupRef.current = false;
      console.log('[Click Handler] Click listener removed');
    };
  }, [pointCloudReady]); // Re-run when point cloud becomes ready

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

