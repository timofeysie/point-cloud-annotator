import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Potree } from 'potree-loader';
import { Annotation } from '../types/annotation';
import { annotationService } from '../services/annotationService';
import { X } from 'lucide-react';

export function PotreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [pendingPosition, setPendingPosition] = useState<THREE.Vector3 | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const annotationMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

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

    const potree = new Potree();
    potree.pointBudget = 1_000_000;

    potree
      .loadPointCloud(
        'lion_takanawa',
        'https://cdn.rawgit.com/potree/potree/develop/pointclouds/lion_takanawa/cloud.js'
      )
      .then((pco: any) => {
        scene.add(pco);

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
      });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      potree.updatePointClouds([scene.children[2]], camera, renderer);
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

    const pointClouds = sceneRef.current.children.filter((child: THREE.Object3D) => child.type === 'Points');
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
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">Total annotations: {annotations.length}</p>
        </div>
      </div>
    </div>
  );
}
