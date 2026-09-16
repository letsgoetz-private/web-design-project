import type { ContactDetails } from "./types";

export async function loadContactDetails(): Promise<ContactDetails> {
  const { getContactDetails } = await import("./contact-details");
  return getContactDetails();
}
