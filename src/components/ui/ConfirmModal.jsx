'use client';

/**
 * Reusable confirmation modal with glassmorphism design.
 * Supports custom title, message, icon, and action buttons.
 * Closes on overlay click or cancel. Includes entrance/exit animations.
 */
import { useEffect, useCallback } from 'react';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon,
  loading = false,
}) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
    },
    [onCancel, loading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal__overlay" onClick={!loading ? onCancel : undefined}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {icon && <div className="confirm-modal__icon">{icon}</div>}

        <h2 className="confirm-modal__title" id="confirm-modal-title">
          {title}
        </h2>

        {message && <p className="confirm-modal__message">{message}</p>}

        <div className="confirm-modal__actions">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
            id="confirm-modal-cancel"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            loading={loading}
            id="confirm-modal-confirm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
