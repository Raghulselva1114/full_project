import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/upload/FileUploader";
import LoadedModels from "../components/upload/LoadedModels";
import ElementMetadata from "../components/metadata/ElementMetadata";
import { buttonStyles } from "../styles/buttonStyles";
import { layoutStyles } from "../styles/layoutStyles";

function Sidebar(props) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const {
    bimFile,
    pointFile,
    setBimFile,
    setPointFile,
    bimVisible,
    pcVisible,
    setBimVisible,
    setPcVisible,
    setCameraPositionsFile,
    showCameras,
    setShowCameras,
    selectedElement,
    highlightOverlap,
    setHighlightOverlap,
    bimElementCount,
    overlapElementCount,
    bimPoints,
    pcPoints,

    // ── segmentation ──
    toggleSegmentation,
    isSegmented,
    isSegmenting,
    wasCompressed,

    // ── manual cameras ──
    manualCameras,
    onDeleteManualCamera,
    onToggleManualCamera,
  } = props;

  const [activeMode, setActiveMode] = useState(null);

  const handleMode = (mode) => {
    setActiveMode(mode);
    window.setPickingMode?.(mode);
  };

  return (
    <div style={layoutStyles.sidebarContent}>
      {/* 🔙 BACK BUTTON */}
      <button
        style={{
          ...buttonStyles.primary,
          backgroundColor: "#475569",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onClick={() => navigate(-1)}
      >
        ⬅ Back to Dashboard
      </button>

      {/* FILE UPLOAD */}
      <h3 style={layoutStyles.sectionTitle}>📁 File Upload</h3>

      <FileUploader
        label="📦 Upload BIM (.fbx)"
        accept=".fbx"
        onFileSelected={setBimFile}
      />
      <FileUploader
        label="🟢 Upload PointCloud (.ply)"
        accept=".ply"
        onFileSelected={setPointFile}
      />

      <LoadedModels
        bimFile={bimFile}
        pointFile={pointFile}
        bimVisible={bimVisible}
        pcVisible={pcVisible}
        onToggleBim={() => setBimVisible(!bimVisible)}
        onTogglePc={() => setPcVisible(!pcVisible)}
        onDeleteBim={() => setBimFile(null)}
        onDeletePc={() => setPointFile(null)}
      />

      {/* ── RANSAC SEGMENTATION BUTTON — only visible when a PLY is loaded ── */}
      {pointFile && (
        <div style={seg.wrapper}>
          <button
            onClick={toggleSegmentation}
            disabled={isSegmenting}
            style={{
              ...seg.btn,
              ...(isSegmented ? seg.btnActive : {}),
              ...(isSegmenting ? seg.btnProcessing : {}),
            }}
          >
            {isSegmenting ? (
              <>
                <span style={seg.spinner} />
                Segmenting…
              </>
            ) : (
              <>
                {/* 4-quadrant icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: 6, flexShrink: 0 }}
                >
                  <rect
                    x="1"
                    y="1"
                    width="6"
                    height="6"
                    rx="1"
                    fill={isSegmented ? "#f43f5e" : "#94a3b8"}
                  />
                  <rect
                    x="9"
                    y="1"
                    width="6"
                    height="6"
                    rx="1"
                    fill={isSegmented ? "#3b82f6" : "#94a3b8"}
                  />
                  <rect
                    x="1"
                    y="9"
                    width="6"
                    height="6"
                    rx="1"
                    fill={isSegmented ? "#22c55e" : "#94a3b8"}
                  />
                  <rect
                    x="9"
                    y="9"
                    width="6"
                    height="6"
                    rx="1"
                    fill={isSegmented ? "#f59e0b" : "#94a3b8"}
                  />
                </svg>
                {isSegmented ? "🔲 Hide Segments" : "🔳 Show Segments"}
              </>
            )}
          </button>

          {isSegmenting && (
            <div style={seg.hint}>Running RANSAC plane detection…</div>
          )}

          {wasCompressed && !isSegmenting && (
            <div style={seg.badge} title="File > 700 MB — subsampled to 70%">
              ⚡ Compressed
            </div>
          )}
        </div>
      )}

      <hr style={layoutStyles.divider} />

      {/* PICKING (ADMIN ONLY) */}
      {role !== "viewer" && (
        <>
          <h3 style={layoutStyles.sectionTitle}>📌 Picking</h3>
          <button
            style={{
              ...buttonStyles.primary,
              backgroundColor: activeMode === "bim" ? "#2563eb" : "#3b82f6",
            }}
            onClick={() => handleMode("bim")}
          >
            📌 Pick BIM Points
          </button>
          <button
            style={{
              ...buttonStyles.orange,
              backgroundColor: activeMode === "pc" ? "#ea580c" : "#f97316",
            }}
            onClick={() => handleMode("pc")}
          >
            🔴 Pick PointCloud Points
          </button>
          <button
            style={{
              ...buttonStyles.gray,
              backgroundColor: activeMode === null ? "#374151" : "#6b7280",
            }}
            onClick={() => handleMode(null)}
          >
            🚫 Stop Picking
          </button>
          <button
            style={buttonStyles.primary}
            onClick={() => {
              window.alignGeometry?.();
              window.clearMarkers?.();
            }}
          >
            🧲 Align Geometry
          </button>
          <hr style={layoutStyles.divider} />
        </>
      )}

      {/* ALIGNMENT MATRIX (ADMIN ONLY) */}
      {role !== "viewer" && (
        <>
          <h3 style={layoutStyles.sectionTitle}>📐 Alignment Matrix</h3>
          <button
            style={buttonStyles.primary}
            onClick={() => {
              window.generateMatrix?.();
              window.clearMarkers?.();
              window.setPickingMode?.(null);
              setActiveMode(null);
            }}
          >
            🧮 Generate Matrix
          </button>
          <button
            style={buttonStyles.success}
            onClick={() => window.exportMatrix?.()}
          >
            📤 Export Matrix
          </button>

          <div
            onClick={() => document.getElementById("matrixUpload").click()}
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f8fafc",
              marginTop: "12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "30px" }}>📂</div>
            <div style={{ fontWeight: "600", marginTop: "6px" }}>
              Upload Matrix (.json)
            </div>
            <div style={{ fontSize: "12px", opacity: 0.6 }}>
              Drop file here or click to browse
            </div>
          </div>
          <input
            id="matrixUpload"
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  window.applyUploadedMatrix?.(JSON.parse(ev.target.result));
                } catch {
                  alert("Invalid JSON file");
                }
              };
              reader.readAsText(file);
            }}
          />

          <button
            style={buttonStyles.success}
            onClick={() => {
              window.applyUploadedMatrix?.();
              window.clearMarkers?.();
              window.setPickingMode?.(null);
              setActiveMode(null);
            }}
          >
            📥 Apply Matrix
          </button>
          <button
            style={buttonStyles.danger}
            onClick={() => window.resetAll?.()}
          >
            ♻️ Reset All
          </button>
          <hr style={layoutStyles.divider} />
        </>
      )}

      {selectedElement && (
        <ElementMetadata
          selectedElement={selectedElement}
          bimElementCount={bimElementCount}
          overlapElementCount={overlapElementCount}
          highlightOverlap={highlightOverlap}
          setHighlightOverlap={setHighlightOverlap}
        />
      )}

      {/* CAMERAS */}
      <h3 style={layoutStyles.sectionTitle}>🎥 Cameras</h3>
      <FileUploader
        label="📂 Upload Camera TXT"
        accept=".txt"
        onFileSelected={setCameraPositionsFile}
      />

      <div style={{ width: "105%" }}>
        <div
          onClick={() => document.getElementById("cameraFolderInput").click()}
          style={{
            border: "2px dashed #d1d5db",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#ffffff",
            transition: "0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f9fafb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffffff")
          }
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
          <div
            style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}
          >
            🖼️ Upload Camera Folder
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            Drop folder here or click to browse
          </div>
        </div>
        <input
          id="cameraFolderInput"
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => window.handleCameraFolderUpload(e.target.files)}
        />
      </div>

      <button
        style={buttonStyles.primary}
        onClick={() => setShowCameras(!showCameras)}
      >
        {showCameras ? "🚫 Hide Cameras" : "👁️ Show Cameras"}
      </button>
      <button
        style={{
          ...buttonStyles.primary,
          backgroundColor: "#06b6d4",
          marginTop: "8px",
        }}
        onClick={() => window.addCameraManually?.()}
      >
        ➕ Add Camera
      </button>

      {manualCameras && manualCameras.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "7px 10px",
              background: "#f0f9ff",
              borderBottom: "1px solid #bae6fd",
              fontSize: "11px",
              fontWeight: "700",
              color: "#0891b2",
              letterSpacing: "0.05em",
            }}
          >
            🩵 MANUAL CAMERAS ({manualCameras.length})
          </div>
          {manualCameras.map((cam) => (
            <div
              key={cam.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 8px",
                borderBottom: "1px solid #f1f5f9",
                background: cam.visible === false ? "#f8fafc" : "#ffffff",
              }}
            >
              <span style={{ fontSize: "11px", flexShrink: 0 }}>
                {cam.hasImage ? "🟣" : "🩵"}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "12px",
                  fontWeight: "500",
                  color: cam.visible === false ? "#94a3b8" : "#1e293b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cam.name}
              </span>
              <button
                title={cam.visible === false ? "Show" : "Hide"}
                onClick={() => onToggleManualCamera?.(cam.name)}
                style={{
                  background: "transparent",
                  border: "1px solid #e2e8f0",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "2px 6px",
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                {cam.visible === false ? "👁️" : "🚫"}
              </button>
              <button
                title="Delete"
                onClick={() => onDeleteManualCamera?.(cam.name)}
                style={{
                  background: "transparent",
                  border: "1px solid #fecaca",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "2px 6px",
                  color: "#ef4444",
                  flexShrink: 0,
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <hr style={layoutStyles.divider} />
      <h3 style={layoutStyles.sectionTitle}>🎥 Camera Alignment Matrix</h3>
      <FileUploader
        label="📂 Upload Camera Matrix (.json)"
        accept=".json"
        onFileSelected={(file) => window.handleCameraMatrixUpload?.(file)}
      />
      <button
        style={buttonStyles.primary}
        onClick={() => window.applyCameraMatrix?.()}
      >
        🚀 Apply Camera Matrix
      </button>
      <button
        style={buttonStyles.success}
        onClick={() => window.exportCameraPositions?.()}
      >
        💾 Export Camera Positions
      </button>
      <div
        style={{
          background: "#eef2ff",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "13px",
          marginTop: "12px",
        }}
      >
        💡 Click a camera marker then press <b>G</b> (move), <b>R</b> (rotate),{" "}
        <b>S</b> (zoom FOV). Press <b>Esc</b> to cancel.
      </div>

      <hr style={layoutStyles.divider} />

      <div style={{ marginTop: "20px" }}>
        <h3>🟦 BIM Points</h3>
        {bimPoints?.length === 0 && (
          <div style={{ fontSize: "12px", color: "#777" }}>
            No BIM points selected
          </div>
        )}
        {bimPoints?.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#e5e7eb",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "6px",
              fontSize: "12px",
            }}
          >
            #{i + 1}: {p.x.toFixed(3)}, {p.y.toFixed(3)}, {p.z.toFixed(3)}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>🟩 Point Cloud Points</h3>
        {pcPoints?.length === 0 && (
          <div style={{ fontSize: "12px", color: "#777" }}>
            No Point Cloud points selected
          </div>
        )}
        {pcPoints?.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#e5e7eb",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "6px",
              fontSize: "12px",
            }}
          >
            #{i + 1}: {p.x.toFixed(3)}, {p.y.toFixed(3)}, {p.z.toFixed(3)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Segmentation button styles ─────────────────────────────────────────────────
const seg = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  btnActive: {
    background: "#ede9fe",
    borderColor: "#7c3aed",
    color: "#5b21b6",
    boxShadow: "0 0 0 2px rgba(124,58,237,0.2)",
  },
  btnProcessing: {
    background: "#fefce8",
    borderColor: "#ca8a04",
    color: "#854d0e",
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    marginRight: 8,
    border: "2px solid #ca8a04",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  hint: {
    fontSize: 11,
    color: "#92400e",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 6,
    padding: "4px 8px",
    textAlign: "center",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#b45309",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 6,
    padding: "3px 8px",
  },
};

// Inject spinner keyframes once
if (
  typeof document !== "undefined" &&
  !document.getElementById("seg-spin-style")
) {
  const s = document.createElement("style");
  s.id = "seg-spin-style";
  s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}

export default Sidebar;
