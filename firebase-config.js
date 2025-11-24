// firebase-config.js - CONFIGURAÇÃO CORRIGIDA
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
const firebaseAuth = firebase.auth();
const firebaseDb = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Configurar domínio para login educacional
googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: 'educador.edu.es.gov.br' // Restringe ao domínio educacional
});

console.log('🔥 Firebase configurado com sucesso!');
