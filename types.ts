export interface UserInput {
  model_name: string;
  params_b: number;
  active_params_b: number;
  precision_b: number;
  hidden_size: number;
  num_layers: number;
  tokens_in: number;
  tokens_out: number;
  qps: number;
  latency_s: number;
  gpu_model: string; // 'Auto' or a specific model name
  gpu_count_override?: number;
  vram_margin_factor: number;
  latency_overhead_factor: number;
}

export interface ModelSpec {
  name: string;
  params_b: number;
  active_params_b: number;
  precision_b: number;
  hidden_size: number;
  num_layers: number;
}

export interface GpuSpec {
  model: string;
  tops_8bit: number;
  vram_gb: number;
  bw_gbps: number;
  price_eur: number;
}

export interface CalculationResults {
  // Input mirrors
  userInput: UserInput;
  
  // GPU Info
  finalGpuSpec: GpuSpec;
  recommendedGpuModel: string;

  // VRAM
  vram_model_gib: number;
  vram_kv_gib: number;
  vram_total_gib: number;
  kv_per_token_gb: number;
  
  // Performance
  tokens_fit_per_gpu: number;
  tokens_per_s_per_gpu_compute: number;
  required_tokens_s: number;
  tokens_per_s_cluster: number;
  ram_limit_tokens_s_cluster: number;
  compute_limit_tokens_s_cluster: number;

  // Latency
  latency_est_s: number;
  latency_ttft_ms: number;
  latency_tpot_ms: number;
  
  // Recommendations
  gpu_needed_memory: number;
  gpu_needed_compute: number;
  gpu_needed_latency: number;
  gpu_recommended: number;
  
  // Other indicators
  tokens_generated_per_day: number;
  total_cost_eur: number;

  // Warnings for under-provisioning
  warnings: string[];
}