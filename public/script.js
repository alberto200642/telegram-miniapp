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

// Já paguei
document.getElementById("paidButton").addEventListener("click", async () => {
    // Aqui faria a verificação real na API ASAAS se a cobrança foi paga.
    const response = await fetch('/check-payment');
    const data = await response.json();

    if (data.paymentStatus === 'RECEIVED') {
        document.getElementById("pixSection").style.display = "none";
        document.getElementById("successMessage").style.display = "block";
    } else {
        alert("Pagamento ainda não confirmado. Tente novamente em instantes.");
    }
});
