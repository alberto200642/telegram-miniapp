const express = require('express');
const fetch = require('node-fetch');  // Confirma que você instalou: npm install node-fetch
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/generate-pix', async (req, res) => {
    try {
        const response = await fetch('https://www.asaas.com/api/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'access_token': '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk3ZDAyM2ViLTY0ODgtNDAzYi04YTljLWVjZWQ3ZTk0YTEzZDo6JGFhY2hfYzVmY2I0NmEtMGI0NS00ODUyLWIxNTctNmQxYjE3MzZmYmFm'
            },
            body: JSON.stringify({
                billingType: 'PIX',
                customer: 'ID_DO_CLIENTE',
                value: 9.90,
                dueDate: '2025-05-01',
                description: 'Cobrança Conteúdo VIP',
                externalReference: 'ID_EXTERNO'
            })
        });

        const text = await response.text();
        console.log('Resposta da criação:', text);

        if (!response.ok) {
            return res.status(response.status).send('Erro na requisição: ' + text);
        }

        const data = JSON.parse(text);

        if (data.id) {
            const pixResponse = await fetch(`https://www.asaas.com/api/v3/payments/${data.id}/pixQrCode`, {
                headers: { 'access_token': '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk3ZDAyM2ViLTY0ODgtNDAzYi04YTljLWVjZWQ3ZTk0YTEzZDo6JGFhY2hfYzVmY2I0NmEtMGI0NS00ODUyLWIxNTctNmQxYjE3MzZmYmFm' }
            });

            const pixText = await pixResponse.text();
            console.log('Resposta do QR Code:', pixText);

            if (!pixResponse.ok) {
                return res.status(pixResponse.status).send('Erro ao buscar QR Code: ' + pixText);
            }

            const pixData = JSON.parse(pixText);

            if (pixData.payload) {
                res.json({ success: true, pixCode: pixData.payload });
            } else {
                res.json({ success: false, message: 'QR Code não encontrado' });
            }
        } else {
            res.json({ success: false, message: 'Cobrança não criada' });
        }
    } catch (error) {
        console.error('Erro geral:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

app.get('/check-payment', async (req, res) => {
    const paymentStatus = 'RECEIVED';
    res.json({ paymentStatus });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
