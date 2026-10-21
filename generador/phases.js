const PHASES = [
  { id: "k", name: "Arranque", mod: "Módulos 1–2", tasks: [
    { id: "k1", name: "Kickoff con yavendió!", d: 0, len: 1, desc: "Qué es yavendió!, los 3 problemas que resuelve (inmediatez, tareas repetitivas, publicidad fuera de horario) y el plan de 2 semanas.", where: "Videollamada con yavendió!.", check: "Asistió y conoce la fecha de salida en vivo." },
    { id: "k2", name: "Crear cuenta en ya.onl", d: 0, len: 1, desc: "Registro, datos de la empresa (país, moneda, rubro) y entrada al asistente Yago.", where: "<code>ya.onl/sign-up</code> → crear organización → llega a <code>/dashboard/get-started</code>. Yago puede armar ahí una primera versión del vendedor en minutos.", check: "La cuenta llega a get-started." },
    { id: "k3", name: "Recorrido por la plataforma", d: 0, len: 1, desc: "Ubicarse antes de configurar: productos, vendedor, canales, conversaciones, pedidos y métricas.", where: "Menú lateral del dashboard. Tutoriales en <code>/learn</code>.", check: "Sabe dónde está cada sección." },
  ]},
  { id: "c", name: "Catálogo", mod: "Módulo 3", tasks: [
    { id: "c1", name: "Elegir cómo cargar el catálogo", d: 1, len: 1, desc: "Catálogo chico o nuevo: manual o Excel. Catálogo grande en Shopify: sincronización. También hay carga por PDF.", where: "<code>/dashboard/products</code>", check: "Método elegido según el tamaño del catálogo." },
    { id: "c2", name: "Cargar productos", d: 1, len: 1, desc: "Manual (Nuevo producto), Excel/CSV, PDF o Shopify. Con Shopify, precio, stock, fotos y descripción se editan siempre en Shopify.", where: "<code>/dashboard/products</code>", check: "Catálogo completo en el panel." },
    { id: "c3", name: "Revisar precios, imágenes y stock", d: 1, len: 1, desc: "Cada producto con precio, foto, variantes y disponibilidad correctos.", where: "<code>/dashboard/products</code>", check: "Ningún producto sin precio ni imagen, y todos «Disponible» o agotados a propósito." },
  ]},
  { id: "n", name: "Negocio y personalidad", mod: "Módulo 4", tasks: [
    { id: "n1", name: "Mi negocio", d: 2, len: 1, desc: "Descripción del negocio, público objetivo y redes sociales. El vendedor no inventa: es un espejo del negocio.", where: "<code>/dashboard/assistant-settings/my-business</code>", check: "Descripción clara del negocio y su público." },
    { id: "n2", name: "Personalidad del vendedor", d: 2, len: 1, desc: "Nombre, género, tono, largo de respuesta, emojis y palabras a evitar.", where: "<code>/dashboard/assistant-settings/seller-configure?tab=personality</code>", check: "Nombre y tono definidos." },
  ]},
  { id: "r", name: "Mensajes, envíos y pagos", mod: "Módulo 5", tasks: [
    { id: "r2", name: "Mensajes", d: 3, len: 1, desc: "Bienvenida, despedida, derivación a humano y horarios de atención.", where: "Configuración del vendedor, en <code>/dashboard/assistant-settings</code>.", check: "Los 4 mensajes configurados." },
    { id: "r3", name: "Envíos y plazos", d: 3, len: 1, desc: "Zonas de cobertura, tipo de entrega, costos y tiempos.", where: "<code>/dashboard/assistant-settings/delivery</code>", check: "Zonas activas y el vendedor cotiza bien un envío." },
    { id: "r4", name: "Métodos de pago", d: 3, len: 1, desc: "Mercado Pago (link de pago automático en el chat) o Yape, Plin y transferencia (se validan a mano con el comprobante).", where: "<code>/dashboard/assistant-settings/payments</code>", check: "El vendedor ofrece solo los medios configurados." },
  ]},
  { id: "b", name: "Base de conocimiento", mod: "Módulo 6", tasks: [
    { id: "b1", name: "Preguntas frecuentes", d: 4, len: 1, desc: "7 categorías: negocio, productos, precios y pagos, envíos, cambios y devoluciones, datos del checkout, y clientes frustrados. Si no hay política definida, mejor no responder sobre eso.", where: "Base de conocimiento, en la configuración del vendedor.", check: "Al menos las 3 primeras categorías completas." },
  ]},
  { id: "f", name: "Flujos de venta", mod: "La etapa más pesada", tasks: [
    { id: "f1", name: "Revisar el flujo base", d: 5, len: 1, desc: "Entiende el recorrido que ya trae tu vendedor: saludo, diagnóstico, catálogo, carrito y checkout, confirmación y despedida.", where: "<code>/dashboard/assistant-settings/journeys</code>", check: "Conoces cada etapa del flujo y qué hace el vendedor en ella." },
    { id: "f2", name: "Ajustar el flujo a tu negocio", d: 5, len: 3, desc: "Adapta cada etapa con lo que ya cargaste: qué pregunta el vendedor para recomendar, cómo presenta los productos, cómo arma el carrito y cómo cierra el pago. Es la parte que más tiempo toma.", where: "<code>/dashboard/assistant-settings/journeys</code>", check: "Cada etapa del flujo refleja cómo vendes tú." },
    { id: "f3", name: "Publicar los flujos", d: 7, len: 1, desc: "Guarda y publica los cambios para que el vendedor los use.", where: "<code>/dashboard/assistant-settings/journeys</code>", check: "Arriba a la derecha dice «✓ Guardado», no «Cambios sin guardar»." },
  ]},
  { id: "p", name: "Pruebas, pedidos y seguimiento", mod: "Módulos 7–8", tasks: [
    { id: "p1", name: "Probar una compra con el vendedor", d: 6, len: 2, desc: "Compra completa como si fuera un cliente: producto, envío, pago y confirmación. Prueba mientras ajustas los flujos y repite hasta que cierre bien.", where: "<code>/dashboard/assistant-settings/journeys</code> → «Prueba tu vendedor». «Nueva prueba» para repetir.", check: "Al conversar se resalta el bloque del flujo y la compra cierra con total." },
    { id: "p2", name: "Gestión de pedidos en el chat", d: 7, len: 1, desc: "Crear y consultar el pedido desde la conversación: estado, cliente, productos, pago y entrega.", where: "Conversaciones: bandeja unificada de WhatsApp e Instagram.", check: "Sabe crear y actualizar un pedido desde un chat." },
    { id: "p3", name: "Filtros y recordatorios", d: 7, len: 1, desc: "Filtros (sin responder, pedidos pendientes, clientes interesados) y recordatorios (sin respuesta, pedidos incompletos a 1 h, 24 h o 3 días, pago pendiente).", where: "Conversaciones → filtros y recordatorios.", check: "Recordatorio de pedido incompleto activo." },
  ]},
  { id: "w", name: "Conexión con Meta", mod: "Módulo 10", tasks: [
    { id: "w1", name: "Requisitos de Meta listos", d: 8, len: 1, desc: "Admin del Business Manager, página de Facebook vinculada, Instagram profesional, cuenta de Meta Ads activa y un número que pueda registrarse en WhatsApp Business Platform.", where: "Meta Business Suite (<code>business.facebook.com</code>).", check: "Portfolio sin restricciones y con todos los activos." },
    { id: "w2", name: "Conectar WhatsApp", d: 8, len: 1, desc: "Coexistence si el número ya se usa en WhatsApp Business; conexión API si es un número nuevo o dedicado.", where: "Pantalla final de <code>/dashboard/get-started</code> → «Conectar WhatsApp».", check: "Un mensaje de prueba entra al inbox." },
    { id: "w3", name: "Conectar Instagram y Meta Ads", d: 8, len: 1, desc: "Se conectan en el mismo flujo que WhatsApp: captación, atención y medición en un solo lugar.", where: "Mismo flujo de conexión con Meta, desde <code>/dashboard/get-started</code>.", check: "Un DM de prueba entra al inbox y la cuenta de Ads aparece conectada." },
  ]},
  { id: "g", name: "Salida en vivo", mod: "Módulo 9 y cierre", tasks: [
    { id: "g1", name: "Probar su vendedor en su número", d: 9, len: 1, desc: "El merchant le escribe a su propio número y ve cómo responde con todo lo configurado. No tiene que estar perfecto para vender.", where: "Su WhatsApp e Instagram.", check: "El vendedor responde en el canal real." },
    { id: "g2", name: "Checklist final", d: 9, len: 1, desc: "Catálogo, negocio y personalidad, mensajes, envíos y pagos, preguntas frecuentes, flujos de venta, y WhatsApp conectado y probado.", where: "Revisión con yavendió! en la sesión de dudas.", check: "Los 7 puntos del checklist en verde." },
    { id: "g3", name: "Métricas y Meta Ads", d: 9, len: 1, desc: "Conversaciones, tiempos de respuesta, pedidos y conversión; qué campañas generan conversaciones y cuáles terminan en venta.", where: "Métricas del dashboard.", check: "Sabe leer sus métricas principales." },
    { id: "g4", name: "Listo para vender", d: 9, len: 1, milestone: true, desc: "El merchant vende con su vendedor IA por su cuenta.", where: "—", check: "Cierre del seguimiento de 2 semanas." },
  ]},
];
