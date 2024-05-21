const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://nsqyeoud:Q_eD39c2Fzez5CtroaDNZqJ7xLvapGjt@isabelle.db.elephantsql.com/nsqyeoud',
});

module.exports = pool;
