// netlify/functions/proxy.js
const axios = require('axios');

// URL do seu Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfvBnXJK3LDP7QYHdlZptVgJWfMeYa7RJtAbdCKC9_U3VQnt8yRQztf48lhP-8ZIMT/exec';

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://ederramossupervisor.github.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
  };

  // Responder a preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Health check
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'online',
        message: '🚀 Proxy Sistema Supervisão - Netlify',
        timestamp: new Date().toISOString(),
        version: '2.0'
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    console.log('📨 Recebendo requisição para Apps Script...');
    
    const requestData = JSON.parse(event.body);
    
    const response = await axios.post(APPS_SCRIPT_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 45000
    });

    console.log('✅ Resposta do Apps Script recebida!');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...response.data,
        proxyProcessed: true,
        proxyTimestamp: new Date().toISOString(),
        deployedOn: 'Netlify'
      })
    };

  } catch (error) {
    console.error('❌ Erro no proxy Netlify:', error.message);
    
    let statusCode = 500;
    let errorMessage = 'Erro interno do proxy';
    
    if (error.code === 'ECONNABORTED') {
      statusCode = 504;
      errorMessage = 'Timeout: O Apps Script demorou muito para responder';
    } else if (error.response) {
      statusCode = 502;
      errorMessage = `Erro no Apps Script: ${error.response.status}`;
    } else if (error.request) {
      statusCode = 503;
      errorMessage = 'Não foi possível conectar com o Google Apps Script';
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.message
      })
    };
  }
};
