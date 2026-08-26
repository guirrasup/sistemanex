import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Truck, 
  QrCode, 
  Barcode, 
  MapPin, 
  Navigation,
  FileText
} from 'lucide-react';
import { CTeDocumento } from '../../types/fiscal';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface DacteViewerProps {
  cte: CTeDocumento;
  onBack: () => void;
}

export const DacteViewer: React.FC<DacteViewerProps> = ({ cte, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([cte.xmlAssinado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CTe_${cte.numero}_${cte.chaveAcesso.slice(-8)}.xml`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Barra de Ações */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 print:hidden">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Emissão</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadXml}
            className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-1.5 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DACTE</span>
          </button>
        </div>
      </div>

      {/* DACTE Oficial CT-e */}
      <div className="bg-white border-2 border-slate-800 p-4 font-sans text-xs text-slate-900 space-y-2.5 print:border print:m-0 print:p-2">
        
        {/* Cabeçalho */}
        <div className="grid grid-cols-12 border-b-2 border-slate-800 pb-2 gap-2">
          
          {/* Dados do Emitente */}
          <div className="col-span-5 border-r border-slate-400 pr-2 space-y-0.5">
            <div className="font-extrabold text-sm uppercase leading-tight">{cte.emitente.razaoSocial}</div>
            <div className="text-[10px] text-slate-600">{cte.emitente.nomeFantasia || 'Transportes e Logística'}</div>
            <div className="text-[10px] text-slate-700 leading-tight">
              {cte.emitente.endereco.logradouro}, {cte.emitente.endereco.numero} - {cte.emitente.endereco.bairro}<br />
              {cte.emitente.endereco.nomeMunicipio}/{cte.emitente.endereco.uf} - CEP: {cte.emitente.endereco.cep}
            </div>
            <div className="text-[10px] font-semibold pt-0.5">
              CNPJ: {formatarCpfCnpj(cte.emitente.cnpj)} • IE: {cte.emitente.inscricaoEstadual}
            </div>
          </div>

          {/* DACTE Identificação */}
          <div className="col-span-3 text-center border-r border-slate-400 px-2 flex flex-col justify-center">
            <div className="font-black text-sm uppercase tracking-wider">DACTE</div>
            <div className="text-[9px] uppercase leading-tight font-medium">
              Documento Auxiliar do Conhecimento de Transporte Eletrônico
            </div>
            <div className="mt-1 text-[11px] font-bold">
              MOD: {cte.modelo} • SÉRIE: {cte.serie}
            </div>
            <div className="text-xs font-black">
              Nº {cte.numero.toString().padStart(9, '0')}
            </div>
          </div>

          {/* Chave de Acesso e Código de Barras */}
          <div className="col-span-4 pl-2 flex flex-col justify-center space-y-1">
            <div className="bg-slate-100 p-1 border border-slate-300 text-center font-mono text-[9px] font-bold tracking-wider">
              {cte.chaveAcesso.replace(/(\d{4})/g, '$1 ')}
            </div>
            <div className="text-[9px] text-center text-slate-600">
              Consulta de autenticidade no portal nacional do CT-e (www.cte.fazenda.gov.br) ou SEFAZ autorizadora
            </div>
            <div className="text-[10px] font-bold text-center text-emerald-800">
              Protocolo: {cte.protocoloAutorizacao} - {new Date(cte.dataHoraEmissao).toLocaleString('pt-BR')}
            </div>
          </div>

        </div>

        {/* Tipo do Serviço e Tomador */}
        <div className="grid grid-cols-4 border border-slate-800 text-[10px]">
          <div className="p-1 border-r border-slate-800">
            <span className="font-bold block text-slate-600">CFOP / NATUREZA:</span>
            <span className="font-semibold">{cte.cfop} - {cte.naturezaOperacao.slice(0, 30)}...</span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="font-bold block text-slate-600">INÍCIO DA PRESTAÇÃO:</span>
            <span className="font-bold">{cte.municipioInicio.nome} / {cte.municipioInicio.uf}</span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="font-bold block text-slate-600">TÉRMINO DA PRESTAÇÃO:</span>
            <span className="font-bold">{cte.municipioFim.nome} / {cte.municipioFim.uf}</span>
          </div>
          <div className="p-1 bg-slate-50">
            <span className="font-bold block text-slate-600">TOMADOR DO SERVIÇO:</span>
            <span className="font-bold text-blue-900">
              {cte.tomadorServico === 0 ? 'REMETENTE (CIF)' : 'DESTINATÁRIO (FOB)'}
            </span>
          </div>
        </div>

        {/* Remetente e Destinatário */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* Remetente */}
          <div className="border border-slate-800 p-2 space-y-0.5 text-[10px]">
            <div className="font-bold text-[11px] uppercase text-blue-900 border-b border-slate-300 pb-0.5 flex items-center justify-between">
              <span>REMETENTE</span>
              <span>CNPJ/CPF: {formatarCpfCnpj(cte.remetente.documento)}</span>
            </div>
            <div className="font-semibold text-slate-900">{cte.remetente.nomeRazaoSocial}</div>
            <div>{cte.remetente.endereco.logradouro}, {cte.remetente.endereco.numero} - {cte.remetente.endereco.bairro}</div>
            <div>{cte.remetente.endereco.nomeMunicipio}/{cte.remetente.endereco.uf} - CEP: {cte.remetente.endereco.cep}</div>
            <div>Inscrição Estadual: {cte.remetente.inscricaoEstadual}</div>
          </div>

          {/* Destinatário */}
          <div className="border border-slate-800 p-2 space-y-0.5 text-[10px]">
            <div className="font-bold text-[11px] uppercase text-emerald-900 border-b border-slate-300 pb-0.5 flex items-center justify-between">
              <span>DESTINATÁRIO</span>
              <span>CNPJ/CPF: {formatarCpfCnpj(cte.destinatario.documento)}</span>
            </div>
            <div className="font-semibold text-slate-900">{cte.destinatario.nomeRazaoSocial}</div>
            <div>{cte.destinatario.endereco.logradouro}, {cte.destinatario.endereco.numero} - {cte.destinatario.endereco.bairro}</div>
            <div>{cte.destinatario.endereco.nomeMunicipio}/{cte.destinatario.endereco.uf} - CEP: {cte.destinatario.endereco.cep}</div>
            <div>Inscrição Estadual: {cte.destinatario.inscricaoEstadual}</div>
          </div>

        </div>

        {/* Informações da Carga e Documentos Originários */}
        <div className="border border-slate-800 p-2 space-y-1 text-[10px]">
          <div className="font-bold text-[11px] uppercase border-b border-slate-300 pb-0.5">
            INFORMAÇÕES DA CARGA & DOCUMENTOS TRANSPORTADOS
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <span className="text-slate-600 block">PRODUTO PREDOMINANTE:</span>
              <span className="font-semibold">{cte.produtoPredominante}</span>
            </div>
            <div>
              <span className="text-slate-600 block">VALOR DA CARGA AVERBADA:</span>
              <span className="font-bold text-slate-900">{formatarMoeda(cte.valorCargaAverbada)}</span>
            </div>
            <div>
              <span className="text-slate-600 block">PESO BRUTO / LÍQUIDO:</span>
              <span className="font-semibold">{cte.pesoBrutoKg} Kg / {cte.pesoLiquidoKg} Kg</span>
            </div>
            <div>
              <span className="text-slate-600 block">VOLUMES / ESPÉCIE:</span>
              <span className="font-semibold">{cte.quantidadeVolumes} ({cte.especieVolumes})</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-700">CHAVES DE NF-e TRANSPORTADAS:</span>
            <div className="font-mono text-[9px] text-slate-800 bg-slate-50 p-1 rounded mt-0.5">
              {cte.chavesNFeTransportadas.join(' • ')}
            </div>
          </div>
        </div>

        {/* Componentes do Valor da Prestação e ICMS */}
        <div className="grid grid-cols-12 border border-slate-800 text-[10px]">
          
          {/* Componentes */}
          <div className="col-span-8 p-2 border-r border-slate-800 space-y-1">
            <div className="font-bold border-b border-slate-300 pb-0.5">COMPONENTES DO VALOR DA PRESTAÇÃO</div>
            <div className="grid grid-cols-4 gap-1 text-[9px]">
              <div>Frete Peso: <strong>{formatarMoeda(cte.componentesValor.fretePeso)}</strong></div>
              <div>Frete Valor: <strong>{formatarMoeda(cte.componentesValor.freteValor)}</strong></div>
              <div>Pedágio: <strong>{formatarMoeda(cte.componentesValor.pedagio)}</strong></div>
              <div>GRIS/Taxas: <strong>{formatarMoeda(cte.componentesValor.taxaGris + cte.componentesValor.outrasTaxas)}</strong></div>
            </div>
            <div className="text-[9px] text-slate-600 pt-1">
              RNTRC: {cte.rntrc} • Placa Veículo: {cte.veiculo?.placa}/{cte.veiculo?.uf} • Motorista: {cte.motorista?.nome} ({cte.motorista?.cpf})
            </div>
          </div>

          {/* Totais e Tributos */}
          <div className="col-span-4 p-2 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="text-slate-600">Base ICMS ({cte.aliquotaICMS}%): <strong>{formatarMoeda(cte.baseCalculoICMS)}</strong></div>
              <div className="text-slate-600">ICMS Apurado: <strong>{formatarMoeda(cte.valorICMS)}</strong></div>
            </div>
            <div className="border-t border-slate-300 pt-1 text-right">
              <span className="text-[9px] block text-slate-500 font-bold">TOTAL DO FRETE:</span>
              <span className="text-sm font-black text-blue-900">{formatarMoeda(cte.valorTotalFrete)}</span>
            </div>
          </div>

        </div>

        {/* Canhoto de Entrega */}
        <div className="border border-slate-800 p-2 text-[9px] space-y-1 border-dashed">
          <div className="flex justify-between font-bold">
            <span>DECLARO QUE RECEBI OS VOLUMES DESTE CONHECIMENTO EM PERFEITO ESTADO</span>
            <span>CT-e Nº {cte.numero}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-3">
            <div className="border-t border-slate-400 text-center">DATA DO RECEBIMENTO</div>
            <div className="border-t border-slate-400 text-center">NOME LEGÍVEL DO RECEBEDOR</div>
            <div className="border-t border-slate-400 text-center">ASSINATURA DO RECEBEDOR</div>
          </div>
        </div>

      </div>
    </div>
  );
};
