// DENTRO DE src/routes/+page.js (substitua todo o conteúdo por isto)

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  try {
    // Busca o único JSON que este projeto vai usar, com o link completo e fixo.
    const response = await fetch('https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35/g1/a-trama-do-golpe/data/a-trama-do-golpe.json');

    if (response.ok) {
      const story = await response.json();
      return { story }; // Retorna os dados da matéria
    } else {
      // Se der erro na busca (ex: 404), informa no console e retorna nulo.
      console.error('Falha ao buscar o JSON principal:', response.statusText);
      return { story: null };
    }
  } catch (err) {
    // Se der qualquer outro erro, informa no console e retorna nulo.
    console.error('Erro de rede ou de código ao carregar a matéria:', err);
    return { story: null };
  }
}