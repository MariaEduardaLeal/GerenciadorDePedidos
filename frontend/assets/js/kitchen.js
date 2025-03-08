// Autenticação e inicialização
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/index.html';
}

// Elementos do DOM
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout');
const kitchenOrders = document.getElementById('kitchen-orders');

// Verificar se todos os elementos foram encontrados
if (!userInfo || !logoutBtn || !kitchenOrders) {
    console.error('Erro: Um ou mais elementos do DOM não foram encontrados');
    kitchenOrders.innerHTML = '<p class="text-red-500">Erro ao carregar a página</p>';
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

// Carregar pedidos em progresso
async function loadKitchenOrders() {
    try {
        const response = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao carregar pedidos');
        }

        const orders = await response.json();
        const inProgressOrders = orders.filter(order => order.status === 'in_progress');
        kitchenOrders.innerHTML = '';

        if (inProgressOrders.length === 0) {
            kitchenOrders.innerHTML = '<p class="text-gray-500">Nenhum pedido em progresso.</p>';
            return;
        }

        inProgressOrders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'bg-white p-4 rounded-lg shadow-md flex justify-between items-center draggable';
            orderDiv.draggable = true;
            orderDiv.dataset.id = order.id;
            orderDiv.innerHTML = `
                <div>
                    <p class="font-medium text-lg">Mesa/Destino: ${order.order_name}</p>
                    <p class="text-sm text-gray-600">Cliente: ${order.customer_name || 'Não especificado'}</p>
                    <p class="text-sm text-gray-600">Itens: ${order.OrderItems.map(item => `${item.quantity}x ${item.Product.name}`).join(', ')}</p>
                    <p class="text-sm text-gray-600"><span class="font-bold">Observação:</span> ${order.observation || 'Nenhuma'}</p>
                    <p class="text-sm text-gray-600">Criado em: ${new Date(order.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <button class="complete-order bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" data-id="${order.id}">Finalizar</button>
            `;
            kitchenOrders.appendChild(orderDiv);
        });

        // Adicionar eventos de drag-and-drop
        setupDragAndDrop();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        kitchenOrders.innerHTML = '<p class="text-red-500">Erro ao carregar pedidos</p>';
    }
}

// Configurar drag-and-drop
function setupDragAndDrop() {
    const draggables = kitchenOrders.querySelectorAll('.draggable');
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggable.classList.add('opacity-50');
            e.dataTransfer.setData('text/plain', draggable.dataset.id);
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('opacity-50');
        });

        draggable.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        draggable.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedElement = kitchenOrders.querySelector(`[data-id="${draggedId}"]`);
            const targetElement = e.target.closest('.draggable');
            if (draggedElement && targetElement && draggedElement !== targetElement) {
                const allOrders = Array.from(kitchenOrders.children);
                const draggedIndex = allOrders.indexOf(draggedElement);
                const targetIndex = allOrders.indexOf(targetElement);
                if (draggedIndex < targetIndex) {
                    targetElement.after(draggedElement);
                } else {
                    targetElement.before(draggedElement);
                }
            }
        });
    });
}

// Finalizar pedido
async function completeOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'complete' }),
        });

        if (response.ok) {
            alert('Pedido finalizado com sucesso');
            loadKitchenOrders();
        } else {
            const data = await response.json();
            alert(data.error || 'Erro ao finalizar pedido');
        }
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao conectar ao servidor');
    }
}

// Evento para finalizar pedido
kitchenOrders.addEventListener('click', (e) => {
    if (e.target.classList.contains('complete-order')) {
        const orderId = e.target.dataset.id;
        if (confirm('Deseja marcar este pedido como finalizado?')) {
            completeOrder(orderId);
        }
    }
});

// Atualizar pedidos a cada 30 segundos
setInterval(loadKitchenOrders, 30000);

// Carregar pedidos ao iniciar
loadKitchenOrders();