const API_BASE = 'https://telegram-miniapp-vo9d.onrender.com';

window.onload = () => {
  const paymentId     = localStorage.getItem('paymentId');
  const paymentStatus = localStorage.getItem('paymentStatus');
  const pixCode       = localStorage.getItem('pixCode');
  const pixImage      = localStorage.getItem('pixImage');

  const startSection    = document.getElementById('startSection');
  const pixSection      = document.getElementById('pixSection');
  const successMessage  = document.getElementById('successMessage');
  const loading         = document.getElementById('loading');
  const paidButton      = document.getElementById('paidButton');
  const retryButton     = document.getElementById('retryButton');
  const resetButton   = document.getElementById('resetButton');
  
  // Limpar o Cache
  document.getElementById('resetButton').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
  });


  // Só exibe “Gerar novo PIX” se NÃO tiver recebido ainda
  if (paymentStatus !== 'RECEIVED') {
    resetButton.style.display = 'inline-block';
  } else {
    resetButton.style.display = 'none';
  }

  // 1) Se já confirmado, exibe sucesso
  if (paymentStatus === 'RECEIVED') {
    startSection.style.display   = 'none';
    pixSection.style.display     = 'none';
    successMessage.style.display = 'block';
    return;
  }

  // 2) Se gerou cobrança mas não confirmou
  if (paymentId) {
    startSection.style.display   = 'none';
    pixSection.style.display     = 'block';
    successMessage.style.display = 'none';
    loading.style.display        = 'none';    // não mostra spinner de cara
    paidButton.style.display     = 'inline-block';
    retryButton.style.display    = 'none';    // só mostra depois de tentar

    // preencher código e imagem se armazenados
    if (pixCode && pixImage) {
      document.getElementById('pixCode').innerText        = pixCode;
      document.getElementById('pixImage').src             = 'data:image/png;base64,' + pixImage;
    }
    return;
  }

  // 3) Primeiro acesso: exibe botão Iniciar
  startSection.style.display   = 'block';
  pixSection.style.display     = 'none';
  successMessage.style.display = 'none';
};

// Gera o PIX
document.getElementById('btnStart').addEventListener('click', async () => {
  document.getElementById('startSection').style.display = 'none';
  document.getElementById('pixSection').style.display   = 'block';

  const res = await fetch(`${API_BASE}/generate-pix`, { method: 'POST' });
  const data = await res.json();

  if (data.success) {
    document.getElementById('pixCode').innerText        = data.pixCode;
    document.getElementById('pixImage').src             = 'data:image/png;base64,' + data.pixImage;
    localStorage.setItem('paymentId', data.paymentId);
    localStorage.setItem('pixCode', data.pixCode);
    localStorage.setItem('pixImage', data.pixImage);
    localStorage.removeItem('paymentStatus');

    // mostra botão e esconde spinner/ retry
    document.getElementById('loading').style.display     = 'none';
    document.getElementById('paidButton').style.display  = 'inline-block';
    document.getElementById('retryButton').style.display = 'none';
  } else {
    alert('Erro ao gerar PIX, tente novamente.');
  }
});

// Copiar código
document.getElementById('copyButton').addEventListener('click', () => {
  const pixCode = document.getElementById('pixCode').innerText;
  if (!pixCode) return alert('Nenhum código para copiar.');
  navigator.clipboard.writeText(pixCode)
    .then(() => alert('Código PIX copiado!'))
    .catch(() => alert('Erro ao copiar código.'));
});

// Ação de “Já paguei”
document.getElementById('paidButton').addEventListener('click', () => {
  const paymentId = localStorage.getItem('paymentId');
  if (!paymentId) return alert('Nenhum pagamento gerado ainda.');

  // mostra spinner e botão de retry
  document.getElementById('loading').style.display     = 'block';
  document.getElementById('paidButton').style.display  = 'none';
  document.getElementById('retryButton').style.display = 'inline-block';
  checkPaymentStatus(paymentId);
});

// Ação “Verificar novamente”
document.getElementById('retryButton').addEventListener('click', () => {
  const paymentId = localStorage.getItem('paymentId');
  if (!paymentId) return alert('Nenhum pagamento gerado ainda.');

  document.getElementById('loading').style.display     = 'block';
  document.getElementById('retryButton').style.display = 'none';
  checkPaymentStatus(paymentId);
});

// Gerar novo PIX
document.getElementById('resetButton').addEventListener('click', () => {
  const paymentStatus = localStorage.getItem('paymentStatus');
  // Se já tiver recebido, não reverte nada — só exibe a tela de sucesso
  if (paymentStatus === 'RECEIVED') {
    alert('Pagamento já confirmado, você já tem acesso ao VIP!');
    return;
  }

  // Caso contrário, apagamos apenas o pixCode e pixImage
  localStorage.removeItem('pixCode');
  localStorage.removeItem('pixImage');
  
  // Opcional: também esconde spinner e mostra botão “Iniciar” de novo
  localStorage.removeItem('paymentId');
  location.reload();
});


// Função que chama o backend pra checar status
async function checkPaymentStatus(paymentId) {
  try {
    const res = await fetch(`${API_BASE}/check-payment/${paymentId}`);
    const data = await res.json();

    if (data.paymentStatus === 'RECEIVED') {
      localStorage.setItem('paymentStatus', 'RECEIVED');
      document.getElementById('pixSection').style.display     = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } else {
      // mantém spinner e permite retry
      document.getElementById('retryButton').style.display = 'inline-block';
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao verificar pagamento. Tente novamente.');
    document.getElementById('retryButton').style.display = 'inline-block';
  }
}
