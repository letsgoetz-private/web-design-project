import { services } from "./consts";
import { LinkArrow } from "../components/LinkArrow";
import { LegalNotice } from "../legal/LegalNotice";
import { siteUrl } from "../site/utils";
import { pageSlugs } from "../site/consts";

export function ClosingSection() {
  return (
    <section className="encounter services" id="kitchen" aria-labelledby="services-title">
      <div className="services-content">
        <h2 className="index services-section-title" id="services-title">
          04 / The kitchen
        </h2>
        <div className="services-layout">
          <div className="services-detail">
            <h3 className="services-heading" id="services-list-title">
              What I do
            </h3>
            <dl className="services-list" aria-labelledby="services-list-title">
              {services.map((service) => (
                <div key={service.name}>
                  <dt>{service.name}</dt>
                  <dd>{service.description}</dd>
                </div>
              ))}
            </dl>
            <a
              className="service-link service-recipes"
              href="https://gronda.com/@timo-mueller-kpc?hl=de"
              target="_blank"
              rel="noreferrer"
            >
              Recipes on Gronda <LinkArrow />
            </a>
          </div>
          <div className="services-intro">
            <h3 className="services-heading">Why I do it</h3>
            <p className="services-origin">I came to food styling through cooking.</p>
            <div className="services-reason">
              <p>I want people to taste with their eyes.</p>
              <p>
                A broken edge or a little char can make food desirable. Precision is knowing which
                imperfections to leave alone.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="services-footer">
        <nav className="section-navigation" aria-label="Kitchen navigation">
          <a className="continue" href="#plate">
            <LinkArrow direction="up" />
            Back to the food
          </a>
          <a className="continue" href={siteUrl(`${pageSlugs.contact}/`)}>
            Contact <LinkArrow />
          </a>
        </nav>
        <LegalNotice />
      </footer>
    </section>
  );
}
