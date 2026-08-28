import { useEffect, useRef, useState } from "react";

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const contentRef = useRef({ title, message, confirmLabel });
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  if (open) contentRef.current = { title, message, confirmLabel };
  const content = contentRef.current;

  useEffect(() => {
    let timer;
    if (open) {
      setRendered(true);
      timer = window.setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      timer = window.setTimeout(() => setRendered(false), 190);
    }
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);
  if (!rendered) return null;
  return (
    <div className={`dialog-backdrop ${visible ? "dialog-visible" : ""}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message">
        <h2 id="dialog-title">{content.title}</h2>
        <p id="dialog-message">{content.message}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="button button-quiet" type="button" onClick={onCancel}>Keep tracker</button>
          <button className="button button-danger" type="button" onClick={onConfirm}>{content.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
