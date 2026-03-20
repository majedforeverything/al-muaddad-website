import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const css = `
.inbox-page{direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif;color:#E8E4DB}
.inbox-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.8rem}
.inbox-title{font-family:'Amiri',serif;font-size:1.3rem;font-weight:700;color:#E8E4DB}
.inbox-count{font-size:.75rem;color:#6A665C;font-weight:400}
.inbox-count strong{color:#C9A96E}
.inbox-list{display:flex;flex-direction:column;gap:.5rem}
.inbox-item{background:#0C0B08;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden;transition:border .2s}
.inbox-item:hover{border-color:rgba(255,255,255,.08)}
.inbox-item.unread{border-right:3px solid #C9A96E}
.inbox-item-header{display:flex;align-items:center;gap:1rem;padding:.8rem 1rem;cursor:pointer;transition:background .2s}
.inbox-item-header:hover{background:rgba(255,255,255,.02)}
.inbox-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.inbox-dot.unread{background:#C9A96E}
.inbox-dot.read{background:#6A665C;opacity:.4}
.inbox-item-info{flex:1;min-width:0}
.inbox-item-name{font-size:.85rem;font-weight:600;color:#E8E4DB;margin-bottom:.15rem;display:flex;align-items:center;gap:.5rem}
.inbox-item.unread .inbox-item-name{color:#C9A96E}
.inbox-item-preview{font-size:.75rem;color:#6A665C;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px}
.inbox-item-meta{display:flex;flex-direction:column;align-items:flex-end;gap:.2rem;flex-shrink:0}
.inbox-item-date{font-size:.68rem;color:#6A665C;white-space:nowrap}
.inbox-item-phone{font-size:.7rem;color:#9E998E;direction:ltr}
.inbox-expand{padding:0 1rem .8rem 1rem;border-top:1px solid rgba(255,255,255,.03);animation:inboxSlide .2s ease}
@keyframes inboxSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.inbox-expand-body{padding:.8rem 0;border-bottom:1px solid rgba(255,255,255,.03)}
.inbox-expand-label{font-size:.68rem;color:#6A665C;margin-bottom:.3rem;font-weight:600}
.inbox-expand-msg{font-size:.82rem;color:#E8E4DB;line-height:1.8;white-space:pre-wrap}
.inbox-expand-row{display:flex;gap:1.5rem;padding:.6rem 0;flex-wrap:wrap;align-items:center}
.inbox-expand-detail{font-size:.78rem;color:#9E998E}
.inbox-expand-detail strong{color:#E8E4DB;font-weight:600}
.inbox-expand-actions{display:flex;gap:.4rem;padding-top:.6rem;justify-content:flex-end;align-items:center}
.inbox-btn{padding:.5rem 1.2rem;border-radius:8px;border:none;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.8rem;font-weight:600;transition:all .2s}
.inbox-btn-danger{background:rgba(220,60,60,.15);color:#e05555;border:1px solid rgba(220,60,60,.2)}
.inbox-btn-danger:hover{background:rgba(220,60,60,.25)}
.inbox-btn-ghost{background:rgba(255,255,255,.04);color:#9E998E;border:1px solid rgba(255,255,255,.06)}
.inbox-btn-ghost:hover{background:rgba(255,255,255,.08);color:#E8E4DB}
.inbox-btn-sm{padding:.35rem .8rem;font-size:.72rem}
.inbox-loading{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.inbox-empty{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.inbox-error{text-align:center;padding:1rem;color:#e05555;font-size:.8rem;background:rgba(220,60,60,.08);border-radius:8px;margin-bottom:1rem}
.inbox-confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center}
.inbox-confirm{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.5rem;max-width:360px;width:90%;text-align:center;direction:rtl}
.inbox-confirm p{color:#E8E4DB;font-size:.85rem;margin-bottom:1.2rem}
.inbox-confirm-actions{display:flex;gap:.5rem;justify-content:center}
.inbox-status-badge{display:inline-block;padding:.12rem .5rem;border-radius:20px;font-size:.65rem;font-weight:600;white-space:nowrap}
.inbox-status-new{background:rgba(201,169,110,.12);color:#C9A96E}
.inbox-status-accepted{background:rgba(80,180,80,.12);color:#5cb85c}
.inbox-status-rejected{background:rgba(220,60,60,.12);color:#e05555}
.inbox-status-select{padding:.3rem .5rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#E8E4DB;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.72rem;outline:none;cursor:pointer;direction:rtl}
.inbox-status-select:focus{border-color:rgba(201,169,110,.3)}
`

const STATUS_MAP = {
  'جديد': { label: 'جديد', className: 'inbox-status-new' },
  'مقبول': { label: 'مقبول', className: 'inbox-status-accepted' },
  'مرفوض': { label: 'مرفوض', className: 'inbox-status-rejected' },
}

export default function DashInboxPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('حدث خطأ في تحميل الرسائل')
      console.error(err)
    } else {
      setSubmissions(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const toggleExpand = async (item) => {
    if (expandedId === item.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(item.id)
    // Mark as read
    if (!item.is_read) {
      try {
        const { error: err } = await supabase
          .from('submissions')
          .update({ is_read: true })
          .eq('id', item.id)
        if (err) throw err
        setSubmissions(prev => prev.map(s => s.id === item.id ? { ...s, is_read: true } : s))
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
  }

  const handleStatusChange = async (item, newStatus) => {
    try {
      const { error: err } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', item.id)
      if (err) throw err
      setSubmissions(prev => prev.map(s => s.id === item.id ? { ...s, status: newStatus } : s))
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث الحالة')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      const { error: err } = await supabase.from('submissions').delete().eq('id', confirmDelete.id)
      if (err) throw err
      setConfirmDelete(null)
      if (expandedId === confirmDelete.id) setExpandedId(null)
      setSubmissions(prev => prev.filter(s => s.id !== confirmDelete.id))
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحذف')
      console.error(err)
      setConfirmDelete(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return '\u2014'
    try {
      const date = new Date(d)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      if (minutes < 1) return 'الآن'
      if (minutes < 60) return `منذ ${minutes} دقيقة`
      if (hours < 24) return `منذ ${hours} ساعة`
      if (days < 7) return `منذ ${days} يوم`
      return date.toLocaleDateString('ar-SA')
    } catch {
      return d
    }
  }

  const getStatusInfo = (status) => {
    return STATUS_MAP[status] || STATUS_MAP['جديد']
  }

  const unreadCount = submissions.filter(s => !s.is_read).length

  return (
    <>
      <style>{css}</style>
      <div className="inbox-page">
        {error && <div className="inbox-error">{error}</div>}

        <div className="inbox-top">
          <div>
            <div className="inbox-title">صندوق الاقتراحات</div>
            <div className="inbox-count">
              <strong>{unreadCount}</strong> رسالة غير مقروءة من أصل {submissions.length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="inbox-loading">جارٍ التحميل...</div>
        ) : submissions.length === 0 ? (
          <div className="inbox-empty">لا توجد رسائل حالياً</div>
        ) : (
          <div className="inbox-list">
            {submissions.map(item => {
              const statusInfo = getStatusInfo(item.status)
              return (
                <div key={item.id} className={`inbox-item${!item.is_read ? ' unread' : ''}`}>
                  <div className="inbox-item-header" onClick={() => toggleExpand(item)}>
                    <span className={`inbox-dot ${item.is_read ? 'read' : 'unread'}`} />
                    <div className="inbox-item-info">
                      <div className="inbox-item-name">
                        {item.name || 'بدون اسم'}
                        <span className={`inbox-status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
                      </div>
                      <div className="inbox-item-preview">{item.message || ''}</div>
                    </div>
                    <div className="inbox-item-meta">
                      <div className="inbox-item-date">{formatDate(item.created_at)}</div>
                      {item.phone && <div className="inbox-item-phone">{item.phone}</div>}
                    </div>
                  </div>

                  {expandedId === item.id && (
                    <div className="inbox-expand">
                      <div className="inbox-expand-row">
                        <div className="inbox-expand-detail"><strong>الاسم:</strong> {item.name || '\u2014'}</div>
                        <div className="inbox-expand-detail"><strong>الهاتف:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>{item.phone || '\u2014'}</span></div>
                        <div className="inbox-expand-detail"><strong>التاريخ:</strong> {item.created_at ? new Date(item.created_at).toLocaleString('ar-SA') : '\u2014'}</div>
                      </div>
                      <div className="inbox-expand-body">
                        <div className="inbox-expand-label">الرسالة</div>
                        <div className="inbox-expand-msg">{item.message || 'لا توجد رسالة'}</div>
                      </div>
                      <div className="inbox-expand-actions">
                        <div className="inbox-expand-detail" style={{ marginLeft: 'auto' }}>
                          <strong>الحالة:</strong>
                          <select
                            className="inbox-status-select"
                            value={item.status || 'جديد'}
                            onChange={(e) => { e.stopPropagation(); handleStatusChange(item, e.target.value) }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '.4rem' }}
                          >
                            <option value="جديد">جديد</option>
                            <option value="مقبول">مقبول</option>
                            <option value="مرفوض">مرفوض</option>
                          </select>
                        </div>
                        <button className="inbox-btn inbox-btn-danger inbox-btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmDelete(item) }}>حذف</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="inbox-confirm-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
            <div className="inbox-confirm">
              <p>هل أنت متأكد من حذف رسالة "{confirmDelete.name}"؟</p>
              <div className="inbox-confirm-actions">
                <button className="inbox-btn inbox-btn-danger inbox-btn-sm" onClick={handleDelete}>نعم، احذف</button>
                <button className="inbox-btn inbox-btn-ghost inbox-btn-sm" onClick={() => setConfirmDelete(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
