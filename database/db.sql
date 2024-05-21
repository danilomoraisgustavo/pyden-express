CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    codigo_instituicao INT NOT NULL,
    whatsapp VARCHAR(15) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    imagem_perfil VARCHAR(255),
    cargo VARCHAR(50) CHECK (cargo IN ('Admin', 'Gestor de Setor', 'Fiscal de Rota', 'Agente Administrativo', 'Visitante')) DEFAULT 'Visitante',
    init BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ibge_estados (
    codigo_uf INT NOT NULL,
    uf VARCHAR(2) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (codigo_uf)
);

CREATE TABLE ibge_municipios (
    codigo_ibge INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    latitude FLOAT(8) NOT NULL,
    longitude FLOAT(8) NOT NULL,
    capital BOOLEAN NOT NULL,
    codigo_uf INT NOT NULL,
    PRIMARY KEY (codigo_ibge),
    FOREIGN KEY (codigo_uf) REFERENCES ibge_estados (codigo_uf)
);

CREATE TABLE instituicoes (
    codigo_instituicao INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    segmento VARCHAR(20) CHECK (segmento IN ('Privado', 'Publico')) NOT NULL,
    codigo_uf INT,
    codigo_ibge INT,
    PRIMARY KEY (codigo_instituicao),
    FOREIGN KEY (codigo_uf) REFERENCES ibge_estados (codigo_uf),
    FOREIGN KEY (codigo_ibge) REFERENCES ibge_municipios (codigo_ibge)
);
