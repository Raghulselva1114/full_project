import React from "react";
import Sidebar from "./Sidebar";
import { layoutStyles } from "../styles/layoutStyles";

function Layout({ sidebarProps, children }) {
  return (
    <div style={layoutStyles.root}>
      {/* LEFT SIDE */}
      <div style={layoutStyles.sidebar}>
        <Sidebar {...sidebarProps} />
      </div>

      {/* RIGHT SIDE */}
      <div style={layoutStyles.viewer}>{children}</div>
    </div>
  );
}

export default Layout;
