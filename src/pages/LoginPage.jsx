import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const css = `
.login-pg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;padding:1rem}
.login-box{width:100%;max-width:380px;background:#0C0B08;border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:2.5rem 2rem}
.login-title{font-family:'Amiri',serif;font-size:1.5rem;font-weight:700;color:#E8E4DB;text-align:center;margin-bottom:.3rem}
.login-sub{font-size:.75rem;color:#6A665C;text-align:center;margin-bottom:2rem}
.login-label{display:block;font-size:.72rem;color:#9E998E;margin-bottom:.3rem;font-weight:600}
.login-input{width:100%;padding:.6rem .8rem;background:#080806;border:1px solid rgba(255,255,255,.06);border-radius:8px;color:#E8E4DB;font-size:.82rem;font-family:'IBM Plex Sans Arabic',sans-serif;outline:none;transition:border-color .2s;margin-bottom:1rem}
.login-input:focus{border-color:#C9A96E}
.login-btn{width:100%;padding:.65rem;background:#C9A96E;color:#000;border:none;border-radius:8px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;transition:background .2s}
.login-btn:hover{background:#B8944F}
.login-btn:disabled{opacity:.5;cursor:not-allowed}
.login-err{background:rgba(200,50,50,.1);border:1px solid rgba(200,50,50,.2);color:#e87c7c;padding:.5rem .8rem;border-radius:8px;font-size:.72rem;margin-bottom:1rem;text-align:center}
`

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err) {
      setError('البريد أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-pg">
        <form className="login-box" onSubmit={handleSubmit}>
          <div className="login-title">لوحة التحكم</div>
          <div className="login-sub">موقع آل معضد</div>
          {error && <div className="login-err">{error}</div>}
          <label className="login-label">البريد الإلكتروني</label>
          <input className="login-input" type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="login-label">كلمة المرور</label>
          <input className="login-input" type="password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="login-btn" type="submit" disabled={loading}>{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</button>
        </form>
      </div>
    </>
  )
}
