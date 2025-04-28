const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

document.getElementById('btnStart').addEventListener('click', async () => {
    document.getElementById('startSection').style.display = 'none';
    document.getElementById('pixSection').style.display = 'block';

    const response = await fetch('/generate-pix', { method: 'POST' });
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

document.getElementById('paidButton').addEventListener('click', async () => {
    const paymentId = localStorage.getItem('paymentId');

    if (!paymentId) {
        alert('Nenhum pagamento gerado ainda.');
        return;
    }

    const response = await fetch(`/check-payment/${paymentId}`);
    const data = await response.json();

    if (data.paymentStatus === 'RECEIVED') {
        document.getElementById('pixSection').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
    } else {
        alert('Pagamento ainda não identificado. Tente novamente em instantes.');
    }
});
