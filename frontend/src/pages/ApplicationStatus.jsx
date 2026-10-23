
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

export default function ApplicationStatus() {
  const [applicationId, setApplicationId] = useState('')
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkStatus = async (e) => {
    e.preventDefault()

    const id = applicationId.trim()

    if (!id || !/^\d+$/.test(id) || Number(id) < 1) {
      setError('Please enter a valid Application ID.')
      setApplication(null)
      return
    }

    setLoading(true)
    setError('')
    setApplication(null)

    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/${id}/status`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'Application not found. Please check your Application ID.'
          )
        }

        throw new Error('Unable to check status. Please try again.')
      }

      const data = await response.json()
      setApplication(data)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  const status = application?.status || 'Pending'
  const normalizedStatus = status.toLowerCase()

  const statusClass =
    normalizedStatus === 'shortlisted'
      ? 'status-shortlisted'
      : normalizedStatus === 'rejected'
        ? 'status-rejected'
        : 'status-pending'

  const statusIcon =
    normalizedStatus === 'shortlisted'
      ? '✓'
      : normalizedStatus === 'rejected'
        ? '✕'
        : '◷'

  return (
    <div className="application-status-page">
      <header className="status-navbar">
        <Link to="/" className="status-logo">
          <span className="status-logo-icon">J</span>
          <span>JobConnect</span>
        </Link>

        <Link to="/" className="status-home-link">
          ← Back to Home
        </Link>
      </header>

      <main className="status-main">
        <div className="status-heading">
          <span className="status-eyebrow">
            YOUR CAREER JOURNEY
          </span>

          <h1>
            Track Your <span>Application</span>
          </h1>

          <p>
            Stay updated on your job application. Enter your
            Application ID to see the latest status.
          </p>
        </div>

        <section className="status-card">
          <div className="status-card-icon">📋</div>

          <h2>Check Application Status</h2>

          <p className="status-card-description">
            Enter the Application ID you received after submitting
            your application.
          </p>

          <form onSubmit={checkStatus}>
            <div className="status-form-group">
              <label htmlFor="applicationId">
                Application ID
              </label>

              <input
                id="applicationId"
                type="text"
                inputMode="numeric"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g. 1"
                required
              />
            </div>

            <button
              type="submit"
              className="status-submit-button"
              disabled={loading}
            >
              {loading ? (
                'Checking Status...'
              ) : (
                <>
                  Check Status <span>→</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="status-error" role="alert">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {application && (
            <div className="status-result">
              <div className="status-result-heading">
                <div>
                  <span className="status-result-label">
                    APPLICATION DETAILS
                  </span>
                  <h3>Application #{application.applicationId}</h3>
                </div>

                <span className={`status-badge ${statusClass}`}>
                  {statusIcon} {status}
                </span>
              </div>

              <div className="status-detail-row">
                <span>Applicant Name</span>
                <strong>
                  {application.applicantName || 'Not available'}
                </strong>
              </div>

              <div className="status-detail-row">
                <span>Application ID</span>
                <strong>{application.applicationId}</strong>
              </div>

              <div className="status-detail-row">
                <span>Job ID</span>
                <strong>{application.jobId}</strong>
              </div>

              <div className={`status-message ${statusClass}`}>
                {normalizedStatus === 'shortlisted' ? (
                  <>
                    <strong>Great news!</strong>
                    <p>
                      Your application has been shortlisted.
                    </p>
                  </>
                ) : normalizedStatus === 'rejected' ? (
                  <>
                    <strong>Application update</strong>
                    <p>
                      Your application was not selected for this position.
                    </p>
                  </>
                ) : (
                  <>
                    <strong>Application in progress</strong>
                    <p>
                      Your application status is {status}. Please check
                      again later for updates.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="status-help">
            <span>💡</span>
            <p>
              Make sure you enter the Application ID shown when your
              application was submitted.
            </p>
          </div>
        </section>

        <div className="status-footer-note">
          <span>🔒</span>
          Your application information is retrieved from JobConnect.
        </div>
      </main>
    </div>
  )
}
