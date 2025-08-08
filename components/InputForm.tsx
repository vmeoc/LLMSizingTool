
import React, { useState } from 'react';
import { UserInput, GpuSpec } from '../types';
import { PREDEFINED_MODELS } from '../constants';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface InputFormProps {
  userInput: UserInput;
  onInputChange: (updates: Partial<UserInput>) => void;
  onModelSelect: (modelName: string) => void;
  gpuCatalog: GpuSpec[];
}

const InputForm: React.FC<InputFormProps> = ({ userInput, onInputChange, onModelSelect, gpuCatalog }) => {
  const [advancedVisible, setAdvancedVisible] = useState(false);

  const handleNumericChange = (key: keyof UserInput, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      onInputChange({ [key]: numericValue });
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Model Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">Model Parameters</h3>
          <Select
            label="Model Name"
            value={userInput.model_name}
            onChange={(e) => onModelSelect(e.target.value)}
          >
            {PREDEFINED_MODELS.map(model => (
              <option key={model.name} value={model.name}>{model.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Number of Parameters (B)" type="number" value={userInput.params_b.toString()} onChange={e => handleNumericChange('params_b', e.target.value)} />
            <Input label="Active Parameters (MoE, B)" type="number" value={userInput.active_params_b.toString()} onChange={e => handleNumericChange('active_params_b', e.target.value)} />
            <Input label="Precision (Bytes/Param)" type="number" value={userInput.precision_b.toString()} onChange={e => handleNumericChange('precision_b', e.target.value)} min={1} max={4} step={1} />
            <Input label="Hidden Size" type="number" value={userInput.hidden_size.toString()} onChange={e => handleNumericChange('hidden_size', e.target.value)} />
            <Input label="Number of Layers" type="number" value={userInput.num_layers.toString()} onChange={e => handleNumericChange('num_layers', e.target.value)} />
          </div>
        </div>

        {/* Requirements Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">Client Requirements</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Input Tokens" type="number" value={userInput.tokens_in.toString()} onChange={e => handleNumericChange('tokens_in', e.target.value)} />
            <Input label="Output Tokens" type="number" value={userInput.tokens_out.toString()} onChange={e => handleNumericChange('tokens_out', e.target.value)} />
            <Input label="QPS" type="number" value={userInput.qps.toString()} onChange={e => handleNumericChange('qps', e.target.value)} />
            <Input label="Target Latency (s)" type="number" value={userInput.latency_s.toString()} onChange={e => handleNumericChange('latency_s', e.target.value)} step={0.1} />
          </div>
        </div>

        {/* GPU Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 text-gray-800">GPU Configuration</h3>
           <Select
            label="Target GPU"
            value={userInput.gpu_model}
            onChange={(e) => onInputChange({ gpu_model: e.target.value })}
          >
            <option value="Auto">Auto</option>
            {gpuCatalog.map(gpu => (
              <option key={gpu.model} value={gpu.model}>{gpu.model}</option>
            ))}
          </Select>
           <Input 
            label="Forced GPU Count (optional)" 
            type="number" 
            placeholder="Leave empty for auto"
            value={userInput.gpu_count_override?.toString() ?? ''} 
            onChange={e => onInputChange({ gpu_count_override: e.target.value ? parseInt(e.target.value) : undefined })} />
        </div>
        
        {/* Advanced Settings */}
        <div>
          <button
            onClick={() => setAdvancedVisible(!advancedVisible)}
            className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-800"
          >
            Advanced Settings
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${advancedVisible ? 'rotate-180' : ''}`} />
          </button>
          {advancedVisible && (
            <div className="mt-4 space-y-4 border-t pt-4">
                <Input 
                    label="VRAM Safety Margin (%)" 
                    type="number" 
                    value={((userInput.vram_margin_factor-1)*100).toFixed(0)} 
                    onChange={e => onInputChange({ vram_margin_factor: 1 + parseFloat(e.target.value)/100 })} 
                />
                <Input 
                    label="Latency Overhead Factor (%)" 
                    type="number" 
                    value={((userInput.latency_overhead_factor-1)*100).toFixed(0)} 
                    onChange={e => onInputChange({ latency_overhead_factor: 1 + parseFloat(e.target.value)/100 })} 
                />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InputForm;
