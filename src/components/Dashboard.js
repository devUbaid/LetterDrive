import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/Dashboard.css"

function Dashboard({ user }) {
  const [letters, setLetters] = useState([])
  const [driveLetters, setDriveLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("local")
  const navigate = useNavigate()

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

  useEffect(() => {
    fetchLetters()
  }, [])

  const fetchLetters = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/letters`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setLetters(data)
      } else {
        console.error("Failed to fetch letters")
      }
    } catch (error) {
      console.error("Error fetching letters:", error)
    } finally {
      setLoading(false)
    }
  }

  const createNewLetter = () => {
    navigate("/editor")
  }

  const fetchDriveLetters = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/drive/letters`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setDriveLetters(data)
        setActiveTab("drive")
      }
    } catch (error) {
      console.error("Error fetching Drive letters:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLetter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this letter?")) {
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/letters/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setLetters(letters.filter((letter) => letter._id !== id))
      } else {
        console.error("Failed to delete letter")
      }
    } catch (error) {
      console.error("Error deleting letter:", error)
    }
  }

  const deleteDriveLetter = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this Google Drive letter?")) {
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/drive/delete/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setDriveLetters(driveLetters.filter((letter) => letter.id !== fileId))
      } else {
        console.error("Failed to delete Google Drive letter")
      }
    } catch (error) {
      console.error("Error deleting Google Drive letter:", error)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || "User"}</h1>
        <div className="dashboard-actions">
          <button className="new-letter-btn" onClick={createNewLetter}>
            Create New Letter
          </button>
          {activeTab === "local" && (
            <button className="fetch-drive-btn" onClick={fetchDriveLetters}>
              View Google Drive Letters
            </button>
          )}
          {activeTab === "drive" && (
            <button className="fetch-local-btn" onClick={() => setActiveTab("local")}>
              View Local Letters
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "local" ? "active" : ""}`}
          onClick={() => setActiveTab("local")}
        >
          My Letters
        </button>
        <button
          className={`tab-btn ${activeTab === "drive" ? "active" : ""}`}
          onClick={fetchDriveLetters}
        >
          Google Drive
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your letters...</div>
      ) : (
        <div className="letters-grid">
          {activeTab === "local" && letters.length > 0 ? (
            letters.map((letter) => (
              <div className="letter-card" key={letter._id}>
                <div className="letter-box">
                  <h3 className="letter-title">{letter.title || "Untitled Letter"}</h3>
                  <div
                    className="letter-preview"
                    dangerouslySetInnerHTML={{ __html: letter.content.substring(0, 150) + "..." }}
                  ></div>
                </div>
                <div className="letter-meta">
                  <span>Last edited: {new Date(letter.updatedAt).toLocaleDateString()}</span>
                  {letter.savedToDrive && <span className="drive-badge">Saved to Drive</span>}
                </div>
                <div className="letter-actions">
                  <Link to={`/editor/${letter._id}`} className="edit-btn">
                    Edit
                  </Link>
                  <button onClick={() => deleteLetter(letter._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : activeTab === "drive" && driveLetters.length > 0 ? (
            driveLetters.map((letter) => (
              <div className="letter-card drive-letter" key={letter.id}>
                <h3>{letter.name}</h3>
                <div className="letter-meta">
                  <span>Created: {new Date(letter.createdTime).toLocaleDateString()}</span>
                  <span>Modified: {new Date(letter.modifiedTime).toLocaleDateString()}</span>
                </div>
                <div className="letter-actions">
                  <a
                    href={`https://docs.google.com/document/d/${letter.id}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    Open in Drive
                  </a>
                  <button onClick={() => deleteDriveLetter(letter.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-letters">
              <p>
                {activeTab === "local"
                  ? "You don't have any letters yet. Create your first letter!"
                  : "No letters found in your Google Drive 'Letters' folder."}
              </p>
              {activeTab === "local" && <button onClick={createNewLetter}>Create Letter</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
