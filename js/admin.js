// =============================================
// PANEL DE ADMINISTRACIÓN - OMNI SV
// =============================================

const ADMIN_USER = "omnisv";
const ADMIN_PASS = "omniSV_26";

// Elementos del DOM
const pantallaLogin = document.getElementById('pantallaLogin');
const panelAdmin = document.getElementById('panelAdmin');
const formLogin = document.getElementById('formLogin');
const errorLogin = document.getElementById('errorLogin');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const formProducto = document.getElementById('formProducto');
const contenedorUrls = document.getElementById('contenedorUrls');
const btnAgregarUrl = document.getElementById('btnAgregarUrl');
const listaProductosAdmin = document.getElementById('listaProductosAdmin');
const btnGuardarTerminos = document.getElementById('btnGuardarTerminos');
const terminosTexto = document.getElementById('terminosTexto');

// =============================================
// LOGIN
// =============================================
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        pantallaLogin.style.display = 'none';
        panelAdmin.style.display = 'block';
        errorLogin.style.display = 'none';
        
        cargarProductosAdmin();
        cargarTerminosAdmin();
        
        document.getElementById('usuario').value = '';
        document.getElementById('password').value = '';
    } else {
        errorLogin.style.display = 'block';
        document.getElementById('password').value = '';
    }
});

btnCerrarSesion.addEventListener('click', () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        pantallaLogin.style.display = 'block';
        panelAdmin.style.display = 'none';
        document.getElementById('password').value = '';
    }
});

// =============================================
// PESTAÑAS
// =============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        if (tab === 'productos') {
            document.getElementById('seccionProductos').classList.add('active');
        } else if (tab === 'terminos') {
            document.getElementById('seccionTerminos').classList.add('active');
        }
    });
});

// =============================================
// GESTIÓN DE URLs
// =============================================
btnAgregarUrl.addEventListener('click', () => {
    const nuevaEntrada = document.createElement('div');
    nuevaEntrada.classList.add('url-entry');
    nuevaEntrada.innerHTML = `
        <input type="url" class="url-foto" placeholder="https://ejemplo.com/foto.jpg" required>
        <button type="button" class="btn-eliminar-url" title="Eliminar">✕</button>
    `;
    contenedorUrls.appendChild(nuevaEntrada);
    
    nuevaEntrada.querySelector('.btn-eliminar-url').addEventListener('click', () => {
        if (document.querySelectorAll('.url-entry').length > 1) {
            contenedorUrls.removeChild(nuevaEntrada);
        } else {
            alert('Debe mantener al menos una URL de foto');
        }
    });
});

// =============================================
// GUARDAR PRODUCTO
// =============================================
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    
    const inputsUrl = document.querySelectorAll('.url-foto');
    const fotos = [];
    inputsUrl.forEach(input => {
        const valor = input.value.trim();
        if (valor !== '') fotos.push(valor);
    });
    
    if (fotos.length === 0) {
        alert('Debe agregar al menos una URL de foto válida');
        return;
    }
    
    const producto = {
        nombre,
        precio,
        categoria,
        descripcion,
        fotos,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('productos').add(producto);
        alert('✅ Producto guardado exitosamente');
        formProducto.reset();
        contenedorUrls.innerHTML = `
            <div class="url-entry">
                <input type="url" class="url-foto" placeholder="https://ejemplo.com/foto1.jpg" required>
                <button type="button" class="btn-eliminar-url" title="Eliminar">✕</button>
            </div>
        `;
        cargarProductosAdmin();
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el producto');
    }
});

// =============================================
// CARGAR PRODUCTOS
// =============================================
async function cargarProductosAdmin() {
    try {
        const snapshot = await db.collection('productos')
            .orderBy('fechaCreacion', 'desc')
            .get();
        
        listaProductosAdmin.innerHTML = '';
        
        if (snapshot.empty) {
            listaProductosAdmin.innerHTML = '<p class="vacio">No hay productos aún. ¡Agrega el primero!</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const producto = doc.data();
            const div = document.createElement('div');
            div.classList.add('producto-admin-item');
            div.innerHTML = `
                <img src="${producto.fotos[0]}" alt="${producto.nombre}" class="thumb-admin" onerror="this.src='https://via.placeholder.com/80?text=Sin+Img'">
                <div class="info-admin">
                    <strong>${producto.nombre}</strong>
                    <span>$${producto.precio.toFixed(2)} | ${producto.categoria}</span>
                    <small>${producto.fotos.length} foto(s)</small>
                </div>
                <button class="btn-eliminar" onclick="eliminarProducto('${doc.id}')" title="Eliminar">🗑️</button>
            `;
            listaProductosAdmin.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        listaProductosAdmin.innerHTML = '<p class="error">Error al cargar productos</p>';
    }
}

// =============================================
// ELIMINAR PRODUCTO
// =============================================
async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await db.collection('productos').doc(id).delete();
            alert('✅ Producto eliminado');
            cargarProductosAdmin();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('❌ Error al eliminar');
        }
    }
}

// =============================================
// TÉRMINOS Y CONDICIONES
// =============================================
async function cargarTerminosAdmin() {
    try {
        const doc = await db.collection('configuracion').doc('terminos').get();
        if (doc.exists) {
            terminosTexto.value = doc.data().texto;
        }
    } catch (error) {
        console.error('Error al cargar términos:', error);
    }
}

btnGuardarTerminos.addEventListener('click', async () => {
    const texto = terminosTexto.value.trim();
    if (!texto) {
        alert('Los términos no pueden estar vacíos');
        return;
    }
    
    try {
        await db.collection('configuracion').doc('terminos').set({
            texto: texto,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Términos y condiciones actualizados');
    } catch (error) {
        console.error('Error al guardar términos:', error);
        alert('❌ Error al guardar');
    }
});
