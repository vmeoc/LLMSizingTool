
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">GPU Catalog</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GPU Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                INT8 (TOPS)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FP16 (TFLOPS)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VRAM (GB)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bandwidth (GB/s)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Price (EUR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gpuCatalog.map((gpu) => (
              <tr key={gpu.model}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gpu.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.tops_8bit.toLocaleString('en-US')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.tflops_16bit.toLocaleString('en-US')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.vram_gb.toLocaleString('en-US')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gpu.bw_gbps.toLocaleString('en-US')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Input
                    label=""
                    aria-label={`Price for ${gpu.model}`}
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
