// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// const GLOBAL_IMAGE_MAP = {};

// function lookupImage(name) {
//   if (!name) return null;
//   return (
//     GLOBAL_IMAGE_MAP[name] ||
//     GLOBAL_IMAGE_MAP[name.toLowerCase()] ||
//     GLOBAL_IMAGE_MAP[name.toUpperCase()] ||
//     GLOBAL_IMAGE_MAP[name.replace(/\.[^/.]+$/, (e) => e.toLowerCase())] ||
//     GLOBAL_IMAGE_MAP[name.replace(/\.[^/.]+$/, (e) => e.toUpperCase())] ||
//     null
//   );
// }

// let manualCameraCounter = 0;

// export default function useCameraSystem(sceneData, modelData, props) {
//   const { sceneRef, cameraRef, rendererRef, controlsRef } = sceneData;
//   const { cameraPositionsFile, showCameras } = props;

//   const camerasRef = useRef([]);
//   const cameraMarkersRef = useRef([]);
//   const cameraHelpersRef = useRef([]);
//   const originalPosRef = useRef([]);
//   const matrixAppliedRef = useRef(false);
//   const matrixRef = useRef(null);

//   const previewCanvasRef = useRef(null);
//   const previewRendererRef = useRef(null);
//   const previewRafRef = useRef(null);

//   // ── Transform state (mirrors ThreeViewer.js transformRef exactly) ─────────
//   const transformRef = useRef({
//     mode: null, // "move" | "rotate" | "scale" | null
//     activeCamera: null,
//     startPos: null,
//     startRot: null,
//     startScale: null,
//   });

//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [manualCameras, setManualCameras] = useState([]);
//   const [tick, setTick] = useState(0);
//   const bump = useCallback(() => setTick((n) => n + 1), []);

//   // ── public helpers ────────────────────────────────────────────────────────
//   const setActiveCamera = useCallback((cam) => {
//     transformRef.current.activeCamera = cam;
//     transformRef.current.mode = null;
//   }, []);

//   const clearActiveCamera = useCallback(
//     (name) => {
//       const tr = transformRef.current;
//       if (!tr.activeCamera) return;
//       const match =
//         tr.activeCamera.userData.imageName === name ||
//         tr.activeCamera.userData.name === name;
//       if (match) {
//         tr.activeCamera = null;
//         tr.mode = null;
//         if (controlsRef?.current) controlsRef.current.enabled = true;
//       }
//     },
//     [controlsRef],
//   );

//   // ── sync marker + helper after transform ──────────────────────────────────
//   const syncMarker = useCallback((cam) => {
//     if (!cam) return;
//     const idx = cam.userData.index;
//     const marker = cameraMarkersRef.current[idx];
//     if (marker) {
//       marker.position.copy(cam.position);
//       marker.setRotationFromQuaternion(cam.quaternion);
//     }
//     const helper = cameraHelpersRef.current[idx];
//     if (helper) helper.update();
//   }, []);

//   // ── KEYBOARD: G / R / S / Escape — exactly like ThreeViewer.js ───────────
//   useEffect(() => {
//     const onKeyDown = (e) => {
//       const tr = transformRef.current;
//       if (!tr.activeCamera) return;
//       const tag = document.activeElement?.tagName;
//       if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

//       if (e.key === "g" || e.key === "G") {
//         tr.mode = "move";
//         tr.startPos = tr.activeCamera.position.clone();
//         if (controlsRef?.current) controlsRef.current.enabled = false;
//       }
//       if (e.key === "r" || e.key === "R") {
//         tr.mode = "rotate";
//         tr.startRot = tr.activeCamera.rotation.clone();
//         if (controlsRef?.current) controlsRef.current.enabled = false;
//       }
//       if (e.key === "s" || e.key === "S") {
//         tr.mode = "scale";
//         tr.startScale = tr.activeCamera.scale.x;
//         if (controlsRef?.current) controlsRef.current.enabled = false;
//       }
//       if (e.key === "Escape") {
//         if (tr.startPos) tr.activeCamera.position.copy(tr.startPos);
//         if (tr.startRot) tr.activeCamera.rotation.copy(tr.startRot);
//         if (tr.startScale) tr.activeCamera.scale.setScalar(tr.startScale);
//         syncMarker(tr.activeCamera);
//         tr.mode = null;
//         if (controlsRef?.current) controlsRef.current.enabled = true;
//       }
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [syncMarker, controlsRef]);

//   // ── POINTER DRAG — attached inside a sceneRef watch so dom is ready ───────
//   // Mirrors ThreeViewer.js exactly: pointerdown sets dragging, pointermove moves
//   useEffect(() => {
//     // Wait until renderer is mounted (same pattern as ThreeViewer scene init)
//     const dom = rendererRef?.current?.domElement;
//     if (!dom) return;

//     let dragging = false;
//     let lastX = 0;
//     let lastY = 0;

//     const onDown = (e) => {
//       if (!transformRef.current.mode) return;
//       dragging = true;
//       lastX = e.clientX;
//       lastY = e.clientY;
//       dom.__suppressNextClick = true;
//     };

//     const onMove = (e) => {
//       const tr = transformRef.current;
//       if (!dragging || !tr.activeCamera) return;

//       const rect = dom.getBoundingClientRect();
//       const dx = (e.clientX - lastX) / rect.width;
//       const dy = (e.clientY - lastY) / rect.height;
//       lastX = e.clientX;
//       lastY = e.clientY;

//       const cam = tr.activeCamera;

//       if (tr.mode === "move") {
//         const forward = new THREE.Vector3();
//         cam.getWorldDirection(forward).normalize();
//         const right = new THREE.Vector3()
//           .crossVectors(forward, cam.up)
//           .normalize();
//         const up = cam.up.clone().normalize();
//         const speed = 10;
//         cam.position.addScaledVector(right, -dx * speed);
//         cam.position.addScaledVector(up, -dy * speed);
//         syncMarker(cam);
//       }

//       if (tr.mode === "rotate") {
//         const rotSpeed = 2.5;
//         const qx = new THREE.Quaternion().setFromAxisAngle(
//           new THREE.Vector3(1, 0, 0),
//           -dy * rotSpeed,
//         );
//         const qy = new THREE.Quaternion().setFromAxisAngle(
//           new THREE.Vector3(0, 1, 0),
//           -dx * rotSpeed,
//         );
//         cam.quaternion.multiplyQuaternions(qy, cam.quaternion);
//         cam.quaternion.multiplyQuaternions(qx, cam.quaternion);
//         syncMarker(cam);
//       }

//       if (tr.mode === "scale") {
//         const zoomSpeed = 80;
//         cam.fov = THREE.MathUtils.clamp(cam.fov + dy * zoomSpeed, 15, 120);
//         cam.updateProjectionMatrix();
//         const idx = cam.userData.index;
//         const marker = cameraMarkersRef.current[idx];
//         if (marker) {
//           const s = THREE.MathUtils.mapLinear(cam.fov, 15, 120, 0.6, 1.6);
//           marker.scale.setScalar(s);
//         }
//       }
//     };

//     const onUp = () => {
//       dragging = false;
//       transformRef.current.mode = null;
//       if (controlsRef?.current) controlsRef.current.enabled = true;
//     };

//     dom.addEventListener("pointerdown", onDown);
//     dom.addEventListener("pointermove", onMove);
//     window.addEventListener("pointerup", onUp);

//     return () => {
//       dom.removeEventListener("pointerdown", onDown);
//       dom.removeEventListener("pointermove", onMove);
//       window.removeEventListener("pointerup", onUp);
//     };
//     // Re-run whenever the renderer dom element appears (after scene init)
//     // eslint-disable-next-line
//   }, [rendererRef?.current?.domElement, syncMarker]);

//   // ── CLEANUP ───────────────────────────────────────────────────────────────
//   const cleanupAll = useCallback(() => {
//     if (!sceneRef.current) return;
//     [
//       ...camerasRef.current,
//       ...cameraMarkersRef.current,
//       ...cameraHelpersRef.current,
//     ].forEach((obj) => {
//       if (!obj) return;
//       obj.geometry?.dispose();
//       obj.material?.dispose();
//       sceneRef.current.remove(obj);
//     });
//     camerasRef.current = [];
//     cameraMarkersRef.current = [];
//     cameraHelpersRef.current = [];
//   }, [sceneRef]);

//   // ── BUILD cameras ─────────────────────────────────────────────────────────
//   const buildCameras = useCallback(
//     (positions) => {
//       if (!sceneRef.current) return;
//       cleanupAll();

//       let M = null;
//       let rotQuat = null;

//       // ✅ Build full matrix ONCE
//       if (matrixAppliedRef.current && matrixRef.current) {
//         M = new THREE.Matrix4().set(...matrixRef.current.flat());

//         const rotMatrix = new THREE.Matrix4().extractRotation(M);
//         rotQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
//       }

//       positions.forEach((posData, idx) => {
//         const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 10000);

//         // ORIGINAL transform
//         cam.position.copy(posData.position);
//         cam.quaternion.copy(posData.quaternion);

//         // 🔥 APPLY MATRIX SAFELY
//         if (M) {
//           cam.position.applyMatrix4(M); // position (T * R * S)
//           cam.quaternion.premultiply(rotQuat); // rotation only
//         }

//         cam.updateMatrixWorld(true);

//         const imageUrl = lookupImage(posData.imageName);

//         cam.userData = {
//           imageName: posData.imageName,
//           image: imageUrl,
//           hasImage: !!imageUrl,
//           index: idx,
//           isManual: posData.isManual || false,
//         };

//         sceneRef.current.add(cam);
//         camerasRef.current.push(cam);

//         // ───────── MARKER ─────────
//         const geo = new THREE.ConeGeometry(0.3, 0.5, 4);
//         geo.rotateX(-Math.PI / 2);

//         const mat = new THREE.MeshStandardMaterial({
//           color: posData.isManual ? 0x06b6d4 : imageUrl ? 0x8b5cf6 : 0xf97316,
//         });

//         const marker = new THREE.Mesh(geo, mat);

//         marker.position.copy(cam.position);
//         marker.setRotationFromQuaternion(cam.quaternion);
//         marker.userData.cameraIndex = idx;
//         marker.visible = showCameras !== false;

//         // ✅ KEEP MARKER SIZE VISIBLE (constant size)
//         // marker.scale.setScalar(1); // tweak: 0.5 / 1 / 2 if needed

//         sceneRef.current.add(marker);
//         cameraMarkersRef.current.push(marker);

//         // ───────── HELPER ─────────
//         const helper = new THREE.CameraHelper(cam);
//         helper.visible = false;

//         sceneRef.current.add(helper);
//         cameraHelpersRef.current.push(helper);
//       });
//     },
//     [sceneRef, cleanupAll, showCameras],
//   );

//   useEffect(() => {
//     let raf;

//     const updateMarkerSize = () => {
//       raf = requestAnimationFrame(updateMarkerSize);

//       if (!cameraRef.current) return;

//       const mainCam = cameraRef.current;

//       cameraMarkersRef.current.forEach((marker) => {
//         if (!marker) return;

//         const distance = mainCam.position.distanceTo(marker.position);

//         // 🔥 normalize distance (key fix)
//         let scale = distance * 0.06;

//         // ✅ clamp to avoid huge size
//         scale = Math.max(0.1, Math.min(scale, 5));

//         marker.scale.setScalar(scale);
//       });
//     };

//     updateMarkerSize();

//     return () => cancelAnimationFrame(raf);
//   }, [cameraRef]);

//   // ── PARSE images.txt ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!cameraPositionsFile) {
//       cleanupAll();
//       originalPosRef.current = [];
//       return;
//     }
//     matrixAppliedRef.current = false;
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const parsed = [];
//       e.target.result.split("\n").forEach((line) => {
//         if (!line.trim() || line.startsWith("#")) return;
//         const p = line.trim().split(/\s+/);
//         if (p.length < 10) return;
//         const imageName = p[9];
//         const nums = [p[1], p[2], p[3], p[4], p[5], p[6], p[7]].map(Number);
//         if (nums.some(isNaN)) return;
//         const [qw, qx, qy, qz, tx, ty, tz] = nums;
//         const q = new THREE.Quaternion(qx, qy, qz, qw);
//         const R = new THREE.Matrix4().makeRotationFromQuaternion(q);
//         const Rt = R.clone().transpose();
//         const C = new THREE.Vector3(tx, ty, tz)
//           .applyMatrix4(Rt)
//           .multiplyScalar(-1);
//         const qr = new THREE.Quaternion().setFromRotationMatrix(Rt);
//         qr.multiply(
//           new THREE.Quaternion().setFromAxisAngle(
//             new THREE.Vector3(1, 0, 0),
//             Math.PI,
//           ),
//         );
//         parsed.push({ imageName, position: C.clone(), quaternion: qr.clone() });
//       });
//       originalPosRef.current = parsed;
//       buildCameras(parsed);
//     };
//     reader.readAsText(cameraPositionsFile);
//   }, [cameraPositionsFile, buildCameras, cleanupAll]);

//   // ── show/hide all markers ─────────────────────────────────────────────────
//   useEffect(() => {
//     cameraMarkersRef.current.forEach((m) => {
//       m.visible = showCameras !== false;
//     });
//   }, [showCameras]);

//   // ── IMAGE FOLDER UPLOAD ───────────────────────────────────────────────────
//   const handleCameraFolderUpload = useCallback(
//     (files) => {
//       Array.from(files).forEach((file) => {
//         const url = URL.createObjectURL(file);
//         [
//           file.name,
//           file.name.toLowerCase(),
//           file.name.toUpperCase(),
//           file.name.replace(/\.[^/.]+$/, (e) => e.toLowerCase()),
//           file.name.replace(/\.[^/.]+$/, (e) => e.toUpperCase()),
//         ].forEach((k) => {
//           GLOBAL_IMAGE_MAP[k] = url;
//         });
//       });
//       camerasRef.current.forEach((cam, i) => {
//         const url = lookupImage(cam.userData.imageName);
//         cam.userData.image = url;
//         cam.userData.hasImage = !!url;
//         const marker = cameraMarkersRef.current[i];
//         if (marker && !cam.userData.isManual)
//           marker.material.color.setHex(url ? 0x8b5cf6 : 0xf97316);
//       });
//       setSelectedCamera((prev) => {
//         if (!prev) return prev;
//         const url = lookupImage(prev.name);
//         return url !== prev.image ? { ...prev, image: url } : prev;
//       });
//       bump();
//     },
//     [bump],
//   );

//   // ── MATRIX ────────────────────────────────────────────────────────────────
//   const handleCameraMatrixUpload = useCallback((file) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       try {
//         const json = JSON.parse(ev.target.result);
//         if (!Array.isArray(json) || json.length !== 4)
//           throw new Error("Need 4×4");
//         matrixRef.current = json;
//         matrixAppliedRef.current = false;
//         alert("Matrix loaded! Click Apply Camera Matrix.");
//       } catch (err) {
//         alert("Bad JSON: " + err.message);
//       }
//     };
//     reader.readAsText(file);
//   }, []);

//   const applyCameraMatrix = useCallback(() => {
//     if (!matrixRef.current) {
//       alert("No matrix uploaded.");
//       return;
//     }
//     if (!originalPosRef.current.length) {
//       alert("No cameras loaded.");
//       return;
//     }
//     matrixAppliedRef.current = true;
//     buildCameras(originalPosRef.current);
//   }, [buildCameras]);

//   // ── LIVE PREVIEW ──────────────────────────────────────────────────────────
//   const stopPreview = useCallback(() => {
//     if (previewRafRef.current) {
//       cancelAnimationFrame(previewRafRef.current);
//       previewRafRef.current = null;
//     }
//   }, []);

//   useEffect(() => {
//     stopPreview();
//     if (!selectedCamera?.camObj || !sceneRef.current) return;
//     let r1, r2;
//     r1 = requestAnimationFrame(() => {
//       r2 = requestAnimationFrame(() => {
//         const canvas = previewCanvasRef.current;
//         if (!canvas) return;
//         const W = 360,
//           H = 200;
//         if (previewRendererRef.current?.domElement !== canvas) {
//           previewRendererRef.current?.dispose();
//           previewRendererRef.current = null;
//         }
//         if (!previewRendererRef.current)
//           previewRendererRef.current = new THREE.WebGLRenderer({
//             canvas,
//             antialias: true,
//           });
//         const pr = previewRendererRef.current;
//         pr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         pr.setSize(W, H, false);
//         pr.setClearColor(0x0d0d14, 1);
//         const cam = selectedCamera.camObj;
//         cam.aspect = W / H;
//         cam.updateProjectionMatrix();
//         const loop = () => {
//           previewRafRef.current = requestAnimationFrame(loop);
//           pr.render(sceneRef.current, cam);
//         };
//         loop();
//       });
//     });
//     return () => {
//       cancelAnimationFrame(r1);
//       cancelAnimationFrame(r2);
//       stopPreview();
//     };
//   }, [selectedCamera, stopPreview, sceneRef]);

//   useEffect(
//     () => () => {
//       stopPreview();
//       previewRendererRef.current?.dispose();
//     },
//     [],
//   );

//   // ── ADD CAMERA MANUALLY ───────────────────────────────────────────────────
//   const addCameraManually = useCallback(() => {
//     if (!sceneRef.current || !cameraRef.current) return;
//     manualCameraCounter += 1;
//     const label = `Camera ${manualCameraCounter}`;
//     const mainCam = cameraRef.current;
//     const dir = new THREE.Vector3();
//     mainCam.getWorldDirection(dir);
//     const spawnPos = mainCam.position.clone().add(dir.multiplyScalar(5));

//     const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 10000);
//     cam.position.copy(spawnPos);
//     cam.quaternion.copy(mainCam.quaternion);
//     cam.updateMatrixWorld(true);

//     const idx = camerasRef.current.length;
//     cam.userData = {
//       imageName: label,
//       image: null,
//       hasImage: false,
//       index: idx,
//       isManual: true,
//     };
//     sceneRef.current.add(cam);
//     camerasRef.current.push(cam);

//     const geo = new THREE.ConeGeometry(1, 2, 4);
//     geo.rotateX(-Math.PI / 2);
//     const marker = new THREE.Mesh(
//       geo,
//       new THREE.MeshStandardMaterial({ color: 0x06b6d4 }),
//     );
//     marker.position.copy(cam.position);
//     marker.setRotationFromQuaternion(cam.quaternion);
//     marker.userData.cameraIndex = idx;
//     marker.visible = showCameras !== false;
//     sceneRef.current.add(marker);
//     cameraMarkersRef.current.push(marker);

//     const helper = new THREE.CameraHelper(cam);
//     helper.visible = false;
//     sceneRef.current.add(helper);
//     cameraHelpersRef.current.push(helper);

//     // Arm G/R/S immediately after adding
//     setActiveCamera(cam);

//     setManualCameras((prev) => [
//       ...prev,
//       { name: label, visible: true, hasImage: false },
//     ]);
//   }, [showCameras, setActiveCamera, sceneRef, cameraRef]);

//   // ── DELETE CAMERA ─────────────────────────────────────────────────────────
//   const deleteCamera = useCallback(
//     (name) => {
//       if (!sceneRef.current) return;
//       const idx = camerasRef.current.findIndex(
//         (c) => c.userData.imageName === name || c.userData.name === name,
//       );
//       if (idx === -1) return;

//       [
//         camerasRef.current[idx],
//         cameraMarkersRef.current[idx],
//         cameraHelpersRef.current[idx],
//       ].forEach((obj) => {
//         if (!obj) return;
//         obj.geometry?.dispose();
//         obj.material?.dispose();
//         sceneRef.current.remove(obj);
//       });

//       camerasRef.current.splice(idx, 1);
//       cameraMarkersRef.current.splice(idx, 1);
//       cameraHelpersRef.current.splice(idx, 1);

//       // Re-index remaining
//       camerasRef.current.forEach((c, i) => {
//         c.userData.index = i;
//       });
//       cameraMarkersRef.current.forEach((m, i) => {
//         m.userData.cameraIndex = i;
//       });

//       clearActiveCamera(name);
//       setSelectedCamera((prev) => (prev?.name === name ? null : prev));
//       setManualCameras((prev) => prev.filter((c) => c.name !== name));
//     },
//     [sceneRef, clearActiveCamera],
//   );

//   // ── TOGGLE VISIBILITY ─────────────────────────────────────────────────────
//   const toggleCameraVisibility = useCallback((name) => {
//     const idx = camerasRef.current.findIndex(
//       (c) => c.userData.imageName === name || c.userData.name === name,
//     );
//     if (idx === -1) return;
//     const marker = cameraMarkersRef.current[idx];
//     if (marker) marker.visible = !marker.visible;
//     setManualCameras((prev) =>
//       prev.map((c) => (c.name === name ? { ...c, visible: !c.visible } : c)),
//     );
//   }, []);

//   // ── MANUAL IMAGE UPLOAD ───────────────────────────────────────────────────
//   const handleManualCameraImageUpload = useCallback(
//     (file, camName) => {
//       if (!file || !camName) return;
//       const url = URL.createObjectURL(file);
//       GLOBAL_IMAGE_MAP[camName] = url;
//       GLOBAL_IMAGE_MAP[camName.toLowerCase()] = url;
//       const cam = camerasRef.current.find(
//         (c) => c.userData.imageName === camName,
//       );
//       if (cam) {
//         cam.userData.image = url;
//         cam.userData.hasImage = true;
//         const marker = cameraMarkersRef.current[cam.userData.index];
//         if (marker) marker.material.color.setHex(0x8b5cf6);
//       }
//       setManualCameras((prev) =>
//         prev.map((c) => (c.name === camName ? { ...c, hasImage: true } : c)),
//       );
//       setSelectedCamera((prev) =>
//         prev?.name === camName ? { ...prev, image: url } : prev,
//       );
//       bump();
//     },
//     [bump],
//   );

//   // ── CLICK marker on canvas → select + arm transforms ─────────────────────
//   useEffect(() => {
//     const dom = rendererRef?.current?.domElement;
//     if (!dom) return;

//     const onClick = (e) => {
//       if (dom.__suppressNextClick) {
//         dom.__suppressNextClick = false;
//         return;
//       }
//       const mainCam = cameraRef?.current;
//       if (!mainCam) return;

//       const rect = dom.getBoundingClientRect();
//       const mouse = new THREE.Vector2(
//         ((e.clientX - rect.left) / rect.width) * 2 - 1,
//         -((e.clientY - rect.top) / rect.height) * 2 + 1,
//       );
//       const ray = new THREE.Raycaster();
//       ray.setFromCamera(mouse, mainCam);
//       const hits = ray.intersectObjects(cameraMarkersRef.current, false);
//       if (!hits.length) return;

//       const idx = hits[0].object.userData.cameraIndex;
//       const cam = camerasRef.current[idx];
//       if (!cam) return;

//       // ← This is the key line that enables G/R/S
//       setActiveCamera(cam);

//       const imageUrl = lookupImage(cam.userData.imageName);
//       setSelectedCamera({
//         name: cam.userData.imageName,
//         image: imageUrl || null,
//         camObj: cam,
//         isManual: cam.userData.isManual,
//         awaitingImage: cam.userData.isManual && !imageUrl,
//       });
//     };

//     dom.addEventListener("click", onClick);
//     return () => dom.removeEventListener("click", onClick);
//     // eslint-disable-next-line
//   }, [rendererRef?.current?.domElement, setActiveCamera, cameraRef]);

//   // ── HOVER glow ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const dom = rendererRef?.current?.domElement;
//     if (!dom) return;
//     let lastHovered = null;
//     const onMove = (e) => {
//       const mainCam = cameraRef?.current;
//       if (!mainCam) return;
//       const rect = dom.getBoundingClientRect();
//       const mouse = new THREE.Vector2(
//         ((e.clientX - rect.left) / rect.width) * 2 - 1,
//         -((e.clientY - rect.top) / rect.height) * 2 + 1,
//       );
//       const ray = new THREE.Raycaster();
//       ray.setFromCamera(mouse, mainCam);
//       const hits = ray.intersectObjects(cameraMarkersRef.current, false);
//       if (hits.length) {
//         const m = hits[0].object;
//         dom.style.cursor = "pointer";
//         if (lastHovered && lastHovered !== m) {
//           lastHovered.material.emissive?.setHex(0x000000);
//           lastHovered.scale.set(1, 1, 1);
//         }
//         if (m.material.emissive) m.material.emissive.setHex(0xffff00);
//         m.scale.set(1.3, 1.3, 1.3);
//         lastHovered = m;
//       } else {
//         dom.style.cursor = "default";
//         if (lastHovered) {
//           lastHovered.material.emissive?.setHex(0x000000);
//           lastHovered.scale.set(1, 1, 1);
//           lastHovered = null;
//         }
//       }
//     };
//     window.addEventListener("pointermove", onMove);
//     return () => window.removeEventListener("pointermove", onMove);
//     // eslint-disable-next-line
//   }, [rendererRef?.current?.domElement, cameraRef]);

//   // ── window exposure ───────────────────────────────────────────────────────
//   useEffect(() => {
//     window.handleCameraFolderUpload = handleCameraFolderUpload;
//     window.handleCameraMatrixUpload = handleCameraMatrixUpload;
//     window.applyCameraMatrix = applyCameraMatrix;
//     window.addCameraManually = addCameraManually;
//   }, [
//     handleCameraFolderUpload,
//     handleCameraMatrixUpload,
//     applyCameraMatrix,
//     addCameraManually,
//   ]);

//   return {
//     selectedCamera,
//     setSelectedCamera,
//     previewCanvasRef,
//     handleCameraFolderUpload,
//     handleCameraMatrixUpload,
//     applyCameraMatrix,
//     addCameraManually,
//     deleteCamera,
//     toggleCameraVisibility,
//     handleManualCameraImageUpload,
//     manualCameras,
//     transformRef,
//     setActiveCamera,
//     clearActiveCamera,
//   };
// }

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const GLOBAL_IMAGE_MAP = {};

function lookupImage(name) {
  if (!name) return null;
  return (
    GLOBAL_IMAGE_MAP[name] ||
    GLOBAL_IMAGE_MAP[name.toLowerCase()] ||
    GLOBAL_IMAGE_MAP[name.toUpperCase()] ||
    GLOBAL_IMAGE_MAP[name.replace(/\.[^/.]+$/, (e) => e.toLowerCase())] ||
    GLOBAL_IMAGE_MAP[name.replace(/\.[^/.]+$/, (e) => e.toUpperCase())] ||
    null
  );
}

let manualCameraCounter = 0;

export default function useCameraSystem(sceneData, modelData, props) {
  const { sceneRef, cameraRef, rendererRef, controlsRef } = sceneData;
  const { cameraPositionsFile, showCameras } = props;

  const camerasRef = useRef([]);
  const cameraMarkersRef = useRef([]);
  const cameraHelpersRef = useRef([]);
  const originalPosRef = useRef([]);
  const matrixAppliedRef = useRef(false);
  const matrixRef = useRef(null);

  const previewCanvasRef = useRef(null);
  const previewRendererRef = useRef(null);
  const previewRafRef = useRef(null);

  // ── Transform state ───────────────────────────────────────────────────────
  const transformRef = useRef({
    mode: null,
    activeCamera: null,
    startPos: null,
    startRot: null,
    startScale: null,
  });

  const [selectedCamera, setSelectedCamera] = useState(null);
  const [manualCameras, setManualCameras] = useState([]);
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((n) => n + 1), []);

  // ── public helpers ────────────────────────────────────────────────────────
  const setActiveCamera = useCallback((cam) => {
    transformRef.current.activeCamera = cam;
    transformRef.current.mode = null;
  }, []);

  const clearActiveCamera = useCallback(
    (name) => {
      const tr = transformRef.current;
      if (!tr.activeCamera) return;
      const match =
        tr.activeCamera.userData.imageName === name ||
        tr.activeCamera.userData.name === name;
      if (match) {
        tr.activeCamera = null;
        tr.mode = null;
        if (controlsRef?.current) controlsRef.current.enabled = true;
      }
    },
    [controlsRef],
  );

  // ── sync marker + helper after transform ──────────────────────────────────
  const syncMarker = useCallback((cam) => {
    if (!cam) return;
    const idx = cam.userData.index;
    const marker = cameraMarkersRef.current[idx];
    if (marker) {
      marker.position.copy(cam.position);
      marker.setRotationFromQuaternion(cam.quaternion);
    }
    const helper = cameraHelpersRef.current[idx];
    if (helper) helper.update();
  }, []);

  // ── KEYBOARD: G / R / S / Escape ─────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const tr = transformRef.current;
      if (!tr.activeCamera) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "g" || e.key === "G") {
        tr.mode = "move";
        tr.startPos = tr.activeCamera.position.clone();
        if (controlsRef?.current) controlsRef.current.enabled = false;
      }
      if (e.key === "r" || e.key === "R") {
        tr.mode = "rotate";
        tr.startRot = tr.activeCamera.rotation.clone();
        if (controlsRef?.current) controlsRef.current.enabled = false;
      }
      if (e.key === "s" || e.key === "S") {
        tr.mode = "scale";
        tr.startScale = tr.activeCamera.scale.x;
        if (controlsRef?.current) controlsRef.current.enabled = false;
      }
      if (e.key === "Escape") {
        if (tr.startPos) tr.activeCamera.position.copy(tr.startPos);
        if (tr.startRot) tr.activeCamera.rotation.copy(tr.startRot);
        if (tr.startScale) tr.activeCamera.scale.setScalar(tr.startScale);
        syncMarker(tr.activeCamera);
        tr.mode = null;
        if (controlsRef?.current) controlsRef.current.enabled = true;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [syncMarker, controlsRef]);

  // ── POINTER DRAG ──────────────────────────────────────────────────────────
  useEffect(() => {
    const dom = rendererRef?.current?.domElement;
    if (!dom) return;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e) => {
      if (!transformRef.current.mode) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dom.__suppressNextClick = true;
    };

    const onMove = (e) => {
      const tr = transformRef.current;
      if (!dragging || !tr.activeCamera) return;

      const rect = dom.getBoundingClientRect();
      const dx = (e.clientX - lastX) / rect.width;
      const dy = (e.clientY - lastY) / rect.height;
      lastX = e.clientX;
      lastY = e.clientY;

      const cam = tr.activeCamera;

      if (tr.mode === "move") {
        const forward = new THREE.Vector3();
        cam.getWorldDirection(forward).normalize();
        const right = new THREE.Vector3()
          .crossVectors(forward, cam.up)
          .normalize();
        const up = cam.up.clone().normalize();
        const speed = 10;
        cam.position.addScaledVector(right, -dx * speed);
        cam.position.addScaledVector(up, -dy * speed);
        syncMarker(cam);
      }

      if (tr.mode === "rotate") {
        const rotSpeed = 2.5;
        const qx = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          -dy * rotSpeed,
        );
        const qy = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          -dx * rotSpeed,
        );
        cam.quaternion.multiplyQuaternions(qy, cam.quaternion);
        cam.quaternion.multiplyQuaternions(qx, cam.quaternion);
        syncMarker(cam);
      }

      if (tr.mode === "scale") {
        const zoomSpeed = 80;
        cam.fov = THREE.MathUtils.clamp(cam.fov + dy * zoomSpeed, 15, 120);
        cam.updateProjectionMatrix();
        const idx = cam.userData.index;
        const marker = cameraMarkersRef.current[idx];
        if (marker) {
          const s = THREE.MathUtils.mapLinear(cam.fov, 15, 120, 0.6, 1.6);
          marker.scale.setScalar(s);
        }
      }
    };

    const onUp = () => {
      dragging = false;
      transformRef.current.mode = null;
      if (controlsRef?.current) controlsRef.current.enabled = true;
    };

    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line
  }, [rendererRef?.current?.domElement, syncMarker]);

  // ── CLEANUP ───────────────────────────────────────────────────────────────
  const cleanupAll = useCallback(() => {
    if (!sceneRef.current) return;
    [
      ...camerasRef.current,
      ...cameraMarkersRef.current,
      ...cameraHelpersRef.current,
    ].forEach((obj) => {
      if (!obj) return;
      obj.geometry?.dispose();
      obj.material?.dispose();
      sceneRef.current.remove(obj);
    });
    camerasRef.current = [];
    cameraMarkersRef.current = [];
    cameraHelpersRef.current = [];
  }, [sceneRef]);

  // ── BUILD cameras ─────────────────────────────────────────────────────────
  const buildCameras = useCallback(
    (positions) => {
      if (!sceneRef.current) return;
      cleanupAll();

      let M = null;
      let rotQuat = null;

      if (matrixAppliedRef.current && matrixRef.current) {
        M = new THREE.Matrix4().set(...matrixRef.current.flat());
        const rotMatrix = new THREE.Matrix4().extractRotation(M);
        rotQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
      }

      positions.forEach((posData, idx) => {
        const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 10000);

        cam.position.copy(posData.position);
        cam.quaternion.copy(posData.quaternion);

        if (M) {
          cam.position.applyMatrix4(M);
          cam.quaternion.premultiply(rotQuat);
        }

        cam.updateMatrixWorld(true);

        const imageUrl = lookupImage(posData.imageName);

        cam.userData = {
          imageName: posData.imageName,
          image: imageUrl,
          hasImage: !!imageUrl,
          index: idx,
          isManual: posData.isManual || false,
        };

        sceneRef.current.add(cam);
        camerasRef.current.push(cam);

        const geo = new THREE.ConeGeometry(0.3, 0.5, 4);
        geo.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
          color: posData.isManual ? 0x06b6d4 : imageUrl ? 0x8b5cf6 : 0xf97316,
        });

        const marker = new THREE.Mesh(geo, mat);

        marker.position.copy(cam.position);
        marker.setRotationFromQuaternion(cam.quaternion);
        marker.userData.cameraIndex = idx;
        marker.visible = showCameras !== false;

        sceneRef.current.add(marker);
        cameraMarkersRef.current.push(marker);

        const helper = new THREE.CameraHelper(cam);
        helper.visible = false;

        sceneRef.current.add(helper);
        cameraHelpersRef.current.push(helper);
      });
    },
    [sceneRef, cleanupAll, showCameras],
  );

  // ── MARKER SIZE LOOP ──────────────────────────────────────────────────────
  useEffect(() => {
    let raf;

    const updateMarkerSize = () => {
      raf = requestAnimationFrame(updateMarkerSize);

      if (!cameraRef.current) return;

      const mainCam = cameraRef.current;

      cameraMarkersRef.current.forEach((marker) => {
        if (!marker) return;

        const distance = mainCam.position.distanceTo(marker.position);
        let scale = distance * 0.06;
        scale = Math.max(0.1, Math.min(scale, 5));
        marker.scale.setScalar(scale);
      });
    };

    updateMarkerSize();

    return () => cancelAnimationFrame(raf);
  }, [cameraRef]);

  // ── PARSE images.txt ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraPositionsFile) {
      cleanupAll();
      originalPosRef.current = [];
      return;
    }
    matrixAppliedRef.current = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = [];
      e.target.result.split("\n").forEach((line) => {
        if (!line.trim() || line.startsWith("#")) return;
        const p = line.trim().split(/\s+/);
        if (p.length < 10) return;
        const imageName = p[9];
        const nums = [p[1], p[2], p[3], p[4], p[5], p[6], p[7]].map(Number);
        if (nums.some(isNaN)) return;
        const [qw, qx, qy, qz, tx, ty, tz] = nums;
        const q = new THREE.Quaternion(qx, qy, qz, qw);
        const R = new THREE.Matrix4().makeRotationFromQuaternion(q);
        const Rt = R.clone().transpose();
        const C = new THREE.Vector3(tx, ty, tz)
          .applyMatrix4(Rt)
          .multiplyScalar(-1);
        const qr = new THREE.Quaternion().setFromRotationMatrix(Rt);
        qr.multiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI,
          ),
        );
        parsed.push({ imageName, position: C.clone(), quaternion: qr.clone() });
      });
      originalPosRef.current = parsed;
      buildCameras(parsed);
    };
    reader.readAsText(cameraPositionsFile);
  }, [cameraPositionsFile, buildCameras, cleanupAll]);

  // ── show/hide all markers ─────────────────────────────────────────────────
  useEffect(() => {
    cameraMarkersRef.current.forEach((m) => {
      m.visible = showCameras !== false;
    });
  }, [showCameras]);

  // ── IMAGE FOLDER UPLOAD ───────────────────────────────────────────────────
  const handleCameraFolderUpload = useCallback(
    (files) => {
      Array.from(files).forEach((file) => {
        // ── Validate: only image formats allowed ──────────────────────────
        const validImageExts = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|tif)$/i;
        if (!validImageExts.test(file.name)) {
          alert(
            `Invalid image format: "${file.name}". Only image files (jpg, jpeg, png, gif, bmp, webp, tiff) are supported.`,
          );
          return;
        }

        const url = URL.createObjectURL(file);
        [
          file.name,
          file.name.toLowerCase(),
          file.name.toUpperCase(),
          file.name.replace(/\.[^/.]+$/, (e) => e.toLowerCase()),
          file.name.replace(/\.[^/.]+$/, (e) => e.toUpperCase()),
        ].forEach((k) => {
          GLOBAL_IMAGE_MAP[k] = url;
        });
      });
      camerasRef.current.forEach((cam, i) => {
        const url = lookupImage(cam.userData.imageName);
        cam.userData.image = url;
        cam.userData.hasImage = !!url;
        const marker = cameraMarkersRef.current[i];
        if (marker && !cam.userData.isManual)
          marker.material.color.setHex(url ? 0x8b5cf6 : 0xf97316);
      });
      setSelectedCamera((prev) => {
        if (!prev) return prev;
        const url = lookupImage(prev.name);
        return url !== prev.image ? { ...prev, image: url } : prev;
      });
      bump();
    },
    [bump],
  );

  // ── MATRIX UPLOAD ─────────────────────────────────────────────────────────
  const handleCameraMatrixUpload = useCallback((file) => {
    if (!file) return;

    // ── Validate: allow only .json files ────────────────────────────────
    if (!file.name.toLowerCase().endsWith(".json")) {
      alert(
        `Invalid file format: "${file.name}". Camera matrix must be a .json file.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);

        if (
          !Array.isArray(json) ||
          json.length !== 4 ||
          !json.every((row) => Array.isArray(row) && row.length === 4)
        ) {
          throw new Error("Need 4×4 matrix");
        }

        matrixRef.current = json;
        matrixAppliedRef.current = false;

        alert("Matrix loaded! Click Apply Camera Matrix.");
      } catch (err) {
        alert("Invalid JSON: " + err.message);
      }
    };

    reader.readAsText(file);
  }, []);

  const applyCameraMatrix = useCallback(() => {
    if (!matrixRef.current) {
      alert("No matrix uploaded.");
      return;
    }
    if (!originalPosRef.current.length) {
      alert("No cameras loaded.");
      return;
    }
    matrixAppliedRef.current = true;
    buildCameras(originalPosRef.current);
  }, [buildCameras]);

  // ── LIVE PREVIEW ──────────────────────────────────────────────────────────
  const stopPreview = useCallback(() => {
    if (previewRafRef.current) {
      cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopPreview();
    if (!selectedCamera?.camObj || !sceneRef.current) return;
    let r1, r2;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const W = 360,
          H = 200;
        if (previewRendererRef.current?.domElement !== canvas) {
          previewRendererRef.current?.dispose();
          previewRendererRef.current = null;
        }
        if (!previewRendererRef.current)
          previewRendererRef.current = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
          });
        const pr = previewRendererRef.current;
        pr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        pr.setSize(W, H, false);
        pr.setClearColor(0x0d0d14, 1);
        const cam = selectedCamera.camObj;
        cam.aspect = W / H;
        cam.updateProjectionMatrix();
        const loop = () => {
          previewRafRef.current = requestAnimationFrame(loop);
          pr.render(sceneRef.current, cam);
        };
        loop();
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      stopPreview();
    };
  }, [selectedCamera, stopPreview, sceneRef]);

  useEffect(
    () => () => {
      stopPreview();
      previewRendererRef.current?.dispose();
    },
    [],
  );

  // ── ADD CAMERA MANUALLY ───────────────────────────────────────────────────
  const addCameraManually = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    manualCameraCounter += 1;
    const label = `Camera ${manualCameraCounter}`;
    const mainCam = cameraRef.current;
    const dir = new THREE.Vector3();
    mainCam.getWorldDirection(dir);
    const spawnPos = mainCam.position.clone().add(dir.multiplyScalar(5));

    const cam = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 10000);
    cam.position.copy(spawnPos);
    cam.quaternion.copy(mainCam.quaternion);
    cam.updateMatrixWorld(true);

    const idx = camerasRef.current.length;
    cam.userData = {
      imageName: label,
      image: null,
      hasImage: false,
      index: idx,
      isManual: true,
    };
    sceneRef.current.add(cam);
    camerasRef.current.push(cam);

    const geo = new THREE.ConeGeometry(1, 2, 4);
    geo.rotateX(-Math.PI / 2);
    const marker = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x06b6d4 }),
    );
    marker.position.copy(cam.position);
    marker.setRotationFromQuaternion(cam.quaternion);
    marker.userData.cameraIndex = idx;
    marker.visible = showCameras !== false;
    sceneRef.current.add(marker);
    cameraMarkersRef.current.push(marker);

    const helper = new THREE.CameraHelper(cam);
    helper.visible = false;
    sceneRef.current.add(helper);
    cameraHelpersRef.current.push(helper);

    setActiveCamera(cam);

    setManualCameras((prev) => [
      ...prev,
      { name: label, visible: true, hasImage: false },
    ]);
  }, [showCameras, setActiveCamera, sceneRef, cameraRef]);

  // ── DELETE CAMERA ─────────────────────────────────────────────────────────
  const deleteCamera = useCallback(
    (name) => {
      if (!sceneRef.current) return;
      const idx = camerasRef.current.findIndex(
        (c) => c.userData.imageName === name || c.userData.name === name,
      );
      if (idx === -1) return;

      [
        camerasRef.current[idx],
        cameraMarkersRef.current[idx],
        cameraHelpersRef.current[idx],
      ].forEach((obj) => {
        if (!obj) return;
        obj.geometry?.dispose();
        obj.material?.dispose();
        sceneRef.current.remove(obj);
      });

      camerasRef.current.splice(idx, 1);
      cameraMarkersRef.current.splice(idx, 1);
      cameraHelpersRef.current.splice(idx, 1);

      camerasRef.current.forEach((c, i) => {
        c.userData.index = i;
      });
      cameraMarkersRef.current.forEach((m, i) => {
        m.userData.cameraIndex = i;
      });

      clearActiveCamera(name);
      setSelectedCamera((prev) => (prev?.name === name ? null : prev));
      setManualCameras((prev) => prev.filter((c) => c.name !== name));
    },
    [sceneRef, clearActiveCamera],
  );

  // ── TOGGLE VISIBILITY ─────────────────────────────────────────────────────
  const toggleCameraVisibility = useCallback((name) => {
    const idx = camerasRef.current.findIndex(
      (c) => c.userData.imageName === name || c.userData.name === name,
    );
    if (idx === -1) return;
    const marker = cameraMarkersRef.current[idx];
    if (marker) marker.visible = !marker.visible;
    setManualCameras((prev) =>
      prev.map((c) => (c.name === name ? { ...c, visible: !c.visible } : c)),
    );
  }, []);

  // ── MANUAL IMAGE UPLOAD ───────────────────────────────────────────────────
  const handleManualCameraImageUpload = useCallback(
    (file, camName) => {
      if (!file || !camName) return;

      // ── Validate: only image formats allowed ──────────────────────────
      const validImageExts = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|tif)$/i;
      if (!validImageExts.test(file.name)) {
        alert(
          `Invalid image format: "${file.name}". Only image files (jpg, jpeg, png, gif, bmp, webp, tiff) are supported.`,
        );
        return;
      }

      const url = URL.createObjectURL(file);
      GLOBAL_IMAGE_MAP[camName] = url;
      GLOBAL_IMAGE_MAP[camName.toLowerCase()] = url;
      const cam = camerasRef.current.find(
        (c) => c.userData.imageName === camName,
      );
      if (cam) {
        cam.userData.image = url;
        cam.userData.hasImage = true;
        const marker = cameraMarkersRef.current[cam.userData.index];
        if (marker) marker.material.color.setHex(0x8b5cf6);
      }
      setManualCameras((prev) =>
        prev.map((c) => (c.name === camName ? { ...c, hasImage: true } : c)),
      );
      setSelectedCamera((prev) =>
        prev?.name === camName ? { ...prev, image: url } : prev,
      );
      bump();
    },
    [bump],
  );

  // ── CLICK marker on canvas ────────────────────────────────────────────────
  useEffect(() => {
    const dom = rendererRef?.current?.domElement;
    if (!dom) return;

    const onClick = (e) => {
      if (dom.__suppressNextClick) {
        dom.__suppressNextClick = false;
        return;
      }
      const mainCam = cameraRef?.current;
      if (!mainCam) return;

      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, mainCam);
      const hits = ray.intersectObjects(cameraMarkersRef.current, false);
      if (!hits.length) return;

      const idx = hits[0].object.userData.cameraIndex;
      const cam = camerasRef.current[idx];
      if (!cam) return;

      setActiveCamera(cam);

      const imageUrl = lookupImage(cam.userData.imageName);
      setSelectedCamera({
        name: cam.userData.imageName,
        image: imageUrl || null,
        camObj: cam,
        isManual: cam.userData.isManual,
        awaitingImage: cam.userData.isManual && !imageUrl,
      });
    };

    dom.addEventListener("click", onClick);
    return () => dom.removeEventListener("click", onClick);
    // eslint-disable-next-line
  }, [rendererRef?.current?.domElement, setActiveCamera, cameraRef]);

  // ── HOVER glow ────────────────────────────────────────────────────────────
  useEffect(() => {
    const dom = rendererRef?.current?.domElement;
    if (!dom) return;
    let lastHovered = null;
    const onMove = (e) => {
      const mainCam = cameraRef?.current;
      if (!mainCam) return;
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, mainCam);
      const hits = ray.intersectObjects(cameraMarkersRef.current, false);
      if (hits.length) {
        const m = hits[0].object;
        dom.style.cursor = "pointer";
        if (lastHovered && lastHovered !== m) {
          lastHovered.material.emissive?.setHex(0x000000);
          lastHovered.scale.set(1, 1, 1);
        }
        if (m.material.emissive) m.material.emissive.setHex(0xffff00);
        m.scale.set(1.3, 1.3, 1.3);
        lastHovered = m;
      } else {
        dom.style.cursor = "default";
        if (lastHovered) {
          lastHovered.material.emissive?.setHex(0x000000);
          lastHovered.scale.set(1, 1, 1);
          lastHovered = null;
        }
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line
  }, [rendererRef?.current?.domElement, cameraRef]);

  // ── window exposure ───────────────────────────────────────────────────────
  useEffect(() => {
    window.handleCameraFolderUpload = handleCameraFolderUpload;
    window.handleCameraMatrixUpload = handleCameraMatrixUpload;
    window.applyCameraMatrix = applyCameraMatrix;
    window.addCameraManually = addCameraManually;
  }, [
    handleCameraFolderUpload,
    handleCameraMatrixUpload,
    applyCameraMatrix,
    addCameraManually,
  ]);

  return {
    selectedCamera,
    setSelectedCamera,
    previewCanvasRef,
    handleCameraFolderUpload,
    handleCameraMatrixUpload,
    applyCameraMatrix,
    addCameraManually,
    deleteCamera,
    toggleCameraVisibility,
    handleManualCameraImageUpload,
    manualCameras,
    transformRef,
    setActiveCamera,
    clearActiveCamera,
  };
}
