// =============================================
// PANEL DE ADMINISTRACIÓN COMPLETO - OMNI SV
// =============================================

const ADMIN_USER = "omnisv";
const ADMIN_PASS = "omniSV_26";
const WHATSAPP_NUMERO = "50371312121";

// =============================================
// ELEMENTOS DEL DOM
// =============================================
const pantallaLogin = document.getElementById('pantallaLogin');
const panelAdmin = document.getElementById('panelAdmin');
const formLogin = document.getElementById('formLogin');
const errorLogin = document.getElementById('errorLogin');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnTemaAdmin = document.getElementById('btnTemaAdmin');
const recordarmeCheck = document.getElementById('recordarme');

// Productos
const formProducto = document.getElementById('formProducto');
const productoId = document.getElementById('productoId');
const tituloFormProducto = document.getElementById('tituloFormProducto');
const contenedorUrls = document.getElementById('contenedorUrls');
const btnAgregarUrl = document.getElementById('btnAgregarUrl');
const listaProductosAdmin = document.getElementById('listaProductosAdmin');
const checkboxesCategorias = document.getElementById('checkboxesCategorias');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

// Categorías
const formCategoria = document.getElementById('formCategoria');
const categoriaIdInput = document.getElementById('categoriaId');
const nombreCategoriaInput = document.getElementById('nombreCategoria');
const tituloFormCategoria = document.getElementById('tituloFormCategoria');
const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
const btnCancelarCategoria = document.getElementById('btnCancelarCategoria');
const listaCategoriasAdmin = document.getElementById('listaCategoriasAdmin');

// Términos
const btnGuardarTerminos = document.getElementById('btnGuardarTerminos');
const terminosTexto = document.getElementById('terminosTexto');

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

// Aplicar tema guardado
const temaGuardado = localStorage.getItem('tema') || 'light';
document.documentElement.setAttribute('data-theme', temaGuardado);

if (btnTemaAdmin) {
    btnTemaAdmin.addEventListener('click', toggleTema);
}

// =============================================
// SISTEMA "RECORDARME"
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const credencialesGuardadas = localStorage.getItem('omnisv_credenciales');
    if (credencialesGuardadas) {
        const { usuario, password } = JSON.parse(credencialesGuardadas);
        document.getElementById('usuario').value = usuario;
        document.getElementById('password').value = password;
        recordarmeCheck.checked = true;
        
        // Auto-login si hay credenciales guardadas
        if (usuario === ADMIN_USER && password === ADMIN_PASS) {
            iniciarSesion();
        }
    }
});

// =============================================
// LOGIN
// =============================================
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        if (recordarmeCheck.checked) {
            localStorage.setItem('omnisv_credenciales', JSON.stringify({ usuario, password }));
        } else {
            localStorage.removeItem('omnisv_credenciales');
        }
        iniciarSesion();
    } else {
        errorLogin.style.display = 'block';
        document.getElementById('password').value = '';
    }
});

function iniciarSesion() {
    pantallaLogin.style.display = 'none';
    panelAdmin.style.display = 'block';
    errorLogin.style.display = 'none';
    
    cargarCategoriasEnCheckboxes();
    cargarProductosAdmin();
    cargarCategoriasAdmin();
    cargarTerminosAdmin();
    
    document.getElementById('usuario').value = '';
    document.getElementById('password').value = '';
}

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
        } else if (tab === 'categorias') {
            document.getElementById('seccionCategorias').classList.add('active');
            cargarCategoriasAdmin();
        } else if (tab === 'terminos') {
            document.getElementById('seccionTerminos').classList.add('active');
        }
    });
});

// =============================================
// GESTIÓN DE URLs DE FOTOS
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
// CARGAR CATEGORÍAS EN CHECKBOXES
// =============================================
async function cargarCategoriasEnCheckboxes() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        checkboxesCategorias.innerHTML = '';
        
        if (snapshot.empty) {
            checkboxesCategorias.innerHTML = '<p class="info-text">No hay categorías. Agrégalas en la pestaña Categorías.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const categoria = doc.data();
            const div = document.createElement('div');
            div.classList.add('checkbox-item');
            div.innerHTML = `
                <input type="checkbox" id="cat_${doc.id}" value="${doc.id}" class="checkbox-categoria">
                <label for="cat_${doc.id}">${categoria.nombre}</label>
            `;
            checkboxesCategorias.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// =============================================
// GUARDAR / EDITAR PRODUCTO
// =============================================
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const descripcion = document.getElementById('descripcion').value.trim();
    const id = productoId.value;
    
    // Obtener categorías seleccionadas
    const checkboxes = document.querySelectorAll('.checkbox-categoria:checked');
    const categorias = [];
    checkboxes.forEach(cb => categorias.push(cb.value));
    
    if (categorias.length === 0) {
        alert('Debe seleccionar al menos una categoría');
        return;
    }
    
    // Obtener URLs de fotos
    const inputsUrl = document.querySelectorAll('.url-foto');
    const fotos = [];
    inputsUrl.forEach(input => {
        const valor = input.value.trim();
        if (valor !== '') fotos.push(valor);
    });
    
    if (fotos.length === 0) {
        alert('Debe agregar al menos una URL de foto');
        return;
    }
    
    const productoData = {
        nombre,
        precio,
        descripcion,
        categorias,
        fotos,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (id) {
            // Editar producto existente
            await db.collection('productos').doc(id).update(productoData);
            alert('✅ Producto actualizado exitosamente');
        } else {
            // Nuevo producto
            productoData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('productos').add(productoData);
            alert('✅ Producto guardado exitosamente');
        }
        
        resetearFormularioProducto();
        cargarProductosAdmin();
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el producto');
    }
});

function resetearFormularioProducto() {
    formProducto.reset();
    productoId.value = '';
    tituloFormProducto.textContent = 'Agregar Producto';
    btnCancelarEdicion.style.display = 'none';
    contenedorUrls.innerHTML = `
        <div class="url-entry">
            <input type="url" class="url-foto" placeholder="https://ejemplo.com/foto1.jpg" required>
            <button type="button" class="btn-eliminar-url" title="Eliminar">✕</button>
        </div>
    `;
    // Desmarcar checkboxes
    document.querySelectorAll('.checkbox-categoria').forEach(cb => cb.checked = false);
}

btnCancelarEdicion.addEventListener('click', resetearFormularioProducto);

// =============================================
// CARGAR PRODUCTOS EN PANEL ADMIN
// =============================================
async function cargarProductosAdmin() {
    try {
        const snapshot = await db.collection('productos').orderBy('fechaCreacion', 'desc').get();
        listaProductosAdmin.innerHTML = '';
        
        if (snapshot.empty) {
            listaProductosAdmin.innerHTML = '<p class="vacio">No hay productos aún.</p>';
            return;
        }
        
        // Obtener nombres de categorías
        const catSnapshot = await db.collection('categorias').get();
        const categoriasMap = {};
        catSnapshot.forEach(doc => {
            categoriasMap[doc.id] = doc.data().nombre;
        });
        
        snapshot.forEach(doc => {
            const producto = doc.data();
            const categoriasNombres = producto.categorias 
                ? producto.categorias.map(id => categoriasMap[id] || id).join(', ')
                : 'Sin categoría';
            
            const div = document.createElement('div');
            div.classList.add('producto-admin-item');
            div.innerHTML = `
                <img src="${producto.fotos[0]}" alt="${producto.nombre}" class="thumb-admin" onerror="this.src='https://via.placeholder.com/80?text=Sin+Img'">
                <div class="info-admin">
                    <strong>${producto.nombre}</strong>
                    <span>$${producto.precio.toFixed(2)}</span>
                    <small>Categorías: ${categoriasNombres}</small>
                    <small>${producto.fotos.length} foto(s)</small>
                </div>
                <div class="acciones-admin">
                    <button class="btn-editar" onclick="editarProducto('${doc.id}')" title="Editar">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarProducto('${doc.id}')" title="Eliminar">🗑️</button>
                </div>
            `;
            listaProductosAdmin.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        listaProductosAdmin.innerHTML = '<p class="error">Error al cargar productos</p>';
    }
}

// =============================================
// EDITAR PRODUCTO
// =============================================
async function editarProducto(id) {
    try {
        const doc = await db.collection('productos').doc(id).get();
        if (!doc.exists) return;
        
        const producto = doc.data();
        
        productoId.value = id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('descripcion').value = producto.descripcion || '';
        
        // Cargar URLs de fotos
        contenedorUrls.innerHTML = '';
        producto.fotos.forEach((url, index) => {
            const div = document.createElement('div');
            div.classList.add('url-entry');
            div.innerHTML = `
                <input type="url" class="url-foto" value="${url}" required>
                <button type="button" class="btn-eliminar-url" title="Eliminar">✕</button>
            `;
            contenedorUrls.appendChild(div);
            
            div.querySelector('.btn-eliminar-url').addEventListener('click', () => {
                if (document.querySelectorAll('.url-entry').length > 1) {
                    contenedorUrls.removeChild(div);
                } else {
                    alert('Debe mantener al menos una URL');
                }
            });
        });
        
        // Marcar categorías
        await cargarCategoriasEnCheckboxes();
        setTimeout(() => {
            document.querySelectorAll('.checkbox-categoria').forEach(cb => {
                cb.checked = producto.categorias && producto.categorias.includes(cb.value);
            });
        }, 500);
        
        tituloFormProducto.textContent = 'Editar Producto';
        btnCancelarEdicion.style.display = 'inline-block';
        
        // Scroll al formulario
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error al editar:', error);
        alert('❌ Error al cargar producto para editar');
    }
}

// =============================================
// ELIMINAR PRODUCTO
// =============================================
async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            await db.collection('productos').doc(id).delete();
            alert('✅ Producto eliminado');
            cargarProductosAdmin();
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al eliminar');
        }
    }
}

// =============================================
// GESTIÓN DE CATEGORÍAS
// =============================================
formCategoria.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = nombreCategoriaInput.value.trim();
    const id = categoriaIdInput.value;
    
    if (!nombre) {
        alert('El nombre de la categoría es requerido');
        return;
    }
    
    try {
        if (id) {
            await db.collection('categorias').doc(id).update({ nombre });
            alert('✅ Categoría actualizada');
        } else {
            await db.collection('categorias').add({ 
                nombre,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('✅ Categoría agregada');
        }
        
        resetearFormularioCategoria();
        cargarCategoriasAdmin();
        cargarCategoriasEnCheckboxes();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar categoría');
    }
});

function resetearFormularioCategoria() {
    formCategoria.reset();
    categoriaIdInput.value = '';
    tituloFormCategoria.textContent = 'Agregar Categoría';
    btnCancelarCategoria.style.display = 'none';
}

btnCancelarCategoria.addEventListener('click', resetearFormularioCategoria);

async function cargarCategoriasAdmin() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        listaCategoriasAdmin.innerHTML = '';
        
        if (snapshot.empty) {
            listaCategoriasAdmin.innerHTML = '<p class="vacio">No hay categorías aún.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const categoria = doc.data();
            const div = document.createElement('div');
            div.classList.add('categoria-admin-item');
            div.innerHTML = `
                <div class="info-categoria">
                    <strong>🏷️ ${categoria.nombre}</strong>
                </div>
                <div class="acciones-admin">
                    <button class="btn-editar" onclick="editarCategoria('${doc.id}', '${categoria.nombre.replace(/'/g, "\\'")}')" title="Editar">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarCategoria('${doc.id}')" title="Eliminar">🗑️</button>
                </div>
            `;
            listaCategoriasAdmin.appendChild(div);
        });
    } catch (error) {
        console.error('Error:', error);
        listaCategoriasAdmin.innerHTML = '<p class="error">Error al cargar categorías</p>';
    }
}

function editarCategoria(id, nombre) {
    categoriaIdInput.value = id;
    nombreCategoriaInput.value = nombre;
    tituloFormCategoria.textContent = 'Editar Categoría';
    btnCancelarCategoria.style.display = 'inline-block';
    document.querySelector('#seccionCategorias .form-container').scrollIntoView({ behavior: 'smooth' });
}

async function eliminarCategoria(id) {
    if (confirm('¿Estás seguro de eliminar esta categoría? Los productos que la usan no se eliminarán.')) {
        try {
            await db.collection('categorias').doc(id).delete();
            alert('✅ Categoría eliminada');
            cargarCategoriasAdmin();
            cargarCategoriasEnCheckboxes();
        } catch (error) {
            console.error('Error:', error);
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
        console.error('Error:', error);
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
            texto,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ Términos actualizados');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar');
    }
});
