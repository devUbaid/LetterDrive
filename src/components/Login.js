"use client"
import { Link } from "react-router-dom"
import "../styles/Auth.css"
import googleIcon from "../assets/google-icon.svg"
import loginIllustration from "../assets/login-illustration.svg"

function Login({ setIsAuthenticated, setUser }) {
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = "http://localhost:5000/api/auth/google?source=login"
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-illustration">
          <img src={loginIllustration || "/placeholder.svg"} alt="Login Illustration" />
        </div>
        <div className="auth-form-container">
          <div className="auth-form">
            <h1>Welcome Back</h1>
            <p className="auth-description">Log in to access your letters and continue writing.</p>

            <button className="google-auth-btn" onClick={handleGoogleLogin}>
              <img src={googleIcon || "/placeholder.svg"} alt="Google" className="google-icon" />
              <span>Log in with Google</span>
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-info">
              <p>
                By logging in, you agree to our <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>

            <div className="auth-redirect">
              <p>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

