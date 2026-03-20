import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const css = `
.gal-page{direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif;color:#E8E4DB;display:flex;gap:1.5rem;min-height:calc(100vh - 4rem)}
.gal-sidebar{width:240px;flex-shrink:0;background:#0C0B08;border:1px solid rgba(255,255,255,.04);border-radius:12px;padding:1rem;overflow-y:auto;max-height:calc(100vh - 5rem);align-self:flex-start;position:sticky;top:2rem}
.gal-main{flex:1;min-width:0}
.gal-cat{margin-bottom:1.2rem}
.gal-cat-title{font-size:.72rem;font-weight:700;color:#6A665C;text-transform:uppercase;letter-spacing:.02em;margin-bottom:.5rem;padding:0 .4rem;display:flex;align-items:center;justify-content:space-between}
.gal-cat-add{background:none;border:none;color:#C9A96E;cursor:pointer;font-size:.85rem;padding:0;line-height:1;font-family:'IBM Plex Sans Arabic',sans-serif}
.gal-cat-add:hover{color:#b8943d}
.gal-album-item{display:flex;align-items:center;gap:.5rem;padding:.45rem .6rem;border-radius:8px;cursor:pointer;transition:all .2s;font-size:.78rem;color:#9E998E;border:none;background:none;width:100%;text-align:right;font-family:'IBM Plex Sans Arabic',sans-serif}
.gal-album-item:hover{background:rgba(255,255,255,.03);color:#E8E4DB}
.gal-album-item.active{background:rgba(201,169,110,.08);color:#C9A96E}
.gal-album-dot{width:6px;height:6px;border-radius:50%;background:#6A665C;flex-shrink:0}
.gal-album-item.active .gal-album-dot{background:#C9A96E}
.gal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;flex-wrap:wrap;gap:.8rem}
.gal-title{font-family:'Amiri',serif;font-size:1.3rem;font-weight:700;color:#E8E4DB}
.gal-subtitle{font-size:.78rem;color:#6A665C;margin-top:.15rem}
.gal-btn{padding:.5rem 1.2rem;border-radius:8px;border:none;cursor:pointer;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.8rem;font-weight:600;transition:all .2s}
.gal-btn-primary{background:#C9A96E;color:#000}
.gal-btn-primary:hover{background:#b8943d}
.gal-btn-danger{background:rgba(220,60,60,.15);color:#e05555;border:1px solid rgba(220,60,60,.2)}
.gal-btn-danger:hover{background:rgba(220,60,60,.25)}
.gal-btn-ghost{background:rgba(255,255,255,.04);color:#9E998E;border:1px solid rgba(255,255,255,.06)}
.gal-btn-ghost:hover{background:rgba(255,255,255,.08);color:#E8E4DB}
.gal-btn-sm{padding:.35rem .8rem;font-size:.72rem}
.gal-album-info{background:#0C0B08;border:1px solid rgba(255,255,255,.04);border-radius:12px;padding:1.2rem;margin-bottom:1.2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.gal-album-info-text{flex:1}
.gal-album-info-name{font-size:.95rem;font-weight:700;color:#E8E4DB;margin-bottom:.2rem}
.gal-album-info-desc{font-size:.75rem;color:#6A665C}
.gal-album-info-actions{display:flex;gap:.4rem;align-items:center}
.gal-album-cover-wrap{display:flex;align-items:center;gap:.6rem;margin-top:.5rem}
.gal-album-cover-img{width:60px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.06)}
.gal-album-cover-btn{position:relative;overflow:hidden}
.gal-album-cover-btn input{position:absolute;inset:0;opacity:0;cursor:pointer}
.gal-upload-zone{border:2px dashed rgba(255,255,255,.06);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:border .2s;position:relative;margin-bottom:1.5rem}
.gal-upload-zone:hover{border-color:rgba(201,169,110,.2)}
.gal-upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.gal-upload-icon{font-size:1.5rem;margin-bottom:.3rem}
.gal-upload-text{font-size:.78rem;color:#6A665C}
.gal-upload-progress{font-size:.72rem;color:#C9A96E;margin-top:.5rem}
.gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}
.gal-photo-card{background:#0C0B08;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden;transition:border .2s}
.gal-photo-card:hover{border-color:rgba(255,255,255,.08)}
.gal-photo-img{width:100%;height:140px;object-fit:cover;display:block}
.gal-photo-body{padding:.7rem}
.gal-photo-input{width:100%;padding:.3rem .5rem;border-radius:6px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);color:#E8E4DB;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.7rem;margin-bottom:.3rem;outline:none;box-sizing:border-box}
.gal-photo-input:focus{border-color:rgba(201,169,110,.2)}
.gal-photo-actions{display:flex;justify-content:flex-end;margin-top:.4rem}
.gal-empty{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.gal-loading{text-align:center;padding:3rem;color:#6A665C;font-size:.85rem}
.gal-error{text-align:center;padding:1rem;color:#e05555;font-size:.8rem;background:rgba(220,60,60,.08);border-radius:8px;margin-bottom:1rem}
.gal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
.gal-modal{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:2rem;width:100%;max-width:420px;direction:rtl}
.gal-modal-title{font-family:'Amiri',serif;font-size:1rem;font-weight:700;color:#E8E4DB;margin-bottom:1.2rem}
.gal-field{margin-bottom:1rem}
.gal-label{display:block;font-size:.72rem;color:#6A665C;margin-bottom:.35rem;font-weight:600}
.gal-input{width:100%;padding:.55rem .8rem;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:#E8E4DB;font-family:'IBM Plex Sans Arabic',sans-serif;font-size:.8rem;outline:none;box-sizing:border-box}
.gal-input:focus{border-color:rgba(201,169,110,.3)}
.gal-modal-actions{display:flex;gap:.6rem;margin-top:1.2rem}
.gal-confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center}
.gal-confirm{background:#111;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.5rem;max-width:360px;width:90%;text-align:center;direction:rtl}
.gal-confirm p{color:#E8E4DB;font-size:.85rem;margin-bottom:1.2rem}
.gal-confirm-actions{display:flex;gap:.5rem;justify-content:center}
.gal-file-zone{border:2px dashed rgba(255,255,255,.06);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;transition:border .2s;position:relative}
.gal-file-zone:hover{border-color:rgba(201,169,110,.2)}
.gal-file-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.gal-file-hint{font-size:.7rem;color:#6A665C;margin-top:.3rem}
.gal-file-preview{width:80px;height:50px;object-fit:cover;border-radius:6px;margin-top:.5rem}
@media(max-width:768px){
  .gal-page{flex-direction:column}
  .gal-sidebar{width:100%;max-height:200px;position:static;display:flex;flex-wrap:wrap;gap:.5rem}
  .gal-cat{margin-bottom:.5rem}
  .gal-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
}
`

const FIXED_CATEGORIES = [
  { id: 'events', title: 'المناسبات', filter: 'events' },
  { id: 'holidays', title: 'الأعياد', filter: 'holidays' },
  { id: 'memories', title: 'الذكريات', filter: 'memories' },
]

export default function DashGalleryPage() {
  const [albums, setAlbums] = useState([])
  const [photos, setPhotos] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [error, setError] = useState(null)
  const [albumModal, setAlbumModal] = useState(null) // { mode:'add'|'edit', categoryId, album? }
  const [albumForm, setAlbumForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { type:'album'|'photo', item }
  const [editingPhoto, setEditingPhoto] = useState({}) // { [photoId]: { title, description } }
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  const fetchAlbums = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError('حدث خطأ في تحميل الألبومات')
      console.error(err)
    } else {
      setAlbums(data || [])
    }
    setLoading(false)
  }, [])

  const fetchPhotos = useCallback(async (albumId) => {
    setPhotosLoading(true)
    const { data, error: err } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order', { ascending: true })
    if (err) {
      setError('حدث خطأ في تحميل الصور')
      console.error(err)
    } else {
      setPhotos(data || [])
      const edits = {}
      ;(data || []).forEach(p => { edits[p.id] = { title: p.title || '', description: p.description || '' } })
      setEditingPhoto(edits)
    }
    setPhotosLoading(false)
  }, [])

  useEffect(() => { fetchAlbums() }, [fetchAlbums])

  useEffect(() => {
    if (selectedAlbum) fetchPhotos(selectedAlbum.id)
    else setPhotos([])
  }, [selectedAlbum, fetchPhotos])

  const selectAlbum = (album) => {
    setSelectedAlbum(album)
    setError(null)
  }

  // Album CRUD
  const openAddAlbum = (categoryId) => {
    setAlbumModal({ mode: 'add', categoryId })
    setAlbumForm({ title: '', description: '' })
    setCoverFile(null)
    setCoverPreview(null)
  }

  const openEditAlbum = () => {
    if (!selectedAlbum) return
    setAlbumModal({ mode: 'edit', categoryId: selectedAlbum.category_id, album: selectedAlbum })
    setAlbumForm({ title: selectedAlbum.title || '', description: selectedAlbum.description || '' })
    setCoverFile(null)
    setCoverPreview(selectedAlbum.cover_image_url || null)
  }

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const uploadCoverImage = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
    const { error: upErr } = await supabase.storage
      .from('gallery')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (upErr) throw upErr
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const saveAlbum = async () => {
    if (!albumForm.title.trim()) { setError('يرجى إدخال اسم الألبوم'); return }
    setSaving(true)
    setError(null)
    try {
      let coverUrl = selectedAlbum?.cover_image_url || null
      if (coverFile) {
        coverUrl = await uploadCoverImage(coverFile)
      }

      if (albumModal.mode === 'add') {
        const { error: err } = await supabase.from('albums').insert([{
          category_id: albumModal.categoryId,
          title: albumForm.title.trim(),
          description: albumForm.description.trim(),
          cover_image_url: coverUrl,
          display_order: albums.filter(a => a.category_id === albumModal.categoryId).length,
        }])
        if (err) throw err
      } else {
        const payload = {
          title: albumForm.title.trim(),
          description: albumForm.description.trim(),
        }
        if (coverFile) payload.cover_image_url = coverUrl
        const { error: err } = await supabase.from('albums').update(payload).eq('id', albumModal.album.id)
        if (err) throw err
        if (selectedAlbum && selectedAlbum.id === albumModal.album.id) {
          setSelectedAlbum({ ...selectedAlbum, ...payload, cover_image_url: coverUrl || selectedAlbum.cover_image_url })
        }
      }
      setAlbumModal(null)
      setCoverFile(null)
      setCoverPreview(null)
      fetchAlbums()
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ الألبوم')
      console.error(err)
    }
    setSaving(false)
  }

  // Update album cover directly from the info bar
  const handleAlbumCoverUpdate = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedAlbum) return
    setUploadingCover(true)
    setError(null)
    try {
      const coverUrl = await uploadCoverImage(file)
      const { error: err } = await supabase.from('albums').update({ cover_image_url: coverUrl }).eq('id', selectedAlbum.id)
      if (err) throw err
      setSelectedAlbum({ ...selectedAlbum, cover_image_url: coverUrl })
      fetchAlbums()
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث صورة الغلاف')
      console.error(err)
    }
    setUploadingCover(false)
    e.target.value = ''
  }

  const deleteAlbum = async () => {
    if (!confirmDelete || confirmDelete.type !== 'album') return
    try {
      // Delete all photos in album first
      const { data: albumPhotos } = await supabase.from('photos').select('id, image_url').eq('album_id', confirmDelete.item.id)
      if (albumPhotos && albumPhotos.length > 0) {
        const paths = albumPhotos.map(p => {
          const url = p.image_url || ''
          const parts = url.split('/gallery/')
          return parts.length > 1 ? parts[parts.length - 1] : null
        }).filter(Boolean)
        if (paths.length > 0) {
          await supabase.storage.from('gallery').remove(paths)
        }
        await supabase.from('photos').delete().eq('album_id', confirmDelete.item.id)
      }
      const { error: err } = await supabase.from('albums').delete().eq('id', confirmDelete.item.id)
      if (err) throw err
      if (selectedAlbum && selectedAlbum.id === confirmDelete.item.id) {
        setSelectedAlbum(null)
        setPhotos([])
      }
      setConfirmDelete(null)
      fetchAlbums()
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حذف الألبوم')
      console.error(err)
      setConfirmDelete(null)
    }
  }

  // Photo upload - supports multiple files
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !selectedAlbum) return
    setUploading(true)
    setError(null)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`جارٍ رفع ${i + 1} من ${files.length}...`)
        const ext = file.name.split('.').pop()
        const fileName = `${selectedAlbum.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('gallery')
          .upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw new Error(`خطأ في رفع "${file.name}": ${upErr.message}`)
        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName)
        const { error: insertErr } = await supabase.from('photos').insert([{
          album_id: selectedAlbum.id,
          image_url: urlData.publicUrl,
          title: '',
          description: '',
          display_order: photos.length + i,
        }])
        if (insertErr) throw new Error(`خطأ في حفظ بيانات الصورة: ${insertErr.message}`)
      }
      setUploadProgress('')
      fetchPhotos(selectedAlbum.id)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء رفع الصور')
      console.error(err)
    }
    setUploading(false)
    setUploadProgress('')
    e.target.value = ''
  }

  // Photo update
  const savePhotoDetails = async (photo) => {
    const edits = editingPhoto[photo.id]
    if (!edits) return
    try {
      const { error: err } = await supabase.from('photos').update({
        title: edits.title.trim(),
        description: edits.description.trim(),
      }).eq('id', photo.id)
      if (err) throw err
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث الصورة')
      console.error(err)
    }
  }

  const deletePhoto = async () => {
    if (!confirmDelete || confirmDelete.type !== 'photo') return
    try {
      const photo = confirmDelete.item
      const url = photo.image_url || ''
      const parts = url.split('/gallery/')
      if (parts.length > 1) {
        await supabase.storage.from('gallery').remove([parts[parts.length - 1]])
      }
      const { error: err } = await supabase.from('photos').delete().eq('id', photo.id)
      if (err) throw err
      setConfirmDelete(null)
      if (selectedAlbum) fetchPhotos(selectedAlbum.id)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حذف الصورة')
      console.error(err)
      setConfirmDelete(null)
    }
  }

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    if (confirmDelete.type === 'album') deleteAlbum()
    else deletePhoto()
  }

  return (
    <>
      <style>{css}</style>
      <div className="gal-page">
        {/* Sidebar */}
        <div className="gal-sidebar">
          {loading ? (
            <div className="gal-loading">جارٍ التحميل...</div>
          ) : (
            FIXED_CATEGORIES.map(cat => {
              const catAlbums = albums.filter(a => a.category_id === cat.id)
              return (
                <div className="gal-cat" key={cat.id}>
                  <div className="gal-cat-title">
                    <span>{cat.title}</span>
                    <button className="gal-cat-add" onClick={() => openAddAlbum(cat.id)} title="إضافة ألبوم">+</button>
                  </div>
                  {catAlbums.map(album => (
                    <button
                      key={album.id}
                      className={`gal-album-item${selectedAlbum?.id === album.id ? ' active' : ''}`}
                      onClick={() => selectAlbum(album)}
                    >
                      <span className="gal-album-dot" />
                      <span>{album.title}</span>
                    </button>
                  ))}
                  {catAlbums.length === 0 && (
                    <div style={{ padding: '.3rem .6rem', fontSize: '.7rem', color: '#6A665C' }}>لا توجد ألبومات</div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Main Content */}
        <div className="gal-main">
          {error && <div className="gal-error">{error}</div>}

          {!selectedAlbum ? (
            <div className="gal-empty">
              <div className="gal-title" style={{ marginBottom: '.5rem' }}>إدارة المعرض</div>
              <p style={{ color: '#6A665C', fontSize: '.85rem' }}>اختر ألبوماً من القائمة الجانبية أو أنشئ ألبوماً جديداً</p>
            </div>
          ) : (
            <>
              {/* Album Info Bar */}
              <div className="gal-album-info">
                <div className="gal-album-info-text">
                  <div className="gal-album-info-name">{selectedAlbum.title}</div>
                  {selectedAlbum.description && <div className="gal-album-info-desc">{selectedAlbum.description}</div>}
                  <div className="gal-album-cover-wrap">
                    {selectedAlbum.cover_image_url && (
                      <img src={selectedAlbum.cover_image_url} alt="" className="gal-album-cover-img" />
                    )}
                    <div className="gal-album-cover-btn gal-btn gal-btn-ghost gal-btn-sm" style={{ position: 'relative', overflow: 'hidden' }}>
                      <input type="file" accept="image/*" onChange={handleAlbumCoverUpdate} disabled={uploadingCover} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      {uploadingCover ? 'جارٍ الرفع...' : (selectedAlbum.cover_image_url ? 'تغيير الغلاف' : 'إضافة غلاف')}
                    </div>
                  </div>
                </div>
                <div className="gal-album-info-actions">
                  <button className="gal-btn gal-btn-ghost gal-btn-sm" onClick={openEditAlbum}>تعديل</button>
                  <button className="gal-btn gal-btn-danger gal-btn-sm" onClick={() => setConfirmDelete({ type: 'album', item: selectedAlbum })}>حذف الألبوم</button>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="gal-upload-zone">
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} />
                <div className="gal-upload-icon">+</div>
                <div className="gal-upload-text">اضغط أو اسحب الصور لرفعها (يمكنك اختيار عدة صور)</div>
                {uploadProgress && <div className="gal-upload-progress">{uploadProgress}</div>}
              </div>

              {/* Photos Grid */}
              {photosLoading ? (
                <div className="gal-loading">جارٍ تحميل الصور...</div>
              ) : photos.length === 0 ? (
                <div className="gal-empty">لا توجد صور في هذا الألبوم</div>
              ) : (
                <div className="gal-grid">
                  {photos.map(photo => (
                    <div className="gal-photo-card" key={photo.id}>
                      <img src={photo.image_url} alt={photo.title || ''} className="gal-photo-img" loading="lazy" />
                      <div className="gal-photo-body">
                        <input
                          className="gal-photo-input"
                          placeholder="عنوان الصورة"
                          value={editingPhoto[photo.id]?.title || ''}
                          onChange={(e) => setEditingPhoto({ ...editingPhoto, [photo.id]: { ...editingPhoto[photo.id], title: e.target.value } })}
                          onBlur={() => savePhotoDetails(photo)}
                        />
                        <input
                          className="gal-photo-input"
                          placeholder="وصف الصورة"
                          value={editingPhoto[photo.id]?.description || ''}
                          onChange={(e) => setEditingPhoto({ ...editingPhoto, [photo.id]: { ...editingPhoto[photo.id], description: e.target.value } })}
                          onBlur={() => savePhotoDetails(photo)}
                        />
                        <div className="gal-photo-actions">
                          <button className="gal-btn gal-btn-danger gal-btn-sm" onClick={() => setConfirmDelete({ type: 'photo', item: photo })}>حذف</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Album Add/Edit Modal */}
      {albumModal && (
        <div className="gal-overlay" onClick={(e) => e.target === e.currentTarget && setAlbumModal(null)}>
          <div className="gal-modal">
            <div className="gal-modal-title">{albumModal.mode === 'add' ? 'إضافة ألبوم جديد' : 'تعديل الألبوم'}</div>
            <div className="gal-field">
              <label className="gal-label">اسم الألبوم *</label>
              <input className="gal-input" value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} placeholder="أدخل اسم الألبوم" />
            </div>
            <div className="gal-field">
              <label className="gal-label">الوصف</label>
              <input className="gal-input" value={albumForm.description} onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })} placeholder="وصف مختصر" />
            </div>
            <div className="gal-field">
              <label className="gal-label">صورة الغلاف</label>
              <div className="gal-file-zone">
                <input type="file" accept="image/*" onChange={handleCoverFileChange} />
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="gal-file-preview" />
                ) : (
                  <div className="gal-file-hint">اضغط لاختيار صورة غلاف</div>
                )}
              </div>
            </div>
            <div className="gal-modal-actions">
              <button className="gal-btn gal-btn-primary" onClick={saveAlbum} disabled={saving}>
                {saving ? 'جارٍ الحفظ...' : (albumModal.mode === 'add' ? 'إضافة' : 'تحديث')}
              </button>
              <button className="gal-btn gal-btn-ghost" onClick={() => { setAlbumModal(null); setCoverFile(null); setCoverPreview(null) }} disabled={saving}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="gal-confirm-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="gal-confirm">
            <p>
              {confirmDelete.type === 'album'
                ? `هل أنت متأكد من حذف ألبوم "${confirmDelete.item.title}"؟ سيتم حذف جميع الصور.`
                : 'هل أنت متأكد من حذف هذه الصورة؟'
              }
            </p>
            <div className="gal-confirm-actions">
              <button className="gal-btn gal-btn-danger gal-btn-sm" onClick={handleConfirmDelete}>نعم، احذف</button>
              <button className="gal-btn gal-btn-ghost gal-btn-sm" onClick={() => setConfirmDelete(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
