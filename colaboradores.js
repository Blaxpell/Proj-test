// Função para mostrar formulário para novo colaborador
function mostrarFormularioColaborador() {
  document.getElementById('form-colaborador').style.display = 'block';
  document.getElementById('form-colab-title').textContent = 'Novo Colaborador';
  document.getElementById('colab-nome').value = '';
  document.getElementById('colab-username').value = '';
  document.getElementById('colab-password').value = '';
  document.getElementById('colab-edit-id').value = '';
}

// Função para cancelar formulário colaborador
function cancelarFormularioColaborador() {
  document.getElementById('form-colaborador').style.display = 'none';
  document.getElementById('colab-nome').value = '';
  document.getElementById('colab-username').value = '';
  document.getElementById('colab-password').value = '';
  document.getElementById('colab-edit-id').value = '';
}

// Função para salvar colaborador (novo ou edição)
async function salvarColaborador() {
  const nome = document.getElementById('colab-nome').value.trim();
  const username = document.getElementById('colab-username').value.trim();
  const password = document.getElementById('colab-password').value;
  const editId = document.getElementById('colab-edit-id').value;

  if (!nome || !username || (!password && !editId)) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  // Hash da senha
  const senhaHash = password ? CryptoJS.SHA256(password).toString() : null;

  try {
    // Verifica se já existe usuário com esse username (quando for novo)
    if (!editId) {
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: { Authorization: UPSTASH_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(['GET', `usuario:${username}`])
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          alert('Usuário já existe com este login.');
          return;
        }
      }
    }

    const userObj = {
      id: editId || username,
      username: username,
      name: nome,
      role: 'colaborador',
      password: senhaHash,
      firstLogin: true,
      createdAt: new Date().toISOString(),
      active: true
    };

    await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: { Authorization: UPSTASH_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', `usuario:${username}`, JSON.stringify(userObj)])
    });

    alert('Colaborador salvo com sucesso!');
    cancelarFormularioColaborador();
    carregarColaboradores();
  } catch (e) {
    console.error('Erro ao salvar colaborador:', e);
    alert('Erro ao salvar colaborador.');
  }
}

// Função para carregar e renderizar lista de colaboradores
async function carregarColaboradores() {
  try {
    const keysRes = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: { Authorization: UPSTASH_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(['KEYS', 'usuario:*'])
    });

    const listaDiv = document.getElementById('lista-colaboradores');
    listaDiv.innerHTML = '';

    if (!keysRes.ok) return;

    const keysData = await keysRes.json();
    const usuarios = [];

    for (const key of keysData.result) {
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: { Authorization: UPSTASH_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(['GET', key])
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const user = JSON.parse(data.result);
          if (user.role === 'colaborador') usuarios.push(user);
        }
      }
    }

    if (usuarios.length === 0) {
      listaDiv.innerHTML = '<p class="text-white">Nenhum colaborador cadastrado.</p>';
      return;
    }

    usuarios.forEach(user => {
      const userCard = document.createElement('div');
      userCard.className = 'user-card';

      userCard.innerHTML = `
        <div>
          <strong>${user.name}</strong> (${user.username})
        </div>
        <button class="btn-delete-user" onclick="deletarColaborador('${user.username}')">Excluir</button>
      `;

      listaDiv.appendChild(userCard);
    });

  } catch (e) {
    console.error('Erro ao carregar colaboradores:', e);
  }
}

// Função para deletar colaborador
async function deletarColaborador(username) {
  if (!confirm('Deseja realmente excluir este colaborador?')) return;
  try {
    const res = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: { Authorization: UPSTASH_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(['DEL', `usuario:${username}`])
    });
    if (res.ok) {
      alert('Colaborador excluído com sucesso!');
      carregarColaboradores();
    } else {
      alert('Erro ao excluir colaborador.');
    }
  } catch (e) {
    console.error('Erro ao excluir colaborador:', e);
    alert('Erro ao excluir colaborador.');
  }
}

// Ajuste da função showTab para chamar carregarColaboradores quando for aba colaboradores
function showTab(tab) {
  // Oculta todos os conteúdos
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

  // Remove classes ativas dos botões
  document.querySelectorAll('[id^="tab-"]').forEach(btn => {
    btn.className = 'px-6 py-3 rounded-lg font-semibold transition-all text-white text-opacity-70 hover:text-opacity-100';
  });

  // Mostra conteúdo e ativa botão
  document.getElementById(`content-${tab}`).style.display = 'block';
  const activeBtn = document.getElementById(`tab-${tab}`);

  if (tab === 'pendentes') {
    activeBtn.className = 'px-6 py-3 rounded-lg font-semibold transition-all bg-yellow-500 bg-opacity-30 text-white';
  } else if (tab === 'orcamentos') {
    activeBtn.className = 'px-6 py-3 rounded-lg font-semibold transition-all bg-purple-500 bg-opacity-30 text-white';
  } else if (tab === 'pagamentos') {
    activeBtn.className = 'px-6 py-3 rounded-lg font-semibold transition-all bg-blue-500 bg-opacity-30 text-white';
  } else if (tab === 'colaboradores') {
    activeBtn.className = 'px-6 py-3 rounded-lg font-semibold transition-all bg-purple-500 bg-opacity-30 text-white';
    carregarColaboradores();
  }
}

// Iniciar aba pendentes por padrão (ou a que preferir)
document.addEventListener('DOMContentLoaded', () => {
  inicializarSistema();
  showTab('pendentes');
});
