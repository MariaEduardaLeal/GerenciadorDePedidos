# Pedido System

**Pedido System** é uma aplicação web simples para gerenciamento de produtos em um sistema de pedidos. Desenvolvida com Node.js, Express e Sequelize no backend, e HTML puro com Tailwind CSS no frontend, a aplicação permite que administradores façam login e gerenciem produtos (criar, listar, editar e deletar). O projeto utiliza autenticação JWT para segurança e suporta comunicação em tempo real com Socket.io (embora essa funcionalidade ainda não esteja totalmente implementada).

## Funcionalidades

- **Login de Administrador**: Apenas usuários com permissões de administrador podem acessar o gerenciamento de produtos.
- **Gerenciamento de Produtos**: Crie, edite, liste e delete produtos com nome, descrição e preço.
- **Autenticação JWT**: Sessões seguras com tokens de autenticação.
- **Socket.io**: Base para comunicação em tempo real (futuras atualizações podem incluir sincronização com cozinha ou pedidos).

## Pré-requisitos

Antes de instalar o projeto, certifique-se de ter os seguintes itens instalados:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** (geralmente instalado com o Node.js)
- **MySQL** (versão 5.7 ou superior) - [Download](https://www.mysql.com/downloads/)
- Um editor de texto como [VS Code](https://code.visualstudio.com/) (opcional, mas recomendado).

## Estrutura do Projeto

```
pedido-system/
├── backend/
│   ├── models/
│   │   ├── Product.js         # Modelo Sequelize para Produto
│   │   └── User.js           # Modelo Sequelize para Usuário
│   ├── server.js             # Arquivo principal do servidor Node.js/Express
│   └── config/
│       └── database.js       # Configuração do Sequelize (conexão com o BD)
├── frontend/
│   ├── assets/
│   │   └── js/
│   │       ├── product.js    # JavaScript para a página de produtos (com animações)
│   │       └── sidebar.js    # JavaScript para o componente sidebar
│   ├── components/
│   │   └── sidebar.html      # HTML do componente sidebar (menu lateral)
│   ├── products/
│   │   └── index.html        # Página principal de gerenciamento de produtos
├── .env                      # Arquivo de variáveis de ambiente (ex.: APP_KEY, DB configs)
├── package.json              # Configurações do projeto Node.js e dependências
└── node_modules/             # Dependências instaladas via npm (não versionada)
```

## Instalação

Siga os passos abaixo para configurar e executar o projeto localmente:

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/pedido-system.git
cd pedido-system
```

(Substitua `seu-usuario` pelo seu nome de usuário no GitHub.)

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

Crie um banco de dados no MySQL:

```sql
CREATE DATABASE gerenciador_pedidos;
```

Execute o script SQL para criar as tabelas:

```sql
CREATE TABLE user_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Popule o banco com um usuário administrador inicial:

```sql
INSERT INTO user_types (id, name) VALUES (3, 'Administrador');
INSERT INTO users (name, password, user_type_id) VALUES ('admin', '$2a$10$YOUR_HASH_HERE', 3);
```

Para gerar o hash da senha `admin123`, use:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

Substitua `$2a$10$YOUR_HASH_HERE` pelo hash gerado.

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
DB_NAME=gerenciador_pedidos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
PORT=3000
APP_KEY=base64:7ytKgWIFfA4b722pntV5RsygvvAF3MDPo5g/nhwn6jo=
```

Substitua `your_password` pela senha do seu usuário MySQL.

### 5. Inicie o Servidor

```bash
npm start
```

Ou, para desenvolvimento com reinício automático:

```bash
npm run dev
```

### 6. Acesse a Aplicação

Abra o navegador e vá para: [http://localhost:3000/](http://localhost:3000/).

Faça login com:

- **Usuário**: `admin`
- **Senha**: `admin123`

## Scripts Disponíveis

- `npm start`: Inicia o servidor em modo produção.
- `npm run dev`: Inicia o servidor com nodemon para desenvolvimento.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, Sequelize, MySQL, JWT, Socket.io, bcryptjs
- **Frontend**: HTML, Tailwind CSS, JavaScript puro
- **Outros**: dotenv (para variáveis de ambiente)

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua feature:

```bash
git checkout -b feature/nova-funcionalidade
```

3. Commit suas mudanças:

```bash
git commit -m "Adiciona nova funcionalidade"
```

4. Push para a branch:

```bash
git push origin feature/nova-funcionalidade
```

5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT.

## Contato

Se tiver dúvidas ou sugestões, abra uma issue no repositório ou entre em contato com `eduardaleal753@gmail.com`.
