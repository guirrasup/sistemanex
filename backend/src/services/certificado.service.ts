// backend/src/services/certificado.service.ts
import forge from 'node-forge'
import { EmpresaRepository } from '../repositories/empresa.repository.js'
import { encryptSecret, decryptSecret } from '../utils/crypto.js'

const BRASILAPI_TIMEOUT_MS = 5000

export class CertificadoService {
  private empresaRepo: EmpresaRepository

  constructor() {
    this.empresaRepo = new EmpresaRepository()
  }

  async processarCertificado(
    arquivoBase64: string,
    senha: string,
    empresaId: string
  ) {
    try {
      // Decodifica o arquivo
      const buffer = Buffer.from(arquivoBase64, 'base64')
      const binary = buffer.toString('binary')

      // Tenta ler o PKCS#12
      let p12: forge.pkcs12.Pkcs12Pfx | null = null
      try {
        const p12Der = forge.util.createBuffer(binary)
        const p12Asn1 = forge.asn1.fromDer(p12Der)
        p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha)
      } catch (error) {
        throw new Error('Senha incorreta ou arquivo de certificado inválido')
      }

      // Extrai informações do certificado
      let certX509: forge.pki.Certificate | null = null
      let subjectName = ''
      let issuerName = 'AC SERASA RFB v5'

      if (p12) {
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
        const certBag = certBags[forge.pki.oids.certBag]
        if (certBag && certBag.length > 0 && certBag[0].cert) {
          certX509 = certBag[0].cert
          
          const cnAttr = certX509.subject.attributes.find(
            (a: forge.pki.CertificateField) => a.name === 'commonName'
          )
          if (cnAttr) subjectName = String(cnAttr.value)

          const issuerAttr = certX509.issuer.attributes.find(
            (a: forge.pki.CertificateField) => a.name === 'commonName' || a.name === 'organizationName'
          )
          if (issuerAttr) issuerName = String(issuerAttr.value)
        }
      }

      if (!subjectName) {
        throw new Error('Não foi possível extrair os dados do certificado')
      }

      // Extrai CNPJ do subject
      let cnpj = ''
      const cnpjMatch = subjectName.match(/\d{14}/)
      if (cnpjMatch) cnpj = cnpjMatch[0]

      // Calcula validade
      const validadeInicio = certX509?.validity?.notBefore || new Date()
      const validadeFim = certX509?.validity?.notAfter || new Date()
      const diasRestantes = Math.max(0, Math.ceil(
        (validadeFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))

      // Busca dados da empresa pela BrasilAPI
      const dadosEmpresa = await this.buscarDadosCnpj(cnpj)

      // Salva o certificado (arquivo e senha sempre criptografados em repouso)
      const certificadoData = {
        tipo: 'A1',
        nomeTitular: subjectName,
        cnpjCpf: cnpj,
        emissora: issuerName,
        dataValidadeInicio: validadeInicio,
        dataValidadeFim: validadeFim,
        diasRestantes,
        arquivoCarregadoNome: 'certificado.pfx',
        status: diasRestantes > 0 ? 'VALIDO' : 'EXPIRADO',
        arquivoBase64: encryptSecret(arquivoBase64),
        senha: encryptSecret(senha)
      }

      // Atualiza a empresa com os dados do certificado
      const empresa = await this.empresaRepo.update(empresaId, {
        certificado: {
          upsert: {
            create: certificadoData,
            update: certificadoData
          }
        },
        ...dadosEmpresa
      })

      return {
        sucesso: true,
        mensagem: 'Certificado processado com sucesso!',
        certificado: this.sanitizarCertificado(empresa.certificado),
        // ⚠️ empresa.certificado ainda carrega arquivoBase64/senha criptografados
        // (vindos do include do repositório) — nunca devolver isso pela API,
        // mesmo cifrado. Reaproveita o mesmo certificado já sanitizado acima.
        empresa: { ...empresa, certificado: this.sanitizarCertificado(empresa.certificado) }
      }
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao processar certificado'
      }
    }
  }

  /**
   * Remove os segredos criptografados (arquivo PFX e senha) antes de devolver
   * o certificado para a API — o cliente nunca precisa desses valores.
   */
  private sanitizarCertificado<T extends { arquivoBase64?: string | null; senha?: string | null } | null | undefined>(
    certificado: T
  ) {
    if (!certificado) return certificado;
    const { arquivoBase64: _arquivoBase64, senha: _senha, ...resto } = certificado;
    return resto;
  }

  /**
   * Descriptografa o PFX e a senha do certificado de uma empresa, para uso
   * pelo módulo de assinatura de XML (SEFAZ). Nunca expor o retorno via API.
   */
  async obterCertificadoDecriptado(empresaId: string): Promise<{ pfxBuffer: Buffer; senha: string } | null> {
    const empresa = await this.empresaRepo.findById(empresaId);
    const certificado = empresa?.certificado;
    if (!certificado?.arquivoBase64 || !certificado.senha) return null;

    return {
      pfxBuffer: Buffer.from(decryptSecret(certificado.arquivoBase64), 'base64'),
      senha: decryptSecret(certificado.senha)
    };
  }

  private async buscarDadosCnpj(cnpj: string) {
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, '')}`,
        { signal: AbortSignal.timeout(BRASILAPI_TIMEOUT_MS) }
      )

      if (response.ok) {
        const data = await response.json() as Record<string, any>
        const codigoMunicipio = data.codigo_municipio_ibge ? String(data.codigo_municipio_ibge) : undefined

        return {
          razaoSocial: data.razao_social || data.nome_empresarial,
          nomeFantasia: data.nome_fantasia,
          cnae: data.cnae_fiscal ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}` : undefined,
          // Empresa também guarda uf/codigoUF/codigoMunicipio/nomeMunicipio direto
          // (fora do relacionamento Endereco) — são esses campos "operacionais" que
          // nfe/nfce/cte/mdfe.service.ts usam para rotear a emissão ao autorizador
          // certo da SEFAZ. Sem espelhar aqui, uma empresa de outra UF continuaria
          // roteando para a UF antiga mesmo depois de atualizar o endereço.
          ...(data.uf && { uf: data.uf }),
          ...(codigoMunicipio && { codigoUF: codigoMunicipio.slice(0, 2), codigoMunicipio }),
          ...(data.municipio && { nomeMunicipio: data.municipio }),
          endereco: {
            update: {
              logradouro: data.logradouro ? `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro}`.trim() : undefined,
              numero: data.numero || 'S/N',
              complemento: data.complemento || '',
              bairro: data.bairro || '',
              codigoMunicipio,
              nomeMunicipio: data.municipio || '',
              uf: data.uf || '',
              cep: data.cep || '',
              telefone: data.ddd_telefone_1 || data.telefone || '',
              email: data.email ? data.email.toLowerCase() : ''
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar dados do CNPJ:', error)
    }
    return {}
  }

  async renovarCertificado(empresaId: string, novoArquivoBase64: string, senha: string) {
    return this.processarCertificado(novoArquivoBase64, senha, empresaId)
  }

  async buscarStatus(empresaId: string) {
    const empresa = await this.empresaRepo.findById(empresaId)
    if (!empresa) throw new Error('Empresa não encontrada')
    return this.sanitizarCertificado(empresa.certificado)
  }
}