// Funções específicas do Dashboard

function carregarListaUsuariosAdmin() {
    console.log('Carregando lista de usuários para admin...');
    
    const listaPacientes = document.getElementById('listaPacientes');
    const listaMedicosAdmin = document.getElementById('listaMedicosAdmin');
    
    if (!listaPacientes || !listaMedicosAdmin) {
        console.error('Elementos da lista de usuários não encontrados!');
        return;
    }
    
    // Carregar pacientes
    listaPacientes.innerHTML = '';
    
    if (usuarios.pacientes.length === 0) {
        listaPacientes.innerHTML = `
            <div class="no-data">
                <i class="fas fa-users"></i>
                <p>Nenhum paciente cadastrado</p>
            </div>
        `;
    } else {
        usuarios.pacientes.forEach(paciente => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div class="user-info">
                    <strong>${paciente.nome}</strong>
                    <div class="user-details">
                        <span><i class="fas fa-id-card"></i> CPF: ${paciente.cpf}</span>
                        <span><i class="fas fa-envelope"></i> Email: ${paciente.email}</span>
                        <span><i class="fas fa-phone"></i> Telefone: ${paciente.telefone}</span>
                        <span><i class="fas fa-calendar"></i> Cadastro: ${new Date(paciente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            `;
            listaPacientes.appendChild(item);
        });
    }
    
    // Carregar médicos
    listaMedicosAdmin.innerHTML = '';
    
    if (usuarios.medicos.length === 0) {
        listaMedicosAdmin.innerHTML = `
            <div class="no-data">
                <i class="fas fa-user-md"></i>
                <p>Nenhum médico cadastrado</p>
            </div>
        `;
    } else {
        usuarios.medicos.forEach(medico => {
            const consultasMedico = dados.consultas.filter(c => c.medico.id === medico.id);
            const consultasRealizadas = consultasMedico.filter(c => c.status === 'realizado').length;
            const consultasAgendadas = consultasMedico.filter(c => c.status === 'agendado').length;
            const consultasCanceladas = consultasMedico.filter(c => c.status === 'cancelado').length;
            
            const item = document.createElement('div');
            item.className = 'user-item';
            item.setAttribute('data-medico-id', medico.id);
            item.innerHTML = `
                <div class="user-info">
                    <strong>${medico.nome}</strong>
                    <div class="user-details">
                        <span><i class="fas fa-id-card"></i> CRM: ${medico.crm}</span>
                        <span><i class="fas fa-stethoscope"></i> Especialidade: ${medico.especialidade}</span>
                        <span><i class="fas fa-envelope"></i> Email: ${medico.email}</span>
                        <span><i class="fas fa-phone"></i> Telefone: ${medico.telefone || 'Não informado'}</span>
                        <span><i class="fas fa-calendar-check"></i> Consultas: ${consultasRealizadas} realizadas, ${consultasAgendadas} agendadas, ${consultasCanceladas} canceladas</span>
                        <span><i class="fas fa-calendar"></i> Cadastro: ${new Date(medico.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="user-actions">
                        <button class="btn-action btn-view" onclick="verDetalhesMedico(${medico.id})">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <button class="btn-action btn-edit" onclick="editarMedico(${medico.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-action btn-delete" onclick="confirmarExclusaoMedico(${medico.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            listaMedicosAdmin.appendChild(item);
        });
    }
}

// Sobrescrever função de cadastro de médico para incluir autenticação
const cadastrarMedicoOriginal = window.cadastrarMedico;
window.cadastrarMedico = function() {
    const nome = document.getElementById('medicoNome').value.trim();
    const crm = document.getElementById('medicoCRM').value.trim();
    const especialidade = document.getElementById('medicoEspecialidade').value;
    const telefone = document.getElementById('medicoTelefone').value.trim();
    const email = document.getElementById('medicoEmail').value.trim();
    const senha = document.getElementById('medicoSenha').value;
    
    if (!nome || !crm || !especialidade || !email || !senha) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Verificar se email já existe
    if (usuarios.medicos.find(m => m.email === email)) {
        alert('Já existe um médico cadastrado com este e-mail.');
        return;
    }
    
    if (usuarios.medicos.find(m => m.crm === crm)) {
        alert('Já existe um médico cadastrado com este CRM.');
        return;
    }
    
    const novoMedico = {
        id: Date.now(),
        nome,
        crm,
        especialidade,
        telefone,
        email,
        senha,
        tipo: 'medico',
        consultasRealizadas: 0
    };
    
    // Adicionar aos usuários
    usuarios.medicos.push(novoMedico);
    salvarUsuarios();
    
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
    document.getElementById('formMedico').reset();
    
    // Recarregar listas
    carregarMedicos();
    carregarMedicosLista();
    carregarListaUsuariosAdmin();
    
    alert('Médico cadastrado com sucesso!');
}

// Modificar função de carregar histórico para filtrar por usuário
const carregarHistoricoOriginal = window.carregarHistorico;
window.carregarHistorico = function() {
    const historicoBody = document.getElementById('historicoBody');
    const statusFilter = document.getElementById('filterStatus').value;
    const mesFilter = document.getElementById('filterMes').value;
    
    let consultasFiltradas = dados.consultas;
    
    // Filtrar por tipo de usuário
    if (usuarioLogado.tipo === 'paciente') {
        consultasFiltradas = consultasFiltradas.filter(consulta => 
            consulta.paciente.cpf === usuarioLogado.cpf
        );
    } else if (usuarioLogado.tipo === 'medico') {
        consultasFiltradas = consultasFiltradas.filter(consulta => 
            consulta.medico.id === usuarioLogado.id
        );
    }
    // Admin vê todas as consultas
    
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
        historicoBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhuma consulta encontrada com os filtros selecionados.</td></tr>';
        return;
    }
    
    // Ordenar por data mais recente
    consultasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    consultasFiltradas.forEach(consulta => {
        const row = document.createElement('tr');
        
        // Colunas baseadas no tipo de usuário
        let colunas = `
            <td>${consulta.data.toLocaleDateString('pt-BR')} ${consulta.horario}</td>
            <td>${consulta.medico.nome}</td>
            <td>${consulta.medico.especialidade}</td>
        `;
        
        if (usuarioLogado.tipo === 'admin') {
            colunas += `<td>${consulta.paciente.nome}</td>`;
        } else if (usuarioLogado.tipo === 'medico') {
            colunas += `<td>${consulta.paciente.nome}<br><small>${consulta.paciente.telefone}</small></td>`;
        } else {
            colunas += `<td style="display: none;"></td>`; // Coluna vazia para manter alinhamento
        }
        
        row.innerHTML = colunas + `
            <td><span class="status-${consulta.status}">${formatarStatus(consulta.status)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="verDetalhesConsulta(${consulta.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${consulta.status === 'agendado' ? `
                    <button class="btn btn-sm btn-warning" onclick="cancelarConsulta(${consulta.id})">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                ${usuarioLogado.tipo === 'medico' && consulta.status === 'agendado' ? `
                    <button class="btn btn-sm btn-success" onclick="marcarComoRealizada(${consulta.id})">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        `;
        historicoBody.appendChild(row);
    });
}

// Nova função para agenda do médico
function carregarAgendaMedico() {
    const agendaBody = document.getElementById('agendaBody');
    const dataFilter = document.getElementById('filterDataAgenda').value;
    const statusFilter = document.getElementById('filterStatusAgenda').value;
    
    let consultasFiltradas = dados.consultas.filter(consulta => 
        consulta.medico.id === usuarioLogado.id
    );
    
    if (dataFilter) {
        const dataFiltro = new Date(dataFilter);
        consultasFiltradas = consultasFiltradas.filter(consulta => {
            const dataConsulta = new Date(consulta.data);
            return dataConsulta.toDateString() === dataFiltro.toDateString();
        });
    }
    
    if (statusFilter) {
        consultasFiltradas = consultasFiltradas.filter(consulta => consulta.status === statusFilter);
    }
    
    agendaBody.innerHTML = '';
    
    if (consultasFiltradas.length === 0) {
        agendaBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhuma consulta encontrada para os filtros selecionados.</td></tr>';
        return;
    }
    
    // Ordenar por data e hora
    consultasFiltradas.sort((a, b) => {
        const dataA = new Date(a.data + ' ' + a.horario);
        const dataB = new Date(b.data + ' ' + b.horario);
        return dataA - dataB;
    });
    
    consultasFiltradas.forEach(consulta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${consulta.data.toLocaleDateString('pt-BR')} ${consulta.horario}</td>
            <td>${consulta.paciente.nome}</td>
            <td>${consulta.paciente.telefone}</td>
            <td><span class="status-${consulta.status}">${formatarStatus(consulta.status)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="verDetalhesConsulta(${consulta.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${consulta.status === 'agendado' ? `
                    <button class="btn btn-sm btn-warning" onclick="cancelarConsulta(${consulta.id})">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="marcarComoRealizada(${consulta.id})">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        `;
        agendaBody.appendChild(row);
    });
}

function marcarComoRealizada(id) {
    if (confirm('Marcar esta consulta como realizada?')) {
        const consulta = dados.consultas.find(c => c.id === id);
        if (consulta) {
            consulta.status = 'realizado';
            salvarDados();
            
            // Recarregar a seção atual
            if (document.getElementById('agenda').classList.contains('active')) {
                carregarAgendaMedico();
            } else {
                carregarHistorico();
            }
            
            alert('Consulta marcada como realizada!');
        }
    }
}

// Modificar função de agendamento para usar dados do paciente logado
const finalizarAgendamentoOriginal = window.finalizarAgendamento;
window.finalizarAgendamento = function() {
    const observacoes = document.getElementById('observacoes').value;
    const medico = dados.medicos.find(m => m.id === estado.medicoSelecionado);
    
    if (!medico || !estado.dataSelecionada || !estado.horarioSelecionado) {
        alert('Erro: Dados incompletos para finalizar o agendamento.');
        return;
    }
    
    const consulta = {
        id: Date.now(),
        paciente: {
            nome: usuarioLogado.nome,
            cpf: usuarioLogado.cpf,
            email: usuarioLogado.email,
            telefone: usuarioLogado.telefone,
            dataNascimento: usuarioLogado.dataNascimento
        },
        medico: medico,
        data: estado.dataSelecionada,
        horario: estado.horarioSelecionado,
        observacoes: observacoes,
        status: 'agendado',
        protocolo: 'MS' + Date.now().toString().slice(-6)
    };
    
    dados.consultas.push(consulta);
    
    // Atualizar contador de consultas do médico
    medico.consultasRealizadas = (medico.consultasRealizadas || 0) + 1;
    
    salvarDados();
    
    // Mostrar modal de confirmação
    document.getElementById('protocolo').textContent = consulta.protocolo;
    document.getElementById('modalData').textContent = consulta.data.toLocaleDateString('pt-BR');
    document.getElementById('modalHorario').textContent = consulta.horario;
    document.getElementById('modalConfirmacao').classList.add('active');
    
    // Resetar estado
    resetarAgendamento();
    atualizarEstatisticas();
}

// Modificar função de atualizar resumo
const atualizarResumoOriginal = window.atualizarResumo;
window.atualizarResumo = function() {
    const medico = dados.medicos.find(m => m.id === estado.medicoSelecionado);
    
    if (medico && estado.dataSelecionada && estado.horarioSelecionado) {
        document.getElementById('resumoNome').textContent = usuarioLogado.nome;
        document.getElementById('resumoMedico').textContent = medico.nome;
        document.getElementById('resumoEspecialidade').textContent = medico.especialidade;
        document.getElementById('resumoData').textContent = estado.dataSelecionada.toLocaleDateString('pt-BR');
        document.getElementById('resumoHorario').textContent = estado.horarioSelecionado;
    }
}

// ===== FUNÇÕES PARA EXCLUSÃO DE MÉDICO =====

function confirmarExclusaoMedico(medicoId) {
    const medico = usuarios.medicos.find(m => m.id === medicoId);
    if (!medico) return;
    
    const consultasMedico = dados.consultas.filter(c => c.medico.id === medicoId);
    const consultasAtivas = consultasMedico.filter(c => c.status === 'agendado').length;
    
    let mensagem = `Tem certeza que deseja excluir o médico ${medico.nome}?`;
    
    if (consultasAtivas > 0) {
        mensagem += `\n\n⚠️ ATENÇÃO: Este médico possui ${consultasAtivas} consulta(s) agendada(s). Todas serão canceladas automaticamente.`;
    }
    
    if (consultasMedico.length > 0) {
        mensagem += `\n\nTotal de consultas no histórico: ${consultasMedico.length}`;
    }
    
    if (confirm(mensagem)) {
        excluirMedico(medicoId);
    }
}

function excluirMedico(medicoId) {
    console.log('Excluindo médico:', medicoId);
    
    const medico = usuarios.medicos.find(m => m.id === medicoId);
    if (!medico) {
        alert('Médico não encontrado!');
        return;
    }
    
    // Animação de exclusão
    const itemMedico = document.querySelector(`[data-medico-id="${medicoId}"]`);
    if (itemMedico) {
        itemMedico.classList.add('deleting');
    }
    
    setTimeout(() => {
        // Remover das consultas (cancelar as agendadas)
        dados.consultas = dados.consultas.filter(consulta => {
            if (consulta.medico.id === medicoId) {
                if (consulta.status === 'agendado') {
                    console.log(`Cancelando consulta ${consulta.id} do médico ${medico.nome}`);
                }
                return false; // Remove todas as consultas do médico
            }
            return true;
        });
        
        // Remover dos médicos do sistema
        dados.medicos = dados.medicos.filter(m => m.id !== medicoId);
        
        // Remover dos usuários
        usuarios.medicos = usuarios.medicos.filter(m => m.id !== medicoId);
        
        salvarDados();
        salvarUsuarios();
        
        // Recarregar listas
        carregarMedicos();
        carregarMedicosLista();
        carregarListaUsuariosAdmin();
        carregarHistorico(); // Atualizar histórico se estiver aberto
        
        alert(`✅ Médico ${medico.nome} excluído com sucesso!`);
        
    }, 300); // Tempo para a animação
}

function verDetalhesMedico(medicoId) {
    const medico = usuarios.medicos.find(m => m.id === medicoId);
    if (medico) {
        const consultasMedico = dados.consultas.filter(c => c.medico.id === medicoId);
        const consultasRealizadas = consultasMedico.filter(c => c.status === 'realizado').length;
        const consultasAgendadas = consultasMedico.filter(c => c.status === 'agendado').length;
        const consultasCanceladas = consultasMedico.filter(c => c.status === 'cancelado').length;
        
        const detalhes = `
DETALHES DO MÉDICO:

👨‍⚕️ Nome: ${medico.nome}
📋 CRM: ${medico.crm}
🎯 Especialidade: ${medico.especialidade}
📧 Email: ${medico.email}
📞 Telefone: ${medico.telefone || 'Não informado'}
📅 Data de Cadastro: ${new Date(medico.dataCadastro).toLocaleDateString('pt-BR')}

📊 ESTATÍSTICAS:
✅ Consultas realizadas: ${consultasRealizadas}
📅 Consultas agendadas: ${consultasAgendadas}
❌ Consultas canceladas: ${consultasCanceladas}
📈 Total de consultas: ${consultasMedico.length}

${consultasAgendadas > 0 ? `⚠️ ATENÇÃO: Existem ${consultasAgendadas} consulta(s) agendada(s) com este médico.` : ''}
        `.trim();
        
        alert(detalhes);
    }
}

function editarMedico(medicoId) {
    const medico = usuarios.medicos.find(m => m.id === medicoId);
    if (medico) {
        // Em uma implementação completa, abriria um modal de edição
        // Por enquanto, vamos mostrar um alerta com os dados atuais
        const novosDados = prompt(`Editando médico: ${medico.nome}\n\nDigite o novo telefone:`, medico.telefone || '');
        
        if (novosDados !== null) {
            // Atualizar telefone
            medico.telefone = novosDados;
            
            // Atualizar também nos dados do sistema
            const medicoSistema = dados.medicos.find(m => m.id === medicoId);
            if (medicoSistema) {
                medicoSistema.telefone = novosDados;
            }
            
            salvarUsuarios();
            salvarDados();
            
            // Recarregar listas
            carregarListaUsuariosAdmin();
            carregarMedicosLista();
            
            alert('✅ Telefone atualizado com sucesso!');
        }
    }
}

// Funções para o modal de exclusão
function abrirModalExclusao(medicoId, mensagem) {
    const modal = document.getElementById('modalConfirmacaoExclusao');
    const mensagemElement = document.getElementById('mensagemExclusao');
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    
    if (modal && mensagemElement && btnConfirmar) {
        mensagemElement.textContent = mensagem;
        
        // Remover event listener anterior e adicionar novo
        btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
        const novoBtn = document.getElementById('btnConfirmarExclusao');
        novoBtn.addEventListener('click', () => excluirMedico(medicoId));
        
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function fecharModalExclusao() {
    const modal = document.getElementById('modalConfirmacaoExclusao');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}