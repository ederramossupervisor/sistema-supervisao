// firebase-config.js - VERSÃO CORRIGIDA

// 🎯 CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCv55TRkGPiCMoQ53rmksfjb9As2rujVcE",
    authDomain: "supervisaosreac.firebaseapp.com",
    projectId: "supervisaosreac",
    storageBucket: "supervisaosreac.firebasestorage.app",
    messagingSenderId: "693190287842",
    appId: "1:693190287842:web:b7d3972bc5af328d7419bb"
};

// 🎯 INICIALIZAR FIREBASE
try {
    // Verificar se Firebase já foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // 🎯 INICIALIZAR SERVIÇOS
    const firebaseAuth = firebase.auth();
    const firebaseDb = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // Configurar domínio para login educacional
    googleProvider.setCustomParameters({
        prompt: 'select_account',
        hd: 'educador.edu.es.gov.br'
    });
    
    // 🎯 EXPORTAR PARA USO GLOBAL
    window.firebaseAuth = firebaseAuth;
    window.googleProvider = googleProvider;
    window.firebaseDb = firebaseDb;
    
    console.log('🔥 Firebase configurado com sucesso!');
    
} catch (error) {
    console.error('❌ Erro ao configurar Firebase:', error);
    
    // 🎯 FALLBACK
    window.firebaseAuth = {
        signInWithPopup: () => Promise.reject(new Error('Firebase não carregado')),
        signOut: () => Promise.reject(new Error('Firebase não carregado')),
        onAuthStateChanged: () => {}
    };
    
    window.googleProvider = {};
    window.firebaseDb = {};
}
