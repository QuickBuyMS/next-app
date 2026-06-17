/**
 * Auth layout — centered, split-panel design (hero gradient + form)
 */
export const metadata = {
  title: 'QuickBuy — Authentication',
  description: 'Sign in or create your QuickBuy account',
};

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__hero">
        <div className="auth-layout__hero-content">
          <span className="auth-layout__hero-emoji">🛒</span>
          <h2 className="auth-layout__hero-title">
            Shop Smarter,<br />Not Harder
          </h2>
          <p className="auth-layout__hero-subtitle">
            Discover thousands of products with lightning-fast checkout,
            personalized deals, and seamless order tracking — all in one place.
          </p>
        </div>
      </div>
      <div className="auth-layout__content">{children}</div>
    </div>
  );
}
