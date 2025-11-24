// proxy/api/proxy.js
const axios = require('axios');

// URL do seu Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfvBnXJK3LDP7QYHdlZptVgJWfMeYa7RJtAbdCKC9_U3VQnt8yRQztf48lhP-8ZIMT/exec';

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://ederramossupervisor.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Responder a preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rota de health check
  if (req.method === 'GET' && req.url === '/') {
    return res.json({
      status: 'online',
      message: '🚀 Proxy Sistema Supervisão - Vercel',
      timestamp: new Date().toISOString(),
      version: '2.0',
      endpoints: ['POST /api/proxy', 'GET /']
    });
  }

  // Processar requisições POST para o proxy
  if (req.method === 'POST') {
    try {
      console.log('📨 Recebendo requisição para Apps Script...');
      
      const requestData = {
        ...req.body,
        proxyTimestamp: new Date().toISOString(),
        proxyVersion: '2.0-vercel'
      };

      console.log('📤 Enviando para Apps Script:', JSON.stringify(requestData, null, 2));

      const response = await axios.post(APPS_SCRIPT_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000 // 45 segundos
      });

      console.log('✅ Resposta do Apps Script recebida com sucesso!');
      
      return res.json({
        ...response.data,
        proxyProcessed: true,
        proxyTimestamp: new Date().toISOString(),
        deployedOn: 'Vercel'
      });

    } catch (error) {
      console.error('❌ Erro no proxy Vercel:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          error: 'Timeout: O Apps Script demorou muito para responder',
          details: 'Tente novamente em alguns segundos'
        });
      } else if (error.response) {
        return res.status(502).json({
          success: false,
          error: `Erro no Apps Script: ${error.response.status}`,
          details: error.response.data
        });
      } else if (error.request) {
        return res.status(503).json({
          success: false,
          error: 'Não foi possível conectar com o Google Apps Script',
          details: 'Verifique se a URL do Apps Script está correta'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Erro interno do proxy Vercel',
          details: error.message
        });
      }
    }
  }

  // Rota não encontrada
  return res.status(404).json({
    error: 'Rota não encontrada',
    availableRoutes: ['POST /api/proxy', 'GET /']
  });
};
