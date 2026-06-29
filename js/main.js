const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDowbjwckdCloq34fqoolTsXt2k7oykFH7dyA5HBOf5f74KbLK45DE8SFEQ0bPTIMN9p7hHP410OYe/pub?gid=804960981&single=true&output=csv"

const WSP = "56949255771";

const productos = [
  {
    id: 1, 
    cat: "alimentos",
    nombre: "Aceite Vegetal 5L",
    desc: "Botella de 5 litros de aceite vegetal puro. Ideal para cocina industrial, restaurants y almacenes. Disponible en caja.",
    precio: "Consultar precio",
    emoji: "🫙",
    tags: ["aceite", "alimentos", "cocina"]
  },
  {
    id: 2, cat: "limpieza",
    nombre: "Papel Higiénico (Paquete)",
    desc: "Paquete de papel higiénico doble hoja. Alta absorción. Disponible en distintas cantidades: 4, 8, 12 unidades.",
    precio: "Consultar precio",
    emoji: "🧻",
    tags: ["papel higiénico", "limpieza", "baño"]
  },
  {
    id: 3, cat: "limpieza",
    nombre: "Servilletas Okey",
    desc: "Servilletas Okey de papel suave. Pack económico para negocios de alimentación, cafeterías y eventos.",
    precio: "Consultar precio",
    emoji: "🗒️",
    tags: ["servilletas", "okey", "papel"]
  },
  {
    id: 4, cat: "congelados",
    nombre: "Papas Pre-Fritas",
    desc: "Bolsa de papas pre-fritas congeladas, listas para freír. Presentación para servicio de alimentación.",
    precio: "Consultar precio",
    emoji: "🍟",
    tags: ["papas fritas", "congelados", "alimentos"]
  },
  {
    id: 5, cat: "alimentos",
    nombre: "Jugos en Caja",
    desc: "Cajas de jugo de distintos sabores. Presentación 1L o 200ml. Disponibles por unidad o caja completa.",
    precio: "Consultar precio",
    emoji: "🧃",
    tags: ["jugos", "bebidas", "alimentos"]
  },
  {
    id: 6, cat: "limpieza",
    nombre: "Otros productos",
    desc: "Contamos con más artículos de limpieza, alimentos y cuidado del hogar. Consúltanos por WhatsApp.",
    precio: "Consultar",
    emoji: "📦",
    tags: ["varios", "productos"]
  }
];

let filtroActual = 'todos';

async function cargarProductosDesdeCSV() {
    try {
        const res = await fetch(SHEET_CSV_URL);
        const csvText = await res.text();
        const productosDesdeSheet = parcearCSV(csvText);
renderCards(productosDesdeSheet);
        console.log(productosDesdeSheet); 
    } catch (error) {
        console.error("Error al cargar productos desde CSV:", error);
    }
}

function parcearCSV(csvText) {
    const lienas = csvText.trim().split('\n');
    const headers = lienas[0].split(",").map(h => h.trim());
        const filas = lienas.slice(1).map(linea => {
        const valores = linea.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, -1)
            .map(v => v.replace(/,$/, "").replace(/^"|"$/g, "").trim());

        const objeto = {};
        headers.forEach((header, i) => {
            objeto[header] = valores[i] || "";
        });
        return objeto;
    });
    return filas;
}

function makeWSPLink(producto) {
  const msg = encodeURIComponent(`Hola! Me interesa el producto: *${producto.nombre}*. ¿Podría darme más información y precio?`);
  return `https://wa.me/${WSP}?text=${msg}`;
}

function renderCards(lista) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  lista.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.07}s`;
        const contenidoImagen = p.imagen_url
      ? `<img src="${p.imagen_url}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span style="font-size:4rem">📦</span>`;
    card.innerHTML = `
      <div class="card-img">
        <span class="card-cat">${p.categoria}</span>
        ${contenidoImagen}
      </div>
      <div class="card-body">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <div class="card-footer">
          <div class="precio">
            <span>Precio</span>
            <strong>${p.precio}</strong>
          </div>
          <a class="wsp-btn" href="${makeWSPLink(p)}" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrar(cat, btn) {
  filtroActual = cat;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const lista = cat === 'todos' ? productos : productos.filter(p => p.cat === cat);
  renderCards(lista);
}

// Render inicial
cargarProductosDesdeCSV();