
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState('')
  const [photoError, setPhotoError] = useState('')

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]

    setPhotoError('')
    setPhoto('')

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.')
      e.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Photo size must be less than 2 MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setPhoto(reader.result)
    }

    reader.onerror = () => {
      setPhotoError('Could not read the selected photo.')
    }

    reader.readAsDataURL(file)
  }

  function handleRegister(e) {
    e.preventDefault()

    const form = e.currentTarget
    const name = form.fullName.value.trim()
    const email = form.email.value.trim().toLowerCase()
    const role = form.role.value
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

    if (password.length < 6) {
      alert('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    try {
      const users = JSON.parse(
        localStorage.getItem('jobconnectUsers') || '[]'
      )

      if (users.some((user) => user.email === email)) {
        alert('This email is already registered. Please login.')
        return
      }

      users.push({
        name,
        email,
        role,
        photo,
      })

      localStorage.setItem('jobconnectUsers', JSON.stringify(users))

      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      alert('Unable to save your account. Please try a smaller photo.')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Create Account</h1>
        <p>Join JobConnect and find your next opportunity</p>

        <label>Profile Photo</label>
        <input
          type="file"
          name="profilePhoto"
          accept="image/*"
          onChange={handlePhotoChange}
        />

        {photo && (
          <img
            src={photo}
            alt="Profile preview"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '10px auto',
              display: 'block',
            }}
          />
        )}

        {photoError && (
          <p role="alert" style={{ color: 'red' }}>
            {photoError}
          </p>
        )}

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />

        <label>I am a</label>
        <select name="role" defaultValue="jobseeker">
          <option value="jobseeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          minLength={6}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          minLength={6}
          required
        />

        <button type="submit">Create Account</button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </form>
    </div>
  )
}
