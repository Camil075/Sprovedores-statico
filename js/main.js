const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUItWTU1FOvPx3xLFS4JRAXZYV4yc3q9zj66W-fQrjG1un_QMXzHIVPHQ0Pwj3eQ/pub?gid=1121183582&single=true&output=csv";

// Números de contacto de WhatsApp
const WSP1 = "56942597455";
const WSP2 = "56942131347";

let filtroActual = 'todos';
let textoBusqueda = '';
let productosCSV = [];

// Productos por defecto si falla la conexión con Google Sheets
const productosDefault = [
  {
    categoria: "alimentos",
    nombre: "Aceite Vegetal 5L",
    descripcion: "Botella de 5 litros de aceite vegetal puro. Ideal para cocina industrial, restaurants y almacenes.",
    precio: "Consultar precio",
    detalle_precio: "x Caja (4 unids)",
    imagen_url: ""
  },
  {
    categoria: "limpieza",
    nombre: "Papel Higiénico (Paquete)",
    descripcion: "Paquete de papel higiénico doble hoja. Alta absorción. Disponible en distintas cantidades.",
    precio: "Consultar precio",
    detalle_precio: "x Paquete (12 rollos)",
    imagen_url: ""
  },
  {
    categoria: "limpieza",
    nombre: "Servilletas Okey",
    descripcion: "Servilletas Okey de papel suave. Pack económico para negocios de alimentación y eventos.",
    precio: "Consultar precio",
    detalle_precio: "x Pack",
    imagen_url: ""
  },
  {
    categoria: "congelados",
    nombre: "Papas Pre-Fritas",
    descripcion: "Bolsa de papas pre-fritas congeladas, listas para freír. Presentación para servicio de alimentación.",
    precio: "Consultar precio",
    detalle_precio: "x Bolsa 2.5kg",
    imagen_url: ""
  },
  {
    categoria: "alimentos",
    nombre: "Jugos en Caja",
    descripcion: "Cajas de jugo de distintos sabores. Presentación 1L o 200ml. Disponibles por unidad o caja.",
    precio: "Consultar precio",
    detalle_precio: "x Caja (24 unids)",
    imagen_url: ""
  },
  {
    categoria: "limpieza",
    nombre: "Otros productos",
    descripcion: "Contamos con más artículos de limpieza, alimentos y cuidado del hogar. Consúltanos por WhatsApp.",
    precio: "Consultar",
    detalle_precio: "Por volumen",
    imagen_url: ""
  }
];

// Lógica del modal de WhatsApp
let mensajeWspActual = "";

function abrirModalWsp(mensaje) {
  mensajeWspActual = mensaje || "Hola, quiero consultar sobre sus productos";

  const link1 = document.getElementById("wsp-modal-link-1");
  const link2 = document.getElementById("wsp-modal-link-2");

  if (link1 && link2) {
    link1.href = `https://wa.me/${WSP1}?text=${encodeURIComponent(mensajeWspActual)}`;
    link2.href = `https://wa.me/${WSP2}?text=${encodeURIComponent(mensajeWspActual)}`;
  }

  const overlay = document.getElementById("wsp-modal-overlay");
  if (overlay) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function cerrarModalWsp() {
  const overlay = document.getElementById("wsp-modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Cerrar con tecla Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarModalWsp();
  }
});

async function cargarProductosDesdeCSV() {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) {
      throw new Error(`Google Sheets respondió con estado HTTP ${res.status}`);
    }
    const csvText = await res.text();
    const productos = parcearCSV(csvText);
    if (productos && productos.length > 0) {
      productosCSV = productos;
      localStorage.setItem('sproveedores_productos_cache', JSON.stringify(productosCSV));
    } else {
      throw new Error("Formato de CSV inválido o vacío");
    }
  } catch (error) {
    console.error("Error al cargar productos desde CSV:", error);
    // Intentar cargar desde cache local o fallback por defecto
    const cache = localStorage.getItem('sproveedores_productos_cache');
    if (cache) {
      try {
        productosCSV = JSON.parse(cache);
      } catch (e) {
        productosCSV = productosDefault;
      }
    } else {
      productosCSV = productosDefault;
    }
  } finally {
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'none';
    renderFiltros(productosCSV);
    aplicarFiltros();
  }
}

function renderFiltros(lista) {
  const categorias = [...new Set(lista.map(p => p.categoria).filter(Boolean))];
  const contenedor = document.getElementById('filtros');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="filter-bar-container">
      <!-- Selector desplegable de Categorías -->
      <div class="filter-group">
        <label for="category-select" class="filter-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Categoría:
        </label>
        <div class="select-wrapper">
          <select id="category-select" class="category-select" onchange="filtrarCategoria(this.value)">
            <option value="todos">Todas las categorías (${lista.length})</option>
            ${categorias.map(cat => {
              const cantidad = lista.filter(p => p.categoria === cat).length;
              const selected = cat === filtroActual ? 'selected' : '';
              return `<option value="${cat}" ${selected}>${cat} (${cantidad})</option>`;
            }).join('')}
          </select>
          <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Buscador de Productos -->
      <div class="search-group">
        <label for="search-input-store" class="filter-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar:
        </label>
        <div class="search-input-wrapper">
          <input type="text" id="search-input-store" class="store-search-input" placeholder="Buscar por nombre..." value="${textoBusqueda}" oninput="filtrarBusqueda(this.value)">
          <svg class="search-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>
    </div>
  `;
}

function parcearCSV(csvText) {
  if (!csvText || csvText.trim().startsWith('<')) {
    return [];
  }
  const lienas = csvText.trim().split('\n');
  if (lienas.length < 2) return [];

  const headersRaw = lienas[0].split(",").map(h => h.trim());
  const headersLower = headersRaw.map(h => h.toLowerCase());

  if (!headersLower.includes('nombre') && !headersLower.includes('categoria')) {
    return [];
  }

  const filas = lienas.slice(1).map(linea => {
    const valores = linea.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, -1)
      .map(v => v.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"').trim());

    const objeto = {};
    headersRaw.forEach((header, i) => {
      const keyLower = header.toLowerCase();
      const val = valores[i] || "";

      if (keyLower === 'detalle_precio' || keyLower === 'detalle precio' || keyLower === 'detalle' || keyLower === 'unidad') {
        objeto.detalle_precio = val;
      } else {
        objeto[header] = val;
        objeto[keyLower] = val;
      }
    });

    if (!objeto.detalle_precio) {
      objeto.detalle_precio = objeto['detalle_precio'] || objeto['detalle precio'] || objeto['detalle'] || objeto['unidad'] || "";
    }

    return objeto;
  });
  return filas.filter(p => p.nombre);
}

function renderCards(lista) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!lista || lista.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
        <p style="font-size: 1.2rem; font-weight: 500;">No se encontraron productos que coincidan con la búsqueda.</p>
      </div>
    `;
    return;
  }

  lista.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.07}s`;

    const nombre = p.nombre || 'Producto';
    const categoria = p.categoria || 'General';
    const descripcion = p.descripcion || '';
    const precio = p.precio || 'Consultar';
    const detallePrecio = p.detalle_precio || p.detalle || p['detalle precio'] || '';

    const contenidoImagen = p.imagen_url
      ? `<img src="${p.imagen_url}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span style="font-size:4rem">📦</span>`;

    const contenidoDetalle = detallePrecio ? `<span class="precio-detalle">${detallePrecio}</span>` : '';

    const mensajeProducto = `Hola! Me interesa el producto: *${nombre}*. ¿Podría darme más información y precio?`;

    card.innerHTML = `
      <div class="card-img">
        <span class="card-cat">${categoria}</span>
        ${contenidoImagen}
      </div>
      <div class="card-body">
        <h3>${nombre}</h3>
        <p>${descripcion}</p>
        <div class="card-footer">
          <div class="precio">
            <span>Precio</span>
            <strong>${precio}</strong>
            ${contenidoDetalle}
          </div>
          <a class="wsp-btn" href="#" onclick="abrirModalWsp('${mensajeProducto.replace(/'/g, "\\'")}'); return false;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrarCategoria(cat) {
  filtroActual = cat || 'todos';
  aplicarFiltros();
}

function filtrarBusqueda(query) {
  textoBusqueda = (query || '').toLowerCase().trim();
  aplicarFiltros();
}

function aplicarFiltros() {
  let resultado = productosCSV;

  if (filtroActual && filtroActual !== 'todos') {
    resultado = resultado.filter(p => p.categoria === filtroActual);
  }

  if (textoBusqueda) {
    resultado = resultado.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const detalle = (p.detalle_precio || p.detalle || '').toLowerCase();
      const cat = (p.categoria || '').toLowerCase();
      return nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda) || detalle.includes(textoBusqueda) || cat.includes(textoBusqueda);
    });
  }

  renderCards(resultado);
}

// Render inicial
cargarProductosDesdeCSV();