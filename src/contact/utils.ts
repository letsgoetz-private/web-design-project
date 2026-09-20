import type { ContactDetails } from "./types";

type ContactMethod = { label: string; value: string; href: string | null };

export const contactMethods = (details: ContactDetails): ContactMethod[] => {
  return [
    {
      label: "Phone",
      value: details.phone ?? "[Phone number]",
      href: details.phone ? `tel:${details.phone.replace(/[^+\d]/g, "")}` : null,
    },
    {
      label: "Email",
      value: details.email ?? "[Email address]",
      href: details.email ? `mailto:${details.email}` : null,
    },
  ];
};
