
import { useEffect, useState } from 'react'
import './RecruiterDashboard.css'

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchApplications = () => {
    setLoading(true)
    setError('')

    fetch('http://localhost:8080/api/applications')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        return response.json()
      })
      .then((data) => {
        setApplications(data)
      })
      .catch((err) => {
        console.error(err)
        setError('Applications load avvaledu. Backend check cheyyandi.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)

    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/${id}/status?status=${status}`,
        { method: 'PUT' }
      )

      if (!response.ok) {
        throw new Error('Status update failed')
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === id
            ? { ...application, status }
            : application
        )
      )
    } catch (err) {
      console.error(err)
      alert('Status update avvaledu. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const downloadResume = (id) => {
    window.open(
      `http://localhost:8080/api/applications/${id}/resume`,
      '_blank'
    )
  }

  const getStatus = (application) =>
    application.status || 'Pending'

  const pendingCount = applications.filter(
    (application) => getStatus(application) === 'Pending'
  ).length

  const shortlistedCount = applications.filter(
    (application) => getStatus(application) === 'Shortlisted'
  ).length

  const rejectedCount = applications.filter(
    (application) => getStatus(application) === 'Rejected'
  ).length

  const filteredApplications = applications.filter((application) => {
    const searchText = search.toLowerCase()

    const matchesSearch = [
      application.applicantName,
      application.applicantEmail,
      application.phoneNumber,
      String(application.jobId ?? ''),
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(searchText)
    )

    const matchesStatus =
      statusFilter === 'All' ||
      getStatus(application) === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="recruiter-dashboard">
      <header className="recruiter-header">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p>Manage applicants and track recruitment progress.</p>
        </div>

        <button
          className="recruiter-refresh"
          onClick={fetchApplications}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh Applications'}
        </button>
      </header>

      <section className="recruiter-stats">
        <div className="recruiter-stat">
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>

        <div className="recruiter-stat pending">
          <span>Pending Review</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="recruiter-stat shortlisted">
          <span>Shortlisted</span>
          <strong>{shortlistedCount}</strong>
        </div>

        <div className="recruiter-stat rejected">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </section>

      <section className="recruiter-panel">
        <div className="recruiter-panel-header">
          <h2>Applicant Management</h2>
          <p>Review applications, download resumes and update status.</p>
        </div>

        {loading && (
          <div className="recruiter-message">
            Loading applications...
          </div>
        )}

        {error && (
          <div className="recruiter-message recruiter-error">
            {error}
            <button
              className="recruiter-refresh"
              onClick={fetchApplications}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="recruiter-toolbar">
              <input
                type="text"
                placeholder="Search name, email, phone or job ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search applicants"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by application status"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="recruiter-message">
                {applications.length === 0
                  ? 'No applications received yet.'
                  : 'No applicants match your search or selected filter.'}
              </div>
            ) : (
              <div className="recruiter-table-wrapper">
                <table className="recruiter-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Contact Details</th>
                      <th>Job ID</th>
                      <th>Resume</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => {
                      const status = getStatus(application)

                      return (
                        <tr key={application.id}>
                          <td>
                            <div className="recruiter-applicant-name">
                              {application.applicantName || 'Not provided'}
                            </div>
                            <small>
                              Application #{application.id}
                            </small>
                          </td>

                          <td>
                            <div>
                              {application.applicantEmail || 'No email'}
                            </div>
                            <small>
                              {application.phoneNumber || 'No phone'}
                            </small>
                          </td>

                          <td>#{application.jobId}</td>

                          <td>
                            <button
                              className="recruiter-resume"
                              onClick={() => downloadResume(application.id)}
                            >
                              ↓ Download PDF
                            </button>
                          </td>

                          <td>
                            <span
                              className={`recruiter-status ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="recruiter-actions">
                              <button
                                className="recruiter-shortlist"
                                disabled={
                                  updatingId === application.id ||
                                  status === 'Shortlisted'
                                }
                                onClick={() =>
                                  updateStatus(application.id, 'Shortlisted')
                                }
                              >
                                {updatingId === application.id
                                  ? 'Updating...'
                                  : 'Shortlist'}
                              </button>

                              <button
                                className="recruiter-reject"
                                disabled={
                                  updatingId === application.id ||
                                  status === 'Rejected'
                                }
                                onClick={() =>
                                  updateStatus(application.id, 'Rejected')
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="recruiter-table-footer">
              Showing {filteredApplications.length} of{' '}
              {applications.length} applications
            </div>
          </>
        )}
      </section>
    </div>
  )
}
