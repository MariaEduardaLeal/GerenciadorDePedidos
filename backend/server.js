const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const defineAssociations = require('./associations');
require('dotenv').config();

// Importar modelos
const User = require('./models/User');

// Configurar o app e servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (frontend e uploads)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Definir associações entre modelos
defineAssociations();

// Configurar o multer para salvar arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens (jpeg, jpg, png, gif) são permitidas!'));
        }
    },
});

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.APP_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        req.user = user;
        next();
    });
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 3) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
    }
    next();
};

// Rotas
app.get('/api', (req, res) => {
    res.send('API Rodando');
});

// Rota de login
app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }

    try {
        const user = await User.findOne({ where: { name } });
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.user_type_id },
            process.env.APP_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.user_type_id } });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Importar e usar rotas separadas
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/api/orders', orderRoutes(authenticateToken));
app.use('/api/products', productRoutes(authenticateToken, isAdmin));

// Rota padrão para o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
    // Adicione outros eventos do Socket.IO aqui
});

// Sincronizar o banco e iniciar o servidor
sequelize.sync({ force: false })
    .then(() => {
        console.log('🟢 Banco de dados sincronizado');
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch(err => {
        console.error('🔴 Erro ao sincronizar o banco:', err);
    });