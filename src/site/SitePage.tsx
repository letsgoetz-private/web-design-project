import { ContactPage } from "../contact/ContactPage";
import { LegalPage } from "../legal/LegalPage";
import { PortfolioPage } from "../portfolio/PortfolioPage";
import { pageSlugs } from "./consts";
import { pageSlug } from "./utils";

type SitePageArgs = { pathname: string };

export const SitePage = ({ pathname }: SitePageArgs) => {
  const slug = pageSlug(pathname, import.meta.env.BASE_URL);
  if (slug === pageSlugs.contact) return <ContactPage />;
  if (slug === pageSlugs.legal) return <LegalPage />;
  return <PortfolioPage />;
};
