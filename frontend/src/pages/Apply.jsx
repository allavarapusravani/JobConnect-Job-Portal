
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Apply() {
  const { id } = useParams()
  const navigate = useNavigate()

  const user = JSON.parse(
    localStorage.getItem('jobconnectUser') || 'null'
  )

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [resume, setResume] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!resume) {
      setMessage('Please upload your resume in PDF format.')
      return
    }

    if (
      resume.type !== 'application/pdf' &&
      !resume.name.toLowerCase().endsWith('.pdf')
    ) {
      setMessage('Only PDF resumes are allowed.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()

      formData.append('jobId', id)
      formData.append('applicantName', name)
      formData.append('applicantEmail', email)
      formData.append('phoneNumber', phone)
      formData.append('address', address)
      formData.append('resume', resume)

      const response = await fetch(
        'http://localhost:8080/api/applications',
        {
          method: 'POST',
          body: formData
        }
      )

      const responseBody = await response.text()

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            responseBody || 'Application submission failed.'
          }`
        )
      }

      // Navigate only after the backend successfully saves the application.
      navigate('/application-success', {
  replace: true,
  state: {
    emailSent: responseBody
      ? JSON.parse(responseBody).emailSent
      : false
  }
})
    } catch (error) {
      console.error('Application submission error:', error)

      setMessage(
        error.message ||
          'Application could not be submitted. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h1>Apply for Job</h1>
        <p>Complete your details to submit your application.</p>

        <label>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          pattern="[0-9+() -]{10,15}"
          required
        />

        <label>Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          rows={3}
          required
        />

        <label>Upload Resume (PDF only)</label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) =>
            setResume(e.target.files[0] || null)
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        {message && (
          <p role="alert" aria-live="polite">
            {message}
          </p>
        )}

        <p className="auth-switch">
          <Link to={`/jobs/${id}`}>
            Back to Job Details
          </Link>
        </p>
      </form>
    </div>
  )
}
