// Sistema de Autenticação e Usuários - CORRIGIDO
let usuarios = {
    pacientes: [],
    medicos: [],
    admin: [
        {
            id: 1,
            email: "admin@agendasaude.com",
            senha: "admin123",
            nome: "Administrador Agenda Saúde",
            tipo: "admin"
        }
    ]
};

// Usuário logado atual
let usuarioLogado = null;

// Inicialização do sistema de autenticação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Inicializando sistema de autenticação...');
    carregarUsuarios();
    
    // Verificar se está na página de login
    if (document.getElementById('loginForm')) {
        console.log('📄 Página de login detectada');
        inicializarLogin();
    }
    
    // Verificar se está no dashboard
    if (document.getElementById('userName')) {
        console.log('📊 Dashboard detectado');
        verificarAutenticacao();
    }
});

function inicializarLogin() {
    console.log('🔄 Inicializando formulário de login...');
    
    // Formulário de login - CORREÇÃO AQUI
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('✅ Formulário de login submetido');
            fazerLogin();
        });
        
        // Também adicionar evento direto no botão para garantir
        const btnLogin = document.querySelector('.btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🖱️ Botão de login clicado');
                fazerLogin();
            });
        }
    } else {
        console.error('❌ Formulário de login não encontrado!');
    }
    
    // Botão de cadastro
    const btnCadastro = document.getElementById('btnCadastro');
    if (btnCadastro) {
        btnCadastro.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📝 Abrindo modal de cadastro');
            abrirModalCadastro();
        });
    }
    
    // Formulário de cadastro
    const formCadastro = document.getElementById('formCadastroPaciente');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('✅ Formulário de cadastro submetido');
            cadastrarPaciente();
        });
    }
}

function fazerLogin() {
    console.log('🔑 Iniciando processo de login...');
    
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    const tipoUsuario = document.getElementById('loginTipoUsuario').value;
    
    console.log('📧 Dados de login:', { email, tipoUsuario });
    
    if (!email || !senha || !tipoUsuario) {
        alert('⚠️ Por favor, preencha todos os campos.');
        return;
    }
    
    let usuario = null;
    
    // Buscar usuário baseado no tipo
    switch(tipoUsuario) {
        case 'paciente':
            usuario = usuarios.pacientes.find(p => p.email === email && p.senha === senha);
            break;
        case 'medico':
            usuario = usuarios.medicos.find(m => m.email === email && m.senha === senha);
            break;
        case 'admin':
            usuario = usuarios.admin.find(a => a.email === email && a.senha === senha);
            break;
    }
    
    if (usuario) {
        console.log('✅ Usuário encontrado:', usuario.nome);
        usuarioLogado = usuario;
        salvarSessao();
        
        // Feedback visual
        const btnLogin = document.querySelector('.btn-login');
        if (btnLogin) {
            btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            btnLogin.disabled = true;
        }
        
        // Redirecionar para o dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } else {
        console.log('❌ Usuário não encontrado ou senha incorreta');
        alert('❌ E-mail ou senha incorretos. Tente novamente.');
        
        // Feedback visual de erro
        const btnLogin = document.querySelector('.btn-login');
        if (btnLogin) {
            btnLogin.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Tente Novamente';
            btnLogin.style.background = 'var(--error)';
            setTimeout(() => {
                btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Sistema';
                btnLogin.style.background = '';
            }, 2000);
        }
    }
}

function cadastrarPaciente() {
    console.log('👤 Iniciando cadastro de paciente...');
    
    const nome = document.getElementById('cadNome').value.trim();
    const cpf = document.getElementById('cadCpf').value.replace(/\D/g, '');
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const telefone = document.getElementById('cadTelefone').value.trim();
    const dataNascimento = document.getElementById('cadDataNascimento').value;
    const senha = document.getElementById('cadSenha').value;
    const confirmarSenha = document.getElementById('cadConfirmarSenha').value;
    
    console.log('📝 Dados do cadastro:', { nome, email, cpf });
    
    // Validações
    if (!nome || !cpf || !email || !telefone || !dataNascimento || !senha || !confirmarSenha) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (nome.length < 3) {
        alert('❌ O nome deve ter pelo menos 3 caracteres.');
        return;
    }
    
    if (cpf.length !== 11) {
        alert('❌ CPF deve ter 11 dígitos.');
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert('❌ As senhas não coincidem.');
        return;
    }
    
    if (senha.length < 6) {
        alert('❌ A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Por favor, insira um e-mail válido.');
        return;
    }
    
    // Verificar se email já existe
    if (usuarios.pacientes.find(p => p.email === email)) {
        alert('❌ Já existe um paciente cadastrado com este e-mail.');
        return;
    }
    
    if (usuarios.pacientes.find(p => p.cpf === cpf)) {
        alert('❌ Já existe um paciente cadastrado com este CPF.');
        return;
    }
    
    // Validar data de nascimento
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (idade < 0 || idade > 120) {
        alert('❌ Por favor, insira uma data de nascimento válida.');
        return;
    }
    
    const novoPaciente = {
        id: Date.now(),
        nome,
        cpf,
        email,
        telefone,
        dataNascimento,
        senha,
        tipo: 'paciente',
        dataCadastro: new Date().toISOString()
    };
    
    usuarios.pacientes.push(novoPaciente);
    salvarUsuarios();
    
    alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
    fecharModalCadastro();
    
    // Preencher automaticamente o login
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginTipoUsuario').value = 'paciente';
    document.getElementById('loginSenha').focus();
}

function abrirModalCadastro() {
    console.log('📋 Abrindo modal de cadastro...');
    
    const modal = document.getElementById('modalCadastro');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focar no primeiro campo
        setTimeout(() => {
            const primeiroCampo = document.getElementById('cadNome');
            if (primeiroCampo) {
                primeiroCampo.focus();
            }
        }, 300);
    } else {
        console.error('❌ Modal de cadastro não encontrado!');
    }
}

function fecharModalCadastro() {
    console.log('❌ Fechando modal de cadastro...');
    
    const modal = document.getElementById('modalCadastro');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    const formCadastro = document.getElementById('formCadastroPaciente');
    if (formCadastro) {
        formCadastro.reset();
    }
}

// Fechar modal ao clicar fora ou ESC
document.addEventListener('DOMContentLoaded', function() {
    // Fechar modal ao clicar no backdrop
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('modalCadastro');
        if (modal && modal.classList.contains('active') && e.target === modal) {
            fecharModalCadastro();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('modalCadastro');
        if (modal && modal.classList.contains('active') && e.key === 'Escape') {
            fecharModalCadastro();
        }
    });
});

function verificarAutenticacao() {
    console.log('🔍 Verificando autenticação...');
    
    const sessao = localStorage.getItem('agendasaude_sessao');
    
    if (!sessao) {
        console.log('🚫 Nenhuma sessão encontrada, redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        usuarioLogado = JSON.parse(sessao);
        console.log('✅ Usuário logado:', usuarioLogado.nome);
        inicializarDashboard();
    } catch (error) {
        console.error('❌ Erro ao carregar sessão:', error);
        window.location.href = 'index.html';
    }
}

function inicializarDashboard() {
    if (!usuarioLogado) {
        console.error('🚫 Usuário não está logado!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('🚀 Inicializando dashboard para:', usuarioLogado.nome);
    
    // Atualizar interface baseada no tipo de usuário
    document.getElementById('userName').textContent = usuarioLogado.nome;
    
    // Configurar menu de navegação
    configurarMenu();
    
    // Configurar ações específicas
    configurarAcoesUsuario();
    
    // Carregar dados iniciais
    carregarDadosDashboard();
}

function configurarMenu() {
    const navList = document.getElementById('navList');
    if (!navList) {
        console.error('❌ Elemento navList não encontrado!');
        return;
    }
    
    navList.innerHTML = '';
    
    const itensMenu = [];
    
    switch(usuarioLogado.tipo) {
        case 'paciente':
            itensMenu.push(
                { id: 'inicio', texto: 'Início', icon: 'home' },
                { id: 'agendar', texto: 'Agendar Consulta', icon: 'calendar-plus' },
                { id: 'historico', texto: 'Meu Histórico', icon: 'history' }
            );
            break;
            
        case 'medico':
            itensMenu.push(
                { id: 'inicio', texto: 'Início', icon: 'home' },
                { id: 'agenda', texto: 'Minha Agenda', icon: 'calendar-alt' },
                { id: 'historico', texto: 'Histórico', icon: 'history' }
            );
            break;
            
        case 'admin':
            itensMenu.push(
                { id: 'inicio', texto: 'Início', icon: 'home' },
                { id: 'medicos', texto: 'Gerenciar Médicos', icon: 'user-md' },
                { id: 'historico', texto: 'Todas as Consultas', icon: 'history' },
                { id: 'admin', texto: 'Administração', icon: 'cogs' }
            );
            break;
    }
    
    itensMenu.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${item.id}" class="nav-link" data-section="${item.id}">
                <i class="fas fa-${item.icon}"></i>
                ${item.texto}
            </a>
        `;
        navList.appendChild(li);
    });
    
    // Re-inicializar navegação
    if (typeof inicializarNavegacao === 'function') {
        inicializarNavegacao();
    }
}

function configurarAcoesUsuario() {
    console.log('🎛️ Configurando ações para:', usuarioLogado.tipo);
    
    // Esconder todas as ações primeiro
    const pacienteActions = document.getElementById('pacienteActions');
    const medicoActions = document.getElementById('medicoActions');
    const adminActions = document.getElementById('adminActions');
    
    if (pacienteActions) pacienteActions.style.display = 'none';
    if (medicoActions) medicoActions.style.display = 'none';
    if (adminActions) adminActions.style.display = 'none';
    
    // Mostrar mensagem de boas-vindas
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userDescription = document.getElementById('userDescription');
    
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bem-vindo, ${usuarioLogado.nome}!`;
    }
    
    switch(usuarioLogado.tipo) {
        case 'paciente':
            if (pacienteActions) pacienteActions.style.display = 'block';
            if (userDescription) userDescription.textContent = 'Agende suas consultas de forma rápida e simples';
            break;
            
        case 'medico':
            if (medicoActions) medicoActions.style.display = 'block';
            if (userDescription) userDescription.textContent = 'Gerencie sua agenda e acompanhe suas consultas';
            break;
            
        case 'admin':
            if (adminActions) adminActions.style.display = 'block';
            if (userDescription) userDescription.textContent = 'Gerencie o sistema completo de agendamento';
            break;
    }
}

function sair() {
    console.log('👋 Saindo do sistema...');
    localStorage.removeItem('agendasaude_sessao');
    window.location.href = 'index.html';
}

function salvarSessao() {
    localStorage.setItem('agendasaude_sessao', JSON.stringify(usuarioLogado));
    console.log('💾 Sessão salva:', usuarioLogado.nome);
}

function salvarUsuarios() {
    localStorage.setItem('agendasaude_usuarios', JSON.stringify(usuarios));
    console.log('💾 Usuários salvos no localStorage');
}

function carregarUsuarios() {
    const usuariosSalvos = localStorage.getItem('agendasaude_usuarios');
    if (usuariosSalvos) {
        try {
            usuarios = JSON.parse(usuariosSalvos);
            console.log('📂 Usuários carregados:', {
                pacientes: usuarios.pacientes.length,
                medicos: usuarios.medicos.length,
                admin: usuarios.admin.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
        }
    }
    
    // Garantir que o admin padrão sempre exista
    if (!usuarios.admin.find(a => a.email === "admin@agendasaude.com")) {
        usuarios.admin.push({
            id: 1,
            email: "admin@agendasaude.com",
            senha: "admin123",
            nome: "Administrador Agenda Saúde",
            tipo: "admin"
        });
    }
    
    // Adicionar médicos de exemplo se não existirem
    if (usuarios.medicos.length === 0) {
        usuarios.medicos.push(
            {
                id: 1001,
                email: "carlos.silva@agendasaude.com",
                senha: "medico123",
                nome: "Dr. Carlos Silva",
                crm: "12345-SP",
                especialidade: "Cardiologia",
                telefone: "(11) 99999-9999",
                tipo: "medico",
                dataCadastro: new Date().toISOString()
            },
            {
                id: 1002,
                email: "ana.santos@agendasaude.com",
                senha: "medico123",
                nome: "Dra. Ana Santos",
                crm: "54321-SP",
                especialidade: "Dermatologia",
                telefone: "(11) 98888-8888",
                tipo: "medico",
                dataCadastro: new Date().toISOString()
            }
        );
    }
    
    // Adicionar também aos dados do sistema (dados.medicos)
    if (typeof dados !== 'undefined' && dados.medicos.length === 0) {
        usuarios.medicos.forEach(medicoUsuario => {
            if (!dados.medicos.find(m => m.id === medicoUsuario.id)) {
                dados.medicos.push({
                    id: medicoUsuario.id,
                    nome: medicoUsuario.nome,
                    crm: medicoUsuario.crm,
                    especialidade: medicoUsuario.especialidade,
                    telefone: medicoUsuario.telefone,
                    email: medicoUsuario.email,
                    consultasRealizadas: 0
                });
            }
        });
        if (typeof salvarDados === 'function') {
            salvarDados();
        }
    }
    
    salvarUsuarios();
}

// Funções para o dashboard
function carregarDadosDashboard() {
    if (!usuarioLogado) return;
    
    console.log('📊 Carregando dados do dashboard para:', usuarioLogado.tipo);
    
    // Carregar dados específicos baseado no tipo de usuário
    switch(usuarioLogado.tipo) {
        case 'paciente':
            if (typeof carregarDadosPaciente === 'function') {
                carregarDadosPaciente();
            }
            break;
        case 'medico':
            if (typeof carregarDadosMedico === 'function') {
                carregarDadosMedico();
            }
            break;
        case 'admin':
            if (typeof carregarDadosAdmin === 'function') {
                carregarDadosAdmin();
            }
            break;
    }
    
    if (typeof atualizarEstatisticas === 'function') {
        atualizarEstatisticas();
    }
}

// Exportar funções para uso global
window.fecharModalCadastro = fecharModalCadastro;
window.sair = sair;

// Função para carregar dados do admin
function carregarDadosAdmin() {
    console.log('👨‍💼 Carregando dados administrativos...');
    
    if (typeof carregarEspecialidades === 'function') {
        carregarEspecialidades();
    }
    
    if (typeof carregarListaUsuariosAdmin === 'function') {
        carregarListaUsuariosAdmin();
    }
    
    if (typeof carregarRelatoriosAdmin === 'function') {
        carregarRelatoriosAdmin();
    }
}

// Exportar a função
window.carregarDadosAdmin = carregarDadosAdmin;