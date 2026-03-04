import { useState } from "react";

const COLORS = {
  mamey: "#F26000",
  mameyDark: "#C24E00",
  mameyLight: "#FF8534",
  mameyBg: "#FFF3EC",
  black: "#1A1A1A",
  gray: "#6B7280",
  offWhite: "#FAF8F6",
};

const sections = [
  { n: 1, icon: "👤", color: "#F26000", bg: "#FFF3EC", title: "Información Personal", sub: "Datos como aparecen en tu cédula" },
  { n: 2, icon: "🪪", color: "#3B82F6", bg: "#EFF6FF", title: "Documentos Obligatorios", sub: "Cédula · Selfie · Buena conducta" },
  { n: 3, icon: "🏠", color: "#10B981", bg: "#ECFDF5", title: "Dirección Completa", sub: "Donde resides actualmente" },
  { n: 4, icon: "📞", color: "#F59E0B", bg: "#FFFBEB", title: "Información de Contacto", sub: "Teléfono y correo electrónico" },
  { n: 5, icon: "💼", color: "#8B5CF6", bg: "#F5F3FF", title: "Información Laboral", sub: "Especialidad y experiencia" },
  { n: 6, icon: "📋", color: "#EC4899", bg: "#FDF2F8", title: "Aceptación de Términos", sub: "Confirma y acepta las condiciones" },
];

export default function VerificacionPage({ onBack }) {
  const [openSections, setOpenSections] = useState({ 1: true });
  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nombre: "", cedula: "", fechaNacimiento: "", nacionalidad: "", estadoCivil: "",
    provincia: "", municipio: "", sector: "", direccion: "", referencia: "",
    telefono: "", telefonoAlt: "", correo: "",
    especialidad: "", experiencia: "", certificaciones: "",
  });

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleSection = (n) => setOpenSections((p) => ({ ...p, [n]: !p[n] }));
  const toggleCheck = (key) => setChecks((p) => ({ ...p, [key]: !p[key] }));

  const completedSections = Object.keys(openSections).filter(k => openSections[k]).length;
  const progress = Math.round((completedSections / 6) * 100);

  const handleSubmit = () => {
    if (!checks.c1 || !checks.c2 || !checks.c3) {
      alert("Por favor acepta todos los términos antes de enviar.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>‹</button>
        <span style={styles.headerTitle}>Verificación Profesional</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>

        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <span style={{ fontSize: 32 }}>🛡️</span>
            </div>
            <div>
              <div style={styles.heroTitle}>Verifica tu identidad</div>
              <div style={styles.heroSub}>Información 100% privada · Solo equipo ListoPatrón</div>
            </div>
          </div>
          <div style={styles.heroBadges}>
            {["🛡️ Verificado", "📄 Validado", "✔️ Premium"].map((b, i) => (
              <div key={i} style={styles.heroBadge}>{b}</div>
            ))}
          </div>
        </div>

        {/* PROGRESS */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Progreso del formulario</span>
            <span style={styles.progressPct}>{completedSections}/6 secciones</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
          </div>
          <div style={styles.stepDots}>
            {sections.map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 5 ? 1 : "none" }}>
                <div style={{
                  ...styles.stepDot,
                  background: openSections[s.n] ? s.color : "#E5E7EB",
                  color: openSections[s.n] ? "white" : "#9CA3AF",
                  boxShadow: openSections[s.n] ? `0 2px 10px ${s.color}55` : "none",
                }}>
                  {openSections[s.n] ? "✓" : s.n}
                </div>
                {i < 5 && <div style={{ flex: 1, height: 2, background: openSections[s.n + 1] ? "#F26000" : "#E5E7EB", transition: "background 0.3s" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* SECTIONS */}
        {sections.map(({ n, icon, color, bg, title, sub }) => (
          <div key={n} className="verif-card" style={{
            ...styles.card,
            borderColor: openSections[n] ? color + "33" : "transparent",
            boxShadow: openSections[n] ? `0 4px 24px ${color}18` : "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <button style={styles.cardHeader} onClick={() => toggleSection(n)}>
              <div style={{ ...styles.cardIcon, background: bg }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
              </div>
              <div style={styles.cardInfo}>
                <div style={styles.cardTitle}>{title}</div>
                <div style={styles.cardSub}>{sub}</div>
              </div>
              {openSections[n] && (
                <div style={{ ...styles.statusDot, background: color }}>
                  <span style={{ fontSize: 10 }}>●</span>
                </div>
              )}
              <div style={{
                ...styles.chevron,
                transform: openSections[n] ? "rotate(90deg)" : "rotate(0deg)",
                color: openSections[n] ? color : "#9CA3AF",
              }}>›</div>
            </button>

            {openSections[n] && (
              <div style={styles.cardBody} className="section-body-anim">

                {/* SECCIÓN 1 */}
                {n === 1 && (
                  <div style={styles.fieldsWrap}>
                    <Field label="Nombre completo" req>
                      <input style={styles.input} name="nombre" value={form.nombre} onChange={handleForm} placeholder="Como aparece en tu cédula" />
                    </Field>
                    <div style={styles.fieldRow}>
                      <Field label="Nº Cédula" req>
                        <input style={styles.input} name="cedula" value={form.cedula} onChange={handleForm} placeholder="000-0000000-0" />
                      </Field>
                      <Field label="Fecha nacimiento" req>
                        <input style={styles.input} type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleForm} />
                      </Field>
                    </div>
                    <div style={styles.fieldRow}>
                      <Field label="Nacionalidad" req>
                        <select style={styles.input} name="nacionalidad" value={form.nacionalidad} onChange={handleForm}>
                          <option value="">Seleccionar</option>
                          <option>Dominicana</option>
                          <option>Haitiana</option>
                          <option>Venezolana</option>
                          <option>Otra</option>
                        </select>
                      </Field>
                      <Field label="Estado civil" opt>
                        <select style={styles.input} name="estadoCivil" value={form.estadoCivil} onChange={handleForm}>
                          <option value="">Seleccionar</option>
                          <option>Soltero/a</option>
                          <option>Casado/a</option>
                          <option>Divorciado/a</option>
                          <option>Viudo/a</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* SECCIÓN 2 */}
                {n === 2 && (
                  <div style={styles.fieldsWrap}>
                    {[
                      { label: "Cédula frontal", icon: "📸", hint: "JPG, PNG · máx 5MB" },
                      { label: "Cédula trasera", icon: "📸", hint: "JPG, PNG · máx 5MB" },
                      { label: "Selfie con cédula", icon: "🤳", hint: "Foto nítida sosteniendo cédula" },
                      { label: "Buena conducta", icon: "📜", hint: "PDF o imagen · máx 5MB" },
                    ].map((doc, i) => (
                      <div key={i} style={styles.uploadCard}>
                        <div style={styles.uploadLeft}>
                          <div style={styles.uploadEmoji}>{doc.icon}</div>
                          <div>
                            <div style={styles.uploadLabel}>{doc.label}</div>
                            <div style={styles.uploadHint}>{doc.hint}</div>
                          </div>
                        </div>
                        <div style={styles.uploadRight}>
                          <button style={styles.btnFile} className="btn-hover">📁 Archivo</button>
                          <button style={styles.btnCam} className="btn-hover">📷 Foto</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECCIÓN 3 */}
                {n === 3 && (
                  <div style={styles.fieldsWrap}>
                    <div style={styles.fieldRow}>
                      <Field label="Provincia" req>
                        <select style={styles.input} name="provincia" value={form.provincia} onChange={handleForm}>
                          <option value="">Seleccionar</option>
                          <option>Distrito Nacional</option>
                          <option>Santiago</option>
                          <option>La Vega</option>
                          <option>San Pedro</option>
                          <option>Otra</option>
                        </select>
                      </Field>
                      <Field label="Municipio" req>
                        <input style={styles.input} name="municipio" value={form.municipio} onChange={handleForm} placeholder="Municipio" />
                      </Field>
                    </div>
                    <Field label="Sector" req>
                      <input style={styles.input} name="sector" value={form.sector} onChange={handleForm} placeholder="Ej: Los Mameyes" />
                    </Field>
                    <Field label="Dirección exacta" req>
                      <input style={styles.input} name="direccion" value={form.direccion} onChange={handleForm} placeholder="Calle, número, edificio..." />
                    </Field>
                    <Field label="Punto de referencia" opt>
                      <input style={styles.input} name="referencia" value={form.referencia} onChange={handleForm} placeholder="Cerca de, frente a..." />
                    </Field>
                  </div>
                )}

                {/* SECCIÓN 4 */}
                {n === 4 && (
                  <div style={styles.fieldsWrap}>
                    <Field label="Teléfono principal" req>
                      <input style={styles.input} type="tel" name="telefono" value={form.telefono} onChange={handleForm} placeholder="+1 (809) 000-0000" />
                    </Field>
                    <Field label="Teléfono alternativo" opt>
                      <input style={styles.input} type="tel" name="telefonoAlt" value={form.telefonoAlt} onChange={handleForm} placeholder="+1 (829) 000-0000" />
                    </Field>
                    <Field label="Correo electrónico" req>
                      <input style={styles.input} type="email" name="correo" value={form.correo} onChange={handleForm} placeholder="tu@correo.com" />
                    </Field>
                  </div>
                )}

                {/* SECCIÓN 5 */}
                {n === 5 && (
                  <div style={styles.fieldsWrap}>
                    <Field label="Especialidad" req>
                      <select style={styles.input} name="especialidad" value={form.especialidad} onChange={handleForm}>
                        <option value="">Seleccionar especialidad</option>
                        <option>Electricista</option>
                        <option>Plomero</option>
                        <option>Pintor</option>
                        <option>Carpintero</option>
                        <option>Técnico A/C</option>
                        <option>Limpieza</option>
                        <option>Jardinería</option>
                        <option>Otro</option>
                      </select>
                    </Field>
                    <Field label="Años de experiencia" req>
                      <select style={styles.input} name="experiencia" value={form.experiencia} onChange={handleForm}>
                        <option value="">Seleccionar</option>
                        <option>Menos de 1 año</option>
                        <option>1 - 3 años</option>
                        <option>3 - 5 años</option>
                        <option>5 - 10 años</option>
                        <option>Más de 10 años</option>
                      </select>
                    </Field>
                    <Field label="Certificaciones" opt>
                      <input style={styles.input} name="certificaciones" value={form.certificaciones} onChange={handleForm} placeholder="Ej: Certificado CONAFOR" />
                    </Field>
                    <div style={styles.uploadPortfolio}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.black, marginBottom: 2 }}>Portafolio de trabajos</div>
                      <div style={{ fontSize: 11, color: COLORS.gray, marginBottom: 10 }}>Hasta 5 fotos · JPG o PNG</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={styles.btnFile} className="btn-hover">📁 Subir fotos</button>
                        <button style={styles.btnCam} className="btn-hover">📷 Tomar foto</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECCIÓN 6 */}
                {n === 6 && (
                  <div style={styles.fieldsWrap}>
                    {[
                      { key: "c1", icon: "✅", text: "Confirmo que toda la información es real y verídica" },
                      { key: "c2", icon: "🔍", text: "Acepto la revisión de mis antecedentes por ListoPatrón" },
                      { key: "c3", icon: "📋", text: "Acepto los Términos y Condiciones de la plataforma" },
                    ].map(({ key, icon, text }) => (
                      <div key={key} style={{
                        ...styles.checkRow,
                        background: checks[key] ? "#FFF3EC" : "#FAFAFA",
                        borderColor: checks[key] ? "#F2600033" : "#E5E7EB",
                      }} onClick={() => toggleCheck(key)} className="check-hover">
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: COLORS.black }}>{text}</span>
                        <div style={{
                          ...styles.checkbox,
                          background: checks[key] ? COLORS.mamey : "white",
                          borderColor: checks[key] ? COLORS.mamey : "#D1D5DB",
                        }}>
                          {checks[key] && <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        ))}

        {/* PRIVACY NOTE */}
        <div style={styles.privacyNote}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#065F46", lineHeight: 1.6, margin: 0 }}>
            Tu información es <strong>100% privada</strong>. No será visible públicamente ni para otros profesionales. Solo el departamento administrativo de ListoPatrón tiene acceso.
          </p>
        </div>

        {/* INSIGNIAS */}
        <div style={styles.badgesCard}>
          <div style={styles.badgesTitle}>🛡️ Insignias que obtendrás</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "🛡️", label: "Profesional Verificado", color: "#F26000" },
              { icon: "📄", label: "Documentación Validada", color: "#3B82F6" },
              { icon: "✔️", label: "Antecedentes Revisados", color: "#10B981" },
            ].map((b, i) => (
              <div key={i} style={{ ...styles.badge, borderColor: b.color + "33", color: b.color }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* NIVELES */}
        <div style={styles.levelsCard}>
          <div style={styles.levelsTitle}>⭐ Niveles de verificación</div>
          {[
            { n: 1, label: "Identidad Verificada",   badge: "Básico",    color: "#FF6B35", bg: "rgba(255,107,53,0.15)" },
            { n: 2, label: "Antecedentes Aprobados", badge: "Confiable", color: "#34D399", bg: "rgba(52,211,153,0.15)" },
            { n: 3, label: "Profesional Premium",    badge: "Premium ⭐", color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
          ].map((l) => (
            <div key={l.n} style={styles.levelRow}>
              <div style={{ ...styles.levelNum, background: l.bg, color: l.color }}>{l.n}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{l.label}</div>
              <div style={{ ...styles.levelBadge, background: l.bg, color: l.color }}>{l.badge}</div>
            </div>
          ))}
        </div>

        {/* ESTADOS */}
        <div style={styles.statusSection}>
          <div style={styles.statusTitle}>Estados del proceso</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ ...styles.statusPill, background: "#FFFBEB", color: "#92400E", border: "1.5px solid #FDE68A" }}>🟡 En revisión</div>
            <div style={{ ...styles.statusPill, background: "#DCFCE7", color: "#166534", border: "1.5px solid #BBF7D0" }}>🟢 Verificado</div>
            <div style={{ ...styles.statusPill, background: "#FEF2F2", color: "#991B1B", border: "1.5px solid #FECACA" }}>🔴 Rechazado</div>
          </div>
        </div>

        {/* BOTÓN ENVIAR */}
        <div style={{ padding: "8px 16px 16px" }}>
          <button
            style={{
              ...styles.submitBtn,
              background: submitted
                ? "linear-gradient(135deg, #22C55E, #16A34A)"
                : "linear-gradient(135deg, #F26000, #C24E00)",
              boxShadow: submitted
                ? "0 6px 24px rgba(34,197,94,0.4)"
                : "0 6px 24px rgba(242,96,0,0.4)",
            }}
            onClick={handleSubmit}
            className="submit-hover"
          >
            {submitted ? "✅  ¡Enviado! En revisión" : "🚀  Enviar para Verificación"}
          </button>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

function Field({ label, req, opt, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
        {req && <span style={{ fontSize: 10, color: "#F26000", fontWeight: 800 }}>*</span>}
        {opt && <span style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", padding: "1px 6px", borderRadius: 99 }}>opcional</span>}
      </div>
      {children}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#FAF8F6",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px",
    background: "white",
    borderBottom: "1px solid #F3F4F6",
    position: "sticky", top: 0, zIndex: 20,
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, border: "none",
    background: "#F3F4F6", fontSize: 24, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#1A1A1A", lineHeight: 1,
  },
  headerTitle: {
    fontSize: 17, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.3px",
  },
  scroll: { flex: 1, overflowY: "auto" },
  hero: {
    background: "linear-gradient(135deg, #C24E00 0%, #F26000 50%, #FF8534 100%)",
    margin: "12px",
    borderRadius: 20,
    padding: "20px 18px",
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute", right: -30, top: -30,
    width: 120, height: 120,
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
  },
  heroContent: {
    display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
    position: "relative",
  },
  heroIcon: {
    width: 56, height: 56, borderRadius: 16,
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: { color: "white", fontSize: 18, fontWeight: 800, marginBottom: 3 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 },
  heroBadges: { display: "flex", gap: 6, position: "relative" },
  heroBadge: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    fontSize: 11, fontWeight: 700,
    padding: "4px 10px", borderRadius: 99,
    border: "1px solid rgba(255,255,255,0.3)",
  },
  progressCard: {
    background: "white", borderRadius: 16, margin: "0 12px 12px",
    padding: "14px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    border: "1px solid #F3F4F6",
  },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: 700, color: "#6B7280" },
  progressPct: { fontSize: 12, fontWeight: 700, color: COLORS.mamey },
  progressBarBg: { height: 6, background: "#F3F4F6", borderRadius: 99, marginBottom: 14, overflow: "hidden" },
  progressBarFill: { height: "100%", background: `linear-gradient(90deg, ${COLORS.mamey}, ${COLORS.mameyLight})`, borderRadius: 99, transition: "width 0.4s ease" },
  stepDots: { display: "flex", alignItems: "center" },
  stepDot: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, flexShrink: 0,
    transition: "all 0.3s",
  },
  card: {
    background: "white", borderRadius: 18, margin: "0 12px 10px",
    border: "1.5px solid transparent",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  cardHeader: {
    width: "100%", padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 12,
    background: "none", border: "none", cursor: "pointer",
    textAlign: "left",
  },
  cardIcon: {
    width: 42, height: 42, borderRadius: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 800, color: "#1A1A1A", marginBottom: 2 },
  cardSub: { fontSize: 11, color: "#6B7280" },
  statusDot: {
    width: 8, height: 8, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 0,
  },
  chevron: {
    fontSize: 22, lineHeight: 1, transition: "transform 0.3s, color 0.3s",
  },
  cardBody: { padding: "4px 16px 16px" },
  fieldsWrap: { display: "flex", flexDirection: "column" },
  fieldRow: { display: "flex", gap: 10 },
  input: {
    width: "100%", padding: "10px 13px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 11, fontSize: 13, color: "#1A1A1A",
    background: "#FAFAFA", outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.2s",
    appearance: "none",
  },
  uploadCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#FAFAFA", border: "1.5px solid #E5E7EB",
    borderRadius: 12, padding: "12px 14px", marginBottom: 8,
    gap: 12,
  },
  uploadLeft: { display: "flex", alignItems: "center", gap: 10 },
  uploadEmoji: { fontSize: 22, flexShrink: 0 },
  uploadLabel: { fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 2 },
  uploadHint: { fontSize: 10, color: "#6B7280" },
  uploadRight: { display: "flex", gap: 6, flexShrink: 0 },
  uploadPortfolio: {
    background: "#FAFAFA", border: "2px dashed #E5E7EB",
    borderRadius: 12, padding: "16px", textAlign: "center",
    marginTop: 4,
  },
  btnFile: {
    background: "#FFF3EC", color: COLORS.mamey,
    border: "none", borderRadius: 8,
    padding: "7px 10px", fontSize: 11, fontWeight: 700,
    cursor: "pointer", transition: "all 0.2s",
  },
  btnCam: {
    background: "#F3F4F6", color: "#6B7280",
    border: "none", borderRadius: 8,
    padding: "7px 10px", fontSize: 11, fontWeight: 700,
    cursor: "pointer", transition: "all 0.2s",
  },
  checkRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px", borderRadius: 12, marginBottom: 6,
    border: "1.5px solid", cursor: "pointer",
    transition: "all 0.2s",
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    border: "2px solid", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  privacyNote: {
    background: "#ECFDF5", border: "1px solid #A7F3D0",
    borderRadius: 14, padding: "12px 14px",
    margin: "0 12px 10px",
    display: "flex", gap: 10, alignItems: "flex-start",
  },
  badgesCard: {
    background: "white", borderRadius: 16, margin: "0 12px 10px",
    padding: "14px 16px",
    border: "1.5px solid rgba(242,96,0,0.1)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },
  badgesTitle: { fontSize: 12, fontWeight: 800, color: "#6B7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.4px" },
  badge: {
    padding: "6px 12px", borderRadius: 99,
    fontSize: 11, fontWeight: 700,
    background: "white", border: "1.5px solid",
  },
  levelsCard: {
    background: "linear-gradient(135deg, #111827, #1F2937)",
    borderRadius: 18, margin: "0 12px 10px", padding: "16px",
  },
  levelsTitle: { color: "white", fontSize: 14, fontWeight: 800, marginBottom: 12 },
  levelRow: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.06)", borderRadius: 12,
    padding: "10px 12px", marginBottom: 6,
    border: "1px solid rgba(255,255,255,0.07)",
  },
  levelNum: {
    width: 28, height: 28, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 800, flexShrink: 0,
  },
  levelBadge: {
    fontSize: 10, fontWeight: 700,
    padding: "3px 9px", borderRadius: 99,
  },
  statusSection: { padding: "0 12px 10px" },
  statusTitle: { fontSize: 11, fontWeight: 800, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" },
  statusPill: { padding: "6px 13px", borderRadius: 99, fontSize: 11, fontWeight: 700 },
  submitBtn: {
    width: "100%", padding: "16px",
    color: "white", border: "none", borderRadius: 16,
    fontSize: 16, fontWeight: 800, cursor: "pointer",
    transition: "all 0.3s", letterSpacing: "0.2px",
  },
};

const css = `
  * { box-sizing: border-box; }
  input:focus, select:focus { border-color: #F26000 !important; background: white !important; box-shadow: 0 0 0 3px rgba(242,96,0,0.1) !important; }
  input::placeholder { color: #C4C9D0; }
  .section-body-anim { animation: slideDown 0.2s ease; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .submit-hover:hover { transform: translateY(-2px); filter: brightness(1.08); }
  .submit-hover:active { transform: translateY(0); }
  .btn-hover:hover { filter: brightness(0.92); transform: scale(0.97); }
  .check-hover:active { transform: scale(0.98); }
  .verif-card { transition: box-shadow 0.3s, border-color 0.3s; }
`;