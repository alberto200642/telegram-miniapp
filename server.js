const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(express.static('public'));
app.use(express.json());

// 🔐 Carrega variáveis de ambiente
const ASAAS_TOKEN = process.env.ASAAS_TOKEN;
const ASAAS_API_BASE = process.env.ASAAS_API_BASE;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!ASAAS_TOKEN || !ASAAS_API_BASE || !BOT_TOKEN) {
    console.error('⚠️ Variáveis de ambiente não configuradas corretamente.');
    process.exit(1);
}

// 📌 Rota para gerar o PIX
app.post('/generate-pix', async (req, res) => {
    try {
        const clienteResponse = await fetch(`${ASAAS_API_BASE}/customers`, {
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

        const cobrancaResponse = await fetch(`${ASAAS_API_BASE}/payments`, {
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

        const cobrancaText = await cobrancaResponse.text();
        console.log('🔍 Resposta cobrança:', cobrancaText);

        if (!cobrancaResponse.ok) {
            console.error('❌ Erro ao gerar cobrança:', cobrancaResponse.status, cobrancaText);
            return res.status(500).json({ success: false, message: 'Erro ao gerar cobrança' });
        }

        const cobrancaData = JSON.parse(cobrancaText);

        const pixResponse = await fetch(`${ASAAS_API_BASE}/payments/${cobrancaData.id}/pixQrCode`, {
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
                pixImage: pixData.encodedImage,
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
        const statusResponse = await fetch(`${ASAAS_API_BASE}/payments/${paymentId}`, {
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

// 📌 Rota de webhook do Telegram
app.post('/webhook', (req, res) => {
    console.log('📨 Webhook recebido:', req.body);
    res.sendStatus(200);

    const message = req.body.message;

    if (message && message.text === '/start') {
        const chatId = message.chat.id;

        const reply = {
            method: 'sendMessage',
            chat_id: chatId,
            text: '🚀 Bem-vindo! Clique abaixo para abrir o Mini App:',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Iniciar',
                            web_app: {
                                url: 'https://telegram-miniapp-vo9d.onrender.com'  // <-- substitua aqui pelo seu domínio render
                            }
                        }
                    ]
                ]
            }
        };

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reply)
        })
        .then(res => res.json())
        .then(data => console.log('📨 Mensagem enviada:', data))
        .catch(err => console.error('❌ Erro ao enviar mensagem:', err));
    }
});

// 📌 Rota de healthcheck
app.get('/healthcheck', (req, res) => {
    res.json({ status: 'ok' });
});

// 🚀 Inicia o servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
