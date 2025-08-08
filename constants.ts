import { ModelSpec, GpuSpec, UserInput } from './types';

export const PREDEFINED_MODELS: ModelSpec[] = [
  { name: 'Mistral small 3.1 24B', params_b: 24, active_params_b: 24, precision_b: 2, hidden_size: 5120, num_layers: 40 },
  { name: 'Devstral', params_b: 24, active_params_b: 24, precision_b: 2, hidden_size: 5120, num_layers: 40 },
  { name: 'Magistral small 2.5', params_b: 24, active_params_b: 24, precision_b: 2, hidden_size: 5120, num_layers: 40 },
  { name: 'Mistral 7B', params_b: 7, active_params_b: 7, precision_b: 2, hidden_size: 4096, num_layers: 32 },
  { name: 'Llama 2 7B', params_b: 7, active_params_b: 7, precision_b: 2, hidden_size: 4096, num_layers: 32 },
  { name: 'llama-3.1-8b-instruct', params_b: 8, active_params_b: 8, precision_b: 2, hidden_size: 4096, num_layers: 32 },
  { name: 'Kimi K2', params_b: 1000, active_params_b: 32, precision_b: 1, hidden_size: 7168, num_layers: 61 },
  { name: 'Open AI gpt-oss-20b', params_b: 20.8, active_params_b: 4, precision_b: 0.5, hidden_size: 2880, num_layers: 24 },
  { name: 'Open AI gpt-oss-120', params_b: 117, active_params_b: 5.4, precision_b: 0.5, hidden_size: 2880, num_layers: 36 },
];

export const GPU_CATALOG: GpuSpec[] = [
  { model: 'A10', tops_8bit: 250, tflops_16bit: 125, vram_gb: 24, bw_gbps: 600, price_eur: 2700 },
  { model: 'A30', tops_8bit: 330, tflops_16bit: 165, vram_gb: 24, bw_gbps: 933, price_eur: 4559 },
  { model: 'L40', tops_8bit: 362, tflops_16bit: 181, vram_gb: 48, bw_gbps: 864, price_eur: 10300 },
  { model: 'L40s', tops_8bit: 733, tflops_16bit: 362, vram_gb: 48, bw_gbps: 864, price_eur: 10860 },
  { model: 'A100 40 GB PCIe', tops_8bit: 624, tflops_16bit: 312, vram_gb: 40, bw_gbps: 1555, price_eur: 11979 },
  { model: 'A100 40 GB SXM', tops_8bit: 624, tflops_16bit: 312, vram_gb: 40, bw_gbps: 1555, price_eur: 18750 },
  { model: 'A100 80 GB PCIe', tops_8bit: 624, tflops_16bit: 312, vram_gb: 80, bw_gbps: 1935, price_eur: 11000 },
  { model: 'A100 80 GB SXM', tops_8bit: 624, tflops_16bit: 312, vram_gb: 80, bw_gbps: 2039, price_eur: 20350 },
  { model: 'H100 PCIe', tops_8bit: 1513, tflops_16bit: 756, vram_gb: 80, bw_gbps: 2000, price_eur: 27300 },
  { model: 'H100 SXM', tops_8bit: 1979, tflops_16bit: 989, vram_gb: 80, bw_gbps: 3350, price_eur: 27300 },
  { model: 'H100 NVL', tops_8bit: 1670, tflops_16bit: 835, vram_gb: 188, bw_gbps: 3900, price_eur: 28700 },
];

const defaultModelSpec = PREDEFINED_MODELS[0];

export const DEFAULT_USER_INPUT: UserInput = {
  model_name: defaultModelSpec.name,
  params_b: defaultModelSpec.params_b,
  active_params_b: defaultModelSpec.active_params_b,
  precision_b: defaultModelSpec.precision_b,
  hidden_size: defaultModelSpec.hidden_size,
  num_layers: defaultModelSpec.num_layers,
  tokens_in: 250,
  tokens_out: 150,
  qps: 150,
  latency_s: 10,
  gpu_model: 'H100 PCIe',
  vram_margin_factor: 1.15, // 15% margin for gpu_memory calculation
  latency_overhead_factor: 1.15, // 15% overhead for latency estimation
};