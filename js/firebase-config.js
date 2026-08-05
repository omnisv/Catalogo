// =============================================
// CONFIGURACIÓN DE FIREBASE - OMNI SV
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyAdEB8TOv92rlk-QMKScUSzE-UX3zI2ELI",
  authDomain: "omnisv-2cd6d.firebaseapp.com",
  projectId: "omnisv-2cd6d",
  storageBucket: "omnisv-2cd6d.firebasestorage.app",
  messagingSenderId: "484557865143",
  appId: "1:484557865143:web:81ec6a723f2bdace678d32",
  measurementId: "G-ST4E7435WY"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔥 OmniSV - Firebase inicializado correctamente");