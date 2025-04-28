const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

document.getElementById("btnStart").addEventListener("click", async () => {
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
        // Exibir código PIX
        document.getElementById("pixCode").textContent = data.pixCode;

        // Gerar QR Code usando API pública ou o seu backend (por enquanto via qrserver)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.pixCode)}&size=300x300`;
        document.getElementById("pixQrCode").src = qrCodeUrl;
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
document.getElementById("paidButton").addEventListener("click", () => {
    document.getElementById("pixSection").style.display = "none";
    document.getElementById("successMessage").style.display = "block";
});
