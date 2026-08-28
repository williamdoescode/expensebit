export function SaveLinkPanel({ onSave, copyStatus }) {
  return (
    <aside className="save-link-panel" aria-labelledby="save-link-heading">
      <div>
        <span className="eyebrow">Shareable save</span>
        <h2 id="save-link-heading">Save this tracker</h2>
        <p>Generate a link containing the latest tracker details and copy it automatically.</p>
      </div>
      <button className="button button-primary save-link-button" type="button" onClick={onSave}>
        Save as Link
      </button>
      <p className={`copy-feedback ${copyStatus !== "idle" ? "copy-feedback-visible" : ""} ${copyStatus === "error" ? "copy-feedback-error" : ""}`} role="status" aria-live="polite">
        {copyStatus === "copied" ? "Copied Link!" : copyStatus === "error" ? "Couldn’t copy the link. Try again." : ""}
      </p>
    </aside>
  );
}
