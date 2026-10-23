
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault()

    const email = e.target.email.value.trim().toLowerCase()
    const password = e.target.password.value

    if (!email || !password) {
      alert('Please fill in all fields.')
      return
    }

    let users = []

    try {
      users = JSON.parse(localStorage.getItem('jobconnectUsers') || '[]')
    } catch {
      alert('Unable to read registered accounts. Please register again.')
      return
    }

    const registeredUser = users.find((user) => user.email === email)

    if (registeredUser) {
      // This demo checks the registered email only.
      // Real password verification requires backend authentication.
      localStorage.setItem(
        'jobconnectUser',
        JSON.stringify({
          name: registeredUser.name,
          email: registeredUser.email,
          role: registeredUser.role,
          photo: registeredUser.photo || '',
        })
      )
    } else {
      // Preserve the existing demo login behavior for existing users.
      localStorage.setItem(
        'jobconnectUser',
        JSON.stringify({
          name: email.split('@')[0],
          email,
          photo: '',
        })
      )
    }

    const returnTo = sessionStorage.getItem('jobconnectReturnTo')

    if (returnTo) {
      sessionStorage.removeItem('jobconnectReturnTo')
      navigate(returnTo)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>Welcome Back!</h1>
        <p>Login to your JobConnect account</p>

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit">Login</button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
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
