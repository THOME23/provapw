/**
 * Função para buscar endereço via API ViaCEP
 * @param {string} cep - CEP a ser consultado
 */
async function buscarEndereco(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    const enderecoFormatado = `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.replace(/, ,/g, '').trim();
    document.getElementById("endereco").value = enderecoFormatado;
    return enderecoFormatado;
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    alert('CEP não encontrado ou erro na consulta');
    return null;
  }
}

/**
 * Carrega e exibe a lista de voluntários
 */
function carregarVoluntarios() {
  const container = document.getElementById("listaVoluntarios");
  const filtro = document.getElementById("filtro").value.toLowerCase();
  const voluntarios = obterVoluntarios();
  
  container.innerHTML = voluntarios
    .filter(v => v.nome.toLowerCase().includes(filtro) || 
                 v.email.toLowerCase().includes(filtro) ||
                 (v.endereco && v.endereco.toLowerCase().includes(filtro)))
    .map((v, index) => criarCardVoluntario(v, index))
    .join('');
}

/**
 * Cria o HTML para um card de voluntário
 * @param {Object} voluntario - Dados do voluntário
 * @param {number} index - Índice do voluntário
 * @returns {string} HTML do card
 */
function criarCardVoluntario(voluntario, index) {
  return `
    <div class="card">
      <img src="https://source.unsplash.com/160x160/?volunteer,${voluntario.nome}" alt="Foto de ${voluntario.nome}">
      <h3>${voluntario.nome}</h3>
      <p>${voluntario.email}</p>
      ${voluntario.endereco ? `<p>${voluntario.endereco}</p>` : ''}
      <button onclick="removerVoluntario(${index})" class="btn-excluir">Excluir</button>
    </div>
  `;
}

/**
 * Remove um voluntário da lista
 * @param {number} index - Índice do voluntário a ser removido
 */
function removerVoluntario(index) {
  if (!confirm("Tem certeza que deseja remover este voluntário?")) return;
  
  const voluntarios = obterVoluntarios();
  voluntarios.splice(index, 1);
  salvarVoluntarios(voluntarios);
  carregarVoluntarios();
}

/**
 * Obtém a lista de voluntários do localStorage
 * @returns {Array} Lista de voluntários
 */
function obterVoluntarios() {
  return JSON.parse(localStorage.getItem("voluntarios") || []);
}

/**
 * Salva a lista de voluntários no localStorage
 * @param {Array} voluntarios - Lista de voluntários
 */
function salvarVoluntarios(voluntarios) {
  localStorage.setItem("voluntarios", JSON.stringify(voluntarios));
}

/**
 * Valida se um email já está cadastrado
 * @param {string} email - Email a ser verificado
 * @returns {boolean} True se o email já existe
 */
function emailExistente(email) {
  return obterVoluntarios().some(v => v.email.toLowerCase() === email.toLowerCase());
}

/**
 * Formata um CEP removendo caracteres não numéricos
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado
 */
function formatarCEP(cep) {
  return cep.replace(/\D/g, '');
}

/**
 * Valida o formulário de cadastro
 * @param {string} nome - Nome do voluntário
 * @param {string} email - Email do voluntário
 * @param {string} cep - CEP do voluntário
 * @returns {boolean} True se o formulário é válido
 */
function validarFormulario(nome, email, cep) {
  if (!nome || !email || !cep) {
    alert('Por favor, preencha todos os campos obrigatórios');
    return false;
  }
  
  if (emailExistente(email)) {
    alert('Este e-mail já está cadastrado!');
    return false;
  }
  
  if (formatarCEP(cep).length !== 8) {
    alert('CEP inválido. Deve conter 8 dígitos');
    return false;
  }
  
  return true;
}

// Event Listeners
document.getElementById("formVoluntario").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const cep = document.getElementById("cep").value;
  const endereco = document.getElementById("endereco").value.trim();
  
  if (!validarFormulario(nome, email, cep)) return;
  
  const enderecoCompleto = endereco || await buscarEndereco(formatarCEP(cep));
  
  if (!enderecoCompleto) {
    alert('Por favor, verifique o endereço');
    return;
  }
  
  const voluntarios = obterVoluntarios();
  voluntarios.push({ nome, email, endereco: enderecoCompleto });
  salvarVoluntarios(voluntarios);
  
  carregarVoluntarios();
  this.reset();
});

document.getElementById("cep").addEventListener("blur", async function() {
  const cep = formatarCEP(this.value);
  if (cep.length === 8) {
    await buscarEndereco(cep);
  }
});

document.getElementById("filtro").addEventListener("input", carregarVoluntarios);

document.getElementById("limparTudo").addEventListener("click", function() {
  if (confirm("Tem certeza que deseja apagar TODOS os cadastros? Esta ação não pode ser desfeita.")) {
    localStorage.removeItem("voluntarios");
    carregarVoluntarios();
  }
});

// Gerenciamento de sessão
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos

function verificarSessao() {
  const lastActivity = parseInt(localStorage.getItem)("sessionTime") || 0;
  const currentTime = new Date().getTime();
  
  if (currentTime - lastActivity > SESSION_TIMEOUT) {
    alert("Sessão expirada! Você será redirecionado.");
    window.location.href = "index.html";
    return false;
  }
  
  localStorage.setItem("sessionTime", currentTime.toString());
  return true;
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  if (!verificarSessao()) return;
  
  // Atualiza o tempo de sessão a cada minuto
  setInterval(verificarSessao, 60000);
  
  // Atualiza o tempo de sessão em interações do usuário
  document.addEventListener('click', verificarSessao);
  document.addEventListener('keypress', verificarSessao);
  
  carregarVoluntarios();
});