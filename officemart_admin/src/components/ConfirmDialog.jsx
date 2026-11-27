export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xoá',
  cancelLabel = 'Huỷ',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        data-testid="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            data-testid="confirm-no"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-danger"
            data-testid="confirm-yes"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xoá...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
