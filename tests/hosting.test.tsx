import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SitePage } from "../src/site/SitePage";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe.each(["/", "/web-design-project/"])("visiting a site hosted at %s", (basePath) => {
  it("opens contact and legal directly, with a way back to the same portfolio", () => {
    vi.stubEnv("BASE_URL", basePath);
    const page = render(<SitePage pathname={`${basePath}contact/`} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("working on?");
    expect(screen.getByRole("img")).toHaveAttribute("src", `${basePath}images/timo-portrait.webp`);
    expect(screen.getByRole("link", { name: "Back to the food" })).toHaveAttribute(
      "href",
      basePath,
    );
    const legalLink = screen.getByRole("link", { name: "Legal" });
    expect(legalLink).toHaveAttribute("href", `${basePath}legal/`);

    page.rerender(<SitePage pathname={legalLink.getAttribute("href")!} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Legal");
    expect(screen.getByRole("link", { name: "Back to the food" })).toHaveAttribute(
      "href",
      basePath,
    );
  });

  it("loads gallery photographs under the hosting path and remembers the chosen image", async () => {
    vi.stubEnv("BASE_URL", basePath);
    render(<SitePage pathname={basePath} />);
    expect(screen.getByRole("link", { name: "Let’s talk" })).toHaveAttribute(
      "href",
      `${basePath}contact/`,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Come closer: anticipation" }));
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(document.querySelector(".detail-photo > img")).toHaveAttribute(
      "src",
      `${basePath}images/timo-03.jpg`,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next colour photograph" }));
    });
    expect(document.querySelector(".detail-photo > img")).toHaveAttribute(
      "src",
      `${basePath}images/timo-04.jpg`,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close photograph" }));
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(document.querySelector("#colour .photo-window img")).toHaveAttribute(
      "src",
      `${basePath}images/timo-04.jpg`,
    );
  });
});
