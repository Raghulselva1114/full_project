// import React, { useRef } from "react";
// import useSceneSetup from "./useSceneSetup";
// import useModelLoader from "./useModelLoader";
// import usePicking from "./usePicking";
// import useAlignment from "./useAlignment";
// import useOverlap from "./useOverlap";
// import useCameraSystem from "./useCameraSystem";
// import CameraPreviewPanel from "./CameraPreviewPanel";
// import useTransformControls from "./useTransformControls";

// function ThreeViewer(props) {
//   const mountRef = useRef();

//   // ================= SCENE SETUP =================
//   const sceneData = useSceneSetup(mountRef);

//   // ================= MODEL LOADING =================
//   const modelData = useModelLoader(sceneData, {
//     ...props,
//     setBimElementCount: props.setBimElementCount, // 🔥  BIM count
//   });

//   // ================= PICKING =================
//   const pickingData = usePicking(sceneData, modelData, props);

//   // ================= ALIGNMENT =================
//   useAlignment(sceneData, modelData, {
//     ...props,
//     bimPoints: pickingData?.bimPoints || [],
//     pcPoints: pickingData?.pcPoints || [],
//   });

//   // ================= OVERLAP =================
//   useOverlap(sceneData, modelData, {
//     ...props,
//     setOverlapElementCount: props.setOverlapElementCount, // 🔥 overlap count
//     resetPicking: pickingData.resetPicking,
//   });

//   const cameraData = useCameraSystem(sceneData, modelData, props);

//   const {
//     selectedCamera,
//     setSelectedCamera,
//     previewCanvasRef,
//     handleManualCameraImageUpload,
//     manualCameras,
//     deleteCamera, // correct name from useCameraSystem
//     toggleCameraVisibility, // correct name from useCameraSystem
//   } = cameraData;

//   // Pass list + handlers up to App → Sidebar whenever manualCameras changes
//   React.useEffect(() => {
//     onManualCamerasChange?.({
//       manualCameras,
//       onDeleteManualCamera: deleteCamera,
//       onToggleManualCamera: toggleCameraVisibility,
//     });
//   }, [
//     manualCameras,
//     deleteCamera,
//     toggleCameraVisibility,
//     onManualCamerasChange,
//   ]);

//   // ================= TRANSFORM CONTROLS =================
//   useTransformControls(sceneData);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         position: "relative",
//       }}
//     >
//       <CameraPreviewPanel
//         selectedCamera={selectedCamera}
//         setSelectedCamera={setSelectedCamera}
//         previewCanvasRef={previewCanvasRef}
//         handleManualCameraImageUpload={handleManualCameraImageUpload}
//       />

//       {/* ================= 3D CANVAS ================= */}
//       <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
//     </div>
//   );
// }

// export default ThreeViewer;

// import React, { useRef, useEffect } from "react";
// import useSceneSetup from "./useSceneSetup";
// import useModelLoader from "./useModelLoader";
// import usePicking from "./usePicking";
// import useAlignment from "./useAlignment";
// import useOverlap from "./useOverlap";
// import useCameraSystem from "./useCameraSystem";
// import CameraPreviewPanel from "./CameraPreviewPanel";
// import useTransformControls from "./useTransformControls";

// function ThreeViewer({ onManualCamerasChange, ...props }) {
//   const mountRef = useRef();

//   // ================= SCENE SETUP =================
//   const sceneData = useSceneSetup(mountRef);

//   // ================= MODEL LOADING =================
//   const modelData = useModelLoader(sceneData, {
//     ...props,
//     setBimElementCount: props.setBimElementCount,
//   });

//   // ================= PICKING =================
//   const pickingData = usePicking(sceneData, modelData, props);

//   // ================= ALIGNMENT =================
//   useAlignment(sceneData, modelData, {
//     ...props,
//     bimPoints: pickingData?.bimPoints || [],
//     pcPoints: pickingData?.pcPoints || [],
//   });

//   // ================= OVERLAP =================
//   useOverlap(sceneData, modelData, {
//     ...props,
//     setOverlapElementCount: props.setOverlapElementCount,
//     resetPicking: pickingData.resetPicking,
//   });

//   const cameraData = useCameraSystem(sceneData, modelData, props);

//   const {
//     selectedCamera,
//     setSelectedCamera,
//     previewCanvasRef,
//     handleManualCameraImageUpload,
//     manualCameras,
//     deleteCamera,
//     toggleCameraVisibility,
//   } = cameraData;

//   // ✅ FIXED useEffect (no eslint error)
//   useEffect(() => {
//     onManualCamerasChange?.({
//       manualCameras,
//       onDeleteManualCamera: deleteCamera,
//       onToggleManualCamera: toggleCameraVisibility,
//     });
//   }, [
//     manualCameras,
//     deleteCamera,
//     toggleCameraVisibility,
//     onManualCamerasChange,
//   ]);

//   // ================= TRANSFORM CONTROLS =================
//   useTransformControls(sceneData);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         position: "relative",
//       }}
//     >
//       <CameraPreviewPanel
//         selectedCamera={selectedCamera}
//         setSelectedCamera={setSelectedCamera}
//         previewCanvasRef={previewCanvasRef}
//         handleManualCameraImageUpload={handleManualCameraImageUpload}
//       />

//       {/* ================= 3D CANVAS ================= */}
//       <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
//     </div>
//   );
// }

// export default ThreeViewer;

import React, { useRef, useEffect } from "react";
import useSceneSetup from "./useSceneSetup";
import useModelLoader from "./useModelLoader";
import usePicking from "./usePicking";
import useAlignment from "./useAlignment";
import useOverlap from "./useOverlap";
import useCameraSystem from "./useCameraSystem";
import CameraPreviewPanel from "./CameraPreviewPanel";
import useTransformControls from "./useTransformControls";

function ThreeViewer({ onManualCamerasChange, onModelDataChange, ...props }) {
  const mountRef = useRef();

  const sceneData = useSceneSetup(mountRef);

  const modelData = useModelLoader(sceneData, {
    ...props,
    setBimElementCount: props.setBimElementCount,
  });

  // ── Pass segmentation state up to App ────────────────────────────────────
  useEffect(() => {
    onModelDataChange?.({
      toggleSegmentation: modelData.toggleSegmentation,
      isSegmented: modelData.isSegmented,
      isSegmenting: modelData.isSegmenting,
      wasCompressed: modelData.wasCompressed,
    });
  }, [
    modelData.toggleSegmentation,
    modelData.isSegmented,
    modelData.isSegmenting,
    modelData.wasCompressed,
    onModelDataChange,
  ]);

  const pickingData = usePicking(sceneData, modelData, props);

  useAlignment(sceneData, modelData, {
    ...props,
    bimPoints: pickingData?.bimPoints || [],
    pcPoints: pickingData?.pcPoints || [],
  });

  useOverlap(sceneData, modelData, {
    ...props,
    setOverlapElementCount: props.setOverlapElementCount,
    resetPicking: pickingData.resetPicking,
  });

  const cameraData = useCameraSystem(sceneData, modelData, props);

  const {
    selectedCamera,
    setSelectedCamera,
    previewCanvasRef,
    handleManualCameraImageUpload,
    manualCameras,
    deleteCamera,
    toggleCameraVisibility,
  } = cameraData;

  useEffect(() => {
    onManualCamerasChange?.({
      manualCameras,
      onDeleteManualCamera: deleteCamera,
      onToggleManualCamera: toggleCameraVisibility,
    });
  }, [
    manualCameras,
    deleteCamera,
    toggleCameraVisibility,
    onManualCamerasChange,
  ]);

  useTransformControls(sceneData);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <CameraPreviewPanel
        selectedCamera={selectedCamera}
        setSelectedCamera={setSelectedCamera}
        previewCanvasRef={previewCanvasRef}
        handleManualCameraImageUpload={handleManualCameraImageUpload}
      />
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default ThreeViewer;
