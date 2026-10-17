const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnc3ptbWxyaWZhZHphb3ZzdXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTQ4ODQsImV4cCI6MjEwNzczMDg4NH0.8zErqM1amU0GFPsylPA2E6_GvKJhbTOEcjGdzJNMQIE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const meuIdLogado = localStorage.getItem('id_usuario_logado');
let minhasEstrelas = 2;

function mudarAba(nomeAba) {
    document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativa'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('ativo'));
    if(nomeAba === 'classificacao') { document.getElementById('abaClassificacao').classList.add('ativa'); document.getElementById('btnClassificacao').classList.add('ativo'); carregarRanking(); }
    if(nomeAba === 'arena') { document.getElementById('abaArena').classList.add('ativa'); document.getElementById('btnArena').classList.add('ativo'); carregarArena(); }
    if(nomeAba === 'perfil') { document.getElementById('abaPerfil').classList.add('ativa'); document.getElementById('btnPerfil').classList.add('ativo'); carregarPerfil(); }
}

async function carregarRanking() {
    const { data } = await supabase.from('usuarios').select('*').order('estrelas', { ascending: false });
    if (!data) return;
    const podio = document.getElementById('podio'); const resto = document.getElementById('restoRanking');
    podio.innerHTML = ""; resto.innerHTML = "";
    
    data.forEach((j, idx) => {
        const pos = idx + 1; const av = j.avatar_id + ".jpg"; 
        if(j.id === meuIdLogado) minhasEstrelas = j.estrelas || 2;
        
        if(pos === 1) podio.innerHTML += `<div class="podio-lugar top1"><span class="titulo-rei">👑 Rei dos Jogos</span><br><img class="podio-avatar" src="${av}"><h4>${j.nome}</h4><small>${j.deck_nome}</small><div style="color:#ffcc00; font-weight:bold; margin-top:4px;">🌟 ${j.estrelas}</div></div>`;
        else if(pos === 2) podio.innerHTML += `<div class="podio-lugar top2"><span>2º Lugar</span><br><img class="podio-avatar" src="${av}"><h5>${j.nome}</h5><div style="color:#ffcc00; font-weight:bold; margin-top:4px;">🌟 ${j.estrelas}</div></div>`;
        else if(pos === 3) podio.innerHTML += `<div class="podio-lugar top3"><span>3º Lugar</span><br><img class="podio-avatar" src="${av}"><h5>${j.nome}</h5><div style="color:#ffcc00; font-weight:bold; margin-top:4px;">🌟 ${j.estrelas}</div></div>`;
        else resto.innerHTML += `<tr><td>${pos}º</td><td style="text-align:left;"><img class="avatar-tabela" src="${av}"><b>${j.nome}</b></td><td>${j.deck_nome}</td><td style="color:#ffcc00; font-weight:bold;">${j.estrelas}</td></tr>`;
    });
}

async function carregarPerfil() {
    const { data } = await supabase.from('usuarios').select('*').eq('id', meuIdLogado).single();
    if(data) { document.getElementById('perfilNome').value = data.nome; document.getElementById('perfilDeck').value = data.deck_nome; document.getElementById('perfilAvatar').src = data.avatar_id + ".jpg"; }
}

async function salvarPerfil() {
    const n = document.getElementById('perfilNome').value; const d = document.getElementById('perfilDeck').value;
    await supabase.from('usuarios').update({ nome: n, deck_nome: d }).eq('id', meuIdLogado); alert("Perfil atualizado!");
}

async function carregarArena() {
    const { data } = await supabase.from('usuarios').select('*').order('nome', { ascending: true });
    if(!data) return;
    const ops = data.filter(j => j.id !== meuIdLogado);
    const select = document.getElementById('selectOponente'); const lista = document.getElementById('listaArena');
    select.innerHTML = '<option value="">Selecione o Oponente...</option>'; lista.innerHTML = "";
    ops.forEach(o => {
        select.innerHTML += `<option value="${o.id}">${o.nome}</option>`;
        lista.innerHTML += `<div class="card-duelista"><div><b>${o.nome}</b><br><small style="color:#aaa;">🃏 ${o.deck_nome} | 🌟 ${o.estrelas}</small></div><button class="btn-desafiar" onclick="document.getElementById('selectOponente').value='${o.id}'">Escolher</button></div>`;
    });
}

async function enviarDesafio() {
    const opId = document.getElementById('selectOponente').value; const tipo = document.getElementById('tipoDuelo').value;
    let aposta = 0; if(!opId) return alert("Selecione um oponente!");
    if(tipo === 'aposta') {
        aposta = parseInt(document.getElementById('qtdAposta').value);
        if(aposta > minhasEstrelas) return alert("Você não pode apostar mais estrelas!");
    }
    await supabase.from('desafios').insert([{ desafiante_id: meuIdLogado, desafiado_id: opId, tipo: tipo, estrelas_apostadas: aposta, status: 'pendente' }]);
    alert("Desafio enviado!");
}

window.onload = () => { carregarRanking(); };
