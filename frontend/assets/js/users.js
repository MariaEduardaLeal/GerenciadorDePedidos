const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/index.html';
}

if (user.role !== 3) {
    alert('Acesso negado. Apenas administradores podem gerenciar usuários.');
    window.location.href = '/index.html';
}

document.getElementById('user-info').textContent = `Bem-vindo, ${user.name}!`;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
});

// Referências ao modal e ao formulário
const modal = document.getElementById('user-modal');
const modalTitle = document.getElementById('modal-title');
const userForm = document.getElementById('user-form');

// Função para abrir o modal
function openModal(mode = 'create', userData = null) {
    modal.classList.remove('hidden');
    if (mode === 'create') {
        modalTitle.textContent = 'Cadastrar Novo Usuário';
        userForm.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-type').selectedIndex = 0; // Resetar o select
    } else if (mode === 'edit' && userData) {
        modalTitle.textContent = 'Editar Usuário';
        document.getElementById('user-id').value = userData.id;
        document.getElementById('user-name').value = userData.name;
        document.getElementById('user-password').value = ''; // Senha em branco por padrão
        document.getElementById('user-type').value = userData.user_type_id;
    }
}

// Função para fechar o modal
function closeModal() {
    modal.classList.add('hidden');
    userForm.reset();
}

// Carregar a lista de usuários
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao carregar usuários');
        }

        const users = await response.json();
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';

        if (users.length === 0) {
            usersList.innerHTML = '<p class="text-gray-500">Nenhum usuário cadastrado.</p>';
            return;
        }

        users.forEach(u => {
            const userDiv = document.createElement('div');
            userDiv.className = 'border-b pb-2 flex justify-between items-center';
            userDiv.innerHTML = `
                <div>
                    <p class="font-medium">${u.name}</p>
                    <p class="text-sm text-gray-600">Tipo: ${u.user_type_id === 1 ? 'Cliente' : u.user_type_id === 2 ? 'Cozinha' : 'Administrador'}</p>
                </div>
                <div class="space-x-2">
                    ${u.id === user.id ? '<button class="edit-user bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" data-id="' + u.id + '">Editar</button>' : ''}
                    <button class="delete-user bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${u.id}">Excluir</button>
                </div>
            `;
            usersList.appendChild(userDiv);
        });

        // Evento para editar
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.target.dataset.id);
                if (id !== user.id) {
                    alert('Você só pode editar seu próprio usuário.');
                    return;
                }
                try {
                    const response = await fetch(`/api/users/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) throw new Error('Erro ao buscar usuário');
                    const userData = await response.json();
                    openModal('edit', userData);
                } catch (error) {
                    alert('Erro ao carregar dados do usuário');
                }
            });
        });

        // Evento para excluir
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Tem certeza que deseja excluir este usuário?')) {
                    try {
                        const response = await fetch(`/api/users/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        if (response.ok) {
                            alert('Usuário excluído com sucesso');
                            loadUsers();
                        } else {
                            const data = await response.json();
                            alert(data.error || 'Erro ao excluir usuário');
                        }
                    } catch (error) {
                        alert('Erro ao conectar ao servidor');
                    }
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('users-list').innerHTML = '<p class="text-red-500">Erro ao carregar usuários</p>';
    }
}

// Eventos
document.getElementById('open-create-modal').addEventListener('click', () => openModal('create'));
document.getElementById('close-modal').addEventListener('click', closeModal);

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const password = document.getElementById('user-password').value;
    const user_type_id = parseInt(document.getElementById('user-type').value);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/users/${id}` : '/api/users';
    const body = { name, user_type_id };
    if (password) body.password = password; // Só inclui senha se preenchida

    if (id && parseInt(id) !== user.id) {
        alert('Você só pode editar seu próprio usuário.');
        return;
    }

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            alert(id ? 'Usuário atualizado com sucesso' : 'Usuário cadastrado com sucesso');
            if (id) { // Atualizar o usuário logado no localStorage
                const updatedUser = { id: user.id, name, role: user_type_id };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                document.getElementById('user-info').textContent = `Bem-vindo, ${name}!`;
            }
            closeModal();
            loadUsers();
        } else {
            alert(data.error || 'Erro ao salvar usuário');
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor');
    }
});

loadUsers();