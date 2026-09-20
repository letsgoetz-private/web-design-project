import { PortfolioPage } from "../src/portfolio/PortfolioPage";
import { ContactPage } from "../src/contact/ContactPage";
import * as contactLoader from "../src/contact/loadContactDetails";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setReducedMotion } from "./setup";

async function mountPage(path = "/") {
  window.history.replaceState(null, "", path);
  render(path === "/contact" ? <ContactPage /> : <PortfolioPage />);
}

async function click(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

async function settle(duration = 900) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(duration);
  });
}

async function openGallery(name = "anticipation") {
  await click(`Come closer: ${name}`);
  await settle();
}

async function closeGallery() {
  await click("Close photograph");
  await settle();
}

function galleryPhoto() {
  return document.querySelector<HTMLImageElement>(".detail-photo > img")!;
}

afterEach(cleanup);

describe("exploring the food", () => {
  it("remembers each section's last selected photograph on return and reopening", async () => {
    await mountPage();
    await openGallery();
    await click("View colour photograph 3");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
    await closeGallery();
    expect(document.querySelector("#colour .photo-window img")).toHaveAttribute(
      "src",
      "/images/timo-10.jpg",
    );
    await openGallery("bite");
    await click("View structure photograph 2");
    await closeGallery();
    expect(document.querySelector("#structure .photo-window img")).toHaveAttribute(
      "src",
      "/images/timo-01.jpg",
    );
    await openGallery();
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
    expect(screen.getByRole("button", { name: "View colour photograph 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("cycles in place using arrows, keyboard, the photograph and thumbnails, including wraparound", async () => {
    await mountPage();
    await openGallery();
    await click("Previous colour photograph");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-14.jpg");
    await act(async () => {
      fireEvent.keyDown(document.querySelector("dialog")!, { key: "ArrowRight" });
    });
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-03.jpg");
    await click("View next colour photograph");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-04.jpg");
    await click("Next colour photograph");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
  });

  it("a swipe advances once, even when the browser follows it with a click", async () => {
    await mountPage();
    await openGallery();
    const photo = document.querySelector(".detail-photo")!;
    await act(async () => {
      fireEvent.pointerDown(photo, {
        pointerId: 1,
        clientX: 250,
        clientY: 100,
        button: 0,
        isPrimary: true,
      });
      fireEvent.pointerMove(photo, { pointerId: 1, clientX: 140, clientY: 103 });
      fireEvent.pointerUp(photo, { pointerId: 1, clientX: 140, clientY: 103 });
      fireEvent.click(photo, { detail: 1 });
    });
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-04.jpg");
    await click("View next colour photograph");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
  });

  it.each(["outside", "escape", "back"])(
    "returns cleanly via %s without leaving scroll locked",
    async (method) => {
      await mountPage();
      await openGallery();
      expect(document.documentElement.style.overflow).toBe("hidden");
      await act(async () => {
        const dialog = document.querySelector("dialog")!;
        if (method === "escape")
          fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
        else if (method === "outside")
          fireEvent.click(
            screen.getByRole("heading", { name: "…but you can almost feel it on your tongue." }),
          );
        else fireEvent.click(screen.getByRole("button", { name: "Close photograph" }));
      });
      expect(document.querySelector("dialog")).toHaveClass("closing");
      await settle();
      expect(document.querySelector("dialog")).not.toHaveAttribute("open");
      expect(document.documentElement.style.overflow).toBe("");
      expect(document.querySelector(".page-content")).not.toHaveClass("obscured");
    },
  );

  it("ignores navigation while the photograph is expanding or returning", async () => {
    await mountPage();
    await click("Come closer: anticipation");
    expect(screen.getByRole("button", { name: "Next colour photograph" })).toBeDisabled();
    await settle();
    await click("Next colour photograph");
    await click("Close photograph");
    expect(screen.getByRole("button", { name: "Next colour photograph" })).toBeDisabled();
    await settle();
    expect(document.querySelector("#colour .photo-window img")).toHaveAttribute(
      "src",
      "/images/timo-04.jpg",
    );
  });

  it("the opening is a single close-up, without a gallery or thought reveal", async () => {
    await mountPage();
    await openGallery("the plated dish");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-02.jpg");
    expect(document.querySelector(".study-gallery")).toBeNull();
    expect(document.querySelector(".revelation")).toBeNull();
    await closeGallery();
  });

  it("respects reduced motion while keeping the gallery usable", async () => {
    setReducedMotion(true);
    await mountPage();
    await click("Come closer: anticipation");
    await settle(1);
    expect(screen.getByRole("button", { name: "Next colour photograph" })).toBeEnabled();
    await click("Next colour photograph");
    await click("Close photograph");
    await settle(1);
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });
});

describe("interrupted exploration", () => {
  it("can return immediately during expansion and open another section", async () => {
    await mountPage();
    await click("Come closer: anticipation");
    await settle(120);
    await closeGallery();
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("");
    await openGallery("bite");
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-12.jpg");
    expect(screen.getByRole("button", { name: "Next structure photograph" })).toBeEnabled();
  });

  it("keeps the newest choice when photographs finish loading out of order", async () => {
    await mountPage();
    await openGallery();
    const pending: Array<() => void> = [];
    vi.spyOn(HTMLImageElement.prototype, "decode")
      .mockImplementationOnce(() => new Promise((resolve) => pending.push(resolve)))
      .mockImplementationOnce(() => new Promise((resolve) => pending.push(resolve)));
    await click("Next colour photograph");
    await click("Next colour photograph");
    await act(async () => {
      pending[1]();
    });
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
    await act(async () => {
      pending[0]();
    });
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-10.jpg");
    await closeGallery();
    expect(document.querySelector("#colour .photo-window img")).toHaveAttribute(
      "src",
      "/images/timo-10.jpg",
    );
  });

  it("keeps the displayed photograph on return when another image is still loading", async () => {
    await mountPage();
    await openGallery();
    let finishLoading!: () => void;
    vi.spyOn(HTMLImageElement.prototype, "decode").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishLoading = resolve;
        }),
    );
    await click("Next colour photograph");
    await closeGallery();
    await act(async () => {
      finishLoading();
    });
    expect(document.querySelector("#colour .photo-window img")).toHaveAttribute(
      "src",
      "/images/timo-03.jpg",
    );
    await openGallery();
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-03.jpg");
  });

  it("keeps the returned photograph covered until its page preview has decoded", async () => {
    await mountPage();
    await openGallery();
    const source = document.querySelector<HTMLImageElement>("#colour .photo-window img")!;
    let finishLanding!: () => void;
    vi.spyOn(source, "decode").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishLanding = resolve;
        }),
    );
    await closeGallery();
    expect(document.querySelector("dialog")).toHaveAttribute("open");
    expect(document.querySelector("#colour .photo-window")).toHaveStyle({ visibility: "hidden" });
    await act(async () => finishLanding());
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(document.querySelector("#colour .photo-window")).not.toHaveStyle({
      visibility: "hidden",
    });
  });

  it("does not turn a vertical drag into an accidental photograph advance", async () => {
    await mountPage();
    await openGallery();
    const photo = document.querySelector(".detail-photo")!;
    await act(async () => {
      fireEvent.pointerDown(photo, {
        pointerId: 1,
        clientX: 150,
        clientY: 200,
        button: 0,
        isPrimary: true,
      });
      fireEvent.pointerMove(photo, { pointerId: 1, clientX: 155, clientY: 80 });
      fireEvent.pointerUp(photo, { pointerId: 1, clientX: 155, clientY: 80 });
      fireEvent.click(photo, { detail: 1 });
    });
    expect(galleryPhoto()).toHaveAttribute("src", "/images/timo-03.jpg");
  });
});

describe("contact", () => {
  it("is a separate page, with a return link and details revealed only on request", async () => {
    await mountPage("/contact");
    expect(screen.getByRole("link", { name: "Back to the food" })).toHaveAttribute("href", "/");
    expect(screen.queryByText("[Phone number]")).not.toBeInTheDocument();
    expect(screen.queryByText("[Email address]")).not.toBeInTheDocument();
    await click("Let’s talk: show phone and email");
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(screen.getByText("[Phone number]")).toBeInTheDocument();
    expect(screen.getByText("[Email address]")).toBeInTheDocument();
    expect(
      within(document.querySelector("header")!).queryByText("Let’s talk"),
    ).not.toBeInTheDocument();
  });
  it("lets the visitor retry if contact details cannot be loaded", async () => {
    vi.spyOn(contactLoader, "loadContactDetails").mockRejectedValueOnce(new Error("Offline"));
    await mountPage("/contact");
    await click("Let’s talk: show phone and email");
    expect(screen.getByText("Couldn’t load the details. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Let’s talk: show phone and email" })).toBeEnabled();
    await click("Let’s talk: show phone and email");
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(screen.getByText("[Email address]")).toBeInTheDocument();
    expect(
      screen.queryByText("Couldn’t load the details. Please try again."),
    ).not.toBeInTheDocument();
  });
});
