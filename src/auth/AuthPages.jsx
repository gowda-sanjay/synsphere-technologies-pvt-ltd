import { useEffect, useState } from 'react'
import { ArrowUpRight, LogOut, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function AuthForm({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { full_name: name.trim() } },
        })
        if (signupError) throw signupError
        if (data.session) navigate('/dashboard', { replace: true })
        else setNotice('Account created. Check your email to confirm your address, then sign in.')
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        if (signinError) throw signinError
        navigate('/dashboard', { replace: true })
      }
    } catch (authError) {
      console.error(`Synsphere ${isSignup ? 'sign-up' : 'sign-in'} failed:`, authError)
      setError(authError.message || 'Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isSupabaseConfigured) {
    return <main className="admin-login"><section className="login-panel">
      <span className="eyebrow">Account access unavailable</span>
      <h1>Connect Supabase</h1>
      <p>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local or hosting environment to enable account access.</p>
      <Link className="button primary" to="/">Return to website <ArrowUpRight size={16} /></Link>
    </section></main>
  }

  return <main className="admin-login"><form className="login-panel" onSubmit={submit}>
    <span className="eyebrow">{isSignup ? 'Create your account' : 'Welcome back'}</span>
    <h1>{isSignup ? 'Sign up' : 'Log in'}</h1>
    <p>{isSignup ? 'Create an account to access your SynSphere user dashboard.' : 'Sign in to view your SynSphere account.'}</p>
    {error && <div className="form-error" role="alert">{error}</div>}
    {notice && <div className="success" role="status">{notice}</div>}
    {isSignup && <label className="auth-field">Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>}
    <label className="auth-field">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label className="auth-field">Password<input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    <button className="button primary" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'} <ArrowUpRight size={16} /></button>
    <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to SynSphere?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link></p>
  </form></main>
}

function UserDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) throw sessionError
      if (!active) return
      setSession(data.session)
      setLoading(false)
      if (!data.session) navigate('/login', { replace: true })
    }).catch((sessionError) => {
      console.error('Synsphere user session restore failed:', sessionError)
      if (!active) return
      setError(sessionError.message || 'Unable to load your account. Please sign in again.')
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (!nextSession) navigate('/login', { replace: true })
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  async function signOut() {
    setError('')
    try {
      const { error: signoutError } = await supabase.auth.signOut()
      if (signoutError) throw signoutError
    } catch (signoutError) {
      console.error('Synsphere user sign-out failed:', signoutError)
      setError(signoutError.message || 'Unable to sign out. Please try again.')
    }
  }

  if (!isSupabaseConfigured) {
    return <main className="admin-login"><section className="login-panel">
      <span className="eyebrow">Account access unavailable</span>
      <h1>Connect Supabase</h1>
      <p>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use the account dashboard.</p>
      <Link className="button primary" to="/">Return to website <ArrowUpRight size={16} /></Link>
    </section></main>
  }
  if (loading) return <main className="admin-login"><section className="login-panel"><span className="eyebrow">User dashboard</span><h1>Checking your account...</h1></section></main>
  if (!session) return <main className="admin-login"><section className="login-panel">{error && <div className="form-error" role="alert">{error}</div>}<p>Sign in is required to view your dashboard.</p><Link className="button primary" to="/login">Log in <ArrowUpRight size={16} /></Link></section></main>

  const fullName = session.user.user_metadata?.full_name
  return <main className="dashboard">
    <div className="dashboard-top"><div><span className="eyebrow">SynSphere account</span><h1>Your dashboard</h1></div><button className="button ghost" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <section className="user-account-card">
      <div className="user-account-icon"><UserRound size={22} aria-hidden="true" /></div>
      <div><span className="eyebrow">Account details</span><h2>{fullName || 'SynSphere user'}</h2><p>{session.user.email}</p></div>
    </section>
  </main>
}

export function LoginPage() { return <AuthForm mode="login" /> }
export function SignupPage() { return <AuthForm mode="signup" /> }
export { UserDashboard }
