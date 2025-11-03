import { useState } from 'react'
import { Login } from './Login'
import { Signup } from './Signup'

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="auth-container">
      {isLogin ? <Login /> : <Signup />}
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        {isLogin ? (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => setIsLogin(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setIsLogin(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Login
            </button>
          </>
        )}
      </p>
    </div>
  )
}