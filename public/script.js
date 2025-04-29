const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

// Verificação automática ao carregar a página
window.onload = () => {
    const paymentId = localStorage.getItem('paymentId');
    if (paymentId) {
        // Se houver um paymentId salvo, verifica o status automaticamente
        document.getElementById('pixSection').style.display = 'block';
        document.getElementById('loading').style.display = 'block';
        checkPaymentStatus(paymentId);
    }
};

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

document.getElementById('paidButton').addEventListener('click', () => {
    const paymentId = localStorage.getItem('paymentId');

    if (!paymentId) {
        alert('Nenhum pagamento gerado ainda.');
        return;
    }

    // Mostra o spinner e oculta o botão de pagamento
    document.getElementById('paidButton').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    // Função para verificar o pagamento
    checkPaymentStatus(paymentId);
});

// Função para consultar o status do pagamento
function checkPaymentStatus(paymentId) {
    fetch(`/check-payment/${paymentId}`)
        .then(response => response.json())
        .then(data => {
            if (data.paymentStatus === 'RECEIVED') {
                document.getElementById('pixSection').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
            } else {
                // Continua verificando a cada 10 segundos
                setTimeout(() => checkPaymentStatus(paymentId), 10000);
            }
        })
        .catch(err => {
            console.error('Erro ao verificar status:', err);
            setTimeout(() => checkPaymentStatus(paymentId), 10000);
        });
}
