import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
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

  // Planes disponibles
  const PLANS = {
    standard: { name: 'Plan Estándar', contracts: 8, bonusContracts: 3, price: 500 },
    gold: { name: 'Pack Gold', contracts: 10, bonusContracts: 3, price: 1000 },
    platinum: { name: 'Pack Platinum', contracts: 15, bonusContracts: 3, price: 1500 },
    vip: { name: 'VIP Ilimitado', contracts: Infinity, bonusContracts: 0, price: 2000 },
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
                  {key === 'standard' && <span className="plan-icon">📦</span>}
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
    </div>
  );
}
