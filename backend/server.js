const express = require('express');
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Importar modelos
const User = require('./models/User');
const Product = require('./models/Product');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Configurar o multer para salvar arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
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
    }
});

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));
// Servir arquivos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Rota de teste
app.get('/api', (req, res) => {
    res.send("API Rodando");
});

// Rota de Login
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

// Rotas de Produtos
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    try {
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
        });
        res.status(201).json({ message: 'Produto criado com sucesso', product });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});
app.get('/api/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
});

app.put('/api/products/:id', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : req.body.photo;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        await product.update({
            name: name || product.name,
            description: description || product.description,
            price: price ? parseFloat(price) : product.price,
            photo: photo || product.photo,
        });

        res.json({ message: 'Produto atualizado com sucesso', product });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (product.photo) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '../', product.photo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await product.destroy();
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

io.on("connection", (socket) => {
    console.log("Novo cliente conectado");
    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
    });
});

sequelize.sync({ force: false }).then(() => {
    console.log('🟢 Banco de dados sincronizado');
}).catch(err => {
    console.error('🔴 Erro ao sincronizar o banco:', err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});