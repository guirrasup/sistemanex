// backend/src/utils/dataHoraSefaz.ts
// Formata datas no padrão TDateTimeUTC exigido pelos schemas da SEFAZ:
// "AAAA-MM-DDTHH:mm:ss±HH:mm" — sem milissegundos, com o offset UTC explícito.
//
// Confirmado em teste real contra a SEFAZ homologação: o formato ISO padrão do
// JavaScript (`Date.toISOString()`, que usa "Z" e inclui milissegundos) é
// rejeitado com "Rejeicao: Falha no Schema XML" no elemento dhEmi — a SEFAZ
// exige o offset explícito (nunca "Z") e não aceita milissegundos.
const OFFSET_PADRAO_MINUTOS = -180; // UTC-3 (Brasília/São Paulo) — sem horário de verão desde 2019

export function formatarDataHoraSefaz(data: Date = new Date(), offsetMinutos: number = OFFSET_PADRAO_MINUTOS): string {
  const deslocado = new Date(data.getTime() + offsetMinutos * 60_000);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const ano = deslocado.getUTCFullYear();
  const mes = pad(deslocado.getUTCMonth() + 1);
  const dia = pad(deslocado.getUTCDate());
  const hora = pad(deslocado.getUTCHours());
  const min = pad(deslocado.getUTCMinutes());
  const seg = pad(deslocado.getUTCSeconds());

  const offsetAbs = Math.abs(offsetMinutos);
  const offsetHoras = pad(Math.floor(offsetAbs / 60));
  const offsetMin = pad(offsetAbs % 60);
  const sinal = offsetMinutos <= 0 ? '-' : '+';

  return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}${sinal}${offsetHoras}:${offsetMin}`;
}
