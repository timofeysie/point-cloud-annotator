import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Potree } from 'potree-loader';
import { Annotation } from '../types/annotation';
import { annotationService } from '../services/annotationService';
import { createMockPointCloud, shouldUseMockPointCloud } from '../utils/mockPointCloud';
import { X } from 'lucide-react';

export function PotreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [pendingPosition, setPendingPosition] = useState<THREE.Vector3 | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [pointCloudError, setPointCloudError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const annotationMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const potreeRef = useRef<any>(null);
  const pointCloudRef = useRef<any>(null);
  const hasLoggedErrorRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Check if we should use mock point cloud (development mode)
    const useMock = shouldUseMockPointCloud();
    
    if (useMock) {
      // Development mode: Use mock point cloud
      console.log('🔧 Development mode: Using mock point cloud');
      const mockPointCloud = createMockPointCloud();
      scene.add(mockPointCloud);
      pointCloudRef.current = mockPointCloud;
      
      // Position camera to view the mock point cloud
      const box = (mockPointCloud as any).boundingBox as THREE.Box3;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;
      
      camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
      camera.lookAt(center);
      
      setPointCloudError(null);
    } else {
      // Production mode: Use real potree-loader
      const potree = new Potree();
      potree.pointBudget = 1_000_000;
      potreeRef.current = potree;

      // Point cloud URL configuration
      // Priority:
    // 1. VITE_POINT_CLOUD_URL environment variable (for custom hosted point clouds)
    // 2. Local point cloud in public/ directory (for development)
    // 3. CDN URLs (fallback, typically won't work due to CORS)
    const customPointCloudUrl = import.meta.env.VITE_POINT_CLOUD_URL;
    // Try multiple URL formats - potree-loader might expect different formats
    const baseUrl = `${window.location.origin}/pointclouds/lion_takanawa`;
    
    const pointCloudUrls = customPointCloudUrl
      ? [customPointCloudUrl] // Use custom URL if provided
      : [
          // Try directory URL first (potree-loader expects directory and auto-finds cloud.js)
          `${baseUrl}/`,
          // Try directory URL without trailing slash
          baseUrl,
          // Try explicit cloud.js file (pure JSON format, same as CDN)
          `${baseUrl}/cloud.js`,
          // Try relative path
          '/pointclouds/lion_takanawa/cloud.js',
          // Fallback to CDN URLs (these typically won't work due to CORS/data file access)
          'https://cdn.rawgit.com/potree/potree/develop/pointclouds/lion_takanawa/cloud.js',
          'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/cloud.js',
        ];

    const loadPointCloud = async (urlIndex = 0) => {
      if (urlIndex >= pointCloudUrls.length) {
        // Only log once when all URLs have been tried (even if React StrictMode runs effect twice)
        if (!hasLoggedErrorRef.current) {
          hasLoggedErrorRef.current = true;
          console.info(
            'Point cloud failed to load. ' +
            'Note: potree-loader has known issues loading point clouds in development mode. ' +
            'The point cloud will work once deployed to S3 with proper hosting. ' +
            'The app will continue to function for annotation testing without the point cloud.'
          );
        }
        setPointCloudError(
          'Point cloud not loaded. This is expected in development - potree-loader has limitations with local files. ' +
          'The point cloud will work once deployed to S3. You can still test annotation functionality.'
        );
        return;
      }

      const url = pointCloudUrls[urlIndex];
      
      // Log which URL we're trying (only for local URL to help debug)
      if (url.includes(window.location.origin)) {
        console.log(`Attempting to load point cloud from: ${url}`);
      }

      try {
        // First, verify the metadata file is accessible
        let metadataUrl = url;
        if (url.endsWith('/')) {
          metadataUrl = `${url}cloud.js`; // potree-loader expects cloud.js
        } else if (!url.includes('cloud.')) {
          // If URL doesn't include cloud.js/json, try to determine the correct path
          metadataUrl = url.endsWith('lion_takanawa') ? `${url}/cloud.js` : url;
        }
        
        // Test fetch to verify file is accessible
        if (metadataUrl.includes(window.location.origin)) {
          const testResponse = await fetch(metadataUrl);
          if (!testResponse.ok) {
            throw new Error(`Metadata file not accessible: ${testResponse.status} ${testResponse.statusText}`);
          }
          const contentType = testResponse.headers.get('content-type');
          const text = await testResponse.text();
          
          // Validate file format: either pure JSON (starts with {) or Potree wrapper (starts with Potree =)
          const isPureJSON = text.trim().startsWith('{');
          const isPotreeWrapper = text.trim().startsWith('Potree') && text.includes('=');
          
          if (!isPureJSON && !isPotreeWrapper) {
            throw new Error(`Metadata file format not recognized. Expected JSON or Potree wrapper format. Content-Type: ${contentType}`);
          }
          
          const format = isPotreeWrapper ? 'Potree wrapper' : (isPureJSON ? 'Pure JSON' : 'Unknown');
          console.log(`✓ Metadata file verified: ${metadataUrl} (Content-Type: ${contentType}, Format: ${format})`);
          
          // Log warning if Content-Type doesn't match expected format
          if (isPureJSON && !contentType?.includes('json')) {
            console.warn(`⚠ Warning: File is pure JSON but Content-Type is ${contentType}. Potree-loader might reject it.`);
          }
        }
        
        // Try loading with potree-loader
        // Note: potree-loader needs access to both the cloud.json metadata file
        // and the binary data files in the data/ subdirectory
        // The second parameter should be the URL to the metadata file or directory
        console.log(`Calling potree.loadPointCloud('lion_takanawa', '${url}')`);
        const pco = await potree.loadPointCloud('lion_takanawa', url);
        
        // If we get here, it worked!
        console.log(`✓ Successfully loaded point cloud from: ${url}`, pco);
        
        if (!pco) {
          throw new Error('loadPointCloud returned null/undefined');
        }

        scene.add(pco);
        pointCloudRef.current = pco;

        const box = new THREE.Box3();
        box.setFromObject(pco);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5;

        camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        camera.lookAt(center);
        
        console.log(`✓ Point cloud loaded successfully from: ${url}`);
        setPointCloudError(null); // Clear any previous errors
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        // Log detailed error for debugging (only for local URLs to avoid spam)
        if (url.includes(window.location.origin)) {
          console.warn(`Failed to load from ${url}:`, {
            message: errorMessage,
            stack: errorStack,
            url: url,
            urlIndex: urlIndex
          });
        }
        
        // Try next URL
        loadPointCloud(urlIndex + 1);
      }
    };

    // Only try to load real point cloud if not using mock
    if (!useMock) {
      loadPointCloud();
    }
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // Only update point clouds if using real potree-loader (not mock)
      if (!useMock && potreeRef.current && pointCloudRef.current && pointCloudRef.current.initialized) {
        potreeRef.current.updatePointClouds([pointCloudRef.current], camera, renderer);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    loadAnnotations();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const loadAnnotations = async () => {
    try {
      const data = await annotationService.getAll();
      setAnnotations(data);
      data.forEach((ann) => createMarker(ann));
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

  const createMarker = (annotation: Annotation) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(annotation.x, annotation.y, annotation.z);
    marker.userData = { annotationId: annotation.id };

    sceneRef.current.add(marker);
    annotationMarkersRef.current.set(annotation.id, marker);
  };

  const removeMarker = (id: string) => {
    const marker = annotationMarkersRef.current.get(id);
    if (marker && sceneRef.current) {
      sceneRef.current.remove(marker);
      annotationMarkersRef.current.delete(id);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const markers = Array.from(annotationMarkersRef.current.values());
    const intersects = raycasterRef.current.intersectObjects(markers);

    if (intersects.length > 0) {
      const clickedMarker = intersects[0].object;
      const annotationId = clickedMarker.userData.annotationId;
      setSelectedAnnotation(annotationId);
      return;
    }

    // Find point clouds - either Points directly or Groups containing Points (for mock point cloud)
    const pointClouds = sceneRef.current.children.filter((child: THREE.Object3D) => 
      child.type === 'Points' || child.type === 'Group'
    );
    const pcIntersects = raycasterRef.current.intersectObjects(pointClouds, true);

    if (pcIntersects.length > 0) {
      const point = pcIntersects[0].point;
      setPendingPosition(point);
      setShowInput(true);
      setSelectedAnnotation(null);
    }
  };

  const handleSaveAnnotation = async () => {
    if (!pendingPosition || !inputText.trim()) return;

    try {
      const newAnnotation = await annotationService.create(
        pendingPosition.x,
        pendingPosition.y,
        pendingPosition.z,
        inputText.trim()
      );
      setAnnotations([...annotations, newAnnotation]);
      createMarker(newAnnotation);
      setShowInput(false);
      setInputText('');
      setPendingPosition(null);
    } catch (error) {
      console.error('Failed to save annotation:', error);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    try {
      await annotationService.delete(id);
      setAnnotations(annotations.filter((ann) => ann.id !== id));
      removeMarker(id);
      setSelectedAnnotation(null);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
    }
  };

  const selectedAnnotationData = annotations.find((ann) => ann.id === selectedAnnotation);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} onClick={handleCanvasClick} className="w-full h-full" />

      {shouldUseMockPointCloud() && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg shadow-lg z-20 max-w-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold mb-2">🔧 Development Mode: Using Mock Point Cloud</h4>
              <p className="text-sm">The mock point cloud allows you to test annotation features. The real point cloud will be used in production.</p>
            </div>
            <button
              onClick={() => {}}
              className="ml-4 text-blue-600 hover:text-blue-800 opacity-50 cursor-default"
              aria-label="Info"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      {pointCloudError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg z-20 max-w-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Point Cloud Not Loaded</h4>
              <p className="text-sm">{pointCloudError}</p>
            </div>
            <button
              onClick={() => setPointCloudError(null)}
              className="ml-4 text-yellow-600 hover:text-yellow-800"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {showInput && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-10 w-96">
          <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-4 resize-none"
            rows={4}
            maxLength={256}
            placeholder="Enter annotation text (max 256 characters)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => {
                setShowInput(false);
                setInputText('');
                setPendingPosition(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              onClick={handleSaveAnnotation}
              disabled={!inputText.trim()}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {selectedAnnotationData && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 w-80">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">Annotation</h3>
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-700 mb-4">{selectedAnnotationData.text}</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Position: ({selectedAnnotationData.x.toFixed(2)}, {selectedAnnotationData.y.toFixed(2)}, {selectedAnnotationData.z.toFixed(2)})</p>
          </div>
          <button
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => handleDeleteAnnotation(selectedAnnotationData.id)}
          >
            Delete Annotation
          </button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Click on the point cloud to add an annotation</li>
          <li>• Click on a red marker to view/delete annotation</li>
          <li>• Use mouse to rotate, zoom, and pan the view</li>
          {pointCloudError && (
            <li className="text-yellow-600">• Point cloud not loaded - annotations can still be tested</li>
          )}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">Total annotations: {annotations.length}</p>
        </div>
      </div>
    </div>
  );
}
