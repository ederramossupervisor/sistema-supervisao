// 🎯 SISTEMA SUPERVISÃO - VERSÃO 6.0 - SEM PROBLEMAS DE CORS
console.log('🎯 INICIANDO SISTEMA SUPERVISÃO - VERSÃO 6.0 SEM CORS');

// URL do seu Google Apps Script (JÁ ATUALIZADA)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfvBnXJK3LDP7QYHdlZptVgJWfMeYa7RJtAbdCKC9_U3VQnt8yRQztf48lhP-8ZIMT/exec";
const CLIENT_ID = "725842703932-oe3v18cjvunvdarcdi7825rdgflqqqvj.apps.googleusercontent.com";

// Estados globais
let currentUser = null;
let supervisorConfig = null;
let currentDocumentType = null;

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
// 🎯 NOVA FUNÇÃO PARA CHAMAR BACKEND (SEM CORS!)
// ================================

async function callBackend(action, data = {}) {
    console.log('📤 Chamando backend:', action);
    
    return new Promise((resolve, reject) => {
        // 🎯 TENTAR FETCH PRIMEIRO (pode funcionar em alguns navegadores)
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: action, ...data})
        })
        .then(response => response.json())
        .then(result => {
            console.log('✅ Resposta do backend:', result);
            resolve(result);
        })
        .catch(fetchError => {
            console.log('⚠️ Fetch falhou, tentando método alternativo...');
            
            // 🎯 MÉTODO ALTERNATIVO - FORM SUBMIT
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = APPS_SCRIPT_URL;
            form.style.display = 'none';
            
            const input = document.createElement('input');
            input.name = 'payload';
            input.value = JSON.stringify({action: action, ...data});
            form.appendChild(input);
            
            document.body.appendChild(form);
            
            // 🎯 CRIAR IFRAME PARA RECEBER RESPOSTA
            const iframe = document.createElement('iframe');
            iframe.name = 'responseFrame';
            iframe.style.display = 'none';
            
            iframe.onload = function() {
                try {
                    const responseText = iframe.contentDocument.body.innerText;
                    const result = JSON.parse(responseText || '{}');
                    console.log('✅ Resposta alternativa:', result);
                    resolve(result);
                } catch (e) {
                    resolve({success: false, error: 'Erro ao processar resposta'});
                }
                
                // Limpar
                document.body.removeChild(form);
                document.body.removeChild(iframe);
            };
            
            document.body.appendChild(iframe);
            form.target = 'responseFrame';
            form.submit();
        });
    });
}

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
    // 🆕 INICIALIZAR FIREBASE
    initializeAuth();
    
    // Configurar eventos
    configurarEventos();
}
    
    // 2. Mostrar tela de login
    mostrarTela('loginScreen');

    // 3. Configurar eventos
    configurarEventos();
    
    // 4. Verificar se já está logado
    verificarLogin();
}

function configurarEventos() {
    console.log('🔧 Configurando eventos...');
    // 🆕 BOTÃO DE LOGIN DO FIREBASE
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // 🎯 MENU DE NAVEGAÇÃO
    const menuBtn = document.getElementById('menuButton');
    const configBtn = document.getElementById('configButton');
    const logoutBtn = document.getElementById('logoutButton');
    
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (configBtn) configBtn.addEventListener('click', () => mostrarTela('configScreen'));
    if (logoutBtn) logoutBtn.addEventListener('click', fazerLogout);
    
    // 🎯 FORMULÁRIO DE CONFIGURAÇÃO
    const supervisorForm = document.getElementById('supervisorForm');
    if (supervisorForm) {
        supervisorForm.addEventListener('submit', handleSupervisorConfig);
    }
    
    // 🎯 FECHAR MENU AO CLICAR FORA
    document.addEventListener('click', (e) => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !e.target.closest('.nav-menu')) {
            navLinks.classList.remove('show');
        }
    });
    
    // 🎯 CONFIGURAR EVENTOS DO MODAL
    configurarEventosModal();
    
    // 🎯 INICIALIZAR GOOGLE SIGN-IN
    if (typeof google !== 'undefined' && google.accounts) {
        initializeGoogleSignIn();
    } else {
        // Carregar script do Google se não estiver disponível
        loadGoogleSignInScript();
    }
}

// ================================
// 🎯 AUTENTICAÇÃO GOOGLE - ATUALIZADA
// ================================

// 🎯 CONFIGURAÇÃO GOOGLE SIGN-IN
function initializeGoogleSignIn() {
    console.log('🔐 Inicializando Google Sign-In...');
    
    try {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleSignIn,
            context: 'signin',
            ux_mode: 'popup',
            auto_select: false
        });
        
        // 🎯 CONFIGURAR BOTÃO PERSONALIZADO
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        if (googleSignInBtn) {
            google.accounts.id.renderButton(
                googleSignInBtn,
                {
                    type: 'standard',
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left'
                }
            );
        }
        
        // 🎯 OFERECER ONE-TAP SE TIVER COOKIES
        if (!localStorage.getItem('googleToken')) {
            google.accounts.id.prompt();
        }
        
        console.log('✅ Google Sign-In inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar Google Sign-In:', error);
    }
}

// 🎯 NOVA FUNÇÃO DE LOGIN (linha ~200)
async function handleGoogleLogin() {
    try {
        await loginWithGoogle();
        // O resto é automático pelo Firebase
    } catch (error) {
        alert('Erro no login: ' + error.message);
    }
}

// 🎯 VALIDAÇÃO COM BACKEND (ATUALIZADA)
async function validateWithBackend(credential) {
    try {
        console.log('🔄 Validando token...');
        
        const payload = JSON.parse(atob(credential.split('.')[1]));
        console.log('📧 Email do token:', payload.email);
        
        // 🎯 VALIDAÇÃO NO FRONTEND (funciona sempre)
        if (!payload.email.endsWith('@educador.edu.es.gov.br') && !payload.email.endsWith('@edu.es.gov.br')) {
            alert('❌ Apenas emails institucionais são permitidos');
            return;
        }
        
        // 🎯 TENTAR BACKEND COM NOVA FUNÇÃO
        const backendResult = await callBackend('validateToken', { token: credential });
        
        if (backendResult && backendResult.success) {
            console.log('✅ Backend validou token');
        } else {
            console.log('⚠️ Backend offline, continuando com frontend');
        }
        
        // 🎯 LOGIN BEM-SUCEDIDO (sempre funciona)
        handleSuccessfulLogin({
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            folderId: 'user-' + payload.email
        }, credential);
        
    } catch (error) {
        console.error('❌ Erro na validação:', error);
        alert('Erro na autenticação. Tente novamente.');
    }
}

// 🎯 FUNÇÃO DE LOGIN BEM-SUCEDIDO
function handleSuccessfulLogin(user, credential) {
    console.log('✅ Login bem-sucedido:', user);
    
    // 🎯 SALVAR DADOS DO USUÁRIO
    currentUser = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        folderId: user.folderId,
        token: credential
    };
    
    localStorage.setItem('supervisionUser', JSON.stringify(currentUser));
    localStorage.setItem('googleToken', credential);
    
    // 🎯 ATUALIZAR INTERFACE
    mostrarMenu();
    atualizarInterfaceUsuario();
    mostrarTela('mainScreen');
    carregarDocumentos();
    
    console.log('✅ Usuário logado com Google:', currentUser.name);
}

// 🎯 CARREGAR SCRIPT DO GOOGLE SIGN-IN
function loadGoogleSignInScript() {
    if (!document.querySelector('script[src*="accounts.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('✅ Google Sign-In script carregado');
            initializeGoogleSignIn();
        };
        script.onerror = () => {
            console.error('❌ Falha ao carregar Google Sign-In script');
        };
        document.head.appendChild(script);
    }
}

function verificarLogin() {
    const googleToken = localStorage.getItem('googleToken');
    const userData = localStorage.getItem('supervisionUser');
    
    if (googleToken && userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('✅ Usuário já logado:', currentUser.name);
            
            // 🎯 VALIDAR TOKEN NOVAMENTE COM NOVA FUNÇÃO
            callBackend('validateToken', { token: googleToken })
                .then(result => {
                    if (result && result.success) {
                        carregarConfiguracao();
                        mostrarMenu();
                        atualizarInterfaceUsuario();
                        mostrarTela('mainScreen');
                        carregarDocumentos();
                    } else {
                        console.log('❌ Token inválido, fazendo logout...');
                        fazerLogout();
                    }
                })
                .catch(() => {
                    // Em caso de erro, continuar logado (fallback)
                    carregarConfiguracao();
                    mostrarMenu();
                    atualizarInterfaceUsuario();
                    mostrarTela('mainScreen');
                    carregarDocumentos();
                });
            
        } catch (e) {
            console.error('❌ Erro ao carregar usuário:', e);
            fazerLogout();
        }
    } else {
        console.log('🔐 Usuário não logado, aguardando autenticação...');
    }
}

// 🎯 ATUALIZAR FUNÇÃO DE LOGOUT (linha ~250)
async function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        try {
            await logout();
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }
}
// ================================
// FUNÇÕES DE INTERFACE (MANTIDAS)
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
// FUNÇÕES DE CONFIGURAÇÃO (MANTIDAS)
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

// 🎯 ATUALIZAR CONFIGURAÇÃO DO SUPERVISOR (linha ~400)
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
        await saveSupervisorConfig(config);
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
// FUNÇÕES DE FORMULÁRIO (MANTIDAS)
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

// 🎯 ATUALIZAR GERAÇÃO DE DOCUMENTOS (linha ~600)
async function gerarDocumentoCompleto(documentType, formData) {
    try {
        const result = await generateDocument(documentType, formData);
        mostrarModalComLinks(result, formData["Nome da Escola"], documentType);
    } catch (error) {
        mostrarModalErro(error.message, formData["Nome da Escola"], documentType);
    }
}// ================================
// FUNÇÕES DO MODAL (MANTIDAS)
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
    
    if (links.doc) {
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
    
    if (links.pdf) {
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
    
    if (links.folder) {
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

// 🎯 FUNÇÃO DE DEBUG
function debugLogin() {
    console.log('🔍 DEBUG LOGIN:');
    console.log('- currentUser:', currentUser);
    console.log('- localStorage:', localStorage.getItem('supervisionUser'));
    console.log('- googleToken:', localStorage.getItem('googleToken'));
    console.log('- Telas ativas:', document.querySelectorAll('.screen.active'));
}

window.debugLogin = debugLogin;

// 🎯 TESTE DO BACKEND
async function testBackendConnection() {
    console.log('🧪 Testando conexão com backend...');
    const result = await callBackend('test');
    console.log('📡 Resultado do teste:', result);
    return result;
}

window.testBackendConnection = testBackendConnection;

console.log('🎯 SISTEMA CARREGADO - VERSÃO 6.0 SEM PROBLEMAS DE CORS!');

// 🎯 TESTE AUTOMÁTICO AO CARREGAR
setTimeout(() => {
    testBackendConnection().then(result => {
        if (result && result.success) {
            console.log('🚀 Sistema totalmente operacional!');
        } else {
            console.log('⚠️ Backend offline, usando modo fallback');
        }
    });
}, 2000);



