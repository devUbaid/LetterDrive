import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import "../styles/LandingPage.css"

function LandingPage() {
  const observerRef = useRef(null)
  const heroImageRef = useRef(null)

  useEffect(() => {
    // Animation for elements that should animate when they come into view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    // Select all elements with the animate-on-scroll class
    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    animatedElements.forEach((el) => {
      observerRef.current.observe(el)
    })

    // Hero image parallax effect
    const handleScroll = () => {
      if (heroImageRef.current) {
        const scrollValue = window.scrollY
        heroImageRef.current.style.transform = `translateY(${scrollValue * 0.2}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      if (observerRef.current) {
        animatedElements.forEach((el) => {
          observerRef.current.unobserve(el)
        })
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Create Beautiful Letters & Save to Drive</h1>
          <p className="hero-subtitle">
            A simple yet powerful editor that lets you create, edit, and save your letters directly to Google Drive.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="cta-button primary">
              Get Started
            </Link>
            <a href="#features" className="cta-button secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image" ref={heroImageRef}>
            <img src="/images/hero-image1.png" alt="Letter Editor Interface" />
          </div>
          <div className="hero-shape-1"></div>
          <div className="hero-shape-2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header animate-on-scroll">
          <h2>Powerful Features</h2>
          <p>Everything you need to create and manage your letters</p>
        </div>

        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon google-icon"></div>
            <h3>Google Integration</h3>
            <p>Sign in with your Google account and save letters directly to your Google Drive.</p>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon editor-icon"></div>
            <h3>Simple Editor</h3>
            <p>A clean, distraction-free editor that lets you focus on your writing.</p>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon formatting-icon"></div>
            <h3>Rich Formatting</h3>
            <p>Add style to your letters with bold, italic, lists, and more formatting options.</p>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon autosave-icon"></div>
            <h3>Auto-Save</h3>
            <p>Never lose your work with automatic saving as you type.</p>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon organize-icon"></div>
            <h3>Organized Storage</h3>
            <p>All your letters are neatly organized in a dedicated folder on Google Drive.</p>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon secure-icon"></div>
            <h3>Secure & Private</h3>
            <p>Your letters are private and secure, accessible only to you.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header animate-on-scroll">
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </div>

        <div className="steps">
          <div className="step animate-on-scroll">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Sign in with Google</h3>
              <p>Use your Google account to quickly sign in and get started.</p>
            </div>
          </div>

          <div className="step-connector animate-on-scroll"></div>

          <div className="step animate-on-scroll">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create Your Letter</h3>
              <p>Use our simple editor to write and format your letter.</p>
            </div>
          </div>

          <div className="step-connector animate-on-scroll"></div>

          <div className="step animate-on-scroll">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Save to Google Drive</h3>
              <p>With one click, save your letter directly to your Google Drive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header animate-on-scroll">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied users</p>
        </div>

        <div className="testimonials-container">
          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "This letter editor has simplified my workflow tremendously. I love how seamlessly it integrates with
                Google Drive!"
              </p>
            </div>
            <div className="testimonial-author">
              <img src="/images/user1.png" alt="Sarah Johnson" className="author-image" />
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>Marketing Manager</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "The clean interface makes writing letters a joy. No distractions, just pure writing with all the tools
                I need."
              </p>
            </div>
            <div className="testimonial-author">
              <img src="/images/user2.png" alt="Michael Chen" className="author-image" />
              <div className="author-info">
                <h4>Michael Chen</h4>
                <p>Content Creator</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "I use this for all my business correspondence. The Google Drive integration means I can access my
                letters from anywhere."
              </p>
            </div>
            <div className="testimonial-author">
              <img src="/images/user3.png" alt="Emily Rodriguez" className="author-image" />
              <div className="author-info">
                <h4>Emily Rodriguez</h4>
                <p>Small Business Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who trust our platform for their letter writing needs.</p>
          <Link to="/login" className="cta-button primary">
            Sign Up for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Letter Drive</h2>
            <p>Create, edit, and save letters to Google Drive</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3>Product</h3>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#testimonials">Testimonials</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Legal</h3>
              <ul>
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/cookies">Cookie Policy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Letter Drive. All rights reserved.</p>
          <div className="social-links">
            <a href="https://twitter.com" className="social-link twitter"></a>
            <a href="https://facebook.com" className="social-link facebook"></a>
            <a href="https://instagram.com" className="social-link instagram"></a>
            <a href="https://linkedin.com" className="social-link linkedin"></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

