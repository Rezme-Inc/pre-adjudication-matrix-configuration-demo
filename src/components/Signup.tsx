import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [companyMatrixId, setCompanyMatrixId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        role,
        company_matrix_id: companyMatrixId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="companyMatrixId">Company Matrix ID</label>
          <input
            id="companyMatrixId"
            type="text"
            value={companyMatrixId}
            onChange={(e) => setCompanyMatrixId(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}