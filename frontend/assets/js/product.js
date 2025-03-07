const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/index.html';
}

if (user.role !== 3) {
    alert('Acesso negado. Apenas administradores podem gerenciar produtos.');
    window.location.href = '/index.html';
}

document.getElementById('user-info').textContent = `Bem-vindo, ${user.name}!`;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
});

// Referências ao modal e ao formulário
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const priceInput = document.getElementById('product-price');

// Configurar a máscara de preço com IMask
const priceMask = IMask(priceInput, {
    mask: 'R$ num',
    blocks: {
        num: {
            mask: Number,
            thousandsSeparator: '.',
            radix: ',',
            scale: 2,
            signed: false,
            padFractionalZeros: true
        }
    }
});

// Função para abrir o modal
function openModal(mode = 'create', product = null) {
    modal.classList.remove('hidden');
    if (mode === 'create') {
        modalTitle.textContent = 'Criar Novo Produto';
        productForm.reset();
        document.getElementById('product-id').value = '';
        priceMask.value = '';
    } else if (mode === 'edit' && product) {
        modalTitle.textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        priceMask.value = `R$ ${parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

// Função para fechar o modal
function closeModal() {
    modal.classList.add('hidden');
    productForm.reset();
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao carregar produtos');
        }

        const products = await response.json();
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '';

        if (products.length === 0) {
            productsList.innerHTML = '<p class="text-gray-500">Nenhum produto cadastrado.</p>';
            return;
        }
        console.log("Products: ", products);
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'border-b pb-2 flex justify-between items-center';
            productDiv.innerHTML = `
                <div>
                    <p class="font-medium">${product.name}</p>
                    <p class="text-sm text-gray-600">${product.description || 'Sem descrição'}</p>
                    <p class="text-sm text-gray-600">Preço: R$ ${parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</p>
                </div>
                <div>
                    <button class="edit-product bg-yellow-500 text-white px-2 py-1 rounded mr-2" data-id="${product.id}">Editar</button>
                    <button class="delete-product bg-red-500 text-white px-2 py-1 rounded" data-id="${product.id}">Deletar</button>
                </div>
            `;
            productsList.appendChild(productDiv);
        });

        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    const response = await fetch(`/api/products/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao buscar produto');
                    }

                    const product = await response.json();
                    openModal('edit', product);
                } catch (error) {
                    console.error('Erro ao carregar dados do produto:', error);
                    alert('Erro ao carregar dados do produto');
                }
            });
        });

        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Tem certeza que deseja deletar este produto?')) {
                    try {
                        const response = await fetch(`/api/products/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        if (response.ok) {
                            alert('Produto deletado com sucesso');
                            loadProducts();
                        } else {
                            const data = await response.json();
                            alert(data.error || 'Erro ao deletar produto');
                        }
                    } catch (error) {
                        alert('Erro ao conectar ao servidor');
                    }
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('products-list').innerHTML = '<p class="text-red-500">Erro ao carregar produtos</p>';
    }
}

document.getElementById('open-create-modal').addEventListener('click', () => {
    openModal('create');
});

document.getElementById('close-modal').addEventListener('click', closeModal);

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(priceMask.unmaskedValue.replace(',', '.'));

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description, price }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(id ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso');
            closeModal();
            loadProducts();
        } else {
            alert(data.error || 'Erro ao salvar produto');
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor');
    }
});

loadProducts();