import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import Layout from "./layout/Layout";
import ThreeViewer from "./components/viewer/ThreeViewer";

export default function ViewerPage() {
  const { id } = useParams();
  
  // -------- FILE STATES --------
  const [bimFile, setBimFile] = useState(null);
  const [pointFile, setPointFile] = useState(null);

  // -------- PICKED POINTS --------
  const [bimPoints, setBimPoints] = useState([]);
  const [pcPoints, setPcPoints] = useState([]);

  // -------- MATRIX --------
  const [matrix, setMatrix] = useState(null);

  // -------- VISIBILITY --------
  const [bimVisible, setBimVisible] = useState(true);
  const [pcVisible, setPcVisible] = useState(true);

  // -------- CAMERA --------
  const [cameraPositionsFile, setCameraPositionsFile] = useState(null);
  const [cameraImages, setCameraImages] = useState([]);
  const [showCameras, setShowCameras] = useState(true);

  // -------- MANUAL CAMERAS --------
  const [manualCameras, setManualCameras] = useState([]);
  const [onDeleteManualCamera, setOnDeleteManualCamera] = useState(null);
  const [onToggleManualCamera, setOnToggleManualCamera] = useState(null);

  const handleManualCamerasChange = useCallback(
    ({ manualCameras, onDeleteManualCamera, onToggleManualCamera }) => {
      setManualCameras(manualCameras);
      setOnDeleteManualCamera(() => onDeleteManualCamera);
      setOnToggleManualCamera(() => onToggleManualCamera);
    },
    [],
  );

  // -------- SEGMENTATION --------
  const [toggleSegmentation, setToggleSegmentation] = useState(null);
  const [isSegmented, setIsSegmented] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [wasCompressed, setWasCompressed] = useState(false);

  const handleModelDataChange = useCallback(
    ({ toggleSegmentation, isSegmented, isSegmenting, wasCompressed }) => {
      setToggleSegmentation(() => toggleSegmentation);
      setIsSegmented(isSegmented);
      setIsSegmenting(isSegmenting);
      setWasCompressed(wasCompressed);
    },
    [],
  );

  // -------- METADATA --------
  const [selectedElement, setSelectedElement] = useState(null);
  const [highlightOverlap, setHighlightOverlap] = useState(false);
  const [bimElementCount, setBimElementCount] = useState(0);
  const [overlapElementCount, setOverlapElementCount] = useState(0);

  return (
    <Layout
      sidebarProps={{
        bimFile,
        pointFile,
        setBimFile,
        setPointFile,
        bimVisible,
        pcVisible,
        setBimVisible,
        setPcVisible,
        setCameraPositionsFile,
        setCameraImages,
        showCameras,
        setShowCameras,
        selectedElement,
        highlightOverlap,
        setHighlightOverlap,
        bimElementCount,
        overlapElementCount,
        bimPoints,
        pcPoints,
        manualCameras,
        onDeleteManualCamera,
        onToggleManualCamera,
        // ── segmentation ──
        toggleSegmentation,
        isSegmented,
        isSegmenting,
        wasCompressed,
      }}
    >
      <ThreeViewer
        bimFile={bimFile}
        pointFile={pointFile}
        onBimPointsChange={setBimPoints}
        onPcPointsChange={setPcPoints}
        onMatrixChange={setMatrix}
        bimVisible={bimVisible}
        pcVisible={pcVisible}
        cameraPositionsFile={cameraPositionsFile}
        cameraImages={cameraImages}
        showCameras={showCameras}
        onElementSelect={setSelectedElement}
        highlightOverlap={highlightOverlap}
        setBimElementCount={setBimElementCount}
        setOverlapElementCount={setOverlapElementCount}
        onManualCamerasChange={handleManualCamerasChange}
        // ── segmentation ──
        onModelDataChange={handleModelDataChange}
      />
    </Layout>
  );
}
