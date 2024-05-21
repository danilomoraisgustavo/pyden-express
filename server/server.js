require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));

// Rotas
app.use('/api', userRoutes);
app.use('/api', adminRoutes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
