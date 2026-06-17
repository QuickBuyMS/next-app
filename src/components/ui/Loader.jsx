'use client';

/**
 * Full-screen loading overlay with animated spinner
 */
export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="loader-spinner__ring"></div>
          <div className="loader-spinner__ring"></div>
          <div className="loader-spinner__ring"></div>
        </div>
        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
}
