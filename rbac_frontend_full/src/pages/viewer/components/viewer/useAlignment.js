import { useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { kabschAlgorithm } from "../../utils/kabsch";

export default function useAlignment(sceneData, modelData, props) {
  const { pcModel } = modelData;

  const { bimPoints = [], pcPoints = [], onMatrixChange } = props;

  const [matrix, setMatrix] = useState(null);

  // ================= ALIGN GEOMETRY =================
  const alignGeometry = useCallback(() => {
    if (!pcModel || bimPoints.length < 3 || pcPoints.length < 3) {
      alert("Pick at least 3 matching point pairs!");
      return;
    }

    const src = pcPoints.map((p) => ({ x: p.x, y: p.y, z: p.z }));
    const dst = bimPoints.map((p) => ({ x: p.x, y: p.y, z: p.z }));

    const { R, t, scale } = kabschAlgorithm(src, dst);

    const result = [
      [scale * R[0][0], scale * R[0][1], scale * R[0][2], t[0]],
      [scale * R[1][0], scale * R[1][1], scale * R[1][2], t[1]],
      [scale * R[2][0], scale * R[2][1], scale * R[2][2], t[2]],
      [0, 0, 0, 1],
    ];

    setMatrix(result);
    onMatrixChange?.(result);

    const m = new THREE.Matrix4();
    m.set(
      result[0][0],
      result[0][1],
      result[0][2],
      result[0][3],
      result[1][0],
      result[1][1],
      result[1][2],
      result[1][3],
      result[2][0],
      result[2][1],
      result[2][2],
      result[2][3],
      result[3][0],
      result[3][1],
      result[3][2],
      result[3][3],
    );

    pcModel.applyMatrix4(m);

    alert("Geometry aligned successfully!");
  }, [pcModel, bimPoints, pcPoints, onMatrixChange]);

  // ================= GENERATE MATRIX =================
  const generateMatrix = useCallback(() => {
    if (bimPoints.length < 3 || pcPoints.length < 3) {
      alert("Pick at least 3 matching pairs!");
      return;
    }

    const src = pcPoints.map((p) => ({ x: p.x, y: p.y, z: p.z }));
    const dst = bimPoints.map((p) => ({ x: p.x, y: p.y, z: p.z }));

    const { R, t, scale } = kabschAlgorithm(src, dst);

    const result = [
      [scale * R[0][0], scale * R[0][1], scale * R[0][2], t[0]],
      [scale * R[1][0], scale * R[1][1], scale * R[1][2], t[1]],
      [scale * R[2][0], scale * R[2][1], scale * R[2][2], t[2]],
      [0, 0, 0, 1],
    ];

    setMatrix(result);
    onMatrixChange?.(result);

    alert("Matrix generated!");
  }, [bimPoints, pcPoints, onMatrixChange]);

  // ================= EXPORT MATRIX =================
  const exportMatrix = useCallback(() => {
    if (!matrix) return;

    const blob = new Blob([JSON.stringify(matrix, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "alignment_matrix.json";
    link.click();
  }, [matrix]);

  // ================= APPLY MATRIX =================
  const applyUploadedMatrix = useCallback(
    (uploadedMatrix) => {
      if (!pcModel || !uploadedMatrix) {
        alert("Missing model or matrix");
        return;
      }

      const m = new THREE.Matrix4();

      m.set(
        uploadedMatrix[0][0],
        uploadedMatrix[0][1],
        uploadedMatrix[0][2],
        uploadedMatrix[0][3],
        uploadedMatrix[1][0],
        uploadedMatrix[1][1],
        uploadedMatrix[1][2],
        uploadedMatrix[1][3],
        uploadedMatrix[2][0],
        uploadedMatrix[2][1],
        uploadedMatrix[2][2],
        uploadedMatrix[2][3],
        uploadedMatrix[3][0],
        uploadedMatrix[3][1],
        uploadedMatrix[3][2],
        uploadedMatrix[3][3],
      );

      pcModel.applyMatrix4(m);

      alert("Matrix applied!");
    },
    [pcModel],
  );

  // ================= EXPOSE TO SIDEBAR =================
  useEffect(() => {
    window.alignGeometry = alignGeometry;
    window.generateMatrix = generateMatrix;
    window.exportMatrix = exportMatrix;
    window.applyUploadedMatrix = applyUploadedMatrix;
    window.resetAll = () => window.location.reload();
  }, [alignGeometry, generateMatrix, exportMatrix, applyUploadedMatrix]);
}
