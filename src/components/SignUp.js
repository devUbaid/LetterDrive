import React from "react"
import { Link } from "react-router-dom"
import "../styles/Auth.css"
import googleIcon from "../assets/google-icon.svg"
import signupIllustration from "../assets/signup-illustration.svg"

function SignUp({ setIsAuthenticated, setUser }) {
  const handleGoogleSignUp = () => {
    // Use environment variable for backend URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
    window.location.href = `${backendUrl}/api/auth/google?source=signup`
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-illustration">
          <img src={signupIllustration || "/placeholder.svg"} alt="Sign Up Illustration" />
        </div>
        <div className="auth-form-container">
          <div className="auth-form">
            <h1>Create an Account</h1>
            <p className="auth-description">
              Join thousands of users who trust our platform for their letter writing needs.
            </p>

            <button className="google-auth-btn" onClick={handleGoogleSignUp}>
              <img src={googleIcon || "/placeholder.svg"} alt="Google" className="google-icon" />
              <span>Sign up with Google</span>
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-info">
              <p>
                By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>

            <div className="auth-redirect">
              <p>
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SignUp
