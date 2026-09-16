import { createRoot } from "react-dom/client";
import { ContactPage } from "./contact/ContactPage";
import { PortfolioPage } from "./portfolio/PortfolioPage";
import { LegalPage } from "./legal/LegalPage";
import { legalPath } from "./legal/consts";
import "./style.css";

const path = window.location.pathname.replace(/\/$/, "");
createRoot(document.getElementById("root")!).render(
  path === "/contact" ? <ContactPage /> : path === legalPath ? <LegalPage /> : <PortfolioPage />,
);
