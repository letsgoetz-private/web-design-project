import { imageCopyright } from "./consts";
import { siteUrl } from "../site/utils";
import { pageSlugs } from "../site/consts";

export const LegalNotice = () => {
  return (
    <div className="legal-notice">
      <span>{imageCopyright}</span>
      <a href={siteUrl(`${pageSlugs.legal}/`)}>Legal</a>
    </div>
  );
};
