import type { PortfolioAction, PortfolioState } from "./types";

export const initialPortfolioState: PortfolioState = {
  activeId: null,
  phase: "closed",
  selectedImages: {},
};

export function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case "open":
      return state.phase === "closed"
        ? { ...state, activeId: action.studyId, phase: "opening" }
        : state;
    case "expanded":
      return state.phase === "opening" ? { ...state, phase: "open" } : state;
    case "select":
      if (state.phase !== "open" || state.activeId !== action.studyId) return state;
      return {
        ...state,
        selectedImages: { ...state.selectedImages, [action.studyId]: action.index },
      };
    case "close":
      return state.phase === "closed" ? state : { ...state, phase: "closing" };
    case "closed":
      return { ...state, activeId: null, phase: "closed" };
  }
}
