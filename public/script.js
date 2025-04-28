const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

document.getElementById("btnStart").addEventListener("click", async () => {
    document.getElementById("startSection").style.display = "none";
    const pixSection = document.getElementById("pixSection");
    pixSection.style.display = "block";

    // Chamar a API para gerar o PIX
    const response = await fetch('/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    const data = await response.json();

    if (data.success) {
        document.getElementById("pixCode").textContent = data.pixCode;
        document.getElementById("pixQrCode").src = `data:image/png;base64,${data.pixImage}`;
        // Salvar o paymentId
        localStorage.setItem('paymentId', data.paymentId);
    } else {
        alert("Erro ao gerar PIX. Tente novamente.");
    }
});

// Copiar PIX
document.getElementById("copyButton").addEventListener("click", () => {
    const pixCode = document.getElementById("pixCode").textContent;
    navigator.clipboard.writeText(pixCode)
        .then(() => alert("Código PIX copiado!"))
        .catch(() => alert("Erro ao copiar."));
});

// Verificar pagamento
document.getElementById("paidButton").addEventListener("click", async () => {
    const paymentId = localStorage.getItem('paymentId');
    if (!paymentId) {
        alert("Não foi possível localizar sua cobrança. Por favor, gere o PIX novamente.");
        return;
    }
    const response = await fetch(`/check-payment/${paymentId}`);
    const data = await response.json();

    if (data.paymentStatus === 'RECEIVED') {
        document.getElementById("pixSection").style.display = "none";
        document.getElementById("successMessage").style.display = "block";
    } else {
        alert("Pagamento ainda não confirmado. Tente novamente em instantes.");
    }
});
