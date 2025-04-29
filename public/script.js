const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

window.onload = () => {
    const paymentId = localStorage.getItem('paymentId');
    const paymentStatus = localStorage.getItem('paymentStatus');

    const startSection = document.getElementById('startSection');
    const pixSection = document.getElementById('pixSection');
    const successMessage = document.getElementById('successMessage');
    const loading = document.getElementById('loading');
    const paidButton = document.getElementById('paidButton');

    // Se o pagamento já foi confirmado
    if (paymentStatus === 'RECEIVED') {
        startSection.style.display = 'none';
        pixSection.style.display = 'none';
        successMessage.style.display = 'block';
    }
    // Se já gerou cobrança mas não confirmou ainda
    else if (paymentId) {
        startSection.style.display = 'none';
        pixSection.style.display = 'block';
        loading.style.display = 'block';
        paidButton.style.display = 'none'; // Ocultar o botão "Já paguei"
        checkPaymentStatus(paymentId);
    }
    // Primeiro acesso (sem pagamento gerado)
    else {
        startSection.style.display = 'block';
        pixSection.style.display = 'none';
        successMessage.style.display = 'none';
        loading.style.display = 'none'; // Ocultar o spinner, se estiver visível
    }
};

// Iniciar o processo de pagamento
document.getElementById('btnStart').addEventListener('click', async () => {
    document.getElementById('startSection').style.display = 'none';
    document.getElementById('pixSection').style.display = 'block';

    const response = await fetch(`${API_BASE}/generate-pix`, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
        document.getElementById('pixCode').innerText = data.pixCode;
        document.getElementById('pixImage').src = 'data:image/png;base64,' + data.pixImage;
        localStorage.setItem('paymentId', data.paymentId);
        localStorage.removeItem('paymentStatus'); // Limpar o status anterior
    } else {
        alert('Erro ao gerar PIX, tente novamente.');
    }
});

// Copiar o código PIX
document.getElementById('copyButton').addEventListener('click', () => {
    const pixCode = document.getElementById('pixCode').innerText;
    navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado!');
    }).catch(() => {
        alert('Erro ao copiar código.');
    });
});

// Confirmar pagamento
document.getElementById('paidButton').addEventListener('click', () => {
    const paymentId = localStorage.getItem('paymentId');

    if (!paymentId) {
        alert('Nenhum pagamento gerado ainda.');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    checkPaymentStatus(paymentId);
});

// Função para verificar o status do pagamento
async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`${API_BASE}/check-payment/${paymentId}`);
        const data = await response.json();

        if (data.paymentStatus === 'RECEIVED') {
            localStorage.setItem('paymentStatus', 'RECEIVED');
            document.getElementById('pixSection').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            // Continua aguardando, tenta de novo em 10 segundos
            setTimeout(() => checkPaymentStatus(paymentId), 10000);
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        alert('Erro ao verificar pagamento, tente novamente em instantes.');
    }
}
