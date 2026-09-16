import type { ContactDetails, ContactMethod } from "./types";

export function contactMethods(details: ContactDetails): ContactMethod[] {
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
}
