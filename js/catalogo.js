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
// TEMA
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
if (btnTema) btnTema.addEventListener('click', toggleTema);

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
    } catch (error) { console.error('Error:', error); }
}

// =============================================
// CARGAR PRODUCTOS
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
            if (producto.activo !== false) {
                todosLosProductos.push({ id: doc.id, ...producto });
            }
        });
        
        if (todosLosProductos.length === 0) {
            contenedorProductos.innerHTML = '<div class="sin-resultados"><p>📦 No hay productos disponibles.</p></div>';
            return;
        }
        
        mostrarCollage(todosLosProductos);
    } catch (error) {
        console.error('Error:', error);
        contenedorProductos.innerHTML = '<div class="error"><p>❌ Error al cargar el catálogo.</p></div>';
    }
}

// =============================================
// COLLAGE DE PRODUCTOS
// =============================================
function mostrarCollage(productos) {
    contenedorProductos.innerHTML = '';
    contenedorProductos.style.display = 'grid';
    contenedorProductos.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    contenedorProductos.style.gap = '16px';
    
    if (productos.length === 0) {
        contenedorProductos.innerHTML = '<div class="sin-resultados"><p>🔍 No se encontraron productos.</p></div>';
        return;
    }
    
    productos.forEach((producto, index) => {
        const card = crearTarjetaCollage(producto, index);
        contenedorProductos.appendChild(card);
    });
}

// =============================================
// TARJETA COLLAGE CON CARRUSEL
// =============================================
function crearTarjetaCollage(producto, index) {
    const card = document.createElement('div');
    card.classList.add('producto-collage-card');
    
    // Carrusel de imágenes
    let carruselHTML = '<div class="collage-carousel" id="carousel_' + index + '">';
    carruselHTML += '<div class="carousel-track" id="track_' + index + '">';
    
    producto.fotos.forEach((url, i) => {
        carruselHTML += `
            <div class="carousel-slide">
                <img src="${url}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'" loading="lazy">
            </div>`;
    });
    
    carruselHTML += '</div>';
    
    // Flechas de navegación
    if (producto.fotos.length > 1) {
        carruselHTML += `
            <button class="carousel-btn carousel-prev" onclick="moverCarrusel('track_${index}', -1)">❮</button>
            <button class="carousel-btn carousel-next" onclick="moverCarrusel('track_${index}', 1)">❯</button>
            <div class="carousel-dots" id="dots_${index}">
                ${producto.fotos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="irASlide('track_${index}', ${i})"></span>`).join('')}
            </div>`;
    }
    
    carruselHTML += '</div>';
    
    // Categorías
    const catsNombres = producto.categorias ? producto.categorias.map(id => categoriasMap[id] || id) : [];
    const badgesHTML = catsNombres.map(cat => `<span class="categoria-badge">${cat}</span>`).join(' ');
    
    // WhatsApp
    const mensaje = `Hola, vi en OmniSV: *${producto.nombre}* ($${producto.precio.toFixed(2)}) y me interesa.`;
    const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    
    card.innerHTML = `
        ${carruselHTML}
        <div class="collage-info">
            <div class="categorias-badges">${badgesHTML}</div>
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            <p class="descripcion">${producto.descripcion || ''}</p>
            <a href="${linkWhatsApp}" class="btn-whatsapp" target="_blank">📱 Consultar por WhatsApp</a>
        </div>
    `;
    
    return card;
}

// =============================================
// FUNCIONES DEL CARRUSEL
// =============================================
window.moverCarrusel = function(trackId, direccion) {
    const track = document.getElementById(trackId);
    const slides = track.querySelectorAll('.carousel-slide');
    const slideWidth = slides[0].offsetWidth;
    const currentTransform = track.style.transform ? parseInt(track.style.transform.replace('translateX(', '').replace('px)', '')) : 0;
    const maxScroll = -(slideWidth * (slides.length - 1));
    
    let newPosition = currentTransform + (direccion * -slideWidth);
    
    if (newPosition > 0) newPosition = 0;
    if (newPosition < maxScroll) newPosition = maxScroll;
    
    track.style.transform = 'translateX(' + newPosition + 'px)';
    track.style.transition = 'transform 0.3s ease';
    
    // Actualizar dots
    const index = Math.abs(Math.round(newPosition / slideWidth));
    const carouselId = trackId.replace('track_', '');
    const dots = document.querySelectorAll('#dots_' + carouselId + ' .dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
};

window.irASlide = function(trackId, index) {
    const track = document.getElementById(trackId);
    const slides = track.querySelectorAll('.carousel-slide');
    const slideWidth = slides[0].offsetWidth;
    track.style.transform = 'translateX(' + (-slideWidth * index) + 'px)';
    track.style.transition = 'transform 0.3s ease';
    
    const carouselId = trackId.replace('track_', '');
    const dots = document.querySelectorAll('#dots_' + carouselId + ' .dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
};

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
    
    mostrarCollage(productosFiltrados);
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
    } catch (error) { console.error('Error:', error); }
}

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    cargarProductos();
    cargarTerminos();
});
