const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/generate-pix', async (req, res) => {
    // Chamada para gerar a cobrança PIX via API do Asaas
    const response = await fetch('https://www.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'access_token': 'SEU_TOKEN_ASAAS' // Coloque o token da sua conta Asaas
        },
        body: JSON.stringify({
            billingType: 'PIX',
            customer: 'ID_DO_CLIENTE', // Adicione o ID do cliente
            value: 9.90,
            dueDate: '2025-05-01',
            description: 'Cobrança Conteúdo VIP',
            externalReference: 'ID_EXTERNO'
        })
    });

    const data = await response.json();
    if (data.id) {
        const pixResponse = await fetch(`https://www.asaas.com/api/v3/payments/${data.id}/pixQrCode`, {
            headers: { 'access_token': 'SEU_TOKEN_ASAAS' }
        });

        const pixData = await pixResponse.json();
        if (pixData.payload) {
            res.json({ success: true, pixCode: pixData.payload });
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

app.get('/check-payment', async (req, res) => {
    // Verifica o status de pagamento
    const paymentStatus = 'RECEIVED'; // Aqui você vai implementar a verificação com a API do Asaas
    res.json({ paymentStatus });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
