const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

document.getElementById('btnStart').addEventListener('click', function() {
    fetch(`${API_BASE}/generate-pix`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('pixSection').style.display = 'block';
                document.getElementById('pixCode').textContent = data.pixCode;
            } else {
                alert('Erro ao gerar o PIX. Tente novamente.');
            }
        });
});

document.getElementById('paidButton').addEventListener('click', function() {
    fetch(`${API_BASE}/check-payment`)
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
