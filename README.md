# ✦ Auditflow: Professional Invoice Intelligence

**Auditflow** is a high-performance, AI-driven document extraction platform designed to transform unstructured invoices into audit-ready data. Built with a "Privacy-First" architecture, it leverages state-of-the-art Multimodal LLMs to automate complex data entry tasks with near-instantaneous speed.

![Tech Stack](https://img.shields.io/badge/Stack-JS%20|%20Node.js%20|%20Groq%20|%20Vercel-A78BFA)
![AI Model](https://img.shields.io/badge/AI-Llama%204%20Scout%20(Multimodal)-F472B6)
![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20Serverless-34D399)

---

## 🚀 The Mission
Auditors often spend hours manually transcribing data from messy, handwritten or digital invoices. Auditflow eliminates this bottleneck by providing a seamless, batch-processing workflow that extracts key financial metadata with high precision, allowing professionals to focus on analysis rather than data entry.

## 🛠️ How It Works (Architecture)
Auditflow employs a hybrid processing model that ensures both security and flexibility:

1.  **Client-Side Pre-processing**:
    -   **PDF-to-Image**: Uses `pdf.js` to render multi-page PDFs into high-resolution images entirely in the browser.
    -   **Base64 Encoding**: Invoices are prepared for AI consumption without ever being stored on a server.
2.  **Intelligent Extraction Engine**:
    -   **Hybrid Proxy System**: Data is routed through a secure Vercel Serverless Function (Proxy Mode) to protect API keys, with a Direct-to-API fallback for local development.
    -   **Context-Aware OCR**: Leverages Llama 4 Scout's vision capabilities to intelligently distinguish between **Sellers** (letterheads) and **Buyers** (customers).
3.  **Resilience & Reliability**:
    -   **Exponential Backoff**: Handles API rate limits (TPM/RPM) gracefully by automatically retrying requests.
    -   **Robust JSON Parsing**: Implements regex-based fallback parsing to ensure data integrity even when models return non-standard responses.
4.  **Data Export**:
    -   Uses `SheetJS` to generate professionally formatted `.xlsx` spreadsheets on-the-fly.

## ✦ Key Features
-   **Multi-Page PDF Support**: Automatically processes every page of a document.
-   **Batch Processing**: Drag and drop dozens of files; Auditflow handles the queue and merges results.
-   **Interactive Data Grid**: Review, edit, and audit extracted data before exporting.
-   **Zero-Setup Direct Mode**: Enter an API key in the app settings to use the tool locally without any backend configuration.
-   **Privacy-First**: Documents never touch our storage; data flows directly to the inference engine.

## 💻 Tech Stack
-   **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Glassmorphism & Micro-animations)
-   **Backend**: Node.js, Vercel Serverless Functions
-   **AI Infrastructure**: Groq Inference Engine (Llama 4 Scout)
-   **Libraries**: `pdf.js` (Document Rendering), `SheetJS` (Excel Generation)

## 🚀 Getting Started

### Local Use (Zero Setup)
1. Clone the repository.
2. Open `index.html` in your browser.
3. Click the **Settings (⚙️)** icon and paste your [Groq API Key](https://console.groq.com/keys).
4. Start uploading!

---

*Designed for speed. Engineered for precision. Built for auditors.*
