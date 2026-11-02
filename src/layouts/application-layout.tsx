import { Outlet } from "react-router-dom";

/**
 * Fullscreen shell. Deliberately renders no `<main>` landmark — the page host
 * (`CalcCanvas`) owns the single `<main>`, so nesting one here would emit two
 * main landmarks on every route.
 */
export default function ApplicationLayout() {
  return (
    <div className="flex min-h-dvh">
      <div className="min-h-dvh min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
