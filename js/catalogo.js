// =============================================
// CATÁLOGO OMNI SV - Lógica del catálogo público
// =============================================

const WHATSAPP_NUMERO = "50371312121";

// Elementos del DOM
const contenedorProductos = document.getElementById('contenedorProductos');
const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtroCategoria');
const terminosContainer = document.getElementById('terminosCondiciones');

let todosLosProductos = [];

// =============================================
// CARGAR PRODUCTOS
// =============================================
async function cargarProductos() {
    try {
        const snapshot = await db.collection('productos')
            .orderBy('fechaCreacion', 'desc')
            .get();
        
        todosLosProductos = [];
        
        if (snapshot.empty) {
            contenedorProductos.innerHTML = `
                <div class="sin-resultados">
                    <p>📦 No hay productos disponibles en este momento.</p>
                </div>`;
            return;
        }
        
        snapshot.forEach(doc => {
            todosLosProductos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        mostrarProductos(todosLosProductos);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = `
            <div class="error">
                <p>❌ Error al cargar el catálogo. Intenta de nuevo más tarde.</p>
            </div>`;
    }
}

// =============================================
// MOSTRAR PRODUCTOS
// =============================================
function mostrarProductos(productos) {
    contenedorProductos.innerHTML = '';
    
    if (productos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="sin-resultados">
                <p>🔍 No se encontraron productos con esos criterios.</p>
            </div>`;
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
    
    // Galería de imágenes
    let galeriaHTML = '<div class="galeria">';
    galeriaHTML += `<img src="${producto.fotos[0]}" 
                         alt="${producto.nombre}" 
                         class="foto-principal"
                         onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">`;
    
    if (producto.fotos.length > 1) {
        galeriaHTML += '<div class="miniaturas">';
        producto.fotos.forEach((url, index) => {
            galeriaHTML += `
                <img src="${url}" 
                     alt="Foto ${index + 1}" 
                     class="miniatura ${index === 0 ? 'activa' : ''}" 
                     data-full-url="${url}"
                     onerror="this.style.display='none'">`;
        });
        galeriaHTML += '</div>';
    }
    galeriaHTML += '</div>';
    
    // WhatsApp link
    const mensaje = `Hola, vi en el catálogo OmniSV: *${producto.nombre}* ($${producto.precio.toFixed(2)}) y me interesa.`;
    const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    
    card.innerHTML = `
        ${galeriaHTML}
        <div class="info-producto">
            <span class="categoria-badge">${producto.categoria}</span>
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <a href="${linkWhatsApp}" class="btn-whatsapp" target="_blank">
                📱 Consultar por WhatsApp
            </a>
        </div>
    `;
    
    // Cambiar foto principal al hacer clic en miniaturas
    const fotoPrincipal = card.querySelector('.foto-principal');
    const miniaturas = card.querySelectorAll('.miniatura');
    
    miniaturas.forEach(mini => {
        mini.addEventListener('click', function() {
            fotoPrincipal.src = this.dataset.fullUrl;
            miniaturas.forEach(m => m.classList.remove('activa'));
            this.classList.add('activa');
        });
    });
    
    return card;
}

// =============================================
// FILTROS Y BÚSQUEDA
// =============================================
function filtrarProductos() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const categoriaSeleccionada = filtroCategoria.value;
    
    const productosFiltrados = todosLosProductos.filter(producto => {
        const coincideTexto = textoBusqueda === '' || 
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(textoBusqueda));
        
        const coincideCategoria = categoriaSeleccionada === 'todas' || 
            producto.categoria === categoriaSeleccionada;
        
        return coincideTexto && coincideCategoria;
    });
    
    mostrarProductos(productosFiltrados);
}

buscador.addEventListener('input', filtrarProductos);
filtroCategoria.addEventListener('change', filtrarProductos);

// =============================================
// CARGAR TÉRMINOS Y CONDICIONES
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
        console.error('Error al cargar términos:', error);
    }
}

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTerminos();
});
