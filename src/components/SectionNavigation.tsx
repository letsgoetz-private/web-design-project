import { LinkArrow } from "./LinkArrow";
import type { SectionLink } from "../portfolio/types";

type SectionNavigationArgs = { label: string; links: SectionLink[] };

export function SectionNavigation({ label, links }: SectionNavigationArgs) {
  return (
    <nav className="section-navigation" aria-label={label}>
      {links.map((link) => (
        <a
          key={link.href}
          className={`continue${link.direction === "up" ? " section-previous" : ""}`}
          href={link.href}
        >
          {link.direction === "up" && <LinkArrow direction="up" />}
          {link.label}
          {link.direction === "down" && (
            <>
              {" "}
              <LinkArrow direction="down" />
            </>
          )}
        </a>
      ))}
    </nav>
  );
}
