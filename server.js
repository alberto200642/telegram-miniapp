const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const ASAAS_TOKEN = process.env.ASAAS_TOKEN;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(express.static('public'));
app.use(express.json());

// 🔐 Coloque seu token ASAAS real aqui
// const ASAAS_TOKEN = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmYwYTQ0MWRkLWRhNmQtNGM1Ni05ZmIzLTQwNWU1NjRiNGJlYjo6JGFhY2hfMWI0MDg3ZDItZWY1Yi00YmFmLTg0MjktN2FhZjk0OTc5ZDI3';

if (!ASAAS_TOKEN) {
    console.error('⚠️ Token ASAAS não configurado corretamente.');
}

// 🔥 Rota para gerar o PIX
app.post('/generate-pix', async (req, res) => {
    try {
        // 📌 Cria cliente
        const clienteResponse = await fetch('https://www.asaas.com/api/v3/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': ASAAS_TOKEN
            },
            body: JSON.stringify({
                name: 'Cliente VIP',
                cpfCnpj: '14541692813',
                email: 'cliente@example.com',
                phone: '16997874674'
            })
        });

        const clienteText = await clienteResponse.text();
        console.log('🔍 Resposta cliente:', clienteText);

        if (!clienteResponse.ok) {
            console.error('❌ Erro ao criar cliente:', clienteResponse.status, clienteText);
            return res.status(500).json({ success: false, message: 'Erro ao criar cliente' });
        }

        const clienteData = JSON.parse(clienteText);

        // 📌 Calcula data de vencimento (amanhã)
        const hoje = new Date();
        hoje.setDate(hoje.getDate() + 1);
        const dueDate = hoje.toISOString().split('T')[0];


        // 📌 Cria cobrança PIX
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
                dueDate: dueDate,
                description: 'Cobrança Conteúdo VIP',
                externalReference: 'ID_EXTERNO'
            })
        });

        const cobrancaText = await cobrancaResponse.text();
        console.log('🔍 Resposta cobrança:', cobrancaText);

        if (!cobrancaResponse.ok) {
            console.error('❌ Erro ao gerar cobrança:', cobrancaResponse.status, cobrancaText);
            return res.status(500).json({ success: false, message: 'Erro ao gerar cobrança' });
        }

        const cobrancaData = JSON.parse(cobrancaText);

        // 📌 Busca QR Code PIX
        const pixResponse = await fetch(`https://api.asaas.com/v3/payments/${cobrancaData.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_TOKEN }
        });

        const pixText = await pixResponse.text();
        console.log('🔍 Resposta PIX:', pixText);

        if (!pixResponse.ok) {
            console.error('❌ Erro ao buscar QR Code:', pixResponse.status, pixText);
            return res.status(500).json({ success: false, message: 'Erro ao gerar QR Code' });
        }

        const pixData = JSON.parse(pixText);

        if (pixData.payload) {
            res.json({ 
                success: true, 
                pixCode: pixData.payload,
                pixImage: pixData.encodedImage, // 👈 aqui pega a imagem base64 do Asaas
                paymentId: cobrancaData.id
            });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao gerar QR Code' });
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar o pix, tente novamente.' });
    }
});

// 📌 Rota de verificação de pagamento
app.get('/check-payment/:id', async (req, res) => {
    const paymentId = req.params.id;

    try {
        const statusResponse = await fetch(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': ASAAS_TOKEN
            }
        });

        const statusText = await statusResponse.text();
        console.log('🔍 Status cobrança:', statusText);

        if (!statusResponse.ok) {
            return res.status(500).json({ success: false, message: 'Erro ao consultar status' });
        }

        const statusData = JSON.parse(statusText);
        res.json({ paymentStatus: statusData.status });
    } catch (error) {
        console.error('❌ Erro ao consultar status:', error);
        res.status(500).json({ success: false, message: 'Erro ao consultar status' });
    }
});

// 📌 Rota de healthcheck
app.get('/healthcheck', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
