// firebase-auth.js - SISTEMA DE LOGIN CORRIGIDO

// 🎯 FUNÇÃO DE LOGIN COM GOOGLE
async function loginWithGoogle() {
    try {
        console.log('🔐 Iniciando login...');
        
        // Abrir popup do Google
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        const user = result.user;
        
        console.log('✅ Login bem-sucedido:', user.email);
        return user;
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Login cancelado pelo usuário');
        } else if (error.code === 'auth/unauthorized-domain') {
            throw new Error('Domínio não autorizado. Configure o domínio no Firebase Console.');
        } else {
            throw new Error('Erro no login: ' + error.message);
        }
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

// 🎯 OBSERVAR MUDANÇAS NO LOGIN
function setupAuthListener() {
    firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            // 🎯 USUÁRIO LOGOU
            currentUser = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            };
            
            console.log('👤 Usuário logado:', currentUser.email);
            
            // Salvar no localStorage como backup
            localStorage.setItem('supervisionUser', JSON.stringify(currentUser));
            
            // Atualizar interface
            updateUserInterface();
            mostrarMenu();
            mostrarTela('mainScreen');
            carregarDocumentos();
            
        } else {
            // 🎯 USUÁRIO DESLOGOU
            currentUser = null;
            localStorage.removeItem('supervisionUser');
            mostrarTela('loginScreen');
            
            // Esconder menu
            const navMenu = document.getElementById('navMenu');
            if (navMenu) navMenu.style.display = 'none';
            
            console.log('🔐 Usuário deslogado');
        }
    });
}

// 🎯 ATUALIZAR A TELA COM DADOS DO USUÁRIO
function updateUserInterface() {
    const userName = document.getElementById('userName');
    const welcomeName = document.getElementById('welcomeName');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (currentUser && userName) {
        userName.textContent = currentUser.name;
    }
    if (currentUser && welcomeName) {
        welcomeName.textContent = currentUser.name;
    }
    if (currentUser && userAvatar) {
        if (currentUser.photoURL) {
            userAvatar.innerHTML = `<img src="${currentUser.photoURL}" alt="${currentUser.name}" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
    }
}

// 🎯 INICIAR SISTEMA DE AUTENTICAÇÃO
function initializeAuth() {
    console.log('🔥 Inicializando autenticação Firebase...');
    setupAuthListener();
    
    // Verificar se já está logado
    const savedUser = localStorage.getItem('supervisionUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ Usuário recuperado do localStorage:', currentUser.email);
        } catch (e) {
            console.error('❌ Erro ao recuperar usuário:', e);
        }
    }
    
    console.log('✅ Sistema de autenticação pronto');
}

// Exportar funções para usar no script principal
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.initializeAuth = initializeAuth;
window.currentUser = currentUser;
