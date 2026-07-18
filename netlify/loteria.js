exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const fontes = [
    async () => {
      const r = await fetch('https://api.guidi.dev.br/loteria/federal/latest');
      if (!r.ok) throw new Error(`guidi: ${r.status}`);
      const d = await r.json();
      return { concurso: d.concurso, numeros: d.dezenas || d.listaDezenas };
    },
    async () => {
      const r = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest');
      if (!r.ok) throw new Error(`heroku: ${r.status}`);
      const d = await r.json();
      return { concurso: d.concurso, numeros: d.dezenas };
    },
  ];

  for (const fonte of fontes) {
    try {
      const resultado = await fonte();
      if (resultado.numeros && resultado.numeros.length > 0) {
        return { statusCode: 200, headers, body: JSON.stringify(resultado) };
      }
    } catch(e) {
      console.error('Fonte falhou:', e.message);
    }
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: 'Todas as fontes falharam' }),
  };
};
