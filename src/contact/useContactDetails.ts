import { useCallback, useEffect, useReducer, useRef } from "react";
import { loadContactDetails } from "./loadContactDetails";
import type { ContactDetails } from "./types";

type ContactState =
  | { status: "hidden" | "loading" | "error"; details: null }
  | { status: "ready"; details: ContactDetails };
type ContactAction =
  | { type: "requested" }
  | { type: "received"; details: ContactDetails }
  | { type: "failed" };

const initialContactState: ContactState = { status: "hidden", details: null };

const contactReducer = (state: ContactState, action: ContactAction): ContactState => {
  switch (action.type) {
    case "requested":
      return state.status === "ready" ? state : { status: "loading", details: null };
    case "received":
      return { status: "ready", details: action.details };
    case "failed":
      return { status: "error", details: null };
  }
};

export const useContactDetails = () => {
  const [state, dispatch] = useReducer(contactReducer, initialContactState);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reveal = useCallback(async () => {
    dispatch({ type: "requested" });
    try {
      const details = await loadContactDetails();
      if (mounted.current) dispatch({ type: "received", details });
    } catch {
      if (mounted.current) dispatch({ type: "failed" });
    }
  }, []);

  return { state, reveal };
};
