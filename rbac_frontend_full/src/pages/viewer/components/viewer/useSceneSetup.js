import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function useSceneSetup(mountRef) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ---------- SCENE ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f4f6");

    // ---------- CAMERA ----------
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      5000,
    );
    camera.position.set(10, 10, 10);

    // ---------- RENDERER ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);

    mountRef.current.appendChild(renderer.domElement);

    // ---------- CONTROLS ----------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    // ---------- HELPERS ----------
    const grid = new THREE.GridHelper(50, 50);
    scene.add(grid);

    const axes = new THREE.AxesHelper(5);
    scene.add(axes);

    // ---------- LIGHT ----------
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(10, 20, 10);
    scene.add(directional);

    // ---------- SAVE REFS ----------
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // ---------- ANIMATION ----------
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // ---------- RESIZE ----------
    const handleResize = () => {
      if (!mountRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // ---------- CLEANUP ----------
    return () => {
      window.removeEventListener("resize", handleResize);

      // stop animation loop
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // dispose controls
      controls.dispose();

      // safe DOM removal
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, [mountRef]);

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    controlsRef,
  };
}
