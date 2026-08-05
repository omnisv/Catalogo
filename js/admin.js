// =============================================
// PANEL DE ADMINISTRACIÓN - OMNI SV
// =============================================

const ADMIN_USER = "omnisv";
const ADMIN_PASS = "omniSV_26";

let todosLosProductosAdmin = [];
let categoriasDisponibles = [];
let categoriasSeleccionadas = [];

document.addEventListener('DOMContentLoaded', function() {
    
    const pantallaLogin = document.getElementById('pantallaLogin');
    const panelAdmin = document.getElementById('panelAdmin');
    const formLogin = document.getElementById('formLogin');
    const errorLogin = document.getElementById('errorLogin');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const btnTemaAdmin = document.getElementById('btnTemaAdmin');
    const recordarmeCheck = document.getElementById('recordarme');

    const formProducto = document.getElementById('formProducto');
    const productoId = document.getElementById('productoId');
    const tituloFormProducto = document.getElementById('tituloFormProducto');
    const contenedorUrls = document.getElementById('contenedorUrls');
    const btnAgregarUrl = document.getElementById('btnAgregarUrl');
    const listaProductosAdmin = document.getElementById('listaProductosAdmin');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const buscadorAdmin = document.getElementById('buscadorAdmin');

    const estadoSubida = document.getElementById('estadoSubida');
    const textoEstadoSubida = document.getElementById('textoEstadoSubida');

    const formCategoria = document.getElementById('formCategoria');
    const categoriaIdInput = document.getElementById('categoriaId');
    const nombreCategoriaInput = document.getElementById('nombreCategoria');
    const tituloFormCategoria = document.getElementById('tituloFormCategoria');
    const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
    const btnCancelarCategoria = document.getElementById('btnCancelarCategoria');
    const listaCategoriasAdmin = document.getElementById('listaCategoriasAdmin');

    const btnGuardarTerminos = document.getElementById('btnGuardarTerminos');
    const terminosTexto = document.getElementById('terminosTexto');

    // Multiselect
    const multiselectHeader = document.getElementById('multiselectHeader');
    const multiselectDropdown = document.getElementById('multiselectDropdown');
    const multiselectSearch = document.getElementById('multiselectSearch');
    const multiselectOptions = document.getElementById('multiselectOptions');

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
    if (btnTemaAdmin) btnTemaAdmin.addEventListener('click', toggleTema);

    // =============================================
    // RECORDARME
    // =============================================
    const credencialesGuardadas = localStorage.getItem('omnisv_credenciales');
    if (credencialesGuardadas) {
        const { usuario, password } = JSON.parse(credencialesGuardadas);
        document.getElementById('usuario').value = usuario;
        document.getElementById('password').value = password;
        recordarmeCheck.checked = true;
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

    crearCampoUrl('');

    // =============================================
    // MULTISELECT DE CATEGORÍAS
    // =============================================
    multiselectHeader.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = multiselectDropdown.style.display === 'block';
        multiselectDropdown.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
            multiselectSearch.focus();
            renderizarOpcionesCategorias();
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.multiselect-container')) {
            multiselectDropdown.style.display = 'none';
        }
    });

    multiselectSearch.addEventListener('input', function() {
        renderizarOpcionesCategorias(this.value.toLowerCase());
    });

    multiselectSearch.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    function renderizarOpcionesCategorias(filtro = '') {
        multiselectOptions.innerHTML = '';
        
        const categoriasFiltradas = categoriasDisponibles.filter(function(cat) {
            return cat.nombre.toLowerCase().includes(filtro);
        });
        
        if (categoriasFiltradas.length === 0) {
            multiselectOptions.innerHTML = '<p class="info-text">No se encontraron categorías.</p>';
            return;
        }
        
        categoriasFiltradas.forEach(function(cat) {
            const checked = categoriasSeleccionadas.includes(cat.id);
            const div = document.createElement('div');
            div.classList.add('multiselect-option');
            div.innerHTML = `
                <input type="checkbox" id="ms_cat_${cat.id}" value="${cat.id}" ${checked ? 'checked' : ''}>
                <label for="ms_cat_${cat.id}">${cat.nombre}</label>
            `;
            
            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    if (!categoriasSeleccionadas.includes(cat.id)) {
                        categoriasSeleccionadas.push(cat.id);
                    }
                } else {
                    categoriasSeleccionadas = categoriasSeleccionadas.filter(function(id) { return id !== cat.id; });
                }
                actualizarHeaderMultiselect();
            });
            
            multiselectOptions.appendChild(div);
        });
    }

    function actualizarHeaderMultiselect() {
        const placeholder = multiselectHeader.querySelector('.multiselect-placeholder');
        if (categoriasSeleccionadas.length === 0) {
            placeholder.textContent = 'Seleccionar categorías...';
        } else {
            const nombres = categoriasSeleccionadas.map(function(id) {
                const cat = categoriasDisponibles.find(function(c) { return c.id === id; });
                return cat ? cat.nombre : id;
            });
            placeholder.textContent = nombres.join(', ');
        }
    }

    function cargarCategoriasEnMultiselect() {
        db.collection('categorias').orderBy('nombre').get().then(function(snapshot) {
            categoriasDisponibles = [];
            snapshot.forEach(function(doc) {
                categoriasDisponibles.push({ id: doc.id, nombre: doc.data().nombre });
            });
            renderizarOpcionesCategorias();
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }

    // =============================================
    // LOGIN
    // =============================================
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (usuario === ADMIN_USER && password === ADMIN_PASS) {
            if (recordarmeCheck.checked) {
                localStorage.setItem('omnisv_credenciales', JSON.stringify({ usuario, password }));
            } else {
                localStorage.removeItem('omnisv_credenciales');
            }
            pantallaLogin.style.display = 'none';
            panelAdmin.style.display = 'block';
            errorLogin.style.display = 'none';
            cargarTodo();
            document.getElementById('usuario').value = '';
            document.getElementById('password').value = '';
        } else {
            errorLogin.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });

    if (credencialesGuardadas) {
        const { usuario, password } = JSON.parse(credencialesGuardadas);
        if (usuario === ADMIN_USER && password === ADMIN_PASS) {
            pantallaLogin.style.display = 'none';
            panelAdmin.style.display = 'block';
            cargarTodo();
        }
    }

    function cargarTodo() {
        cargarCategoriasEnMultiselect();
        cargarProductosAdmin();
        cargarCategoriasAdmin();
        cargarTerminosAdmin();
        inicializarImgurUpload();
    }

    btnCerrarSesion.addEventListener('click', function() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            pantallaLogin.style.display = 'block';
            panelAdmin.style.display = 'none';
            document.getElementById('password').value = '';
        }
    });

    // =============================================
    // PESTAÑAS
    // =============================================
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            if (tab === 'productos') { document.getElementById('seccionProductos').classList.add('active'); cargarProductosAdmin(); }
            else if (tab === 'categorias') { document.getElementById('seccionCategorias').classList.add('active'); cargarCategoriasAdmin(); }
            else if (tab === 'terminos') { document.getElementById('seccionTerminos').classList.add('active'); }
        });
    });

    // =============================================
    // BÚSQUEDA
    // =============================================
    if (buscadorAdmin) {
        buscadorAdmin.addEventListener('input', function() {
            const texto = this.value.toLowerCase().trim();
            if (texto === '') { renderizarListaProductos(todosLosProductosAdmin); return; }
            const filtrados = todosLosProductosAdmin.filter(function(p) {
                return p.nombre.toLowerCase().includes(texto) ||
                       (p.descripcion && p.descripcion.toLowerCase().includes(texto)) ||
                       (p.categoriaNombres && p.categoriaNombres.toLowerCase().includes(texto));
            });
            renderizarListaProductos(filtrados);
        });
    }

    btnAgregarUrl.addEventListener('click', function(e) { e.preventDefault(); crearCampoUrl(''); });

    btnCancelarEdicion.addEventListener('click', function() {
        formProducto.reset();
        productoId.value = '';
        tituloFormProducto.textContent = 'Agregar Producto';
        btnCancelarEdicion.style.display = 'none';
        contenedorUrls.innerHTML = '';
        crearCampoUrl('');
        categoriasSeleccionadas = [];
        actualizarHeaderMultiselect();
    });

    // =============================================
    // IMGUR UPLOAD
    // =============================================
    function inicializarImgurUpload() {
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('imgurInput');
        const btnSeleccionar = document.getElementById('btnSeleccionarImagen');
        
        if (!dropArea || !fileInput || !btnSeleccionar) return;
        
        btnSeleccionar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        dropArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropArea.classList.add('drag-over');
        });
        
        dropArea.addEventListener('dragleave', function() {
            dropArea.classList.remove('drag-over');
        });
        
        dropArea.addEventListener('drop', function(e) {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) manejarArchivos(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                manejarArchivos(fileInput.files);
                fileInput.value = '';
            }
        });
    }

    async function manejarArchivos(archivos) {
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];
            if (!archivo.type.startsWith('image/')) { alert('"' + archivo.name + '" no es una imagen.'); continue; }
            if (archivo.size > 10 * 1024 * 1024) { alert('"' + archivo.name + '" es muy grande (máx 10MB).'); continue; }
            
            estadoSubida.style.display = 'block';
            textoEstadoSubida.textContent = '⏳ Subiendo: ' + archivo.name + '...';
            textoEstadoSubida.style.color = '';
            
            try {
                const url = await subirAImgur(archivo);
                if (url) {
                    const campos = document.querySelectorAll('.url-foto');
                    let asignado = false;
                    campos.forEach(function(campo) {
                        if (campo.value.trim() === '' && !asignado) { campo.value = url; asignado = true; }
                    });
                    if (!asignado) crearCampoUrl(url);
                    textoEstadoSubida.textContent = '✅ ¡Subido! ' + archivo.name;
                    textoEstadoSubida.style.color = '#27ae60';
                }
            } catch (error) {
                textoEstadoSubida.textContent = '❌ Error: ' + archivo.name;
                textoEstadoSubida.style.color = '#e74c3c';
            }
        }
        setTimeout(function() { estadoSubida.style.display = 'none'; textoEstadoSubida.style.color = ''; }, 4000);
    }

    function subirAImgur(archivo) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = function() {
                const base64 = reader.result.split(',')[1];
                const formData = new FormData();
                formData.append('image', base64);
                formData.append('type', 'base64');
                
                fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: { 'Authorization': 'Client-ID 546c25a59c58ad7' },
                    body: formData
                })
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data && data.success && data.data && data.data.link) resolve(data.data.link);
                    else reject(new Error('No se pudo obtener URL'));
                })
                .catch(reject);
            };
            reader.onerror = function() { reject(new Error('Error al leer archivo')); };
            reader.readAsDataURL(archivo);
        });
    }

    // =============================================
    // GUARDAR PRODUCTO
    // =============================================
    formProducto.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        const descripcion = document.getElementById('descripcion').value.trim();
        const id = productoId.value;
        
        if (categoriasSeleccionadas.length === 0) { alert('Selecciona al menos una categoría'); return; }
        
        const inputsUrl = document.querySelectorAll('.url-foto');
        const fotos = [];
        inputsUrl.forEach(function(input) { const v = input.value.trim(); if (v !== '') fotos.push(v); });
        if (fotos.length === 0) { alert('Agrega al menos una foto'); return; }
        
        const productoData = {
            nombre, precio, descripcion,
            categorias: [...categoriasSeleccionadas],
            fotos,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        
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
            
            formProducto.reset();
            productoId.value = '';
            tituloFormProducto.textContent = 'Agregar Producto';
            btnCancelarEdicion.style.display = 'none';
            contenedorUrls.innerHTML = '';
            crearCampoUrl('');
            categoriasSeleccionadas = [];
            actualizarHeaderMultiselect();
            cargarProductosAdmin();
        } catch (error) { console.error('Error:', error); alert('❌ Error al guardar'); }
    });

    // =============================================
    // CARGAR PRODUCTOS
    // =============================================
    async function cargarProductosAdmin() {
        try {
            const snapshot = await db.collection('productos').orderBy('fechaCreacion', 'desc').get();
            todosLosProductosAdmin = [];
            const catSnapshot = await db.collection('categorias').get();
            const categoriasMap = {};
            catSnapshot.forEach(function(doc) { categoriasMap[doc.id] = doc.data().nombre; });
            
            if (snapshot.empty) { listaProductosAdmin.innerHTML = '<p class="vacio">No hay productos aún.</p>'; return; }
            
            snapshot.forEach(function(doc) {
                const p = doc.data();
                const cats = p.categorias ? p.categorias.map(function(id) { return categoriasMap[id] || id; }).join(', ') : 'Sin categoría';
                todosLosProductosAdmin.push({ id: doc.id, ...p, categoriaNombres: cats });
            });
            renderizarListaProductos(todosLosProductosAdmin);
        } catch (error) { console.error('Error:', error); }
    }

    function renderizarListaProductos(productos) {
        listaProductosAdmin.innerHTML = '';
        if (productos.length === 0) { listaProductosAdmin.innerHTML = '<p class="vacio">No se encontraron productos.</p>'; return; }
        
        productos.forEach(function(producto) {
            const activo = producto.activo !== false;
            const estadoClass = activo ? 'estado-activo' : 'estado-inactivo';
            const estadoTexto = activo ? 'Activo' : 'Inactivo';
            const toggleIcon = activo ? '👁️' : '🚫';
            
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
                    <button class="btn-toggle" onclick="window.toggleProducto('${producto.id}', ${activo})" title="${activo ? 'Inhabilitar' : 'Habilitar'}">${toggleIcon}</button>
                    <button class="btn-editar" onclick="window.editarProducto('${producto.id}')" title="Editar">✏️</button>
                    <button class="btn-eliminar" onclick="window.eliminarProducto('${producto.id}')" title="Eliminar">🗑️</button>
                </div>`;
            listaProductosAdmin.appendChild(div);
        });
    }

    window.toggleProducto = async function(id, estadoActual) {
        if (!confirm('¿' + (estadoActual ? 'Inhabilitar' : 'Habilitar') + ' este producto?')) return;
        try {
            await db.collection('productos').doc(id).update({ activo: !estadoActual, fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp() });
            alert('✅ Estado actualizado'); cargarProductosAdmin();
        } catch (error) { console.error('Error:', error); alert('❌ Error'); }
    };

    window.editarProducto = async function(id) {
        try {
            const doc = await db.collection('productos').doc(id).get();
            if (!doc.exists) { alert('Producto no encontrado'); return; }
            const p = doc.data();
            
            productoId.value = id;
            document.getElementById('nombre').value = p.nombre;
            document.getElementById('precio').value = p.precio;
            document.getElementById('descripcion').value = p.descripcion || '';
            
            contenedorUrls.innerHTML = '';
            if (p.fotos && p.fotos.length > 0) { p.fotos.forEach(function(url) { crearCampoUrl(url); }); }
            else { crearCampoUrl(''); }
            
            categoriasSeleccionadas = p.categorias || [];
            actualizarHeaderMultiselect();
            cargarCategoriasEnMultiselect();
            
            tituloFormProducto.textContent = 'Editar Producto';
            btnCancelarEdicion.style.display = 'inline-block';
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        } catch (error) { console.error('Error:', error); alert('❌ Error'); }
    };

    window.eliminarProducto = async function(id) {
        if (confirm('¿Eliminar PERMANENTEMENTE este producto?')) {
            try { await db.collection('productos').doc(id).delete(); alert('✅ Eliminado'); cargarProductosAdmin(); }
            catch (error) { console.error('Error:', error); alert('❌ Error'); }
        }
    };

    // =============================================
    // CATEGORÍAS
    // =============================================
    formCategoria.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = nombreCategoriaInput.value.trim();
        const id = categoriaIdInput.value;
        if (!nombre) { alert('Nombre requerido'); return; }
        try {
            if (id) { await db.collection('categorias').doc(id).update({ nombre }); alert('✅ Actualizada'); }
            else { await db.collection('categorias').add({ nombre, fechaCreacion: firebase.firestore.FieldValue.serverTimestamp() }); alert('✅ Agregada'); }
            formCategoria.reset(); categoriaIdInput.value = '';
            tituloFormCategoria.textContent = 'Agregar Categoría'; btnCancelarCategoria.style.display = 'none';
            cargarCategoriasAdmin(); cargarCategoriasEnMultiselect();
        } catch (error) { console.error('Error:', error); alert('❌ Error'); }
    });

    btnCancelarCategoria.addEventListener('click', function() {
        formCategoria.reset(); categoriaIdInput.value = '';
        tituloFormCategoria.textContent = 'Agregar Categoría'; btnCancelarCategoria.style.display = 'none';
    });

    async function cargarCategoriasAdmin() {
        try {
            const snapshot = await db.collection('categorias').orderBy('nombre').get();
            listaCategoriasAdmin.innerHTML = '';
            if (snapshot.empty) { listaCategoriasAdmin.innerHTML = '<p class="vacio">No hay categorías.</p>'; return; }
            snapshot.forEach(function(doc) {
                const c = doc.data();
                const div = document.createElement('div');
                div.classList.add('categoria-admin-item');
                div.innerHTML = `
                    <div class="info-categoria"><strong>🏷️ ${c.nombre}</strong></div>
                    <div class="acciones-admin">
                        <button class="btn-editar" onclick="window.editarCategoria('${doc.id}', '${c.nombre.replace(/'/g, "\\'")}')">✏️</button>
                        <button class="btn-eliminar" onclick="window.eliminarCategoria('${doc.id}')">🗑️</button>
                    </div>`;
                listaCategoriasAdmin.appendChild(div);
            });
        } catch (error) { console.error('Error:', error); }
    }

    window.editarCategoria = function(id, nombre) {
        categoriaIdInput.value = id; nombreCategoriaInput.value = nombre;
        tituloFormCategoria.textContent = 'Editar Categoría'; btnCancelarCategoria.style.display = 'inline-block';
    };

    window.eliminarCategoria = async function(id) {
        if (confirm('¿Eliminar esta categoría?')) {
            try { await db.collection('categorias').doc(id).delete(); alert('✅ Eliminada'); cargarCategoriasAdmin(); cargarCategoriasEnMultiselect(); }
            catch (error) { console.error('Error:', error); alert('❌ Error'); }
        }
    };

    // =============================================
    // TÉRMINOS
    // =============================================
    async function cargarTerminosAdmin() {
        try {
            const doc = await db.collection('configuracion').doc('terminos').get();
            if (doc.exists) terminosTexto.value = doc.data().texto;
        } catch (error) { console.error('Error:', error); }
    }

    btnGuardarTerminos.addEventListener('click', async function() {
        const texto = terminosTexto.value.trim();
        if (!texto) { alert('No puede estar vacío'); return; }
        try {
            await db.collection('configuracion').doc('terminos').set({ texto, fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp() });
            alert('✅ Términos actualizados');
        } catch (error) { console.error('Error:', error); alert('❌ Error'); }
    });

});
