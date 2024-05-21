const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');

const router = express.Router();

// Verificar se a instituição existe
async function instituicaoExiste(codigo_instituicao) {
    const result = await pool.query('SELECT * FROM instituicoes WHERE codigo_instituicao = $1', [codigo_instituicao]);
    return result.rows.length > 0;
}

// Rota de registro de usuário
router.post('/register', [
    body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/).withMessage('CPF inválido.'),
    body('codigo_instituicao').isInt().withMessage('Código de instituição deve ser um número inteiro.'),
    body('whatsapp').matches(/^\(\d{2}\) \d{5}\-\d{4}$/).withMessage('WhatsApp inválido.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nome_completo, email, cpf, codigo_instituicao, whatsapp, senha } = req.body;

    try {
        const instituicaoValida = await instituicaoExiste(codigo_instituicao);
        if (!instituicaoValida) {
            return res.status(400).json({ error: 'Instituição não encontrada.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            'INSERT INTO Usuarios (nome_completo, email, cpf, codigo_instituicao, whatsapp, senha) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nome_completo, email, cpf, codigo_instituicao, whatsapp, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email ou CPF já cadastrado.' });
        } else {
            res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }
    }
});

// Rota de login de usuário
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    try {
        const result = await pool.query('SELECT * FROM Usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(senha, user.senha);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha incorreta.' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

module.exports = router;
