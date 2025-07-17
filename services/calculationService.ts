import { UserInput, CalculationResults, GpuSpec } from '../types';

export function calculateInfrastructure(userInput: UserInput, gpuCatalog: GpuSpec[]): CalculationResults {
  const {
    params_b: P,
    active_params_b: Pa,
    precision_b: B,
    hidden_size: H,
    num_layers: L,
    tokens_in: Tin,
    tokens_out: Tout,
    qps: Q,
    latency_s: Lt,
    gpu_model,
    gpu_count_override,
    vram_margin_factor,
    latency_overhead_factor,
  } = userInput;

  // 1. Poids modèle (GiB) - Uses P (total params)
  const vram_model_gib = Math.floor((P * 1e9 * B) / (1024 ** 3));

  // 2. Empreinte KV par token (GiB)
  const kv_cache_per_token_gib = (2 * B * H * L) / (1024 ** 3);

  // 3. Taille KV cache (GiB)
  const batch_size = Q;
  const seq_len = Tin + Tout;
  const vram_kv_gib = kv_cache_per_token_gib * batch_size * seq_len;

  // 4. VRAM totale
  const vram_total_gib = Math.floor((vram_model_gib + vram_kv_gib) * 1.052); // +5.2% fragmentation

  // 9. Débit requis
  const required_tokens_s = Tout * Q;

  const calculateForGpu = (gpu: GpuSpec, N_override?: number): CalculationResults => {
    const { tops_8bit, tflops_16bit, vram_gb: VR, bw_gbps: BW } = gpu;
    
    // Sélectionne la puissance de calcul en fonction de la précision (B = Octets/param)
    // B=1 -> INT8 (tops_8bit), B=2 -> FP16 (tflops_16bit). Pour B > 2, on utilise FP16 par défaut.
    const TF = B === 1 ? tops_8bit : tflops_16bit;

    // 5. Tokens supportés par GPU (critère VRAM)
    const available_vram_for_kv = VR * 0.9 - vram_model_gib; // use 90% of VRAM
    const tokens_fit_per_gpu = available_vram_for_kv > 0 ? Math.floor(available_vram_for_kv / kv_cache_per_token_gib) : 0;
    
    // 6. Débit token/s par GPU (critère compute) - Uses Pa (active params)
    // Corrigé pour refléter ~2 FLOPs par paramètre pour un forward pass.
    const tokens_per_s_per_gpu_compute = Math.floor( (TF * 1e12) / (Pa * 1e9 * 2) );
    
    // A) Calculer les besoins minimums théoriques
    const gpu_needed_memory = Math.ceil(vram_total_gib / (VR * (1) ));
    const gpu_needed_compute = Math.ceil(required_tokens_s / tokens_per_s_per_gpu_compute);
    
    const N_for_latency_calc = Math.max(gpu_needed_memory, gpu_needed_compute, 1);
    // TTFT is compute-bound, uses Pa (active params)
    const ttft_ms_temp = (Tin * (Pa * 2 * 1e9) / (TF * 1e12)) * 1000 / N_for_latency_calc;
    // TPOT is bandwidth-bound, uses P (total params)
    const tpot_ms_temp = (P * B / BW) * 1000 / N_for_latency_calc;
    const latency_s_raw_temp = (ttft_ms_temp + (Tout - 1) * tpot_ms_temp) / 1000;
    const latency_est_s_temp = Math.round(latency_s_raw_temp * latency_overhead_factor * 100) / 100;
    const gpu_needed_latency = latency_est_s_temp > Lt ? Math.ceil(N_for_latency_calc * (latency_est_s_temp / Lt)) : N_for_latency_calc;

    // B) Déterminer le nombre final de GPUs à utiliser
    const gpu_recommended_auto = Math.max(gpu_needed_memory, gpu_needed_compute, gpu_needed_latency, 1);
    const N = N_override ?? gpu_recommended_auto;

    // C) Générer des avertissements si le nombre imposé est insuffisant
    const warnings: string[] = [];
    if (N_override) {
        if (N_override < gpu_needed_memory) {
            warnings.push(`VRAM insuffisante. ${gpu_needed_memory} GPU(s) requis.`);
        }
        if (N_override < gpu_needed_compute) {
            warnings.push(`Calcul insuffisant. ${gpu_needed_compute} GPU(s) requis.`);
        }
        if (N_override < gpu_needed_latency) {
            warnings.push(`Latence trop élevée. ${gpu_needed_latency} GPU(s) requis.`);
        }
    }

    // D) Calculer toutes les métriques finales en utilisant N
    // TTFT uses Pa (active params)
    const latency_ttft_ms = (Tin * (Pa * 2 * 1e9) / (TF * 1e12)) * 1000 / N;
    // TPOT uses P (total params)
    const latency_tpot_ms = (P * B / BW) * 1000 / N;
    const latency_s_raw = (latency_ttft_ms + (Tout - 1) * latency_tpot_ms) / 1000;
    const latency_est_s = Math.round(latency_s_raw * latency_overhead_factor * 100) / 100;
    
    // Le débit disponible du cluster est le débit limité par la puissance de calcul totale.
    // La comparaison avec une capacité mémoire (tokens) était incorrecte.
    const compute_limit_tokens_s_cluster = tokens_per_s_per_gpu_compute * N;
    const tokens_per_s_cluster = compute_limit_tokens_s_cluster;
    // La 'ram_limit' est une capacité de tokens, pas un débit. On la garde pour information interne.
    const ram_limit_tokens_s_cluster = tokens_fit_per_gpu * N; 

    const tokens_generated_per_day = required_tokens_s * 3600 * 24;
    const total_cost_eur = N * gpu.price_eur;

    return {
      finalGpuSpec: gpu,
      recommendedGpuModel: gpu.model,
      vram_model_gib, vram_kv_gib, vram_total_gib, 
      kv_per_token_gb: kv_cache_per_token_gib * (1024**3 / 1000**3), // GB for display
      tokens_fit_per_gpu, tokens_per_s_per_gpu_compute, required_tokens_s,
      tokens_per_s_cluster, ram_limit_tokens_s_cluster, compute_limit_tokens_s_cluster,
      latency_est_s, latency_ttft_ms, latency_tpot_ms,
      gpu_needed_memory, gpu_needed_compute, gpu_needed_latency, 
      gpu_recommended: N,
      tokens_generated_per_day,
      total_cost_eur,
      userInput,
      warnings,
    };
  };

  if (gpu_model === 'Auto') {
    let bestOption: CalculationResults | null = null;

    const viableGpus = gpuCatalog.filter(gpu => (vram_model_gib * 1.052) < gpu.vram_gb);

    if (viableGpus.length === 0) {
        const defaultGpu = gpuCatalog.find(g => g.model === 'H100 NVL') || gpuCatalog[gpuCatalog.length-1];
        return calculateForGpu(defaultGpu, gpu_count_override);
    }
    
    for (const gpu of viableGpus) {
      const currentOption = calculateForGpu(gpu);
      if (!bestOption || currentOption.total_cost_eur < bestOption.total_cost_eur) {
        bestOption = currentOption;
      }
    }
    return bestOption!;
  } else {
    const selectedGpu = gpuCatalog.find(g => g.model === gpu_model);
    if (!selectedGpu) throw new Error(`GPU model ${gpu_model} not found in catalog.`);
    return calculateForGpu(selectedGpu, gpu_count_override);
  }
}