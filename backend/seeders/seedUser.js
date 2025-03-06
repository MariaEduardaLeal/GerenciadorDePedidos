const sequelize = require('../../config/database');
const User = require('../models/User');
const UserType = require('../models/UserType');
const bcrypt = require('bcryptjs');

async function seedUser() {
    try {
        // Aguardar a conexão e sincronização do banco
        await sequelize.authenticate();
        console.log('🟢 Conexão com o banco de dados estabelecida com sucesso.');

        await sequelize.sync({ force: false });
        console.log('🟢 Banco de dados sincronizado');

        // Encontrar tipo de usuário 'A' (administrador)
        const adminType = await UserType.findOne({ where: { tipo: 'A' } });

        if (!adminType) {
            throw new Error('Tipo de usuário "A" (administrador) não encontrado. Verifique a tabela user_types.');
        }

        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ where: { name: 'admin' } });
        if (existingUser) {
            console.log('Usuário administrador já existe.');
            process.exit(0);
        }

        // Criar usuário administrador
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'admin',
            user_type_id: adminType.id,
            password: hashedPassword,
        });

        console.log('Usuário administrador criado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        process.exit(1);
    }
}

seedUser();