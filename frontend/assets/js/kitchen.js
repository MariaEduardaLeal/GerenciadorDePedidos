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
                <div class="flex space-x-4 items-center">
                    <label class="flex items-center text-yellow-500">
                        <input type="checkbox" class="in-progress-checkbox mr-2 h-5 w-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500" data-id="${order.id}" checked>
                        <span>Em Progresso</span>
                    </label>
                    <label class="flex items-center text-green-500">
                        <input type="checkbox" class="complete-checkbox mr-2 h-5 w-5 text-green-500 border-gray-300 rounded focus:ring-green-500" data-id="${order.id}">
                        <span>Finalizar</span>
                    </label>
                </div>
            `;
            kitchenOrders.appendChild(orderDiv);
        });

        setupDragAndDrop();
        setupCheckboxes();
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

// Configurar comportamento dos checkboxes
function setupCheckboxes() {
    const inProgressCheckboxes = document.querySelectorAll('.in-progress-checkbox');
    const completeCheckboxes = document.querySelectorAll('.complete-checkbox');

    inProgressCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const orderId = e.target.dataset.id;
            const completeCheckbox = kitchenOrders.querySelector(`.complete-checkbox[data-id="${orderId}"]`);
            if (!e.target.checked && !completeCheckbox.checked) {
                e.target.checked = true; // Não permite desmarcar ambos
                alert('O pedido deve estar "Em Progresso" ou "Finalizado".');
            }
        });
    });

    completeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const orderId = e.target.dataset.id;
            const inProgressCheckbox = kitchenOrders.querySelector(`.in-progress-checkbox[data-id="${orderId}"]`);
            if (e.target.checked) {
                inProgressCheckbox.checked = false;
                if (confirm('Deseja marcar este pedido como finalizado?')) {
                    await completeOrder(orderId);
                } else {
                    e.target.checked = false;
                    inProgressCheckbox.checked = true;
                }
            }
        });
    });
}

// Finalizar pedido
async function completeOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao finalizar pedido');
        }

        alert('Pedido finalizado com sucesso');
        loadKitchenOrders();
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao finalizar pedido');
        loadKitchenOrders(); // Recarrega pra corrigir o estado
    }
}

// Atualizar pedidos a cada 30 segundos
setInterval(loadKitchenOrders, 30000);

// Carregar pedidos ao iniciar
loadKitchenOrders();