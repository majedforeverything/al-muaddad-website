import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const css = `
.news-page{direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif;color:#E8E4DB}
.news-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.8rem}
.news-title{font-family:'Amiri',serif;font-size:1.3rem;font-weight:700;color:#E8E4DB}
.news-btn{padding:.5rem 1.2rem;border-radius:8px;border:none;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.8rem;font-weight:600;transition:all .2s}
.news-btn-primary{background:#C9A96E;color:#000}
.news-btn-primary:hover{background:#b8943d}
.news-btn-danger{background:rgba(220,60,60,.15);color:#e05555;border:1px solid rgba(220,60,60,.2)}
.news-btn-danger:hover{background:rgba(220,60,60,.25)}
.news-btn-ghost{background:rgba(255,255,255,.04);color:#9E998E;border:1px solid rgba(255,255,255,.06)}
.news-btn-ghost:hover{background:rgba(255,255,255,.08);color:#E8E4DB}
.news-btn-sm{padding:.35rem .8rem;font-size:.72rem}
.news-table-wrap{overflow-x:auto;border:1px solid rgba(255,255,255,.04);border-radius:10px;background:#0C0B08}
.news-table{width:100%;border-collapse:collapse;font-size:.8rem}
.news-table th{text-align:right;padding:.7rem 1rem;color:#6A665C;font-weight:600;font-size:.7rem;border-bottom:1px solid rgba(255,255,255,.04);white-space:nowrap}
.news-table td{padding:.65rem 1rem;border-bottom:1px solid rgba(255,255,255,.03);color:#9E998E;vertical-align:middle}
.news-table tr:last-child td{border-bottom:none}
.news-table tr:hover td{background:rgba(255,255,255,.02)}
.news-table-title{color:#E8E4DB;font-weight:600;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.news-badge{display:inline-block;padding:.15rem .55rem;border-radius:20px;font-size:.65rem;font-weight:600}
.news-badge-on{background:rgba(201,169,110,.12);color:#C9A96E}
.news-badge-off{background:rgba(255,255,255,.04);color:#6A665C}
.news-actions{display:flex;gap:.4rem}
.news-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
.news-modal{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:2rem;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;direction:rtl}
.news-modal-title{font-family:'Amiri',serif;font-size:1.1rem;font-weight:700;color:#E8E4DB;margin-bottom:1.5rem}
.news-field{margin-bottom:1rem}
.news-label{display:block;font-size:.72rem;color:#6A665C;margin-bottom:.35rem;font-weight:600}
.news-input,.news-textarea,.news-select{width:100%;padding:.55rem .8rem;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#E8E4DB;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.8rem;outline:none;transition:border .2s;box-sizing:border-box}
.news-input:focus,.news-textarea:focus{border-color:rgba(201,169,110,.3)}
.news-textarea{min-height:120px;resize:vertical;line-height:1.7}
.news-checkbox-row{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}
.news-checkbox-row input[type=checkbox]{accent-color:#C9A96E;width:16px;height:16px}
.news-checkbox-label{font-size:.78rem;color:#9E998E}
.news-row{display:flex;gap:1rem}
.news-row .news-field{flex:1}
.news-modal-actions{display:flex;gap:.6rem;margin-top:1.5rem;justify-content:flex-start}
.news-file-zone{border:2px dashed rgba(255,255,255,.06);border-radius:10px;padding:1.2rem;text-align:center;cursor:pointer;transition:border .2s;position:relative}
.news-file-zone:hover{border-color:rgba(201,169,110,.2)}
.news-file-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.news-file-hint{font-size:.7rem;color:#6A665C;margin-top:.3rem}
.news-file-preview{width:80px;height:50px;object-fit:cover;border-radius:6px;margin-top:.5rem}
.news-loading{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.news-empty{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.news-error{text-align:center;padding:1rem;color:#e05555;font-size:.8rem;background:rgba(220,60,60,.08);border-radius:8px;margin-bottom:1rem}
.news-confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center}
.news-confirm{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.5rem;max-width:360px;width:90%;text-align:center;direction:rtl}
.news-confirm p{color:#E8E4DB;font-size:.85rem;margin-bottom:1.2rem}
.news-confirm-actions{display:flex;gap:.5rem;justify-content:center}
`

const emptyForm = {
  title: '',
  description: '',
  date: '',
  body: '',
  cover_image_url: '',
  show_on_homepage: false,
  homepage_order: 0,
}

export default function DashNewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('حدث خطأ في تحميل الأخبار')
      console.error(err)
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setImageFile(null)
    setPreviewUrl(null)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      body: item.body || '',
      cover_image_url: item.cover_image_url || '',
      show_on_homepage: item.show_on_homepage || false,
      homepage_order: item.homepage_order || 0,
    })
    setImageFile(null)
    setPreviewUrl(item.cover_image_url || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setImageFile(null)
    setPreviewUrl(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('news-covers')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (upErr) throw upErr
    const { data: urlData } = supabase.storage.from('news-covers').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('يرجى إدخال عنوان الخبر'); return }
    setSaving(true)
    setError(null)
    try {
      let coverUrl = form.cover_image_url
      if (imageFile) {
        setUploading(true)
        coverUrl = await uploadImage(imageFile)
        setUploading(false)
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date || null,
        body: form.body.trim(),
        cover_image_url: coverUrl,
        show_on_homepage: form.show_on_homepage,
        homepage_order: parseInt(form.homepage_order) || 0,
      }
      if (editing) {
        const { error: err } = await supabase.from('news').update(payload).eq('id', editing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('news').insert([payload])
        if (err) throw err
      }
      closeModal()
      fetchNews()
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحفظ')
      console.error(err)
    }
    setSaving(false)
    setUploading(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      const { error: err } = await supabase.from('news').delete().eq('id', confirmDelete.id)
      if (err) throw err
      setConfirmDelete(null)
      fetchNews()
    } catch (err) {
      setError('حدث خطأ أثناء الحذف')
      console.error(err)
      setConfirmDelete(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('ar-SA') } catch { return d }
  }

  return (
    <>
      <style>{css}</style>
      <div className="news-page">
        {error && <div className="news-error">{error}</div>}

        <div className="news-top">
          <div className="news-title">إدارة الأخبار</div>
          <button className="news-btn news-btn-primary" onClick={openAdd}>+ إضافة خبر</button>
        </div>

        {loading ? (
          <div className="news-loading">جارٍ التحميل...</div>
        ) : news.length === 0 ? (
          <div className="news-empty">لا توجد أخبار حالياً</div>
        ) : (
          <div className="news-table-wrap">
            <table className="news-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>التاريخ</th>
                  <th>الرئيسية</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id}>
                    <td><div className="news-table-title">{item.title}</div></td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`news-badge ${item.show_on_homepage ? 'news-badge-on' : 'news-badge-off'}`}>
                        {item.show_on_homepage ? 'نعم' : 'لا'}
                      </span>
                    </td>
                    <td>
                      <div className="news-actions">
                        <button className="news-btn news-btn-ghost news-btn-sm" onClick={() => openEdit(item)}>تعديل</button>
                        <button className="news-btn news-btn-danger news-btn-sm" onClick={() => setConfirmDelete(item)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="news-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="news-modal">
              <div className="news-modal-title">{editing ? 'تعديل الخبر' : 'إضافة خبر جديد'}</div>

              <div className="news-field">
                <label className="news-label">عنوان الخبر *</label>
                <input className="news-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="أدخل عنوان الخبر" />
              </div>

              <div className="news-field">
                <label className="news-label">الوصف المختصر</label>
                <input className="news-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف قصير للخبر" />
              </div>

              <div className="news-row">
                <div className="news-field">
                  <label className="news-label">التاريخ</label>
                  <input className="news-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="news-field">
                  <label className="news-label">الترتيب في الرئيسية</label>
                  <input className="news-input" type="number" min="0" value={form.homepage_order} onChange={(e) => setForm({ ...form, homepage_order: e.target.value })} />
                </div>
              </div>

              <div className="news-field">
                <label className="news-label">المحتوى</label>
                <textarea className="news-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="اكتب محتوى الخبر..." />
              </div>

              <div className="news-field">
                <label className="news-label">صورة الغلاف</label>
                <div className="news-file-zone">
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {previewUrl ? (
                    <img src={previewUrl} alt="" className="news-file-preview" />
                  ) : (
                    <div className="news-file-hint">اضغط أو اسحب صورة هنا</div>
                  )}
                </div>
              </div>

              <div className="news-checkbox-row">
                <input type="checkbox" id="hp-toggle" checked={form.show_on_homepage} onChange={(e) => setForm({ ...form, show_on_homepage: e.target.checked })} />
                <label htmlFor="hp-toggle" className="news-checkbox-label">عرض في الصفحة الرئيسية</label>
              </div>

              <div className="news-modal-actions">
                <button className="news-btn news-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (uploading ? 'جارٍ رفع الصورة...' : 'جارٍ الحفظ...') : (editing ? 'تحديث' : 'إضافة')}
                </button>
                <button className="news-btn news-btn-ghost" onClick={closeModal} disabled={saving}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="news-confirm-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
            <div className="news-confirm">
              <p>هل أنت متأكد من حذف "{confirmDelete.title}"؟</p>
              <div className="news-confirm-actions">
                <button className="news-btn news-btn-danger news-btn-sm" onClick={handleDelete}>نعم، احذف</button>
                <button className="news-btn news-btn-ghost news-btn-sm" onClick={() => setConfirmDelete(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
