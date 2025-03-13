const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = (authenticateToken, isAdmin) => {
    const router = express.Router();

    // Listar todos os usuários (apenas admin)
    router.get('/', authenticateToken, isAdmin, async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'name', 'user_type_id'],
            });
            res.json(users);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    });

    // Buscar um usuário específico
    router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: ['id', 'name', 'user_type_id'],
            });
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Erro no servidor' });
        }
    });

    // Cadastrar novo usuário (apenas admin)
    router.post('/', authenticateToken, isAdmin, async (req, res) => {
        const { name, password, user_type_id } = req.body;

        if (!name || !password || !user_type_id) {
            return res.status(400).json({ error: 'Nome, senha e tipo de usuário são obrigatórios' });
        }

        try {
            const existingUser = await User.findOne({ where: { name } });
            if (existingUser) return res.status(400).json({ error: 'Usuário já existe' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                name,
                password: hashedPassword,
                user_type_id,
            });

            res.status(201).json({ id: user.id, name: user.name, user_type_id: user.user_type_id });
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    });

    // Editar usuário (apenas o próprio usuário)
    router.put('/:id', authenticateToken, async (req, res) => {
        const { name, password, user_type_id } = req.body;
        const userId = parseInt(req.params.id);

        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Você só pode editar seu próprio usuário' });
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            user.name = name || user.name;
            if (password) user.password = await bcrypt.hash(password, 10);
            user.user_type_id = user_type_id || user.user_type_id;

            await user.save();
            res.json({ id: user.id, name: user.name, user_type_id: user.user_type_id });
        } catch (error) {
            console.error('Erro ao editar usuário:', error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    });

    // Excluir usuário (apenas admin)
    router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
        const userId = parseInt(req.params.id);

        try {
            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            await user.destroy();
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    });

    return router;
};