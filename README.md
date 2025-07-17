# GPU Infrastructure Estimator for LLMs

This web tool helps you estimate the GPU infrastructure required for Large Language Model (LLM) inference. It assists developers and architects in planning the necessary hardware based on model characteristics and performance requirements.

## Overview

![Application Screenshot](./sizing%20tool.png)

## Features

- **Comprehensive Estimation**: Calculates the required VRAM (for the model + KV cache), the number of GPUs, latency, and capital expenditure (CAPEX).
- **Pre-defined Models**: Includes a list of popular models (e.g., Llama, Mistral) for a quick start.
- **GPU Catalog**: Contains specifications for common GPUs. The price of GPUs can be modified by the user.
- **Customizable Parameters**: Allows you to adjust all key parameters: model size, precision, context length, QPS, etc.
- **CSV Export**: Export the input data and estimation results to a CSV file.

## Tech Stack

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (used in the project)

## Getting Started

Follow these steps to run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or another package manager

### Installation

1. Clone the repository (if you haven't already):
   ```sh
   git clone https://github.com/your-username/your-repo.git
   ```
2. Navigate to the project directory:
   ```sh
   cd repo-name
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Application

To start the development server, run:
```sh
npm run dev
```
The application will then be available at `http://localhost:5173` (Vite usually indicates the port in the terminal upon launch).

### Other Commands

- To create an optimized production build:
  ```sh
  npm run build
  ```
- To preview the production build locally:
  ```sh
  npm run preview
  ```

## How to Use the Tool

1.  **Select a model** from the dropdown list or manually enter the model parameters.
2.  **Adjust the inference parameters** such as context size (input/output tokens) and QPS (queries per second).
3.  **Choose a target GPU** to see estimates based on that hardware.
4.  The **results are calculated in real-time** and displayed on the right.
5.  (Optional) Go to the **GPU Catalog** tab to adjust prices and see the impact on the total cost.
6.  Click **Export to CSV** to download a summary of your estimation.

## Disclaimer

This tool is a work in progress and provides estimates for educational purposes. It does not account for certain elements of a complete infrastructure, such as redundancy, network costs (ingress/egress), other application components, load balancers, monitoring, etc.

## Author

- **Vincent Méoc** - [LinkedIn](https://www.linkedin.com/in/vincent-meoc/)
