// netlify/functions/proxy.js
const axios = require('axios');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://ederramossupervisor.github.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
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
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfvBnXJK3LDP7QYHdlZptVgJWfMeYa7RJtAbdCKC9_U3VQnt8yRQztf48lhP-8ZIMT/exec';
    
    const requestData = JSON.parse(event.body);
    
    const response = await axios.post(APPS_SCRIPT_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error('Erro no proxy:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro no servidor proxy',
        details: error.message
      })
    };
  }
};
