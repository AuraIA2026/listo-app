import React, { useState } from 'react';
import './PoliciesPage.css';

export default function PoliciesPage({ lang, navigate }) {
  const [activeTab, setActiveTab] = useState('security');

  const tabs = [
    { id: 'security', labelEs: 'Seguridad', labelEn: 'Security' },
    { id: 'refund', labelEs: 'Devoluciones y Cancelaciones', labelEn: 'Refunds & Cancellations' },
    { id: 'privacy', labelEs: 'Privacidad', labelEn: 'Privacy' },
    { id: 'delivery', labelEs: 'Envíos / Entrega', labelEn: 'Delivery' }
  ];

  return (
    <div className="policies-page" style={{ padding: '20px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-body)', color: '#334155', paddingBottom: '90px' }}>
      <button 
        onClick={() => navigate('login')} 
        style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', marginBottom: '16px', color: '#1A1A2E' }}
      >
        ←
      </button>

      <h1 style={{ fontSize: '28px', color: '#1A1A2E', marginBottom: '24px', fontFamily: 'var(--font-display)', fontWeight: '900' }}>
        {lang === 'es' ? 'Políticas Legales y de Seguridad' : 'Legal & Security Policies'}
      </h1>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab.id ? '#F26000' : '#E2E8F0',
              color: activeTab === tab.id ? 'white' : '#475569',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {lang === 'es' ? tab.labelEs : tab.labelEn}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* --- SEGURIDAD --- */}
        {activeTab === 'security' && (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0F172A', marginBottom: '16px' }}>Política de Seguridad para la Transmisión de Datos</h2>
            
            <h3 style={{ fontSize: '16px', color: '#1A1A2E', marginTop: '20px', marginBottom: '8px' }}>WEBSITE</h3>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              Tomamos todas las medidas y precauciones razonables para proteger tu información personal y seguimos las mejores prácticas de la industria para asegurar que tu información no sea utilizada de manera inapropiada, alterada o destruida.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
              Ciframos la información de tu tarjeta de crédito utilizando la tecnología de capa de puertos seguros o Secur Sockets Layer (SSL), y la almacenamos con el cifrado AES-256. También, seguimos todos los requerimientos del PCI-DSS.
            </p>

            <h3 style={{ fontSize: '16px', color: '#1A1A2E', marginTop: '20px', marginBottom: '8px' }}>PAGOS</h3>
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
              Los métodos de pago utilizados por LA EMPRESA son servicios de terceros. Estos servicios de terceros (AZUL), cumplen con todos los estándares de seguridad y cifrado para mantener tu información segura. Solo utilizarán la información necesaria para completar el proceso requerido. También recomendamos leer las Políticas de Privacidad de estos proveedores, para entender mejor cómo manejan la información suministrada.
            </p>

            <div style={{ padding: '20px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
               {/* Logo Verified By Visa */}
               <div style={{ background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#1434CB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  Verified by <strong style={{ fontSize: '18px', marginLeft: '6px', fontStyle: 'italic' }}>VISA</strong>
               </div>
               {/* Logo MasterCard ID Check */}
               <div style={{ background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#EB001B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ marginRight: '8px', display: 'flex' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EB001B', marginRight: '-6px', zIndex: 1, mixBlendMode: 'multiply' }}></div>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#F79E1B', mixBlendMode: 'multiply' }}></div>
                  </div>
                  mastercard. <br/> ID Check
               </div>
            </div>
          </div>
        )}

        {/* --- DEVOLUCIONES Y REEMBOLSOS --- */}
        {activeTab === 'refund' && (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0F172A', marginBottom: '16px' }}>Políticas de Devoluciones, Reembolsos y Cancelaciones</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>1. Cancelaciones de Servicios:</strong> Usted puede cancelar un servicio solicitado a un profesional en cualquier momento antes de que el profesional inicie su desplazamiento o ejecución. Una vez en sitio, podrían aplicar cargos por visita o diagnóstico, según el acuerdo con el profesional.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>2. Reembolsos por Pagos Electrónicos:</strong> Si usted realiza un pago a través de nuestra plataforma (AZUL) y el servicio no es completado por causas atribuibles al profesional, usted tiene derecho a solicitar la retención o devolución de los fondos. Las solicitudes de reembolso se analizan en un lapso de 24 a 48 horas hábiles mediante nuestro departamento de disputas. De ser aprobada, el reverso a su tarjeta dependerá de los tiempos de su banco emisor (típicamente 3 a 10 días hábiles).
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>3. Pagos Directos:</strong> Listo Patrón no es responsable de los fondos pagados en efectivo o por transferencias directas al profesional fuera de la pasarela de pagos integrada en la App.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>4. Planes y Contratos (Para Profesionales):</strong> La compra de planes promocionales VIP o Contratos Digitales dentro de la app son inversiones finales para mejorar su visibilidad y obtener leads. No se emiten reembolsos parciales por planes no utilizados si el profesional decide cerrar su cuenta.
            </p>
          </div>
        )}

        {/* --- PRIVACIDAD --- */}
        {activeTab === 'privacy' && (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0F172A', marginBottom: '16px' }}>Política de Privacidad</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              Su privacidad es primordial para Listo Patrón. Recopilamos información básica como su nombre, número de contacto y ubicación aproximada para conectarlo efectivamente con profesionales cercanoss en la República Dominicana.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>Uso de la Información:</strong> Utilizamos sus datos exclusivamente para operar la plataforma, enviar notificaciones relacionadas a sus solicitudes y mejorar nuestros servicios. No vendemos ni compartimos sus datos personales con terceros para fines de publicidad no relacionada.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>Información de Pago:</strong> Los datos de sus tarjetas de crédito o débito son introducidos y procesados directamente por proveedores de servicios de pago certificados (AZUL). Nosotros no visualizamos, no almacenamos ni tenemos acceso al número completo de su tarjeta o su CVV.
            </p>
          </div>
        )}

        {/* --- ENTREGA / DELIVERY --- */}
        {activeTab === 'delivery' && (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0F172A', marginBottom: '16px' }}>Política Clara de Entrega</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              Dado que Listo Patrón es una plataforma digital que facilita servicios presenciales y compra de intangibles (Planes Profesionales), nuestra política de entrega opera bajo las siguientes modalidades:
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>1. Contratación de Servicios Físicos:</strong> La "entrega" se concreta cuando el profesional registrado en nuestra plataforma asiste a la ubicación acordada entre usted y él, y completa el trabajo (ej. plomería, mecánica). Los tiempos de llegada se acuerdan mediante el sistema de mensajería (chat) interno de la plataforma.
            </p>
            <p style={{ lineHeight: '1.6', marginBottom: '12px' }}>
              <strong>2. Adquisición de Planes o Contratos (Digitales):</strong> Para los profesionales que abonan cuotas para adquirir "Contratos" o "Suscripciones VIP", la entrega del activo digital es <strong>inmediata y automática</strong> tras confirmarse el pago por nuestro procesador. Los saldos de contratos se verán reflejados al instante en su cuenta y su perfil VIP quedará activado en tiempo real.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
