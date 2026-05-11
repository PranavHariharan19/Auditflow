# Auditflow

**Auditflow** is a premium, serverless invoice extraction tool designed for auditors and business professionals. It leverages state-of-the-art Multimodal AI to transform messy, handwritten, or multi-page documents into structured, audit-ready Excel spreadsheets in seconds.

![Auditflow UI](https://img.shields.io/badge/UI-Modern%20Dark-A78BFA)
![AI-Powered](https://img.shields.io/badge/AI-Llama%204%20Scout-F472B6)
![Serverless](https://img.shields.io/badge/Architecture-100%25%20Client--Side-34D399)

## 🚀 Deployment (Vercel)

Auditflow is optimized for one-click deployment on Vercel:

1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Import to Vercel**: Connect your repository to Vercel.
3. **Set Environment Variables**: In the Vercel dashboard, go to **Settings > Environment Variables** and add:
   - `GROQ_API_KEY`: Your private Groq API key.
4. **Deploy**: Vercel will automatically host the frontend and the secure serverless backend.

## ✦ Key Features

- **Secure API Proxy**: Your API key is stored safely on Vercel's backend and is never exposed to users in the browser.
- **Universal File Support**: Seamlessly process batch uploads of **PDF**, **JPEG**, **JPG**, and **PNG** files simultaneously.
- **Automated Entity Mapping**: Intelligently distinguishes between the **Seller** (header/letterhead) and the **Buyer** (billed customer) without manual tagging.
- **Batch Processing**: Handles multiple documents in a sequential queue, providing a consolidated audit view.
- **One-Click Export**: Generate professionally formatted `.xlsx` reports containing all extracted billing details.
- **Privacy-First Architecture**: 100% client-side processing. Your documents never touch our servers; data flows directly from your browser to the inference engine.

## 🚀 Getting Started

Auditflow requires zero setup. 

1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Chrome, Safari, Edge).
3. Drag and drop your invoices into the upload zone.
4. Review the extracted data in the interactive table.
5. Click **Download Spreadsheet** to finalize your report.

## 🛠 Technology Stack

- **Inference Engine**: Groq Llama 4 Scout (Multimodal Vision)
- **PDF Processing**: `pdf.js` for client-side document rendering
- **Spreadsheet Logic**: `SheetJS` (XLSX.js)
- **Styling**: Vanilla CSS3 with Glassmorphism and Micro-animations
- **Logic**: Modern ES6+ JavaScript

## ⚖️ License

Built for personal and professional audit use. All rights reserved.

---

*Designed with ❤️ for auditors who value speed and elegance.*
