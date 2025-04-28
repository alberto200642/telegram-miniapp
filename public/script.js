const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

document.getElementById('btnStart').addEventListener('click', function() {
    // Quando o botão "Iniciar" for pressionado, envia a cobrança PIX para o Asaas
    fetch('https://telegram-miniapp-vo9d.onrender.com/generate-pix', {
        method: 'GET' // Garantir que seja POST
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('pixSection').style.display = 'block';
            document.getElementById('pixCode').textContent = data.pixCode; // Exibir o código PIX
        } else {
            alert('Erro ao gerar o PIX. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro ao chamar a API de cobrança:', error);
        alert('Erro ao chamar a API de cobrança. Tente novamente mais tarde.');
    });
});

document.getElementById('paidButton').addEventListener('click', function() {
    // Quando o usuário clica em "Já paguei", verifica o pagamento
    fetch('/check-payment', {
        method: 'GET' // A requisição de verificação é GET
    })
    .then(response => response.json())
    .then(data => {
        if (data.paymentStatus === 'RECEIVED') {
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('pixSection').style.display = 'none';
        } else {
            alert('Pagamento ainda não confirmado. Tente novamente mais tarde.');
        }
    })
    .catch(error => {
        console.error('Erro ao verificar o pagamento:', error);
        alert('Erro ao verificar o pagamento. Tente novamente mais tarde.');
    });
});

