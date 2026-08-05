// =============================================
// PANEL DE ADMINISTRACIÓN - OMNI SV
// =============================================

const ADMIN_USER = "omnisv";
const ADMIN_PASS = "omniSV_26";

// Elementos del DOM (se asignan después de iniciar sesión)
let pantallaLogin, panelAdmin, formLogin, errorLogin, btnCerrarSesion, btnTemaAdmin, recordarmeCheck;
let formProducto, productoId, tituloFormProducto, contenedorUrls, btnAgregarUrl;
let listaProductosAdmin, checkboxesCategorias, btnCancelarEdicion, buscadorAdmin;
let estadoSubida, textoEstadoSubida, postimagesContainer;
let formCategoria, categoriaIdInput, nombreCategoriaInput, tituloFormCategoria;
let btnGuardarCategoria, btnCancelarCategoria, listaCategoriasAdmin;
let btnGuardarTerminos, terminosTexto;

let todosLosProductosAdmin = [];

// =============================================
// INICIALIZAR REFERENCIAS DEL DOM
// =============================================
function inicializarDOM() {
    pantallaLogin = document.getElementById('pantallaLogin');
    panelAdmin = document.getElementById('panelAdmin');
    formLogin = document.getElementById('formLogin');
    errorLogin = document.getElementById('errorLogin');
    btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnTemaAdmin = document.getElementById('btnTemaAdmin');
    recordarmeCheck = document.getElementById('recordarme');

    formProducto = document.getElementById('formProducto');
    productoId = document.getElementById('productoId');
    tituloFormProducto = document.getElementById('tituloFormProducto');
    contenedorUrls = document.getElementById('contenedorUrls');
    btnAgregarUrl = document.getElementById('btnAgregarUrl');
    listaProductosAdmin = document.getElementById('listaProductosAdmin');
    checkboxesCategorias = document.getElementById('checkboxesCategorias');
    btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    buscadorAdmin = document.getElementById('buscadorAdmin');

    estadoSubida = document.getElementById('estadoSubida');
    textoEstadoSubida = document.getElementById('textoEstadoSubida');
    postimagesContainer = document.getElementById('postimagesContainer');

    formCategoria = document.getElementById('formCategoria');
    categoriaIdInput = document.getElementById('categoriaId');
    nombreCategoriaInput = document.getElementById('nombreCategoria');
    tituloFormCategoria = document.getElementById('tituloFormCategoria');
    btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
    btnCancelarCategoria = document.getElementById('btnCancelarCategoria');
    listaCategoriasAdmin = document.getElementById('listaCategoriasAdmin');

    btnGuardarTerminos = document.getElementById('btnGuardarTerminos');
    terminosTexto = document.getElementById('terminosTexto');
}

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

// =============================================
// RECORDARME
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarDOM();
    
    if (btnTemaAdmin) btnTemaAdmin.addEventListener('click', toggleTema);
    
    const credencialesGuardadas = localStorage.getItem('omnisv_credenciales');
    if (credencialesGuardadas) {
        const { usuario, password } = JSON.parse(credencialesGuardadas);
        document.getElementById('usuario').value = usuario;
        document.getElementById('password').value = password;
        recordarmeCheck.checked = true;
        if (usuario === ADMIN_USER && password === ADMIN_PASS) iniciarSesion();
    }
    crearCampoUrl('');
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
    
    if (document.querySelectorAll('.url-entry').length === 0) crearCampoUrl('');
    
    inicializarPostimagesUpload();
    configurarEventosAdmin();
    cargarCategoriasEnCheckboxes();
    cargarProductosAdmin();
    cargarCategoriasAdmin();
    cargarTerminosAdmin();
    
    document.getElementById('usuario').value = '';
    document.getElementById('password').value = '';
}

// =============================================
// CONFIGURAR EVENTOS DESPUÉS DE INICIAR SESIÓN
// =============================================
function configurarEventosAdmin() {
    btnCerrarSesion.addEventListener('click', () => {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            pantallaLogin.style.display = 'block';
            panelAdmin.style.display = 'none';
            document.getElementById('password').value = '';
        }
    });

    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            if (tab === 'productos') { document.getElementById('seccionProductos').classList.add('active'); cargarProductosAdmin(); }
            else if (tab === 'categorias') { document.getElementById('seccionCategorias').classList.add('active'); cargarCategoriasAdmin(); }
            else if (tab === 'terminos') { document.getElementById('seccionTerminos').classList.add('active'); }
        });
    });

    // Búsqueda
    if (buscadorAdmin) {
        buscadorAdmin.addEventListener('input', () => {
            const texto = buscadorAdmin.value.toLowerCase().trim();
            if (texto === '') { renderizarListaProductos(todosLosProductosAdmin); return; }
            const filtrados = todosLosProductosAdmin.filter(p => {
                return p.nombre.toLowerCase().includes(texto) ||
                       (p.descripcion && p.descripcion.toLowerCase().includes(texto)) ||
                       (p.categoriaNombres && p.categoriaNombres.toLowerCase().includes(texto));
            });
            renderizarListaProductos(filtrados);
        });
    }

    // Botón agregar URL
    btnAgregarUrl.addEventListener('click', (e) => { e.preventDefault(); crearCampoUrl(''); });

    // Cancelar edición
    btnCancelarEdicion.addEventListener('click', resetearFormularioProducto);

    // Form producto
    formProducto.addEventListener('submit', guardarProducto);

    // Form categoría
    formCategoria.addEventListener('submit', guardarCategoria);
    btnCancelarCategoria.addEventListener('click', resetearFormularioCategoria);

    // Términos
    btnGuardarTerminos.addEventListener('click', guardarTerminos);
}

// =============================================
// CREAR CAMPO URL
// =============================================
function crearCampoUrl(valor = '') {
    const urlEntry = document.createElement('div');
    urlEntry.classList.add('url-entry');
    urlEntry.innerHTML = `
        <input type="url" class="url-foto" placeholder="https://ejemplo.com/foto.jpg" value="${valor}">
        <button type="button" class="btn-eliminar-url" title="Eliminar campo">✕</button>
    `;
    
    urlEntry.querySelector('.btn-eliminar-url').addEventListener('click', function() {
        if (document.querySelectorAll('.url-entry').length > 1) {
            contenedorUrls.removeChild(urlEntry);
        } else {
            alert('Debe mantener al menos un campo de foto');
        }
    });
    
    contenedorUrls.appendChild(urlEntry);
    return urlEntry;
}

// =============================================
// POSTIMAGES: SUBIDA DIRECTA
// =============================================
function inicializarPostimagesUpload() {
    if (!postimagesContainer) return;
    
    postimagesContainer.innerHTML = `
        <div class="upload-area" id="dropArea">
            <input type="file" id="postimagesInput" accept="image/*" multiple style="display:none;">
            <div class="upload-content">
                <span class="upload-icon">📁</span>
                <p>Arrastra imágenes aquí o <button type="button" id="btnSeleccionarImagen" class="btn-link">selecciona archivos</button></p>
                <small>JPG, PNG, GIF, WebP • Máx 10MB c/u</small>
            </div>
        </div>
    `;
    
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('postimagesInput');
    const btnSeleccionar = document.getElementById('btnSeleccionarImagen');
    
    btnSeleccionar.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    dropArea.addEventListener('click', () => fileInput.click());
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('drag-over');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            manejarArchivos(e.dataTransfer.files);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            manejarArchivos(fileInput.files);
            fileInput.value = '';
        }
    });
}

async function manejarArchivos(archivos) {
    for (const archivo of archivos) {
        if (!archivo.type.startsWith('image/')) {
            alert(`"${archivo.name}" no es una imagen.`);
            continue;
        }
        if (archivo.size > 10 * 1024 * 1024) {
            alert(`"${archivo.name}" es muy grande (máx 10MB).`);
            continue;
        }
        
        estadoSubida.style.display = 'block';
        textoEstadoSubida.textContent = `⏳ Subiendo: ${archivo.name}...`;
        textoEstadoSubida.style.color = '';
        
        try {
            const url = await subirAPostimages(archivo);
            if (url) {
                const campos = document.querySelectorAll('.url-foto');
                let asignado = false;
                campos.forEach(campo => {
                    if (campo.value.trim() === '' && !asignado) {
                        campo.value = url;
                        asignado = true;
                    }
                });
                if (!asignado) crearCampoUrl(url);
                
                textoEstadoSubida.textContent = `✅ ¡Subido! ${archivo.name}`;
                textoEstadoSubida.style.color = '#27ae60';
            }
        } catch (error) {
            console.error('Error:', error);
            textoEstadoSubida.textContent = `❌ Error: ${archivo.name}`;
            textoEstadoSubida.style.color = '#e74c3c';
        }
    }
    
    setTimeout(() => {
        estadoSubida.style.display = 'none';
        textoEstadoSubida.style.color = '';
    }, 4000);
}

function subirAPostimages(archivo) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('upload', archivo);
        formData.append('format', 'json');
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://postimages.org/json/rr', true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('Postimages respuesta:', data);
                    if (data && data.url) {
                        resolve(data.url);
                    } else if (data && data.image && data.image.url) {
                        resolve(data.image.url);
                    } else if (data && data.error) {
                        reject(new Error(data.error.message || 'Error del servidor'));
                    } else {
                        reject(new Error('Formato desconocido'));
                    }
                } catch (e) {
                    reject(new Error('Error al leer respuesta'));
                }
            } else {
                reject(new Error(`Error HTTP: ${xhr.status}`));
            }
        };
        
        xhr.onerror = () => reject(new Error('Error de red'));
        xhr.send(formData);
    });
}

// =============================================
// CARGAR CATEGORÍAS EN CHECKBOXES
// =============================================
async function cargarCategoriasEnCheckboxes() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        checkboxesCategorias.innerHTML = '';
        if (snapshot.empty) {
            checkboxesCategorias.innerHTML = '<p class="info-text">No hay categorías.</p>';
            return;
        }
        snapshot.forEach(doc => {
            const categoria = doc.data();
            const div = document.createElement('div');
            div.classList.add('checkbox-item');
            div.innerHTML = `<input type="checkbox" id="cat_${doc.id}" value="${doc.id}" class="checkbox-categoria"><label for="cat_${doc.id}">${categoria.nombre}</label>`;
            checkboxesCategorias.appendChild(div);
        });
    } catch (error) { console.error('Error:', error); }
}

// =============================================
// GUARDAR PRODUCTO
// =============================================
async function guardarProducto(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const descripcion = document.getElementById('descripcion').value.trim();
    const id = productoId.value;
    
    const checkboxes = document.querySelectorAll('.checkbox-categoria:checked');
    const categorias = [];
    checkboxes.forEach(cb => categorias.push(cb.value));
    if (categorias.length === 0) { alert('Selecciona al menos una categoría'); return; }
    
    const inputsUrl = document.querySelectorAll('.url-foto');
    const fotos = [];
    inputsUrl.forEach(input => { const v = input.value.trim(); if (v !== '') fotos.push(v); });
    if (fotos.length === 0) { alert('Agrega al menos una foto'); return; }
    
    const productoData = { nombre, precio, descripcion, categorias, fotos, fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp() };
    
    try {
        if (id) {
            await db.collection('productos').doc(id).update(productoData);
            alert('✅ Producto actualizado');
        } else {
            productoData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
            productoData.activo = true;
            await db.collection('productos').add(productoData);
            alert('✅ Producto guardado');
        }
        resetearFormularioProducto();
        cargarProductosAdmin();
    } catch (error) { console.error('Error:', error); alert('❌ Error al guardar'); }
}

function resetearFormularioProducto() {
    formProducto.reset();
    productoId.value = '';
    tituloFormProducto.textContent = 'Agregar Producto';
    btnCancelarEdicion.style.display = 'none';
    contenedorUrls.innerHTML = '';
    crearCampoUrl('');
    document.querySelectorAll('.checkbox-categoria').forEach(cb => cb.checked = false);
}

// =============================================
// CARGAR PRODUCTOS
// =============================================
async function cargarProductosAdmin() {
    try {
        const snapshot = await db.collection('productos').orderBy('fechaCreacion', 'desc').get();
        todosLosProductosAdmin = [];
        const catSnapshot = await db.collection('categorias').get();
        const categoriasMap = {};
        catSnapshot.forEach(doc => { categoriasMap[doc.id] = doc.data().nombre; });
        
        if (snapshot.empty) { listaProductosAdmin.innerHTML = '<p class="vacio">No hay productos aún.</p>'; return; }
        
        snapshot.forEach(doc => {
            const p = doc.data();
            const cats = p.categorias ? p.categorias.map(id => categoriasMap[id] || id).join(', ') : 'Sin categoría';
            todosLosProductosAdmin.push({ id: doc.id, ...p, categoriaNombres: cats });
        });
        renderizarListaProductos(todosLosProductosAdmin);
    } catch (error) { console.error('Error:', error); }
}

function renderizarListaProductos(productos) {
    listaProductosAdmin.innerHTML = '';
    if (productos.length === 0) { listaProductosAdmin.innerHTML = '<p class="vacio">No se encontraron productos.</p>'; return; }
    
    productos.forEach(producto => {
        const activo = producto.activo !== false;
        const estadoClass = activo ? 'estado-activo' : 'estado-inactivo';
        const estadoTexto = activo ? 'Activo' : 'Inactivo';
        const toggleIcon = activo ? '👁️' : '🚫';
        const toggleTitle = activo ? 'Inhabilitar' : 'Habilitar';
        
        const div = document.createElement('div');
        div.classList.add('producto-admin-item');
        if (!activo) div.style.opacity = '0.6';
        div.innerHTML = `
            <img src="${producto.fotos[0]}" alt="${producto.nombre}" class="thumb-admin" onerror="this.src='https://via.placeholder.com/80?text=Sin+Img'" style="object-fit:contain;background:#f0f0f0;">
            <div class="info-admin">
                <strong>${producto.nombre}</strong>
                <span>$${producto.precio.toFixed(2)}</span>
                <small>Categorías: ${producto.categoriaNombres || 'Sin categoría'}</small>
                <small>${producto.fotos.length} foto(s)</small>
                <span class="estado-producto ${estadoClass}">${estadoTexto}</span>
            </div>
            <div class="acciones-admin">
                <button class="btn-toggle" onclick="toggleProducto('${producto.id}', ${activo})" title="${toggleTitle}">${toggleIcon}</button>
                <button class="btn-editar" onclick="editarProducto('${producto.id}')" title="Editar">✏️</button>
                <button class="btn-eliminar" onclick="eliminarProducto('${producto.id}')" title="Eliminar">🗑️</button>
            </div>`;
        listaProductosAdmin.appendChild(div);
    });
}

// =============================================
// TOGGLE / EDITAR / ELIMINAR
// =============================================
async function toggleProducto(id, estadoActual) {
    if (!confirm(`¿${estadoActual ? 'Inhabilitar' : 'Habilitar'} este producto?`)) return;
    try {
        await db.collection('productos').doc(id).update({ activo: !estadoActual, fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp() });
        alert('✅ Estado actualizado'); cargarProductosAdmin();
    } catch (error) { console.error('Error:', error); alert('❌ Error'); }
}

async function editarProducto(id) {
    try {
        const doc = await db.collection('productos').doc(id).get();
        if (!doc.exists) { alert('Producto no encontrado'); return; }
        const p = doc.data();
        productoId.value = id;
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('precio').value = p.precio;
        document.getElementById('descripcion').value = p.descripcion || '';
        contenedorUrls.innerHTML = '';
        if (p.fotos && p.fotos.length > 0) { p.fotos.forEach(url => crearCampoUrl(url)); }
        else { crearCampoUrl(''); }
        await cargarCategoriasEnCheckboxes();
        setTimeout(() => {
            document.querySelectorAll('.checkbox-categoria').forEach(cb => { cb.checked = p.categorias && p.categorias.includes(cb.value); });
        }, 300);
        tituloFormProducto.textContent = 'Editar Producto';
        btnCancelarEdicion.style.display = 'inline-block';
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) { console.error('Error:', error); alert('❌ Error'); }
}

async function eliminarProducto(id) {
    if (confirm('¿Eliminar PERMANENTEMENTE este producto?')) {
        try { await db.collection('productos').doc(id).delete(); alert('✅ Eliminado'); cargarProductosAdmin(); }
        catch (error) { console.error('Error:', error); alert('❌ Error'); }
    }
}

// =============================================
// CATEGORÍAS
// =============================================
async function guardarCategoria(e) {
    e.preventDefault();
    const nombre = nombreCategoriaInput.value.trim();
    const id = categoriaIdInput.value;
    if (!nombre) { alert('Nombre requerido'); return; }
    try {
        if (id) { await db.collection('categorias').doc(id).update({ nombre }); alert('✅ Actualizada'); }
        else { await db.collection('categorias').add({ nombre, fechaCreacion: firebase.firestore.FieldValue.serverTimestamp() }); alert('✅ Agregada'); }
        resetearFormularioCategoria(); cargarCategoriasAdmin(); cargarCategoriasEnCheckboxes();
    } catch (error) { console.error('Error:', error); alert('❌ Error'); }
}

function resetearFormularioCategoria() {
    formCategoria.reset(); categoriaIdInput.value = '';
    tituloFormCategoria.textContent = 'Agregar Categoría'; btnCancelarCategoria.style.display = 'none';
}

async function cargarCategoriasAdmin() {
    try {
        const snapshot = await db.collection('categorias').orderBy('nombre').get();
        listaCategoriasAdmin.innerHTML = '';
        if (snapshot.empty) { listaCategoriasAdmin.innerHTML = '<p class="vacio">No hay categorías.</p>'; return; }
        snapshot.forEach(doc => {
            const c = doc.data();
            const div = document.createElement('div');
            div.classList.add('categoria-admin-item');
            div.innerHTML = `
                <div class="info-categoria"><strong>🏷️ ${c.nombre}</strong></div>
                <div class="acciones-admin">
                    <button class="btn-editar" onclick="editarCategoria('${doc.id}', '${c.nombre.replace(/'/g, "\\'")}')">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarCategoria('${doc.id}')">🗑️</button>
                </div>`;
            listaCategoriasAdmin.appendChild(div);
        });
    } catch (error) { console.error('Error:', error); }
}

function editarCategoria(id, nombre) {
    categoriaIdInput.value = id; nombreCategoriaInput.value = nombre;
    tituloFormCategoria.textContent = 'Editar Categoría'; btnCancelarCategoria.style.display = 'inline-block';
}
async function eliminarCategoria(id) {
    if (confirm('¿Eliminar esta categoría?')) {
        try { await db.collection('categorias').doc(id).delete(); alert('✅ Eliminada'); cargarCategoriasAdmin(); cargarCategoriasEnCheckboxes(); }
        catch (error) { console.error('Error:', error); alert('❌ Error'); }
    }
}

// =============================================
// TÉRMINOS
// =============================================
async function cargarTerminosAdmin() {
    try {
        const doc = await db.collection('configuracion').doc('terminos').get();
        if (doc.exists) terminosTexto.value = doc.data().texto;
    } catch (error) { console.error('Error:', error); }
}

async function guardarTerminos() {
    const texto = terminosTexto.value.trim();
    if (!texto) { alert('No puede estar vacío'); return; }
    try {
        await db.collection('configuracion').doc('terminos').set({ texto, fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp() });
        alert('✅ Términos actualizados');
    } catch (error) { console.error('Error:', error); alert('❌ Error'); }
}
