import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"
import Login from "./components/Login"
import SignUp from "./components/SignUp"
import Dashboard from "./components/Dashboard"
import Editor from "./components/Editor"
import Navbar from "./components/Navbar"
import LandingPage from "./components/LandingPage"

// Backend URL from .env file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(true)
          setUser(data.user)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      })
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <img src="/loader.gif" alt="Loading..." className="loader-image" />
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <SignUp setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              )
            }
          />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/editor/:id?" element={isAuthenticated ? <Editor user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App