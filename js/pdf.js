// =============================================
// CATÁLOGO COMPLETO PDF - OMNI SV
// =============================================

const WHATSAPP_NUMERO = "50371312121";
const catalogoPdf = document.getElementById('catalogoPdf');
const terminosPdf = document.getElementById('terminosPdf');
const fechaActualizacion = document.getElementById('fechaActualizacion');

// =============================================
// CARGAR CATÁLOGO COMPLETO
// =============================================
async function cargarCatalogoCompleto() {
    try {
        const snapshot = await db.collection('productos').orderBy('categoria').get();
        
        if (snapshot.empty) {
            catalogoPdf.innerHTML = '<p class="vacio">No hay productos en el catálogo.</p>';
            return;
        }
        
        const productosPorCategoria = {};
        snapshot.forEach(doc => {
            const producto = doc.data();
            const categoria = producto.categoria || 'sin-categoria';
            if (!productosPorCategoria[categoria]) {
                productosPorCategoria[categoria] = [];
            }
            productosPorCategoria[categoria].push(producto);
        });
        
        let html = '';
        for (const [categoria, productos] of Object.entries(productosPorCategoria)) {
            html += `<div class="categoria-seccion">
                <h2 class="categoria-titulo">${categoria.toUpperCase()}</h2>
                <div class="productos-grid-pdf">`;
            
            productos.forEach(producto => {
                const fotosAdicionales = producto.fotos.length > 1 
                    ? `<p class="fotos-adicionales">📸 +${producto.fotos.length - 1} foto(s) adicional(es)</p>` 
                    : '';
                
                html += `
                    <div class="producto-pdf-item">
                        <div class="pdf-img-container">
                            <img src="${producto.fotos[0]}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
                        </div>
                        <div class="pdf-info">
                            <h3>${producto.nombre}</h3>
                            <p class="precio">$${producto.precio.toFixed(2)}</p>
                            <p class="descripcion-pdf">${producto.descripcion || 'Sin descripción'}</p>
                            ${fotosAdicionales}
                        </div>
                    </div>`;
            });
            
            html += `</div></div>`;
        }
        
        catalogoPdf.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        catalogoPdf.innerHTML = '<p class="error">Error al cargar el catálogo.</p>';
    }
}

// =============================================
// CARGAR TÉRMINOS
// =============================================
async function cargarTerminosPdf() {
    try {
        const doc = await db.collection('configuracion').doc('terminos').get();
        if (doc.exists) {
            const data = doc.data();
            terminosPdf.innerHTML = `
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
document.addEventListener('DOMContentLoaded', () => {
    const fecha = new Date();
    fechaActualizacion.textContent = fecha.toLocaleDateString('es-SV', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    cargarCatalogoCompleto();
    cargarTerminosPdf();
    
    // Protecciones básicas
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && (e.key === 's' || e.key === 'u')) || e.key === 'F12') {
            e.preventDefault();
        }
    });
});
