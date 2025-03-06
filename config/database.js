const { Sequelize } = require('sequelize');

require("dotenv").config();

// Log para depuração
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

const sequelize = new Sequelize(
    process.env.DB_DATABASE, // Usar DB_DATABASE em vez de DB_NAME
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('🟢 Conexão com o banco de dados estabelecida com sucesso.');

        // Sincronizar o banco de dados
        await sequelize.sync({ force: false });
        console.log('🟢 Banco de dados sincronizado');
    } catch (error) {
        console.error('🔴 Erro ao conectar ou sincronizar o banco de dados:', error);
    }
}

testConnection();

module.exports = sequelize;