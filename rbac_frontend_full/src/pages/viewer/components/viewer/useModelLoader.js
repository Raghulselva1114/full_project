// import { useEffect, useState } from "react";
// import * as THREE from "three";
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
// import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";

// export default function useModelLoader(sceneData, props) {
//   const { sceneRef, cameraRef, controlsRef } = sceneData;

//   const { bimFile, pointFile, bimVisible, pcVisible, setBimElementCount } =
//     props;

//   const [bimModel, setBimModel] = useState(null);
//   const [pcModel, setPcModel] = useState(null);
//   const [error, setError] = useState(null);
//   const isValidFBX = (file) => file?.name?.toLowerCase().endsWith(".fbx");

//   const isValidPLY = (file) => file?.name?.toLowerCase().endsWith(".ply");

//   // ================= LIGHTS =================
//   useEffect(() => {
//     const scene = sceneRef.current;
//     if (!scene) return;

//     const ambient = new THREE.AmbientLight(0xffffff, 0.8);
//     const dirLight = new THREE.DirectionalLight(0xffffff, 1);

//     dirLight.position.set(10, 10, 10);

//     scene.add(ambient);
//     scene.add(dirLight);

//     return () => {
//       scene.remove(ambient);
//       scene.remove(dirLight);
//     };
//   }, [sceneRef]);

//   // ================= LOAD FBX =================
//   useEffect(() => {
//     if (!sceneRef.current) return;

//     if (bimModel) {
//       sceneRef.current.remove(bimModel);
//       setBimModel(null);
//       setBimElementCount?.(0);
//     }

//     if (!bimFile) return;

//     if (!isValidFBX(bimFile)) {
//       alert("FBX format only support");
//       return;
//     }
//     setError(null);

//     const loader = new FBXLoader();
//     const url = URL.createObjectURL(bimFile);

//     loader.load(
//       url,
//       (fbx) => {
//         let meshCount = 0;

//         fbx.traverse((child) => {
//           if (child.isMesh) {
//             meshCount++;

//             child.material = new THREE.MeshStandardMaterial({
//               color: 0x4a90e2,
//               roughness: 0.5,
//               metalness: 0.1,
//             });
//           }
//         });

//         setBimElementCount?.(meshCount);

//         // ===== CENTER MODEL =====
//         const box = new THREE.Box3().setFromObject(fbx);
//         const size = box.getSize(new THREE.Vector3());
//         const center = box.getCenter(new THREE.Vector3());

//         fbx.position.sub(center);

//         sceneRef.current.add(fbx);
//         setBimModel(fbx);

//         // ===== CAMERA FIT =====
//         if (cameraRef?.current) {
//           const maxDim = Math.max(size.x, size.y, size.z);

//           const fov = cameraRef.current.fov * (Math.PI / 180);
//           let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
//           cameraZ *= 1.8;

//           cameraRef.current.position.set(cameraZ, cameraZ, cameraZ);
//           cameraRef.current.lookAt(0, 0, 0);
//           cameraRef.current.updateProjectionMatrix();

//           if (controlsRef?.current) {
//             controlsRef.current.target.set(0, 0, 0);
//             controlsRef.current.enableZoom = true;
//             controlsRef.current.minDistance = 0.1;
//             controlsRef.current.maxDistance = 5000;
//             controlsRef.current.update();
//           }
//         }
//       },
//       undefined,
//       (err) => console.error("FBX Load Error:", err),
//     );

//     return () => {
//       URL.revokeObjectURL(url);
//     };

//     // eslint-disable-next-line
//   }, [bimFile]);

//   // ================= LOAD POINT CLOUD =================
//   useEffect(() => {
//     if (!pointFile || !sceneRef.current) return;

//     if (!pointFile) return;

//     if (!isValidPLY(pointFile)) {
//       alert("PLY format only support");
//       return;
//     }

//     setError(null);
//     const loader = new PLYLoader();
//     const url = URL.createObjectURL(pointFile);

//     loader.load(
//       url,
//       (geometry) => {
//         geometry.computeVertexNormals();

//         if (!geometry.attributes.color) {
//           const count = geometry.attributes.position.count;

//           const colors = new Float32Array(count * 3);

//           for (let i = 0; i < count; i++) {
//             colors[i * 3] = 1;
//             colors[i * 3 + 1] = 1;
//             colors[i * 3 + 2] = 1;
//           }

//           geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
//         }

//         const material = new THREE.PointsMaterial({
//           size: 0.02,
//           vertexColors: true,
//         });

//         const points = new THREE.Points(geometry, material);

//         const box = new THREE.Box3().setFromObject(points);
//         const center = box.getCenter(new THREE.Vector3());

//         // points.position.sub(center);

//         sceneRef.current.add(points);
//         setPcModel(points);

//         URL.revokeObjectURL(url);
//       },
//       undefined,
//       (err) => {
//         console.error("PLY load error:", err);
//         URL.revokeObjectURL(url);
//       },
//     );

//     return () => {
//       if (pcModel && sceneRef) {
//         sceneRef.remove(pcModel);
//         pcModel.geometry?.dispose();
//         pcModel.material?.dispose();
//         setPcModel(null);
//       }
//     };

//     // eslint-disable-next-line
//   }, [pointFile]);

//   // ================= VISIBILITY =================
//   useEffect(() => {
//     if (bimModel) bimModel.visible = bimVisible;
//   }, [bimVisible, bimModel]);

//   useEffect(() => {
//     if (pcModel) pcModel.visible = pcVisible;
//   }, [pcVisible, pcModel]);

//   // ================= DELETE HANDLING =================
//   useEffect(() => {
//     if (!bimFile && bimModel && sceneRef.current) {
//       sceneRef.current.remove(bimModel);
//       setBimModel(null);
//       setBimElementCount?.(0);
//     }

//     // eslint-disable-next-line
//   }, [bimFile]);

//   useEffect(() => {
//     if (!pointFile && pcModel && sceneRef.current) {
//       sceneRef.current.remove(pcModel);
//       setPcModel(null);
//     }

//     // eslint-disable-next-line
//   }, [pointFile]);

//   return { bimModel, pcModel, error };
// }

import { useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPRESSION_THRESHOLD_BYTES = 700 * 1024 * 1024; // 700 MB
const RETAIN_RATIO = 0.7;

// ─── RANSAC config ────────────────────────────────────────────────────────────
const RANSAC_ITERATIONS = 200; // iterations per plane extraction
const RANSAC_THRESHOLD = 0.05; // distance (world units) to count as inlier
const RANSAC_MIN_INLIERS = 0.03; // min fraction of remaining points for a plane
const MAX_PLANES = 8; // extract up to 8 planes
const RANSAC_SAMPLE_SIZE = 50000; // work on a subsample for speed, then label all

// ─── Segment colours ──────────────────────────────────────────────────────────
const SEGMENT_PALETTE = [
  [0.2, 0.85, 0.4], // green
  [1.0, 0.9, 0.2], // yellow
  [0.25, 0.75, 1.0], // cyan / light blue
  [1.0, 0.25, 0.7], // pink / magenta
  [0.3, 0.55, 1.0], // blue
  [0.2, 0.9, 0.8], // teal
  [1.0, 0.55, 0.2], // orange
  [0.8, 0.3, 1.0], // purple
];
const COLOR_UNASSIGNED = [0.55, 0.55, 0.55]; // grey for points not on any plane

// ─── RANSAC plane segmentation ────────────────────────────────────────────────
//
//  Algorithm (iterative plane extraction):
//
//  repeat up to MAX_PLANES times on the remaining unassigned points:
//    1. Randomly sample 3 points → fit a plane (normal + distance)
//    2. Count inliers: points within RANSAC_THRESHOLD of that plane
//    3. Keep the plane with the most inliers after RANSAC_ITERATIONS trials
//    4. Assign those inliers a colour and remove them from the candidate set
//    5. Stop early if no plane found with enough inliers
//
//  To keep it fast in-browser, RANSAC runs on a random subsample of at most
//  RANSAC_SAMPLE_SIZE points, then every point in the full cloud is tested
//  against the extracted planes at the end.
//
function ransacSegment(geometry) {
  const pos = geometry.attributes.position;
  const total = pos.count;

  // ── Build a flat array of {x,y,z,origIndex} for the working set ───────────
  // Use a subsample for the RANSAC search to keep it fast
  const step = Math.max(1, Math.floor(total / RANSAC_SAMPLE_SIZE));
  const sample = [];
  for (let i = 0; i < total; i += step) {
    sample.push({
      x: pos.array[i * 3],
      y: pos.array[i * 3 + 1],
      z: pos.array[i * 3 + 2],
      idx: i,
    });
  }

  const sampleSize = sample.length;
  const planeLabels = new Int8Array(sampleSize).fill(-1); // -1 = unassigned
  const planes = []; // { nx, ny, nz, d }

  let remaining = Array.from({ length: sampleSize }, (_, i) => i); // indices into sample[]

  // ── Iterative plane extraction ─────────────────────────────────────────────
  for (let planeIdx = 0; planeIdx < MAX_PLANES; planeIdx++) {
    if (remaining.length < 3) break;

    const minInliers = Math.max(
      3,
      Math.floor(remaining.length * RANSAC_MIN_INLIERS),
    );
    let bestPlane = null;
    let bestInliers = [];

    for (let iter = 0; iter < RANSAC_ITERATIONS; iter++) {
      // 1. Sample 3 random points from remaining
      const a = sample[remaining[randInt(remaining.length)]];
      const b = sample[remaining[randInt(remaining.length)]];
      const c = sample[remaining[randInt(remaining.length)]];

      // 2. Compute plane normal via cross product of (b-a) × (c-a)
      const abx = b.x - a.x,
        aby = b.y - a.y,
        abz = b.z - a.z;
      const acx = c.x - a.x,
        acy = c.y - a.y,
        acz = c.z - a.z;
      let nx = aby * acz - abz * acy;
      let ny = abz * acx - abx * acz;
      let nz = abx * acy - aby * acx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len < 1e-10) continue; // degenerate — skip
      nx /= len;
      ny /= len;
      nz /= len;

      // Plane equation: nx*x + ny*y + nz*z = d
      const d = nx * a.x + ny * a.y + nz * a.z;

      // 3. Find inliers
      const inliers = [];
      for (let ri = 0; ri < remaining.length; ri++) {
        const p = sample[remaining[ri]];
        const dist = Math.abs(nx * p.x + ny * p.y + nz * p.z - d);
        if (dist < RANSAC_THRESHOLD) inliers.push(remaining[ri]);
      }

      if (inliers.length > bestInliers.length) {
        bestInliers = inliers;
        bestPlane = { nx, ny, nz, d };
        // Early exit if we have a dominant plane
        if (bestInliers.length > remaining.length * 0.5) break;
      }
    }

    // 4. Accept plane if it has enough inliers
    if (!bestPlane || bestInliers.length < minInliers) break;

    planes.push(bestPlane);
    const inlierSet = new Set(bestInliers);

    for (const ri of bestInliers) planeLabels[ri] = planeIdx;

    // 5. Remove inliers from remaining set
    remaining = remaining.filter((ri) => !inlierSet.has(ri));
  }

  // ── Now label ALL points in the full cloud against extracted planes ─────────
  const result = new Float32Array(total * 3);

  for (let i = 0; i < total; i++) {
    const x = pos.array[i * 3];
    const y = pos.array[i * 3 + 1];
    const z = pos.array[i * 3 + 2];

    let bestLabel = -1;
    let bestDist = RANSAC_THRESHOLD;

    for (let pi = 0; pi < planes.length; pi++) {
      const p = planes[pi];
      const dist = Math.abs(p.nx * x + p.ny * y + p.nz * z - p.d);
      if (dist < bestDist) {
        bestDist = dist;
        bestLabel = pi;
      }
    }

    const c =
      bestLabel >= 0
        ? SEGMENT_PALETTE[bestLabel % SEGMENT_PALETTE.length]
        : COLOR_UNASSIGNED;

    result[i * 3] = c[0];
    result[i * 3 + 1] = c[1];
    result[i * 3 + 2] = c[2];
  }

  console.info(
    `[RANSAC] Detected ${planes.length} planes from ${total.toLocaleString()} points.`,
  );
  planes.forEach((p, i) => {
    const label =
      Math.abs(p.ny) > 0.7
        ? p.ny > 0
          ? "floor"
          : "ceiling"
        : Math.abs(p.nx) > Math.abs(p.nz)
          ? p.nx > 0
            ? "east wall"
            : "west wall"
          : p.nz > 0
            ? "north wall"
            : "south wall";
    console.info(
      `  Plane ${i}: ${label}  normal=(${p.nx.toFixed(2)}, ${p.ny.toFixed(2)}, ${p.nz.toFixed(2)})`,
    );
  });

  return result;
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

// ─── Subsample geometry ───────────────────────────────────────────────────────
function subsampleGeometry(geometry, retainRatio) {
  const positions = geometry.attributes.position;
  const colors = geometry.attributes.color;
  const normals = geometry.attributes.normal;
  const total = positions.count;
  const step = Math.max(1, Math.round(1 / retainRatio));
  const kept = Math.ceil(total / step);

  const newPos = new Float32Array(kept * 3);
  const newCol = colors ? new Float32Array(kept * 3) : null;
  const newNrm = normals ? new Float32Array(kept * 3) : null;

  let out = 0;
  for (let i = 0; i < total; i += step) {
    const s = i * 3,
      d = out * 3;
    newPos[d] = positions.array[s];
    newPos[d + 1] = positions.array[s + 1];
    newPos[d + 2] = positions.array[s + 2];
    if (newCol) {
      newCol[d] = colors.array[s];
      newCol[d + 1] = colors.array[s + 1];
      newCol[d + 2] = colors.array[s + 2];
    }
    if (newNrm) {
      newNrm[d] = normals.array[s];
      newNrm[d + 1] = normals.array[s + 1];
      newNrm[d + 2] = normals.array[s + 2];
    }
    out++;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(newPos, 3));
  if (newCol) geo.setAttribute("color", new THREE.BufferAttribute(newCol, 3));
  if (newNrm) geo.setAttribute("normal", new THREE.BufferAttribute(newNrm, 3));
  return geo;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useModelLoader(sceneData, props) {
  const { sceneRef, cameraRef, controlsRef } = sceneData;
  const { bimFile, pointFile, bimVisible, pcVisible, setBimElementCount } =
    props;

  const [bimModel, setBimModel] = useState(null);
  const [pcModel, setPcModel] = useState(null);
  const [error, setError] = useState(null);
  const [isSegmented, setIsSegmented] = useState(false);
  const [wasCompressed, setWasCompressed] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false); // loading state

  const [colorRefs] = useState(() => ({ original: null, segment: null }));

  const isValidFBX = (f) => f?.name?.toLowerCase().endsWith(".fbx");
  const isValidPLY = (f) => f?.name?.toLowerCase().endsWith(".ply");

  // ─── Lights ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(ambient, dirLight);
    return () => {
      scene.remove(ambient, dirLight);
    };
  }, [sceneRef]);

  // ─── Load FBX ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    if (bimModel) {
      sceneRef.current.remove(bimModel);
      setBimModel(null);
      setBimElementCount?.(0);
    }
    if (!bimFile) return;
    if (!isValidFBX(bimFile)) {
      alert("FBX format only support");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(bimFile);
    new FBXLoader().load(
      url,
      (fbx) => {
        let meshCount = 0;
        fbx.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            child.material = new THREE.MeshStandardMaterial({
              color: 0x4a90e2,
              roughness: 0.5,
              metalness: 0.1,
            });
          }
        });
        setBimElementCount?.(meshCount);
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        fbx.position.sub(center);
        sceneRef.current.add(fbx);
        setBimModel(fbx);

        if (cameraRef?.current) {
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
          cameraRef.current.position.set(cameraZ, cameraZ, cameraZ);
          cameraRef.current.lookAt(0, 0, 0);
          cameraRef.current.updateProjectionMatrix();
          if (controlsRef?.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.enableZoom = true;
            controlsRef.current.minDistance = 0.1;
            controlsRef.current.maxDistance = 5000;
            controlsRef.current.update();
          }
        }
      },
      undefined,
      (err) => console.error("FBX Load Error:", err),
    );
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line
  }, [bimFile]);

  // ─── Load Point Cloud ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pointFile || !sceneRef.current) return;
    if (!isValidPLY(pointFile)) {
      alert("PLY format only support");
      return;
    }

    setIsSegmented(false);
    setWasCompressed(false);
    colorRefs.original = null;
    colorRefs.segment = null;
    setError(null);

    const url = URL.createObjectURL(pointFile);
    const needsCompress = pointFile.size > COMPRESSION_THRESHOLD_BYTES;

    new PLYLoader().load(
      url,
      (geometry) => {
        // Do NOT call computeVertexNormals() on point clouds

        let finalGeo = geometry;
        if (needsCompress) {
          console.info(
            `[PLY] ${(pointFile.size / 1024 / 1024).toFixed(0)} MB > 700 MB — subsampling to ${(RETAIN_RATIO * 100).toFixed(0)}%`,
          );
          finalGeo = subsampleGeometry(geometry, RETAIN_RATIO);
          geometry.dispose();
          setWasCompressed(true);
        }

        if (!finalGeo.attributes.color) {
          const whites = new Float32Array(
            finalGeo.attributes.position.count * 3,
          ).fill(1);
          finalGeo.setAttribute("color", new THREE.BufferAttribute(whites, 3));
        }

        // Save original colours
        colorRefs.original = new Float32Array(finalGeo.attributes.color.array);

        // Render with original colours immediately
        const material = new THREE.PointsMaterial({
          size: 0.02,
          vertexColors: true,
        });
        const points = new THREE.Points(finalGeo, material);
        sceneRef.current.add(points);
        setPcModel(points);

        // Run RANSAC asynchronously so it doesn't block the render
        // Use setTimeout to yield to the browser first
        setTimeout(() => {
          try {
            colorRefs.segment = ransacSegment(finalGeo);
          } catch (e) {
            console.error("RANSAC segmentation failed:", e);
          }
        }, 100);

        URL.revokeObjectURL(url);
      },
      undefined,
      (err) => {
        console.error("PLY load error:", err);
        URL.revokeObjectURL(url);
      },
    );

    return () => {
      if (pcModel && sceneRef.current) {
        sceneRef.current.remove(pcModel);
        pcModel.geometry?.dispose();
        pcModel.material?.dispose();
        setPcModel(null);
      }
    };
    // eslint-disable-next-line
  }, [pointFile]);

  // ─── Toggle segmentation ───────────────────────────────────────────────────
  const toggleSegmentation = useCallback(() => {
    if (!pcModel || !colorRefs.original) return;

    const next = !isSegmented;

    if (next) {
      // If RANSAC hasn't finished yet, run it now (blocking, but only once)
      if (!colorRefs.segment) {
        setIsSegmenting(true);
        setTimeout(() => {
          try {
            colorRefs.segment = ransacSegment(pcModel.geometry);
          } catch (e) {
            console.error("RANSAC failed:", e);
            setIsSegmenting(false);
            return;
          }
          const colorAttr = pcModel.geometry.attributes.color;
          colorAttr.array.set(colorRefs.segment);
          colorAttr.needsUpdate = true;
          setIsSegmented(true);
          setIsSegmenting(false);
        }, 50);
        return;
      }

      const colorAttr = pcModel.geometry.attributes.color;
      colorAttr.array.set(colorRefs.segment);
      colorAttr.needsUpdate = true;
    } else {
      const colorAttr = pcModel.geometry.attributes.color;
      colorAttr.array.set(colorRefs.original);
      colorAttr.needsUpdate = true;
    }

    setIsSegmented(next);
    // eslint-disable-next-line
  }, [pcModel, isSegmented]);

  // ─── Visibility ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (bimModel) bimModel.visible = bimVisible;
  }, [bimVisible, bimModel]);
  useEffect(() => {
    if (pcModel) pcModel.visible = pcVisible;
  }, [pcVisible, pcModel]);

  // ─── Cleanup on file removal ───────────────────────────────────────────────
  useEffect(() => {
    if (!bimFile && bimModel && sceneRef.current) {
      sceneRef.current.remove(bimModel);
      setBimModel(null);
      setBimElementCount?.(0);
    }
    // eslint-disable-next-line
  }, [bimFile]);

  useEffect(() => {
    if (!pointFile && pcModel && sceneRef.current) {
      sceneRef.current.remove(pcModel);
      pcModel.geometry?.dispose();
      pcModel.material?.dispose();
      setPcModel(null);
      setIsSegmented(false);
      colorRefs.original = null;
      colorRefs.segment = null;
    }
    // eslint-disable-next-line
  }, [pointFile]);

  return {
    bimModel,
    pcModel,
    error,
    toggleSegmentation,
    isSegmented,
    isSegmenting, // true while RANSAC is running — use for button loading state
    wasCompressed,
  };
}
