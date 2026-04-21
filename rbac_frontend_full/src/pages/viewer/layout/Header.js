import React from "react";

function Header() {
  return (
    <div
      style={{
        padding: "20px",
        borderBottom: "1px solid #e5e7eb",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* LEFT SIDE */}
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          🗂️ C'TWIN: Construction Digital Twin Platform
        </h2>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          BIM & Point Cloud Alignment
        </div>
      </div>
    </div>
  );
}

export default Header;
