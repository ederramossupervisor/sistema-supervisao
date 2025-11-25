// 🎯 SISTEMA SUPERVISÃO - VERSÃO FIREBASE
console.log('🎯 INICIANDO SISTEMA SUPERVISÃO - VERSÃO FIREBASE');

// Estados globais
let currentUser = null;
let supervisorConfig = null;
let currentDocumentType = null;

// 🎯 CONFIGURAÇÃO DO GITHUB ACTIONS PROXY
const GITHUB_OWNER = 'ederramossupervisor';
const GITHUB_REPO = 'sistema-supervisao';

// 🎯 FUNÇÃO DE PROXY VIA GITHUB ACTIONS
async function callAppsScriptViaProxy(data) {
  try {
    console.log('🚀 Iniciando sistema de polling...', data.documentType);
    
    // 🎯 AGORA VAMOS USAR POLLING
    const response = await callAppsScriptDirect(data);
    
    return response;

  } catch (error) {
    console.error('❌ Erro no sistema de polling:', error);
    
    // 🎯 FALLBACK: Tentar método antigo se polling falhar
    console.log('🔄 Tentando fallback...');
    throw error;
  }
}

// 🎯 FUNÇÃO COM POLLING PARA LINKS REAIS - CORRIGIDA
async function callAppsScriptDirect(data) {
  try {
    console.log('🔗 Iniciando processo com polling CORRETO...');
    
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxiEb5WDDdqfAeQX9oZX9-xmwG2FzUdwBGpl5ftl-UgtJUqs97iGBdJcbG0s2_EEuG/exec';
    
    // 🎯 1. ENVIAR VIA JSONP (técnica alternativa para evitar CORS)
    console.log('📤 Enviando dados via JSONP...');
    const documentId = await sendViaJsonp(APPS_SCRIPT_URL, {
      ...data,
      action: 'createDocumentAsync'
    });
    
    if (!documentId) {
      throw new Error('Não foi possível obter ID do documento');
    }
    
    console.log('🆕 ID REAL do documento:', documentId);
    
    // 🎯 2. FAZER POLLING COM ID REAL
    console.log('🔄 Iniciando polling com ID REAL...');
    const pollResult = await pollDocumentStatus(documentId);
    
    console.log('✅ Polling finalizado com links REAIS:', pollResult);
    return pollResult;

  } catch (error) {
    console.error('❌ Erro no processo com polling:', error);
    
    // 🎯 FALLBACK: Se polling falhar, usar método antigo
    console.log('🔄 Usando fallback no-cors...');
    return await callAppsScriptNoCors(data);
  }
}

// 🎯 FUNÇÃO PARA ENVIAR DADOS VIA JSONP (evita CORS)
function sendViaJsonp(url, data) {
  return new Promise((resolve, reject) => {
    // 🎯 CRIAR UM ID ÚNICO PARA ESTA REQUISIÇÃO
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    // 🎯 ADICIONAR script AO DOCUMENTO
    const script = document.createElement('script');
    
    // 🎯 CONSTRUIR URL COM CALLBACK
    const params = new URLSearchParams({
      ...data,
      callback: callbackName
    });
    
    script.src = url + '?' + params.toString();
    
    // 🎯 DEFINIR FUNÇÃO DE CALLBACK GLOBAL
    window[callbackName] = function(response) {
      // 🎯 LIMPAR
      delete window[callbackName];
      document.body.removeChild(script);
      
      if (response && response.success && response.documentId) {
        console.log('✅ JSONP sucesso - ID:', response.documentId);
        resolve(response.documentId);
      } else {
        console.error('❌ JSONP erro:', response);
        reject(new Error(response?.error || 'Erro no JSONP'));
      }
    };
    
    // 🎯 TRATAR ERRO
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('Erro de rede no JSONP'));
    };
    
    // 🎯 ADICIONAR SCRIPT PARA EXECUTAR
    document.body.appendChild(script);
    
    console.log('📤 JSONP enviado, aguardando callback...');
  });
}

// 🎯 FUNÇÃO DE POLLING PARA VERIFICAR STATUS - CORRIGIDA E COMPLETA
async function pollDocumentStatus(documentId) {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxiEb5WDDdqfAeQX9oZX9-xmwG2FzUdwBGpl5ftl-UgtJUqs97iGBdJcbG0s2_EEuG/exec';
  
  const maxAttempts = 15; // Reduzido para testes
  const pollInterval = 4000; // 4 segundos (mais tempo para processar templates)
  
  console.log(`📊 Iniciando polling para ID REAL: ${documentId}`);
  console.log(`⏰ Configuração: ${maxAttempts} tentativas, ${pollInterval}ms intervalo`);

  // 🎯 ATUALIZAR MENSAGEM DE LOADING
  const loadingMessage = document.getElementById('loadingMessage');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const currentTime = new Date().toLocaleTimeString();
    
    if (loadingMessage) {
      loadingMessage.textContent = `Processando documento... ${attempt}/${maxAttempts} (${currentTime})`;
    }
    
    console.log(`📊 Polling [${attempt}/${maxAttempts}] para: ${documentId}`);
    
    try {
      // 🎯 VERIFICAR STATUS VIA GET (NÃO BLOQUEIA CORS!)
      const statusResponse = await fetch(`${APPS_SCRIPT_URL}?action=checkStatus&documentId=${documentId}`);
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log('📨 Resposta do polling:', statusResult);
        
        if (statusResult.status === 'completed' && statusResult.result) {
          console.log('🎉 DOCUMENTO PRONTO! Links REAIS:', statusResult.result.links);
          return statusResult.result; // 🎯 RETORNAR LINKS REAIS!
        }
        else if (statusResult.status === 'error') {
          throw new Error(statusResult.error || 'Erro no processamento do documento');
        }
        else if (statusResult.status === 'processing') {
          console.log('🔄 Ainda processando...', statusResult.message);
        }
        else if (statusResult.status === 'not_found') {
          console.log('📭 Documento não encontrado no servidor');
          // 🎯 AGUARDAR UM POUCO MAIS SE NÃO ENCONTRADO
          await new Promise(resolve => setTimeout(resolve, pollInterval + 2000));
          continue;
        }
      } else {
        console.log(`⚠️ Status HTTP ${statusResponse.status}, continuando...`);
      }
    } catch (error) {
      console.log(`⚠️ Erro na tentativa ${attempt}:`, error.message);
    }
    
    // 🎯 AGUARDAR ANTES DA PRÓXIMA TENTATIVA
    if (attempt < maxAttempts) {
      console.log(`⏳ Aguardando ${pollInterval}ms...`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  // 🎯 SE CHEGOU AQUI, TEMPO ESGOTADO
  throw new Error(`Tempo esgotado (${maxAttempts * pollInterval / 1000} segundos). O documento pode estar sendo processado - verifique seu Google Drive.`);
}

// 🎯 FUNÇÃO FALLBACK - MODO NO-CORS (SE CORS AINDA FALHAR)
async function callAppsScriptNoCors(data) {
  try {
    console.log('🔗 Fallback: Modo no-cors...');
    
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxiEb5WDDdqfAeQX9oZX9-xmwG2FzUdwBGpl5ftl-UgtJUqs97iGBdJcbG0s2_EEuG/exec';
    
    // Enviar sem esperar resposta (modo no-cors)
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(data)
    });

    console.log('✅ Requisição enviada (modo no-cors)');
    
    // 🎯 Retornar resposta otimista
    return {
      success: true,
      message: "Documento em processamento - os links reais estarão no Google Drive",
      links: {
        doc: "#",
        pdf: "#", 
        folder: "#"
      },
      fileNames: {
        doc: "Documento_Em_Processamento.docx",
        pdf: "Documento_Em_Processamento.pdf"
      },
      timestamp: new Date().toISOString(),
      note: "Verifique seu Google Drive em alguns instantes"
    };

  } catch (error) {
    console.error('❌ Erro no fallback no-cors:', error);
    throw new Error('Falha na comunicação com o servidor: ' + error.message);
  }
}

// 🎯 FUNÇÃO PARA ATUALIZAR INTERFACE DO USUÁRIO
function atualizarInterfaceUsuario() {
    const userName = document.getElementById('userName');
    const welcomeName = document.getElementById('welcomeName');
    
    if (currentUser && userName) userName.textContent = currentUser.name;
    if (currentUser && welcomeName) welcomeName.textContent = currentUser.name;
    
    console.log('👤 Interface atualizada para:', currentUser?.name);
}

// Dados completos das escolas para preenchimento automático
const ESCOLAS_DATA_FRONTEND = {
    "CEEFMTI AFONSO CLÁUDIO": { municipio: "Afonso Cláudio", diretor: "Allan Dyoni Dehete Many" },
    "CEEFMTI ELISA PAIVA": { municipio: "Conceição do Castelo", diretor: "Rosangela Vargas Davel Pinto" },
    "EEEF DOMINGOS PERIM": { municipio: "Venda Nova do Imigrante", diretor: "Maristela Broedel" },
    "EEEFM ALTO RIO POSSMOSER": { municipio: "Santa Maria de Jetibá", diretor: "Adriana da Conceição Tesch" },
    "EEEFM ÁLVARO CASTELO": { municipio: "Brejetuba", diretor: "Rose Fabrícia Moretto" },
    "EEEFM ELVIRA BARROS": { municipio: "Afonso Cláudio", diretor: "Andrea Gomes Klug" },
    "EEEFM FAZENDA CAMPORÊS": { municipio: "Brejetuba", diretor: "Emerson Ungarato" },
    "EEEFM FAZENDA EMÍLIO SCHROEDER": { municipio: "Santa Maria de Jetibá", diretor: "Jorge Schneider" },
    "EEEFM FIORAVANTE CALIMAN": { municipio: "Venda Nova do Imigrante", diretor: "Celina Januário Moreira" },
    "EEEFM FREDERICO BOLDT": { municipio: "Santa Maria de Jetibá", diretor: "David Felberg" },
    "EEEFM GISELA SALLOKER FAYET": { municipio: "Domingos Martins", diretor: "Maxwel Augusto Neves" },
    "EEEFM GRAÇA ARANHA": { municipio: "Santa Maria de Jetibá", diretor: "Camilo Pauli Dominicini" },
    "EEEFM JOAQUIM CAETANO DE PAIVA": { municipio: "Laranja da Terra", diretor: "Miriam Klitzke Seibel" },
    "EEEFM JOSE CUPERTINO": { municipio: "Afonso Cláudio", diretor: "Cléria Pagotto Ronchi Zanelato" },
    "EEEFM JOSE GIESTAS": { municipio: "Afonso Cláudio", diretor: "Gederson Vargas Dazilio" },
    "EEEFM JOSÉ ROBERTO CHRISTO": { municipio: "Afonso Cláudio", diretor: "Andressa Silva Dias" },
    "EEEFM LEOGILDO SEVERIANO DE SOUZA": { municipio: "Brejetuba", diretor: "Adalberto Carlos Araújo Chaves" },
    "EEEFM LUIZ JOUFFROY": { municipio: "Laranja da Terra", diretor: "Nilza Abel Gumz" },
    "EEEFM MARIA DE ABREU ALVIM": { municipio: "Afonso Cláudio", diretor: "Maria das Graças Fabio Costa" },
    "EEEFM MARLENE BRANDÃO": { municipio: "Brejetuba", diretor: "Paulynne Ayres Tatagiba Gonçalves" },
    "EEEFM PEDRA AZUL": { municipio: "Domingos Martins", diretor: "Elizabeth Drumond Ambrósio Filgueiras" },
    "EEEFM PONTO DO ALTO": { municipio: "Domingos Martins", diretor: "Marcelo Ribett" },
    "EEEFM PROFª ALDY SOARES MERÇON VARGAS": { municipio: "Conceição do Castelo", diretor: "Israel Augusto Moreira Borges" },
    "EEEFM PROF HERMANN BERGER": { municipio: "Santa Maria de Jetibá", diretor: "Eliane Raasch Bicalho" },
    "EEEFM SÃO JORGE": { municipio: "Brejetuba", diretor: "Jormi Maria da Silva" },
    "EEEFM SÃO LUÍS": { municipio: "Santa Maria de Jetibá", diretor: "Valdirene Mageski Cordeiro Magri" },
    "EEEFM TEOFILO PAULINO": { municipio: "Domingos Martins", diretor: "Delfina Schneider Stein" },
    "EEEM FRANCISCO GUILHERME": { municipio: "Santa Maria de Jetibá", diretor: "Jonatas André Drescher" },
    "EEEM MATA FRIA": { municipio: "Afonso Cláudio", diretor: "Jonatas André Drescher" },
    "EEEM SOBREIRO": { municipio: "Laranja da Terra", diretor: "Jonatas André Drescher" }
};

// Dados completos do sistema
const APP_DATA = {
    documentTypes: [
        {
            id: "justificativa",
            name: "Justificativa", 
            icon: "fas fa-file-alt",
            description: "Documento de justificativa de indicação",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Função", type: "text", required: true },
                { name: "Nome indicado", type: "text", required: true },
                { name: "Número Funcional", type: "text", required: true },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true }
            ]
        },
        {
            id: "cuidador", 
            name: "Cuidador",
            icon: "fas fa-hands-helping",
            description: "Documento para indicação de cuidador",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Município", type: "text", required: true, auto: "municipio" },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true },
                { name: "Número do Ofício", type: "text", required: true },
                { name: "Nome do(a) Aluno(a)", type: "text", required: true },
                { name: "Série", type: "dropdown", required: true },
                { name: "Etapa de Ensino", type: "text", required: true },
                { name: "Diagnóstico", type: "text", required: true },
                { name: "CID", type: "text", required: true }
            ]
        },
        {
            id: "eletivas",
            name: "Eletivas", 
            icon: "fas fa-book",
            description: "Documento para registro de eletivas",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true },
                { name: "Nome das Eletivas", type: "textarea", required: true },
                { name: "Número Edocs", type: "text", required: true }
            ]
        },
        {
            id: "manifestacao",
            name: "Manifestação", 
            icon: "fas fa-comments",
            description: "Documento para registro de manifestações",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true },
                { name: "Relato", type: "textarea", required: true },
                { name: "Número da Manifestação", type: "text", required: true }
            ]
        },
        {
            id: "parecer",
            name: "Parecer", 
            icon: "fas fa-gavel",
            description: "Documento de parecer técnico",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Município", type: "text", required: false, auto: "municipio" },
                { name: "Nome do Diretor", type: "text", required: false, auto: "diretor" },
                { name: "Função", type: "text", required: true },
                { name: "Motivo da contratação", type: "dropdown", required: true },
                { name: "Oferta", type: "dropdown", required: true },
                { name: "Nome indicado", type: "text", required: true },
                { name: "Componente Curricular", type: "text", required: true },
                { name: "Formação", type: "text", required: true },
                { name: "Nome do Supervisor", type: "text", required: true }
            ]
        },
        {
            id: "projeto",
            name: "Projeto", 
            icon: "fas fa-project-diagram",
            description: "Documento para registro de projetos",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true },
                { name: "Nome do Projeto", type: "text", required: true }
            ]
        },
        {
            id: "regularizacao_aee",
            name: "Regularização AEE", 
            icon: "fas fa-wheelchair",
            description: "Documento para regularização de AEE",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Município", type: "text", required: false, auto: "municipio" },
                { name: "Data", type: "date", required: true },
                { name: "Número do Ofício", type: "text", required: true },
                { name: "Data do Ofício", type: "date", required: true },
                { name: "Nome do(a) Aluno(a)", type: "text", required: true },
                { name: "Série", type: "dropdown", required: true },
                { name: "Etapa de Ensino", type: "text", required: true },
                { name: "Diagnóstico", type: "text", required: true },
                { name: "CID", type: "text", required: true },
                { name: "Nome do Supervisor", type: "text", required: true }
            ]
        },
        {
            id: "viagem_pedagogica",
            name: "Viagem Pedagógica", 
            icon: "fas fa-bus",
            description: "Documento para autorização de viagem pedagógica",
            fields: [
                { name: "Nome da Escola", type: "dropdown", required: true },
                { name: "Nome do Supervisor", type: "text", required: true },
                { name: "Data", type: "date", required: true },
                { name: "Nome do Projeto", type: "text", required: true },
                { name: "Local de Visitação", type: "text", required: true }
            ]
        }
    ],
    
    dropdowns: {
        escolas: [
            "CEEFMTI AFONSO CLÁUDIO",
            "CEEFMTI ELISA PAIVA", 
            "EEEF DOMINGOS PERIM",
            "EEEFM ALTO RIO POSSMOSER",
            "EEEFM ÁLVARO CASTELO",
            "EEEFM ELVIRA BARROS",
            "EEEFM FAZENDA CAMPORÊS",
            "EEEFM FAZENDA EMÍLIO SCHROEDER",
            "EEEFM FIORAVANTE CALIMAN",
            "EEEFM FREDERICO BOLDT",
            "EEEFM GISELA SALLOKER FAYET",
            "EEEFM GRAÇA ARANHA",
            "EEEFM JOAQUIM CAETANO DE PAIVA",
            "EEEFM JOSE CUPERTINO",
            "EEEFM JOSE GIESTAS",
            "EEEFM JOSÉ ROBERTO CHRISTO",
            "EEEFM LEOGILDO SEVERIANO DE SOUZA",
            "EEEFM LUIZ JOUFFROY",
            "EEEFM MARIA DE ABREU ALVIM",
            "EEEFM MARLENE BRANDÃO",
            "EEEFM PEDRA AZUL",
            "EEEFM PONTO DO ALTO",
            "EEEFM PROFª ALDY SOARES MERÇON VARGAS",
            "EEEFM PROF HERMANN BERGER",
            "EEEFM SÃO JORGE",
            "EEEFM SÃO LUÍS",
            "EEEFM TEOFILO PAULINO",
            "EEEM FRANCISCO GUILHERME",
            "EEEM MATA FRIA",
            "EEEM SOBREIRO"
        ],
        
        motivo_contratacao: [
            "Lista esgotada",
            "Substituição",
            "Expansão de turma",
            "Afastamento médico",
            "Licença maternidade",
            "Outros"
        ],
        
        oferta: [
            "Regular",
            "EJA/Neeja", 
            "Técnico"
        ],
        
        serie: [
            "1º ano",
            "2º ano", 
            "3º ano",
            "4º ano",
            "5º ano", 
            "6º ano",
            "7º ano",
            "8º ano",
            "9º ano",
            "1ª série",
            "2ª série",
            "3ª série"
        ]
    }
};

// ================================
// FUNÇÕES PRINCIPAIS - INICIALIZAÇÃO
// ================================

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 DOM Carregado');
    iniciarSistema();
});

function iniciarSistema() {
    console.log('🚀 Iniciando sistema...');
    
    // 1. Esconder loading com timeout de segurança
    setTimeout(function() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.style.display = 'none';
            console.log('✅ Loading escondido');
        } else {
            console.log('⚠️ Elemento loading não encontrado');
        }
    }, 1000);
    
    // 2. Inicializar Firebase
    if (typeof initializeAuth !== 'undefined') {
        initializeAuth();
    } else {
        console.log('⚠️ Firebase não carregado - usando modo fallback');
        mostrarTela('loginScreen');
    }
    
    // 3. Configurar eventos
    configurarEventos();
    
    // 4. Verificar se já está logado (fallback)
    verificarLoginFallback();
}

function configurarEventos() {
    console.log('🔧 Configurando eventos...');
    
    // Botão de login do Firebase
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Menu de navegação
    const menuBtn = document.getElementById('menuButton');
    const configBtn = document.getElementById('configButton');
    const logoutBtn = document.getElementById('logoutButton');
    
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (configBtn) configBtn.addEventListener('click', () => mostrarTela('configScreen'));
    if (logoutBtn) logoutBtn.addEventListener('click', fazerLogout);
    
    // Formulário de configuração
    const supervisorForm = document.getElementById('supervisorForm');
    if (supervisorForm) {
        supervisorForm.addEventListener('submit', handleSupervisorConfig);
    }
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !e.target.closest('.nav-menu')) {
            navLinks.classList.remove('show');
        }
    });
    
    // Configurar eventos do modal
    configurarEventosModal();
}

// ================================
// 🎯 AUTENTICAÇÃO FIREBASE
// ================================

// Função de login com Firebase
async function handleGoogleLogin() {
    try {
        if (typeof loginWithGoogle !== 'undefined') {
            await loginWithGoogle();
        } else {
            // Fallback - simular login bem-sucedido
            alert('⚠️ Firebase não carregado - Modo de demonstração');
            currentUser = {
                name: "Supervisor Demo",
                email: "demo@educador.edu.es.gov.br"
            };
            mostrarMenu();
            atualizarInterfaceUsuario();
            mostrarTela('mainScreen');
            carregarDocumentos();
        }
    } catch (error) {
        alert('Erro no login: ' + error.message);
    }
}

// Função de logout
async function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        try {
            if (typeof logout !== 'undefined') {
                await logout();
            } else {
                // Fallback
                currentUser = null;
                localStorage.removeItem('supervisionUser');
                mostrarTela('loginScreen');
                const navMenu = document.getElementById('navMenu');
                if (navMenu) navMenu.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }
}

// Verificação de login fallback
function verificarLoginFallback() {
    const userData = localStorage.getItem('supervisionUser');
    
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('✅ Usuário já logado (fallback):', currentUser.name);
            
            carregarConfiguracao();
            mostrarMenu();
            atualizarInterfaceUsuario();
            mostrarTela('mainScreen');
            carregarDocumentos();
            
        } catch (e) {
            console.error('❌ Erro ao carregar usuário:', e);
            fazerLogout();
        }
    } else {
        console.log('🔐 Usuário não logado, aguardando autenticação...');
    }
}

// ================================
// FUNÇÕES DE INTERFACE
// ================================

function mostrarMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.style.display = 'block';
        console.log('✅ Menu mostrado');
    }
}

function atualizarInterfaceUsuario() {
    const userName = document.getElementById('userName');
    const welcomeName = document.getElementById('welcomeName');
    
    if (currentUser && userName) userName.textContent = currentUser.name;
    if (currentUser && welcomeName) welcomeName.textContent = currentUser.name;
}

function mostrarTela(nomeTela) {
    console.log('🖥️ Mostrando tela:', nomeTela);
    
    window.scrollTo(0, 0);
    
    const telas = document.querySelectorAll('.screen');
    telas.forEach(tela => {
        tela.classList.remove('active');
    });
    
    const telaAlvo = document.getElementById(nomeTela);
    if (telaAlvo) {
        telaAlvo.classList.add('active');
        
        if (nomeTela === 'configScreen') {
            carregarFormularioConfiguracao();
        }
        
        console.log('✅ Tela mostrada:', nomeTela);
    }
}

function carregarDocumentos() {
    console.log('📄 Carregando documentos...');
    
    const grid = document.getElementById('documentGrid');
    if (!grid) {
        console.error('❌ Grid de documentos não encontrado');
        return;
    }
    
    grid.innerHTML = APP_DATA.documentTypes.map(doc => `
        <div class="document-card" onclick="selecionarDocumento('${doc.id}')">
            <div class="document-icon">
                <i class="${doc.icon}"></i>
            </div>
            <h3>${doc.name}</h3>
            <p>${doc.description}</p>
            <div class="document-fields">
                <small>${doc.fields.length} campos para preencher</small>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Documentos carregados:', APP_DATA.documentTypes.length);
}

function selecionarDocumento(documentId) {
    console.log('🎯 Documento selecionado:', documentId);
    
    if (!supervisorConfig?.name || !supervisorConfig?.schools?.length) {
        alert('⚠️ Configure primeiro o supervisor e as escolas na tela de configuração!');
        mostrarTela('configScreen');
        return;
    }
    
    currentDocumentType = documentId;
    window.scrollTo(0, 0);
    criarFormularioDocumento(documentId);
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

// ================================
// FUNÇÕES DE CONFIGURAÇÃO
// ================================

function carregarConfiguracao() {
    const config = localStorage.getItem('supervisorConfig');
    if (config) {
        try {
            supervisorConfig = JSON.parse(config);
            console.log('✅ Configuração carregada:', supervisorConfig);
        } catch (e) {
            console.error('❌ Erro ao carregar configuração:', e);
        }
    }
}

function carregarFormularioConfiguracao() {
    console.log('📋 Carregando formulário de configuração...');
    
    const supervisorName = document.getElementById('supervisorName');
    const schoolsMultiselect = document.getElementById('schoolsMultiselect');
    
    if (!supervisorName || !schoolsMultiselect) {
        console.error('❌ Elementos do formulário não encontrados');
        return;
    }
    
    if (supervisorConfig && supervisorConfig.name) {
        supervisorName.value = supervisorConfig.name;
    }
    
    schoolsMultiselect.innerHTML = '';
    
    if (APP_DATA.dropdowns && APP_DATA.dropdowns.escolas) {
        APP_DATA.dropdowns.escolas.forEach((escola, index) => {
            const isSelected = supervisorConfig && 
                              supervisorConfig.schools && 
                              supervisorConfig.schools.includes(escola);
            
            const option = document.createElement('div');
            option.className = `multiselect-option ${isSelected ? 'selected' : ''}`;
            option.dataset.value = escola;
            
            option.innerHTML = `
                <div class="check-icon">
                    <i class="fas fa-check"></i>
                </div>
                <span class="option-text">${escola}</span>
            `;
            
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
                atualizarContadorSelecionadas();
            });
            
            schoolsMultiselect.appendChild(option);
        });
        
        console.log(`✅ ${APP_DATA.dropdowns.escolas.length} escolas carregadas no multiselect`);
        
        configurarBuscaEscolas();
        atualizarContadorSelecionadas();
    }
}

function configurarBuscaEscolas() {
    const searchInput = document.getElementById('schoolSearch');
    const options = document.querySelectorAll('.multiselect-option');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            options.forEach(option => {
                const text = option.querySelector('.option-text').textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    option.classList.remove('hidden');
                } else {
                    option.classList.add('hidden');
                }
            });
            
            atualizarContadorSelecionadas();
        });
    }
}

function atualizarContadorSelecionadas() {
    const selectedCount = document.getElementById('selectedCount');
    const visibleOptions = document.querySelectorAll('.multiselect-option:not(.hidden)');
    const selectedOptions = document.querySelectorAll('.multiselect-option.selected:not(.hidden)');
    
    if (selectedCount) {
        selectedCount.textContent = `${selectedOptions.length} de ${visibleOptions.length} selecionadas`;
    }
}

// Configuração do supervisor
async function handleSupervisorConfig(e) {
    e.preventDefault();
    
    const supervisorName = document.getElementById('supervisorName').value.trim();
    const selectedOptions = document.querySelectorAll('.multiselect-option.selected');
    const selectedSchools = Array.from(selectedOptions).map(option => option.dataset.value);
    
    if (!supervisorName || selectedSchools.length === 0) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    
    const config = {
        name: supervisorName,
        schools: selectedSchools
    };
    
    try {
        if (typeof saveSupervisorConfig !== 'undefined') {
            await saveSupervisorConfig(config);
        } else {
            // Fallback - salvar no localStorage
            localStorage.setItem('supervisorConfig', JSON.stringify(config));
        }
        
        supervisorConfig = config;
        alert('✅ Configuração salva com sucesso!');
        mostrarTela('mainScreen');
    } catch (error) {
        alert('❌ Erro ao salvar configuração: ' + error.message);
    }
}

function selectAllSchools() {
    const options = document.querySelectorAll('.multiselect-option:not(.hidden)');
    options.forEach(option => {
        option.classList.add('selected');
    });
    atualizarContadorSelecionadas();
}

function deselectAllSchools() {
    const options = document.querySelectorAll('.multiselect-option:not(.hidden)');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    atualizarContadorSelecionadas();
}

// ================================
// FUNÇÕES DE FORMULÁRIO
// ================================

function criarFormularioDocumento(documentId) {
    const documento = APP_DATA.documentTypes.find(doc => doc.id === documentId);
    if (!documento) return;
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.textContent = `Preencha os dados - ${documento.name}`;
    }
    
    const form = document.getElementById('documentForm');
    if (!form) return;
    
    form.innerHTML = '';
    
    documento.fields.forEach((field, index) => {
        const fieldElement = criarCampoFormulario(field, index, documentId);
        if (fieldElement) {
            form.appendChild(fieldElement);
        }
    });
    
    const generateBtn = document.getElementById('generateButton');
    if (generateBtn) {
        generateBtn.onclick = function() {
            const formData = coletarDadosFormulario();
            if (formData) {
                gerarDocumentoCompleto(documentId, formData);
            }
        };
        generateBtn.disabled = true;
    }
    
    const backBtn = document.getElementById('backButton');
    if (backBtn) {
        backBtn.onclick = function() {
            mostrarTela('mainScreen');
        };
    }
    
    mostrarTela('formScreen');
    
    setTimeout(validarFormulario, 100);
}

function criarCampoFormulario(field, index, documentId) {
    const div = document.createElement('div');
    div.className = 'form-group';
    
    const label = document.createElement('label');
    label.htmlFor = `field-${index}`;
    label.textContent = field.name + (field.required ? ' *' : '');
    
    let input;
    
    switch (field.type) {
        case 'dropdown':
            input = document.createElement('select');
            input.className = 'form-field';
            input.id = `field-${index}`;
            input.required = field.required;
            
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Selecione...';
            input.appendChild(emptyOption);
            
            let options = [];
            if (field.name === 'Nome da Escola') {
                options = supervisorConfig?.schools || APP_DATA.dropdowns.escolas;
                
                input.addEventListener('change', function() {
                    preencherCamposAutomaticos(this.value);
                });
            } else if (field.name === 'Motivo da contratação') {
                options = APP_DATA.dropdowns.motivo_contratacao;
            } else if (field.name === 'Oferta') {
                options = APP_DATA.dropdowns.oferta;
            } else if (field.name === 'Série') {
                options = APP_DATA.dropdowns.serie;
                
                input.addEventListener('change', function() {
                    preencherEtapaEnsino(this.value);
                });
            }
            
            options.forEach(option => {
                const optElement = document.createElement('option');
                optElement.value = option;
                optElement.textContent = option;
                input.appendChild(optElement);
            });
            break;
            
        case 'textarea':
            input = document.createElement('textarea');
            input.className = 'form-field';
            input.id = `field-${index}`;
            input.rows = 4;
            input.required = field.required;
            break;
            
        case 'date':
            input = document.createElement('input');
            input.type = 'date';
            input.className = 'form-field';
            input.id = `field-${index}`;
            input.required = field.required;
            
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            
            input.value = `${ano}-${mes}-${dia}`;
            console.log('📅 Campo data criado com valor:', input.value);
            
            break;
            
        default:
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-field';
            input.id = `field-${index}`;
            input.required = field.required;
            
            if (field.name === 'Nome do Supervisor' && supervisorConfig?.name) {
                input.value = supervisorConfig.name;
            } else if (field.name === 'Número do Ofício' && documentId === 'cuidador') {
                input.value = gerarNumeroOfício();
            } else if (field.name === 'Número da Manifestação' && documentId === 'manifestacao') {
                input.value = `MAN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            } else if (field.name === 'Número Edocs' && documentId === 'eletivas') {
                input.value = `EDOCS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            } else if (field.auto === 'municipio') {
                input.placeholder = "Preenchimento automático";
                input.readOnly = true;
                input.style.backgroundColor = '#f8f9fa';
            } else if (field.auto === 'diretor') {
                input.placeholder = "Preenchimento automático";
                input.readOnly = true;
                input.style.backgroundColor = '#f8f9fa';
            }
    }
    
    input.addEventListener('input', validarFormulario);
    
    div.appendChild(label);
    div.appendChild(input);
    
    return div;
}

function validarFormulario() {
    const form = document.getElementById('documentForm');
    const generateBtn = document.getElementById('generateButton');
    const requiredFields = form.querySelectorAll('[required]');
    
    let allValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            allValid = false;
        }
    });
    
    if (generateBtn) {
        generateBtn.disabled = !allValid;
    }
}

function formatarDataFrontend(dataString) {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    console.log('📅 Data recebida para formatação:', dataString);
    
    const [ano, mes, dia] = dataString.split('-').map(num => parseInt(num));
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
        console.log('❌ Data inválida:', dataString);
        return dataString;
    }
    
    const dataFormatada = `${dia} de ${meses[mes - 1]} de ${ano}`;
    
    console.log(`✅ Data formatada: ${dataString} -> ${dataFormatada}`);
    
    return dataFormatada;
}

function coletarDadosFormulario() {
    const form = document.getElementById('documentForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    const data = {};
    
    let hasErrors = false;
    
    inputs.forEach(input => {
        const label = input.closest('.form-group')?.querySelector('label');
        const fieldName = label ? label.textContent.replace(' *', '') : `field_${input.id}`;
        let valor = input.value;
        
        if (input.type === 'date' && valor) {
            valor = formatarDataFrontend(valor);
            console.log(`📅 Data formatada no frontend: ${input.value} -> ${valor}`);
        }
        
        if (input.required && !input.value.trim()) {
            hasErrors = true;
            input.style.borderColor = 'var(--danger)';
        } else {
            input.style.borderColor = '';
            data[fieldName] = valor;
        }
    });
    
    if (hasErrors) {
        alert('❌ Por favor, preencha todos os campos obrigatórios.');
        return null;
    }
    
    return data;
}

function preencherCamposAutomaticos(escolaSelecionada, serieSelecionada = null) {
    console.log('🏫 Preenchendo campos automáticos para:', escolaSelecionada, 'Série:', serieSelecionada);
    
    if (ESCOLAS_DATA_FRONTEND[escolaSelecionada]) {
        const dados = ESCOLAS_DATA_FRONTEND[escolaSelecionada];
        
        const municipioFields = document.querySelectorAll('input, select, textarea');
        municipioFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && label.textContent.includes('Município')) {
                field.value = dados.municipio;
                console.log('✅ Município preenchido:', dados.municipio);
            }
        });
        
        const diretorFields = document.querySelectorAll('input, select, textarea');
        diretorFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && label.textContent.includes('Diretor')) {
                field.value = dados.diretor;
                console.log('✅ Diretor preenchido:', dados.diretor);
            }
        });
    }
    
    if (serieSelecionada) {
        preencherEtapaEnsino(serieSelecionada);
    }
    
    setTimeout(validarFormulario, 100);
}

function preencherEtapaEnsino(serieSelecionada) {
    console.log('📚 Preenchendo etapa de ensino para série:', serieSelecionada);
    
    const etapasEnsino = {
        "1º ano": "Ensino Fundamental - Anos Iniciais",
        "2º ano": "Ensino Fundamental - Anos Iniciais", 
        "3º ano": "Ensino Fundamental - Anos Iniciais",
        "4º ano": "Ensino Fundamental - Anos Iniciais",
        "5º ano": "Ensino Fundamental - Anos Iniciais",
        "6º ano": "Ensino Fundamental - Anos Finais",
        "7º ano": "Ensino Fundamental - Anos Finais",
        "8º ano": "Ensino Fundamental - Anos Finais", 
        "9º ano": "Ensino Fundamental - Anos Finais",
        "1ª série": "Ensino Médio",
        "2ª série": "Ensino Médio",
        "3ª série": "Ensino Médio"
    };
    
    const etapa = etapasEnsino[serieSelecionada];
    
    if (etapa) {
        const etapaFields = document.querySelectorAll('input, select, textarea');
        etapaFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && label.textContent.includes('Etapa de Ensino')) {
                field.value = etapa;
                console.log('✅ Etapa de Ensino preenchida:', etapa);
            }
        });
    }
}

function gerarNumeroOfício() {
    const timestamp = new Date().getTime();
    const numero = timestamp.toString().slice(-6);
    return `OF-${numero}`;
}

async function gerarDocumentoCompleto(documentType, formData) {
  try {
    console.log('📝 Iniciando geração de documento...');
    
    // Mostrar loading
    const loadingModal = document.getElementById('loadingModal');
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingModal) {
      loadingModal.style.display = 'block';
      loadingMessage.textContent = 'Conectando com o servidor...';
    }

    // Preparar dados para envio
    const requestData = {
      action: "createDocument",
      userEmail: currentUser?.email || "demo@educador.edu.es.gov.br",
      documentType: documentType,
      formData: formData,
      userInfo: {
        name: currentUser?.name || "Supervisor Demo",
        schools: supervisorConfig?.schools || []
      }
    };

    console.log('📤 Enviando para Apps Script...');

    // Atualizar mensagem de loading
    if (loadingMessage) {
      loadingMessage.textContent = 'Criando documento no seu Google Drive...';
    }

    // 🎯 URL DO SEU APPS SCRIPT (ATUALIZE COM SUA URL)
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxiEb5WDDdqfAeQX9oZX9-xmwG2FzUdwBGpl5ftl-UgtJUqs97iGBdJcbG0s2_EEuG/exec';
    
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
    
    // Esconder loading
    if (loadingModal) {
      loadingModal.style.display = 'none';
    }

    if (result.success) {
      console.log('🎉 Documentos gerados com sucesso no Drive do usuário!', result);
      mostrarModalComLinks(result, formData["Nome da Escola"], documentType);
    } else {
      throw new Error(result.error || 'Erro ao gerar documentos');
    }

  } catch (error) {
    console.error('💥 Erro crítico:', error);
    
    // Esconder loading em caso de erro
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
      loadingModal.style.display = 'none';
    }
    
    mostrarModalErro(error.message, formData["Nome da Escola"], documentType);
  }
}
// ================================
// FUNÇÕES DO MODAL
// ================================

function configurarEventosModal() {
    const closeModal = document.getElementById('closeModal');
    const newDocument = document.getElementById('newDocument');
    const backToMain = document.getElementById('backToMain');
    const modal = document.getElementById('resultModal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    if (newDocument) {
        newDocument.addEventListener('click', () => {
            modal.classList.remove('show');
            document.getElementById('documentForm').reset();
            validarFormulario();
        });
    }
    
    if (backToMain) {
        backToMain.addEventListener('click', () => {
            modal.classList.remove('show');
            mostrarTela('mainScreen');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

function mostrarModalComLinks(resultado, nomeEscola, documentType) {
    console.log('🎯 Mostrando modal com links...', resultado);
    
    const modal = document.getElementById('resultModal');
    const modalSchool = document.getElementById('modalSchool');
    const modalDocumentType = document.getElementById('modalDocumentType');
    const modalStatus = document.getElementById('modalStatus');
    const resultLinks = document.querySelector('.result-links');
    
    if (!modal || !modalSchool || !modalDocumentType || !modalStatus || !resultLinks) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    modalSchool.textContent = nomeEscola || 'Não informada';
    modalDocumentType.textContent = getDocumentName(documentType);
    modalStatus.textContent = "Processado com sucesso";
    modalStatus.style.color = "var(--success)";
    
    const links = resultado.links || {};
    const fileNames = resultado.fileNames || {};
    
    let linksHTML = '';
    
    linksHTML += `
        <div class="info-message">
            <i class="fas fa-check-circle"></i>
            <p><strong>Documento gerado com sucesso!</strong> Acesse os links abaixo:</p>
        </div>
    `;
    
    if (links.doc && links.doc !== "#") {
        const downloadUrl = links.doc.replace('/edit', '/export?format=docx');
        
        linksHTML += `
            <div class="link-item doc-link highlighted">
                <div class="link-icon">
                    <i class="fas fa-file-word"></i>
                </div>
                <div class="link-info">
                    <strong>${fileNames.doc || 'Documento Word'}</strong>
                    <small>Documento editável para revisão</small>
                </div>
                <div class="link-actions">
                    <a href="${links.doc}" target="_blank" class="btn-link compact view" title="Abrir Documento">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <a href="${downloadUrl}" class="btn-link compact download" download="${fileNames.doc || 'documento'}.docx" title="Baixar DOC">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    if (links.pdf && links.pdf !== "#") {
        const downloadUrl = links.pdf.replace('/view', '?export=download');
        
        linksHTML += `
            <div class="link-item pdf-link">
                <div class="link-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="link-info">
                    <strong>${fileNames.pdf || 'Documento PDF'}</strong>
                    <small>Versão para impressão e compartilhamento</small>
                </div>
                <div class="link-actions">
                    <a href="${links.pdf}" target="_blank" class="btn-link compact view" title="Abrir PDF">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <a href="${downloadUrl}" class="btn-link compact download" download="${fileNames.pdf || 'documento'}.pdf" title="Baixar PDF">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    if (links.folder && links.folder !== "#") {
        linksHTML += `
            <div class="link-item folder-link highlighted">
                <div class="link-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <div class="link-info">
                    <strong>Sua Pasta Pessoal</strong>
                    <small>Onde seus documentos foram salvos</small>
                    <small style="color: #64748b; font-size: 0.8rem; margin-top: 5px;">
                        📁 Acesso direto à sua pasta específica
                    </small>
                </div>
                <div class="link-actions">
                    <a href="${links.folder}" target="_blank" class="btn-link compact view" title="Abrir Minha Pasta">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    if (links.doc === "#" || links.pdf === "#") {
        linksHTML += `
            <div class="info-message">
                <i class="fas fa-info-circle"></i>
                <p><strong>Modo de demonstração</strong> - Firebase não está configurado</p>
            </div>
        `;
    }
    
    linksHTML += `
        <div class="success-message">
            <i class="fas fa-check"></i>
            Processo concluído! Seus documentos estão prontos para uso.
        </div>
    `;
    
    resultLinks.innerHTML = linksHTML;
    modal.classList.add('show');
    
    console.log('✅ Modal mostrado com links');
}

function mostrarModalErro(mensagemErro, nomeEscola, documentType) {
    console.log('❌ Mostrando modal de erro...');
    
    const modal = document.getElementById('resultModal');
    const modalSchool = document.getElementById('modalSchool');
    const modalDocumentType = document.getElementById('modalDocumentType');
    const modalStatus = document.getElementById('modalStatus');
    const resultLinks = document.querySelector('.result-links');
    
    if (!modal || !modalSchool || !modalDocumentType || !modalStatus || !resultLinks) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    modalSchool.textContent = nomeEscola || 'Não informada';
    modalDocumentType.textContent = getDocumentName(documentType);
    modalStatus.textContent = "Erro no processamento";
    modalStatus.style.color = "var(--danger)";
    
    resultLinks.innerHTML = `
        <div class="error-message-modal">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-text">
                <h3>Erro ao Gerar Documento</h3>
                <p>${mensagemErro}</p>
                <div class="error-actions">
                    <button onclick="document.getElementById('resultModal').classList.remove('show');" class="btn-back">
                        <i class="fas fa-arrow-left"></i>
                        Voltar ao Formulário
                    </button>
                    <button onclick="mostrarTela('mainScreen'); document.getElementById('resultModal').classList.remove('show');" class="btn-primary">
                        <i class="fas fa-home"></i>
                        Tela Principal
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function getDocumentName(documentType) {
    const nomes = {
        "justificativa": "Justificativa",
        "cuidador": "Cuidador", 
        "eletivas": "Eletivas",
        "manifestacao": "Manifestação",
        "parecer": "Parecer",
        "projeto": "Projeto",
        "regularizacao_aee": "Regularização AEE",
        "viagem_pedagogica": "Viagem Pedagógica"
    };
    return nomes[documentType] || "Documento";
}

// ================================
// FUNÇÕES GLOBAIS
// ================================

window.selectAllSchools = selectAllSchools;
window.deselectAllSchools = deselectAllSchools;
window.selecionarDocumento = selecionarDocumento;
window.mostrarTela = mostrarTela;
window.fazerLogout = fazerLogout;

// Função de debug
function debugLogin() {
    console.log('🔍 DEBUG LOGIN:');
    console.log('- currentUser:', currentUser);
    console.log('- localStorage:', localStorage.getItem('supervisionUser'));
    console.log('- supervisorConfig:', supervisorConfig);
    console.log('- Telas ativas:', document.querySelectorAll('.screen.active'));
}

window.debugLogin = debugLogin;

console.log('🎯 SISTEMA CARREGADO - VERSÃO FIREBASE!');



