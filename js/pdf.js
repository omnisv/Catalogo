// =============================================
// CATÁLOGO PDF - OMNI SV
// =============================================

const WHATSAPP_NUMERO = "50371312121";
const catalogoPdf = document.getElementById('catalogoPdf');
const terminosPdf = document.getElementById('terminosPdf');
const fechaActualizacion = document.getElementById('fechaActualizacion');

let categoriasMap = {};

// =============================================
// CARGAR CATEGORÍAS
// =============================================
async function cargarCategorias() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        snapshot.forEach(doc => {
            categoriasMap[doc.id] = doc.data().nombre;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// =============================================
// CARGAR CATÁLOGO
// =============================================
async function cargarCatalogoCompleto() {
    try {
        const snapshot = await db.collection('productos').get();
        
        if (snapshot.empty) {
            catalogoPdf.innerHTML = '<p class="vacio">No hay productos.</p>';
            return;
        }
        
        // Agrupar por categoría
        const productosPorCategoria = {};
        
        snapshot.forEach(doc => {
            const producto = doc.data();
            const cats = producto.categorias || ['sin-categoria'];
            
            cats.forEach(catId => {
                const catNombre = categoriasMap[catId] || catId;
                if (!productosPorCategoria[catNombre]) {
                    productosPorCategoria[catNombre] = [];
                }
                // Evitar duplicados si el producto tiene múltiples categorías
                if (!productosPorCategoria[catNombre].find(p => p.nombre === producto.nombre)) {
                    productosPorCategoria[catNombre].push(producto);
                }
            });
        });
        
        let html = '';
        for (const [categoria, productos] of Object.entries(productosPorCategoria)) {
            html += `<div class="categoria-seccion">
                <h2 class="categoria-titulo">${categoria.toUpperCase()}</h2>
                <div class="productos-grid-pdf">`;
            
            productos.forEach(producto => {
                const fotosAdicionales = producto.fotos.length > 1 
                    ? `<p class="fotos-adicionales">📸 +${producto.fotos.length - 1} foto(s)</p>` : '';
                
                html += `
                    <div class="producto-pdf-item">
                        <div class="pdf-img-container">
                            <img src="${producto.fotos[0]}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
                        </div>
                        <div class="pdf-info">
                            <h3>${producto.nombre}</h3>
                            <p class="precio">$${producto.precio.toFixed(2)}</p>
                            <p class="descripcion-pdf">${producto.descripcion || ''}</p>
                            ${fotosAdicionales}
                        </div>
                    </div>`;
            });
            
            html += '</div></div>';
        }
        
        catalogoPdf.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        catalogoPdf.innerHTML = '<p class="error">Error al cargar.</p>';
    }
}

// =============================================
// CARGAR TÉRMINOS
// =============================================
async function cargarTerminosPdf() {
    try {
        const doc = await db.collection('configuracion').doc('terminos').get();
        if (doc.exists) {
            terminosPdf.innerHTML = `
                <h4>📋 Términos y Condiciones</h4>
                <div class="terminos-texto">${doc.data().texto.replace(/\n/g, '<br>')}</div>
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
    fechaActualizacion.textContent = new Date().toLocaleDateString('es-SV', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    await cargarCategorias();
    cargarCatalogoCompleto();
    cargarTerminosPdf();
    
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && (e.key === 's' || e.key === 'u')) || e.key === 'F12') {
            e.preventDefault();
        }
    });
});
