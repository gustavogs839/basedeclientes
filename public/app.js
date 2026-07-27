const form = document.getElementById('cliente-form');
const idInput = document.getElementById('cliente-id');
const nomeInput = document.getElementById('nome');
const telefoneInput = document.getElementById('telefone');
const emailInput = document.getElementById('email');
const meioCaptacaoInput = document.getElementById('meio-captacao');
const formError = document.getElementById('form-error');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const lista = document.getElementById('lista');
const search = document.getElementById('search');

let clientes = [];

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = '';
}

function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'Novo cliente';
  submitBtn.textContent = 'Cadastrar';
  cancelBtn.hidden = true;
  clearError();
}

function whatsappLink(telefone) {
  let digits = String(telefone).replace(/\D/g, '');
  // Se não tem código de país (número BR com 10 ou 11 dígitos), assume Brasil (55)
  if (digits.length <= 11) {
    digits = '55' + digits;
  }
  return `https://wa.me/${digits}`;
}

function formatTelefone(telefone) {
  const d = String(telefone).replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

function render() {
  const termo = search.value.trim().toLowerCase();
  const filtrados = clientes.filter((c) => c.nome.toLowerCase().includes(termo));

  if (filtrados.length === 0) {
    lista.innerHTML = '<p class="empty">Nenhum cliente encontrado.</p>';
    return;
  }

  lista.innerHTML = filtrados
    .map(
      (c) => `
    <div class="cliente" data-id="${c.id}">
      <div class="cliente-info">
        <strong>${escapeHtml(c.nome)}</strong>
        <span>${formatTelefone(c.telefone)}${c.email ? ' · ' + escapeHtml(c.email) : ''}${c.meio_captacao ? ' · ' + escapeHtml(c.meio_captacao) : ''}</span>
      </div>
      <div class="cliente-actions">
        <a class="btn-whatsapp" href="${whatsappLink(c.telefone)}" target="_blank" rel="noopener">WhatsApp</a>
        <button class="btn-secondary" data-action="editar">Editar</button>
        <button class="btn-danger" data-action="excluir">Excluir</button>
      </div>
    </div>
  `
    )
    .join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function carregarClientes() {
  const res = await fetch('/api/clientes');
  clientes = await res.json();
  render();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    nome: nomeInput.value.trim(),
    telefone: telefoneInput.value.trim(),
    email: emailInput.value.trim() || null,
    meio_captacao: meioCaptacaoInput.value || null,
  };

  const id = idInput.value;
  const url = id ? `/api/clientes/${id}` : '/api/clientes';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    showError(data.error || 'Erro ao salvar cliente.');
    return;
  }

  resetForm();
  await carregarClientes();
});

cancelBtn.addEventListener('click', resetForm);

lista.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const card = e.target.closest('.cliente');
  const id = card.dataset.id;
  const cliente = clientes.find((c) => String(c.id) === id);

  if (btn.dataset.action === 'editar') {
    idInput.value = cliente.id;
    nomeInput.value = cliente.nome;
    telefoneInput.value = cliente.telefone;
    emailInput.value = cliente.email || '';
    meioCaptacaoInput.value = cliente.meio_captacao || '';
    formTitle.textContent = 'Editar cliente';
    submitBtn.textContent = 'Salvar alterações';
    cancelBtn.hidden = false;
    clearError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btn.dataset.action === 'excluir') {
    if (!confirm(`Excluir o cliente "${cliente.nome}"?`)) return;
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    await carregarClientes();
  }
});

search.addEventListener('input', render);

carregarClientes();
