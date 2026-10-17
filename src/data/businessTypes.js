// src/data/businessTypes.js
// Configuración de tipos de comercio para el Portal Partner de Pedidos Listo.
// Cada tipo define: categorías del menú, etiquetas visibles al cliente y grupos
// de opciones que el cliente puede elegir (tallas, colores, modalidad, etc.).
// `rental: true` activa la tabla de precios de alquiler (hora / día / semana / mes).

export const BUSINESS_TYPES = {
  restaurante: {
    label: '🍔 Restaurante / Comida',
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
