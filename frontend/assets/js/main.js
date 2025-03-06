const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/products/index.html';
        } else {
            errorMessage.textContent = data.error || 'Erro ao fazer login';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        errorMessage.textContent = 'Erro ao conectar ao servidor';
        errorMessage.classList.remove('hidden');
    }
});