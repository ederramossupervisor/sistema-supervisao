// firebase-documents.js - SISTEMA DE DOCUMENTOS

// 🎯 SALVAR CONFIGURAÇÃO DO SUPERVISOR (VERSÃO SUPER ROBUSTA)
async function saveSupervisorConfig(config) {
    if (!currentUser || !currentUser.uid) {
        throw new Error('Usuário não está logado');
    }
    
    try {
        console.log('💾 Tentando salvar configuração para usuário:', currentUser.uid);
        
        const userConfig = {
            name: config.name,
            schools: config.schools,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            userEmail: currentUser.email,
            userId: currentUser.uid
        };
        
        console.log('📤 Dados a serem salvos:', userConfig);
        
        // Tenta salvar no Firestore
        await firebaseDb.collection('userConfigs').doc(currentUser.uid).set(userConfig);
        
        console.log('✅ Configuração salva no Firebase com sucesso!');
        
        // Também salva no localStorage como backup
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro detalhado ao salvar configuração:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem do erro:', error.message);
        
        // Fallback para localStorage
        console.log('🔄 Salvando no localStorage como fallback...');
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        throw new Error('Firebase bloqueado. Dados salvos localmente: ' + error.message);
    }
}// 🎯 GERAR DOCUMENTO (SIMULAÇÃO - SEM CORS!)
async function generateDocument(documentType, formData) {
    if (!currentUser) {
        throw new Error('Usuário não está logado');
    }
    
    try {
        const documentId = `${documentType}_${Date.now()}`;
        
        // Salvar no Firebase
        await firebaseDb.collection('documents').doc(documentId).set({
            type: documentType,
            formData: formData,
            schoolName: formData["Nome da Escola"],
            supervisorName: formData["Nome do Supervisor"],
            userEmail: currentUser.email,
            userName: currentUser.name,
            status: 'generated',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Documento salvo no Firebase:', documentId);
        
        // 🎯 SIMULAR RESPOSTA DO GOOGLE DOCS (sem CORS!)
        return {
            success: true,
            documentId: documentId,
            links: {
                doc: `https://docs.google.com/document/d/${documentId}/edit`,
                pdf: `https://drive.google.com/file/d/${documentId}/view`, 
                folder: `https://drive.google.com/drive/folders/user-${currentUser.uid}`
            },
            fileNames: {
                doc: `${documentType}_${formData["Nome da Escola"]}.docx`,
                pdf: `${documentType}_${formData["Nome da Escola"]}.pdf`
            }
        };
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        throw error;
    }
}

// Exportar funções
window.saveSupervisorConfig = saveSupervisorConfig;
window.generateDocument = generateDocument;
