# Resizable input and output panes

## Goal
Let users resize the JSON input and output panes without changing the existing mobile layout.

## Changes
- Replace the fixed desktop 60/40 grid with the existing accessible resizable-panel control.
- Keep the current stacked input, sticky actions, and output layout below the desktop breakpoint.
- Start desktop panes at 60/40 and enforce practical minimum widths so controls and text remain usable.
- Style the divider with the active editor-theme tokens and provide a visible drag handle and keyboard focus state.

## Verification
- Check mouse dragging and keyboard resizing on desktop.
- Confirm the stacked mobile layout remains unchanged with no horizontal overflow.
- Confirm the project builds and the preview reports no runtime errors.
