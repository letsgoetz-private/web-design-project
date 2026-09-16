# Interaction requirements

Preserve the approved content and visual treatment while changing the implementation.

## Automated visitor scenarios

`tests/portfolio.test.tsx` renders the real page components:

- Each chapter remembers its own most recently displayed image after returning and reopening.
- Arrows, keyboard arrows, the photograph and thumbnails cycle in place, including wraparound.
- One horizontal swipe advances once, even if the browser then emits a click.
- A vertical drag does not advance the gallery.
- Back, Escape and clicks outside the photograph return to the page and release its scroll lock.
- Controls cannot change images while opening or returning.
- Visitors can return during expansion, then open another section.
- A late-loading image cannot overwrite a newer choice or change a photograph after returning.
- The opening photograph has no chapter gallery or thought reveal.
- Reduced-motion visitors can still explore and return.
- Contact remains a separate page; details appear on request and a failed load can be retried.

`tests/section-scroll.test.tsx` exercises browser events against sections with explicit geometry:

- A deliberate wheel gesture moves one section; gestures during travel are discarded.
- Scrolling downward at the final section does not jump backward, including reversed momentum.
- Tall sections retain native scrolling until the remaining content has been read.
- Reduced motion leaves wheel scrolling native.
- Keyboard navigation does not steal keys from focused controls.
- A touch swipe moves one section and waits for a new gesture.
- The page does not travel behind an open photograph.

## Browser checks after layout or motion changes

Check a wide viewport, a short desktop viewport, both sides of the 760px breakpoint, and a narrow
phone viewport. The main photographs and navigation should fit the available section height.
The kitchen may remain taller to keep its copy readable.

Open a chapter, cycle images, and return with both Back and Escape. Check the native dialog's
keyboard behavior and focus returning to its trigger. Opening and returning should settle gently;
the main copy reappears during the final part of the return. Watch for image or scrollbar flicker.
The gallery thought and controls should disappear immediately when returning.

On phones, keep the gallery within one viewport. The revealed thought should sit midway through
the space below the thumbnail controls. Check the contact page's centered mobile layout and
the borderless header links. Compare desktop typography and image alignment before and after
changes. Motion should stop under reduced-motion preferences.

These visual checks supplement the automated behavior tests; jsdom cannot prove pixel placement,
native focus behavior or animation quality.
