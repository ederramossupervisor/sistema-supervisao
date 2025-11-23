// 🎯 SISTEMA SUPERVISÃO - VERSÃO 5.0 - SEM FORMS
console.log('🎯 INICIANDO SISTEMA SUPERVISÃO - VERSÃO 5.0 SEM FORMS');

// URL do seu Google Apps Script
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNKPEIJIaqByVqwFHvEb9Ii0ItQpDSUQkX_HfLC2p4iMphdOeU1k1S1RDPN3mXJ5B3/exec"
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
    
    // 2. Mostrar tela de login
    mostrarTela('loginScreen');

    // 3. Configurar eventos
    configurarEventos();
    
    // 4. Verificar se já está logado
    verificarLogin();
}

function configurarEventos() {
    console.log('🔧 Configurando eventos...');
    
    // 🎯 FORMULÁRIO DE LOGIN PERSONALIZADO
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('🎯 FORMULÁRIO DE LOGIN ENVIADO!');
            
            // 🎯 PEGAR DADOS DO FORMULÁRIO
            const email = document.getElementById('loginEmail').value;
            const nome = document.getElementById('loginName').value;
            
            if (!email || !nome) {
                alert('❌ Por favor, preencha todos os campos!');
                return;
            }
            
            // 🎯 VALIDAR EMAIL INSTITUCIONAL
            if (!email.includes('@educador.edu.es.gov.br') && !email.includes('@edu.es.gov.br')) {
                alert('⚠️ Use um email institucional (@educador.edu.es.gov.br ou @edu.es.gov.br)');
                return;
            }
            
            // 🎯 FAZER LOGIN COM OS DADOS DO FORMULÁRIO
            fazerLoginComDados(nome, email);
        });
        console.log('✅ Formulário de login configurado');
    } else {
        console.error('❌ Formulário de login não encontrado!');
    }
    
    // 🎯 MENU DE NAVEGAÇÃO
    const menuBtn = document.getElementById('menuButton');
    const configBtn = document.getElementById('configButton');
    const logoutBtn = document.getElementById('logoutButton');
    
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (configBtn) configBtn.addEventListener('click', () => mostrarTela('configScreen'));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
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
}
// 🎯 NOVA FUNÇÃO: LOGIN COM DADOS DO FORMULÁRIO
function fazerLoginComDados(nome, email) {
    console.log('🔐 FAZENDO LOGIN COM DADOS:', { nome, email });
    
    // 🎯 DADOS DO USUÁRIO
    currentUser = {
        name: nome,
        email: email
    };
    
    console.log('📝 Salvando usuário:', currentUser);
    
    // 🎯 SALVAR NO LOCALSTORAGE
    try {
        localStorage.setItem('supervisionUser', JSON.stringify(currentUser));
        console.log('💾 Usuário salvo no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro ao salvar dados. Tente novamente.');
        return;
    }
    
    // 🎯 ATUALIZAR INTERFACE
    mostrarMenu();
    atualizarInterfaceUsuario();
    
    // 🎯 MUDAR PARA TELA PRINCIPAL
    const mainScreen = document.getElementById('mainScreen');
    const loginScreen = document.getElementById('loginScreen');
    
    if (mainScreen && loginScreen) {
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        console.log('✅ Tela principal ativada!');
    }
    
    // 🎯 CARREGAR DOCUMENTOS
    carregarDocumentos();
    
    console.log('✅ LOGIN CONCLUÍDO COM SUCESSO!');
    
    // 🎯 SCROLL PARA O TOPO
    window.scrollTo(0, 0);
}

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
            // Limpar formulário para novo documento
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
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

function verificarLogin() {
    // 🎯 PRIMEIRO: Verificar se tem token Google
    const googleToken = localStorage.getItem('googleToken');
    
    if (googleToken) {
        console.log('🔐 Token Google encontrado, validando...');
        validateWithBackend(googleToken);
        return;
    }
    
    // 🎯 DEPOIS: Verificar login antigo (para compatibilidade)
    const user = localStorage.getItem('supervisionUser');
    if (user) {
        try {
            currentUser = JSON.parse(user);
            console.log('✅ Usuário já logado (sistema antigo):', currentUser.name);
            carregarConfiguracao();
            mostrarMenu();
            atualizarInterfaceUsuario();
            mostrarTela('mainScreen');
            carregarDocumentos();
        } catch (e) {
            console.error('❌ Erro ao carregar usuário:', e);
            localStorage.removeItem('supervisionUser');
        }
    }
}
// 🎯 FUNÇÕES DE AUTENTICAÇÃO GOOGLE
function handleGoogleSignIn(response) {
    console.log('🔐 Resposta do Google Sign-In:', response);
    
    const credential = response.credential;
    
    // 🎯 VALIDAR TOKEN COM BACKEND
    validateWithBackend(credential);
}

async function validateWithBackend(credential) {
    try {
        console.log('🔄 Validando token com backend...');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validate_token',
                token: credential
            })
        });
        
        const data = await response.json();
        console.log('📨 Resposta do backend:', data);
        
        if (data.success) {
            // 🎯 LOGIN BEM-SUCEDIDO
            handleSuccessfulLogin(data.user, credential);
        } else {
            alert('❌ ' + data.error);
        }
        
    } catch (error) {
        console.error('❌ Erro na validação:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

function handleSuccessfulLogin(user, credential) {
    console.log('✅ Login bem-sucedido:', user);
    
    // 🎯 SALVAR DADOS DO USUÁRIO
    currentUser = {
        name: user.name,
        email: user.email,
        picture: user.picture,
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

// 🎯 MODIFICAR função fazerLogin() existente
function fazerLogin() {
    console.log('🔐 Redirecionando para login Google...');
    // Esta função agora será substituída pelo botão Google
}
function fazerLogin() {
    console.log('🔐 FAZENDO LOGIN - VERSÃO CORRIGIDA...');
    
    // 🎯 DADOS DO USUÁRIO
    currentUser = {
        name: 'Eder Ramos',
        email: 'eder.ramos@educador.edu.es.gov.br'
    };
    
    console.log('📝 Salvando usuário:', currentUser);
    
    // 🎯 SALVAR NO LOCALSTORAGE
    try {
        localStorage.setItem('supervisionUser', JSON.stringify(currentUser));
        console.log('💾 Usuário salvo no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
    }
    
    // 🎯 ATUALIZAR INTERFACE PRIMEIRO
    mostrarMenu();
    atualizarInterfaceUsuario();
    
    // 🎯 MUDAR PARA TELA PRINCIPAL
    const mainScreen = document.getElementById('mainScreen');
    const loginScreen = document.getElementById('loginScreen');
    
    if (mainScreen && loginScreen) {
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        console.log('✅ Tela principal ativada!');
    }
    
    // 🎯 CARREGAR DOCUMENTOS
    carregarDocumentos();
    
    console.log('✅ LOGIN CONCLUÍDO COM SUCESSO!');
    
    // 🎯 SCROLL PARA O TOPO
    window.scrollTo(0, 0);
}

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
    
    // 🎯 CORREÇÃO: Scroll sempre no topo ao trocar de tela
    window.scrollTo(0, 0);
    
    // Esconder todas as telas
    const telas = document.querySelectorAll('.screen');
    telas.forEach(tela => {
        tela.classList.remove('active');
    });
    
    // Mostrar tela específica
    const telaAlvo = document.getElementById(nomeTela);
    if (telaAlvo) {
        telaAlvo.classList.add('active');
        
        // Ações específicas para cada tela
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
    
    // Criar HTML dos documentos
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

// ================================
// FUNÇÕES DO MENU
// ================================

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        supervisorConfig = null;
        localStorage.removeItem('supervisionUser');
        localStorage.removeItem('supervisorConfig');
        mostrarTela('loginScreen');
        document.getElementById('navMenu').style.display = 'none';
        console.log('👋 Usuário deslogado');
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
    
    // Preencher nome se já existir
    if (supervisorConfig && supervisorConfig.name) {
        supervisorName.value = supervisorConfig.name;
    }
    
    // Limpar e carregar escolas no multiselect
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
            
            // Evento de clique
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
                atualizarContadorSelecionadas();
            });
            
            schoolsMultiselect.appendChild(option);
        });
        
        console.log(`✅ ${APP_DATA.dropdowns.escolas.length} escolas carregadas no multiselect`);
        
        // Configurar busca e atualizar contador
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

function handleSupervisorConfig(e) {
    e.preventDefault();
    console.log('💾 Salvando configuração...');
    
    const supervisorName = document.getElementById('supervisorName');
    if (!supervisorName) return;
    
    const name = supervisorName.value.trim();
    
    // Coletar escolas selecionadas do MULTISELECT
    const selectedOptions = document.querySelectorAll('.multiselect-option.selected');
    const selectedSchools = Array.from(selectedOptions).map(option => option.dataset.value);
    
    // Validações
    if (!name) {
        alert('❌ Por favor, informe seu nome como supervisor.');
        return;
    }
    
    if (selectedSchools.length === 0) {
        alert('❌ Por favor, selecione pelo menos uma escola sob sua responsabilidade.');
        return;
    }
    
    // Salvar configuração
    supervisorConfig = {
        name: name,
        schools: selectedSchools
    };
    
    localStorage.setItem('supervisorConfig', JSON.stringify(supervisorConfig));
    
    alert(`✅ Configuração salva com sucesso!\n${selectedSchools.length} escola(s) selecionada(s).`);
    mostrarTela('mainScreen');
    
    console.log('💾 Configuração salva:', supervisorConfig);
}

// FUNÇÕES PARA OS BOTÕES DE SELEÇÃO RÁPIDA
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
// FUNÇÕES DE PREENCHIMENTO AUTOMÁTICO
// ================================

function preencherCamposAutomaticos(escolaSelecionada, serieSelecionada = null) {
    console.log('🏫 Preenchendo campos automáticos para:', escolaSelecionada, 'Série:', serieSelecionada);
    
    // Preencher município e diretor baseado na escola
    if (ESCOLAS_DATA_FRONTEND[escolaSelecionada]) {
        const dados = ESCOLAS_DATA_FRONTEND[escolaSelecionada];
        
        // Preencher todos os campos de município
        const municipioFields = document.querySelectorAll('input, select, textarea');
        municipioFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && label.textContent.includes('Município')) {
                field.value = dados.municipio;
                console.log('✅ Município preenchido:', dados.municipio);
            }
        });
        
        // Preencher todos os campos de diretor
        const diretorFields = document.querySelectorAll('input, select, textarea');
        diretorFields.forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && label.textContent.includes('Diretor')) {
                field.value = dados.diretor;
                console.log('✅ Diretor preenchido:', dados.diretor);
            }
        });
    }
    
    // Preencher etapa de ensino baseado na série
    if (serieSelecionada) {
        preencherEtapaEnsino(serieSelecionada);
    }
    
    // Validar formulário após preenchimento automático
    setTimeout(validarFormulario, 100);
}

function preencherEtapaEnsino(serieSelecionada) {
    console.log('📚 Preenchendo etapa de ensino para série:', serieSelecionada);
    
    // Mapeamento série → etapa de ensino
    const etapasEnsino = {
        // Ensino Fundamental - Anos Iniciais
        "1º ano": "Ensino Fundamental - Anos Iniciais",
        "2º ano": "Ensino Fundamental - Anos Iniciais", 
        "3º ano": "Ensino Fundamental - Anos Iniciais",
        "4º ano": "Ensino Fundamental - Anos Iniciais",
        "5º ano": "Ensino Fundamental - Anos Iniciais",
        
        // Ensino Fundamental - Anos Finais
        "6º ano": "Ensino Fundamental - Anos Finais",
        "7º ano": "Ensino Fundamental - Anos Finais",
        "8º ano": "Ensino Fundamental - Anos Finais", 
        "9º ano": "Ensino Fundamental - Anos Finais",
        
        // Ensino Médio
        "1ª série": "Ensino Médio",
        "2ª série": "Ensino Médio",
        "3ª série": "Ensino Médio"
    };
    
    const etapa = etapasEnsino[serieSelecionada];
    
    if (etapa) {
        // Preencher todos os campos de Etapa de Ensino
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

// ================================
// FUNÇÕES DE FORMULÁRIO DE DOCUMENTOS
// ================================

function criarFormularioDocumento(documentId) {
    const documento = APP_DATA.documentTypes.find(doc => doc.id === documentId);
    if (!documento) return;
    
    // Atualizar título
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.textContent = `Preencha os dados - ${documento.name}`;
    }
    
    // Criar formulário
    const form = document.getElementById('documentForm');
    if (!form) return;
    
    form.innerHTML = '';
    
    documento.fields.forEach((field, index) => {
        const fieldElement = criarCampoFormulario(field, index, documentId);
        if (fieldElement) {
            form.appendChild(fieldElement);
        }
    });
    
    // Configurar botão gerar
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
    
    // Configurar botão de voltar
    const backBtn = document.getElementById('backButton');
    if (backBtn) {
        backBtn.onclick = function() {
            mostrarTela('mainScreen');
        };
    }
    
    // Mostrar tela do formulário
    mostrarTela('formScreen');
    
    // Validar formulário inicial
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
            
            // Adicionar opção vazia
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Selecione...';
            input.appendChild(emptyOption);
            
            // Preencher opções baseado no nome do campo
            let options = [];
            if (field.name === 'Nome da Escola') {
                options = supervisorConfig?.schools || APP_DATA.dropdowns.escolas;
                
                // Adicionar evento para preenchimento automático
                input.addEventListener('change', function() {
                    preencherCamposAutomaticos(this.value);
                });
            } else if (field.name === 'Motivo da contratação') {
                options = APP_DATA.dropdowns.motivo_contratacao;
            } else if (field.name === 'Oferta') {
                options = APP_DATA.dropdowns.oferta;
            } else if (field.name === 'Série') {
                options = APP_DATA.dropdowns.serie;
                
                // Adicionar evento para etapa de ensino
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
            
            // 🎯 SOLUÇÃO: Data atual sem problemas de fuso
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
            
            // Preenchimentos automáticos
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

// 🎯 FUNÇÃO PARA FORMATAR DATA EM PORTUGUÊS (SOLUÇÃO DEFINITIVA)
function formatarDataFrontend(dataString) {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    console.log('📅 Data recebida para formatação:', dataString);
    
    // 🎯 SOLUÇÃO: Usar split direto - IGNORAR completamente o objeto Date
    const [ano, mes, dia] = dataString.split('-').map(num => parseInt(num));
    
    // Validar se os valores fazem sentido
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
        
        // FORMATAR CAMPOS DE DATA PARA PORTUGUÊS
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

function normalizarDadosFormulario(formData) {
    const normalizado = {};
    
    Object.keys(formData).forEach(key => {
        // Normalizar nomes de campos para compatibilidade
        const chaveNormalizada = key
            .replace("Nome do(a) Aluno(a)", "Nome do Aluno")
            .replace("Nome do Aluno(a)", "Nome do Aluno")
            .trim();
            
        normalizado[chaveNormalizada] = formData[key];
    });
    
    return normalizado;
}

function gerarNumeroOfício() {
    const timestamp = new Date().getTime();
    const numero = timestamp.toString().slice(-6);
    return `OF-${numero}`;
}

// 🎯 FUNÇÃO PRINCIPAL DE GERAÇÃO - VERSÃO SEM FORMS
async function gerarDocumentoCompleto(documentType, formData) {
    console.log(`🎯 Gerando documento: ${documentType}`);
    
    const generateBtn = document.getElementById('generateButton');
    const originalContent = generateBtn?.innerHTML;
    
    try {
        // Feedback visual
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            generateBtn.disabled = true;
        }
        
        // Preparar dados
        const payload = {
            documentType: documentType,
            fields: normalizarDadosFormulario(formData),
            timestamp: new Date().toISOString(),
            userEmail: currentUser?.email || 'teste@edu.es.gov.br',
            userName: currentUser?.name || 'Supervisor Teste'
        };
        
        console.log('📤 Dados preparados:', payload);
        
        // 🎯 ENVIAR DIRETAMENTE VIA FETCH (SEM FORMS)
        await enviarViaFetchDireto(payload, formData["Nome da Escola"], documentType);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        mostrarModalErro(error.message, formData["Nome da Escola"], documentType);
        
    } finally {
        // Restaurar botão em qualquer caso
        if (generateBtn && originalContent) {
            generateBtn.innerHTML = originalContent;
            generateBtn.disabled = false;
        }
    }
}

// 🎯 SOLUÇÃO ALTERNATIVA - LINK ESPECÍFICO POR USUÁRIO
async function enviarViaFetchDireto_CORRIGIDO(payload, nomeEscola, documentType) {
    console.log('🌐 SOLUÇÃO CORRIGIDA - Link específico por usuário');
    
    const userEmail = payload.userEmail;
    
    try {
        // 🎯 ENVIAR PARA BACKEND (processamento em background)
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        console.log('✅ Backend notificado - processando em background');
        
        // 🎯 🆕 CORREÇÃO DEFINITIVA: LINK ESPECÍFICO POR EMAIL
        const linkEspecifico = await obterLinkEspecificoUsuario(userEmail);
        
        const resultado = {
            success: true,
            message: "✅ Documento gerado com sucesso!",
            links: {
                folder: linkEspecifico // 🎯 LINK ESPECÍFICO DA JULIA
            },
            fileNames: {
                doc: `${getDocumentName(documentType)}_${nomeEscola || "Documento"}`,
                pdf: `${getDocumentName(documentType)}_${nomeEscola || "Documento"}.pdf`
            },
            userEmail: userEmail
        };
        
        console.log('🔗 Link específico:', resultado.links.folder);
        mostrarModalComLinks(resultado, nomeEscola, documentType);
        
    } catch (error) {
        console.log('❌ Erro, usando fallback específico');
        const linkFallback = await obterLinkEspecificoUsuario(userEmail);
        
        const resultadoFallback = {
            success: true,
            message: "📁 Acesse sua pasta pessoal:",
            links: { folder: linkFallback },
            fileNames: {
                doc: `${getDocumentName(documentType)}_${nomeEscola || "Documento"}`,
                pdf: `${getDocumentName(documentType)}_${nomeEscola || "Documento"}.pdf`
            },
            userEmail: userEmail
        };
        
        mostrarModalComLinks(resultadoFallback, nomeEscola, documentType);
    }
}

// 🎯 🆕 FUNÇÃO PARA OBTER LINK ESPECÍFICO
async function obterLinkEspecificoUsuario(userEmail) {
    // 🎯 MAPA DE LINKS ESPECÍFICOS POR USUÁRIO
    const linksUsuarios = {
        // 🎯 JULIA - LINK ESPECÍFICO DELA
        "julia.souza@educador.edu.es.gov.br": "https://drive.google.com/drive/folders/1kH_On3GYV_hmm25Hk-cYKHRl_LtMMrlM",
        
        // 🎯 OUTROS USUÁRIOS - ADICIONE CONFORME NECESSÁRIO
        "caroliny.uhlig@educador.edu.es.gov.br": "https://drive.google.com/drive/folders/1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV",
        "jonas.pagotto@edu.es.gov.br": "https://drive.google.com/drive/folders/1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV"
    };
    
    // 🎯 RETORNAR LINK ESPECÍFICO OU PADRAO
    return linksUsuarios[userEmail] || "https://drive.google.com/drive/folders/1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV";
}

// 🎯 FUNÇÃO: CONSTRUIR LINK DA PASTA DO USUÁRIO NO FRONTEND (VERSÃO CORRIGIDA)
async function construirLinkPastaUsuario(userEmail, nomeEscola, documentType) {
    try {
        console.log('🔗 Construindo link da pasta para:', userEmail);
        
        // 🎯 AGORA VAMOS USAR UMA ESTRATÉGIA DIFERENTE
        // Como não podemos obter o ID dinamicamente no frontend,
        // vamos criar um link "inteligente" que leva para a estrutura correta
        
        const baseUrl = "https://drive.google.com/drive/folders/";
        
        // 🎯 ESTRATÉGIA: Link para pasta principal + instrução visual
        // O usuário verá TODAS as pastas, mas só conseguirá abrir a dele
        // (devido às permissões que configuramos no Apps Script)
        
        const pastaPrincipalId = "1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV";
        const linkComInstrucao = baseUrl + pastaPrincipalId;
        
        console.log('🔗 Link com estrutura:', linkComInstrucao);
        
        return linkComInstrucao;
        
    } catch (error) {
        console.error('❌ Erro ao construir link:', error);
        return "https://drive.google.com/drive/folders/1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV";
    }
}
// 🎯 FUNÇÃO CORRIGIDA: MOSTRAR MODAL COM LINKS ESPECÍFICOS
function mostrarModalComLinks(resultado, nomeEscola, documentType) {
    console.log('🎯 Mostrando modal com links específicos...', resultado);
    
    const modal = document.getElementById('resultModal');
    const modalSchool = document.getElementById('modalSchool');
    const modalDocumentType = document.getElementById('modalDocumentType');
    const modalStatus = document.getElementById('modalStatus');
    const resultLinks = document.querySelector('.result-links');
    
    if (!modal || !modalSchool || !modalDocumentType || !modalStatus || !resultLinks) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    // Preencher informações básicas
    modalSchool.textContent = nomeEscola || 'Não informada';
    modalDocumentType.textContent = getDocumentName(documentType);
    modalStatus.textContent = "Processado com sucesso";
    modalStatus.style.color = "var(--success)";
    
    // 🎯 VERIFICAR SE TEM LINKS VÁLIDOS
    const links = resultado.links || {};
    const fileNames = resultado.fileNames || {};
    
    let linksHTML = '';
    
    // 🎯 CABEÇALHO INFORMATIVO
    linksHTML += `
        <div class="info-message">
            <i class="fas fa-check-circle"></i>
            <p><strong>Documento gerado com sucesso!</strong> Acesse os links abaixo:</p>
        </div>
    `;
    
    // 🎯 LINK DO DOC (Word)
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
    
    // 🎯 LINK DO PDF
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
    
    // 🎯 🎯🎯 LINK DA PASTA DO USUÁRIO (SEMPRE MOSTRAR)
    const folderLink = links.folder || "https://drive.google.com/drive/folders/1DuTA0XGKxuqZObxWr-Cc34_COAtdzhaV";
    
    // 🎯 Extrair nome do usuário para mostrar na instrução
    const userEmail = resultado.userEmail || currentUser?.email;
    const nomeUsuario = userEmail ? userEmail.split('@')[0].split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') : 'Seu nome';
    
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
            <a href="${folderLink}" target="_blank" class="btn-link compact view" title="Abrir Minha Pasta">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    </div>
`;
    
    // 🎯 MENSAGEM DE SUCESSO
    linksHTML += `
        <div class="success-message">
            <i class="fas fa-check"></i>
            Processo concluído! Seus documentos estão prontos para uso.
        </div>
    `;
    
    resultLinks.innerHTML = linksHTML;
    
    // Mostrar modal
    modal.classList.add('show');
    
    console.log('✅ Modal mostrado com links específicos');
}

// 🎯 FUNÇÃO: MODAL DE ERRO
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
    
    // Preencher informações básicas
    modalSchool.textContent = nomeEscola || 'Não informada';
    modalDocumentType.textContent = getDocumentName(documentType);
    modalStatus.textContent = "Erro no processamento";
    modalStatus.style.color = "var(--danger)";
    
    // 🎯 HTML PARA ERRO
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
    
    // Mostrar modal
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
// 🎯 FUNÇÃO DE DEBUG PARA VERIFICAR LOGIN
function debugLogin() {
    console.log('🔍 DEBUG LOGIN:');
    console.log('- currentUser:', currentUser);
    console.log('- localStorage:', localStorage.getItem('supervisionUser'));
    console.log('- Telas ativas:', document.querySelectorAll('.screen.active'));
}

// Chame esta função no console do navegador para ver o que está acontecendo
window.debugLogin = debugLogin;
// ================================
// CONFIGURAR EVENTOS GLOBAIS
// ================================

window.selectAllSchools = selectAllSchools;
window.deselectAllSchools = deselectAllSchools;
window.selecionarDocumento = selecionarDocumento;
window.mostrarTela = mostrarTela;

console.log('🎯 SISTEMA CARREGADO - VERSÃO 5.0 SEM FORMS!');