import React from 'react'

export default function CallModal({ name, phone, lang, onClose, zIndex = 1000000 }) {
  const clean    = (phone || '').replace(/[\s\-()]/g, '')
  const waNumber = clean.startsWith('+') ? clean.replace('+', '') : `1${clean}`
  return (
    <>
      <style>{`@keyframes callModalIn{from{transform:translateX(-50%) translateY(30px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.1)', zIndex: zIndex }} />
      <div style={{
        position:'fixed', bottom:40, left:'50%', transform:'translateX(-50%)',
        width:'calc(100% - 48px)', maxWidth:360, background:'#fff', borderRadius:24,
        padding:'28px 24px 20px', zIndex: zIndex + 1, boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        animation:'callModalIn .3s cubic-bezier(.32,1.2,.5,1)', textAlign:'center',
      }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#F26000', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:24, margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(242,96,0,0.3)' }}>
          {(name||'?').substring(0,2).toUpperCase()}
        </div>
        <h3 style={{ margin:'0 0 4px', fontSize:18, fontWeight:900, color:'#1A1A2E' }}>{name}</h3>
        <p style={{ margin:'0 0 24px', fontSize:13, color:'#999' }}>{phone || (lang==='es'?'Sin número registrado':'No phone registered')}</p>
        {phone ? (
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <a href={`tel:${clean}`} onClick={onClose} style={{ flex:1, padding:'14px 8px', borderRadius:16, background:'#F26000', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 4px 16px rgba(242,96,0,0.3)' }}>
              <span style={{ fontSize:28 }}>📞</span>{lang==='es'?'Llamada directa':'Direct call'}
            </a>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" onClick={onClose} style={{ flex:1, padding:'14px 8px', borderRadius:16, background:'#25D366', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 4px 16px rgba(37,211,102,0.3)' }}>
              <span style={{ fontSize:28 }}>💬</span>WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ padding:16, background:'#FFF3EC', borderRadius:12, marginBottom:16 }}>
            <p style={{ margin:0, fontSize:13, color:'#F26000', fontWeight:600 }}>{lang==='es'?'Este usuario no tiene número de teléfono registrado.':'This user has no registered phone number.'}</p>
          </div>
        )}
        <button onClick={onClose} style={{ width:'100%', padding:14, borderRadius:14, background:'#F5F5F5', border:'none', color:'#666', fontWeight:700, fontSize:14, cursor:'pointer' }}>{lang==='es'?'Cancelar':'Cancel'}</button>
      </div>
    </>
  )
}
