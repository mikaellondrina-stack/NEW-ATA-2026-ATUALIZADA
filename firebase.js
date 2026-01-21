// firebase.js - Coloque na mesma pasta que index.html
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_NUMERO",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
try {
    // Evitar inicializar múltiplas vezes
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    console.log("✅ Firebase configurado!");
} catch (error) {
    console.error("❌ Erro no Firebase:", error);
    // Criar db fake para não quebrar
    window.db = {
        collection: () => ({ 
            add: () => Promise.reject("Firebase offline"),
            doc: () => ({ set: () => Promise.reject("Firebase offline") })
        })
    };
}
