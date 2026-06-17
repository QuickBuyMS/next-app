'use client';

/**
 * Toast/Snackbar notification component
 * Reads from Redux snackbar slice, auto-dismisses after 4 seconds
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSnackbar, hideSnackbar } from '@/redux/slice/snackbarSlice';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const iconMap = {
  success: <FiCheckCircle size={20} />,
  error: <FiXCircle size={20} />,
  info: <FiInfo size={20} />,
};

export default function Snackbar() {
  const dispatch = useDispatch();
  const { visible, message, type } = useSelector(selectSnackbar);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => dispatch(hideSnackbar()), 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible) return null;

  return (
    <div className={`snackbar snackbar--${type || 'info'}`} role="alert">
      <span className="snackbar__icon">{iconMap[type] || iconMap.info}</span>
      <p className="snackbar__message">{message}</p>
      <button
        className="snackbar__close"
        onClick={() => dispatch(hideSnackbar())}
        aria-label="Close notification"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}
