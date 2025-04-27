document.getElementById('btnStart').addEventListener('click', function() {
    // Quando o botão "Iniciar" for pressionado, envia a cobrança PIX para o Asaas
    fetch('/generate-pix')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('pixSection').style.display = 'block';
                document.getElementById('pixCode').textContent = data.pixCode; // Exibir o código PIX
            } else {
                alert('Erro ao gerar o PIX. Tente novamente.');
            }
        });
});

document.getElementById('paidButton').addEventListener('click', function() {
    // Quando o usuário clica em "Já paguei", verifica o pagamento
    fetch('/check-payment')
        .then(response => response.json())
        .then(data => {
            if (data.paymentStatus === 'RECEIVED') {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('pixSection').style.display = 'none';
            } else {
                alert('Pagamento ainda não confirmado. Tente novamente mais tarde.');
            }
        });
});
