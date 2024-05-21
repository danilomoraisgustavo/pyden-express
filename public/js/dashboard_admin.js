document.addEventListener('DOMContentLoaded', function () {
    // Função para alternar entre as abas
    document.querySelectorAll('.tab-link').forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            document.querySelectorAll('.tab-link').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Carregar informações do usuário logado
    fetch('/api/admin/user-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Send cookies with the request
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.user) {
            document.getElementById('username').textContent = data.user.nome_completo;
            document.getElementById('profile-pic').src = data.user.imagem_perfil || '/img/default-profile-pic.png';
        } else {
            window.location.href = '/login_administrativo.html';
        }
    })
    .catch(error => {
        window.alert(error.message);
        window.location.href = '/login_administrativo.html';
    });

    // Logout
    document.getElementById('logout-link').addEventListener('click', function () {
        fetch('/api/admin/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Send cookies with the request
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login_administrativo.html';
            }
        })
        .catch(error => console.error('Error during logout:', error));
    });

    // Carregar usuários ao carregar a página
    fetch('/api/admin/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        let users = data.users;
        renderUserTable(users);

        // Add event listeners to table headers for sorting
        document.querySelectorAll('#user-table thead th[data-sort]').forEach(header => {
            header.addEventListener('click', function () {
                const sortField = this.getAttribute('data-sort');
                const sortOrder = this.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
                this.setAttribute('data-order', sortOrder);
                users = sortUsers(users, sortField, sortOrder);
                renderUserTable(users);
            });
        });
    })
    .catch(error => console.error('Error fetching users:', error));

    // Carregar estados ao carregar a página
    fetch('/api/admin/estados', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const ufSelect = document.getElementById('codigo-uf');
        const editUfSelect = document.getElementById('edit-codigo-uf');
        data.estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.codigo_uf;
            option.textContent = `${estado.nome} (${estado.uf})`;
            ufSelect.appendChild(option);

            const editOption = document.createElement('option');
            editOption.value = estado.codigo_uf;
            editOption.textContent = `${estado.nome} (${estado.uf})`;
            editUfSelect.appendChild(editOption);
        });
    })
    .catch(error => console.error('Error fetching states:', error));

    document.getElementById('codigo-uf').addEventListener('change', function () {
        const ufCode = this.value;
        const municipioSelect = document.getElementById('codigo-ibge');
        municipioSelect.innerHTML = '';

        fetch(`/api/admin/municipios/${ufCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            data.municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.codigo_ibge;
                option.textContent = municipio.nome;
                municipioSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching municipalities:', error));
    });

    document.getElementById('edit-codigo-uf').addEventListener('change', function () {
        const ufCode = this.value;
        const editMunicipioSelect = document.getElementById('edit-codigo-ibge');
        editMunicipioSelect.innerHTML = '';

        fetch(`/api/admin/municipios/${ufCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            data.municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.codigo_ibge;
                option.textContent = municipio.nome;
                editMunicipioSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching municipalities:', error));
    });

    document.getElementById('instituicao-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = document.getElementById('nome-instituicao').value;
        const segmento = document.getElementById('segmento').value;
        const codigoUf = document.getElementById('codigo-uf').value;
        const codigoIbge = document.getElementById('codigo-ibge').value;

        const novaInstituicao = {
            nome,
            segmento,
            codigo_uf: codigoUf,
            codigo_ibge: codigoIbge
        };

        fetch('/api/admin/instituicoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaInstituicao),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.alert('Instituição cadastrada com sucesso!');
                // Limpar o formulário
                document.getElementById('instituicao-form').reset();
                document.getElementById('codigo-ibge').innerHTML = ''; // Clear municipalities dropdown
                // Recarregar instituições
                fetch('/api/admin/instituicoes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Instituições carregadas:', data.instituicoes); // Log para depuração
                    renderInstituicaoTable(data.instituicoes);
                })
                .catch(error => console.error('Error fetching institutions:', error));
            } else {
                window.alert('Erro ao cadastrar instituição.');
            }
        })
        .catch(error => console.error('Error adding institution:', error));
    });

    // Carregar instituições ao carregar a página
    fetch('/api/admin/instituicoes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Instituições carregadas ao iniciar:', data.instituicoes); // Log para depuração
        renderInstituicaoTable(data.instituicoes);
    })
    .catch(error => console.error('Error fetching institutions:', error));

    // Função para renderizar a tabela de usuários
    function renderUserTable(users) {
        const userTableBody = document.querySelector('#user-table tbody');
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const userRow = document.createElement('tr');

            const statusText = user.init ? 'Autorizado' : 'Em espera';
            const statusOptions = `
                <option value="true" ${user.init ? 'selected' : ''}>Autorizado</option>
                <option value="false" ${!user.init ? 'selected' : ''}>Em espera</option>
            `;

            const roleOptions = `
                <option value="Admin" ${user.cargo === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="Gestor de Setor" ${user.cargo === 'Gestor de Setor' ? 'selected' : ''}>Gestor de Setor</option>
                <option value="Fiscal de Rota" ${user.cargo === 'Fiscal de Rota' ? 'selected' : ''}>Fiscal de Rota</option>
                <option value="Agente Administrativo" ${user.cargo === 'Agente Administrativo' ? 'selected' : ''}>Agente Administrativo</option>
                <option value="Visitante" ${user.cargo === 'Visitante' ? 'selected' : ''}>Visitante</option>
            `;

            userRow.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome_completo}</td>
                <td>${user.email}</td>
                <td>${user.cpf}</td>
                <td>${user.nome_instituicao}</td>
                <td>${user.whatsapp}</td>
                <td>
                    <select class="status-select" data-user-id="${user.id}">
                        ${statusOptions}
                    </select>
                </td>
                <td>
                    <select class="role-select" data-user-id="${user.id}">
                        ${roleOptions}
                    </select>
                </td>
                <td>
                    <button class="save-btn" data-user-id="${user.id}">Salvar</button>
                    <button class="delete-user-btn" data-user-id="${user.id}">Excluir</button>
                </td>
            `;

            userTableBody.appendChild(userRow);
        });

        document.querySelectorAll('.save-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-user-id');
                const statusSelect = document.querySelector(`.status-select[data-user-id="${userId}"]`);
                const roleSelect = document.querySelector(`.role-select[data-user-id="${userId}"]`);

                const updatedUser = {
                    init: statusSelect.value === 'true',
                    cargo: roleSelect.value
                };

                fetch(`/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedUser),
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.alert('Usuário atualizado com sucesso!');
                    } else {
                        window.alert('Erro ao atualizar usuário.');
                    }
                })
                .catch(error => console.error('Error updating user:', error));
            });
        });

        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-user-id');
                deleteUser(userId);
            });
        });
    }

    // Função para excluir um usuário
    function deleteUser(userId) {
        if (confirm('Tem certeza de que deseja excluir este usuário?')) {
            fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.alert('Usuário excluído com sucesso!');
                    // Recarregar usuários
                    fetch('/api/admin/users', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => {
                        renderUserTable(data.users);
                    })
                    .catch(error => console.error('Error fetching users:', error));
                } else {
                    window.alert('Erro ao excluir usuário.');
                }
            })
            .catch(error => console.error('Error deleting user:', error));
        }
    }

    // Função para renderizar a tabela de instituições
    function renderInstituicaoTable(instituicoes) {
        const instituicaoTableBody = document.querySelector('#instituicao-table tbody');
        instituicaoTableBody.innerHTML = '';
        instituicoes.forEach(instituicao => {
            const instituicaoRow = document.createElement('tr');

            instituicaoRow.innerHTML = `
                <td>${instituicao.codigo_instituicao}</td>
                <td>${instituicao.nome}</td>
                <td>${instituicao.segmento}</td>
                <td>${instituicao.codigo_uf}</td>
                <td>${instituicao.codigo_ibge}</td>
                <td>
                    <button class="edit-btn" data-instituicao-id="${instituicao.codigo_instituicao}">Editar</button>
                    <button class="delete-btn" data-instituicao-id="${instituicao.codigo_instituicao}">Excluir</button>
                </td>
            `;

            instituicaoTableBody.appendChild(instituicaoRow);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const instituicaoId = this.getAttribute('data-instituicao-id');
                const instituicao = instituicoes.find(inst => inst.codigo_instituicao === parseInt(instituicaoId));
                openEditModal(instituicao);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const instituicaoId = this.getAttribute('data-instituicao-id');
                deleteInstituicao(instituicaoId);
            });
        });
    }

    // Função para abrir o modal de edição
    function openEditModal(instituicao) {
        const modal = document.getElementById('edit-modal');
        const span = document.getElementsByClassName('close')[0];
        modal.style.display = 'block';

        document.getElementById('edit-instituicao-id').value = instituicao.codigo_instituicao;
        document.getElementById('edit-nome-instituicao').value = instituicao.nome;
        document.getElementById('edit-segmento').value = instituicao.segmento;
        document.getElementById('edit-codigo-uf').value = instituicao.codigo_uf;
        document.getElementById('edit-codigo-ibge').value = instituicao.codigo_ibge;

        span.onclick = function () {
            modal.style.display = 'none';
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    // Função para excluir uma instituição
    function deleteInstituicao(instituicaoId) {
        if (confirm('Tem certeza de que deseja excluir esta instituição?')) {
            fetch(`/api/admin/instituicoes/${instituicaoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.alert('Instituição excluída com sucesso!');
                    // Recarregar instituições
                    fetch('/api/admin/instituicoes', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Instituições carregadas após exclusão:', data.instituicoes); // Log para depuração
                        renderInstituicaoTable(data.instituicoes);
                    })
                    .catch(error => console.error('Error fetching institutions:', error));
                } else {
                    window.alert('Erro ao excluir instituição.');
                }
            })
            .catch(error => console.error('Error deleting institution:', error));
        }
    }

    document.getElementById('edit-instituicao-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const instituicaoId = document.getElementById('edit-instituicao-id').value;
        const nome = document.getElementById('edit-nome-instituicao').value;
        const segmento = document.getElementById('edit-segmento').value;
        const codigoUf = document.getElementById('edit-codigo-uf').value;
        const codigoIbge = document.getElementById('edit-codigo-ibge').value;

        const instituicaoAtualizada = {
            nome,
            segmento,
            codigo_uf: codigoUf,
            codigo_ibge: codigoIbge
        };

        fetch(`/api/admin/instituicoes/${instituicaoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(instituicaoAtualizada),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.alert('Instituição atualizada com sucesso!');
                const modal = document.getElementById('edit-modal');
                modal.style.display = 'none';
                // Recarregar instituições
                fetch('/api/admin/instituicoes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Instituições carregadas após atualização:', data.instituicoes); // Log para depuração
                    renderInstituicaoTable(data.instituicoes);
                })
                .catch(error => console.error('Error fetching institutions:', error));
            } else {
                window.alert('Erro ao atualizar instituição.');
            }
        })
        .catch(error => console.error('Error updating institution:', error));
    });

    // Função para ordenar os usuários
    function sortUsers(users, field, order) {
        return users.sort((a, b) => {
            if (order === 'asc') {
                return a[field] > b[field] ? 1 : -1;
            } else {
                return a[field] < b[field] ? 1 : -1;
            }
        });
    }
});
