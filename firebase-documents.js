// firebase-documents.js - SISTEMA DE DOCUMENTOS CORRIGIDO

// 🎯 SALVAR CONFIGURAÇÃO DO SUPERVISOR (VERSÃO CORRIGIDA)
async function saveSupervisorConfig(config) {
    try {
        console.log('💾 Tentando salvar configuração...');
        
        // Obter currentUser do escopo global
        const user = window.currentUser;
        console.log('👤 Usuário atual:', user);
        
        if (!user || !user.uid) {
            console.log('⚠️ Usuário não logado no Firebase, salvando apenas localmente');
            
            // Fallback: salvar apenas no localStorage
            localStorage.setItem('supervisorConfig', JSON.stringify(config));
            return { success: true, savedLocally: true };
        }
        
        const userConfig = {
            name: config.name,
            schools: config.schools,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            userEmail: user.email,
            userId: user.uid
        };
        
        console.log('📤 Salvando no Firestore:', userConfig);
        
        // Tenta salvar no Firestore
        await firebaseDb.collection('userConfigs').doc(user.uid).set(userConfig);
        
        console.log('✅ Configuração salva no Firebase com sucesso!');
        
        // Também salva no localStorage como backup
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        return { success: true, savedInFirebase: true };
        
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        
        // Fallback para localStorage
        console.log('🔄 Salvando no localStorage como fallback...');
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        return { 
            success: true, 
            savedLocally: true,
            error: 'Firebase bloqueado. Dados salvos localmente.' 
        };
    }
}

// 🎯 GERAR DOCUMENTO (COM PROXY CODESANDBOX)
async function generateDocument(documentType, formData) {
    try {
        console.log('📝 Iniciando geração de documento...');
        
        const user = window.currentUser;
        console.log('👤 Usuário para documento:', user);
        
        if (!user) {
            throw new Error('Usuário não está logado');
        }
        
        // 🎯 AGORA USANDO O PROXY CODESANDBOX!
        const requestData = {
            action: "createDocument",
            userEmail: user.email || "demo@educador.edu.es.gov.br",
            documentType: documentType,
            formData: formData,
            userInfo: {
                name: user.name || "Supervisor",
                uid: user.uid || "demo-user"
            }
        };
        
        console.log('📤 Enviando para proxy:', requestData);
        
        // Chamar via proxy CodeSandbox
        const result = await callAppsScriptViaProxy(requestData);
        
        if (result.success) {
            console.log('🎉 Documentos gerados com sucesso!', result);
            return result;
        } else {
            throw new Error(result.error || 'Erro desconhecido ao gerar documentos');
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        throw error;
    }
}

// 🎯 FUNÇÃO DO PROXY (DEVE ESTAR NO script.js, mas colocamos aqui também por segurança)
async function callAppsScriptViaProxy(data) {
    try {
        const PROXY_URL = 'https://csymhk-3000.csb.app/proxy';
        console.log('🔄 Enviando dados para CodeSandbox...', data);
        
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('📨 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Resposta recebida via CodeSandbox:', result);
        
        return result;

    } catch (error) {
        console.error('❌ Erro na comunicação com CodeSandbox:', error);
        throw new Error(`Falha na comunicação: ${error.message}`);
    }
}

// Exportar funções
window.saveSupervisorConfig = saveSupervisorConfig;
window.generateDocument = generateDocument;
window.callAppsScriptViaProxy = callAppsScriptViaProxy;
