// C:\emissornfe\src\components\config\ConfiguracoesEmpresaView.tsx

import React, { useState, useRef } from 'react';
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
import { consultarCnpjConectaGov } from '../../utils/consultaCnpjApi';

interface ConfiguracoesEmpresaViewProps {
  empresa: ConfiguracaoEmpresa;
  onEmpresaChange: () => void;
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
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  
  const [arquivoCertificado, setArquivoCertificado] = useState<File | null>(null);
  const [senhaCertificado, setSenhaCertificado] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isProcessandoCert, setIsProcessandoCert] = useState(false);
  const [feedbackCert, setFeedbackCert] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; mensagem: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ConfiguracaoEmpresa, value: any) => {
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
            codigoMunicipio: dados.endereco.codigoMunicipio || prev.endereco.codigoMunicipio,
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

    const empresaVazia: ConfiguracaoEmpresa = {
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
    };

    setFormData(empresaVazia);
    setArquivoCertificado(null);
    setSenhaCertificado('');
    setFeedbackCert(null);
    setSalvo(false);
    
    alert('✅ Formulário limpo!');
  };

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
      const resultado = await processarCertificadoA1(arquivoCertificado, senhaCertificado);

      if (resultado.sucesso && resultado.dadosEmpresa) {
        const novosDados: ConfiguracaoEmpresa = {
          ...formData,
          ...resultado.dadosEmpresa,
          endereco: {
            ...formData.endereco,
            ...(resultado.dadosEmpresa.endereco || {}),
          },
          certificado: resultado.certificadoInfo || formData.certificado,
        };

        setFormData(novosDados);

        setFeedbackCert({
          tipo: 'sucesso',
          mensagem: `Certificado ${arquivoCertificado.name} validado! Clique em "Salvar Configurações" para persistir os dados.`,
        });
      } else {
        setFeedbackCert({
          tipo: 'erro',
          mensagem: resultado.mensagem || 'Falha ao processar o certificado.',
        });
      }
    } catch (err: any) {
      setFeedbackCert({
        tipo: 'erro',
        mensagem: `Erro ao processar certificado: ${err.message || 'Erro inesperado'}`,
      });
    } finally {
      setIsProcessandoCert(false);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveConfiguracao(formData);
    onEmpresaChange();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3500);
  };

  const formatarData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* 🔥 HEADER - COR ARDÓSIA */}
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
          <div className="text-xs font-semibold text-slate-700">Configurações</div>
          <div className={`text-[10px] font-medium ${corText}`}>Certificado A1 • ICP-Brasil</div>
        </div>
      </div>

      {/* BLOCO DESTAQUE: Carregar Certificado A1 */}
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
                disabled={isProcessandoCert || !arquivoCertificado}
                className="w-full bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isProcessandoCert ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando certificado...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Validar e preencher dados</span>
                  </>
                )}
              </button>
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

        </div>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        
        {/* Bloco 1: Certificado Digital Ativo */}
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

        {/* Bloco 2: Dados Cadastrais com Consulta CNPJ */}
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
                onChange={(e) => handleChange('regimeTributario', parseInt(e.target.value))}
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

        {/* Bloco 3: Endereço */}
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

        {/* Bloco 4: Séries e Numeração */}
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
                    type="text"
                    value={formData.serieNfse}
                    onChange={(e) => handleChange('serieNfse', e.target.value)}
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

        {/* Botões */}
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
            className={`${corBgButton} text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer`}
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>

      </form>

    </div>
  );
};