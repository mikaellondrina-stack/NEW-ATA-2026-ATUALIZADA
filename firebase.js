// firebase.js - Firebase Modular v10.7.1
// Coloque este código NO LUGAR do atual

// SUAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "AIzaSyARRqLJJFdaHpcmUtrSStqmx90ZYm8ERe8",
  authDomain: "ata-porter-2026-new-98c61.firebaseapp.com",
  projectId: "ata-porter-2026-new-98c61",
  storageBucket: "ata-porter-2026-new-98c61.firebasestorage.app",
  messagingSenderId: "196023937983",
  appId: "1:196023937983:web:090b010284141d2edecf0a"
};

// Inicializar Firebase
try {
  // Verifica se já foi inicializado
  if (!firebase.apps || firebase.apps.length === 0) {
    console.log("🔥 Inicializando Firebase...");
    firebase.initializeApp(firebaseConfig);
  } else {
    console.log("✅ Firebase já inicializado");
  }
  
  // Inicializar Firestore
  window.db = firebase.firestore();
  
  // Configurações do Firestore
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
  });
  
  // Tentar habilitar persistência offline
  firebase.firestore().enablePersistence()
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.log("Persistência offline não disponível em múltiplas abas");
      } else if (err.code === 'unimplemented') {
        console.log("Navegador não suporta persistência offline");
      }
    });
  
  console.log("✅ Firebase configurado com sucesso!");
  console.log("📌 Projeto:", firebase.app().options.projectId);
  console.log("🗄️ Firestore pronto para uso");
  
} catch (error) {
  console.error("❌ Erro crítico no Firebase:", error);
  alert(`ERRO NO FIREBASE: ${error.message}\n\nVerifique o console.`);
}

