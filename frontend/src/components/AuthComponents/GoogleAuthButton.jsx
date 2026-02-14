// src/pages/GoogleAuthButton.jsx
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton = ({
  onSuccess,
  onError,
  text = "signin_with",
}) => {
  return (
    <div className="google-auth-wrapper">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text={text}
        width="100%"
        logo_alignment="left"
      />

      <style>{`
        .google-auth-wrapper {
          width: 100%;
        }

        /* Main Google Button */
        .google-auth-wrapper div[role="button"] {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          padding: 12px 24px !important;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.25),
            rgba(139, 92, 246, 0.25)
          ) !important;
          border: 1px solid rgba(139, 92, 246, 0.35) !important;
          border-radius: 12px !important;
          color: white !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
          height: auto !important;
          min-height: 50px !important;
        }

        /* Hover Effect */
        .google-auth-wrapper div[role="button"]:hover {
          transform: translateY(-2px) !important;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.35),
            rgba(139, 92, 246, 0.35)
          ) !important;
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.5) !important;
        }

        /* Override Google default styles */
        .google-auth-wrapper .nsm7Bb-HzV7m-LgbsSe {
          background: transparent !important;
          border: none !important;
        }

        .google-auth-wrapper .nsm7Bb-HzV7m-LgbsSe-MJoBVe {
          color: white !important;
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleAuthButton;