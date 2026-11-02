# Theme Legibility and Responsive Design Pass

## Goal
Make every selector and control readable in all six syntax themes, while eliminating clipping and overflow at phone, tablet, laptop, and desktop widths.

## Confirmed findings
- At 375px, the page is 419px wide and the action-bar Download control is clipped beyond the viewport.
- Dark themes render the Indent selector and Download control with light text on a forced white background, producing poor contrast.
- The invalid-JSON panel uses a light destructive background with theme-derived light text, making errors unreadable in dark themes.
- Inactive output-tab labels do not reach WCAG AA contrast in several themes, including the default Azure Light theme.
- Dark-theme hover fills use black transparency and are nearly invisible.
- All controls meet the 44px touch-target minimum at 375px and 768px; desktop controls intentionally become denser.

## Implementation
1. **Theme-aware controls**
   - Replace fixed white action-bar surfaces with the active pane background.
   - Replace light-only hover fills with theme-aware ink-based hover treatments.
   - Keep focus rings and disabled states clearly distinguishable in every theme.

2. **Readable tabs and validation states**
   - Increase inactive tab-label contrast to meet WCAG AA across all six themes.
   - Add theme-aware error surface, border, and foreground tokens so invalid JSON remains legible in light and dark themes.
   - Preserve existing success/error meaning, icons, and behavior.

3. **375px toolbar repair**
   - Let the trailing Indent, theme, and Download controls wrap within the available width instead of extending the page.
   - Keep the sticky toolbar aligned below the fixed header and preserve the current mobile touch-target sizes.
   - Confirm the theme selector and Download action remain fully visible and usable.

4. **Responsive polish**
   - Review the top bar, wrapped output tabs, byte/verdict badge row, editor panes, and output actions at 375, 768, 1024, and 1440px.
   - Correct any remaining clipping, overlap, awkward orphan rows, or horizontal scrolling without changing app behavior.

## Verification
- Exercise Azure Light, GitHub Light, Solarized Light, One Dark, Dracula, and Monokai in the browser.
- Measure foreground/background contrast for selectors, tabs, validation content, and secondary controls.
- Verify keyboard focus and menu/select operation after visual changes.
- Recheck 375, 768, 1024, and 1440px for page-level overflow and control clipping.
- Run the existing tests and confirm the preview build/typecheck logs are clean.

## Technical scope
Expected edits are limited to the JSON Formatter page styling and its action bar, output tabs, theme registry, and validation panel. No data, parsing, conversion, persistence, routing, or backend behavior will change.
