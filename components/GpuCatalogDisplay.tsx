import React from 'react';
import { GpuSpec } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';

interface GpuCatalogDisplayProps {
  gpuCatalog: GpuSpec[];
  onGpuPriceChange: (gpuModel: string, newPrice: number) => void;
}

const GpuCatalogDisplay: React.FC<GpuCatalogDisplayProps> = ({ gpuCatalog, onGpuPriceChange }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Catalogue des GPU</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modèle GPU
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                8 bits FLOPS/TOPS
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VRAM (GB)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bande Passante (GB/s)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix Moyen (€)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gpuCatalog.map((gpu) => (
              <tr key={gpu.model}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gpu.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.tops_8bit.toLocaleString('fr-FR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.vram_gb.toLocaleString('fr-FR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.bw_gbps.toLocaleString('fr-FR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Input
                    label=""
                    aria-label={`Prix pour ${gpu.model}`}
                    type="number"
                    value={gpu.price_eur.toString()}
                    onChange={(e) => onGpuPriceChange(gpu.model, parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default GpuCatalogDisplay;