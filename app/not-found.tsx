// Root-level 404 for requests that bypass the locale proxy (dotted paths
// like /.well-known/*, stale asset URLs). It cannot know the visitor's
// locale, so it is intentionally minimal and English-only; localized 404s
// keep living under app/[locale]/. Because app/layout.tsx is a pass-through,
// this page must render its own <html>/<body> — that is what satisfies
// Next's "missing root layout tags" check.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fafc",
          color: "#162d50",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            Shark Human Alliance
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>404 — Not Found</h1>
          <p style={{ opacity: 0.75 }}>
            The Bureau has no record of this page. No objections were received.
          </p>
          <a href="/en" style={{ color: "#2563eb", fontWeight: 600 }}>
            Return to the Bureau
          </a>
        </main>
      </body>
    </html>
  );
}
