import { ExpandMark } from "../components/ExpandMark";
import { LinkArrow } from "../components/LinkArrow";
import { useContactDetails } from "./useContactDetails";
import { contactMethods } from "./utils";

export const ContactMethods = () => {
  const { state, reveal } = useContactDetails();
  const loading = state.status === "loading";
  const methods = state.details ? contactMethods(state.details) : [];

  return (
    <div className="contact-methods">
      <div className="direct-contact" aria-live="polite" aria-busy={loading}>
        {state.details ? (
          <dl>
            {methods.map((method) => (
              <div key={method.label}>
                <dt>{method.label}</dt>
                <dd>
                  {method.href ? (
                    <a href={method.href}>{method.value}</a>
                  ) : (
                    <span className="placeholder">{method.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <button
            className="reveal-contact"
            aria-label="Let’s talk: show phone and email"
            onClick={reveal}
            disabled={loading}
          >
            {loading ? "Opening…" : "Let’s talk"}
            <ExpandMark />
          </button>
        )}
        {state.status === "error" && (
          <p className="contact-error">Couldn’t load the details. Please try again.</p>
        )}
      </div>
      <div className="social-contact">
        <a href="https://www.instagram.com/timomuellerr/" target="_blank" rel="noreferrer">
          Instagram <LinkArrow />
        </a>
      </div>
    </div>
  );
};
