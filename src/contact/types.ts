export type ContactDetails = { phone: string | null; email: string | null };
export type ContactState =
  | { status: "hidden" | "loading" | "error"; details: null }
  | { status: "ready"; details: ContactDetails };
export type ContactAction =
  | { type: "requested" }
  | { type: "received"; details: ContactDetails }
  | { type: "failed" };
export type ContactMethod = { label: string; value: string; href: string | null };
