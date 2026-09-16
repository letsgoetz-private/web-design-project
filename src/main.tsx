import { createRoot } from "react-dom/client";
import { ContactPage } from "./contact/ContactPage";
import { PortfolioPage } from "./portfolio/PortfolioPage";
import "./style.css";

const isContact = window.location.pathname.replace(/\/$/, "") === "/contact";
createRoot(document.getElementById("root")!).render(
  isContact ? <ContactPage /> : <PortfolioPage />,
);
