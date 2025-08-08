
import React, { useState, useEffect, useCallback } from 'react';
import { UserInput, CalculationResults, GpuSpec } from './types';
import { PREDEFINED_MODELS, GPU_CATALOG, DEFAULT_USER_INPUT } from './constants';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { calculateInfrastructure } from './services/calculationService';
import GpuCatalogDisplay from './components/GpuCatalogDisplay';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>(DEFAULT_USER_INPUT);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [gpuCatalog, setGpuCatalog] = useState<GpuSpec[]>(GPU_CATALOG);
  const [activeTab, setActiveTab] = useState<'estimator' | 'catalog'>('estimator');

  const handleInputChange = useCallback((updates: Partial<UserInput>) => {
    setUserInput(prev => ({ ...prev, ...updates }));
  }, []);
  
  const handleGpuPriceChange = useCallback((gpuModel: string, newPrice: number) => {
    setGpuCatalog(prevCatalog => 
      prevCatalog.map(gpu => 
        gpu.model === gpuModel ? { ...gpu, price_eur: newPrice } : gpu
      )
    );
  }, []);

  useEffect(() => {
    try {
      const calculatedResults = calculateInfrastructure(userInput, gpuCatalog);
      setResults(calculatedResults);
    } catch (error) {
      console.error("Calculation error:", error);
      setResults(null);
    }
  }, [userInput, gpuCatalog]);

  const handleModelSelection = useCallback((modelName: string) => {
    const selectedModel = PREDEFINED_MODELS.find(m => m.name === modelName);
    if (selectedModel) {
      handleInputChange({
        model_name: selectedModel.name,
        params_b: selectedModel.params_b,
        active_params_b: selectedModel.active_params_b,
        precision_b: selectedModel.precision_b,
        hidden_size: selectedModel.hidden_size,
        num_layers: selectedModel.num_layers,
      });
    }
  }, [handleInputChange]);

  const handleExportCSV = () => {
    if (!results) return;

    const headers = [
      "Parameter", "Input Value", "", "Result", "Calculated Value"
    ];

    const inputData = [
      { param: "Model Name", value: userInput.model_name },
      { param: "Number of Parameters (B)", value: userInput.params_b },
      { param: "Active Parameters (MoE, B)", value: userInput.active_params_b },
      { param: "Bytes/param", value: userInput.precision_b },
      { param: "Hidden Size", value: userInput.hidden_size },
      { param: "Number of Layers", value: userInput.num_layers },
      { param: "Input Tokens", value: userInput.tokens_in },
      { param: "Output Tokens", value: userInput.tokens_out },
      { param: "QPS", value: userInput.qps },
      { param: "Target Latency (s)", value: userInput.latency_s },
      { param: "Target GPU", value: userInput.gpu_model },
      { param: "Forced GPU Count", value: userInput.gpu_count_override || "N/A" },
    ];

    const outputData = [
        { param: "Recommended GPU", value: results.recommendedGpuModel },
        { param: "Recommended GPU Count", value: results.gpu_recommended },
        { param: "Model VRAM (GiB)", value: results.vram_model_gib.toFixed(2) },
        { param: "KV Cache VRAM (GiB)", value: results.vram_kv_gib.toFixed(2) },
        { param: "Total VRAM (GiB)", value: results.vram_total_gib.toFixed(2) },
        { param: "Estimated Latency (s)", value: results.latency_est_s.toFixed(2) },
        { param: "Required Throughput (tokens/s)", value: results.required_tokens_s.toFixed(0) },
        { param: "Available Throughput (tokens/s)", value: results.tokens_per_s_cluster.toFixed(0) },
        { param: "Total CAPEX Cost (EUR)", value: results.total_cost_eur.toLocaleString('en-US') },
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    const numRows = Math.max(inputData.length, outputData.length);

    for (let i = 0; i < numRows; i++) {
        const row = [
            inputData[i] ? inputData[i].param : "",
            inputData[i] ? inputData[i].value : "",
            "",
            outputData[i] ? outputData[i].param : "",
            outputData[i] ? outputData[i].value : ""
        ];
        csvContent += row.join(",") + "\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "llm_infra_estimation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-base-200">
      <header className="bg-surface shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">
              GPU Infrastructure Estimator for LLMs
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('estimator')}
                    className={`${
                        activeTab === 'estimator'
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    Estimator
                </button>
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`${
                        activeTab === 'catalog'
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    GPU Catalog
                </button>
            </nav>
        </div>

        {activeTab === 'estimator' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <InputForm
                userInput={userInput}
                onInputChange={handleInputChange}
                onModelSelect={handleModelSelection}
                gpuCatalog={gpuCatalog}
              />
            </div>
            <div className="lg:col-span-3">
              <ResultsDisplay results={results} onExportCSV={handleExportCSV} />
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <GpuCatalogDisplay 
            gpuCatalog={gpuCatalog} 
            onGpuPriceChange={handleGpuPriceChange} 
          />
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>
              LLM Sizing tool by <a href="https://www.linkedin.com/in/vincent-meoc/" target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">Vincent Méoc</a>.
            </p>
            <p>This tool is currently in a beta version and we welcome your feedback.</p>
            <p className="mt-4 italic text-xs">
              Disclaimer: This estimation does not account for infrastructure redundancy, networking costs (ingress/egress), other application components, load balancers, or monitoring systems.
            </p>
            <p className="mt-4 italic text-xs max-w-4xl mx-auto">
              This estimator is designed to size “dense” models up to a few tens of billions of parameters with moderate context windows. For special architectures (Mixture-of-Experts/MoE), very long contexts, or deployments involving high degrees of parallelism (typically ≥ 16 GPUs), the compute topology introduces additional constraints (weight sharding, prefill/decoding separation, etc.) that this tool does not model. In these cases, please refer to the model’s official documentation for the recommended configuration.
            </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
