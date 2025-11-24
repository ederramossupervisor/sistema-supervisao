// firebase-auth.js - VERSÃO SIMPLIFICADA E SEGURA

// 🎯 FUNÇÃO DE LOGIN COM GOOGLE
async function loginWithGoogle() {
    try {
        console.log('🔐 Iniciando login...');
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        console.log('✅ Login bem-sucedido:', result.user.email);
        return result.user;
    } catch (error) {
        console.error('❌ Erro no login:', error);
        throw new Error('Erro no login: ' + error.message);
    }
}

// 🎯 FUNÇÃO DE LOGOUT
async function logout() {
    try {
        await firebaseAuth.signOut();
        console.log('✅ Logout realizado');
    } catch (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
    }
}

// 🎯 OBSERVADOR DE AUTENTICAÇÃO
function setupAuthListener() {
    firebaseAuth.onAuthStateChanged((user) => {
        console.log('🔄 Estado de autenticação mudou:', user ? user.email : 'null');
        
        if (user) {
            // 🎯 USUÁRIO LOGOU - atualizar variável global
            window.currentUser = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            };
            
            console.log('👤 Usuário logado (auth):', window.currentUser.email);
            
            // Salvar no localStorage
            localStorage.setItem('supervisionUser', JSON.stringify(window.currentUser));
            
            // Chamar funções do script principal se existirem
            if (typeof mostrarMenu === 'function') mostrarMenu();
            if (typeof atualizarInterfaceUsuario === 'function') atualizarInterfaceUsuario();
            if (typeof mostrarTela === 'function') mostrarTela('mainScreen');
            if (typeof carregarDocumentos === 'function') carregarDocumentos();
            
        } else {
            // 🎯 USUÁRIO DESLOGOU
            window.currentUser = null;
            localStorage.removeItem('supervisionUser');
            
            if (typeof mostrarTela === 'function') mostrarTela('loginScreen');
            
            const navMenu = document.getElementById('navMenu');
            if (navMenu) navMenu.style.display = 'none';
            
            console.log('🔐 Usuário deslogado (auth)');
        }
    });
}

// 🎯 INICIAR SISTEMA DE AUTENTICAÇÃO
function initializeAuth() {
    console.log('🔥 Inicializando autenticação Firebase...');
    
    // Verificar se já está logado
    const savedUser = localStorage.getItem('supervisionUser');
    if (savedUser) {
        try {
            window.currentUser = JSON.parse(savedUser);
            console.log('✅ Usuário recuperado do localStorage (auth):', window.currentUser?.email);
        } catch (e) {
            console.error('❌ Erro ao recuperar usuário:', e);
        }
    }
    
    setupAuthListener();
    console.log('✅ Sistema de autenticação pronto');
}

// Exportar funções
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.initializeAuth = initializeAuth;
