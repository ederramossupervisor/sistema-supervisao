// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyCv55TRkGPiCMoQ53rmksfjb9As2rujVcE",
    authDomain: "supervisaosreac.firebaseapp.com",
    projectId: "supervisaosreac",
    storageBucket: "supervisaosreac.firebasestorage.app",
    messagingSenderId: "693190287842",,
    appId: "1:693190287842:web:b7d3972bc5af328d7419bb"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Configurar escopos adicionais se necessário
provider.addScope('https://www.googleapis.com/auth/drive.file');
