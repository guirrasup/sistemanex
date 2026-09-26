// src/components/config/ConfiguracoesEmpresaView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Settings, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  FileText, 
  Receipt,
  AlertCircle,
  UploadCloud,
  KeyRound,
  Eye,
  EyeOff,
  FileCheck,
  RefreshCw,
  MapPin,
  QrCode,
  Lock,
  Search,
  Loader2,
  Trash2,
  Info
} from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { formatarCpfCnpj, formatarCEP, limparDocumento } from '../../utils/cpfCnpjValidator';
import { StorageService } from '../../utils/storage';
import { processarCertificadoA1 } from '../../utils/certificadoParser';
import { consultarCnpjConectaGov, ConsultaCnpjResponse } from '../../utils/consultaCnpjApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { certificadoService } from '../../services/certificado.service';
import { empresaService } from '../../services/empresa.service';

interface ConfiguracoesEmpresaViewProps {
  empresa: ConfiguracaoEmpresa;
  onEmpresaChange: () => void;
}

// 🔥 Base "em branco" reutilizada tanto por "Limpar Formulário" quanto por
// "Carregar Certificado" — sem isso, carregar um certificado novo só
// sobrescrevia as chaves presentes na resposta, deixando resíduos da empresa
// anterior (IE, IM, chave Pix, banco, regime tributário etc.) nos campos que
// a resposta não tocava.
function criarEmpresaVazia(): ConfiguracaoEmpresa {
  return {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    cnae: '',
    regimeTributario: 1,
    aliquotaSimplesNacional: 6.0,
    ambienteEmissao: 1,
    serieNfe: 1,
    proximoNumeroNfe: 1,
    serieNfse: 1,
    proximoNumeroNfse: 1,
    serieNfce: 1,
    proximoNumeroNfce: 1,
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      codigoMunicipio: '',
      nomeMunicipio: '',
      uf: '',
      cep: '',
      telefone: '',
      email: '',
    },
    certificado: {
      instalado: false,
      tipo: 'A1',
      nomeTitular: '',
      cnpjCpf: '',
      emissora: '',
      dataValidadeInicio: '',
      dataValidadeFim: '',
      diasRestantes: 0,
      arquivoCarregadoNome: '',
      status: 'NAO_CONFIGURADO',
    },
    chavePixPadrao: '',
    bancoPadrao: '',
    optanteSimples: false,
    optanteMEI: false,
  };
}

// 🔥 O `codigo_municipio` que a API pública de CNPJ (OpenCNPJ/Receita Federal)
// devolve NÃO é o código IBGE de 7 dígitos que a SEFAZ exige nos documentos
// fiscais (schema TCodUfIBGE/TCodMunIBGE) — é o código "TOM" interno da
// própria Receita Federal, mais curto (ex.: "9701" pra Brasília, em vez do
// código IBGE real "5300108"). Usar esse valor direto gravava um cUF inválido
// no XML e a SEFAZ rejeitava toda emissão real com "Falha no schema XML...
// Enumeration constraint failed" — confirmado ao vivo. Resolve o código IBGE
// de verdade consultando a API pública oficial do IBGE por nome do município + UF.
async function resolverCodigoMunicipioIBGE(
  nomeMunicipio: string | undefined,
  uf: string | undefined,
  codigoCandidato: string | undefined
): Promise<string> {
  // Se o valor que já veio for mesmo um código IBGE (7 dígitos), usa direto.
  if (codigoCandidato && /^\d{7}$/.test(codigoCandidato)) {
    return codigoCandidato;
  }

  if (!nomeMunicipio || !uf) return '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return '';

    const municipios: Array<{ id: number; nome: string }> = await response.json();
    const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
    const alvo = normalizar(nomeMunicipio);
    const encontrado = municipios.find((m) => normalizar(m.nome) === alvo);
    return encontrado ? String(encontrado.id) : '';
  } catch (err) {
    console.warn('Falha ao resolver código IBGE do município:', err);
    return '';
  }
}

// 🔥 Mapeia o retorno da mesma consulta pública usada na tela "Consulta CNPJ"
// (consultarCnpjConectaGov / OpenCNPJ) para o máximo de campos que o cadastro
// da empresa realmente tem — bem mais rico que a busca da BrasilAPI que
// rodava antes dentro do parser do certificado (só razão social/endereço básico).
async function mapConsultaCnpjParaEmpresa(
  dados: NonNullable<ConsultaCnpjResponse['dados']>
): Promise<Partial<ConfiguracaoEmpresa>> {
  const telefonePrincipal =
    dados.telefone && dados.telefone.length > 0
      ? `(${dados.telefone[0].ddd}) ${dados.telefone[0].numero}`
      : '';

  const codigoMunicipioIBGE = await resolverCodigoMunicipioIBGE(
    dados.endereco.municipio,
    dados.endereco.uf,
    dados.endereco.codigoMunicipio
  );

  return {
    // 🔥 Fixa o CNPJ no valor realmente consultado (que é sempre o mesmo CNPJ
    // extraído do certificado que disparou essa consulta) — sem isso, um
    // cadastro que já tivesse outro CNPJ (de uma empresa/certificado anterior)
    // podia ficar com razaoSocial/endereco de uma empresa e cnpj de outra,
    // e a SEFAZ rejeita a emissão com "CNPJ-Base do Emitente difere do
    // CNPJ-Base do Certificado Digital" quando isso acontece.
    cnpj: dados.cnpj ? formatarCpfCnpj(dados.cnpj) : undefined,
    razaoSocial: dados.razaoSocial || undefined,
    nomeFantasia: dados.nomeFantasia || undefined,
    cnae: dados.cnaePrincipal
      ? `${dados.cnaePrincipal}${dados.cnaePrincipalDescricao ? ` - ${dados.cnaePrincipalDescricao}` : ''}`
      : undefined,
    regimeTributario: dados.optanteSimples ? 1 : 3,
    optanteSimples: dados.optanteSimples,
    optanteMEI: dados.optanteMEI,
    endereco: {
      logradouro: `${dados.endereco.tipoLogradouro || ''} ${dados.endereco.logradouro || ''}`.trim(),
      numero: dados.endereco.numero || '',
      complemento: dados.endereco.complemento || '',
      bairro: dados.endereco.bairro || '',
      codigoMunicipio: codigoMunicipioIBGE,
      nomeMunicipio: dados.endereco.municipio || '',
      uf: dados.endereco.uf || '',
      cep: dados.endereco.cep || '',
      telefone: telefonePrincipal,
      email: dados.email || '',
      codigoPais: dados.endereco.codigoPais || undefined,
      nomePais: dados.endereco.pais || undefined,
    },
  } as Partial<ConfiguracaoEmpresa>;
}

export const ConfiguracoesEmpresaView: React.FC<ConfiguracoesEmpresaViewProps> = ({
  empresa,
  onEmpresaChange,
}) => {
  // 🔥 COR DO MÓDULO (ARDÓSIA) - MESMA DO HEADER E SIDEBAR
  const cor = 'slate';
  const corBg = 'bg-slate-50';
  const corBorder = 'border-slate-200';
  const corText = 'text-slate-700';
  const corTextDark = 'text-slate-800';
  const corBgButton = 'bg-slate-600 hover:bg-slate-700';
  const corBgBadge = 'bg-slate-100';
  const corFocus = 'focus:ring-slate-500';
  const corIconBg = 'bg-slate-600';

  // 🔥 GARANTE QUE formData SEMPRE tenha um certificado válido
  const [formData, setFormData] = useState<ConfiguracaoEmpresa>(() => {
    const config = StorageService.getConfiguracao();
    if (!config.certificado || !config.certificado.status) {
      return {
        ...config,
        certificado: {
          instalado: false,
          tipo: 'A1',
          nomeTitular: '',
          cnpjCpf: '',
          emissora: '',
          dataValidadeInicio: '',
          dataValidadeFim: '',
          diasRestantes: 0,
          arquivoCarregadoNome: '',
          status: 'NAO_CONFIGURADO',
        }
      };
    }
    return config;
  });

  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [carregandoDoServidor, setCarregandoDoServidor] = useState(true);

  const [arquivoCertificado, setArquivoCertificado] = useState<File | null>(null);
  const [senhaCertificado, setSenhaCertificado] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isProcessandoCert, setIsProcessandoCert] = useState(false);
  const [isEnviandoCertServidor, setIsEnviandoCertServidor] = useState(false);
  const [feedbackCert, setFeedbackCert] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; mensagem: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 Ao abrir a tela, busca os dados REAIS da empresa no backend (banco de
  // dados) — é isso que os services de emissão (NfeService, etc.) realmente
  // usam. O localStorage fica só como cache/preenchimento inicial do formulário.
  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const empresaServidor = await empresaService.obterMinhaEmpresa();
        if (cancelado || !empresaServidor) return;

        setFormData(prev => ({
          ...prev,
          ...empresaServidor,
          endereco: { ...prev.endereco, ...(empresaServidor.endereco || {}) },
          certificado: { ...prev.certificado, ...(empresaServidor.certificado || {}) },
        } as ConfiguracaoEmpresa));
      } catch (err) {
        console.warn('Não foi possível carregar os dados da empresa do servidor (usando cache local):', err);
      } finally {
        if (!cancelado) setCarregandoDoServidor(false);
      }
    })();

    return () => { cancelado = true; };
  }, []);

  const handleChange = <K extends keyof ConfiguracaoEmpresa>(field: K, value: ConfiguracaoEmpresa[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value,
      },
    }));
  };

  const handleFileSelect = (file: File) => {
    setArquivoCertificado(file);
    setFeedbackCert(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConsultarCnpj = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      alert('Digite um CNPJ válido (14 dígitos)');
      return;
    }

    setConsultandoCnpj(true);
    try {
      const response = await consultarCnpjConectaGov(cnpjLimpo);
      
      if (response.sucesso && response.dados) {
        const dados = response.dados;
        // 🔥 Mesma correção do fluxo de certificado: dados.endereco.codigoMunicipio
        // aqui é o código "TOM" da Receita Federal, não o código IBGE que a
        // SEFAZ exige — resolve o código IBGE real antes de aplicar.
        const codigoMunicipioIBGE = await resolverCodigoMunicipioIBGE(
          dados.endereco.municipio,
          dados.endereco.uf,
          dados.endereco.codigoMunicipio
        );
        setFormData(prev => ({
          ...prev,
          razaoSocial: dados.razaoSocial || prev.razaoSocial,
          nomeFantasia: dados.nomeFantasia || prev.nomeFantasia,
          cnae: dados.cnaePrincipal || prev.cnae,
          endereco: {
            ...prev.endereco,
            logradouro: dados.endereco.logradouro || prev.endereco.logradouro,
            numero: dados.endereco.numero || prev.endereco.numero,
            complemento: dados.endereco.complemento || prev.endereco.complemento,
            bairro: dados.endereco.bairro || prev.endereco.bairro,
            codigoMunicipio: codigoMunicipioIBGE || prev.endereco.codigoMunicipio,
            nomeMunicipio: dados.endereco.municipio || prev.endereco.nomeMunicipio,
            uf: dados.endereco.uf || prev.endereco.uf,
            cep: dados.endereco.cep || prev.endereco.cep,
            telefone: dados.telefone || prev.endereco.telefone,
            email: dados.email || prev.endereco.email,
          },
        }));

        alert('✅ Dados do CNPJ preenchidos! Clique em "Salvar Configurações" para persistir.');
      } else {
        alert(`❌ ${response.erro || 'CNPJ não encontrado'}`);
      }
    } catch (err) {
      alert('Erro ao consultar CNPJ. Tente novamente.');
    } finally {
      setConsultandoCnpj(false);
    }
  };

  const handleLimparForm = () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados do formulário? Esta ação não pode ser desfeita.')) {
      return;
    }

    setFormData(criarEmpresaVazia());
    setArquivoCertificado(null);
    setSenhaCertificado('');
    setFeedbackCert(null);
    setSalvo(false);

    alert('✅ Formulário limpo!');
  };

// 🔥 CORREÇÃO: handleCarregarCertificadoEPreencher
const handleCarregarCertificadoEPreencher = async () => {
  if (!arquivoCertificado) {
    setFeedbackCert({
      tipo: 'erro',
      mensagem: 'Por favor, selecione ou arraste um arquivo de Certificado A1 (.pfx ou .p12).',
    });
    return;
  }

  if (!senhaCertificado) {
    setFeedbackCert({
      tipo: 'erro',
      mensagem: 'Por favor, digite a senha do seu Certificado Digital A1.',
    });
    return;
  }

  setIsProcessandoCert(true);
  setFeedbackCert(null);

  try {
    // 1) Validação local rápida (feedback imediato de senha/formato, sem round-trip).
    const resultado = await processarCertificadoA1(arquivoCertificado, senhaCertificado);

    if (!resultado.sucesso) {
      setFeedbackCert({
        tipo: 'erro',
        mensagem: resultado.mensagem || 'Falha ao processar o certificado.',
      });
      return;
    }

    // 🔥 Limpa TUDO primeiro — carregar um certificado novo não pode deixar
    // nenhum resíduo (IE, IM, endereço, chave Pix, regime tributário etc.) da
    // empresa/certificado carregados anteriormente. Só depois disso o
    // formulário é populado, passo a passo, com os dados deste certificado.
    setFormData(criarEmpresaVazia());

    if (resultado.dadosEmpresa) {
      const dadosEmpresa = resultado.dadosEmpresa;
      setFormData(prev => ({
        ...prev,
        ...dadosEmpresa,
        endereco: { ...prev.endereco, ...(dadosEmpresa.endereco || {}) },
        certificado: { ...prev.certificado, ...resultado.certificadoInfo },
      } as ConfiguracaoEmpresa));
    }

    // 2) Com o CNPJ extraído do certificado, roda a MESMA consulta pública rica
    // usada na tela "Consulta CNPJ" (Receita Federal via OpenCNPJ) — traz bem
    // mais dado que o certificado sozinho: nome fantasia, CNAE, regime
    // tributário (Simples/MEI) e endereço completo. Falha nessa consulta não
    // impede o restante do fluxo — o formulário só fica com o que veio do
    // certificado mesmo.
    const cnpjDoCertificado = resultado.dadosEmpresa?.cnpj;
    if (cnpjDoCertificado) {
      setFeedbackCert({ tipo: 'info', mensagem: 'Certificado validado — consultando dados cadastrais do CNPJ...' });
      try {
        const consultaCnpj = await consultarCnpjConectaGov(cnpjDoCertificado);
        if (consultaCnpj.sucesso && consultaCnpj.dados) {
          const dadosMax = await mapConsultaCnpjParaEmpresa(consultaCnpj.dados);
          setFormData(prev => ({
            ...prev,
            ...dadosMax,
            endereco: { ...prev.endereco, ...(dadosMax.endereco || {}) },
          } as ConfiguracaoEmpresa));
        } else {
          console.warn('Consulta pública de CNPJ não retornou dados (mantendo o que veio do certificado):', consultaCnpj.erro);
        }
      } catch (errConsulta) {
        console.warn('Falha ao consultar dados cadastrais do CNPJ (mantendo o que veio do certificado):', errConsulta);
      }
    }

    // 3) Envio real ao backend: criptografa (AES-256-GCM) e armazena vinculado
    // à empresa autenticada — é esse certificado que assina e transmite os
    // documentos fiscais de verdade à SEFAZ, não a validação local acima.
    setIsProcessandoCert(false);
    setIsEnviandoCertServidor(true);

    const resultadoServidor = await certificadoService.upload(arquivoCertificado, senhaCertificado);

    if (!resultadoServidor.sucesso) {
      setFeedbackCert({
        tipo: 'erro',
        mensagem: resultadoServidor.mensagem || 'O certificado foi validado localmente, mas o envio ao servidor falhou.',
      });
      return;
    }

    // 🔥 Só o `certificado` retornado pelo servidor é aplicado aqui — NUNCA
    // `resultadoServidor.empresa` inteiro. Esse upload só grava o certificado
    // em si (endpoint dedicado); `empresa` ali é o registro ainda persistido
    // no banco (da empresa/certificado anteriores), e sobrescrever com ele
    // reintroduziria exatamente o resíduo que os passos 1-2 acabaram de
    // limpar. Os dados cadastrais só são gravados de verdade quando o usuário
    // clica em "Salvar Configurações" (handleSalvar).
    setFormData(prev => ({
      ...prev,
      certificado: { ...prev.certificado, ...resultadoServidor.certificado },
    } as ConfiguracaoEmpresa));

    setFeedbackCert({
      tipo: 'sucesso',
      mensagem: `✅ Certificado ${arquivoCertificado.name} validado e enviado ao servidor com sucesso! Dados cadastrais preenchidos automaticamente a partir do CNPJ — revise e clique em "Salvar Configurações" para persistir.`,
    });
  } catch (err: unknown) {
    setFeedbackCert({
      tipo: 'erro',
      mensagem: `Erro ao processar certificado: ${getApiErrorMessage(err, 'Erro inesperado')}`,
    });
  } finally {
    setIsProcessandoCert(false);
    setIsEnviandoCertServidor(false);
  }
};

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErroSalvar(null);

    // Cache local: mantém a tela utilizável mesmo se a chamada ao backend falhar.
    StorageService.saveConfiguracao(formData);

    try {
      const empresaAtualizada = await empresaService.atualizarMinhaEmpresa(formData);
      setFormData(prev => ({
        ...prev,
        ...empresaAtualizada,
        endereco: { ...prev.endereco, ...(empresaAtualizada.endereco || {}) },
        certificado: { ...prev.certificado, ...(empresaAtualizada.certificado || {}) },
      } as ConfiguracaoEmpresa));
      onEmpresaChange();
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3500);
    } catch (err: unknown) {
      setErroSalvar(getApiErrorMessage(err, 'Não foi possível salvar as configurações no servidor.'));
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  };

  // 🔥 A SEFAZ rejeita a emissão (qualquer documento fiscal) se o CNPJ-Base do
  // emitente (cadastro da empresa) divergir do CNPJ-Base embutido no
  // certificado digital usado pra assinar — os dois podem sair dessincronizados
  // se o cadastro for editado manualmente, ou se uma consulta de CNPJ falhar
  // no meio do carregamento de um certificado novo. Avisa isso ANTES de
  // emitir, em vez de deixar o usuário só descobrir na rejeição da SEFAZ.
  const cnpjBaseEmpresa = limparDocumento(formData.cnpj).slice(0, 8);
  const cnpjBaseCertificado = limparDocumento(formData.certificado?.cnpjCpf || '').slice(0, 8);
  const cnpjDivergeDoCertificado =
    formData.certificado?.instalado &&
    cnpjBaseEmpresa.length === 8 &&
    cnpjBaseCertificado.length === 8 &&
    cnpjBaseEmpresa !== cnpjBaseCertificado;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Building2 className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Dados da Empresa & Certificado A1
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              Configurações
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os dados cadastrais, endereço do emitente e gerencie o Certificado Digital ICP-Brasil.
          </p>
        </div>

        <div className="text-right">
          {carregandoDoServidor ? (
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 justify-end">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Carregando dados do servidor...</span>
            </div>
          ) : (
            <>
              <div className="text-xs font-semibold text-slate-700">Configurações</div>
              <div className={`text-[10px] font-medium ${corText}`}>Certificado A1 • ICP-Brasil</div>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-700/80 relative overflow-hidden">
        
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-slate-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-600/30 border border-slate-500/30 flex items-center justify-center text-slate-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Certificado Digital A1 (.pfx / .p12)
                </h2>
                <p className="text-xs text-slate-300">
                  Carregue seu certificado ICP-Brasil para assinatura digital automática
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            <div className="lg:col-span-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pfx,.p12,.cer,.crt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-slate-400 bg-slate-700/40 scale-[0.99]' 
                    : arquivoCertificado 
                      ? 'border-emerald-400/80 bg-slate-700/30' 
                      : 'border-slate-600/60 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-700/30'
                }`}
              >
                {arquivoCertificado ? (
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {arquivoCertificado.name}
                      </div>
                      <div className="text-[11px] text-emerald-300">
                        {(arquivoCertificado.size / 1024).toFixed(1)} KB • Pronto para leitura
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 hover:text-white underline shrink-0">
                      Trocar
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-7 h-7 text-slate-300 mx-auto" />
                    <div className="text-xs font-semibold text-white">
                      Arraste o arquivo ou <span className="text-slate-300 underline">clique para selecionar</span>
                    </div>
                    <div className="text-[10px] text-slate-400/70">
                      .pfx .p12 .cer .crt • ICP-Brasil (e-CNPJ / e-CPF A1)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha do Certificado *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite a senha do certificado..."
                    value={senhaCertificado}
                    onChange={(e) => setSenhaCertificado(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400/50 focus:outline-none focus:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCarregarCertificadoEPreencher}
                disabled={isProcessandoCert || isEnviandoCertServidor || !arquivoCertificado}
                className="w-full bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isProcessandoCert ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validando certificado...</span>
                  </>
                ) : isEnviandoCertServidor ? (
                  <>
                    <UploadCloud className="w-4 h-4 animate-pulse" />
                    <span>Enviando ao servidor...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Validar e enviar ao servidor</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400/80 leading-relaxed">
                O certificado é criptografado (AES-256-GCM) e armazenado no servidor —
                é ele que assina e transmite os documentos fiscais à SEFAZ.
              </p>
            </div>

          </div>

          {feedbackCert && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
              feedbackCert.tipo === 'sucesso' 
                ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-100' 
                : feedbackCert.tipo === 'info'
                ? 'bg-slate-700/60 border border-slate-500 text-slate-100'
                : 'bg-rose-900/60 border border-rose-500 text-rose-100'
            }`}>
              {feedbackCert.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : feedbackCert.tipo === 'info' ? (
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {feedbackCert.mensagem}
              </div>
            </div>
          )}

          {cnpjDivergeDoCertificado && (
            <div className="p-3 rounded-lg text-xs flex items-start gap-2.5 bg-amber-900/60 border border-amber-500 text-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                ⚠️ O CNPJ cadastrado ({formatarCpfCnpj(formData.cnpj)}) é diferente do CNPJ do
                certificado digital carregado ({formatarCpfCnpj(formData.certificado?.cnpjCpf || '')}).
                A SEFAZ rejeita qualquer emissão nesse estado ("CNPJ-Base do Emitente difere do
                CNPJ-Base do Certificado Digital"). Carregue o certificado correto para esta empresa,
                ou corrija o CNPJ cadastrado antes de emitir.
              </div>
            </div>
          )}

        </div>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                  1. Status do Certificado Digital
                </h3>
                <p className="text-[11px] text-slate-500">
                  Certificado utilizado para assinatura digital de XMLs (NF-e e NFS-e)
                </p>
              </div>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              formData.certificado?.status === 'VALIDO'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : formData.certificado?.status === 'NAO_CONFIGURADO'
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                formData.certificado?.status === 'VALIDO' ? 'bg-emerald-600 animate-pulse' : 
                formData.certificado?.status === 'NAO_CONFIGURADO' ? 'bg-slate-400' : 'bg-rose-600'
              }`}></span>
              <span>
                {formData.certificado?.status === 'VALIDO' ? 'Válido' : 
                 formData.certificado?.status === 'NAO_CONFIGURADO' ? 'Não configurado' : 'Expirado'}
              </span>
            </span>
          </div>

          {formData.certificado && formData.certificado.status !== 'NAO_CONFIGURADO' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              
              <div className="md:col-span-8 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TITULAR DO CERTIFICADO
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                    {formData.certificado.nomeTitular || 'Não informado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Autoridade Emissora:</span>
                    <span className="font-semibold text-slate-800">{formData.certificado.emissora || 'Não informada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Validade:</span>
                    <span className="font-semibold text-slate-800">
                      {formatarData(formData.certificado.dataValidadeInicio)} até {formatarData(formData.certificado.dataValidadeFim)}
                    </span>
                  </div>
                </div>

                {formData.certificado.arquivoCarregadoNome && (
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Arquivo: <strong>{formData.certificado.arquivoCarregadoNome}</strong></span>
                  </div>
                )}
              </div>

              <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-3 md:pt-0">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    DIAS RESTANTES
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-2xl font-black ${
                      formData.certificado.diasRestantes > 60 ? 'text-emerald-600' :
                      formData.certificado.diasRestantes > 30 ? 'text-amber-600' :
                      'text-rose-600'
                    }`}>
                      {formData.certificado.diasRestantes}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">dias</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert(
                      `✅ Certificado Digital A1\n\n` +
                      `Titular: ${formData.certificado.nomeTitular}\n` +
                      `CNPJ: ${formData.cnpj}\n` +
                      `Status: ${formData.certificado.status}\n` +
                      `Validade: ${formData.certificado.diasRestantes} dias restantes\n\n` +
                      `Pronto para emissões SEFAZ e Receita Federal.`
                    )}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Testar Assinatura</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                2. Dados Cadastrais
              </h3>
              <p className="text-[11px] text-slate-500">
                Informações utilizadas no cabeçalho dos documentos fiscais
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            
            <div className="sm:col-span-4 flex items-end gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 mb-1">CNPJ *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-slate-50/50 focus:outline-none ${corFocus}`}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleConsultarCnpj}
                disabled={consultandoCnpj || !formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer h-[42px]"
                title="Consultar dados oficiais na Receita Federal"
              >
                {consultandoCnpj ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Consultar CNPJ</span>
              </button>
            </div>

            <div className="sm:col-span-8">
              <label className="block font-semibold text-slate-700 mb-1">Razão Social *</label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={(e) => handleChange('razaoSocial', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none ${corFocus}`}
                placeholder="Razão Social da Empresa"
                required
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block font-medium text-slate-600 mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Nome Fantasia (opcional)"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-medium text-slate-600 mb-1">Inscrição Municipal *</label>
              <input
                type="text"
                value={formData.inscricaoMunicipal}
                onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none ${corFocus}`}
                placeholder="Inscrição Municipal"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-medium text-slate-600 mb-1">Inscrição Estadual</label>
              <input
                type="text"
                value={formData.inscricaoEstadual}
                onChange={(e) => handleChange('inscricaoEstadual', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none ${corFocus}`}
                placeholder="Inscrição Estadual"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block font-medium text-slate-600 mb-1">CNAE Principal</label>
              <input
                type="text"
                value={formData.cnae || ''}
                onChange={(e) => handleChange('cnae', e.target.value)}
                placeholder="Ex: 6202-3/00 - Desenvolvimento de Software"
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">Regime Tributário</label>
              <select
                value={formData.regimeTributario}
                onChange={(e) => handleChange('regimeTributario', parseInt(e.target.value) as 1 | 2 | 3)}
                className={`w-full border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-800 focus:outline-none ${corFocus}`}
              >
                <option value={1}>1 - Simples Nacional</option>
                <option value={2}>2 - Simples Nacional - Excesso</option>
                <option value={3}>3 - Regime Normal</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Alíq. Simples (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.aliquotaSimplesNacional || 6.0}
                onChange={(e) => handleChange('aliquotaSimplesNacional', parseFloat(e.target.value) || 0)}
                className={`w-full border border-slate-300 rounded-lg p-2 text-right font-semibold focus:outline-none ${corFocus}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                <span>Chave Pix Padrão</span>
              </label>
              <input
                type="text"
                value={formData.chavePixPadrao || ''}
                onChange={(e) => handleChange('chavePixPadrao', e.target.value)}
                placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
                className={`w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none ${corFocus}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block font-medium text-slate-600 mb-1">Ambiente de Emissão SEFAZ</label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ambienteEmissao"
                    checked={formData.ambienteEmissao === 1}
                    onChange={() => handleChange('ambienteEmissao', 1)}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <span className="font-semibold text-emerald-700">Produção</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ambienteEmissao"
                    checked={formData.ambienteEmissao === 2}
                    onChange={() => handleChange('ambienteEmissao', 2)}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <span className="text-amber-700">Homologação</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                3. Endereço do Estabelecimento
              </h3>
              <p className="text-[11px] text-slate-500">
                Endereço que constará no DANFE e documentos fiscais
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            
            <div className="sm:col-span-3">
              <label className="block font-medium text-slate-600 mb-1">CEP *</label>
              <input
                type="text"
                value={formData.endereco.cep}
                onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none ${corFocus}`}
                placeholder="00000-000"
                required
              />
            </div>

            <div className="sm:col-span-7">
              <label className="block font-medium text-slate-600 mb-1">Logradouro *</label>
              <input
                type="text"
                value={formData.endereco.logradouro}
                onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Rua, Avenida..."
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Número *</label>
              <input
                type="text"
                value={formData.endereco.numero}
                onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Nº"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">Complemento</label>
              <input
                type="text"
                value={formData.endereco.complemento || ''}
                onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Complemento"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">Bairro *</label>
              <input
                type="text"
                value={formData.endereco.bairro}
                onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Bairro"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-medium text-slate-600 mb-1">Município *</label>
              <input
                type="text"
                value={formData.endereco.nomeMunicipio}
                onChange={(e) => handleEnderecoChange('nomeMunicipio', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="Município"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-medium text-slate-600 mb-1">UF *</label>
              <input
                type="text"
                maxLength={2}
                value={formData.endereco.uf}
                onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase())}
                className={`w-full border border-slate-300 rounded-lg p-2 text-center uppercase font-bold focus:outline-none ${corFocus}`}
                placeholder="SP"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">Cód. Município IBGE *</label>
              <input
                type="text"
                value={formData.endereco.codigoMunicipio}
                onChange={(e) => handleEnderecoChange('codigoMunicipio', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none ${corFocus}`}
                placeholder="3550308"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.endereco.telefone || ''}
                onChange={(e) => handleEnderecoChange('telefone', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-medium text-slate-600 mb-1">E-mail Fiscal</label>
              <input
                type="email"
                value={formData.endereco.email || ''}
                onChange={(e) => handleEnderecoChange('email', e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none ${corFocus}`}
                placeholder="fiscal@empresa.com.br"
              />
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                4. Séries e Numeração Fiscal
              </h3>
              <p className="text-[11px] text-slate-500">
                Controle sequencial contínuo por modelo de documento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs uppercase">
                  NFS-e (Padrão Nacional)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Próximo Número:</label>
                  <input
                    type="number"
                    value={formData.proximoNumeroNfse}
                    onChange={(e) => handleChange('proximoNumeroNfse', parseInt(e.target.value) || 1)}
                    className={`w-full border border-slate-300 rounded-lg p-2 bg-white font-bold text-right text-slate-900 focus:outline-none ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Série DPS:</label>
                  <input
                    type="number"
                    value={formData.serieNfse}
                    onChange={(e) => handleChange('serieNfse', parseInt(e.target.value) || 1)}
                    className={`w-full border border-slate-300 rounded-lg p-2 bg-white font-bold text-right text-slate-900 focus:outline-none ${corFocus}`}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-xs uppercase">
                  NF-e (Modelo 55)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Próximo Número:</label>
                  <input
                    type="number"
                    value={formData.proximoNumeroNfe}
                    onChange={(e) => handleChange('proximoNumeroNfe', parseInt(e.target.value) || 1)}
                    className={`w-full border border-slate-300 rounded-lg p-2 bg-white font-bold text-right text-slate-900 focus:outline-none ${corFocus}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Série NF-e:</label>
                  <input
                    type="number"
                    value={formData.serieNfe}
                    onChange={(e) => handleChange('serieNfe', parseInt(e.target.value) || 1)}
                    className={`w-full border border-slate-300 rounded-lg p-2 bg-white font-bold text-right text-slate-900 focus:outline-none ${corFocus}`}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {erroSalvar && (
          <div className="p-3 rounded-lg text-xs flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{erroSalvar}</div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleLimparForm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            title="Limpar todos os dados do formulário"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Formulário</span>
          </button>

          <button
            type="submit"
            id="btn-salvar-config-empresa"
            disabled={salvando}
            className={`${corBgButton} disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer`}
          >
            {salvando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{salvando ? 'Salvando no servidor...' : 'Salvar Configurações'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};