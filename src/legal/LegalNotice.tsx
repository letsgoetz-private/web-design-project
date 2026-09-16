import { imageCopyright, legalPath } from "./consts";

export function LegalNotice() {
  return (
    <div className="legal-notice">
      <span>{imageCopyright}</span>
      <a href={legalPath}>Legal</a>
    </div>
  );
}
