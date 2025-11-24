const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS para seu domínio
app.use(cors({
  origin: [
    'https://ederramossupervisor.github.io',
    'https://ederramossupervisor.github.io',
    'http://localhost:8000',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// URL do seu Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfvBnXJK3LDP7QYHdlZptVgJWfMeYa7RJtAbdCKC9_U3VQnt8yRQztf48lhP-8ZIMT/exec';

// Rota de health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Proxy para Google Apps Script - Sistema Supervisão',
    timestamp: new Date().toISOString(),
    appsScriptUrl: APPS_SCRIPT_URL,
    version: '2.0'
  });
});

// Middleware para logs
app.use((req, res, next) => {
  console.log('📨 Nova requisição:', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  next();
});

// Rota principal do proxy
app.post('/proxy', async (req, res) => {
  try {
    console.log('🔄 Processando requisição para Apps Script...');
    
    const requestData = {
      ...req.body,
      proxyTimestamp: new Date().toISOString(),
      proxyVersion: '2.0'
    };

    console.log('📤 Dados enviados:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(APPS_SCRIPT_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 45000,
      transformRequest: [(data) => JSON.stringify(data)]
    });

    console.log('✅ Resposta do Apps Script recebida com sucesso!');
    
    res.json({
      ...response.data,
      proxyProcessed: true,
      proxyTimestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no proxy:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        success: false,
        error: 'Timeout: O Apps Script demorou muito para responder',
        details: 'Tente novamente em alguns segundos'
      });
    } else if (error.response) {
      res.status(502).json({
        success: false,
        error: `Erro no Apps Script: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      res.status(503).json({
        success: false,
        error: 'Não foi possível conectar com o Google Apps Script',
        details: 'Verifique se a URL do Apps Script está correta'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro interno do proxy',
        details: error.message
      });
    }
  }
});

// Rota para teste simples
app.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Proxy funcionando corretamente!',
    timestamp: new Date().toISOString(),
    appsScriptUrl: APPS_SCRIPT_URL
  });
});

// Rota OPTIONS para CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Rota de fallback
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    availableRoutes: [
      'GET /',
      'POST /proxy', 
      'GET /test',
      'OPTIONS *'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy Sistema Supervisão rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 Apps Script: ${APPS_SCRIPT_URL}`);
  console.log(`⏰ Timeout configurado: 45 segundos`);
  console.log(`🌐 Domínios permitidos: ederramossupervisor.github.io`);
});
