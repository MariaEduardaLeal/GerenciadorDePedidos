// Autenticação e inicialização
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/index.html';
}

// Elementos do DOM
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout');
const modal = document.getElementById('order-modal');
const modalTitle = document.getElementById('modal-title');
const orderForm = document.getElementById('order-form');
const orderItemsContainer = document.getElementById('order-items');
const openCreateModalBtn = document.getElementById('open-create-modal');
const closeModalBtn = document.getElementById('close-modal');
const addItemBtn = document.getElementById('add-item');
const ordersList = document.getElementById('orders-list');

// Verificar se todos os elementos foram encontrados
if (!userInfo || !logoutBtn || !modal || !modalTitle || !orderForm || !orderItemsContainer || !openCreateModalBtn || !closeModalBtn || !addItemBtn || !ordersList) {
    console.error('Erro: Um ou mais elementos do DOM não foram encontrados');
    ordersList.innerHTML = '<p class="text-red-500">Erro ao carregar a página</p>';
    throw new Error('Elementos do DOM ausentes');
}

// Exibir informações do usuário
userInfo.textContent = `Bem-vindo, ${user.name}!`;

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
});

// Carregar produtos para os selects
async function loadProductsForSelect(container = orderItemsContainer) {
    try {
        const response = await fetch('/api/products', { // Corrigido de '/api/orders' para '/api/products'
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao carregar produtos');
        }
        const products = await response.json();

        const selects = container.querySelectorAll('.product-select');
        selects.forEach(select => {
            const currentValue = select.value; // Preserva o valor selecionado
            select.innerHTML = '<option value="">Selecione um produto</option>';
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
                select.appendChild(option);
            });
            select.value = currentValue; // Restaura o valor selecionado
        });
    } catch (error) {
        console.error('Erro ao carregar produtos para select:', error);
    }
}

// Carregar pedidos
async function loadOrders() {
    try {
        const response = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao carregar pedidos');
        }

        const orders = await response.json();
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-gray-500">Nenhum pedido cadastrado.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'border-b pb-2 flex justify-between items-center transition-all duration-500 ease-in-out';
            orderDiv.innerHTML = `
                <div>
                    <p class="font-medium">${order.order_name}</p>
                    <p class="text-sm text-gray-600">Cliente: ${order.customer_name || 'Não especificado'}</p>
                    <p class="text-sm text-gray-600">Criado por: ${user.name} (ID: ${order.user_id})</p>
                    <p class="text-sm text-gray-600">Total: R$ ${order.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p class="text-sm text-gray-600">Status: ${order.status}</p>
                    <p class="text-sm text-gray-600">Observação: ${order.observation || 'Nenhuma'}</p>
                    <p class="text-sm text-gray-600">Itens: ${order.OrderItems.map(item => `${item.quantity}x ${item.Product.name}`).join(', ')}</p>
                    <p class="text-sm text-gray-600">Criado em: ${new Date(order.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div class="space-x-2">
                    <button class="edit-order bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" data-id="${order.id}">Editar</button>
                    <button class="delete-order bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${order.id}">Excluir</button>
                </div>
            `;
            ordersList.appendChild(orderDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        ordersList.innerHTML = '<p class="text-red-500">Erro ao carregar pedidos</p>';
    }
}

// Abrir modal para criar ou editar pedido
function openModal(order = null) {
    modal.classList.remove('hidden');
    modalTitle.textContent = order ? 'Editar Pedido' : 'Criar Novo Pedido';
    orderForm.reset();
    orderItemsContainer.innerHTML = '';

    if (order) {
        document.getElementById('order-name').value = order.order_name;
        document.getElementById('customer-name').value = order.customer_name;
        document.getElementById('observation').value = order.observation || '';

        order.OrderItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center space-x-2';
            itemDiv.innerHTML = `
                <select name="product_id" class="product-select mt-1 block w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione um produto</option>
                </select>
                <input type="number" name="quantity" min="1" class="quantity mt-1 block w-1/4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${item.quantity}" required>
                <button type="button" class="remove-item bg-red-500 text-white px-2 py-1 rounded">X</button>
            `;
            orderItemsContainer.appendChild(itemDiv);
            loadProductsForSelect(orderItemsContainer);
            itemDiv.querySelector('.product-select').value = item.product_id;
        });
    } else {
        const initialItem = document.createElement('div');
        initialItem.className = 'flex items-center space-x-2';
        initialItem.innerHTML = `
            <select name="product_id" class="product-select mt-1 block w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione um produto</option>
            </select>
            <input type="number" name="quantity" min="1" class="quantity mt-1 block w-1/4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Quantidade" required>
            <button type="button" class="remove-item bg-red-500 text-white px-2 py-1 rounded">X</button>
        `;
        orderItemsContainer.appendChild(initialItem);
        loadProductsForSelect();
    }
}

// Fechar modal
function closeModal() {
    modal.classList.add('hidden');
    orderItemsContainer.innerHTML = '';
    orderForm.reset();
}

// Adicionar novo item ao pedido
addItemBtn.addEventListener('click', () => {
    const newItem = document.createElement('div');
    newItem.className = 'flex items-center space-x-2';
    newItem.innerHTML = `
        <select name="product_id" class="product-select mt-1 block w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione um produto</option>
        </select>
        <input type="number" name="quantity" min="1" class="quantity mt-1 block w-1/4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Quantidade" required>
        <button type="button" class="remove-item bg-red-500 text-white px-2 py-1 rounded">X</button>
    `;
    orderItemsContainer.appendChild(newItem);
    loadProductsForSelect(orderItemsContainer);
});

// Remover item do pedido
orderItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        const items = orderItemsContainer.querySelectorAll('.flex');
        if (items.length > 1) {
            e.target.closest('.flex').remove();
        }
    }
});

// Enviar formulário (criar ou editar)
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const order_name = document.getElementById('order-name').value;
    const customer_name = document.getElementById('customer-name').value;
    const observation = document.getElementById('observation').value;
    const items = Array.from(orderItemsContainer.querySelectorAll('.flex'))
        .map(item => ({
            product_id: parseInt(item.querySelector('.product-select').value) || 0,
            quantity: parseInt(item.querySelector('.quantity').value) || 0,
        }))
        .filter(item => item.product_id > 0 && item.quantity > 0);

    if (!customer_name) {
        alert('Por favor, informe o nome do cliente');
        return;
    }
    if (items.length === 0) {
        alert('Adicione pelo menos um item válido ao pedido');
        return;
    }

    const orderId = orderForm.dataset.orderId; // Para edição
    const method = orderId ? 'PUT' : 'POST';
    const url = orderId ? `/api/orders/${orderId}` : '/api/orders';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order_name, customer_name, observation, items }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(orderId ? 'Pedido atualizado com sucesso' : 'Pedido criado com sucesso');
            closeModal();
            loadOrders();
            delete orderForm.dataset.orderId; // Limpa o ID após edição
        } else {
            alert(data.error || 'Erro ao salvar pedido');
        }
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao conectar ao servidor');
    }
});

// Editar ou excluir pedido
ordersList.addEventListener('click', async (e) => {
    const orderId = e.target.dataset.id;
    if (!orderId) return;

    if (e.target.classList.contains('edit-order')) {
        const response = await fetch(`/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const order = await response.json();
        openModal(order);
        orderForm.dataset.orderId = orderId; // Armazena o ID para edição
    } else if (e.target.classList.contains('delete-order')) {
        if (confirm('Tem certeza que deseja excluir este pedido?')) {
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.ok) {
                    alert('Pedido excluído com sucesso');
                    loadOrders();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Erro ao excluir pedido');
                }
            } catch (error) {
                console.error('Erro ao excluir pedido:', error);
                alert('Erro ao conectar ao servidor');
            }
        }
    }
});

// Eventos principais
openCreateModalBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);

// Carregar pedidos ao iniciar
loadOrders();