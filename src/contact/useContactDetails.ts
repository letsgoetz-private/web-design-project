import { useEffect, useReducer, useRef } from "react";
import { initialContactState, contactReducer } from "./reducer";
import { loadContactDetails } from "./loadContactDetails";

export function useContactDetails() {
  const [state, dispatch] = useReducer(contactReducer, initialContactState);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function reveal() {
    dispatch({ type: "requested" });
    try {
      const details = await loadContactDetails();
      if (mounted.current) dispatch({ type: "received", details });
    } catch {
      if (mounted.current) dispatch({ type: "failed" });
    }
  }

  return { state, reveal };
}
