export function Header({ onCopy, onNew, copyStatus }) {
  return (
    <header className="app-header">
      <a className="brand" href="/" aria-label="ExpenseBit home">
        <span className="brand-mark" aria-hidden="true">₱</span>
        <span>ExpenseBit</span>
      </a>
      <div className="header-actions">
        <button className="button button-quiet" type="button" onClick={onNew}>New tracker</button>
        <button className="button button-primary" type="button" onClick={onCopy}>
          {copyStatus === "copied" ? "Link copied!" : copyStatus === "error" ? "Copy failed" : "Copy tracker link"}
        </button>
      </div>
    </header>
  );
}
