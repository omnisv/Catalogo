// =============================================
// CATÁLOGO OMNI SV - Público
// =============================================

const WHATSAPP_NUMERO = "50371312121";

const contenedorProductos = document.getElementById('contenedorProductos');
const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtroCategoria');
const terminosContainer = document.getElementById('terminosCondiciones');
const btnTema = document.getElementById('btnTema');

let todosLosProductos = [];
let categoriasMap = {};

// =============================================
// TEMA OSCURO/CLARO
// =============================================
function toggleTema() {
    const html = document.documentElement;
    const temaActual = html.getAttribute('data-theme');
    const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('tema', nuevoTema);
}

const temaGuardado = localStorage.getItem('tema') || 'light';
document.documentElement.setAttribute('data-theme', temaGuardado);

if (btnTema) {
    btnTema.addEventListener('click', toggleTema);
}

// =============================================
// CARGAR CATEGORÍAS
// =============================================
async function cargarCategorias() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        filtroCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
        
        snapshot.forEach(doc => {
            const categoria = doc.data();
            categoriasMap[doc.id] = categoria.nombre;
            filtroCategoria.innerHTML += `<option value="${doc.id}">${categoria.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// =============================================
// CARGAR PRODUCTOS (solo activos)
// =============================================
async function cargarProductos() {
    try {
        const snapshot = await db.collection('productos').orderBy('fechaCreacion', 'desc').get();
        todosLosProductos = [];
        
        if (snapshot.empty) {
            contenedorProductos.innerHTML = '<div class="sin-resultados"><p>📦 No hay productos disponibles.</p></div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const producto = doc.data();
            // SOLO mostrar productos activos
            if (producto.activo !== false) {
                todosLosProductos.push({ id: doc.id, ...producto });
            }
        });
        
        if (todosLosProductos.length === 0) {
            contenedorProductos.innerHTML = '<div class="sin-resultados"><p>📦 No hay productos disponibles en este momento.</p></div>';
            return;
        }
        
        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error('Error:', error);
        contenedorProductos.innerHTML = '<div class="error"><p>❌ Error al cargar el catálogo.</p></div>';
    }
}

// =============================================
// MOSTRAR PRODUCTOS
// =============================================
function mostrarProductos(productos) {
    contenedorProductos.innerHTML = '';
    
    if (productos.length === 0) {
        contenedorProductos.innerHTML = '<div class="sin-resultados"><p>🔍 No se encontraron productos.</p></div>';
        return;
    }
    
    productos.forEach(producto => {
        const card = crearTarjetaProducto(producto);
        contenedorProductos.appendChild(card);
    });
}

// =============================================
// CREAR TARJETA DE PRODUCTO
// =============================================
function crearTarjetaProducto(producto) {
    const card = document.createElement('div');
    card.classList.add('producto-card');
    
    // Galería con imagen adaptable
    let galeriaHTML = '<div class="galeria">';
    galeriaHTML += `<img src="${producto.fotos[0]}" 
                         alt="${producto.nombre}" 
                         class="foto-principal"
                         onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'"
                         loading="lazy">`;
    
    if (producto.fotos.length > 1) {
        galeriaHTML += '<div class="miniaturas">';
        producto.fotos.forEach((url, index) => {
            galeriaHTML += `<img src="${url}" 
                                 alt="Foto ${index + 1}" 
                                 class="miniatura ${index === 0 ? 'activa' : ''}" 
                                 data-full-url="${url}"
                                 onerror="this.style.display='none'"
                                 loading="lazy">`;
        });
        galeriaHTML += '</div>';
    }
    galeriaHTML += '</div>';
    
    // Categorías como badges
    const catsNombres = producto.categorias 
        ? producto.categorias.map(id => categoriasMap[id] || id)
        : [];
    const badgesHTML = catsNombres.map(cat => 
        `<span class="categoria-badge">${cat}</span>`
    ).join(' ');
    
    // WhatsApp link
    const mensaje = `Hola, vi en OmniSV: *${producto.nombre}* ($${producto.precio.toFixed(2)}) y me interesa.`;
    const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    
    card.innerHTML = `
        ${galeriaHTML}
        <div class="info-producto">
            <div class="categorias-badges">${badgesHTML}</div>
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <a href="${linkWhatsApp}" class="btn-whatsapp" target="_blank">
                📱 Consultar por WhatsApp
            </a>
        </div>
    `;
    
    // Eventos para cambiar foto principal
    const fotoPrincipal = card.querySelector('.foto-principal');
    card.querySelectorAll('.miniatura').forEach(mini => {
        mini.addEventListener('click', function() {
            fotoPrincipal.src = this.dataset.fullUrl;
            card.querySelectorAll('.miniatura').forEach(m => m.classList.remove('activa'));
            this.classList.add('activa');
        });
    });
    
    return card;
}

// =============================================
// FILTROS
// =============================================
function filtrarProductos() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const categoriaSeleccionada = filtroCategoria.value;
    
    const productosFiltrados = todosLosProductos.filter(producto => {
        const coincideTexto = textoBusqueda === '' || 
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(textoBusqueda));
        
        const coincideCategoria = categoriaSeleccionada === 'todas' || 
            (producto.categorias && producto.categorias.includes(categoriaSeleccionada));
        
        return coincideTexto && coincideCategoria;
    });
    
    mostrarProductos(productosFiltrados);
}

buscador.addEventListener('input', filtrarProductos);
filtroCategoria.addEventListener('change', filtrarProductos);

// =============================================
// CARGAR TÉRMINOS
// =============================================
async function cargarTerminos() {
    try {
        const doc = await db.collection('configuracion').doc('terminos').get();
        if (doc.exists && terminosContainer) {
            const data = doc.data();
            terminosContainer.innerHTML = `
                <h4>📋 Términos y Condiciones</h4>
                <div class="terminos-texto">${data.texto.replace(/\n/g, '<br>')}</div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    cargarProductos();
    cargarTerminos();
});