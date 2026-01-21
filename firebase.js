const firebaseConfig = {
  apiKey: "AIzaSyAzfPWTcBtJk3UyOYdLIeSK3PlfjYKJAHI",
  authDomain: "site-universal-29a2b.firebaseapp.com",
  projectId: "site-universal-29a2b",
  storageBucket: "site-universal-29a2b.firebasestorage.app",
  messagingSenderId: "793824632619",
  appId: "1:793824632619:web:e035c64e33969a40932f6e"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Cria a variável global do banco
const db = firebase.firestore();

