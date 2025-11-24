// firebase-documents.js - SISTEMA DE DOCUMENTOS

// 🎯 SALVAR CONFIGURAÇÃO DO SUPERVISOR (VERSÃO CORRIGIDA)
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
            userId: currentUser.uid // 🔥 ADICIONE ESTA LINHA
        };
        
        await firebaseDb.collection('userConfigs').doc(currentUser.uid).set(userConfig);
        
        console.log('✅ Configuração salva no Firebase com sucesso!');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro detalhado ao salvar configuração:', error);
        
        // Fallback para localStorage
        console.log('🔄 Tentando salvar no localStorage...');
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        throw new Error('Erro ao salvar no Firebase. Dados salvos localmente.');
    }
}
// 🎯 GERAR DOCUMENTO (SIMULAÇÃO - SEM CORS!)
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
