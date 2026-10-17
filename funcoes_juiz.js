const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnc3ptbWxyaWZhZHphb3ZzdXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTQ4ODQsImV4cCI6MjEwNzczMDg4NH0.8zErqM1amU0GFPsylPA2E6_GvKJhbTOEcjGdzJNMQIE";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. ENVIO DE AVISOS EM TEMPO REAL
async function enviarAviso() {
    const texto = document.getElementById('textoAviso').value;
    if(!texto) return alert("Digite uma mensagem primeiro!");
    
    const { error } = await supabase.from('avisos').insert([{ texto: texto }]);
    if(!error) {
        alert("Aviso disparado!");
        document.getElementById('textoAviso').value = "";
    } else {
        alert("Erro: " + error.message);
    }
}

// 2. MATA-MATA: PEGA OS INSCRITOS E GERA CONFRONTOS ALEATÓRIOS
async function gerarChavesMataMata() {
    const { data: inscritos } = await supabase.from('usuarios').select('id, nome');
    if(!inscritos || inscritos.length < 2) return alert("É preciso ter pelo menos 2 duelistas cadastrados no banco!");

    // Embaralha a lista
    inscritos.sort(() => Math.random() - 0.5);
    await supabase.from('partidas_mata_mata').delete().neq('id', 0); // Limpa rodadas antigas

    for (let i = 0; i < inscritos.length; i += 2) {
        let j1 = inscritos[i];
        let j2 = inscritos[i+1];
        
        await supabase.from('partidas_mata_mata').insert([{
            torneio_id: 1,
            fase: 'Rodada Ativa',
            jogador_1_id: j1.id,
            jogador_1_nome: j1.nome,
            jogador_2_id: j2 ? j2.id : null,
            jogador_2_nome: j2 ? j2.name : 'BYE (Avança Direto)'
        }]);
    }
    alert("Chaves geradas com sucesso!");
    carregarChavesJuiz();
}

// 3. EXIBE AS CHAVES COM BOTÕES DE VITÓRIA DIRECTA DO JUIZ
async function carregarChavesJuiz() {
    const { data: partidas } = await supabase.from('partidas_mata_mata').select('*');
    const container = document.getElementById('containerChaves');
    container.innerHTML = "";
    
    if(!partidas || partidas.length === 0) {
        container.innerHTML = "<p style='color:#aaa;font-size:14px;'>Nenhum confronto ativo.</p>";
        return;
    }

    partidas.forEach(p => {
        container.innerHTML += `
            <div class="chave-partida">
                <div style="font-size:14px;">
                    <b>${p.jogador_1_nome}</b> vs <b>${p.jogador_2_nome}</b>
                </div>
                <div>
                    <button class="btn-vitoria" onclick="declararVencedor('${p.id}', '${p.jogador_1_nome}')">👑 1</button>
                    ${p.jogador_2_id ? `<button class="btn-vitoria" style="background:#ffcc00;" onclick="declararVencedor('p.id', '{p.jogador_2_nome}')">👑 2</button>` : ''}
                </div>
            </div>
        `;
    });
}

async function declararVencedor(partidaId, nomeVencedor) {
    alert("Duelo encerrado! " + nomeVencedor + " avança de fase no torneio.");
    await supabase.from('partidas_mata_mata').delete().eq('id', partidaId);
    carregarChavesJuiz();
}

window.onload = () => { carregarChavesJuiz(); };
