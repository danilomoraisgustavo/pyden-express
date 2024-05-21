const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Faça login primeiro.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido.' });
        }

        req.user = user;
        next();
    });
};

const checkAdminRole = (req, res, next) => {
    if (req.user.cargo !== 'Admin') {
        return res.status(403).json({ error: 'Acesso negado. Você não tem permissão de administrador.' });
    }

    next();
};

module.exports = { authenticateToken, checkAdminRole };
