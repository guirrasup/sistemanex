// src/components/cadastros/TransportadorasView.tsx

import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MapPin,
  Phone,
  Mail,
  Building2,
  Hash,
  CreditCard,
  QrCode,
  User,
  Globe,
  X,
  Save,
  UserCog,
  Info,
  Banknote,
  FileText
} from 'lucide-react';
import { Transportadora } from '../../services/transportadora.service';
import { formatarCpfCnpj, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';
import { transportadoraService } from '../../services/transportadora.service';

interface TransportadorasViewProps {
  transportadoras: Transportadora[];
  onTransportadorasChange: () => void;
}

type OrdenacaoCampo = 'razaoSocial' | 'nomeFantasia' | 'cnpj' | 'email' | 'telefone' | 'endereco.nomeMunicipio' | 'endereco.uf' | 'tipoTransportador';
type OrdenacaoDirecao = 'asc' | 'desc';
type AbaAtiva = 'dados' | 'transporte' | 'contato' | 'bancario' | 'endereco';

export const TransportadorasView: React.FC<TransportadorasViewProps> = ({ 
  transportadoras, 
  onTransportadorasChange 
}) => {
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Transportadora | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('dados');

  // 🔥 ESTADO DE ORDENAÇÃO
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<OrdenacaoCampo>('razaoSocial');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<OrdenacaoDirecao>('asc');

  // 🔥 COR DO MÓDULO (CIANO)
  const cor = 'cyan';
  const corBg = 'bg-cyan-50';
  const corBorder = 'border-cyan-200';
  const corText = 'text-cyan-700';
  const corTextDark = 'text-cyan-800';
  const corBgButton = 'bg-cyan-600 hover:bg-cyan-700';
  const corBgBadge = 'bg-cyan-100';
  const corFocus = 'focus:ring-cyan-500';
  const corIconBg = 'bg-cyan-600';

  // Form State
  const [tipoPessoa, setTipoPessoa] = useState<'PJ' | 'PF' | 'EXTERIOR'>('PJ');
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [cnae, setCnae] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celularWhatsApp, setCelularWhatsApp] = useState('');
  const [contato, setContato] = useState('');
  const [site, setSite] = useState('');
  const [rntrc, setRntrc] = useState('');
  const [antt, setAntt] = useState('');
  const [inscricaoSuframa, setInscricaoSuframa] = useState('');
  const [regimeTributario, setRegimeTributario] = useState<'SIMPLES_NACIONAL' | 'SIMPLES_EXCESSO' | 'NORMAL'>('SIMPLES_NACIONAL');
  const [tipoTransportador, setTipoTransportador] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [operacao, setOperacao] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Endereço
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [nomeMunicipio, setNomeMunicipio] = useState('São Paulo');
  const [codigoMunicipio, setCodigoMunicipio] = useState('3550308');
  const [uf, setUf] = useState('SP');
  const [cep, setCep] = useState('');

  const handleOpenNovo = () => {
    setEditando(null);
    setErro(null);
    setAbaAtiva('dados');
    setTipoPessoa('PJ');
    setCnpj('');
    setRazaoSocial('');
    setNomeFantasia('');
    setInscricaoEstadual('');
    setInscricaoMunicipal('');
    setCnae('');
    setEmail('');
    setTelefone('');
    setCelularWhatsApp('');
    setContato('');
    setSite('');
    setRntrc('');
    setAntt('');
    setInscricaoSuframa('');
    setRegimeTributario('SIMPLES_NACIONAL');
    setTipoTransportador('RODOVIARIO');
    setBanco('');
    setAgencia('');
    setConta('');
    setOperacao('');
    setChavePix('');
    setObservacoes('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setNomeMunicipio('São Paulo');
    setCodigoMunicipio('3550308');
    setUf('SP');
    setCep('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Transportadora) => {
    setEditando(t);
    setErro(null);
    setAbaAtiva('dados');
    setTipoPessoa(t.tipoPessoa);
    setCnpj(t.cnpj);
    setRazaoSocial(t.razaoSocial);
    setNomeFantasia(t.nomeFantasia || '');
    setInscricaoEstadual(t.inscricaoEstadual || '');
    setInscricaoMunicipal(t.inscricaoMunicipal || '');
    setCnae(t.cnae || '');
    setEmail(t.email || '');
    setTelefone(t.telefone || '');
    setCelularWhatsApp(t.celularWhatsApp || '');
    setContato(t.contato || '');
    setSite(t.site || '');
    setRntrc(t.rntrc || '');
    setAntt(t.antt || '');
    setInscricaoSuframa(t.inscricaoSuframa || '');
    setRegimeTributario(t.regimeTributario || 'SIMPLES_NACIONAL');
    setTipoTransportador(t.tipoTransportador || '');
    setBanco(t.banco || '');
    setAgencia(t.agencia || '');
    setConta(t.conta || '');
    setOperacao(t.operacao || '');
    setChavePix(t.chavePix || '');
    setObservacoes(t.observacoes || '');
    setLogradouro(t.endereco.logradouro);
    setNumero(t.endereco.numero);
    setComplemento(t.endereco.complemento || '');
    setBairro(t.endereco.bairro);
    setNomeMunicipio(t.endereco.nomeMunicipio);
    setCodigoMunicipio(t.endereco.codigoMunicipio);
    setUf(t.endereco.uf);
    setCep(t.endereco.cep);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const val = validarCpfOuCnpj(cnpj);
    if (!val.valido || val.tipo !== 'CNPJ') {
      setErro('CNPJ inválido. Digite um CNPJ válido com 14 dígitos.');
      return;
    }

    if (!razaoSocial.trim()) {
      setErro('Razão Social é obrigatória.');
      return;
    }

    if (!logradouro.trim() || !bairro.trim() || !nomeMunicipio.trim()) {
      setErro('Endereço completo é obrigatório.');
      return;
    }

    setCarregando(true);

    try {
      const dadosTransportadora = {
        tipoPessoa,
        cnpj,
        razaoSocial,
        nomeFantasia: nomeFantasia || undefined,
        inscricaoEstadual: inscricaoEstadual || undefined,
        inscricaoMunicipal: inscricaoMunicipal || undefined,
        cnae: cnae || undefined,
        email: email || undefined,
        telefone: telefone || undefined,
        celularWhatsApp: celularWhatsApp || undefined,
        contato: contato || undefined,
        site: site || undefined,
        rntrc: rntrc || undefined,
        antt: antt || undefined,
        inscricaoSuframa: inscricaoSuframa || undefined,
        regimeTributario,
        tipoTransportador: tipoTransportador || undefined,
        banco: banco || undefined,
        agencia: agencia || undefined,
        conta: conta || undefined,
        operacao: operacao || undefined,
        chavePix: chavePix || undefined,
        ativo: true,
        observacoes: observacoes || undefined,
        endereco: {
          logradouro,
          numero,
          complemento: complemento || undefined,
          bairro,
          codigoMunicipio,
          nomeMunicipio,
          uf,
          cep,
          telefone: telefone || undefined,
          email: email || undefined,
        },
      };

      if (editando) {
        await transportadoraService.atualizar(editando.id, dadosTransportadora);
      } else {
        await transportadoraService.criar(dadosTransportadora);
      }

      setModalOpen(false);
      onTransportadorasChange();

    } catch (error: any) {
      console.error('Erro ao salvar transportadora:', error);
      setErro(error.response?.data?.erro || error.message || 'Erro ao salvar transportadora. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async (id: string, razaoSocial: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${razaoSocial}"?`)) {
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      await transportadoraService.excluir(id);
      onTransportadorasChange();
    } catch (error: any) {
      console.error('Erro ao excluir transportadora:', error);
      setErro(error.response?.data?.erro || error.message || 'Erro ao excluir transportadora');
    } finally {
      setCarregando(false);
    }
  };

  const handleOrdenar = (campo: OrdenacaoCampo) => {
    if (ordenacaoCampo === campo) {
      setOrdenacaoDirecao(ordenacaoDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacaoCampo(campo);
      setOrdenacaoDirecao('asc');
    }
  };

  const transportadorasOrdenadas = useMemo(() => {
    const filtrados = transportadoras.filter(t =>
      t.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      (t.nomeFantasia && t.nomeFantasia.toLowerCase().includes(busca.toLowerCase())) ||
      t.cnpj.includes(busca) ||
      (t.rntrc && t.rntrc.includes(busca))
    );

    return [...filtrados].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      if (ordenacaoCampo === 'endereco.nomeMunicipio') {
        valorA = a.endereco.nomeMunicipio || '';
        valorB = b.endereco.nomeMunicipio || '';
      } else if (ordenacaoCampo === 'endereco.uf') {
        valorA = a.endereco.uf || '';
        valorB = b.endereco.uf || '';
      } else {
        valorA = a[ordenacaoCampo] || '';
        valorB = b[ordenacaoCampo] || '';
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacaoDirecao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return 0;
    });
  }, [transportadoras, busca, ordenacaoCampo, ordenacaoDirecao]);

  const IconeOrdenacao = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacaoCampo !== campo) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return ordenacaoDirecao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-cyan-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-cyan-600 ml-1" />;
  };

  const thClass = "py-3 px-4 text-left text-xs font-bold text-slate-700 cursor-pointer hover:text-cyan-600 transition-colors select-none";

  // 🔥 RENDERIZA O CONTEÚDO DA ABA ATIVA
  const renderAbaContent = () => {
    switch (abaAtiva) {
      case 'dados':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                <select
                  value={tipoPessoa}
                  onChange={(e) => setTipoPessoa(e.target.value as any)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                >
                  <option value="PJ">Pessoa Jurídica</option>
                  <option value="PF">Pessoa Física</option>
                  <option value="EXTERIOR">Exterior</option>
                </select>
              </div>
              <div className="sm:col-span-9">
                <label className="block font-semibold text-slate-700 mb-1">CNPJ *</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} font-mono`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razão Social *</label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inscrição Estadual</label>
                <input
                  type="text"
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inscrição Municipal</label>
                <input
                  type="text"
                  value={inscricaoMunicipal}
                  onChange={(e) => setInscricaoMunicipal(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CNAE</label>
                <input
                  type="text"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observações</label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} resize-none`}
                placeholder="Observações adicionais sobre a transportadora..."
              />
            </div>
          </div>
        );

      case 'transporte':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">RNTRC</label>
                <input
                  type="text"
                  value={rntrc}
                  onChange={(e) => setRntrc(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Registro ANTT"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ANTT</label>
                <input
                  type="text"
                  value={antt}
                  onChange={(e) => setAntt(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inscrição SUFRAMA</label>
                <input
                  type="text"
                  value={inscricaoSuframa}
                  onChange={(e) => setInscricaoSuframa(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regime Tributário</label>
                <select
                  value={regimeTributario}
                  onChange={(e) => setRegimeTributario(e.target.value as any)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                >
                  <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                  <option value="SIMPLES_EXCESSO">Simples Nacional (Excesso)</option>
                  <option value="NORMAL">Normal (Lucro Presumido/Real)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Transportador</label>
                <select
                  value={tipoTransportador}
                  onChange={(e) => setTipoTransportador(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} bg-white`}
                >
                  <option value="">Selecione...</option>
                  <option value="RODOVIARIO">Rodoviário</option>
                  <option value="FERROVIARIO">Ferroviário</option>
                  <option value="AQUAVIARIO">Aquaviário</option>
                  <option value="AEREO">Aéreo</option>
                  <option value="MULTIMODAL">Multimodal</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'contato':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  value={celularWhatsApp}
                  onChange={(e) => setCelularWhatsApp(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contato</label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site</label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
            </div>
          </div>
        );

      case 'bancario':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banco</label>
                <input
                  type="text"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agência</label>
                <input
                  type="text"
                  value={agencia}
                  onChange={(e) => setAgencia(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conta</label>
                <input
                  type="text"
                  value={conta}
                  onChange={(e) => setConta(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operação</label>
                <input
                  type="text"
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chave Pix</label>
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="CPF/CNPJ/E-mail/Telefone"
                />
              </div>
            </div>
          </div>
        );

      case 'endereco':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  placeholder="00000-000"
                />
              </div>
              <div className="sm:col-span-7">
                <label className="block font-semibold text-slate-700 mb-1">Logradouro *</label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Número *</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complemento</label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Município *</label>
                <input
                  type="text"
                  value={nomeMunicipio}
                  onChange={(e) => setNomeMunicipio(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold text-slate-700 mb-1">UF *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus} uppercase`}
                    required
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block font-semibold text-slate-700 mb-1">Cód. IBGE</label>
                  <input
                    type="text"
                    value={codigoMunicipio}
                    onChange={(e) => setCodigoMunicipio(e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 ${corFocus}`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 🔥 HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Truck className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Transportadoras</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {transportadoras.length} cadastros
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de transportadoras com dados fiscais e de RNTRC/ANTT.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Cadastro de Transportadoras</div>
          <div className={`text-[10px] font-medium ${corText}`}>
            {transportadoras.filter(t => t.ativo).length} ativas
          </div>
        </div>
      </div>

      {/* Busca e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Buscar por Razão Social, CNPJ ou RNTRC..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs px-2 py-1 focus:outline-none"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="text-xs text-slate-400 hover:text-slate-600 px-2">✕</button>
          )}
        </div>

        <button
          onClick={handleOpenNovo}
          disabled={carregando}
          className={`${corBgButton} text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Transportadora</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => handleOrdenar('razaoSocial')}>
                  <div className="flex items-center">Razão Social <IconeOrdenacao campo="razaoSocial" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('cnpj')}>
                  <div className="flex items-center">CNPJ <IconeOrdenacao campo="cnpj" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('tipoTransportador')}>
                  <div className="flex items-center">Tipo <IconeOrdenacao campo="tipoTransportador" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('email')}>
                  <div className="flex items-center">Contato <IconeOrdenacao campo="email" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('endereco.nomeMunicipio')}>
                  <div className="flex items-center">Cidade / UF <IconeOrdenacao campo="endereco.nomeMunicipio" /></div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transportadorasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhuma transportadora encontrada</p>
                    <p className="text-xs text-slate-400">
                      {busca ? 'Tente ajustar os termos da busca' : 'Clique em "Nova Transportadora" para começar'}
                    </p>
                  </td>
                </tr>
              ) : (
                transportadorasOrdenadas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{t.razaoSocial}</div>
                      {t.nomeFantasia && <div className="text-[10px] text-slate-400 font-normal">{t.nomeFantasia}</div>}
                      {t.rntrc && <div className="text-[10px] text-slate-500 font-mono">RNTRC: {t.rntrc}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono">{formatarCpfCnpj(t.cnpj)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        t.tipoTransportador === 'RODOVIARIO' ? 'bg-blue-100 text-blue-800' :
                        t.tipoTransportador === 'FERROVIARIO' ? 'bg-amber-100 text-amber-800' :
                        t.tipoTransportador === 'AQUAVIARIO' ? 'bg-cyan-100 text-cyan-800' :
                        t.tipoTransportador === 'AEREO' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.tipoTransportador || 'Não informado'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{t.email || '-'}</div>
                      <div className="text-[10px] text-slate-400">{t.telefone || '-'}</div>
                      {t.contato && <div className="text-[10px] text-slate-500">Contato: {t.contato}</div>}
                    </td>
                    <td className="py-3 px-4">{t.endereco.nomeMunicipio} - {t.endereco.uf}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {t.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(t.id, t.razaoSocial)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MODAL COM ABAS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-xl flex flex-col max-h-[95vh]">
            
            {/* 🔥 HEADER DO MODAL COM BOTÃO FECHAR */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <Truck className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {editando ? 'Editar Transportadora' : 'Nova Transportadora'}
                </h2>
                {editando && (
                  <span className="text-xs text-slate-400 font-mono">
                    #{editando.cnpj}
                  </span>
                )}
              </div>
              
              {/* 🔥 BOTÃO FECHAR VISÍVEL */}
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 🔥 ABAS */}
            <div className="flex border-b border-slate-200 px-4 pt-2 gap-1 overflow-x-auto">
              <button
                onClick={() => setAbaAtiva('dados')}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  abaAtiva === 'dados'
                    ? `bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Dados
              </button>
              <button
                onClick={() => setAbaAtiva('transporte')}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  abaAtiva === 'transporte'
                    ? `bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Transporte
              </button>
              <button
                onClick={() => setAbaAtiva('contato')}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  abaAtiva === 'contato'
                    ? `bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                Contato
              </button>
              <button
                onClick={() => setAbaAtiva('bancario')}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  abaAtiva === 'bancario'
                    ? `bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Bancário
              </button>
              <button
                onClick={() => setAbaAtiva('endereco')}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  abaAtiva === 'endereco'
                    ? `bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Endereço
              </button>
            </div>

            {/* 🔥 CORPO DO MODAL */}
            <div className="flex-1 overflow-y-auto p-6">
              {erro && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {renderAbaContent()}

                {/* 🔥 BOTÕES DO FORMULÁRIO */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm cursor-pointer transition-colors"
                    disabled={carregando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={carregando}
                    className={`px-6 py-2 rounded-lg ${corBgButton} text-white font-medium shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors text-sm`}
                  >
                    {carregando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Transportadora</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};