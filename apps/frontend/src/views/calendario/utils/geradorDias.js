export function gerarGradeMes(inicioMes) {
  const ano = inicioMes.getFullYear();
  const mes = inicioMes.getMonth();

  const primeiroDiaMes = new Date(ano, mes, 1);
  const ultimoDiaMes = new Date(ano, mes + 1, 0);

  const inicioGrid = new Date(primeiroDiaMes);
  inicioGrid.setDate(primeiroDiaMes.getDate() - primeiroDiaMes.getDay());

  const dias = [];

  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicioGrid);
    dia.setDate(inicioGrid.getDate() + i);
    dias.push(dia);
  }

  return dias;
}

export function gerarSemana(inicio) {
  const dias = [];

  const base = new Date(inicio);

  // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const diaSemana = base.getDay();

  // Ajuste para semana começar na segunda
  // Se for domingo (0), voltamos 6 dias
  const deslocamento = diaSemana === 0 ? 6 : diaSemana - 1;

  const inicioSemana = new Date(base);
  inicioSemana.setDate(base.getDate() - deslocamento);
  inicioSemana.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    dias.push(dia);
  }

  return dias;
}

export function gerarDia(inicio) {
  const dia = new Date(inicio);
  dia.setHours(0, 0, 0, 0);
  return dia;
}

export function gerarBlocosDia(dia) {
  const blocos = [];

  for (let h = 0; h < 24; h += 6) {
    const inicio = new Date(dia);
    inicio.setHours(h, 0, 0, 0);

    const fim = new Date(dia);
    fim.setHours(h + 6, 0, 0, 0);

    blocos.push({ inicio, fim, label: `${h}h - ${h + 6}h` });
  }

  return blocos;
}

export function gerarListaDias(inicio, fim) {
  function startOfDay(unix) {
    const d = new Date(unix);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  
  function addDays(unix, days) {
    return unix + days * 24 * 60 * 60 * 1000;
  }
  
  const lista = [];
  let cursor = startOfDay(inicio);

  while (cursor <= fim) {
    lista.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return lista;
}