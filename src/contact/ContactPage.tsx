import { useEffect } from "react";
import { Header } from "../components/Header";
import { ContactMethods } from "./ContactMethods";
import { LegalNotice } from "../legal/LegalNotice";
import { imageUrl } from "../site/utils";

export function ContactPage() {
  useEffect(() => {
    document.title = "Let’s talk — Timo Müller";
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to contact
      </a>
      <Header backToFood />
      <div className="contact-shell">
        <main id="main" className="contact-page">
          <div className="contact-layout">
            <div className="contact-intro">
              <figure className="contact-portrait">
                <img
                  src={imageUrl("timo-portrait.webp")}
                  alt="Timo Müller in his black chef’s shirt, arms folded."
                  width="600"
                  height="600"
                />
              </figure>
              <blockquote className="contact-thought">
                <p className="contact-conviction">
                  “The styling isn’t supposed to be the hero. <span>The food is.</span>
                </p>
                <p className="contact-reflection">
                  I want you to feel it before the first bite. Crisp, juicy, hot, delicate... Until
                  looking isn't enough.”
                </p>
              </blockquote>
            </div>
            <div className="contact-invitation">
              <h1>
                and what are <span className="wanting">you</span>
                <br />
                working on?
              </h1>
              <ContactMethods />
            </div>
          </div>
        </main>
        <footer className="contact-footer">
          <LegalNotice />
        </footer>
      </div>
    </>
  );
}
