import React from 'react';
import { CalculationResults } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { DownloadIcon } from './icons/DownloadIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ResultsDisplayProps {
  results: CalculationResults | null;
  onExportCSV: () => void;
}

const ResultRow: React.FC<{ label: string; value: string | number; unit?: string; tooltip?: string; }> = ({ label, value, unit, tooltip }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-gray-200" title={tooltip}>
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">
      {typeof value === 'number' ? value.toLocaleString('fr-FR', {maximumFractionDigits: 2}) : value}
      {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
    </span>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onExportCSV }) => {
  if (!results) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Les résultats s'afficheront ici.</p>
        </div>
      </Card>
    );
  }

  const {
    recommendedGpuModel, gpu_recommended, total_cost_eur,
    vram_total_gib, vram_model_gib, vram_kv_gib,
    required_tokens_s, tokens_per_s_cluster,
    latency_est_s, latency_ttft_ms, latency_tpot_ms,
    warnings
  } = results;
  
  const performanceRatio = required_tokens_s > 0 ? tokens_per_s_cluster / required_tokens_s : 1;
  const performanceColor = performanceRatio >= 1 ? 'bg-green-500' : 'bg-red-500';
  const isOverProvisioned = performanceRatio > 1.2;

  return (
    <div className="space-y-6">
      {/* Main recommendation */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-500">Recommandation</h2>
            <p className="text-3xl font-bold text-brand-primary">
              {gpu_recommended} × {recommendedGpuModel}
            </p>
          </div>
          <div className="text-right">
             <h2 className="text-lg font-semibold text-gray-500">Coût CAPEX Total</h2>
            <p className="text-3xl font-bold text-brand-secondary">
              {total_cost_eur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="flex-shrink-0">
             <Button onClick={onExportCSV} className="w-full sm:w-auto">
              <DownloadIcon className="w-5 h-5 mr-2" />
              Exporter en CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Warnings Display */}
      {warnings && warnings.length > 0 && (
        <Card className="bg-yellow-50 border border-yellow-300 text-yellow-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-900">Avertissement de sous-dimensionnement</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul role="list" className="list-disc pl-5 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
               <p className="mt-3 text-sm">
                La configuration manuelle ne répond pas à tous les besoins calculés. L'estimation des performances et des coûts peut être inexacte.
              </p>
            </div>
          </div>
        </Card>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VRAM */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Répartition VRAM</h3>
          <ResultRow label="Poids du modèle" value={vram_model_gib} unit="GiB" />
          <ResultRow label="Cache KV" value={vram_kv_gib} unit="GiB" />
          <ResultRow label="VRAM Totale Requise" value={vram_total_gib} unit="GiB" />
          <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${(vram_model_gib / vram_total_gib) * 100}%` }}></div>
          </div>
          <div className="text-xs text-center mt-1 text-gray-500">Modèle vs KV Cache</div>
        </Card>

        {/* Performance */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Performance</h3>
          <ResultRow label="Débit Requis" value={required_tokens_s.toFixed(0)} unit="tokens/s" />
          <ResultRow label="Débit Disponible" value={tokens_per_s_cluster.toFixed(0)} unit="tokens/s" />
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${performanceColor} h-2.5 rounded-full`} style={{ width: `${Math.min(performanceRatio, 1) * 100}%` }}></div>
          </div>
          {isOverProvisioned && <p className="text-xs text-yellow-600 mt-2 text-center">Le cluster est surdimensionné.</p>}
          {performanceRatio < 1 && <p className="text-xs text-red-600 mt-2 text-center">Le cluster est sous-dimensionné.</p>}
        </Card>

        {/* Latency */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Latence</h3>
          <ResultRow label="Latence Estimée Totale" value={latency_est_s} unit="s" />
          <ResultRow label="TTFT (Time-to-first-token)" value={latency_ttft_ms.toFixed(0)} unit="ms" />
          <ResultRow label="TPOT (Time-per-output-token)" value={latency_tpot_ms.toFixed(2)} unit="ms" />
          <p className="text-xs text-gray-500 mt-2">TTFT inclut le traitement de l'input. Latence totale = TTFT + (Tokens output - 1) * TPOT.</p>
        </Card>

        {/* Other Indicators */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Indicateurs de Production</h3>
          <ResultRow label="GPU min (Mémoire)" value={results.gpu_needed_memory} unit="GPU(s)" />
          <ResultRow label="GPU min (Calcul)" value={results.gpu_needed_compute} unit="GPU(s)" />
          <ResultRow label="GPU min (Latence)" value={results.gpu_needed_latency} unit="GPU(s)" />
        </Card>
      </div>
    </div>
  );
};

export default ResultsDisplay;