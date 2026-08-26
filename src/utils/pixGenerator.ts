/**
 * Gerador de Payload Pix EMV (BR Code) Padrão Banco Central do Brasil
 * Com cálculo de CRC16-CCITT (0xFFFF)
 * SUP TECNOLOGIA
 */

function crc16(str: string): string {
  let crc = 0xffff;
  const strlen = str.length;
  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  let hex = (crc & 0xffff).toString(16).toUpperCase();
  if (hex.length === 3) hex = `0${hex}`;
  if (hex.length === 2) hex = `00${hex}`;
  if (hex.length === 1) hex = `000${hex}`;
  return hex;
}

function formatEmvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function gerarPayloadPix(params: {
  chavePix: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  valor?: number;
  identificador?: string; // txid (ex: NFSE1001)
}): string {
  // Limpeza de acentos
  const nome = params.nomeRecebedor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const cidade = params.cidadeRecebedor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  const txid = (params.identificador || '***').slice(0, 25);

  // 00: Payload Format Indicator
  let payload = formatEmvField('00', '01');

  // 26: Merchant Account Information - Pix
  const gui = formatEmvField('00', 'br.gov.bcb.pix');
  const key = formatEmvField('01', params.chavePix);
  payload += formatEmvField('26', `${gui}${key}`);

  // 52: Merchant Category Code
  payload += formatEmvField('52', '0000');

  // 53: Transaction Currency (986 = BRL)
  payload += formatEmvField('53', '986');

  // 54: Transaction Amount
  if (params.valor && params.valor > 0) {
    payload += formatEmvField('54', params.valor.toFixed(2));
  }

  // 58: Country Code
  payload += formatEmvField('58', 'BR');

  // 59: Merchant Name
  payload += formatEmvField('59', nome);

  // 60: Merchant City
  payload += formatEmvField('60', cidade);

  // 62: Additional Data Field (TXID)
  const refLabel = formatEmvField('05', txid);
  payload += formatEmvField('62', refLabel);

  // 63: CRC16
  payload += '6304';
  const checksum = crc16(payload);

  return `${payload}${checksum}`;
}
