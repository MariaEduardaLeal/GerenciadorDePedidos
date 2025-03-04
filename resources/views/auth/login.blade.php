<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema de Pedidos</title>
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
    <div class="main-container">
        <!-- Lado Esquerdo: Logo -->
        <div class="logo-container">
            <img src="{{ asset('imgs/logo.webp') }}" alt="Comunidade Católica Em Adoração" class="logo">
        </div>

        <!-- Lado Direito: Formulário -->
        <div class="form-container">
            <form method="POST" action="{{ route('login') }}" class="login-form">
                @csrf

                <!-- Campo Login (usando name ao invés de email) -->
                <div class="form-group">
                    <input type="text" id="login" name="name" value="{{ old('name') }}" placeholder="Login" required autofocus>
                    @error('name')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Campo Senha -->
                <div class="form-group">
                    <input type="password" id="password" name="password" placeholder="Senha" required>
                    @error('password')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>

                <!-- Botão de Login -->
                <button type="submit">Confirmar</button>

                <!-- Link Esqueceu a Senha -->
                @if (Route::has('password.request'))
                    <a href="{{ route('password.request') }}" class="forgot-password">Esqueceu a senha?</a>
                @endif
            </form>
        </div>
    </div>
</body>
</html>
