const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

window.onload = () => {
    const paymentId = localStorage.getItem('paymentId');
    const paymentStatus = localStorage.getItem('paymentStatus');

    const startSection = document.getElementById('startSection');
    const pixSection = document.getElementById('pixSection');
    const successMessage = document.getElementById('successMessage');
    const loading = document.getElementById('loading');

    if (!startSection || !pixSection || !successMessage || !loading) {
        console.error('Elementos da interface não encontrados.');
        return;
    }

    console.log('paymentStatus:', paymentStatus);
    console.log('paymentId:', paymentId);

    if (paymentStatus === 'RECEIVED') {
        // Se já confirmou pagamento
        startSection.style.display = 'none';
        pixSection.style.display = 'none';
        successMessage.style.display = 'block';

    } else if (paymentId) {
        // Se tem cobrança gerada, mas ainda não pagou
        startSection.style.display = 'none';
        pixSection.style.display = 'block';
        loading.style.display = 'none'; // Não exibe o loading ainda

        // Recupera o PIX gerado anteriormente
        fetch(`${API_BASE}/get-payment-data/${paymentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('pixCode').innerText = data.pixCode;
                    document.getElementById('pixImage').src = 'data:image/png;base64,' + data.pixImage;
                } else {
                    console.warn('Falha ao buscar dados do pagamento.');
                }
            })
            .catch(err => console.error('Erro ao recuperar dados do PIX:', err));

    } else {
        // Primeiro acesso
        startSection.style.display = 'block';
        pixSection.style.display = 'none';
        successMessage.style.display = 'none';
        loading.style.display = 'none';
    }
};


document.getElementById('btnStart').addEventListener('click', async () => {
    document.getElementById('startSection').style.display = 'none';
    document.getElementById('pixSection').style.display = 'block';

    const response = await fetch(`${API_BASE}/generate-pix`, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
        document.getElementById('pixCode').innerText = data.pixCode;
        document.getElementById('pixImage').src = 'data:image/png;base64,' + data.pixImage;
        localStorage.setItem('paymentId', data.paymentId);
    } else {
        alert('Erro ao gerar PIX, tente novamente.');
    }
});

document.getElementById('copyButton').addEventListener('click', () => {
    const pixCode = document.getElementById('pixCode').innerText;
    navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado!');
    }).catch(() => {
        alert('Erro ao copiar código.');
    });
});

document.getElementById('paidButton').addEventListener('click', () => {
    const paymentId = localStorage.getItem('paymentId');

    if (!paymentId) {
        alert('Nenhum pagamento gerado ainda.');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    checkPaymentStatus(paymentId);
});


async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`${API_BASE}/check-payment/${paymentId}`);
        const data = await response.json();

        if (data.paymentStatus === 'RECEIVED') {
            localStorage.setItem('paymentStatus', 'RECEIVED');
            document.getElementById('pixSection').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            // Continua aguardando, tenta novamente em 10 segundos
            setTimeout(() => checkPaymentStatus(paymentId), 10000);
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        alert('Erro ao verificar pagamento, tente novamente em instantes.');
    }
}
