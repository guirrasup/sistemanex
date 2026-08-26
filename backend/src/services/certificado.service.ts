// src/services/certificado.service.ts
import forge from 'node-forge'
import { EmpresaRepository } from '../repositories/empresa.repository'
import { CertificadoDigital } from '@prisma/client'

export class CertificadoService {
  private empresaRepo: EmpresaRepository

  constructor() {
    this.empresaRepo = new EmpresaRepository()
  }

  async processarCertificado(
    arquivoBase64: string,
    senha: string,
    empresaId: string
  ): Promise<any> {
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
            (a: any) => a.name === 'commonName'
          )
          if (cnAttr) subjectName = String(cnAttr.value)

          const issuerAttr = certX509.issuer.attributes.find(
            (a: any) => a.name === 'commonName' || a.name === 'organizationName'
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

      // Salva o certificado
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
        arquivoBase64: arquivoBase64 // Em produção, criptografar!
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
        certificado: empresa.certificado,
        empresa
      }
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao processar certificado'
      }
    }
  }

  private async buscarDadosCnpj(cnpj: string) {
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, '')}`,
        { signal: AbortSignal.timeout(5000) }
      )

      if (response.ok) {
        const data = await response.json()
        return {
          razaoSocial: data.razao_social || data.nome_empresarial,
          nomeFantasia: data.nome_fantasia,
          cnae: data.cnae_fiscal ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}` : undefined,
          endereco: {
            update: {
              logradouro: data.logradouro ? `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro}`.trim() : undefined,
              numero: data.numero || 'S/N',
              complemento: data.complemento || '',
              bairro: data.bairro || '',
              codigoMunicipio: data.codigo_municipio_ibge ? String(data.codigo_municipio_ibge) : undefined,
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
}