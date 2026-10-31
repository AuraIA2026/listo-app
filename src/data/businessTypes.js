// src/data/businessTypes.js
// Configuración de tipos de comercio para el Portal Partner de Pedidos Listo.
// Cada tipo define: categorías del menú, etiquetas visibles al cliente y grupos
// de opciones que el cliente puede elegir (tallas, colores, modalidad, etc.).
// `rental: true` activa la tabla de precios de alquiler (hora / día / semana / mes).

export const BUSINESS_TYPES = {
  restaurante: {
    label: '🍔 Restaurante / Comida',
    visitLabel: 'Ver restaurante',
    itemLabel: 'Platillo',
    descLabel: 'Descripción / Ingredientes',
    useFoodConfig: true, // Usa el configurador original de guarniciones/bebidas/extras
    categories: [
      ['plato_dia', '🍛 Plato del Día'], ['desayuno', '🍳 Desayuno Criollo'],
      ['merienda', '☕ Merienda / Snacks'], ['antojitos', '🍢 Antojitos & Picaderas'],
      ['cena', '🌙 Cena Especial'], ['bocado', '🍔 Bocado Rápido / Fast Food'],
      ['pollos', '🍗 Pollos & Piezas Crujientes'], ['cubetas', '🪣 Cubetas & Combos Familiares'],
      ['criollo', '🍛 Comida Criolla & Platos Fuertes'], ['pizzas', '🍕 Pizzas & Pastas'],
      ['tacos', '🌮 Tacos & Comida Mexicana'], ['sushi', '🍣 Sushi & Comida Asiática'],
      ['saludable', '🥗 Ensaladas & Comida Saludable'], ['postres', '🍰 Postres & Repostería'],
      ['bebidas', '🥤 Bebidas & Jugos Naturales'], ['licor', '🍾 Licores, Cervezas & Bebidas Frías'],
    ],
    tags: ['👑 Chef', '🌱 Vegano', '🌾 Sin Gluten', '🌶️ Picante', '🔥 Más Vendido', '🥑 Keto'],
    optionGroups: [],
  },

  ropa: {
    label: '👕 Tienda de Ropa & Calzado',
    visitLabel: 'Ver tienda',
    itemLabel: 'Prenda / Artículo',
    descLabel: 'Descripción / Material',
    categories: [
      ['pantalones', '👖 Pantalones & Jeans'], ['camisetas', '👕 Camisetas & T-Shirts'],
      ['camisas', '👔 Camisas & Polos'], ['vestidos', '👗 Vestidos & Faldas'],
      ['botas', '🥾 Botas'], ['tenis', '👟 Tenis & Zapatillas'], ['zapatos', '👞 Zapatos & Sandalias'],
      ['gorras', '🧢 Gorras & Sombreros'], ['abrigos', '🧥 Abrigos & Sudaderas'],
      ['ropa_interior', '🩲 Ropa Interior & Medias'], ['deportiva', '🏃 Ropa Deportiva'],
      ['ninos', '🧒 Ropa de Niños'], ['accesorios', '👜 Bolsos, Correas & Accesorios'],
      ['uniformes', '🦺 Uniformes & Ropa de Trabajo'],
    ],
    tags: ['🆕 Nueva Colección', '🔥 Más Vendido', '💸 En Oferta', '👨 Hombre', '👩 Mujer', '🧒 Niños', '♻️ Unisex', '⭐ Original / Marca'],
    wholesale: true, // Activa tabla de precios por unidad / docena / al por mayor
    priceLabel: 'Precio por Unidad (RD$)',
    optionGroups: [
      { key: 'tallas', label: '📏 Tallas Disponibles', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Talla Única'] },
      { key: 'tallas_num', label: '👟 Tallas Numéricas (Calzado / Pantalón)', options: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '26', '28', '30', '32', '34', '36', '38', '40', '42'] },
      { key: 'color_camisa', label: '👕 Colores de Camisa / T-Shirt / Polo', options: ['⚫ Negro', '⚪ Blanco', '🔵 Azul', '🔵 Azul Marino', '🔴 Rojo', '🍷 Vino', '🟢 Verde', '🩶 Gris', '🩷 Rosado', '🟡 Amarillo', '🟠 Naranja', '🟣 Morado', '🟤 Beige'] },
      { key: 'color_pantalon', label: '👖 Colores de Pantalón / Jean', options: ['🔵 Azul Claro', '🔵 Azul Oscuro', '⚫ Negro', '🩶 Gris', '🟤 Kaki / Beige', '🟢 Verde Olivo', '⚪ Blanco', '🟤 Marrón'] },
      { key: 'color_gorra', label: '🧢 Colores de Gorra / Sombrero', options: ['⚫ Negro', '⚪ Blanco', '🔵 Azul', '🔴 Rojo', '🩶 Gris', '🟢 Verde', '🟤 Beige', '🎨 Combinada'] },
      { key: 'color_calzado', label: '👟 Colores de Calzado', options: ['⚫ Negro', '⚪ Blanco', '🟤 Marrón', '🩶 Gris', '🔵 Azul', '🔴 Rojo', '🎨 Combinado'] },
      { key: 'manga', label: '✂️ Tipo de Manga / Corte', options: ['Manga Corta', 'Manga Larga', 'Sin Manga', 'Cuello Redondo', 'Cuello V', 'Slim Fit', 'Regular Fit', 'Oversize'] },
      { key: 'material', label: '🧵 Material', options: ['Algodón', 'Denim / Mezclilla', 'Cuero', 'Poliéster', 'Lino', 'Lana', 'Sintético', 'Dry-Fit'] },
      { key: 'personalizacion', label: '🖌️ Personalización', options: ['Bordado', 'Serigrafía', 'Sublimación', 'Vinil / Transfer', 'Logo de Empresa', 'Nombre Personalizado'] },
    ],
  },

  herramientas: {
    label: '🔧 Alquiler de Herramientas & Equipos',
    visitLabel: 'Ver alquiler',
    itemLabel: 'Herramienta / Equipo',
    descLabel: 'Descripción / Especificaciones Técnicas',
    rental: true,
    priceLabel: 'Precio Base (RD$)',
    categories: [
      ['electricas', '🔌 Herramientas Eléctricas'], ['taladros', '🛠️ Taladros & Rotomartillos'],
      ['corte', '🪚 Sierras & Equipos de Corte'], ['construccion', '🏗️ Construcción & Concreto'],
      ['andamios', '🪜 Andamios & Escaleras'], ['generadores', '⚡ Generadores & Plantas Eléctricas'],
      ['compresores', '💨 Compresores & Hidrolavadoras'], ['jardineria', '🌿 Jardinería & Podadoras'],
      ['soldadura', '🔥 Soldadura'], ['pintura', '🎨 Pintura & Acabados'],
      ['limpieza', '🧽 Limpieza Industrial'], ['medicion', '📐 Medición & Nivelación'],
      ['maquinaria', '🚜 Maquinaria Pesada'],
    ],
    tags: ['✅ Disponible Hoy', '🚚 Entrega a Domicilio', '🏪 Retiro en Local', '👷 Incluye Operador', '🛡️ Requiere Depósito', '🆕 Equipo Nuevo', '⛽ Combustible Incluido'],
    optionGroups: [
      { key: 'modalidad', label: '⏱️ Modalidades de Alquiler Ofrecidas', options: ['Por Hora', 'Medio Día (4h)', 'Por Día', 'Fin de Semana', 'Por Semana', 'Por Mes'] },
      { key: 'incluye', label: '📦 Incluye con el Alquiler', options: ['Brocas / Discos', 'Extensión Eléctrica', 'Equipo de Seguridad', 'Maletín', 'Batería Extra', 'Manual de Uso'] },
      { key: 'requisitos', label: '📋 Requisitos para Alquilar', options: ['Cédula Vigente', 'Depósito en Efectivo', 'Tarjeta de Crédito', 'Comprobante de Domicilio', 'Contrato Firmado'] },
    ],
  },

  ferreteria: {
    label: '🔩 Ferretería & Materiales',
    visitLabel: 'Ver ferretería',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Medidas',
    categories: [
      ['herramientas_mano', '🔨 Herramientas de Mano'], ['electricidad', '💡 Electricidad'],
      ['plomeria', '🚰 Plomería'], ['pintura', '🎨 Pinturas'], ['tornilleria', '🔩 Tornillería & Clavos'],
      ['cemento', '🧱 Cemento & Blocks'], ['madera', '🪵 Madera'], ['seguridad', '🦺 Seguridad Industrial'],
    ],
    tags: ['🔥 Más Vendido', '💸 En Oferta', '🚚 Entrega Hoy', '📦 Venta al por Mayor'],
    optionGroups: [
      { key: 'unidad', label: '📦 Unidad de Venta', options: ['Unidad', 'Caja', 'Libra', 'Galón', 'Cubeta', 'Pie', 'Metro', 'Saco', 'Rollo'] },
      { key: 'medidas', label: '📏 Medidas Disponibles', options: ['1/4"', '1/2"', '3/4"', '1"', '2"', '3"', '4"'] },
    ],
  },

  farmacia: {
    label: '💊 Farmacia & Salud',
    visitLabel: 'Ver farmacia',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Indicaciones',
    categories: [
      ['medicamentos', '💊 Medicamentos'], ['vitaminas', '🍊 Vitaminas & Suplementos'],
      ['cuidado', '🧴 Cuidado Personal'], ['bebe', '🍼 Bebés & Maternidad'],
      ['primeros_auxilios', '🩹 Primeros Auxilios'], ['dermo', '✨ Dermocosmética'],
    ],
    tags: ['📄 Requiere Receta', '🟢 Venta Libre', '🔥 Más Vendido', '💸 En Oferta', '🏷️ Genérico'],
    optionGroups: [
      { key: 'presentacion', label: '📦 Presentación', options: ['Tabletas', 'Cápsulas', 'Jarabe', 'Crema', 'Gotas', 'Inyectable', 'Sobres'] },
    ],
  },

  supermercado: {
    label: '🛒 Supermercado & Colmado',
    visitLabel: 'Ver supermercado',
    itemLabel: 'Producto',
    descLabel: 'Descripción',
    categories: [
      ['viveres', '🍌 Víveres & Frutas'], ['carnes', '🥩 Carnes & Embutidos'], ['lacteos', '🧀 Lácteos & Huevos'],
      ['despensa', '🥫 Despensa'], ['bebidas', '🥤 Bebidas'], ['licores', '🍺 Licores & Cervezas'],
      ['limpieza', '🧽 Limpieza del Hogar'], ['panaderia', '🥖 Panadería'],
    ],
    tags: ['🔥 Más Vendido', '💸 En Oferta', '🌿 Orgánico', '🇩🇴 Producto Local', '❄️ Refrigerado'],
    optionGroups: [
      { key: 'unidad', label: '⚖️ Unidad de Venta', options: ['Unidad', 'Libra', 'Kilo', 'Paquete', 'Docena', 'Caja', 'Funda'] },
    ],
  },

  belleza: {
    label: '💄 Belleza & Cosméticos',
    visitLabel: 'Ver tienda de belleza',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Beneficios',
    categories: [
      ['maquillaje', '💄 Maquillaje'], ['cabello', '💇 Cuidado del Cabello'], ['piel', '🧴 Cuidado de la Piel'],
      ['perfumes', '🌸 Perfumes'], ['unas', '💅 Uñas'], ['barberia', '💈 Barbería'],
    ],
    tags: ['🆕 Nuevo', '🔥 Más Vendido', '💸 En Oferta', '⭐ Original', '🌱 Natural / Vegano'],
    optionGroups: [
      { key: 'tonos', label: '🎨 Tonos / Variantes', options: ['Claro', 'Medio', 'Oscuro', 'Nude', 'Rojo', 'Rosado'] },
      { key: 'tamano', label: '📦 Tamaño', options: ['Mini', '50 ml', '100 ml', '250 ml', '500 ml', '1 L'] },
    ],
  },

  electronica: {
    label: '📱 Electrónica & Celulares',
    visitLabel: 'Ver tienda de electrónica',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Especificaciones',
    categories: [
      ['celulares', '📱 Celulares'], ['accesorios', '🎧 Accesorios'], ['computadoras', '💻 Computadoras'],
      ['tv', '📺 TV & Audio'], ['gaming', '🎮 Gaming'], ['electrodomesticos', '🔌 Electrodomésticos'],
    ],
    tags: ['🆕 Nuevo', '♻️ Usado / Reacondicionado', '🛡️ Con Garantía', '🔥 Más Vendido', '💸 En Oferta'],
    optionGroups: [
      { key: 'almacenamiento', label: '💾 Almacenamiento', options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'] },
      { key: 'colores', label: '🎨 Colores', options: ['⚫ Negro', '⚪ Blanco', '🔵 Azul', '🩶 Gris', '🟡 Dorado'] },
      { key: 'garantia', label: '🛡️ Garantía', options: ['Sin garantía', '30 días', '3 meses', '6 meses', '1 año'] },
    ],
  },

  mascotas: {
    label: '🐾 Mascotas & Veterinaria',
    visitLabel: 'Ver tienda de mascotas',
    itemLabel: 'Producto',
    descLabel: 'Descripción',
    categories: [
      ['alimento', '🦴 Alimento'], ['accesorios_mascota', '🎾 Juguetes & Accesorios'],
      ['higiene_mascota', '🛁 Higiene & Grooming'], ['salud_mascota', '💉 Salud Veterinaria'],
    ],
    tags: ['🐶 Perros', '🐱 Gatos', '🐦 Aves', '🔥 Más Vendido', '💸 En Oferta'],
    optionGroups: [
      { key: 'tamano_mascota', label: '📏 Tamaño de Mascota', options: ['Cachorro', 'Pequeño', 'Mediano', 'Grande'] },
    ],
  },

  hogar: {
    label: '🛋️ Hogar, Muebles & Decoración',
    visitLabel: 'Ver tienda de hogar',
    itemLabel: 'Artículo',
    descLabel: 'Descripción / Medidas',
    categories: [
      ['muebles', '🛋️ Muebles'], ['cocina', '🍳 Cocina'], ['decoracion', '🖼️ Decoración'],
      ['colchones', '🛏️ Colchones & Ropa de Cama'], ['bano', '🚿 Baño'],
    ],
    tags: ['🆕 Nuevo', '🔥 Más Vendido', '💸 En Oferta', '🚚 Entrega a Domicilio', '🔧 Incluye Instalación'],
    optionGroups: [
      { key: 'colores', label: '🎨 Colores', options: ['⚫ Negro', '⚪ Blanco', '🟤 Madera', '🩶 Gris', '🟤 Beige'] },
    ],
  },

  papeleria: {
    label: '📚 Papelería & Librería',
    visitLabel: 'Ver papelería',
    itemLabel: 'Producto',
    descLabel: 'Descripción',
    categories: [
      ['escolar', '🎒 Útiles Escolares'], ['oficina', '🖇️ Oficina'], ['libros', '📖 Libros'],
      ['impresion', '🖨️ Impresión & Copias'],
    ],
    tags: ['🔥 Más Vendido', '💸 En Oferta', '🎒 Regreso a Clases', '📦 Al por Mayor'],
    optionGroups: [],
  },

  repuestos: {
    label: '🚗 Repuestos & Accesorios de Vehículos',
    visitLabel: 'Ver repuestos',
    itemLabel: 'Repuesto',
    descLabel: 'Descripción / Compatibilidad',
    categories: [
      ['motor', '⚙️ Motor'], ['frenos', '🛑 Frenos'], ['gomas', '🛞 Gomas & Aros'],
      ['aceites', '🛢️ Aceites & Lubricantes'], ['baterias', '🔋 Baterías'], ['motos', '🏍️ Motores / Motos'],
    ],
    tags: ['🆕 Nuevo', '♻️ Usado', '🛡️ Con Garantía', '⭐ Original', '🔧 Instalación Incluida'],
    optionGroups: [],
  },

  alquiler_eventos: {
    label: '🎉 Alquiler para Eventos',
    visitLabel: 'Ver alquiler de eventos',
    itemLabel: 'Artículo',
    descLabel: 'Descripción',
    rental: true,
    priceLabel: 'Precio Base (RD$)',
    categories: [
      ['sillas_mesas', '🪑 Sillas & Mesas'], ['carpas', '⛺ Carpas'], ['sonido', '🔊 Sonido & Luces'],
      ['decoracion_evento', '🎈 Decoración'], ['inflables', '🏰 Inflables'],
    ],
    tags: ['✅ Disponible Hoy', '🚚 Entrega & Montaje', '🛡️ Requiere Depósito'],
    optionGroups: [
      { key: 'modalidad', label: '⏱️ Modalidad', options: ['Por Hora', 'Por Día', 'Fin de Semana'] },
    ],
  },

  alquiler_casas: {
    label: '🏠 Alquiler de Casas & Apartamentos',
    visitLabel: 'Ver propiedades',
    itemLabel: 'Propiedad',
    descLabel: 'Descripción / Características',
    rental: true,
    priceLabel: 'Precio Mensual (RD$)',
    categories: [
      ['apartamento', '🏢 Apartamentos'], ['casa', '🏠 Casas & Chalets'],
      ['habitacion', '🛏️ Habitaciones'], ['villa', '🏖️ Villas & Chalets de Playa'],
      ['local_comercial', '🏪 Locales Comerciales'], ['oficina', '🖥️ Oficinas'],
      ['penthouse', '🌆 Penthouses'], ['vacacional', '🌴 Propiedades Vacacionales'],
    ],
    tags: ['🛋️ Amueblado', '🪑 Sin Muebles', '🌊 Vista al Mar', '🚗 Parking', '🏊 Piscina', '🔐 Vigilancia 24/7', '🐾 Acepta Mascotas', '⚡ A/C Incluido'],
    optionGroups: [
      { key: 'habitaciones', label: '🛏️ Habitaciones', options: ['Estudio', '1 Hab', '2 Hab', '3 Hab', '4 Hab', '5+ Hab'] },
      { key: 'banos', label: '🚿 Baños', options: ['1 Baño', '1.5 Baños', '2 Baños', '3 Baños', '4+ Baños'] },
      { key: 'modalidad_renta', label: '📅 Modalidad', options: ['Mensual', 'Anual', 'Por Día (Vacacional)', 'Por Semana'] },
      { key: 'zona', label: '📍 Zona', options: ['Santiago Centro', 'Villa Olga', 'Bella Vista', 'Gurabo', 'Los Jardines', 'Ensanche Bermúdez', 'Moca', 'La Vega', 'Puerto Plata', 'Punta Cana', 'Santo Domingo'] },
    ],
  },

  venta_vehiculos: {
    label: '🚗 Venta de Vehículos',
    visitLabel: 'Ver vehículos',
    itemLabel: 'Vehículo',
    descLabel: 'Descripción / Especificaciones',
    categories: [
      ['carros_nuevos', '🚘 Carros Nuevos'], ['carros_usados', '🚗 Carros Usados'],
      ['jeepetas', '🚙 Jeepetas & SUVs'], ['camionetas', '🛻 Camionetas & Pick-Ups'],
      ['motos', '🏍️ Motocicletas'], ['bicicletas', '🚲 Bicicletas & Scooters'],
      ['camiones', '🚛 Camiones & Carga'], ['botes', '⛵ Botes & Embarcaciones'],
      ['maquinaria_pesada', '🚜 Maquinaria Pesada'],
    ],
    tags: ['🆕 Nuevo', '♻️ Usado', '🛡️ Con Garantía', '📄 Documentos al Día', '🔑 Entrega Inmediata', '💳 Financiamiento', '🔧 Revisado por Mecánico'],
    optionGroups: [
      { key: 'marca', label: '🏷️ Marca', options: ['Toyota', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Ford', 'Chevrolet', 'Mitsubishi', 'BMW', 'Mercedes', 'Audi', 'Jeep', 'Suzuki', 'Yamaha'] },
      { key: 'transmision', label: '⚙️ Transmisión', options: ['Automático', 'Manual', 'CVT'] },
      { key: 'combustible', label: '⛽ Combustible', options: ['Gasolina', 'Diesel', 'Eléctrico', 'Híbrido', 'Gas'] },
      { key: 'ano', label: '📅 Año', options: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2015-2016', 'Antes 2015'] },
      { key: 'color', label: '🎨 Color', options: ['⚫ Negro', '⚪ Blanco', '🩶 Plata', '🔵 Azul', '🔴 Rojo', '🟤 Marrón', '🟢 Verde', '🟡 Amarillo'] },
    ],
  },

  bienes_raices: {
    label: '🏗️ Bienes Raíces & Terrenos',
    visitLabel: 'Ver propiedades',
    itemLabel: 'Propiedad',
    descLabel: 'Descripción / Ubicación',
    categories: [
      ['terrenos', '🌿 Terrenos & Solares'], ['casas_venta', '🏠 Casas en Venta'],
      ['apartamentos_venta', '🏢 Apartamentos en Venta'], ['locales', '🏪 Locales Comerciales'],
      ['fincas', '🌾 Fincas & Propiedades Agrícolas'], ['proyectos', '🏗️ Proyectos en Construcción'],
      ['inversion', '💼 Propiedades de Inversión'],
    ],
    tags: ['📜 Título Limpio', '🏦 Con Financiamiento', '🔑 Entrega Inmediata', '🏗️ En Planos', '🌊 Cerca del Mar', '🏙️ Zona Urbana', '🌳 Zona Rural'],
    optionGroups: [
      { key: 'metros', label: '📐 Metros Cuadrados', options: ['Menos de 50 m²', '50-100 m²', '100-200 m²', '200-500 m²', '500 m²-1 Tarea', '1-5 Tareas', 'Más de 5 Tareas'] },
      { key: 'zona_br', label: '📍 Zona / Provincia', options: ['Santiago', 'Santo Domingo', 'Puerto Plata', 'La Vega', 'Punta Cana', 'Samaná', 'San Pedro', 'La Romana', 'Barahona'] },
    ],
  },

  deportes: {
    label: '⚽ Deportes, Gym & Fitness',
    visitLabel: 'Ver tienda deportiva',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Especificaciones',
    categories: [
      ['gym', '🏋️ Equipos de Gym & Pesas'], ['futbol', '⚽ Fútbol'], ['baloncesto', '🏀 Baloncesto'],
      ['natacion', '🏊 Natación'], ['bicicleta', '🚴 Ciclismo'], ['boxeo', '🥊 Boxeo & MMA'],
      ['ropa_deportiva', '👟 Ropa & Calzado Deportivo'], ['suplementos', '💪 Suplementos & Proteínas'],
      ['tenis', '🎾 Tenis & Padel'], ['camping', '⛺ Camping & Outdoor'],
    ],
    tags: ['🆕 Nuevo', '🔥 Más Vendido', '💸 En Oferta', '🏆 Marca Original', '🚚 Entrega a Domicilio'],
    optionGroups: [
      { key: 'tallas_dep', label: '📏 Tallas', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Talla Única'] },
      { key: 'colores_dep', label: '🎨 Colores', options: ['⚫ Negro', '⚪ Blanco', '🔵 Azul', '🔴 Rojo', '🟢 Verde', '🩶 Gris'] },
    ],
  },

  servicios_digitales: {
    label: '💻 Servicios Digitales & Tecnología',
    visitLabel: 'Ver servicios',
    itemLabel: 'Servicio',
    descLabel: 'Descripción del servicio',
    categories: [
      ['diseno', '🎨 Diseño Gráfico & Logos'], ['programacion', '💻 Desarrollo Web & Apps'],
      ['redes_sociales', '📱 Manejo de Redes Sociales'], ['seo', '🔍 SEO & Marketing Digital'],
      ['video', '🎬 Edición de Video & Fotos'], ['impresion', '🖨️ Impresión Digital'],
      ['streaming', '🎮 Cuentas & Streaming'], ['soporte_tec', '🔧 Soporte Técnico Remoto'],
    ],
    tags: ['⚡ Entrega Rápida', '✅ Revisiones Incluidas', '🌐 Trabajo Remoto', '💼 Para Empresas', '📄 Incluye Factura'],
    optionGroups: [
      { key: 'tiempo_entrega', label: '⏱️ Tiempo de Entrega', options: ['24 horas', '48 horas', '3-5 días', '1 semana', '2 semanas', 'A convenir'] },
    ],
  },

  joyeria: {
    label: '💍 Joyería & Accesorios de Lujo',
    visitLabel: 'Ver joyería',
    itemLabel: 'Joya / Accesorio',
    descLabel: 'Descripción / Material',
    categories: [
      ['anillos', '💍 Anillos & Sortijas'], ['collares', '📿 Collares & Cadenas'],
      ['pulseras', '⌚ Pulseras & Brazaletes'], ['aretes', '💎 Aretes & Pendientes'],
      ['relojes', '⌚ Relojes'], ['oro', '🥇 Oro & Plata'], ['bisuteria', '🛍️ Bisutería & Accesorios'],
    ],
    tags: ['💛 Oro 18K', '⚪ Plata .925', '💎 Diamantes', '🆕 Nueva Colección', '🎁 Para Regalar', '💸 En Oferta'],
    optionGroups: [
      { key: 'material_joya', label: '🪙 Material', options: ['Oro 10K', 'Oro 14K', 'Oro 18K', 'Plata .925', 'Acero Inoxidable', 'Titanio', 'Chapado en Oro'] },
      { key: 'talla_anillo', label: '📏 Talla de Anillo', options: ['5', '6', '7', '8', '9', '10', '11', '12'] },
    ],
  },

  juguetes: {
    label: '🧸 Juguetes & Artículos para Bebés',
    visitLabel: 'Ver juguetes',
    itemLabel: 'Producto',
    descLabel: 'Descripción / Edad recomendada',
    categories: [
      ['bebe_recien', '👶 Recién Nacido (0-12m)'], ['ninos_1_3', '🧒 Niños 1-3 años'],
      ['ninos_4_8', '🚂 Niños 4-8 años'], ['ninos_9_12', '🎮 Niños 9-12 años'],
      ['adolescentes', '🎯 Adolescentes'], ['munecos', '🪆 Muñecas & Peluches'],
      ['educativo', '📚 Juguetes Educativos'], ['cochecitos', '🛒 Cochecitos & Coches'],
      ['ropa_bebe', '🍼 Ropa & Accesorios de Bebé'],
    ],
    tags: ['🆕 Nuevo', '🔥 Más Vendido', '💸 En Oferta', '✅ No Tóxico', '🎁 Para Regalar', '📦 Importado'],
    optionGroups: [
      { key: 'edad', label: '👶 Edad Recomendada', options: ['0-6 meses', '6-12 meses', '1-2 años', '3-5 años', '6-8 años', '9-12 años', '13+ años'] },
    ],
  },
};

// Palabras que la gente escribe en "Buscar" y que apuntan a cada tipo de comercio
export const BUSINESS_KEYWORDS = {
  restaurante: ['comida', 'restaurante', 'comer', 'almuerzo', 'cena', 'desayuno', 'pizza', 'pollo', 'hamburguesa', 'burger', 'yaroa', 'chicharron', 'empanada', 'sushi', 'taco', 'postre', 'bebida', 'jugo'],
  ropa: ['ropa', 'tienda', 'boutique', 'camisa', 'pantalon', 'jean', 'vestido', 'zapato', 'tenis', 'calzado', 'gorra', 'moda', 'uniforme', 'bolso'],
  herramientas: ['alquiler', 'alquilar', 'rentar', 'renta', 'herramienta', 'equipo', 'taladro', 'andamio', 'generador', 'planta electrica', 'compresor', 'hidrolavadora', 'sierra', 'maquinaria', 'soldadora'],
  ferreteria: ['ferreteria', 'material', 'cemento', 'block', 'tornillo', 'clavo', 'pintura', 'plomeria', 'tubo', 'cable', 'madera', 'martillo'],
  farmacia: ['farmacia', 'medicina', 'medicamento', 'pastilla', 'remedio', 'salud', 'vitamina', 'jarabe', 'receta', 'panal', 'curita', 'botica'],
  supermercado: ['supermercado', 'super', 'colmado', 'mercado', 'viveres', 'compra', 'arroz', 'habichuela', 'aceite', 'leche', 'huevo', 'carne', 'pan', 'cerveza', 'refresco', 'agua'],
  belleza: ['belleza', 'cosmetico', 'maquillaje', 'perfume', 'crema', 'cabello', 'una', 'salon', 'barberia', 'shampoo'],
  electronica: ['electronica', 'celular', 'telefono', 'iphone', 'samsung', 'computadora', 'laptop', 'tv', 'television', 'audifono', 'cargador', 'gaming', 'consola', 'nevera', 'estufa'],
  mascotas: ['mascota', 'perro', 'gato', 'veterinaria', 'veterinario', 'alimento perro', 'dog chow', 'pet'],
  hogar: ['hogar', 'mueble', 'sofa', 'cama', 'colchon', 'decoracion', 'cocina', 'mesa', 'silla', 'cortina'],
  papeleria: ['papeleria', 'libreria', 'cuaderno', 'lapiz', 'libro', 'utiles', 'escolar', 'oficina', 'impresion', 'copia'],
  repuestos: ['repuesto', 'pieza', 'carro', 'vehiculo', 'motor', 'moto', 'goma', 'llanta', 'aceite motor', 'bateria', 'freno'],
  alquiler_eventos: ['evento', 'fiesta', 'boda', 'cumpleanos', 'carpa', 'silla', 'mesa', 'sonido', 'inflable', 'decoracion fiesta'],
  alquiler_casas: ['alquiler casa', 'alquilar apartamento', 'renta casa', 'habitacion', 'apartamento', 'villa', 'penthouse', 'inmueble', 'residencia', 'alquiler'],
  venta_vehiculos: ['carro', 'venta carro', 'vendo carro', 'jeepeta', 'camioneta', 'moto', 'vehiculo', 'auto', 'toyota', 'honda', 'nissan', 'hyundai', 'bmw', 'ford', 'bote', 'camion'],
  bienes_raices: ['terreno', 'solar', 'bienes raices', 'propiedad', 'finca', 'casa venta', 'apartamento venta', 'local comercial', 'inversion inmobiliaria', 'constructora'],
  deportes: ['gym', 'deporte', 'fitness', 'pesas', 'futbol', 'baloncesto', 'bicicleta', 'boxeo', 'suplemento', 'proteina', 'tenis', 'camping', 'natacion'],
  servicios_digitales: ['diseño', 'logo', 'pagina web', 'app', 'programacion', 'redes sociales', 'marketing', 'seo', 'video', 'edicion', 'streaming', 'soporte tecnico'],
  joyeria: ['joya', 'anillo', 'collar', 'pulsera', 'arete', 'reloj', 'oro', 'plata', 'diamante', 'bisuteria', 'joyeria'],
  juguetes: ['juguete', 'juego', 'bebe', 'nino', 'muneca', 'peluche', 'coche bebe', 'cochecito', 'juguetes educativos'],
};

// Normaliza texto: minúsculas, sin acentos, sin espacios/símbolos
export const normBizText = (str) =>
  (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

// Devuelve los tipos de comercio a los que hace referencia lo que el usuario escribió
export const findBusinessTypesForQuery = (rawQuery) => {
  const q = normBizText(rawQuery);
  if (q.length < 3) return [];
  return Object.entries(BUSINESS_TYPES)
    .filter(([key, cfg]) => {
      const words = [
        cfg.label,
        ...(BUSINESS_KEYWORDS[key] || []),
        ...cfg.categories.map(([, lbl]) => lbl),
      ].map(normBizText).filter(Boolean);
      return words.some(w => w.includes(q) || (q.length >= 4 && w.length >= 4 && q.includes(w)));
    })
    .map(([key]) => key);
};

// Etiqueta legible de la sub-categoría de un producto
export const getCategoryLabel = (type, catKey) => {
  const cfg = BUSINESS_TYPES[type];
  const found = cfg?.categories.find(([k]) => k === catKey);
  return found ? found[1] : '';
};

export const RENTAL_PERIODS = [
  ['hora', '⏱️ Por Hora'],
  ['medio_dia', '🌤️ Medio Día (4h)'],
  ['dia', '📅 Por Día'],
  ['fin_semana', '🏖️ Fin de Semana'],
  ['semana', '🗓️ Por Semana'],
  ['mes', '📆 Por Mes'],
  ['deposito', '🛡️ Depósito Reembolsable'],
];

// Escalas de precio por cantidad (ropa / ventas al por mayor)
export const WHOLESALE_TIERS = [
  ['unidad', '1️⃣ Por Unidad', 1],
  ['media_docena', '📦 Media Docena (6)', 6],
  ['docena', '📦 Por Docena (12)', 12],
  ['tres_docenas', '📦 3 Docenas (36)', 36],
  ['seis_docenas', '📦 6 Docenas (72)', 72],
  ['doce_docenas', '🏭 12 Docenas (144)', 144],
  ['mayor', '🚚 Al por Mayor (300+)', 300],
];
