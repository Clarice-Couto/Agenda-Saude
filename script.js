// Dados iniciais do sistema
let dados = {
    medicos: [],
    pacientes: [],
    consultas: [],
    especialidades: ['Cardiologia', 'Dermatologia', 'Pediatria', 'Ortopedia', 'Ginecologia', 'Neurologia'],
    horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    config: {
        horarioInicio: '08:00',
        horarioFim: '17:00',
        intervalo: 30
    }
};

// Estado da aplicação
let estado = {
    passoAtual: 1,
    medicoSelecionado: null,
    dataSelecionada: null,
    horarioSelecionado: null,
    pacienteAtual: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// CORREÇÃO: Sistema de Navegação
function inicializarNavegacao() {
    console.log('🔄 Inicializando navegação...');
    
    // Navegação por links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const secao = this.getAttribute('data-section');
            console.log('📌 Navegando para:', secao);
            mostrarSecao(secao);
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const nav = document.querySelector('.nav-list');
            if (nav) {
                nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            }
        });
    }
}

// CORREÇÃO: Função para mostrar seções
function mostrarSecao(secao) {
    console.log('🎯 Mostrando seção:', secao);
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const secaoElement = document.getElementById(secao);
    if (secaoElement) {
        secaoElement.classList.add('active');
    }
    
    window.scrollTo(0, 0);
    
    // Carregar dados específicos da seção
    switch(secao) {
        case 'historico':
            if (typeof carregarHistorico === 'function') carregarHistorico();
            break;
        case 'medicos':
            if (typeof carregarMedicosLista === 'function') carregarMedicosLista();
            break;
        case 'agenda':
            if (typeof carregarAgendaMedico === 'function') carregarAgendaMedico();
            break;
        case 'admin':
            if (typeof carregarDadosAdmin === 'function') carregarDadosAdmin();
            break;
        case 'agendar':
            resetarAgendamento();
            break;
    }
}

// CORREÇÃO: Função para voltar para início
function voltarParaInicio() {
    mostrarSecao('inicio');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const linkInicio = document.querySelector('.nav-link[data-section="inicio"]');
    if (linkInicio) linkInicio.classList.add('active');
}

// CORREÇÃO: Verificação de permissões
function verificarPermissaoSecao(secao) {
    if (!window.usuarioLogado) return false;
    
    switch(secao) {
        case 'agendar':
            return usuarioLogado.tipo === 'paciente';
        case 'medicos':
            return usuarioLogado.tipo === 'admin';
        case 'agenda':
            return usuarioLogado.tipo === 'medico';
        case 'admin':
            return usuarioLogado.tipo === 'admin';
        default:
            return true;
    }
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema Agenda Saúde...');
    carregarDados();
    inicializarNavegacao();
    inicializarFormularios();
    carregarEspecialidades();
    carregarMedicos();
    atualizarEstatisticas();
    
    // CORREÇÃO DO BOTÃO HERO - Agendar Consulta
    const btnAgendarHero = document.getElementById('btnAgendarHero');
    if (btnAgendarHero) {
        btnAgendarHero.addEventListener('click', function() {
            console.log('🎯 Botão hero clicado - indo para agendamento');
            mostrarSecao('agendar');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const linkAgendar = document.querySelector('.nav-link[data-section="agendar"]');
            if (linkAgendar) linkAgendar.classList.add('active');
            
            resetarAgendamento();
        });
    }
    
    // Mostrar seção inicial
    mostrarSecao('inicio');
});

// CORREÇÃO: Sistema de Agendamento - Steps
function nextStep(passo) {
    console.log('➡️ Indo para passo:', passo);
    
    if (validarPasso(estado.passoAtual)) {
        document.getElementById(`step${estado.passoAtual}`).classList.remove('active');
        document.getElementById(`step${passo}`).classList.add('active');
        
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        const stepElement = document.querySelector(`.step[data-step="${passo}"]`);
        if (stepElement) stepElement.classList.add('active');
        
        estado.passoAtual = passo;
        
        if (passo === 2) {
            carregarMedicosAgendamento();
        } else if (passo === 3) {
            inicializarCalendario();
        } else if (passo === 4) {
            atualizarResumo();
        }
    } else {
        console.log('❌ Validação falhou no passo:', estado.passoAtual);
    }
}

function prevStep(passo) {
    console.log('⬅️ Voltando para passo:', passo);
    
    document.getElementById(`step${estado.passoAtual}`).classList.remove('active');
    document.getElementById(`step${passo}`).classList.add('active');
    
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    const stepElement = document.querySelector(`.step[data-step="${passo}"]`);
    if (stepElement) stepElement.classList.add('active');
    
    estado.passoAtual = passo;
}

function validarPasso(passo) {
    console.log('🔍 Validando passo:', passo);
    
    switch(passo) {
        case 1:
            return validarDadosPessoais();
        case 2:
            if (estado.medicoSelecionado === null) {
                alert('❌ Por favor, selecione um médico.');
                return false;
            }
            return true;
        case 3:
            if (estado.dataSelecionada === null || estado.horarioSelecionado === null) {
                alert('❌ Por favor, selecione uma data e horário.');
                return false;
            }
            return true;
        default:
            return true;
    }
}

// CORREÇÃO: Validações - FIX DA FUNCIONALIDADE DE AGENDAR CONSULTA
function nextStep(passo) {
    console.log('➡️ Indo para passo:', passo);
    
    // CORREÇÃO: Validação simplificada
    if (passo === 1) {
        if (!validarDadosPessoais()) {
            alert('❌ Por favor, preencha todos os dados corretamente.');
            return;
        }
    }
    
    if (passo === 2 && estado.medicoSelecionado === null) {
        alert('❌ Por favor, selecione um médico.');
        return;
    }
    
    if (passo === 3 && (estado.dataSelecionada === null || estado.horarioSelecionado === null)) {
        alert('❌ Por favor, selecione uma data e horário.');
        return;
    }
    
    // Mudança de passo
    document.getElementById(`step${estado.passoAtual}`).classList.remove('active');
    document.getElementById(`step${passo}`).classList.add('active');
    
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    const stepElement = document.querySelector(`.step[data-step="${passo}"]`);
    if (stepElement) stepElement.classList.add('active');
    
    estado.passoAtual = passo;
    
    if (passo === 2) {
        carregarMedicosAgendamento();
    } else if (passo === 3) {
        inicializarCalendario();
    } else if (passo === 4) {
        atualizarResumo();
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarErro(campo, mensagem) {
    const input = document.getElementById(campo);
    if (input) {
        const errorSpan = input.nextElementSibling;
        input.style.borderColor = 'var(--error)';
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = mensagem;
            errorSpan.style.display = 'block';
        }
    }
}

function limparErro(campo) {
    const input = document.getElementById(campo);
    if (input) {
        const errorSpan = input.nextElementSibling;
        input.style.borderColor = 'var(--border)';
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.style.display = 'none';
        }
    }
}

// CORREÇÃO: Sistema de Médicos
function carregarEspecialidades() {
    console.log('🎯 Carregando especialidades...');
    
    const selectEspecialidade = document.getElementById('especialidade');
    const selectFilter = document.getElementById('filterEspecialidade');
    const selectMedicoEspecialidade = document.getElementById('medicoEspecialidade');

    // Limpar selects
    if (selectEspecialidade) selectEspecialidade.innerHTML = '<option value="">Selecione uma especialidade</option>';
    if (selectFilter) selectFilter.innerHTML = '<option value="">Todas as especialidades</option>';
    if (selectMedicoEspecialidade) selectMedicoEspecialidade.innerHTML = '<option value="">Selecione a especialidade</option>';

    dados.especialidades.forEach(especialidade => {
        const option = document.createElement('option');
        option.value = especialidade;
        option.textContent = especialidade;
        
        if (selectEspecialidade) selectEspecialidade.appendChild(option.cloneNode(true));
        if (selectFilter) selectFilter.appendChild(option.cloneNode(true));
        if (selectMedicoEspecialidade) selectMedicoEspecialidade.appendChild(option.cloneNode(true));
    });
}

function carregarMedicos() {
    console.log('👨‍⚕️ Carregando médicos...');
    
    // Se não há médicos, criar alguns exemplos
    if (dados.medicos.length === 0) {
        console.log('➕ Criando médicos de exemplo...');
        dados.medicos = [
            {
                id: 1001,
                nome: 'Dr. Carlos Silva',
                crm: '12345-SP',
                especialidade: 'Cardiologia',
                telefone: '(11) 99999-9999',
                email: 'carlos.silva@agendasaude.com',
                consultasRealizadas: 45
            },
            {
                id: 1002,
                nome: 'Dra. Ana Santos',
                crm: '54321-SP',
                especialidade: 'Dermatologia',
                telefone: '(11) 98888-8888',
                email: 'ana.santos@agendasaude.com',
                consultasRealizadas: 32
            },
            {
                id: 1003,
                nome: 'Dr. Pedro Oliveira',
                crm: '67890-SP',
                especialidade: 'Pediatria',
                telefone: '(11) 97777-7777',
                email: 'pedro.oliveira@agendasaude.com',
                consultasRealizadas: 28
            }
        ];
        salvarDados();
    }

    carregarMedicosAgendamento();
    carregarMedicosLista();
}

function carregarMedicosAgendamento() {
    console.log('📋 Carregando médicos para agendamento...');
    
    const medicosGrid = document.getElementById('medicosGrid');
    if (!medicosGrid) return;

    const especialidade = document.getElementById('especialidade')?.value;

    let medicosFiltrados = dados.medicos;
    if (especialidade) {
        medicosFiltrados = dados.medicos.filter(medico => medico.especialidade === especialidade);
    }

    medicosGrid.innerHTML = '';

    if (medicosFiltrados.length === 0) {
        medicosGrid.innerHTML = '<p class="no-results">Nenhum médico encontrado para esta especialidade.</p>';
        return;
    }

    medicosFiltrados.forEach(medico => {
        const card = document.createElement('div');
        card.className = `medico-card ${estado.medicoSelecionado === medico.id ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="medico-header">
                <div class="medico-avatar">
                    ${medico.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div class="medico-info">
                    <h4>${medico.nome}</h4>
                    <div class="medico-especialidade">${medico.especialidade}</div>
                </div>
            </div>
            <div class="medico-detalhes">
                <p><i class="fas fa-id-card"></i> CRM: ${medico.crm}</p>
                <p><i class="fas fa-phone"></i> ${medico.telefone}</p>
                <p><i class="fas fa-envelope"></i> ${medico.email}</p>
                <p><i class="fas fa-stethoscope"></i> ${medico.consultasRealizadas || 0} consultas realizadas</p>
            </div>
        `;
        
        card.addEventListener('click', () => selecionarMedico(medico.id));
        medicosGrid.appendChild(card);
    });

    // Atualizar botão próximo
    const btnStep2 = document.getElementById('btnStep2') || document.getElementById('btnStep1');
    if (btnStep2) {
        btnStep2.disabled = estado.medicoSelecionado === null;
    }
}

function carregarMedicosLista() {
    console.log('📄 Carregando lista de médicos...');
    
    const medicosLista = document.getElementById('medicosLista');
    if (!medicosLista) return;

    const especialidadeFilter = document.getElementById('filterEspecialidade')?.value;
    const searchTerm = document.getElementById('searchMedico')?.value.toLowerCase() || '';

    let medicosFiltrados = dados.medicos.filter(medico => {
        const matchEspecialidade = !especialidadeFilter || medico.especialidade === especialidadeFilter;
        const matchSearch = !searchTerm || 
            medico.nome.toLowerCase().includes(searchTerm) ||
            medico.especialidade.toLowerCase().includes(searchTerm);
        return matchEspecialidade && matchSearch;
    });

    medicosLista.innerHTML = '';

    if (medicosFiltrados.length === 0) {
        medicosLista.innerHTML = '<p class="no-results">Nenhum médico encontrado com os filtros selecionados.</p>';
        return;
    }

    medicosFiltrados.forEach(medico => {
        const card = document.createElement('div');
        card.className = 'medico-card';
        card.innerHTML = `
            <div class="medico-header">
                <div class="medico-avatar">
                    ${medico.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div class="medico-info">
                    <h4>${medico.nome}</h4>
                    <div class="medico-especialidade">${medico.especialidade}</div>
                </div>
            </div>
            <div class="medico-detalhes">
                <p><i class="fas fa-id-card"></i> CRM: ${medico.crm}</p>
                <p><i class="fas fa-phone"></i> ${medico.telefone}</p>
                <p><i class="fas fa-envelope"></i> ${medico.email}</p>
                <p><i class="fas fa-stethoscope"></i> ${medico.consultasRealizadas || 0} consultas realizadas</p>
            </div>
        `;
        medicosLista.appendChild(card);
    });
}

function selecionarMedico(medicoId) {
    console.log('✅ Médico selecionado:', medicoId);
    estado.medicoSelecionado = medicoId;
    carregarMedicosAgendamento();
}

// CORREÇÃO: Sistema de Calendário
function inicializarCalendario() {
    console.log('📅 Inicializando calendário...');
    atualizarCalendario();
    carregarHorarios();
}

function atualizarCalendario() {
    console.log('🔄 Atualizando calendário...');
    
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('currentMonth');
    
    if (!calendar || !currentMonthElement) return;
    
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    currentMonthElement.textContent = `${monthNames[estado.currentMonth]} ${estado.currentYear}`;
    
    const firstDay = new Date(estado.currentYear, estado.currentMonth, 1);
    const lastDay = new Date(estado.currentYear, estado.currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    calendar.innerHTML = '';
    
    // Dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-weekday';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });
    
    // Dias vazios no início
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        calendar.appendChild(emptyDay);
    }
    
    // Dias do mês
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(estado.currentYear, estado.currentMonth, day);
        
        // Verificar se é hoje
        if (currentDate.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Verificar se é passado
        if (currentDate < today) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', () => selecionarData(day));
        }
        
        // Verificar se está selecionado
        if (estado.dataSelecionada && 
            estado.dataSelecionada.getDate() === day &&
            estado.dataSelecionada.getMonth() === estado.currentMonth &&
            estado.dataSelecionada.getFullYear() === estado.currentYear) {
            dayElement.classList.add('selected');
        }
        
        calendar.appendChild(dayElement);
    }
}

function changeMonth(direction) {
    console.log('📅 Mudando mês:', direction);
    
    estado.currentMonth += direction;
    
    if (estado.currentMonth < 0) {
        estado.currentMonth = 11;
        estado.currentYear--;
    } else if (estado.currentMonth > 11) {
        estado.currentMonth = 0;
        estado.currentYear++;
    }
    
    atualizarCalendario();
}

function selecionarData(day) {
    console.log('📌 Data selecionada:', day);
    
    estado.dataSelecionada = new Date(estado.currentYear, estado.currentMonth, day);
    estado.horarioSelecionado = null;
    atualizarCalendario();
    carregarHorarios();
    
    const btnStep3 = document.getElementById('btnStep3');
    if (btnStep3) btnStep3.disabled = false;
}

function carregarHorarios() {
    console.log('⏰ Carregando horários...');
    
    const horariosGrid = document.getElementById('horariosGrid');
    if (!horariosGrid) return;
    
    horariosGrid.innerHTML = '';
    
    if (!estado.dataSelecionada) return;
    
    // Simular horários ocupados (em uma aplicação real, viria do backend)
    const horariosOcupados = ['09:00', '14:00'];
    
    dados.horarios.forEach(horario => {
        const horarioBtn = document.createElement('button');
        horarioBtn.type = 'button';
        horarioBtn.className = `horario-btn ${horariosOcupados.includes(horario) ? 'disabled' : ''} ${estado.horarioSelecionado === horario ? 'selected' : ''}`;
        horarioBtn.textContent = horario;
        
        if (!horariosOcupados.includes(horario)) {
            horarioBtn.addEventListener('click', () => selecionarHorario(horario));
        }
        
        horariosGrid.appendChild(horarioBtn);
    });
}

function selecionarHorario(horario) {
    console.log('⏰ Horário selecionado:', horario);
    estado.horarioSelecionado = horario;
    carregarHorarios();
}

// CORREÇÃO: Resumo e Finalização
function atualizarResumo() {
    console.log('📋 Atualizando resumo...');
    
    const medico = dados.medicos.find(m => m.id === estado.medicoSelecionado);
    
    if (medico && estado.pacienteAtual && estado.dataSelecionada && estado.horarioSelecionado) {
        const resumoNome = document.getElementById('resumoNome');
        const resumoMedico = document.getElementById('resumoMedico');
        const resumoEspecialidade = document.getElementById('resumoEspecialidade');
        const resumoData = document.getElementById('resumoData');
        const resumoHorario = document.getElementById('resumoHorario');
        
        if (resumoNome) resumoNome.textContent = estado.pacienteAtual.nome;
        if (resumoMedico) resumoMedico.textContent = medico.nome;
        if (resumoEspecialidade) resumoEspecialidade.textContent = medico.especialidade;
        if (resumoData) resumoData.textContent = estado.dataSelecionada.toLocaleDateString('pt-BR');
        if (resumoHorario) resumoHorario.textContent = estado.horarioSelecionado;
    }
}

function finalizarAgendamento() {
    console.log('✅ Finalizando agendamento...');
    
    const observacoes = document.getElementById('observacoes')?.value || '';
    const medico = dados.medicos.find(m => m.id === estado.medicoSelecionado);
    
    if (!medico || !estado.pacienteAtual || !estado.dataSelecionada || !estado.horarioSelecionado) {
        alert('❌ Erro: Dados incompletos para finalizar o agendamento.');
        return;
    }
    
    // Verificar se já existe consulta no mesmo horário
    const consultaExistente = dados.consultas.find(consulta => 
        consulta.medico.id === medico.id &&
        consulta.data.getTime() === estado.dataSelecionada.getTime() &&
        consulta.horario === estado.horarioSelecionado &&
        consulta.status === 'agendado'
    );
    
    if (consultaExistente) {
        alert('❌ Este horário já está ocupado. Por favor, escolha outro horário.');
        return;
    }
    
    const consulta = {
        id: Date.now(),
        paciente: estado.pacienteAtual,
        medico: medico,
        data: new Date(estado.dataSelecionada), // Garantir que é um novo objeto Date
        horario: estado.horarioSelecionado,
        observacoes: observacoes,
        status: 'agendado',
        protocolo: 'AS' + Date.now().toString().slice(-6),
        dataAgendamento: new Date().toISOString(),
        // Novos campos para feedback do médico
        feedbackMedico: null,
        dataRealizacao: null,
        diagnostico: null,
        prescricao: null
    };
    
    dados.consultas.push(consulta);
    
    // Atualizar contador de consultas do médico
    medico.consultasRealizadas = (medico.consultasRealizadas || 0) + 1;
    
    salvarDados();
    
    // Mostrar modal de confirmação
    const protocoloElement = document.getElementById('protocolo');
    const modalDataElement = document.getElementById('modalData');
    const modalHorarioElement = document.getElementById('modalHorario');
    
    if (protocoloElement) protocoloElement.textContent = consulta.protocolo;
    if (modalDataElement) modalDataElement.textContent = consulta.data.toLocaleDateString('pt-BR');
    if (modalHorarioElement) modalHorarioElement.textContent = consulta.horario;
    
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    if (modalConfirmacao) modalConfirmacao.classList.add('active');
    
    // Resetar estado
    resetarAgendamento();
    atualizarEstatisticas();
    
    console.log('✅ Consulta agendada com sucesso:', consulta);
}

function resetarAgendamento() {
    console.log('🔄 Resetando agendamento...');
    
    estado.passoAtual = 1;
    estado.medicoSelecionado = null;
    estado.dataSelecionada = null;
    estado.horarioSelecionado = null;
    estado.pacienteAtual = null;
    
    // Resetar formulários
    const formPaciente = document.getElementById('formPaciente');
    if (formPaciente) formPaciente.reset();
    
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const step1 = document.getElementById('step1');
    if (step1) step1.classList.add('active');
    
    // Resetar steps
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    const step1Indicator = document.querySelector('.step[data-step="1"]');
    if (step1Indicator) step1Indicator.classList.add('active');
    
    // Resetar seleções
    const selectEspecialidade = document.getElementById('especialidade');
    if (selectEspecialidade) selectEspecialidade.value = '';
    
    const btnStep2 = document.getElementById('btnStep2') || document.getElementById('btnStep1');
    const btnStep3 = document.getElementById('btnStep3');
    
    if (btnStep2) btnStep2.disabled = true;
    if (btnStep3) btnStep3.disabled = true;
}

function closeModal() {
    console.log('❌ Fechando modal...');
    
    const modalConfirmacao = document.getElementById('modalConfirmacao');
    if (modalConfirmacao) modalConfirmacao.classList.remove('active');
    mostrarSecao('inicio');
}

// CORREÇÃO: Sistema de Histórico
function carregarHistorico() {
    console.log('📊 Carregando histórico...');
    
    const historicoBody = document.getElementById('historicoBody');
    if (!historicoBody) return;

    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const mesFilter = document.getElementById('filterMes')?.value || '';
    
    let consultasFiltradas = dados.consultas;
    
    // Filtrar por tipo de usuário
    if (window.usuarioLogado) {
        if (usuarioLogado.tipo === 'paciente') {
            consultasFiltradas = consultasFiltradas.filter(consulta => 
                consulta.paciente.cpf === usuarioLogado.cpf
            );
        } else if (usuarioLogado.tipo === 'medico') {
            consultasFiltradas = consultasFiltradas.filter(consulta => 
                consulta.medico.id === usuarioLogado.id
            );
        }
    }
    
    if (statusFilter) {
        consultasFiltradas = consultasFiltradas.filter(consulta => consulta.status === statusFilter);
    }
    
    if (mesFilter) {
        const [ano, mes] = mesFilter.split('-');
        consultasFiltradas = consultasFiltradas.filter(consulta => {
            const dataConsulta = new Date(consulta.data);
            return dataConsulta.getFullYear() === parseInt(ano) && 
                   (dataConsulta.getMonth() + 1) === parseInt(mes);
        });
    }
    
    historicoBody.innerHTML = '';
    
    if (consultasFiltradas.length === 0) {
        historicoBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem;">
                    <div class="no-data">
                        <i class="fas fa-calendar-times"></i>
                        <p>Nenhuma consulta encontrada</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por data mais recente
    consultasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    consultasFiltradas.forEach(consulta => {
        const row = document.createElement('tr');
        
        let colunas = `
            <td>${consulta.data.toLocaleDateString('pt-BR')} ${consulta.horario}</td>
            <td>${consulta.medico.nome}</td>
            <td>${consulta.medico.especialidade}</td>
        `;
        
        if (window.usuarioLogado && usuarioLogado.tipo === 'admin') {
            colunas += `<td>${consulta.paciente.nome}<br><small>${consulta.paciente.telefone}</small></td>`;
        } else if (window.usuarioLogado && usuarioLogado.tipo === 'medico') {
            colunas += `<td>${consulta.paciente.nome}<br><small>${consulta.paciente.telefone}</small></td>`;
        } else {
            colunas += `<td style="display: none;"></td>`;
        }
        
        row.innerHTML = colunas + `
            <td><span class="status-${consulta.status}">${formatarStatus(consulta.status)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="verDetalhesConsulta(${consulta.id})" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                ${consulta.status === 'agendado' ? `
                    <button class="btn btn-sm btn-warning" onclick="cancelarConsulta(${consulta.id})" title="Cancelar consulta">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                ${window.usuarioLogado && usuarioLogado.tipo === 'medico' && consulta.status === 'agendado' ? `
                    <button class="btn btn-sm btn-success" onclick="marcarComoRealizada(${consulta.id})" title="Marcar como realizada">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                ${window.usuarioLogado && usuarioLogado.tipo === 'admin' ? `
                    <button class="btn btn-sm btn-danger" onclick="excluirConsulta(${consulta.id})" title="Excluir consulta">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        historicoBody.appendChild(row);
    });
}

function formatarStatus(status) {
    const statusMap = {
        'agendado': 'Agendado',
        'realizado': 'Realizado',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
}

// CORREÇÃO: Sistema Admin
function inicializarFormularios() {
    console.log('📝 Inicializando formulários...');
    
    // Formulário de cadastro de médico
    const formMedico = document.getElementById('formMedico');
    if (formMedico) {
        formMedico.addEventListener('submit', function(e) {
            e.preventDefault();
            cadastrarMedico();
        });
    }
    
    // Filtros
    const filterEspecialidade = document.getElementById('filterEspecialidade');
    const searchMedico = document.getElementById('searchMedico');
    const filterStatus = document.getElementById('filterStatus');
    const filterMes = document.getElementById('filterMes');
    
    if (filterEspecialidade) {
        filterEspecialidade.addEventListener('change', carregarMedicosLista);
    }
    
    if (searchMedico) {
        searchMedico.addEventListener('input', carregarMedicosLista);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', carregarHistorico);
    }
    
    if (filterMes) {
        filterMes.addEventListener('change', carregarHistorico);
    }
    
    // Tabs admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Atualizar botões
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar conteúdo
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
            
            // Carregar dados específicos da tab
            if (tabId === 'gerenciar-usuarios') {
                if (typeof carregarListaUsuariosAdmin === 'function') carregarListaUsuariosAdmin();
            } else if (tabId === 'relatorios') {
                if (typeof carregarRelatoriosAdmin === 'function') carregarRelatoriosAdmin();
            }
        });
    });
}

function cadastrarMedico() {
    console.log('👨‍⚕️ Cadastrando novo médico...');
    
    const nome = document.getElementById('medicoNome')?.value.trim();
    const crm = document.getElementById('medicoCRM')?.value.trim();
    const especialidade = document.getElementById('medicoEspecialidade')?.value;
    const telefone = document.getElementById('medicoTelefone')?.value.trim();
    const email = document.getElementById('medicoEmail')?.value.trim();
    const senha = document.getElementById('medicoSenha')?.value;
    
    if (!nome || !crm || !especialidade || !email || !senha) {
        alert('❌ Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (senha.length < 6) {
        alert('❌ A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Verificar se email já existe
    if (window.usuarios && usuarios.medicos.find(m => m.email === email)) {
        alert('❌ Já existe um médico cadastrado com este e-mail.');
        return;
    }
    
    if (window.usuarios && usuarios.medicos.find(m => m.crm === crm)) {
        alert('❌ Já existe um médico cadastrado com este CRM.');
        return;
    }
    
    const novoMedico = {
        id: Date.now(),
        nome,
        crm,
        especialidade,
        telefone: telefone || '',
        email,
        senha,
        tipo: 'medico',
        dataCadastro: new Date().toISOString()
    };
    
    // Adicionar aos usuários
    if (window.usuarios) {
        usuarios.medicos.push(novoMedico);
        salvarUsuarios();
    }
    
    // Adicionar aos dados do sistema
    dados.medicos.push({
        id: novoMedico.id,
        nome: novoMedico.nome,
        crm: novoMedico.crm,
        especialidade: novoMedico.especialidade,
        telefone: novoMedico.telefone,
        email: novoMedico.email,
        consultasRealizadas: 0
    });
    salvarDados();
    
    // Resetar formulário
    const formMedico = document.getElementById('formMedico');
    if (formMedico) formMedico.reset();
    
    // Recarregar listas
    carregarMedicos();
    carregarMedicosLista();
    
    if (typeof carregarListaUsuariosAdmin === 'function') {
        carregarListaUsuariosAdmin();
    }
    
    alert('✅ Médico cadastrado com sucesso!');
}

function salvarConfigHorarios() {
    console.log('⚙️ Salvando configurações de horários...');
    
    const horarioInicio = document.getElementById('horarioInicio')?.value;
    const horarioFim = document.getElementById('horarioFim')?.value;
    const intervalo = document.getElementById('intervalo')?.value;
    
    if (horarioInicio) dados.config.horarioInicio = horarioInicio;
    if (horarioFim) dados.config.horarioFim = horarioFim;
    if (intervalo) dados.config.intervalo = parseInt(intervalo);
    
    salvarDados();
    alert('✅ Configurações salvas com sucesso!');
}

function gerarRelatorio() {
    console.log('📈 Gerando relatório...');
    
    const relatorio = `
RELATÓRIO DO SISTEMA AGENDA SAÚDE
Data: ${new Date().toLocaleDateString('pt-BR')}
        
ESTATÍSTICAS GERAIS:
- Total de médicos: ${dados.medicos.length}
- Total de pacientes: ${new Set(dados.consultas.map(c => c.paciente.cpf)).size}
- Total de consultas: ${dados.consultas.length}
- Consultas agendadas: ${dados.consultas.filter(c => c.status === 'agendado').length}
- Consultas realizadas: ${dados.consultas.filter(c => c.status === 'realizado').length}
        
MÉDICOS MAIS ATIVOS:
${dados.medicos.sort((a, b) => (b.consultasRealizadas || 0) - (a.consultasRealizadas || 0))
  .slice(0, 5)
  .map((medico, index) => `${index + 1}. ${medico.nome} - ${medico.consultasRealizadas || 0} consultas`)
  .join('\n')}
    `.trim();
    
    // Simular download do relatório
    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-agenda-saude-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Relatório gerado e baixado com sucesso!');
}

// Funções auxiliares
function verDetalhesConsulta(id) {
    const consulta = dados.consultas.find(c => c.id === id);
    if (consulta) {
        alert(`Detalhes da Consulta:\n\nPaciente: ${consulta.paciente.nome}\nMédico: ${consulta.medico.nome}\nEspecialidade: ${consulta.medico.especialidade}\nData: ${consulta.data.toLocaleDateString('pt-BR')}\nHorário: ${consulta.horario}\nStatus: ${formatarStatus(consulta.status)}\nObservações: ${consulta.observacoes || 'Nenhuma'}\nProtocolo: ${consulta.protocolo}`);
    }
}

function cancelarConsulta(id) {
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
        const consulta = dados.consultas.find(c => c.id === id);
        if (consulta) {
            consulta.status = 'cancelado';
            salvarDados();
            carregarHistorico();
            atualizarEstatisticas();
            alert('✅ Consulta cancelada com sucesso!');
        }
    }
}

function excluirConsulta(id) {
    if (confirm('Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.')) {
        const consultaIndex = dados.consultas.findIndex(c => c.id === id);
        if (consultaIndex !== -1) {
            dados.consultas.splice(consultaIndex, 1);
            salvarDados();
            carregarHistorico();
            atualizarEstatisticas();
            alert('✅ Consulta excluída com sucesso!');
        }
    }
}

// CORREÇÃO: Persistência de Dados
function salvarDados() {
    localStorage.setItem('agendasaude_dados', JSON.stringify(dados));
    console.log('💾 Dados salvos');
}

function carregarDados() {
    const dadosSalvos = localStorage.getItem('agendasaude_dados');
    if (dadosSalvos) {
        try {
            const dadosParseados = JSON.parse(dadosSalvos);
            dados = { ...dados, ...dadosParseados };
            
            // Converter datas de string para Date object
            dados.consultas.forEach(consulta => {
                consulta.data = new Date(consulta.data);
            });
            
            console.log('📂 Dados carregados:', {
                medicos: dados.medicos.length,
                consultas: dados.consultas.length,
                pacientes: new Set(dados.consultas.map(c => c.paciente.cpf)).size
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }
}

function atualizarEstatisticas() {
    console.log('📊 Atualizando estatísticas...');
    
    const medicosCount = document.getElementById('medicosCount');
    const pacientesCount = document.getElementById('pacientesCount');
    const consultasCount = document.getElementById('consultasCount');
    
    if (medicosCount) medicosCount.textContent = dados.medicos.length;
    
    const pacientesUnicos = new Set(dados.consultas.map(c => c.paciente.cpf)).size;
    if (pacientesCount) pacientesCount.textContent = pacientesUnicos;
    
    if (consultasCount) consultasCount.textContent = dados.consultas.length;
}

// ===== NOVAS FUNÇÕES PARA FEEDBACK DO MÉDICO =====

function marcarComoRealizada(id) {
    console.log('🏥 Marcando consulta como realizada:', id);
    
    const consulta = dados.consultas.find(c => c.id === id);
    if (!consulta) {
        alert('Consulta não encontrada!');
        return;
    }
    
    // Abrir modal para o médico adicionar feedback
    abrirModalFeedbackMedico(consulta);
}

function abrirModalFeedbackMedico(consulta) {
    // Criar modal dinamicamente
    const modalHTML = `
        <div id="modalFeedbackMedico" class="modal active">
            <div class="modal-content modal-md">
                <div class="modal-header">
                    <h3>Finalizar Consulta</h3>
                    <button class="modal-close" onclick="fecharModalFeedbackMedico()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="consulta-info" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <h4>Detalhes da Consulta</h4>
                        <p><strong>Paciente:</strong> ${consulta.paciente.nome}</p>
                        <p><strong>Data:</strong> ${consulta.data.toLocaleDateString('pt-BR')} ${consulta.horario}</p>
                        <p><strong>Observações do paciente:</strong> ${consulta.observacoes || 'Nenhuma'}</p>
                    </div>
                    
                    <form id="formFeedbackMedico">
                        <div class="form-group">
                            <label for="diagnostico">Diagnóstico *</label>
                            <textarea id="diagnostico" class="form-textarea" placeholder="Descreva o diagnóstico..." required rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="prescricao">Prescrição Médica</label>
                            <textarea id="prescricao" class="form-textarea" placeholder="Medicações, exames, orientações..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="feedbackMedico">Comentários Adicionais</label>
                            <textarea id="feedbackMedico" class="form-textarea" placeholder="Comentários sobre a consulta, evolução, etc..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="fecharModalFeedbackMedico()">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-check"></i>
                                Finalizar Consulta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar formulário
    const form = document.getElementById('formFeedbackMedico');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarFeedbackMedico(consulta.id);
        });
    }
}

function salvarFeedbackMedico(consultaId) {
    const consulta = dados.consultas.find(c => c.id === consultaId);
    if (!consulta) return;
    
    const diagnostico = document.getElementById('diagnostico').value.trim();
    const prescricao = document.getElementById('prescricao').value.trim();
    const feedbackMedico = document.getElementById('feedbackMedico').value.trim();
    
    if (!diagnostico) {
        alert('Por favor, preencha o diagnóstico.');
        return;
    }
    
    // Atualizar consulta
    consulta.status = 'realizado';
    consulta.diagnostico = diagnostico;
    consulta.prescricao = prescricao;
    consulta.feedbackMedico = feedbackMedico;
    consulta.dataRealizacao = new Date().toISOString();
    
    salvarDados();
    
    // Fechar modal
    fecharModalFeedbackMedico();
    
    // Recarregar a seção atual
    if (document.getElementById('agenda')?.classList.contains('active')) {
        carregarAgendaMedico();
    } else {
        carregarHistorico();
    }
    
    alert('✅ Consulta finalizada com sucesso! O paciente poderá ver seus comentários.');
}

function fecharModalFeedbackMedico() {
    const modal = document.getElementById('modalFeedbackMedico');
    if (modal) {
        modal.remove();
    }
}

// ===== MELHORIAS NO HISTÓRICO PARA MOSTRAR FEEDBACK =====

function verDetalhesConsulta(id) {
    const consulta = dados.consultas.find(c => c.id === id);
    if (consulta) {
        let detalhes = `
DETALHES DA CONSULTA:

👤 Paciente: ${consulta.paciente.nome}
📞 Telefone: ${consulta.paciente.telefone}
📧 Email: ${consulta.paciente.email}

👨‍⚕️ Médico: ${consulta.medico.nome}
🎯 Especialidade: ${consulta.medico.especialidade}

📅 Data: ${consulta.data.toLocaleDateString('pt-BR')}
⏰ Horário: ${consulta.horario}
📋 Status: ${formatarStatus(consulta.status)}
📜 Protocolo: ${consulta.protocolo}

📝 Observações do paciente: ${consulta.observacoes || 'Nenhuma'}
        `;
        
        // Adicionar feedback do médico se existir
        if (consulta.status === 'realizado' && consulta.diagnostico) {
            detalhes += `

🏥 FEEDBACK DO MÉDICO:

📋 Diagnóstico: ${consulta.diagnostico}
💊 Prescrição: ${consulta.prescricao || 'Nenhuma'}
💬 Comentários: ${consulta.feedbackMedico || 'Nenhum comentário adicional'}
📅 Data de realização: ${new Date(consulta.dataRealizacao).toLocaleDateString('pt-BR')}
            `;
        }
        
        alert(detalhes);
    }
}

// Exportar funções para uso global
window.mostrarSecao = mostrarSecao;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.finalizarAgendamento = finalizarAgendamento;
window.closeModal = closeModal;
window.voltarParaInicio = voltarParaInicio;
window.changeMonth = changeMonth;
window.carregarHistorico = carregarHistorico;
window.verDetalhesConsulta = verDetalhesConsulta;
window.cancelarConsulta = cancelarConsulta;
window.excluirConsulta = excluirConsulta;
window.salvarConfigHorarios = salvarConfigHorarios;
window.gerarRelatorio = gerarRelatorio;