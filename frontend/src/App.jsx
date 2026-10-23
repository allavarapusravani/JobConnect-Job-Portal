import Apply from './pages/Apply'
import ApplicationStatus from './pages/ApplicationStatus'
import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RecruiterDashboard from './pages/RecruiterDashboard'
import './App.css'

const categories = [
  { icon: '💻', name: 'Software Development', count: '120+ jobs' },
  { icon: '🤖', name: 'AI & Machine Learning', count: '80+ jobs' },
  { icon: '📊', name: 'Data Science', count: '95+ jobs' },
  { icon: '🎨', name: 'UI / UX Design', count: '60+ jobs' },
]

const popularSearches = [
  'Python Developer',
  'Java Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'Web Developer',
  'Software Engineer',
  'Data Analyst',
]

function normalizeText(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Select a suitable emoji for each job.
function getJobIcon(job) {
  const title = (job?.title || '').toLowerCase()
  const category = (job?.category || '').toLowerCase()

  if (title.includes('python')) return '🐍'
  if (title.includes('java')) return '☕'

  if (
    title.includes('machine learning') ||
    title.includes('ai/ml') ||
    title.includes('ai engineer') ||
    title.includes('artificial intelligence') ||
    title.includes('deep learning') ||
    title.includes('ml engineer') ||
    category.includes('ai') ||
    category.includes('machine learning')
  ) {
    return '🤖'
  }

  if (
    title.includes('data scientist') ||
    title.includes('data analyst') ||
    title.includes('data science') ||
    title.includes('data engineer') ||
    title.includes('data analytics')
  ) {
    return '📊'
  }

  if (title.includes('react')) return '⚛️'

  if (
    title.includes('ui/ux') ||
    title.includes('ui ux') ||
    title.includes('ux designer') ||
    title.includes('ui designer')
  ) {
    return '🎨'
  }

  if (
    title.includes('web developer') ||
    title.includes('web designer')
  ) {
    return '🌐'
  }

  if (
    title.includes('software developer') ||
    title.includes('software engineer')
  ) {
    return '💻'
  }

  const existingIcon = (job?.icon || '').trim()

  if (existingIcon && existingIcon !== '💼') {
    return existingIcon
  }

  return '💼'
}

// Reusable account area
function ProfileActions() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobconnectUser') || 'null')
    } catch {
      return null
    }
  })

  const [profileOpen, setProfileOpen] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)

  function handleLogout() {
    localStorage.removeItem('jobconnectUser')
    setCurrentUser(null)
    setProfileOpen(false)
    window.location.href = '/'
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setPhotoError('')

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Please choose an image smaller than 2 MB.')
      event.target.value = ''
      return
    }

    if (!currentUser) return

    setPhotoLoading(true)

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const updatedUser = {
          ...currentUser,
          photo: reader.result,
        }

        localStorage.setItem(
          'jobconnectUser',
          JSON.stringify(updatedUser)
        )

        const savedUsers = JSON.parse(
          localStorage.getItem('jobconnectUsers') || '[]'
        )

        if (Array.isArray(savedUsers)) {
          const updatedUsers = savedUsers.map((user) =>
            user.email?.toLowerCase() ===
            currentUser.email?.toLowerCase()
              ? { ...user, photo: reader.result }
              : user
          )

          localStorage.setItem(
            'jobconnectUsers',
            JSON.stringify(updatedUsers)
          )
        }

        setCurrentUser(updatedUser)
        setPhotoError('')
      } catch (error) {
        console.error('Could not save profile photo:', error)
        setPhotoError(
          'Could not save the photo. Please try a smaller image.'
        )
      } finally {
        setPhotoLoading(false)
      }
    }

    reader.onerror = () => {
      setPhotoError('Could not read the selected image.')
      setPhotoLoading(false)
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  if (!currentUser) {
    return (
      <div className="nav-actions">
        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="nav-button">
          Register
        </Link>

        <a href="#jobs" className="nav-button">
          Explore Jobs →
        </a>
      </div>
    )
  }

  return (
    <div className="nav-actions">
      <div className="profile-menu">
        <button
          type="button"
          className="profile-button"
          aria-label="Open account menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((open) => !open)}
        >
          {currentUser.photo ? (
            <img
              src={currentUser.photo}
              alt="Your profile"
              className="nav-profile-photo"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                border: '2px solid #A78BFA',
                flexShrink: 0,
              }}
              onError={() =>
                setPhotoError(
                  'Your saved photo could not be displayed. Please upload it again.'
                )
              }
            />
          ) : (
            <span className="nav-profile-initial">
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </span>
          )}

          <span className="profile-name">
            {currentUser.name || 'My Account'}
          </span>

          <span className="menu-three-lines" aria-hidden="true">
            ☰
          </span>
        </button>

        {profileOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-info">
              <strong>{currentUser.name || 'User'}</strong>
              <p>{currentUser.email}</p>
            </div>

            <div className="profile-photo-upload">
              <label htmlFor="profile-photo-input">
                {photoLoading
                  ? 'Saving photo...'
                  : '📷 Change Profile Photo'}
              </label>

              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photoLoading}
              />

              <small>Choose an image up to 2 MB.</small>

              {photoError && (
                <p className="profile-photo-error">{photoError}</p>
              )}
            </div>

            <Link
              to="/application-status"
              onClick={() => setProfileOpen(false)}
            >
              My Applications
            </Link>

            <Link
              to="/application-status"
              onClick={() => setProfileOpen(false)}
            >
              Application Status
            </Link>

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <a href="#jobs" className="nav-button">
        Explore Jobs →
      </a>
    </div>
  )
}

// Job Details Page
function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    fetch(`http://localhost:8080/api/jobs/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Job details unavailable')
        }

        return response.json()
      })
      .then((data) => {
        setJob({
          ...data,
          icon: getJobIcon(data),
          category:
            data.category ||
            (data.title?.toLowerCase().includes('ai') ||
            data.title?.toLowerCase().includes('ml')
              ? 'AI & Machine Learning'
              : 'Software Development'),
          requirements: data.requirements || [
            'Review the job description',
            'Check the required skills for this position',
            'Prepare your resume before applying',
          ],
        })
      })
      .catch((error) => {
        console.error('Error fetching job details:', error)
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="app">
        <div className="section">
          <p>Loading job details...</p>
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="app">
        <div className="section">
          <h2>Job Not Found</h2>
          <p>This job could not be found.</p>

          <button
            type="button"
            className="outline-button"
            onClick={() => navigate('/')}
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span className="logo-icon">J</span>
          <span>JobConnect</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/#categories">Categories</Link>
          <Link to="/#jobs">Find Jobs</Link>
        </div>

        <ProfileActions />
      </nav>

      <main>
        <section className="section">
          <button
            type="button"
            className="outline-button"
            onClick={() => navigate('/')}
          >
            ← Back to Jobs
          </button>

          <div className="job-card" style={{ marginTop: '24px' }}>
            <div className="job-card-top">
              <span className="company-icon">
                {job.icon}
              </span>

              <span className="job-type">{job.type}</span>
            </div>

            <h2>{job.title}</h2>
            <p className="company-name">{job.company}</p>

            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <span className="eyebrow">JOB DESCRIPTION</span>

              <div style={{ marginTop: '16px' }}>
                {(job.description || 'Job description is not available.')
                  .split(
                    /(?=Job Description:|Responsibilities:|Required Skills:|Eligibility:|Experience:)/i
                  )
                  .map((section, index) => {
                    const match = section.trim().match(
                      /^(Job Description|Responsibilities|Required Skills|Eligibility|Experience):\s*([\s\S]*)$/i
                    )

                    if (!match) {
                      return section.trim() ? (
                        <p
                          key={index}
                          style={{
                            lineHeight: 1.7,
                            marginBottom: '12px',
                          }}
                        >
                          {section.trim()}
                        </p>
                      ) : null
                    }

                    return (
                      <div
                        key={index}
                        style={{ marginBottom: '20px' }}
                      >
                        <h4
                          style={{
                            margin: '0 0 8px',
                            fontSize: '16px',
                            fontWeight: 600,
                          }}
                        >
                          {match[1]}
                        </h4>

                        <p style={{ margin: 0, lineHeight: 1.8 }}>
                          {match[2].trim()}
                        </p>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3>Job Information</h3>
              <p><strong>Job Title:</strong> {job.title}</p>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Job Type:</strong> {job.type}</p>
              <p><strong>Salary:</strong> {job.salary}</p>
              <p><strong>Category:</strong> {job.category}</p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((requirement, index) => (
                  <li key={`${requirement}-${index}`}>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="apply-button"
              style={{ marginTop: '24px' }}
              onClick={() => navigate(`/jobs/${id}/apply`)}
            >
              Apply Now →
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Link to="/" className="logo footer-logo">
          <span className="logo-icon">J</span>
          <span>JobConnect</span>
        </Link>

        <p>Connecting talent with opportunity.</p>

        <span className="copyright">
          © 2026 JobConnect. All rights reserved.
        </span>
      </footer>
    </div>
  )
}

function Home() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [jobs, setJobs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const jobsPerPage = 10
  const pageGroupSize = 6

  useEffect(() => {
    fetch('http://localhost:8080/api/jobs')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        return response.json()
      })
      .then((data) => {
        setJobs(
          data.map((job) => ({
            ...job,
            icon: getJobIcon(job),
            category:
              job.category ||
              (job.title?.toLowerCase().includes('ai') ||
              job.title?.toLowerCase().includes('ml')
                ? 'AI & Machine Learning'
                : 'Software Development'),
          }))
        )
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error)
      })
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const jobDetails = normalizeText(
      `${job.title} ${job.company} ${job.category}`
    )

    const matchesSearch = jobDetails.includes(normalizeText(search))

    const matchesLocation = normalizeText(job.location).includes(
      normalizeText(location)
    )

    const matchesCategory =
      !selectedCategory || job.category === selectedCategory

    return matchesSearch && matchesLocation && matchesCategory
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, location, selectedCategory])

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage

  const currentJobs = filteredJobs.slice(
    startIndex,
    startIndex + jobsPerPage
  )

  const firstVisiblePage =
    Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1

  const visiblePages = Array.from(
    {
      length: Math.min(
        pageGroupSize,
        Math.max(0, totalPages - firstVisiblePage + 1)
      ),
    },
    (_, index) => firstVisiblePage + index
  )

  function resetFilters() {
    setSearch('')
    setLocation('')
    setSelectedCategory('')
    setCurrentPage(1)
  }

  function searchPopularJob(term) {
    setSearch(term)
    setSelectedCategory('')

    document.getElementById('jobs')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">J</span>
          <span>JobConnect</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#jobs">Find Jobs</a>
          <Link to="/application-status">Check Status</Link>
        </div>

        <ProfileActions />
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="hero-badge">
              ✨ Your career starts here
            </span>

            <h1>
              Find Your <span>Dream Job</span>
              <br />
              Build Your Future
            </h1>

            <p>
              Discover opportunities that match your skills and passion.
              Your next career move starts with JobConnect.
            </p>

            <div className="search-box">
              <div className="search-field">
                <label htmlFor="job-search">Job Title</label>
                <input
                  id="job-search"
                  type="text"
                  placeholder="e.g. Python Developer"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      document.getElementById('jobs')?.scrollIntoView({
                        behavior: 'smooth',
                      })
                    }
                  }}
                />
              </div>

              <div className="search-field location-field">
                <label htmlFor="job-location">Location</label>
                <input
                  id="job-location"
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      document.getElementById('jobs')?.scrollIntoView({
                        behavior: 'smooth',
                      })
                    }
                  }}
                />
              </div>

              <button
                type="button"
                className="search-button"
                onClick={() =>
                  document.getElementById('jobs')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                🔍 Search Jobs
              </button>
            </div>

            <div className="popular-searches">
              <strong>Popular Searches:</strong>

              {popularSearches.map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => searchPopularJob(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow"></div>

            <div className="career-illustration">
              <div className="illustration-orbit orbit-one">✦</div>
              <div className="illustration-orbit orbit-two">✧</div>

              <div className="illustration-circle">
                <div className="illustration-person">👩🏻‍💻</div>
                <div className="illustration-laptop">💻</div>
              </div>

              <div className="career-message">
                <span>✨</span>
                <div>
                  <strong>Your Future</strong>
                  <small>Starts with JobConnect</small>
                </div>
              </div>
            </div>

            {jobs.slice(0, 3).map((job, index) => (
              <Link
                to={`/jobs/${job.id}`}
                className={`floating-job-card floating-job-${index + 1}`}
                key={job.id}
              >
                <span className="floating-company-icon">
                  {getJobIcon(job)}
                </span>

                <div className="floating-job-info">
                  <strong>{job.title}</strong>
                  <small>{job.company}</small>
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                </div>

                <span className="floating-job-arrow">↗</span>
              </Link>
            ))}

            <div className="hero-feature feature-location">
              <span>📍</span> Multiple Locations
            </div>

            <div className="hero-feature feature-fresher">
              <span>⭐</span> Explore Opportunities
            </div>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>500+</strong>
            <span>Job Opportunities</span>
          </div>

          <div>
            <strong>100+</strong>
            <span>Companies</span>
          </div>

          <div>
            <strong>50+</strong>
            <span>Career Paths</span>
          </div>

          <div>
            <strong>1000+</strong>
            <span>Job Seekers</span>
          </div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE CAREERS</span>
              <h2>Browse by Category</h2>
              <p>Discover opportunities in your area of interest.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <button
                type="button"
                className={`category-card ${
                  selectedCategory === category.name ? 'active' : ''
                }`}
                key={category.name}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === category.name
                      ? ''
                      : category.name
                  )

                  document.getElementById('jobs')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
              >
                <span className="category-icon">{category.icon}</span>
                <strong>{category.name}</strong>
                <span className="category-count">{category.count}</span>
                <span className="category-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="jobs-section section" id="jobs">
          <div className="section-heading jobs-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Featured Jobs</h2>
              <p>Explore opportunities to take your career forward.</p>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={resetFilters}
            >
              View All Jobs →
            </button>
          </div>

          {(search || location || selectedCategory) && (
            <div className="filter-status">
              Showing {filteredJobs.length} matching jobs

              <button type="button" onClick={resetFilters}>
                Clear filters ✕
              </button>
            </div>
          )}

          <div className="job-grid">
            {currentJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-card-top">
                  <span className="company-icon">
                    {getJobIcon(job)}
                  </span>

                  <span className="job-type">{job.type}</span>
                </div>

                <h3>{job.title}</h3>
                <p className="company-name">{job.company}</p>

                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                </div>

                <div className="job-card-bottom">
                  <span className="job-category">{job.category}</span>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="apply-button"
                  >
                    View Job →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div
              className="pagination"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '32px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="outline-button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
              >
                ← Previous
              </button>

              {visiblePages.map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={
                    currentPage === page ? 'page' : undefined
                  }
                  style={{
                    minWidth: '42px',
                    height: '42px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #A78BFA',
                    background:
                      currentPage === page ? '#7C3AED' : 'transparent',
                    color:
                      currentPage === page ? '#FFFFFF' : 'inherit',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="outline-button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                Next →
              </button>
            </div>
          )}

          {filteredJobs.length === 0 && (
            <div className="no-jobs">
              <span>🔎</span>
              <h3>No matching jobs found</h3>
              <p>Try another job title or location.</p>

              <button
                type="button"
                className="search-button"
                onClick={resetFilters}
              >
                Show All Jobs
              </button>
            </div>
          )}

          <div className="jobs-footer">
            <button
              type="button"
              className="outline-button"
              onClick={resetFilters}
            >
              Explore All Opportunities
            </button>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-icon">🚀</div>

          <div className="cta-content">
            <h2>Ready for Your Next Opportunity?</h2>
            <p>
              Take the next step in your career journey. Your dream job
              could be just around the corner.
            </p>
          </div>

          <a href="#jobs" className="cta-button">
            Find Your Job →
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="logo footer-logo">
          <span className="logo-icon">J</span>
          <span>JobConnect</span>
        </a>

        <p>Connecting talent with opportunity.</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#jobs">Jobs</a>
        </div>

        <span className="copyright">
          © 2026 JobConnect. All rights reserved.
        </span>
      </footer>
    </div>
  )
}

// Application Success Page
function ApplicationSuccess() {
  const location = useLocation()
  const emailSent = location.state?.emailSent === true

  return (
    <div
      className="auth-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="auth-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          padding: '40px 28px',
        }}
      >
        <div
          style={{
            width: '82px',
            height: '82px',
            borderRadius: '50%',
            background: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '46px',
            margin: '0 auto 24px',
          }}
        >
          ✓
        </div>

        <h1>Application Submitted Successfully!</h1>

        <p style={{ margin: '16px 0 24px', lineHeight: 1.7 }}>
          Thank you for applying! Your application has been
          submitted successfully to JobConnect.
          <br />
          <br />
          {emailSent
            ? 'Confirmation email sent successfully to your email address. Please check your inbox and spam folder.'
            : 'Your application is saved, but we could not send the confirmation email. Please check your email settings or try again later.'}
          <br />
          <br />
          You can check your application status anytime from
          JobConnect.
        </p>

        <Link
          to="/"
          className="nav-button"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            padding: '14px 24px',
            borderRadius: '10px',
          }}
        >
          ← Back to Home
        </Link>

        <p style={{ marginTop: '20px' }}>
          <Link to="/application-status">
            Check Application Status
          </Link>
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<Apply />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboard />}
        />

        <Route
          path="/application-status"
          element={<ApplicationStatus />}
        />

        <Route
          path="/application-success"
          element={<ApplicationSuccess />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App