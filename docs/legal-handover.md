# Legal handover

`/legal` contains confirmed image permissions and placeholders for the operator and privacy details.
It is a draft, not a completed legal notice. GitHub Pages is configured as a manually deployed preview.

Before a public preview or production release:

- Complete the operator's legal name, service address, public email and applicable registration details.
  A hidden contact placeholder does not replace the mandatory information.
- Document the actual host, connection logs, purposes, legal bases, recipients, retention,
  relevant transfers, data rights and privacy contacts.
- Keep Timo's image permission privately; do not publish the correspondence.
- Preserve dated drafts, design decisions and Git history as supporting provenance.
- Confirm the client's code/design usage rights for the handover separately.

The current frontend has no cookies, analytics, contact form, external fonts or embeds.
It serves images locally and uses ordinary outbound links. Recheck the deployed site before
deciding whether consent controls are needed. GitHub Pages logs visitor IP addresses for security;
a public preview is not exempt just because it is temporary.

The build supports a configurable hosting base path and generates `/contact/` and `/legal/`
entry pages. Recheck the production hosting setup when the client takes over.

References: [§5 DDG](https://www.gesetze-im-internet.de/ddg/DDG.pdf),
[GDPR Article 13](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng),
[§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html),
[GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[GitHub repository licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
