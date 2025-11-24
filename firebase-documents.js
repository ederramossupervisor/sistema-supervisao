// firebase-documents.js - VERSÃO COM FALLBACK COMPLETO

// 🎯 SALVAR CONFIGURAÇÃO DO SUPERVISOR
async function saveSupervisorConfig(config) {
    try {
        console.log('💾 Iniciando salvamento da configuração...');
        
        const user = window.currentUser;
        console.log('👤 Usuário atual:', user);
        
        if (!user || !user.uid) {
            console.log('⚠️ Usuário não logado, salvando apenas localmente');
            localStorage.setItem('supervisorConfig', JSON.stringify(config));
            return { success: true, savedLocally: true };
        }
        
        // Tentar salvar no Firebase
        try {
            const userConfig = {
                name: config.name,
                schools: config.schools,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userEmail: user.email,
                userId: user.uid
            };
            
            console.log('📤 Tentando salvar no Firestore...');
            await firebaseDb.collection('userConfigs').doc(user.uid).set(userConfig);
            console.log('✅ Configuração salva no Firebase!');
            
        } catch (firebaseError) {
            console.warn('⚠️ Firebase falhou, usando localStorage:', firebaseError.message);
            // Continua para salvar no localStorage
        }
        
        // SEMPRE salvar no localStorage (como backup)
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        console.log('💾 Configuração salva no localStorage');
        
        return { 
            success: true, 
            savedLocally: true,
            message: 'Configuração salva com sucesso!'
        };
        
    } catch (error) {
        console.error('❌ Erro crítico ao salvar configuração:', error);
        
        // Último recurso: localStorage
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        return { 
            success: true, 
            savedLocally: true,
            error: 'Configuração salva localmente devido a erro no servidor.'
        };
    }
}

// 🎯 CARREGAR CONFIGURAÇÃO (COM FALLBACK)
async function loadSupervisorConfig() {
    try {
        const user = window.currentUser;
        
        if (user && user.uid) {
            try {
                // Tentar carregar do Firebase
                const doc = await firebaseDb.collection('userConfigs').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    console.log('✅ Configuração carregada do Firebase');
                    return data;
                }
            } catch (firebaseError) {
                console.warn('⚠️ Não foi possível carregar do Firebase:', firebaseError.message);
            }
        }
        
        // Fallback: carregar do localStorage
        const localConfig = localStorage.getItem('supervisorConfig');
        if (localConfig) {
            console.log('💾 Configuração carregada do localStorage');
            return JSON.parse(localConfig);
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return null;
    }
}

// 🎯 GERAR DOCUMENTO (COM PROXY)
async function generateDocument(documentType, formData) {
    try {
        console.log('📝 Iniciando geração de documento...');
        
        const user = window.currentUser;
        
        if (!user) {
            // Modo demo - permitir mesmo sem usuário logado
            console.log('👤 Modo demo - gerando sem usuário logado');
        }
        
        const requestData = {
            action: "createDocument",
            userEmail: user?.email || "demo@educador.edu.es.gov.br",
            documentType: documentType,
            formData: formData,
            userInfo: {
                name: user?.name || "Supervisor Demo",
                uid: user?.uid || "demo-user"
            }
        };
        
        console.log('📤 Enviando para proxy:', requestData);
        
        // Chamar via proxy CodeSandbox
        const result = await callAppsScriptViaProxy(requestData);
        
        if (result.success) {
            console.log('🎉 Documentos gerados com sucesso!');
            return result;
        } else {
            throw new Error(result.error || 'Erro ao gerar documentos');
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        throw error;
    }
}

// 🎯 FUNÇÃO DO PROXY
async function callAppsScriptViaProxy(data) {
    try {
        const PROXY_URL = 'https://csymhk-3000.csb.app/proxy';
        console.log('🔄 Enviando para CodeSandbox...');
        
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Resposta do proxy:', result);
        return result;

    } catch (error) {
        console.error('❌ Erro no proxy:', error);
        throw new Error(`Falha na comunicação: ${error.message}`);
    }
}

// Exportar funções
window.saveSupervisorConfig = saveSupervisorConfig;
window.loadSupervisorConfig = loadSupervisorConfig;
window.generateDocument = generateDocument;
window.callAppsScriptViaProxy = callAppsScriptViaProxy;
