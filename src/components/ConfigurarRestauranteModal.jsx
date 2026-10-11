// src/components/ConfigurarRestauranteModal.jsx
import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const compressImage = (file, maxRes = 800) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxRes) { height = Math.round((height * maxRes) / width); width = maxRes; }
      } else {
        if (height > maxRes) { width = Math.round((width * maxRes) / height); height = maxRes; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function ConfigurarRestauranteModal({ store, onClose, onSave }) {
  const [name, setName] = useState(store?.name || store?.nombre || '');
  const [category, setCategory] = useState(store?.sub || store?.categoria || store?.category || 'Hamburguesas & Grill');
  const [coverUrl, setCoverUrl] = useState(store?.cover || store?.portadaURL || store?.image || store?.img || '');
  const [logoUrl, setLogoUrl] = useState(store?.logo || store?.logoURL || store?.image || store?.img || '');
  const [address, setAddress] = useState(store?.address || store?.direccion || 'Santiago Centro, República Dominicana');
  const [phone, setPhone] = useState(store?.phone || store?.telefono || '809-583-2020');
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp || store?.phone || '8095832020');
  const [instagram, setInstagram] = useState(store?.socials?.instagram || store?.instagram || '@restaurantepartner.rd');
  const [facebook, setFacebook] = useState(store?.socials?.facebook || store?.facebook || 'facebook.com/restaurantepartner');
  const [tiktok, setTiktok] = useState(store?.socials?.tiktok || store?.tiktok || '@restaurantepartner');
  const [schedule, setSchedule] = useState(store?.time || store?.horario || 'Lunes a Domingo, 08:00 AM - 11:30 PM');

  // Menu items list
  const [menuList, setMenuList] = useState(
    store?.menu || (store?.servicios?.map((s, i) => ({
      id: `m_${i}`,
      name: s.nombre,
      price: parseFloat(s.precio) || 250,
      desc: s.descripcion || '',
      img: s.fotoURL || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'
    }))) || []
  );

  // New dish form
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImg, setNewDishImg] = useState('');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'menu'

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 900);
      setCoverUrl(base64);
    } catch (err) {
      console.error(err);
      alert('Error cargando la foto de portada.');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 400);
      setLogoUrl(base64);
    } catch (err) {
      console.error(err);
      alert('Error cargando el logo.');
    }
  };

  const handleDishUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 400);
      setNewDishImg(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDish = (e) => {
    e.preventDefault();
    if (!newDishName.trim()) {
      alert('Por favor escribe el nombre del platillo.');
      return;
    }
    const priceNum = parseFloat(newDishPrice) || 200;
    const newDish = {
      id: `dish_${Date.now()}`,
      name: newDishName.trim(),
      price: priceNum,
      desc: newDishDesc.trim() || 'Especialidad preparada al instante.',
      img: newDishImg || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'
    };
    setMenuList(prev => [...prev, newDish]);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishImg('');
  };

  const handleRemoveDish = (dishId) => {
    setMenuList(prev => prev.filter(d => d.id !== dishId));
  };

  const handleSaveAll = async () => {
    if (!name.trim()) {
      alert('El nombre del restaurante es obligatorio.');
      return;
    }

    setSaving(true);
    const updatedStore = {
      ...store,
      name: name.trim(),
      nombre: name.trim(),
      cat: 'restaurantes',
      sub: category.trim(),
      categoria: category.trim(),
      cover: coverUrl,
      portadaURL: coverUrl,
      logo: logoUrl,
      logoURL: logoUrl,
      img: logoUrl,
      image: logoUrl,
      address: address.trim(),
      direccion: address.trim(),
      phone: phone.trim(),
      telefono: phone.trim(),
      whatsapp: whatsapp.trim(),
      socials: {
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        tiktok: tiktok.trim()
      },
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      tiktok: tiktok.trim(),
      time: schedule.trim(),
      horario: schedule.trim(),
      menu: menuList,
      servicios: menuList.map(m => ({
        nombre: m.name,
        precio: m.price,
        descripcion: m.desc,
        fotoURL: m.img
      })),
      activo: true,
      updatedAt: serverTimestamp()
    };

    try {
      if (store?.id) {
        await setDoc(doc(db, 'locales', store.id), updatedStore, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'locales'), updatedStore);
        updatedStore.id = docRef.id;
      }
    } catch (err) {
      console.warn('Guardado en Firestore advertencia:', err);
    }

    setSaving(false);
    if (onSave) onSave(updatedStore);
    alert('¡Restaurante actualizado con éxito! 🎉');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '92vh',
          background: '#FFFFFF',
          borderRadius: 24,
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderRadius: '24px 24px 0 0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              ⚙️ Configurar Mi Restaurante
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Edita portada, logo, información, contacto y platillos del menú
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', color: '#334155', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900 }}
          >
            ✕
          </button>
        </div>

        {/* TABS DE CONFIGURACIÓN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 20px 0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            style={{
              padding: '10px',
              borderRadius: 12,
              border: activeTab === 'perfil' ? '2px solid #FF6000' : '1.5px solid #E2E8F0',
              background: activeTab === 'perfil' ? '#FFF7ED' : '#FFFFFF',
              color: activeTab === 'perfil' ? '#C2410C' : '#475569',
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            🏪 Datos & Redes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            style={{
              padding: '10px',
              borderRadius: 12,
              border: activeTab === 'menu' ? '2px solid #FF6000' : '1.5px solid #E2E8F0',
              background: activeTab === 'menu' ? '#FFF7ED' : '#FFFFFF',
              color: activeTab === 'menu' ? '#C2410C' : '#475569',
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            🍽️ Menú & Platillos ({menuList.length})
          </button>
        </div>

        {/* CONTENIDO DE TABS */}
        <div style={{ padding: '16px 20px 24px', flex: 1 }}>
          {activeTab === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* 1. SECCIÓN DE PORTADA */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#334155', textTransform: 'uppercase', marginBottom: 6 }}>
                  🖼️ Foto de Portada del Restaurante
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 140,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#F1F5F9',
                  border: '1.5px solid #CBD5E1'
                }}>
                  {coverUrl ? (
                    <img src={coverUrl} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontWeight: 800 }}>
                      Sin portada
                    </div>
                  )}
                  <label style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    background: '#FF6000',
                    color: '#FFF',
                    padding: '6px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    📷 Cambiar Portada
                    <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* 2. SECCIÓN DE LOGO */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#334155', textTransform: 'uppercase', marginBottom: 6 }}>
                  🏷️ Logo Oficial del Restaurante
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={logoUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'}
                    alt="Logo"
                    style={{ width: 68, height: 68, borderRadius: 20, objectFit: 'cover', border: '2.5px solid #FF6000', background: '#FFF' }}
                  />
                  <label style={{
                    background: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    color: '#1E293B',
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}>
                    🏷️ Subir Nuevo Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* 3. NOMBRE & CATEGORÍA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Burger Mamey House"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                    Especialidad / Categoría
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ej: Hamburguesas, Alitas & Grill"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 4. DIRECCIÓN COMPLETA */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                  📍 Dirección Física Completa
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. 27 de Febrero esq. Winston Churchill, Santiago"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              {/* 5. CONTACTO TELEFÓNICO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                    📞 Teléfono de Llamadas
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="809-583-2020"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                    💬 WhatsApp de Pedidos
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="8095832020"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 6. REDES SOCIALES */}
              <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: 16, padding: '12px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#EA580C', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  🌐 Redes Sociales Oficiales
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram: @tucomercio.rd"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 12, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Facebook: facebook.com/tucomercio"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 12, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="TikTok: @tucomercio"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 12, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 7. HORARIOS */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                  ⏱️ Horario de Atención
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Lunes a Domingo, 08:00 AM - 11:30 PM"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #CBD5E1', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

            </div>
          )}

          {activeTab === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* FORMULARIO AGREGAR PLATILLO */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 14 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                  ➕ Añadir Nuevo Platillo al Menú
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Nombre del platillo (Ej: Doble Carne Angus)"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 12, fontWeight: 700 }}
                    />
                    <input
                      type="number"
                      placeholder="Precio RD$"
                      value={newDishPrice}
                      onChange={(e) => setNewDishPrice(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 12, fontWeight: 700 }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción (ingredientes, guarnición...)"
                    value={newDishDesc}
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{
                      flex: 1,
                      background: '#FFF',
                      border: '1px dashed #FF6000',
                      color: '#FF6000',
                      padding: '8px 10px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 800,
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}>
                      📷 {newDishImg ? 'Foto seleccionada' : 'Subir Foto del Platillo'}
                      <input type="file" accept="image/*" onChange={handleDishUpload} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={handleAddDish}
                      style={{
                        background: '#FF6000',
                        color: '#FFF',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontWeight: 900,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      + Añadir al Menú
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTA ACTUAL DE PLATILLOS */}
              <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#64748B', display: 'block', marginBottom: 8 }}>
                  Platillos actuales en el menú:
                </span>
                {menuList.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', margin: '14px 0' }}>
                    No tienes platillos en el menú aún. Agrega uno arriba.
                  </p>
                ) : (
                  menuList.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#FFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        marginBottom: 8
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#1E293B' }}>{item.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#FF6000' }}>RD$ {item.price}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(item.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* BOTÓN GUARDAR CAMBIOS */}
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            style={{
              width: '100%',
              marginTop: 16,
              padding: 14,
              background: 'linear-gradient(135deg, #FF6000 0%, #FF8533 100%)',
              color: '#FFF',
              border: 'none',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 900,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(255,96,0,0.35)'
            }}
          >
            {saving ? '⏳ Guardando Configuración...' : '💾 Guardar Cambios del Restaurante'}
          </button>
        </div>
      </div>
    </div>
  );
}
