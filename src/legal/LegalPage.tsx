import { useEffect } from "react";
import { Header } from "../components/Header";
import { imageCopyright } from "./consts";

export const LegalPage = () => {
  useEffect(() => {
    document.title = "Legal — Timo Müller";
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to legal information
      </a>
      <Header backToFood />
      <main id="main" className="legal-page">
        <article className="legal-content">
          <h1>Legal</h1>
          <p className="legal-draft">
            Preview draft. Operator and privacy information is incomplete; bracketed fields still
            need to be supplied.
          </p>
          <section aria-labelledby="image-rights-title">
            <h2 id="image-rights-title">Image rights</h2>
            <p className="legal-owner">{imageCopyright}. All rights reserved.</p>
            <p>
              The food photographs and portrait are used with Timo Müller’s permission for this
              website and its public source repository. This does not grant a general licence to
              reuse the images. Uses requiring permission must be agreed with the rightsholder.
            </p>
          </section>
          <section aria-labelledby="website-credits-title">
            <h2 id="website-credits-title">Website credits</h2>
            <p className="legal-owner">Code, design and creative direction — Michael Goetz</p>
          </section>
          <section aria-labelledby="impressum-title">
            <h2 id="impressum-title">Legal notice / Impressum</h2>
            <p>[Website operator’s legal name, legal form and representative where applicable]</p>
            <p>[Street and number, postcode, city, country]</p>
            <p>[Public business email and direct contact details]</p>
            <p>
              [Register, registration number, VAT ID and other mandatory details, if applicable]
            </p>
          </section>
          <section aria-labelledby="privacy-title">
            <h2 id="privacy-title">Privacy / Datenschutz</h2>
            <p>
              This frontend uses no cookies, analytics, contact form or embedded third-party
              content. Images are served locally. Instagram and Gronda are ordinary links to
              external services.
            </p>
            <p>
              Hosting can still process connection data, including IP addresses. The final notice
              must describe the actual preview or production hosting setup.
            </p>
            <p>[Controller’s legal name, address and privacy contact]</p>
            <p>
              [Hosting providers, data processed, purposes, legal bases, recipients and retention]
            </p>
            <p>[International transfers and applicable safeguards, where relevant]</p>
            <p>[Applicable data rights, how to exercise them and supervisory authority contact]</p>
          </section>
        </article>
      </main>
    </>
  );
};
