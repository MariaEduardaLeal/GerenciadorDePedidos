document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Erro ao fazer login');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirecionar com base no role
        switch (data.user.role) {
            case 1: // Cliente
                window.location.href = '/orders/index.html';
                break;
            case 2: // Cozinha
                window.location.href = '/kitchen/index.html';
                break;
            case 3: // Admin
                window.location.href = '/products/index.html';
                break;
            default:
                window.location.href = '/index.html'; // Fallback
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor');
    }
});

// Se já estiver logado, redirecionar
if (localStorage.getItem('token') && localStorage.getItem('user')) {
    const user = JSON.parse(localStorage.getItem('user'));
    switch (user.role) {
        case 1: window.location.href = '/orders/index.html'; break;
        case 2: window.location.href = '/kitchen/index.html'; break;
        case 3: window.location.href = '/products/index.html'; break;
        default: break;
    }
}