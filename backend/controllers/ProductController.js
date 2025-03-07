const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

class ProductController {
    // Criar produto
    static async createProduct(req, res) {
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
    }

    // Listar todos os produtos
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.json(products);
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            res.status(500).json({ error: 'Erro ao listar produtos' });
        }
    }

    // Atualizar produto
    static async updateProduct(req, res) {
        const { id } = req.params;
        const { name, description, price } = req.body;

        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            await product.update({
                name: name || product.name,
                description: description || product.description,
                price: price ? parseFloat(price) : product.price,
            });

            res.json({ message: 'Produto atualizado com sucesso', product });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    }

    // Buscar produto por ID
    static async getProductById(req, res) {
        const { id } = req.params;

        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json(product);
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({ error: 'Erro ao buscar produto' });
        }
    }

    // Deletar produto
    static async deleteProduct(req, res) {
        const { id } = req.params;

        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            if (product.photo) {
                const filePath = path.join(__dirname, '../..', product.photo);
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
    }
}

module.exports = ProductController;