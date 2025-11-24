// firebase-config.js - CONFIGURAÇÃO CORRIGIDA DO FIREBASE

// COLE AQUI SEUS CÓDIGOS REAIS DO FIREBASE!
const firebaseConfig = {
  apiKey: "AIzaSyCv55TRkGPiCMoQ53rmksfjb9As2rujVcE",
  authDomain: "supervisaosreac.firebaseapp.com",
  projectId: "supervisaosreac",
  storageBucket: "supervisaosreac.firebasestorage.app",
  messagingSenderId: "693190287842",
  appId: "1:693190287842:web:b7d3972bc5af328d7419bb"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);

// Inicializar serviços do Firebase (APENAS OS NECESSÁRIOS)
const auth = firebase.auth();
const db = firebase.firestore();

// 🔥 REMOVIDO: firebase.functions() - Não é necessário!

// Configurar provedor do Google
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: 'edu.es.gov.br'
});

console.log('✅ Firebase configurado com sucesso!');

// Exportar para usar em outros arquivos
window.firebaseAuth = auth;
window.firebaseDb = db;
window.googleProvider = googleProvider;
