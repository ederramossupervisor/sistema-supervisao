// firebase-documents.js - VERSÃO SIMPLIFICADA E ATUALIZADA

// 🎯 URL DO APPS SCRIPT (USANDO SUA URL)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwv-L_DLgWi-F9QvIVGY6yEU-qlbBSqdzjqQKm7Kp_rw0DskdmEP6aXrN04VOhoSRp8/exec';

// 🎯 SALVAR CONFIGURAÇÃO (APENAS LOCAL - MAIS SIMPLES)
async function saveSupervisorConfig(config) {
    try {
        console.log('💾 Salvando configuração local...', config);
        
        // 🎯 VALIDAÇÃO BÁSICA
        if (!config.name || !config.schools || config.schools.length === 0) {
            throw new Error('Configuração inválida');
        }
        
        // 🎯 SALVAR NO LOCALSTORAGE
        localStorage.setItem('supervisorConfig', JSON.stringify(config));
        
        console.log('✅ Configuração salva com sucesso');
        
        return { 
            success: true, 
            message: 'Configuração salva com sucesso!' 
        };
        
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        return { 
            success: false, 
            error: 'Erro ao salvar configuração: ' + error.message 
        };
    }
}

// 🎯 CARREGAR CONFIGURAÇÃO (APENAS LOCAL)
async function loadSupervisorConfig() {
    try {
        const configData = localStorage.getItem('supervisorConfig');
        
        if (configData) {
            const config = JSON.parse(configData);
            console.log('💾 Configuração carregada do localStorage');
            return config;
        }
        
        console.log('ℹ️ Nenhuma configuração encontrada');
        return null;
        
    } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return null;
    }
}

// 🎯 GERAR DOCUMENTO DIRETO NO APPS SCRIPT
async function generateDocument(documentType, formData, userInfo) {
    try {
        console.log('📝 Iniciando geração de documento...', {
            documentType,
            formData: Object.keys(formData),
            userInfo: userInfo?.name
        });
        
        // 🎯 PREPARAR DADOS PARA ENVIO
        const requestData = {
            action: "createDocument",
            userEmail: userInfo?.email || "usuario@educador.edu.es.gov.br",
            documentType: documentType,
            formData: formData,
            userInfo: {
                name: userInfo?.name || "Supervisor",
                schools: userInfo?.schools || []
            }
        };
        
        console.log('📤 Enviando para Apps Script:', APPS_SCRIPT_URL);
        
        // 🎯 FAZER REQUISIÇÃO
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log('📨 Resposta do Apps Script:', result);
        
        if (result.success) {
            console.log('✅ Documento gerado com sucesso!');
            return result;
        } else {
            throw new Error(result.error || 'Erro desconhecido ao gerar documento');
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento:', error);
        
        // 🎯 MENSAGEM DE ERRO AMIGÁVEL
        let errorMessage = 'Erro ao gerar documento: ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Erro de conexão. Verifique sua internet.';
        } else if (error.message.includes('HTTP')) {
            errorMessage += 'Erro no servidor. Tente novamente.';
        } else {
            errorMessage += error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// 🎯 TESTAR CONEXÃO COM APPS SCRIPT
async function testConnection() {
    try {
        console.log('🔗 Testando conexão com Apps Script...');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: "test",
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Conexão testada com sucesso:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 🎯 EXPORTAR FUNÇÕES
window.saveSupervisorConfig = saveSupervisorConfig;
window.loadSupervisorConfig = loadSupervisorConfig;
window.generateDocument = generateDocument;
window.testConnection = testConnection;

console.log('📝 Módulo de documentos carregado!');
