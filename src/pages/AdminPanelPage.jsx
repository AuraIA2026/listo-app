import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import './AdminPanelPage.css';

export default function AdminPanelPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [credits, setCredits] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [transfers, setTransfers] = useState([]);

  const PLANS = {
    basico: { name: 'Plan Básico', contracts: 3, bonusContracts: 0, price: 0 },
    standard: { name: 'Plan Estándar', contracts: 3, bonusContracts: 0, price: 500 },
    gold: { name: 'Pack Gold', contracts: 8, bonusContracts: 0, price: 1000 },
    platinum: { name: 'Pack Platinum', contracts: 12, bonusContracts: 0, price: 1500 },
    vip: { name: 'VIP Ilimitado', contracts: Infinity, bonusContracts: 0, price: 2500 },
  };

  // Verificar si es admin
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (userId && userRole === 'admin') {
      setAdminUser(userId);
    } else {
      // Redirigir si no es admin
      window.location.href = '/';
    }
  }, []);

  // Cargar profesionales
  useEffect(() => {
    if (!adminUser) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('type', '==', 'pro'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const professionalsData = await Promise.all(
          snapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            
            // Obtener suscripción actual
            const subscriptionRef = doc(db, 'users', userDoc.id, 'subscription', 'current');
            const subscriptionSnap = await getDoc(subscriptionRef);
            const subscription = subscriptionSnap.data() || {};

            return {
              id: userDoc.id,
              ...userData,
              subscription,
            };
          })
        );

        setProfessionals(professionalsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading professionals:', error);
      setLoading(false);
    }
  }, [adminUser]);

  // Cargar transferencias
  useEffect(() => {
    if (!adminUser) return;

    try {
      const purchasesRef = collection(db, 'plan_purchases');
      const q = query(
        purchasesRef,
        where('paymentMethod', '==', 'transfer'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transfersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransfers(transfersData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  }, [adminUser]);

  // Aprobar transferencia y activar plan
  const approveTransfer = async (transfer) => {
    if (!window.confirm(`¿Aprobar transferencia de ${transfer.depositorName} por el Plan ${transfer.planName}?`)) return;
    
    try {
      // 1. Actualizar estado de la compra a aprobado
      await updateDoc(doc(db, 'plan_purchases', transfer.id), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: adminUser
      });

      // 2. Buscar el usuario por email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', transfer.email.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const professionalId = userDoc.id;
        const planKey = transfer.planId;
        const plan = PLANS[planKey] || { name: transfer.planName, contracts: 3, bonusContracts: 0, price: 0 };
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
        const totalContracts = plan.contracts + plan.bonusContracts;

        // Actualizar subcolección subscription
        const subscriptionRef = doc(db, 'users', professionalId, 'subscription', 'current');
        await updateDoc(subscriptionRef, {
          plan: planKey,
          planName: plan.name,
          totalContracts: totalContracts,
          usedContracts: 0,
          availableContracts: totalContracts,
          price: plan.price,
          createdAt: now,
          expiresAt: expiresAt,
          isActive: true,
        }).catch(async () => {
          // Si no existe, crear
          await updateDoc(doc(db, 'users', professionalId), {
            subscription: {
              plan: planKey,
              planName: plan.name,
              totalContracts: totalContracts,
              usedContracts: 0,
              availableContracts: totalContracts,
              price: plan.price,
              createdAt: now,
              expiresAt: expiresAt,
              isActive: true,
            },
          });
        });

        // Actualizar campos del documento principal para compatibilidad total
        await updateDoc(doc(db, 'users', professionalId), {
          plan: planKey,
          planStatus: 'active',
          contracts: totalContracts === Infinity ? 9999 : totalContracts,
          planExpirationDate: expiresAt.toISOString(),
          available: true
        });

        // Registrar en historial
        await addDoc(collection(db, 'users', professionalId, 'planHistory'), {
          plan: planKey,
          planName: plan.name,
          totalContracts: totalContracts,
          price: plan.price,
          assignedBy: adminUser,
          assignedAt: now,
          reason: 'transfer_payment_approved',
          purchaseId: transfer.id
        });

        // Crear notificación de éxito para el usuario
        await addDoc(collection(db, 'notificaciones'), {
          userId: professionalId,
          type: 'plan_activated_transfer',
          title: '💎 ¡Transferencia Aprobada!',
          text: `Tu pago de transferencia para el plan ${plan.name} ha sido aprobado. Tu plan ya está activo por 30 días.`,
          read: false,
          createdAt: now
        });

        alert("Transferencia aprobada y plan activado correctamente.");
      } else {
        alert("Transferencia aprobada en registros, pero el correo no está registrado en la app. Deberá activarse manualmente cuando se registre.");
      }
    } catch (error) {
      console.error("Error al aprobar transferencia:", error);
      alert("Error al aprobar la transferencia.");
    }
  };

  // Rechazar transferencia
  const rejectTransfer = async (transfer) => {
    const reason = window.prompt("Introduce el motivo del rechazo:");
    if (reason === null) return;
    
    try {
      await updateDoc(doc(db, 'plan_purchases', transfer.id), {
        status: 'rejected',
        rejectedReason: reason,
        rejectedAt: new Date(),
        rejectedBy: adminUser
      });

      // Crear notificación para el usuario si existe
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', transfer.email.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const professionalId = snap.docs[0].id;
        await addDoc(collection(db, 'notificaciones'), {
          userId: professionalId,
          type: 'plan_rejected_transfer',
          title: '❌ Transferencia Rechazada',
          text: `Tu notificación de transferencia para el plan ${transfer.planName} ha sido rechazada. Motivo: ${reason || 'Comprobante no válido'}.`,
          read: false,
          createdAt: new Date()
        });
      }

      alert("Transferencia rechazada.");
    } catch (error) {
      console.error("Error al rechazar transferencia:", error);
      alert("Error al rechazar la transferencia.");
    }
  };

  // Asignar plan a profesional
  const assignPlan = async (professionalId, planKey) => {
    try {
      const plan = PLANS[planKey];
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días

      const subscriptionRef = doc(db, 'users', professionalId, 'subscription', 'current');
      
      await updateDoc(subscriptionRef, {
        plan: planKey,
        planName: plan.name,
        totalContracts: plan.contracts + plan.bonusContracts,
        usedContracts: 0,
        availableContracts: plan.contracts + plan.bonusContracts,
        price: plan.price,
        createdAt: now,
        expiresAt: expiresAt,
        isActive: true,
      }).catch(async () => {
        // Si no existe, crear el documento
        await updateDoc(doc(db, 'users', professionalId), {
          subscription: {
            plan: planKey,
            planName: plan.name,
            totalContracts: plan.contracts + plan.bonusContracts,
            usedContracts: 0,
            availableContracts: plan.contracts + plan.bonusContracts,
            price: plan.price,
            createdAt: now,
            expiresAt: expiresAt,
            isActive: true,
          },
        });
      });

      // Registrar en historial
      await addDoc(collection(db, 'users', professionalId, 'planHistory'), {
        plan: planKey,
        planName: plan.name,
        totalContracts: plan.contracts + plan.bonusContracts,
        price: plan.price,
        assignedBy: adminUser,
        assignedAt: now,
        reason: 'plan_assignment',
      });

      alert(`Plan ${plan.name} asignado correctamente`);
    } catch (error) {
      console.error('Error assigning plan:', error);
      alert('Error al asignar el plan');
    }
  };

  // Agregar créditos manuales
  const addCreditsManually = async () => {
    if (!selectedProfessional || !credits || !creditReason) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const creditsAmount = parseInt(credits);
      const professionalRef = doc(db, 'users', selectedProfessional.id);

      // Actualizar contratos disponibles
      await updateDoc(professionalRef, {
        'subscription.availableContracts': (selectedProfessional.subscription?.availableContracts || 0) + creditsAmount,
      });

      // Registrar en historial
      await addDoc(collection(db, 'users', selectedProfessional.id, 'creditsHistory'), {
        amount: creditsAmount,
        reason: creditReason,
        type: 'manual_addition',
        addedBy: adminUser,
        addedAt: new Date(),
      });

      alert(`${creditsAmount} contratos agregados correctamente`);
      setCredits('');
      setCreditReason('');
      setSelectedProfessional(null);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Error al agregar los créditos');
    }
  };

  // Calcular estadísticas
  const stats = {
    totalProfessionals: professionals.length,
    activePlans: professionals.filter(p => p.subscription?.isActive).length,
    totalContracts: professionals.reduce((sum, p) => sum + (p.subscription?.totalContracts || 0), 0),
    usedContracts: professionals.reduce((sum, p) => sum + (p.subscription?.usedContracts || 0), 0),
  };

  if (loading) {
    return (
      <div className="admin-panel loading">
        <div className="spinner"></div>
        <p>Cargando datos del administrador...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Centro de Control Admin</h1>
        <span className="admin-badge">Administrador</span>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'professionals' ? 'active' : ''}`}
          onClick={() => setActiveTab('professionals')}
        >
          👨‍💼 Profesionales
        </button>
        <button
          className={`tab-btn ${activeTab === 'credits' ? 'active' : ''}`}
          onClick={() => setActiveTab('credits')}
        >
          💳 Gestionar Créditos
        </button>
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          📦 Planes
        </button>
        <button
          className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          🏦 Transferencias
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-info">
                <span className="stat-label">Profesionales</span>
                <span className="stat-value">{stats.totalProfessionals}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-label">Planes Activos</span>
                <span className="stat-value">{stats.activePlans}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-label">Contratos Totales</span>
                <span className="stat-value">{stats.totalContracts}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <span className="stat-label">Utilizados</span>
                <span className="stat-value">{stats.usedContracts}</span>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Profesionales Recientes</h3>
            <div className="professionals-preview">
              {professionals.slice(0, 5).map(prof => (
                <div key={prof.id} className="prof-preview-card">
                  <div className="prof-avatar">{prof.name?.charAt(0) || '?'}</div>
                  <div className="prof-info">
                    <p className="prof-name">{prof.name}</p>
                    <p className="prof-plan">
                      {prof.subscription?.planName || 'Sin plan'}
                    </p>
                  </div>
                  <div className="prof-status">
                    {prof.subscription?.isActive ? (
                      <span className="status-active">Activo</span>
                    ) : (
                      <span className="status-inactive">Inactivo</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professionals Tab */}
      {activeTab === 'professionals' && (
        <div className="tab-content">
          <div className="professionals-list">
            {professionals.map(prof => (
              <div key={prof.id} className="professional-card">
                <div className="prof-header">
                  <div className="prof-avatar-large">{prof.name?.charAt(0) || '?'}</div>
                  <div className="prof-details">
                    <h4>{prof.name}</h4>
                    <p>{prof.email}</p>
                    <p className="prof-phone">📱 {prof.phone}</p>
                  </div>
                  {prof.subscription?.isActive ? (
                    <span className="status-badge active">✓ Activo</span>
                  ) : (
                    <span className="status-badge inactive">✗ Inactivo</span>
                  )}
                </div>

                <div className="prof-subscription">
                  <div className="subscription-info">
                    <p>
                      <strong>Plan Actual:</strong> {prof.subscription?.planName || 'Sin plan'}
                    </p>
                    <p>
                      <strong>Contratos:</strong> {prof.subscription?.usedContracts || 0} / {prof.subscription?.totalContracts === Infinity ? '∞' : prof.subscription?.totalContracts || 0} utilizados
                    </p>
                    <p>
                      <strong>Disponibles:</strong> {prof.subscription?.availableContracts || 0}
                    </p>
                  </div>

                  <div className="plan-buttons">
                    {Object.entries(PLANS).map(([key, plan]) => (
                      <button
                        key={key}
                        className={`plan-btn ${prof.subscription?.plan === key ? 'active' : ''}`}
                        onClick={() => assignPlan(prof.id, key)}
                      >
                        {plan.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits Tab */}
      {activeTab === 'credits' && (
        <div className="tab-content">
          <div className="credits-form">
            <h3>Agregar Contratos Manualmente</h3>

            <div className="form-group">
              <label>Selecciona un Profesional</label>
              <select
                value={selectedProfessional?.id || ''}
                onChange={e => {
                  const prof = professionals.find(p => p.id === e.target.value);
                  setSelectedProfessional(prof);
                }}
                className="form-input"
              >
                <option value="">-- Selecciona un profesional --</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} ({prof.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedProfessional && (
              <>
                <div className="selected-prof-info">
                  <p>
                    <strong>{selectedProfessional.name}</strong>
                  </p>
                  <p>
                    Plan: {selectedProfessional.subscription?.planName || 'Sin plan'}
                  </p>
                  <p>
                    Contratos disponibles: {selectedProfessional.subscription?.availableContracts || 0}
                  </p>
                </div>

                <div className="form-group">
                  <label>Cantidad de Contratos</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                    className="form-input"
                    placeholder="Ej: 5"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Motivo</label>
                  <select
                    value={creditReason}
                    onChange={e => setCreditReason(e.target.value)}
                    className="form-input"
                  >
                    <option value="">-- Selecciona un motivo --</option>
                    <option value="plan_upgrade">Actualización de plan</option>
                    <option value="promotional">Promocional</option>
                    <option value="refund">Reembolso</option>
                    <option value="compensation">Compensación</option>
                    <option value="support">Apoyo técnico</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <button className="btn-primary" onClick={addCreditsManually}>
                  ✓ Agregar Contratos
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="tab-content">
          <div className="plans-grid">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className="plan-info-card">
                <div className="plan-header">
                  {key === 'basico' && <span className="plan-icon">⚪</span>}
                  {key === 'standard' && <span className="plan-icon">🔹</span>}
                  {key === 'gold' && <span className="plan-icon">🥇</span>}
                  {key === 'platinum' && <span className="plan-icon">🥈</span>}
                  {key === 'vip' && <span className="plan-icon">💎</span>}
                  <h4>{plan.name}</h4>
                </div>

                <div className="plan-details">
                  <p className="plan-price">RD$ {plan.price}/mes</p>
                  <p>
                    <strong>Contratos:</strong> {plan.contracts === Infinity ? '∞ (Ilimitados)' : plan.contracts}
                  </p>
                  <p>
                    <strong>Bonus:</strong> +{plan.bonusContracts} al suscribirse
                  </p>
                  <p>
                    <strong>Total Inicial:</strong> {plan.contracts === Infinity ? '∞' : plan.contracts + plan.bonusContracts}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="tab-content">
          <div className="transfers-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>🏦 Transferencias por Verificar</h3>
            {transfers.length === 0 ? (
              <p>No hay solicitudes de transferencia registradas.</p>
            ) : (
              transfers.map(trans => (
                <div key={trans.id} className="professional-card" style={{ borderLeft: trans.status === 'approved' ? '6px solid #10B981' : trans.status === 'rejected' ? '6px solid #EF4444' : '6px solid #F26000', padding: '20px', borderRadius: '16px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{trans.depositorName || 'Titular no especificado'}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>📧 {trans.email}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>📱 {trans.phone || 'Sin teléfono'}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>🏛️ Banco de Origen: <strong>{trans.originBank || 'No indicado'}</strong></p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>💎 Plan Solicitado: <strong>{trans.planName} ({trans.price})</strong></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-badge ${trans.status === 'approved' ? 'active' : trans.status === 'rejected' ? 'inactive' : 'pending'}`} style={{ background: trans.status === 'approved' ? '#ECFDF5' : trans.status === 'rejected' ? '#FEF2F2' : '#FFF7ED', color: trans.status === 'approved' ? '#10B981' : trans.status === 'rejected' ? '#EF4444' : '#F26000', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '800' }}>
                        {trans.status === 'approved' ? 'Aprobada' : trans.status === 'rejected' ? 'Rechazada' : 'Por Verificar'}
                      </span>
                      {trans.createdAt && (
                        <p style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                          {new Date(trans.createdAt.seconds * 1000).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {trans.receiptUrl && (
                    <div style={{ marginTop: '14px', background: '#F9FAFB', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#444' }}>📄 Comprobante Adjunto:</span>
                      <a href={trans.receiptUrl} target="_blank" rel="noopener noreferrer" className="tab-btn" style={{ textDecoration: 'none', background: '#F26000', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: 'none' }}>
                        👁️ Ver Comprobante
                      </a>
                    </div>
                  )}

                  {trans.status === 'pending_verification' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button className="plan-btn active" style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '800', cursor: 'pointer' }} onClick={() => approveTransfer(trans)}>
                        ✓ Aprobar Pago
                      </button>
                      <button className="plan-btn" style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '800', cursor: 'pointer' }} onClick={() => rejectTransfer(trans)}>
                        ✗ Rechazar
                      </button>
                    </div>
                  )}

                  {trans.status === 'rejected' && trans.rejectedReason && (
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#EF4444', fontStyle: 'italic' }}>
                      Motivo de rechazo: {trans.rejectedReason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
