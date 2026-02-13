// src/components/GoogleAuthButton.jsx
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuthButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        theme="filled_black"
        size="large"
        text={text}
        width="100%"
        logo_alignment="center"
      />
    </div>
  );
};

export default GoogleAuthButton;