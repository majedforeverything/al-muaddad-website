import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const css = `
.dash{display:flex;min-height:100vh;background:#000;font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl}
.dash-side{width:220px;background:#0C0B08;border-left:1px solid rgba(255,255,255,.06);padding:1.5rem 1rem;display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;z-index:100}
.dash-logo{font-family:'Amiri',serif;font-size:1.1rem;font-weight:700;color:#C9A96E;margin-bottom:.3rem}
.dash-logo-sub{font-size:.6rem;color:#6A665C;margin-bottom:2rem}
.dash-nav{display:flex;flex-direction:column;gap:.3rem;flex:1}
.dash-link{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;border-radius:8px;color:#9E998E;font-size:.78rem;text-decoration:none;transition:all .2s;border:none;background:none;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;width:100%;text-align:right}
.dash-link:hover{background:rgba(255,255,255,.03);color:#E8E4DB}
.dash-link.active{background:rgba(201,169,110,.08);color:#C9A96E}
.dash-link-icon{font-size:1rem;width:20px;text-align:center}
.dash-out{margin-top:auto;padding-top:1rem;border-top:1px solid rgba(255,255,255,.04)}
.dash-content{flex:1;margin-right:220px;padding:2rem clamp(1.5rem,3vw,3rem)}
.dash-header{font-family:'Amiri',serif;font-size:1.3rem;font-weight:700;color:#E8E4DB;margin-bottom:1.5rem}
@media(max-width:768px){
  .dash-side{width:60px;padding:1rem .5rem}
  .dash-side .dash-logo,.dash-side .dash-logo-sub,.dash-side .dash-link span:not(.dash-link-icon){display:none}
  .dash-link{justify-content:center;padding:.55rem}
  .dash-content{margin-right:60px;padding:1.5rem 1rem}
}
`

export default function DashboardLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <style>{css}</style>
      <div className="dash">
        <aside className="dash-side">
          <div className="dash-logo">لوحة التحكم</div>
          <div className="dash-logo-sub">موقع آل معضد</div>
          <nav className="dash-nav">
            <NavLink to="/admin" end className={({isActive}) => `dash-link${isActive?' active':''}`}>
              <span className="dash-link-icon">📰</span><span>الأخبار</span>
            </NavLink>
            <NavLink to="/admin/gallery" className={({isActive}) => `dash-link${isActive?' active':''}`}>
              <span className="dash-link-icon">🖼</span><span>المعرض</span>
            </NavLink>
            <NavLink to="/admin/inbox" className={({isActive}) => `dash-link${isActive?' active':''}`}>
              <span className="dash-link-icon">📩</span><span>الاقتراحات</span>
            </NavLink>
          </nav>
          <div className="dash-out">
            <button className="dash-link" onClick={handleSignOut}>
              <span className="dash-link-icon">🚪</span><span>خروج</span>
            </button>
            <button className="dash-link" onClick={() => navigate('/')} style={{marginTop:'.3rem'}}>
              <span className="dash-link-icon">🌐</span><span>الموقع</span>
            </button>
          </div>
        </aside>
        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </>
  )
}
