import type { ContactDetails } from "./types";

export const loadContactDetails = async (): Promise<ContactDetails> => {
  const { getContactDetails } = await import("./contact-details");
  return getContactDetails();
};
