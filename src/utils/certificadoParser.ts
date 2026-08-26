// C:\emissornfe\src\utils\certificadoParser.ts

import forge from 'node-forge';
import { CertificadoDigitalInfo, ConfiguracaoEmpresa } from '../types/erp';
import { formatarCpfCnpj, formatarCEP, limparDocumento } from './cpfCnpjValidator';

export interface ResultadoLeituraCertificado {
  sucesso: boolean;
  mensagem: string;
  certificadoInfo?: CertificadoDigitalInfo;
  dadosEmpresa?: Partial<ConfiguracaoEmpresa>;
}

/**
 * Tenta buscar dados cadastrais atualizados via API pública (BrasilAPI / Receita)
 */
export async function buscarDadosCadastraisCnpj(cnpj: string): Promise<Partial<ConfiguracaoEmpresa> | null> {
  const cnpjLimpo = limparDocumento(cnpj);
  if (cnpjLimpo.length !== 14) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        razaoSocial: data.razao_social || data.nome_empresarial,
        nomeFantasia: data.nome_fantasia || data.razao_social,
        cnpj: formatarCpfCnpj(cnpjLimpo),
        cnae: data.cnae_fiscal ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao || ''}` : undefined,
        regimeTributario: data.opcao_pelo_simples ? 1 : 3,
        endereco: {
          logradouro: data.logradouro ? `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro}`.trim() : undefined,
          numero: data.numero || 'S/N',
          complemento: data.complemento || undefined,
          bairro: data.bairro || undefined,
          codigoMunicipio: data.codigo_municipio_ibge ? String(data.codigo_municipio_ibge) : undefined,
          nomeMunicipio: data.municipio || undefined,
          uf: data.uf || undefined,
          cep: data.cep ? formatarCEP(data.cep) : undefined,
          telefone: data.ddd_telefone_1 || data.telefone || undefined,
          email: data.email ? data.email.toLowerCase() : undefined,
        }
      };
    }
  } catch (err) {
    console.warn('Busca externa por CNPJ falhou ou offline:', err);
  }

  return null;
}

/**
 * 🔥 EXTRAI CNPJ DE FORMA ROBUSTA
 * Suporta: 29535022000138, 29.535.022/0001-38, 29 535 022 0001 38
 */
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

/**
 * 🔥 EXTRAI RAZÃO SOCIAL DE FORMA ROBUSTA
 * Remove números, espaços extras e caracteres especiais
 * Exemplo: "29 535 022 KEVLYN GUIRRA GELLER:29535022000138" -> "KEVLYN GUIRRA GELLER"
 */
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

/**
 * Lê e descriptografa um arquivo de Certificado Digital A1 (.pfx ou .p12)
 */
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

        const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
        
        let p12: forge.pkcs12.Pkcs12Pfx | null = null;
        let erroSenha = false;
        
        try {
          const p12Der = forge.util.createBuffer(binary);
          const p12Asn1 = forge.asn1.fromDer(p12Der);
          p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
        } catch (forgeErr: any) {
          const msg = forgeErr?.message || '';
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
            (a: any) => a.name === 'commonName' || a.type === '2.5.4.3'
          );
          if (cnAttr && cnAttr.value) {
            subjectName = String(cnAttr.value);
          }

          const issuerAttr = certX509.issuer.attributes.find(
            (a: any) => a.name === 'commonName' || a.name === 'organizationName'
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

        // Tenta buscar dados da empresa na BrasilAPI
        const dadosOnline = await buscarDadosCadastraisCnpj(cnpjExtraido);

        const dadosCompletos: Partial<ConfiguracaoEmpresa> = {
          razaoSocial: dadosOnline?.razaoSocial || razaoSocialExtraida,
          nomeFantasia: dadosOnline?.nomeFantasia || undefined,
          cnpj: formatarCpfCnpj(cnpjExtraido),
          certificado: certInfo,
          ...(dadosOnline?.endereco && {
            endereco: dadosOnline.endereco
          }),
          ...(dadosOnline?.cnae && { cnae: dadosOnline.cnae }),
          ...(dadosOnline?.regimeTributario && { regimeTributario: dadosOnline.regimeTributario }),
        };

        if (!dadosCompletos.endereco || !dadosCompletos.endereco.logradouro) {
          delete dadosCompletos.endereco;
        }

        resolve({
          sucesso: true,
          mensagem: `Certificado Digital A1 validado com sucesso! Dados extraídos: ${razaoSocialExtraida} (CNPJ: ${formatarCpfCnpj(cnpjExtraido)})`,
          certificadoInfo: certInfo,
          dadosEmpresa: dadosCompletos,
        });

      } catch (err: any) {
        console.error('Erro ao ler certificado:', err);
        resolve({
          sucesso: false,
          mensagem: `Erro ao processar certificado: ${err.message || 'Erro desconhecido'}`,
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