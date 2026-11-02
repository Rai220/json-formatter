import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center px-2 text-sm text-primary underline underline-offset-4">
          Go home
        </Link>
      </div>
    </main>
  );
}
