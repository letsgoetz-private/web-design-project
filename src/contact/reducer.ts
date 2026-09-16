import type { ContactAction, ContactState } from "./types";

export const initialContactState: ContactState = { status: "hidden", details: null };

export function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case "requested":
      return state.status === "ready" ? state : { status: "loading", details: null };
    case "received":
      return { status: "ready", details: action.details };
    case "failed":
      return { status: "error", details: null };
  }
}
