export default function NotFound() {
  return (
    <section className="project-hero" style={{ minHeight: "70vh" }}>
      <div className="wrap">
        <p className="mono" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>404</p>
        <h1>Nothing here.</h1>
        <p className="lede" style={{ marginBottom: 32 }}>That page may have moved or been unpublished.</p>
        <a href="/" className="btn btn-primary">Back home</a>
      </div>
    </section>
  );
}
