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
            filt
