export function Header({ onSave, onNew, copyStatus }) {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="Xpensed home">
        <span className="brand-mark" aria-hidden="true">₱</span>
        <span>Xpensed</span>
      </a>
      <div className="header-actions">
        <button className="button button-quiet" type="button" onClick={onNew}>New tracker</button>
        <button className="button button-primary" type="button" onClick={onSave}>
          {copyStatus === "copied" ? "Copied Link!" : copyStatus === "error" ? "Copy failed" : "Save as Link"}
        </button>
      </div>
    </header>
  );
}
