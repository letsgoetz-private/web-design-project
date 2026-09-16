import { createRoot } from "react-dom/client";
import { SitePage } from "./site/SitePage";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <SitePage pathname={window.location.pathname} />,
);
