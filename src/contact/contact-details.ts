import type { ContactDetails } from "./types";

// Loaded only after a visitor requests the details. This deters basic HTML
// scrapers, but the module is public and is not a security boundary.
// Replace null with the approved details when available.
const phone: string | null = null;
const email: string | null = null;

export function getContactDetails(): ContactDetails {
  return { phone, email };
}
