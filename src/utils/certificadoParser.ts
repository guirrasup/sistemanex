// src/utils/certificadoParser.ts
import forge from 'node-forge';
import { CertificadoDigitalInfo, ConfiguracaoEmpresa } from '../types/erp';
import { formatarCpfCnpj } from './cpfCnpjValidator';

export interface ResultadoLeituraCertificado {
  sucesso: boolean;
  mensagem: string;
  certificadoInfo?: CertificadoDigitalInfo;
  dadosEmpresa?: Partial<ConfiguracaoEmpresa>;
}

// 🔥 Converte o ArrayBuffer em string binária em blocos (chunks), em vez de um
// único `String.fromCharCode.apply(null, arrayGrande)` — passar um array muito
// grande como lista de argumentos pode estourar o limite de argumentos da
// engine (RangeError: Maximum call stack size exceeded), o que acontece mais
// facilmente com certificados .p12 maiores (ex.: exportados com cadeia
// completa de certificados) do que com um .pfx simples do Windows.
function bufferParaBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return binary;
}

function extrairCnpj(texto: string): string {
  // Tenta encontrar CNPJ no formato 14 dígitos consecutivos
  let match = texto.match(/\d{14}/);
  if (match) return match[0];

  // Tenta encontrar no formato XX.XXX.XXX/XXXX-XX
  match = texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  if (match) return match[0].replace(/\D/g, '');

  // Tenta encontrar com separadores variados
  match = texto.match(/(\d{2}[\.\s]?\d{3}[\.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2})/);
  if (match) return match[1].replace(/\D/g, '');

  return '';
}

function extrairRazaoSocial(texto: string): string {
  let razao = texto;

  // 1. Remove o CNPJ (14 dígitos consecutivos)
  razao = razao.replace(/\d{14}/g, '');
  
  // 2. Remove números com espaços (ex: "29 535 022")
  razao = razao.replace(/^\d{1,3}\s\d{1,3}\s\d{1,3}\s/, '');
  razao = razao.replace(/\s\d{1,3}\s\d{1,3}\s\d{1,3}$/, '');
  razao = razao.replace(/\d{1,3}\s\d{1,3}\s\d{1,3}/g, '');
  
  // 3. Remove números soltos no início
  razao = razao.replace(/^\d+\s+/, '');
  
  // 4. Remove dois pontos e outros separadores
  razao = razao.replace(/[:]/g, '');
  razao = razao.replace(/\|/g, '');
  razao = razao.replace(/\*/g, '');
  
  // 5. Remove múltiplos espaços
  razao = razao.replace(/\s{2,}/g, ' ');
  
  // 6. Remove espaços no início e fim
  razao = razao.trim();

  // 7. Se ficou vazio, tenta extrair o nome antes do CNPJ
  if (!razao) {
    // Tenta pegar o que está antes do CNPJ
    const match = texto.match(/^([A-Za-zÀ-ÿ\s]+)/);
    if (match) razao = match[1].trim();
  }

  // 8. Remove números remanescentes
  razao = razao.replace(/^\d+/, '').trim();

  return razao;
}

export async function processarCertificadoA1(
  arquivo: File,
  senha: string
): Promise<ResultadoLeituraCertificado> {
  if (!senha) {
    return {
      sucesso: false,
      mensagem: 'Informe a senha do Certificado Digital A1.',
    };
  }

  if (!arquivo) {
    return {
      sucesso: false,
      mensagem: 'Nenhum arquivo de certificado selecionado.',
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength === 0) {
          resolve({
            sucesso: false,
            mensagem: 'Arquivo de certificado corrompido ou vazio.',
          });
          return;
        }

        const binary = bufferParaBinaryString(buffer);
        
        let p12: forge.pkcs12.Pkcs12Pfx | null = null;
        let erroSenha = false;
        
        try {
          const p12Der = forge.util.createBuffer(binary);
          const p12Asn1 = forge.asn1.fromDer(p12Der);
          p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
        } catch (forgeErr: unknown) {
          const msg = forgeErr instanceof Error ? forgeErr.message : '';
          if (msg.includes('password') || msg.includes('Mac') || msg.includes('PKCS#12') || msg.includes('decrypt')) {
            erroSenha = true;
          }
          console.warn('Erro ao decodificar PKCS#12 via Forge:', forgeErr);
        }

        if (!p12) {
          if (erroSenha) {
            resolve({
              sucesso: false,
              mensagem: 'Senha incorreta para o Certificado Digital A1.',
            });
          } else {
            resolve({
              sucesso: false,
              mensagem: 'Formato de certificado inválido ou corrompido. Use .pfx ou .p12 (ICP-Brasil).',
            });
          }
          return;
        }

        // Extrai certificado X.509
        let certX509: forge.pki.Certificate | null = null;
        let subjectName = '';
        let issuerName = '';

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = certBags[forge.pki.oids.certBag];
        
        if (certBag && certBag.length > 0 && certBag[0].cert) {
          certX509 = certBag[0].cert;
          
          const cnAttr = certX509.subject.attributes.find(
            (a) => a.name === 'commonName' || a.type === '2.5.4.3'
          );
          if (cnAttr && cnAttr.value) {
            subjectName = String(cnAttr.value);
          }

          const issuerAttr = certX509.issuer.attributes.find(
            (a) => a.name === 'commonName' || a.name === 'organizationName'
          );
          if (issuerAttr && issuerAttr.value) {
            issuerName = String(issuerAttr.value);
          }
        }

        if (!subjectName || subjectName.length < 3) {
          resolve({
            sucesso: false,
            mensagem: 'Certificado não contém dados do titular (Subject CN). Verifique o arquivo.',
          });
          return;
        }

        // 🔥 EXTRAI CNPJ
        let cnpjExtraido = extrairCnpj(subjectName);

        if (!cnpjExtraido || cnpjExtraido.length !== 14) {
          resolve({
            sucesso: false,
            mensagem: 'CNPJ não encontrado no certificado. Verifique se o certificado é de pessoa jurídica.',
          });
          return;
        }

        // 🔥 EXTRAI RAZÃO SOCIAL (LIMPA)
        let razaoSocialExtraida = extrairRazaoSocial(subjectName);

        if (!razaoSocialExtraida || razaoSocialExtraida.length < 3) {
          resolve({
            sucesso: false,
            mensagem: 'Razão Social não encontrada no certificado.',
          });
          return;
        }

        // Extrai validade
        let validadeInicio = new Date();
        let validadeFim = new Date();
        
        if (certX509?.validity?.notBefore) {
          validadeInicio = certX509.validity.notBefore;
        }
        if (certX509?.validity?.notAfter) {
          validadeFim = certX509.validity.notAfter;
        }

        const agora = new Date();
        const diffTempo = validadeFim.getTime() - agora.getTime();
        const diasRestantes = Math.max(0, Math.ceil(diffTempo / (1000 * 60 * 60 * 24)));

        const certInfo: CertificadoDigitalInfo = {
          instalado: true,
          tipo: 'A1',
          nomeTitular: subjectName,
          cnpjCpf: formatarCpfCnpj(cnpjExtraido),
          emissora: issuerName || 'Autoridade Certificadora (ICP-Brasil)',
          dataValidadeInicio: validadeInicio.toISOString(),
          dataValidadeFim: validadeFim.toISOString(),
          diasRestantes: diasRestantes || 0,
          arquivoCarregadoNome: arquivo.name,
          status: diasRestantes > 0 ? 'VALIDO' : 'EXPIRADO',
        };

        // 🔥 Dados cadastrais completos (endereço, CNAE, situação, sócios etc.)
        // NÃO são buscados aqui — quem chama processarCertificadoA1 (tela de
        // Configurações) faz isso depois, com o CNPJ extraído do certificado,
        // usando a mesma consulta pública rica da tela "Consulta CNPJ"
        // (consultarCnpjConectaGov) em vez desta busca mais limitada.
        const dadosCompletos: Partial<ConfiguracaoEmpresa> = {
          razaoSocial: razaoSocialExtraida,
          cnpj: formatarCpfCnpj(cnpjExtraido),
          certificado: certInfo,
        };

        resolve({
          sucesso: true,
          mensagem: `Certificado Digital A1 validado com sucesso! Dados extraídos: ${razaoSocialExtraida} (CNPJ: ${formatarCpfCnpj(cnpjExtraido)})`,
          certificadoInfo: certInfo,
          dadosEmpresa: dadosCompletos,
        });

      } catch (err: unknown) {
        console.error('Erro ao ler certificado:', err);
        resolve({
          sucesso: false,
          mensagem: `Erro ao processar certificado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        sucesso: false,
        mensagem: 'Falha ao ler o arquivo do certificado.',
      });
    };

    reader.readAsArrayBuffer(arquivo);
  });
}