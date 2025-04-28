const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Importando fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(express.static('public'));
app.use(express.json()); // Importante para aceitar JSON no corpo das requests

// Substitua pelo seu token Asaas real
const ASAAS_TOKEN = "$aact_prod_000MzkwODA2MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk3ZDAyM2ViLTY0ODgtNDAzYi04YTljLWVjZWQ3ZTk0YTEzZDo6JGFhY2hfYzVmY2I0NmEtMGI0NS00ODUyLWIxNTctNmQxYjE3MzZmYmFm";

// Rota para gerar o PIX
app.post('/generate-pix', async (req, res) => {
    try {
        // 1️⃣ Cria um cliente no Asaas
        const clienteResponse = await fetch('https://www.asaas.com/api/v3/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': ASAAS_TOKEN
            },
            body: JSON.stringify({
                name: 'Cliente VIP',
                cpfCnpj: '00000000000', // ou CNPJ válido se quiser
                email: 'cliente@example.com',
                phone: '47999999999'
            })
        });

        const clienteData = await clienteResponse.json();

        if (!clienteData.id) {
            return res.status(500).json({ success: false, message: 'Erro ao criar cliente' });
        }

        // 2️⃣ Cria a cobrança PIX pro cliente criado
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
            return res.status(500).json({ success: false, message: 'Erro ao gerar cobrança' });
        }

        // 3️⃣ Busca o QR Code PIX
        const pixResponse = await fetch(`https://www.asaas.com/api/v3/payments/${cobrancaData.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_TOKEN }
        });

        const pixData = await pixResponse.json();

        if (pixData.payload) {
            // Envia o QR Code PIX para o front-end
            res.json({ success: true, pixCode: pixData.payload });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao gerar QR Code' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao gerar o pix, tente novamente.' });
    }
});

// Rota fictícia para checar pagamento (simulação)
app.get('/check-payment', async (req, res) => {
    const paymentStatus = 'RECEIVED';
    res.json({ paymentStatus });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
