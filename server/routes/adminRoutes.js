const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authenticateToken, checkAdminRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Função para gerar um número aleatório de 5 dígitos
function generateRandomCode() {
    return Math.floor(10000 + Math.random() * 90000);
}

// Rota de login administrativo
router.post('/admin/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    try {
        const result = await pool.query('SELECT * FROM Usuarios WHERE email = $1 AND cargo = $2', [email, 'Admin']);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado ou não é um administrador.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(senha, user.senha);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha incorreta.' });
        }

        const token = jwt.sign({ id: user.id, cargo: user.cargo }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Log the token to the console
        console.log('JWT Token:', token);

        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Login administrativo realizado com sucesso!', token });
    } catch (error) {
        console.error('Erro ao fazer login administrativo:', error);
        res.status(500).json({ error: 'Erro ao fazer login administrativo.' });
    }
});

// Rota protegida para dashboard administrativo
router.get('/admin/dashboard', authenticateToken, checkAdminRole, (req, res) => {
    res.sendFile('dashboard_admin.html', { root: 'public' });
});

// Rota para obter informações do usuário logado
router.get('/admin/user-info', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome_completo, email, imagem_perfil FROM Usuarios WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        res.status(200).json({ user });
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        res.status(500).json({ error: 'Erro ao obter informações do usuário.' });
    }
});

// Rota para obter todos os usuários com o nome da instituição
router.get('/admin/users', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.nome_completo, u.email, u.cpf, u.codigo_instituicao, u.whatsapp, u.init, u.cargo, i.nome AS nome_instituicao
            FROM Usuarios u
            LEFT JOIN instituicoes i ON u.codigo_instituicao = i.codigo_instituicao
        `);
        res.status(200).json({ users: result.rows });
    } catch (error) {
        console.error('Erro ao obter usuários:', error);
        res.status(500).json({ error: 'Erro ao obter usuários.' });
    }
});

// Rota para atualizar um usuário
router.put('/admin/users/:id', authenticateToken, checkAdminRole, async (req, res) => {
    const { id } = req.params;
    const { init, cargo } = req.body;

    try {
        await pool.query(
            'UPDATE Usuarios SET init = $1, cargo = $2 WHERE id = $3',
            [init, cargo, id]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});

// Rota para cadastrar nova instituição
router.post('/admin/instituicoes', authenticateToken, checkAdminRole, async (req, res) => {
    const { nome, segmento, codigo_uf, codigo_ibge } = req.body;
    const codigo_instituicao = generateRandomCode();

    console.log('Dados recebidos para cadastrar instituição:', { nome, segmento, codigo_uf, codigo_ibge, codigo_instituicao });

    try {
        const result = await pool.query(
            'INSERT INTO instituicoes (codigo_instituicao, nome, segmento, codigo_uf, codigo_ibge) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [codigo_instituicao, nome, segmento, codigo_uf, codigo_ibge]
        );
        console.log('Instituição cadastrada com sucesso:', result.rows[0]);
        res.status(201).json({ success: true, instituicao: result.rows[0] });
    } catch (error) {
        console.error('Erro ao cadastrar instituição:', error);
        res.status(500).json({ error: 'Erro ao cadastrar instituição.' });
    }
});

// Rota para obter todas as instituições
router.get('/admin/instituicoes', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM instituicoes');
        res.status(200).json({ instituicoes: result.rows });
    } catch (error) {
        console.error('Erro ao obter instituições:', error);
        res.status(500).json({ error: 'Erro ao obter instituições.' });
    }
});

// Rota para atualizar uma instituição
router.put('/admin/instituicoes/:id', authenticateToken, checkAdminRole, async (req, res) => {
    const { id } = req.params;
    const { nome, segmento, codigo_uf, codigo_ibge } = req.body;

    try {
        await pool.query(
            'UPDATE instituicoes SET nome = $1, segmento = $2, codigo_uf = $3, codigo_ibge = $4 WHERE codigo_instituicao = $5',
            [nome, segmento, codigo_uf, codigo_ibge, id]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar instituição:', error);
        res.status(500).json({ error: 'Erro ao atualizar instituição.' });
    }
});

// Rota para excluir uma instituição
router.delete('/admin/instituicoes/:id', authenticateToken, checkAdminRole, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM instituicoes WHERE codigo_instituicao = $1', [id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir instituição:', error);
        res.status(500).json({ error: 'Erro ao excluir instituição.' });
    }
});

// Rota para obter todos os estados
router.get('/admin/estados', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ibge_estados');
        res.status(200).json({ estados: result.rows });
    } catch (error) {
        console.error('Erro ao obter estados:', error);
        res.status(500).json({ error: 'Erro ao obter estados.' });
    }
});

// Rota para obter municípios por estado
router.get('/admin/municipios/:ufCode', authenticateToken, checkAdminRole, async (req, res) => {
    const { ufCode } = req.params;

    try {
        const result = await pool.query('SELECT * FROM ibge_municipios WHERE codigo_uf = $1', [ufCode]);
        res.status(200).json({ municipios: result.rows });
    } catch (error) {
        console.error('Erro ao obter municípios:', error);
        res.status(500).json({ error: 'Erro ao obter municípios.' });
    }
});

// Rota para excluir um usuário
router.delete('/admin/users/:id', authenticateToken, checkAdminRole, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM Usuarios WHERE id = $1', [id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
});


// Rota de logout
router.post('/admin/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout bem-sucedido.' });
});

module.exports = router;
