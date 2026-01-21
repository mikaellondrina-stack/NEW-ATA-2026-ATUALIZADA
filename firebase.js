// firebase.js - Versão simplificada
const firebaseConfig = {
    // SUAS CREDENCIAIS AQUI - Pegue do console do Firebase
    apiKey: "AIzaSyD...",
    authDomain: "porter-sistema.firebaseapp.com",
    projectId: "porter-sistema",
    storageBucket: "porter-sistema.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcd1234"
};

// Verificar se Firebase já está carregado
if (typeof firebase !== 'undefined') {
    try {
        // Inicializar apenas se ainda não foi inicializado
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        window.db = firebase.firestore();
        console.log("✅ Firebase configurado!");
        
        // Configuração para melhor performance
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
    } catch (error) {
        console.error("❌ Erro no Firebase:", error);
        // Fallback: criar db fake para não quebrar o sistema
        window.db = {
            collection: () => ({
                add: () => Promise.reject("Firebase não configurado"),
                doc: () => ({ set: () => Promise.reject("Firebase não configurado") })
            })
        };
    }
} else {
    console.warn("⚠️ Firebase não carregado. Verifique os scripts no HTML.");
}
