// firebase-documents.js - VERSÃO SIMPLIFICADA E ATUALIZADA

// 🎯 SALVAR CONFIGURAÇÃO (APENAS LOCAL)
async function saveSupervisorConfig(config) {
    try {
        console.log('💾 Salvando configuração local...');
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        return { 
            success: true, 
            message: 'Configuração salva com sucesso!' 
        };
        
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        return { 
            success: false, 
            error: 'Erro ao salvar configuração' 
        };
    }
}

// 🎯 CARREGAR CONFIGURAÇÃO (APENAS LOCAL)
async function loadSupervisorConfig() {
    try {
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

// 🎯 GERAR DOCUMENTO DIRETO NO APPS SCRIPT
async function generateDocument(documentType, formData, userInfo) {
    try {
        console.log('📝 Gerando documento via Apps Script...');
        
        const requestData = {
            action: "createDocument",
            userEmail: userInfo?.email || "demo@educador.edu.es.gov.br",
            documentType: documentType,
            formData: formData,
            userInfo: {
                name: userInfo?.name || "Supervisor Demo"
            }
        };
        
        // 🎯 URL DO SEU APPS SCRIPT (ATUALIZE ESTA LINHA!)
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxiEb5WDDdqfAeQX9oZX9-xmwG2FzUdwBGpl5ftl-UgtJUqs97iGBdJcbG0s2_EEuG/exec';
        
        console.log('📤 Enviando para:', APPS_SCRIPT_URL);
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Documento gerado com sucesso!');
            return result;
        } else {
            throw new Error(result.error || 'Erro ao gerar documento');
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        throw error;
    }
}

// Exportar funções
window.saveSupervisorConfig = saveSupervisorConfig;
window.loadSupervisorConfig = loadSupervisorConfig;
window.generateDocument = generateDocument;
