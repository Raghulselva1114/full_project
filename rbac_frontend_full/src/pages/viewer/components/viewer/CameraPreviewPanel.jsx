import { useEffect, useState } from "react";

const PANEL_W = 360;
const PHOTO_H = 220;
const VIEW_H = 200;

export default function CameraPreviewPanel({
  selectedCamera,
  setSelectedCamera,
  previewCanvasRef,
  handleManualCameraImageUpload,
}) {
  const [visible, setVisible] = useState(false);

  const handleDownload3DView = () => {
    const canvas = previewCanvasRef?.current;
    if (!canvas) return;

    // wait for render frame
    requestAnimationFrame(() => {
      try {
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `${selectedCamera?.name || "camera"}-3d-view.png`;
        link.click();
      } catch (err) {
        console.error("Download failed", err);
      }
    });
  };

  useEffect(() => {
    if (selectedCamera) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [selectedCamera]);

  if (!selectedCamera || !visible) return null;

  const hasImage = !!selectedCamera.image;
  const awaitingImage = !!selectedCamera.awaitingImage;

  return (
    <div
      id="camera-preview"
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        width: PANEL_W,
        zIndex: 9999,
        background: "rgba(10,10,16,0.97)",
        border: "1px solid rgba(255,255,255,0.11)",
        borderRadius: 12,
        boxShadow: "0 16px 56px rgba(0,0,0,0.85)",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={awaitingImage ? "#06b6d4" : "#8b5cf6"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>

          <span
            style={{
              color: "#e2e8f0",
              fontSize: 12,
              fontWeight: 600,
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedCamera.name}
            {awaitingImage && (
              <span style={{ color: "#06b6d4", marginLeft: 6, fontSize: 10 }}>
                • Manual Camera
              </span>
            )}
          </span>
        </div>

        <button
          onClick={() => setSelectedCamera(null)}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            color: "#94a3b8",
            cursor: "pointer",
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
          }}
        >
          ×
        </button>
      </div>

      {/* Upload UI */}
      {awaitingImage ? (
        <div
          style={{
            padding: "28px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 36 }}>📷</div>

          <div
            style={{
              color: "#cbd5e1",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Upload an image for this camera
          </div>

          <div
            style={{
              color: "#e2e6ed",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            The image will be shown as the camera photo preview
          </div>

          <input
            id="manualCamImageInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              handleManualCameraImageUpload?.(file, selectedCamera.name);

              const url = URL.createObjectURL(file);

              setSelectedCamera((prev) => ({
                ...prev,
                image: url,
                awaitingImage: false,
              }));

              e.target.value = "";
            }}
          />

          <div
            onClick={() =>
              document.getElementById("manualCamImageInput").click()
            }
            style={{
              border: "2px dashed #06b6d4",
              borderRadius: 10,
              padding: "18px 32px",
              cursor: "pointer",
              textAlign: "center",
              color: "#06b6d4",
              fontSize: 13,
              fontWeight: 600,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            📁 Click to browse image
          </div>
        </div>
      ) : (
        <>
          {/* PHOTO */}
          <div
            style={{
              padding: "4px 10px",
              fontSize: 10,
              color: "#eaeef2",
              letterSpacing: "0.07em",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            PHOTO
          </div>

          <div
            style={{
              width: PANEL_W,
              height: PHOTO_H,
              background: "#07070e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            {hasImage ? (
              <img
                src={selectedCamera.image}
                alt="cam"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#334155" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 11 }}>
                  No image uploaded for this camera
                </div>
              </div>
            )}
          </div>

          {/* 3D */}
          <div
            style={{
              padding: "4px 10px",
              fontSize: 10,
              color: "#eaeef2",
              letterSpacing: "0.07em",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            3D
          </div>

          <div
            style={{
              width: PANEL_W,
              height: VIEW_H,
              background: "#07070e",
              position: "relative",
            }}
          >
            <button
              onClick={handleDownload3DView}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                width: 30,
                height: 30,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </button>

            <canvas
              ref={previewCanvasRef}
              width={PANEL_W}
              height={VIEW_H}
              style={{ width: PANEL_W, height: VIEW_H }}
            />
          </div>
        </>
      )}
    </div>
  );
}
