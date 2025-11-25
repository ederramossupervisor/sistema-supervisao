// firebase-auth.js - VERSÃO SIMPLIFICADA E SEGURA

// 🎯 VERIFICAR SE FIREBASE ESTÁ DISPONÍVEL
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
}

// 🎯 FUNÇÃO DE LOGIN COM GOOGLE
async function loginWithGoogle() {
    try {
        if (!isFirebaseAvailable()) {
            throw new Error('Firebase não está disponível');
        }
        
        console.log('🔐 Iniciando login com Google...');
        
        const result = await firebase.auth().signInWithPopup(googleProvider);
        
        if (result.user) {
            console.log('✅ Login bem-sucedido:', result.user.email);
            
            // 🎯 SALVAR USUÁRIO NO LOCALSTORAGE
            const userData = {
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL
            };
            
            localStorage.setItem('supervisionUser', JSON.stringify(userData));
            
            return userData;
        } else {
            throw new Error('Falha no login - usuário não retornado');
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        
        // 🎯 SE FOR ERRO DE POPUP (usuário cancelou), não mostrar alerta
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('ℹ️ Usuário fechou a janela de login');
            return null;
        }
        
        // 🎯 SE FOR OUTRO ERRO, mostrar mensagem amigável
        let errorMessage = 'Erro no login: ';
        
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage += 'Pop-up bloqueado. Permita pop-ups para este site.';
                break;
            case 'auth/network-request-failed':
                errorMessage += 'Erro de conexão. Verifique sua internet.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage += 'Domínio não autorizado. Contate o administrador.';
                break;
            default:
                errorMessage += error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// 🎯 FUNÇÃO DE LOGOUT
async function logout() {
    try {
        if (isFirebaseAvailable()) {
            await firebase.auth().signOut();
        }
        
        // 🎯 LIMPAR DADOS LOCAIS
        localStorage.removeItem('supervisionUser');
        localStorage.removeItem('supervisorConfig');
        
        console.log('✅ Logout realizado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro no logout:', error);
        
        // 🎯 FALLBACK - Limpar dados locais mesmo com erro
        localStorage.removeItem('supervisionUser');
        localStorage.removeItem('supervisorConfig');
        
        throw error;
    }
}

// 🎯 OBSERVADOR DE AUTENTICAÇÃO
function setupAuthListener() {
    if (!isFirebaseAvailable()) {
        console.log('⚠️ Firebase não disponível para observador de auth');
        return;
    }
    
    firebase.auth().onAuthStateChanged((user) => {
        console.log('🔄 Estado de autenticação mudou:', user ? user.email : 'null');
        
        if (user) {
            // 🎯 USUÁRIO LOGOU
            const userData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            };
            
            // Atualizar variável global
            if (typeof window.currentUser !== 'undefined') {
                window.currentUser = userData;
            }
            
            // Salvar no localStorage
            localStorage.setItem('supervisionUser', JSON.stringify(userData));
            
            console.log('👤 Usuário logado (auth):', userData.email);
            
            // 🎯 CHAMAR FUNÇÕES DO SISTEMA PRINCIPAL
            if (typeof mostrarMenu === 'function') {
                setTimeout(() => mostrarMenu(), 100);
            }
            if (typeof atualizarInterfaceUsuario === 'function') {
                setTimeout(() => atualizarInterfaceUsuario(), 100);
            }
            if (typeof mostrarTela === 'function') {
                setTimeout(() => mostrarTela('mainScreen'), 200);
            }
            if (typeof carregarDocumentos === 'function') {
                setTimeout(() => carregarDocumentos(), 300);
            }
            
        } else {
            // 🎯 USUÁRIO DESLOGOU
            if (typeof window.currentUser !== 'undefined') {
                window.currentUser = null;
            }
            
            localStorage.removeItem('supervisionUser');
            
            if (typeof mostrarTela === 'function') {
                setTimeout(() => mostrarTela('loginScreen'), 100);
            }
            
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                setTimeout(() => {
                    navMenu.style.display = 'none';
                }, 100);
            }
            
            console.log('🔐 Usuário deslogado (auth)');
        }
    });
}

// 🎯 INICIAR SISTEMA DE AUTENTICAÇÃO
function initializeAuth() {
    console.log('🔥 Inicializando autenticação Firebase...');
    
    try {
        if (!isFirebaseAvailable()) {
            throw new Error('Firebase não carregado');
        }
        
        // 🎯 VERIFICAR SE JÁ ESTÁ LOGADO
        const savedUser = localStorage.getItem('supervisionUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                if (typeof window.currentUser !== 'undefined') {
                    window.currentUser = userData;
                }
                console.log('✅ Usuário recuperado do localStorage (auth):', userData?.email);
            } catch (e) {
                console.error('❌ Erro ao recuperar usuário:', e);
                localStorage.removeItem('supervisionUser');
            }
        }
        
        // 🎯 CONFIGURAR OBSERVADOR
        setupAuthListener();
        
        console.log('✅ Sistema de autenticação pronto');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do auth:', error);
        
        // 🎯 MODO FALLBACK - Permitir uso sem Firebase
        const savedUser = localStorage.getItem('supervisionUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                if (typeof window.currentUser !== 'undefined') {
                    window.currentUser = userData;
                }
                console.log('✅ Usuário em modo fallback:', userData?.email);
            } catch (e) {
                console.error('❌ Erro no fallback:', e);
            }
        }
        
        console.log('⚠️ Sistema rodando em modo fallback (sem Firebase)');
    }
}

// 🎯 EXPORTAR FUNÇÕES
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.initializeAuth = initializeAuth;
window.isFirebaseAvailable = isFirebaseAvailable;
