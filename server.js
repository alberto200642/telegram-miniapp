const express = require('express');
const fetch = require('node-fetch'); // Se ainda não adicionou
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const ASAAS_TOKEN = 'SEU_TOKEN_ASAAS'; // Coloca teu token de API aqui

app.get('/generate-pix', async (req, res) => {
    try {
        // 1️⃣ Cria o cliente
        const clienteResponse = await fetch('https://www.asaas.com/api/v3/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': ASAAS_TOKEN
            },
            body: JSON.stringify({
                name: 'Cliente VIP',
                cpfCnpj: '00000000000', // Pode ser fictício, mas precisa de um valor válido (11 ou 14 dígitos)
                email: 'cliente@example.com',
                phone: '47999999999'
            })
        });

        const clienteData = await clienteResponse.json();

        if (!clienteData.id) {
            return res.json({ success: false, message: 'Erro ao criar cliente', details: clienteData });
        }

        // 2️⃣ Gera a cobrança PIX
        const cobrancaResponse = await fetch('https://www.asaas.com/api/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': ASAAS_TOKEN
            },
            body: JSON.stringify({
                billingType: 'PIX',
                customer: clienteData.id,
                value: 9.90,
                dueDate: '2025-05-01',
                description: 'Cobrança Conteúdo VIP',
                externalReference: 'ID_EXTERNO'
            })
        });

        const cobrancaData = await cobrancaResponse.json();

        if (!cobrancaData.id) {
            return res.json({ success: false, message: 'Erro ao gerar cobrança', details: cobrancaData });
        }

        // 3️⃣ Busca o QR Code PIX
        const pixResponse = await fetch(`https://www.asaas.com/api/v3/payments/${cobrancaData.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_TOKEN }
        });

        const pixData = await pixResponse.json();

        if (pixData.payload) {
            res.json({ success: true, pixCode: pixData.payload });
        } else {
            res.json({ success: false, message: 'Erro ao gerar QR Code', details: pixData });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro no servidor', error });
    }
});

app.get('/check-payment', async (req, res) => {
    // Exemplo básico de retorno fixo
    const paymentStatus = 'RECEIVED';
    res.json({ paymentStatus });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
