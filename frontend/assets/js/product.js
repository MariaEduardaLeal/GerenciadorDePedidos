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
                    <p class="text-sm text-gray-600">Preço: R$ ${parseFloat(product.price).toFixed(2)}</p>
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
                    const product = await response.json();

                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-description').value = product.description || '';
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('form-title').textContent = 'Editar Produto';
                    document.getElementById('cancel-edit').classList.remove('hidden');
                } catch (error) {
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

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;

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
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            document.getElementById('form-title').textContent = 'Criar Novo Produto';
            document.getElementById('cancel-edit').classList.add('hidden');
            loadProducts();
        } else {
            alert(data.error || 'Erro ao salvar produto');
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor');
    }
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').textContent = 'Criar Novo Produto';
    document.getElementById('cancel-edit').classList.add('hidden');
});

loadProducts();