import { LinkArrow } from "./LinkArrow";

type HeaderArgs = { backToFood?: boolean };

export function Header({ backToFood = false }: HeaderArgs) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="identity" href="/">
          <strong>Timo Müller</strong>
          <span className="identity-details">
            <span>Food styling</span>
            <span className="identity-divider" aria-hidden="true">
              /
            </span>
            <span className="identity-location">Hamburg, Germany</span>
          </span>
        </a>
        <a
          className={`contact-link${backToFood ? " header-back-link" : ""}`}
          href={backToFood ? "/" : "/contact"}
        >
          {backToFood ? (
            <>
              <LinkArrow direction="left" />
              <span>Back to the food</span>
            </>
          ) : (
            <>
              <span>Let’s talk</span>
              <LinkArrow />
            </>
          )}
        </a>
      </div>
    </header>
  );
}
