const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Permitir acesso às imagens

// Configurando multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // pasta onde salvará as imagens
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});
const upload = multer({ storage: storage });

let contatos = [];
let proximoId = 1;

// Adicionar contato com foto
app.post('/contato', upload.single('foto'), (req, res) => {
    const { Nome, Telefone, Email, Parentesco, Empresa, Cargo, Aniversario } = req.body;

    if (!Nome || !Telefone || !Email || !Parentesco) {
        return res.status(400).json({ mensagem: 'Erro: Nome, Telefone, Email e Parentesco são obrigatórios.' });
    }

    const foto = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : '';

    const novoContato = {
        id: proximoId++,
        Nome,
        Telefone,
        Email,
        Parentesco,
        Empresa,
        Cargo,
        Aniversario,
        Foto: foto
    };

    contatos.push(novoContato);
    res.status(201).json({ mensagem: "Contato adicionado com sucesso", contato: novoContato });
});

// Listar contatos
app.get('/contatos', (req, res) => {
    res.json(contatos);
});

// Deletar todos os contatos
app.delete('/contatos', (req, res) => {
    contatos = [];
    res.status(200).json({ mensagem: 'Todos os contatos foram apagados' });
});

// Atualizar contato
app.put('/contatos/:id', upload.single('foto'), (req, res) => {
    const id = parseInt(req.params.id);
    const index = contatos.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Contato não encontrado' });
    }

    const { Nome, Telefone, Email, Parentesco, Empresa, Cargo, Aniversario } = req.body;
    const foto = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : contatos[index].Foto;

    contatos[index] = {
        ...contatos[index],
        Nome,
        Telefone,
        Email,
        Parentesco,
        Empresa,
        Cargo,
        Aniversario,
        Foto: foto
    };

    res.json({ mensagem: 'Contato atualizado com sucesso', contato: contatos[index] });
});

// Deletar contato específico
app.delete('/contato/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = contatos.findIndex(c => c.id === id);

    if (index !== -1) {
        contatos.splice(index, 1);
        res.status(200).json({ mensagem: 'Contato excluído com sucesso' });
    } else {
        res.status(404).json({ mensagem: 'Contato não encontrado' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
