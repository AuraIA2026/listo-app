import { useState } from "react";

/* ─── PALETA ─────────────────────────────────────────────────── */
const C = {
  mamey:     "#F26000",
  mameyDark: "#C24E00",
  mameyLight:"#FF8534",
  bg:        "#FAF8F6",
  white:     "#FFFFFF",
  black:     "#1A1A1A",
  gray:      "#6B7280",
  grayLight: "#9CA3AF",
  border:    "#E5E7EB",
  offWhite:  "#F9FAFB",
};

/* ─── SECCIONES ──────────────────────────────────────────────── */
const SECTIONS = [
  { n: 1, icon: "👤", color: "#F26000", bg: "#FFF3EC", title: "Información Básica",     sub: "Nombre, teléfono y correo" },
  { n: 2, icon: "📍", color: "#10B981", bg: "#ECFDF5", title: "Dirección Principal",    sub: "Para que el profesional te encuentre" },
  { n: 3, icon: "📸", color: "#3B82F6", bg: "#EFF6FF", title: "Foto de Perfil",         sub: "Opcional · Genera confianza" },
  { n: 4, icon: "🔐", color: "#8B5CF6", bg: "#F5F3FF", title: "Verificación Básica",    sub: "SMS y correo electrónico" },
  { n: 5, icon: "📋", color: "#EC4899", bg: "#FDF2F8", title: "Términos y Condiciones", sub: "Confirma y acepta las condiciones" },
];

/* ─── TÉRMINOS USUARIO ───────────────────────────────────────── */
const TERMS = [
  { title: "1. Bienvenido",              body: "Gracias por usar Listo Patrón. Nuestra plataforma conecta usuarios con profesionales independientes que ofrecen servicios a domicilio. Al utilizar la aplicación, aceptas estos términos." },
  { title: "2. Cómo Funciona",           body: "Listo Patrón actúa como intermediario tecnológico. Los servicios son realizados por profesionales independientes, quienes son responsables de la ejecución y calidad del trabajo." },
  { title: "3. Registro y Cuenta",       body: "Debes proporcionar información real y actual. Eres responsable del uso de tu cuenta. La plataforma podrá suspender cuentas en caso de actividad sospechosa." },
  { title: "4. Solicitud de Servicios",  body: "Al confirmar un servicio, aceptas el precio mostrado. Debes estar disponible en la dirección indicada. Recomendamos mantener la comunicación dentro de la app." },
  { title: "5. Cancelaciones",           body: "Puedes cancelar sin costo antes de que el profesional esté en camino. Si ya está en ruta, puede aplicarse un cargo. Cancelaciones frecuentes generarán restricciones." },
  { title: "6. Conducta y Respeto",      body: "El usuario se compromete a tratar con respeto a los profesionales. No se permiten conductas abusivas o ilegales. En casos graves, la cuenta podrá ser suspendida." },
  { title: "7. Protección de Datos",     body: "La información será tratada conforme a la Ley 172-13 sobre Protección de Datos de la República Dominicana." },
  { title: "8. Aceptación",             body: "Al registrarte y usar la aplicación, confirmas que has leído y aceptado estos términos." },
];

/* ══════════════════════════════════════════════════════════════ */
export default function RegistroClientePage({ onBack, onSuccess }) {
  const [open,      setOpen]      = useState({ 1: true });
  const [checks,    setChecks]    = useState({ c1: false, c2: false, c3: false });
  const [termExp,   setTermExp]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [smsCode,   setSmsCode]   = useState("");
  const [smsSent,   setSmsSent]   = useState(false);
  const [smsVerif,  setSmsVerif]  = useState(false);
  const [emailVerif,setEmailVerif]= useState(false);
  const [avatar,    setAvatar]    = useState(null);

  const [form, setForm] = useState({
    nombre: "", telefono: "", correo: "", ciudad: "",
    provincia: "", municipio: "", sector: "", direccion: "", referencia: "",
  });

  const hf  = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const tog = n => setOpen(p => ({ ...p, [n]: !p[n] }));
  const togCheck = k => setChecks(p => ({ ...p, [k]: !p[k] }));

  const completedCount = Object.values(open).filter(Boolean).length;
  const pct = Math.round((completedCount / 5) * 100);

  /* Badge "Usuario Verificado" se gana cuando teléfono + correo confirmados */
  const isVerified = smsVerif && emailVerif;

  const handleSubmit = () => {
    if (!checks.c1 || !checks.c2 || !checks.c3) {
      alert("Por favor acepta todos los términos.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => onSuccess?.(), 2000);
  };

  if (submitted) return <SuccessScreen onBack={onBack} isVerified={isVerified} />;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>‹</button>
        <span style={s.headerTitle}>Crear cuenta</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={s.scroll}>

        {/* ── HERO ── */}
        <div style={s.hero}>
          <div style={s.heroOrb1} /><div style={s.heroOrb2} />
          <div style={s.heroRow}>
            <div style={s.heroIconWrap}>
              <span style={{ fontSize: 30 }}>👋</span>
            </div>
            <div>
              <div style={s.heroTitle}>¡Bienvenido a Listo!</div>
              <div style={s.heroSub}>Registro rápido · Solo toma 2 minutos</div>
            </div>
          </div>
          {/* Diferenciador cliente vs pro */}
          <div style={s.heroDiff}>
            <div style={s.diffItem}><span>⚡</span> Acceso inmediato</div>
            <div style={s.diffItem}><span>🔒</span> Datos protegidos</div>
            <div style={s.diffItem}><span>✅</span> Sin cédula</div>
          </div>
        </div>

        {/* ── PROGRESS ── */}
        <div style={s.progressCard}>
          <div style={s.progRow}>
            <span style={s.progLabel}>Tu progreso</span>
            <span style={s.progPct}>{completedCount}/5</span>
          </div>
          <div style={s.progBg}>
            <div style={{ ...s.progFill, width: `${pct}%` }} />
          </div>
          <div style={s.dots}>
            {SECTIONS.map((sec, i) => (
              <div key={sec.n} style={{ display:"flex", alignItems:"center", flex: i < 4 ? 1 : "none" }}>
                <div style={{
                  ...s.dot,
                  background: open[sec.n] ? sec.color : C.border,
                  color:      open[sec.n] ? "white"   : C.grayLight,
                  boxShadow:  open[sec.n] ? `0 2px 10px ${sec.color}55` : "none",
                }}>
                  {open[sec.n] ? "✓" : sec.n}
                </div>
                {i < 4 && <div style={{ flex:1, height:2, background: open[sec.n+1] ? C.mamey : C.border, transition:"background 0.3s" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIONES ── */}
        {SECTIONS.map(({ n, icon, color, bg, title, sub }) => (
          <div key={n} className="card-anim" style={{
            ...s.card,
            borderColor: open[n] ? color+"33" : "transparent",
            boxShadow:   open[n] ? `0 4px 20px ${color}18` : "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <button style={s.cardHead} onClick={() => tog(n)}>
              <div style={{ ...s.cardIcon, background: bg }}>
                <span style={{ fontSize: 19 }}>{icon}</span>
              </div>
              <div style={s.cardInfo}>
                <div style={s.cardTitle}>{title}</div>
                <div style={s.cardSub}>{sub}</div>
              </div>
              {open[n] && <div style={{ width:8, height:8, borderRadius:"50%", background:color, marginRight:2 }} />}
              <span style={{ ...s.chev, transform: open[n]?"rotate(90deg)":"rotate(0)", color: open[n]?color:C.grayLight }}>›</span>
            </button>

            {open[n] && (
              <div style={s.cardBody} className="body-anim">

                {/* ── 1: INFO BÁSICA ── */}
                {n === 1 && (
                  <div style={s.fields}>
                    <Field label="Nombre completo" req>
                      <input style={s.inp} name="nombre" value={form.nombre} onChange={hf} placeholder="Tu nombre completo" />
                    </Field>
                    <Field label="Número de teléfono" req>
                      <div style={{ position:"relative" }}>
                        <input style={{ ...s.inp, paddingRight: 90 }} name="telefono" value={form.telefono} onChange={hf} placeholder="+1 (809) 000-0000" />
                        {!smsVerif && (
                          <button style={s.inlineBtn} onClick={() => setSmsSent(true)}>
                            {smsSent ? "Reenviar" : "Verificar"}
                          </button>
                        )}
                        {smsVerif && <span style={s.verifiedTag}>✓ Verificado</span>}
                      </div>
                    </Field>
                    {smsSent && !smsVerif && (
                      <div style={s.smsBox} className="body-anim">
                        <div style={s.smsLabel}>📩 Ingresa el código enviado por SMS</div>
                        <div style={{ display:"flex", gap:8 }}>
                          <input style={{ ...s.inp, flex:1, letterSpacing:6, fontWeight:800, textAlign:"center" }}
                            maxLength={6} value={smsCode} onChange={e => setSmsCode(e.target.value)}
                            placeholder="• • • • • •" />
                          <button style={s.confirmBtn} onClick={() => { if(smsCode.length>=4) setSmsVerif(true); }}>
                            Confirmar
                          </button>
                        </div>
                      </div>
                    )}
                    <Field label="Correo electrónico" req>
                      <div style={{ position:"relative" }}>
                        <input style={{ ...s.inp, paddingRight: 90 }} type="email" name="correo" value={form.correo} onChange={hf} placeholder="tu@correo.com" />
                        {!emailVerif && (
                          <button style={s.inlineBtn} onClick={() => setEmailVerif(true)}>Verificar</button>
                        )}
                        {emailVerif && <span style={s.verifiedTag}>✓ Verificado</span>}
                      </div>
                    </Field>
                    <Field label="Ciudad" req>
                      <select style={s.inp} name="ciudad" value={form.ciudad} onChange={hf}>
                        <option value="">Seleccionar ciudad</option>
                        <option>Santo Domingo</option>
                        <option>Santiago</option>
                        <option>La Vega</option>
                        <option>San Pedro de Macorís</option>
                        <option>Otra</option>
                      </select>
                    </Field>
                  </div>
                )}

                {/* ── 2: DIRECCIÓN ── */}
                {n === 2 && (
                  <div style={s.fields}>
                    <div style={s.infoTip}>
                      <span>💡</span>
                      <span>Tu dirección exacta solo se comparte con el profesional cuando acepta tu solicitud.</span>
                    </div>
                    <div style={s.row}>
                      <Field label="Provincia" req>
                        <select style={s.inp} name="provincia" value={form.provincia} onChange={hf}>
                          <option value="">Seleccionar</option>
                          <option>Distrito Nacional</option>
                          <option>Santiago</option>
                          <option>La Vega</option>
                          <option>San Pedro</option>
                          <option>Otra</option>
                        </select>
                      </Field>
                      <Field label="Municipio" req>
                        <input style={s.inp} name="municipio" value={form.municipio} onChange={hf} placeholder="Municipio" />
                      </Field>
                    </div>
                    <Field label="Sector" req>
                      <input style={s.inp} name="sector" value={form.sector} onChange={hf} placeholder="Ej: Los Mameyes" />
                    </Field>
                    <Field label="Dirección exacta" req>
                      <input style={s.inp} name="direccion" value={form.direccion} onChange={hf} placeholder="Calle, número, edificio..." />
                    </Field>
                    <Field label="Punto de referencia" opt>
                      <input style={s.inp} name="referencia" value={form.referencia} onChange={hf} placeholder="Cerca de, frente a..." />
                    </Field>
                  </div>
                )}

                {/* ── 3: FOTO ── */}
                {n === 3 && (
                  <div style={s.fields}>
                    <div style={s.infoTip}>
                      <span>💡</span>
                      <span>Una foto genera más confianza con el profesional. No es obligatoria.</span>
                    </div>
                    <div style={s.avatarArea}>
                      <div style={{ ...s.avatarCircle, background: avatar ? "transparent" : "#FFF3EC" }}>
                        {avatar
                          ? <img src={avatar} alt="avatar" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
                          : <span style={{ fontSize: 40 }}>👤</span>
                        }
                      </div>
                      <div style={{ display:"flex", gap:10, marginTop:14 }}>
                        <button style={s.btnFile} className="btn-h">📁 Subir foto</button>
                        <button style={s.btnCam}  className="btn-h">📷 Tomar foto</button>
                      </div>
                      <p style={{ fontSize:11, color:C.grayLight, marginTop:8 }}>JPG o PNG · máx 5MB</p>
                    </div>

                    {/* Vista previa del perfil público */}
                    <div style={s.previewCard}>
                      <div style={s.previewTitle}>👁️ Lo que verá el profesional</div>
                      <div style={s.previewRow}>
                        <div style={s.previewAvatar}>{avatar ? <img src={avatar} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/> : "👤"}</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:C.black }}>{form.nombre || "Tu nombre"}</div>
                          <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>⭐ Nuevo usuario · 0 servicios</div>
                          <div style={{ fontSize:11, color:C.gray }}>{form.municipio || "Tu municipio"}, {form.provincia || "Provincia"}</div>
                        </div>
                        {isVerified && (
                          <div style={s.verifiedBadge}>✅ Verificado</div>
                        )}
                      </div>
                      <div style={s.previewPriv}>
                        <span style={{ color:"#EF4444", fontSize:11 }}>❌ Dirección exacta oculta hasta aceptar servicio</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 4: VERIFICACIÓN ── */}
                {n === 4 && (
                  <div style={s.fields}>
                    <div style={s.verifStatus}>
                      <VerifRow
                        icon="📱" label="Verificación por SMS"
                        done={smsVerif}
                        note={smsVerif ? "Teléfono confirmado" : "Confirma tu teléfono en la sección 1"}
                      />
                      <VerifRow
                        icon="📧" label="Confirmación de correo"
                        done={emailVerif}
                        note={emailVerif ? "Correo confirmado" : "Confirma tu correo en la sección 1"}
                      />
                      <VerifRow
                        icon="🛎️" label="3 servicios completados"
                        done={false}
                        note="Se completa automáticamente con el uso"
                      />
                    </div>

                    {/* Badge preview */}
                    <div style={{
                      ...s.badgePreview,
                      background: isVerified ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)" : "#F9FAFB",
                      borderColor: isVerified ? "#6EE7B7" : C.border,
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{isVerified ? "✅" : "🔓"}</div>
                      <div style={{ fontSize:14, fontWeight:800, color: isVerified ? "#065F46" : C.gray }}>
                        {isVerified ? "¡Usuario Verificado!" : "Usuario sin verificar"}
                      </div>
                      <div style={{ fontSize:11, color: isVerified ? "#047857" : C.grayLight, marginTop:4, textAlign:"center" }}>
                        {isVerified
                          ? "Los profesionales verán tu badge de confianza 🎉"
                          : "Confirma teléfono y correo para obtener tu badge"}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 5: TÉRMINOS ── */}
                {n === 5 && (
                  <div style={s.fields}>
                    {/* Acordeón de términos */}
                    <div style={s.termsList}>
                      {TERMS.map((t, i) => (
                        <div key={i} style={s.termItem}>
                          <button style={s.termHead} onClick={() => setTermExp(termExp===i ? null : i)}>
                            <span style={{ fontSize:13, fontWeight:700, color:C.black, flex:1, textAlign:"left" }}>{t.title}</span>
                            <span style={{ color:C.mamey, fontSize:18, transform: termExp===i?"rotate(90deg)":"rotate(0)", transition:"transform 0.2s" }}>›</span>
                          </button>
                          {termExp === i && (
                            <p style={s.termBody}>{t.body}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Checkboxes */}
                    {[
                      { k:"c1", icon:"✅", text:"Confirmo que toda mi información es real y verídica" },
                      { k:"c2", icon:"🔒", text:"Acepto la política de privacidad y protección de datos" },
                      { k:"c3", icon:"📋", text:"Acepto los Términos y Condiciones de Listo Patrón" },
                    ].map(({ k, icon, text }) => (
                      <div key={k} style={{
                        ...s.checkRow,
                        background:   checks[k] ? "#FFF3EC" : "#FAFAFA",
                        borderColor:  checks[k] ? "#F2600033" : C.border,
                      }} onClick={() => togCheck(k)} className="check-h">
                        <span style={{ fontSize:18 }}>{icon}</span>
                        <span style={{ flex:1, fontSize:13, fontWeight:600, color:C.black }}>{text}</span>
                        <div style={{
                          ...s.checkbox,
                          background:  checks[k] ? C.mamey : "white",
                          borderColor: checks[k] ? C.mamey : "#D1D5DB",
                        }}>
                          {checks[k] && <span style={{ color:"white", fontSize:12, fontWeight:800 }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        ))}

        {/* ── NOTA PRIVACIDAD ── */}
        <div style={s.privNote}>
          <span style={{ fontSize:20 }}>🔒</span>
          <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#065F46", lineHeight:1.6 }}>
            Tu información es <strong>100% privada</strong>. No compartimos tu cédula ni datos sensibles. Solo el profesional verá tu nombre y dirección aproximada al aceptar tu servicio.
          </p>
        </div>

        {/* ── BOTÓN CREAR CUENTA ── */}
        <div style={{ padding:"8px 16px 16px" }}>
          <button style={s.submitBtn} onClick={handleSubmit} className="sub-h">
            🎉  Crear mi cuenta
          </button>
          {(!checks.c1 || !checks.c2 || !checks.c3) && (
            <p style={{ textAlign:"center", fontSize:11, color:C.grayLight, marginTop:8 }}>
              Acepta los términos para continuar
            </p>
          )}
        </div>

        <div style={{ height:40 }} />
      </div>
    </div>
  );
}

/* ─── PANTALLA DE ÉXITO ──────────────────────────────────────── */
function SuccessScreen({ onBack, isVerified }) {
  return (
    <div style={{ ...s.page, justifyContent:"center", alignItems:"center", padding:32 }}>
      <style>{css}</style>
      <div style={s.successCard} className="success-pop">
        <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
        <div style={{ fontSize:22, fontWeight:800, color:C.black, marginBottom:6 }}>¡Cuenta creada!</div>
        <div style={{ fontSize:14, color:C.gray, textAlign:"center", lineHeight:1.6, marginBottom:20 }}>
          Bienvenido a Listo Patrón. Ya puedes solicitar servicios profesionales a domicilio.
        </div>
        {isVerified && (
          <div style={s.successBadge}>
            ✅ Usuario Verificado
          </div>
        )}
        <button style={{ ...s.submitBtn, marginTop:20 }} onClick={onBack}>
          Ir al inicio →
        </button>
      </div>
    </div>
  );
}

/* ─── HELPERS ────────────────────────────────────────────────── */
function Field({ label, req, opt, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</span>
        {req && <span style={{ fontSize:10, color:C.mamey, fontWeight:800 }}>*</span>}
        {opt && <span style={{ fontSize:9, fontWeight:600, color:"#9CA3AF", background:"#F3F4F6", padding:"1px 6px", borderRadius:99 }}>opcional</span>}
      </div>
      {children}
    </div>
  );
}

function VerifRow({ icon, label, done, note }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      padding:"12px 14px", borderRadius:12, marginBottom:6,
      background: done ? "#ECFDF5" : "#F9FAFB",
      border: `1.5px solid ${done ? "#A7F3D0" : C.border}`,
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.black }}>{label}</div>
        <div style={{ fontSize:11, color: done ? "#059669" : C.grayLight, marginTop:2 }}>{note}</div>
      </div>
      <div style={{
        width:24, height:24, borderRadius:"50%",
        background: done ? "#10B981" : C.border,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, color:"white", fontWeight:800,
        transition:"all 0.3s",
      }}>
        {done ? "✓" : "○"}
      </div>
    </div>
  );
}

/* ─── ESTILOS ────────────────────────────────────────────────── */
const s = {
  page:       { minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',system-ui,sans-serif", maxWidth:480, margin:"0 auto" },
  header:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"white", borderBottom:`1px solid #F3F4F6`, position:"sticky", top:0, zIndex:20, boxShadow:"0 1px 8px rgba(0,0,0,0.06)" },
  backBtn:    { width:36, height:36, borderRadius:10, border:"none", background:"#F3F4F6", fontSize:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.black },
  headerTitle:{ fontSize:17, fontWeight:800, color:C.black },
  scroll:     { flex:1, overflowY:"auto" },

  hero:       { background:`linear-gradient(135deg, ${C.mameyDark}, ${C.mamey} 55%, ${C.mameyLight})`, margin:"12px", borderRadius:20, padding:"20px 18px", position:"relative", overflow:"hidden" },
  heroOrb1:   { position:"absolute", right:-30, top:-30, width:110, height:110, background:"rgba(255,255,255,0.08)", borderRadius:"50%" },
  heroOrb2:   { position:"absolute", left:-20, bottom:-20, width:80, height:80, background:"rgba(255,255,255,0.06)", borderRadius:"50%" },
  heroRow:    { display:"flex", alignItems:"center", gap:14, marginBottom:14, position:"relative" },
  heroIconWrap:{ width:56, height:56, borderRadius:16, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  heroTitle:  { color:"white", fontSize:18, fontWeight:800, marginBottom:3 },
  heroSub:    { color:"rgba(255,255,255,0.8)", fontSize:12 },
  heroDiff:   { display:"flex", gap:8, position:"relative" },
  diffItem:   { display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.18)", color:"white", fontSize:11, fontWeight:700, padding:"5px 10px", borderRadius:99, border:"1px solid rgba(255,255,255,0.25)" },

  progressCard:{ background:"white", borderRadius:16, margin:"0 12px 12px", padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:`1px solid #F3F4F6` },
  progRow:    { display:"flex", justifyContent:"space-between", marginBottom:8 },
  progLabel:  { fontSize:12, fontWeight:700, color:C.gray },
  progPct:    { fontSize:12, fontWeight:700, color:C.mamey },
  progBg:     { height:6, background:"#F3F4F6", borderRadius:99, marginBottom:14, overflow:"hidden" },
  progFill:   { height:"100%", background:`linear-gradient(90deg,${C.mamey},${C.mameyLight})`, borderRadius:99, transition:"width 0.4s ease" },
  dots:       { display:"flex", alignItems:"center" },
  dot:        { width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, transition:"all 0.3s" },

  card:       { background:"white", borderRadius:18, margin:"0 12px 10px", border:"1.5px solid transparent", overflow:"hidden", transition:"all 0.3s" },
  cardHead:   { width:"100%", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, background:"none", border:"none", cursor:"pointer", textAlign:"left" },
  cardIcon:   { width:42, height:42, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  cardInfo:   { flex:1 },
  cardTitle:  { fontSize:14, fontWeight:800, color:C.black, marginBottom:2 },
  cardSub:    { fontSize:11, color:C.gray },
  chev:       { fontSize:22, lineHeight:1, transition:"transform 0.3s, color 0.3s" },
  cardBody:   { padding:"4px 16px 16px" },

  fields:     { display:"flex", flexDirection:"column" },
  row:        { display:"flex", gap:10 },
  inp:        { width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:13, color:C.black, background:C.offWhite, outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"all 0.2s", appearance:"none" },

  infoTip:    { display:"flex", gap:8, alignItems:"flex-start", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"9px 12px", marginBottom:10, fontSize:12, color:"#92400E", fontWeight:500 },

  inlineBtn:  { position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:C.mamey, color:"white", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" },
  verifiedTag:{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"#ECFDF5", color:"#059669", border:"1px solid #A7F3D0", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700 },
  smsBox:     { background:"#F5F3FF", border:"1px solid #DDD6FE", borderRadius:12, padding:"12px", marginBottom:10, marginTop:-4 },
  smsLabel:   { fontSize:12, fontWeight:600, color:"#5B21B6", marginBottom:8 },
  confirmBtn: { background:"#8B5CF6", color:"white", border:"none", borderRadius:10, padding:"10px 14px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },

  avatarArea: { display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0 4px" },
  avatarCircle:{ width:90, height:90, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:`3px dashed ${C.border}`, fontSize:36 },

  previewCard:{ background:"#F9FAFB", border:`1.5px solid ${C.border}`, borderRadius:14, padding:"12px 14px", marginTop:10 },
  previewTitle:{ fontSize:11, fontWeight:800, color:C.gray, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:10 },
  previewRow: { display:"flex", alignItems:"center", gap:10, marginBottom:8 },
  previewAvatar:{ width:42, height:42, borderRadius:"50%", background:"#E5E7EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 },
  previewPriv:{ borderTop:`1px solid ${C.border}`, paddingTop:8, marginTop:4 },
  verifiedBadge:{ background:"#ECFDF5", color:"#059669", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:99, border:"1px solid #A7F3D0" },

  verifStatus:{ display:"flex", flexDirection:"column", marginBottom:12 },
  badgePreview:{ border:"1.5px solid", borderRadius:14, padding:"16px", textAlign:"center", transition:"all 0.4s" },

  termsList:  { background:"white", border:`1.5px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:12 },
  termItem:   { borderBottom:`1px solid #F3F4F6` },
  termHead:   { width:"100%", display:"flex", alignItems:"center", gap:10, padding:"13px 14px", background:"none", border:"none", cursor:"pointer" },
  termBody:   { padding:"0 14px 12px", fontSize:12, color:C.gray, lineHeight:1.7, background:"#FFF8F3", borderTop:`1px solid rgba(242,96,0,0.08)` },

  checkRow:   { display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:6, border:"1.5px solid", cursor:"pointer", transition:"all 0.2s" },
  checkbox:   { width:22, height:22, borderRadius:7, border:"2px solid", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" },

  privNote:   { background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:14, padding:"12px 14px", margin:"0 12px 10px", display:"flex", gap:10, alignItems:"flex-start" },

  submitBtn:  { width:"100%", padding:"16px", background:`linear-gradient(135deg,${C.mamey},${C.mameyDark})`, color:"white", border:"none", borderRadius:16, fontSize:16, fontWeight:800, cursor:"pointer", transition:"all 0.3s", boxShadow:`0 6px 24px rgba(242,96,0,0.4)`, letterSpacing:"0.2px" },

  successCard:{ background:"white", borderRadius:24, padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.1)", width:"100%", maxWidth:360 },
  successBadge:{ background:"#ECFDF5", color:"#059669", fontSize:14, fontWeight:800, padding:"8px 20px", borderRadius:99, border:"1px solid #A7F3D0" },

  btnFile:    { background:"#FFF3EC", color:C.mamey, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" },
  btnCam:     { background:"#F3F4F6", color:C.gray,  border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" },
};

const css = `
  * { box-sizing: border-box; }
  input:focus, select:focus { border-color: #F26000 !important; background: white !important; box-shadow: 0 0 0 3px rgba(242,96,0,0.1) !important; }
  input::placeholder { color: #C4C9D0; }
  .body-anim  { animation: slideDown 0.2s ease; }
  .card-anim  { transition: box-shadow 0.3s, border-color 0.3s; }
  .success-pop{ animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .sub-h:hover  { transform: translateY(-2px); filter: brightness(1.08); }
  .sub-h:active { transform: translateY(0); }
  .btn-h:hover  { filter: brightness(0.92); transform: scale(0.97); }
  .check-h:active { transform: scale(0.98); }
  @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn     { from { opacity:0; transform:scale(0.8);       } to { opacity:1; transform:scale(1);   } }
`;