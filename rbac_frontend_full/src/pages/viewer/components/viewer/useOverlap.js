import { useEffect, useCallback, useRef } from "react";
import * as THREE from "three";

export default function useOverlap(sceneData, modelData, props) {
  const { pcModel, bimModel } = modelData;
  const { highlightOverlap, setOverlapElementCount } = props;

  const tempVecRef = useRef(new THREE.Vector3());

  const highlightOverlappingPoints = useCallback(() => {
    if (!pcModel || !bimModel) return;

    const geom = pcModel.geometry;
    const positions = geom.attributes.position.array;
    const colors = geom.attributes.color.array;

    if (!geom.userData.originalColors) {
      geom.userData.originalColors = colors.slice();
    }

    const THRESHOLD = 0.05;
    const bimBoxes = [];
    let overlapElements = 0;

    bimModel.traverse((c) => {
      if (!c.isMesh) return;

      const box = new THREE.Box3().setFromObject(c);
      box.expandByScalar(THRESHOLD);
      bimBoxes.push(box);

      let hasOverlap = false;

      for (let i = 0; i < positions.length; i += 3) {
        tempVecRef.current
          .set(positions[i], positions[i + 1], positions[i + 2])
          .applyMatrix4(pcModel.matrixWorld);

        if (box.containsPoint(tempVecRef.current)) {
          hasOverlap = true;
          break;
        }
      }

      if (hasOverlap) overlapElements++;
    });

    setOverlapElementCount(overlapElements);

    for (let i = 0; i < positions.length; i += 3) {
      tempVecRef.current
        .set(positions[i], positions[i + 1], positions[i + 2])
        .applyMatrix4(pcModel.matrixWorld);

      let overlap = false;

      for (let b = 0; b < bimBoxes.length && !overlap; b++) {
        if (bimBoxes[b].containsPoint(tempVecRef.current)) {
          overlap = true;
        }
      }

      if (overlap) {
        colors[i] = 0;
        colors[i + 1] = 1;
        colors[i + 2] = 0;
      }
    }

    geom.attributes.color.needsUpdate = true;
  }, [pcModel, bimModel]);

  useEffect(() => {
    if (!pcModel) return;

    if (highlightOverlap) {
      highlightOverlappingPoints();
    } else {
      const geom = pcModel.geometry;
      if (geom.userData.originalColors) {
        geom.attributes.color.array.set(geom.userData.originalColors);
        geom.attributes.color.needsUpdate = true;
      }
    }
  }, [highlightOverlap, highlightOverlappingPoints]);
}
