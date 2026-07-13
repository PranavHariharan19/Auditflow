import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image } = req.body;

    // Manual .env.local loading for local development environments that don't auto-load it
    if (!process.env.Groq_API_Key && !process.env.GROQ_API_KEY) {
        try {
            const envPath = path.resolve(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/Groq_API_Key=(.*)/i) || envContent.match(/GROQ_API_KEY=(.*)/i);
                if (match) process.env.Groq_API_Key = match[1].trim().replace(/^['"]|['"]$/g, '');
            }
        } catch (e) {
            // Ignore fs errors in environments where it's not available
        }
    }

    // Support both casings but prioritize Groq_API_Key
    const apiKey = (process.env.Groq_API_Key || process.env.GROQ_API_KEY)?.trim();

    if (!apiKey) {
        console.error('API Key is not set in environment variables (checked Groq_API_Key and GROQ_API_KEY)');
        return res.status(500).json({ error: 'Server configuration error: Missing API Key. Please add Groq_API_Key to your environment or use the app Settings (⚙).' });
    }

    try {
        console.log('Sending request to Groq API...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'CRITICAL STEP 1 - DOCUMENT TYPE EXCLUSION:\nLook at the primary title/header of the page to determine if it is an "e-Way Bill document" vs a "Tax Invoice".\n- If the document is an e-Way Bill document (i.e. the main page heading says "e-Way Bill" or "1. e-Way Bill Details", transport slip, or delivery note), YOU MUST IMMEDIATELY STOP and return EXACTLY:\n{"ignore": true, "document_type": "e-Way Bill"}\n- IMPORTANT DISTINCTION: If the document is a "Tax Invoice" / Commercial Invoice that happens to contain an "e-Way Bill No." field alongside "Invoice No." or "Dated", DO NOT IGNORE IT! That is a valid Tax Invoice. Proceed to extract billing information from the Tax Invoice!\n\nONLY IF the document is a Tax Invoice / Commercial Invoice, extract the following fields according to these STRICT structural rules:\n1. BUYER GST RULE (gst_no): ALWAYS fetch the GSTIN number belonging to the BUYER / Consignee (e.g. under "Buyer (Bill to)", "Consignee (Ship to)", or "Ship To"). Do NOT return the Seller/Supplier GSTIN.\n2. SUBTOTAL AMOUNT RULE (amount): If there are multiple line item amounts (e.g. item values + charges), ALWAYS extract the amount that is the sum of all those item amounts (the Total Taxable Value / Subtotal before tax, e.g. 11,33,600.00). Do not pick a single line item amount.\n3. SUM OF TAX RATES RULE (rate): In the rate column/field, ALWAYS extract the sum of all tax rate percentages as a single number. For example, if Output CGST is 9% and Output SGST is 9%, the rate must be 18 (because 9+9=18). If IGST is 18%, rate is 18.\n\nReturn ONLY a valid JSON object with these exact keys: ignore, document_type, gst_no, seller_name, buyer_name, bill_no, date, amount, rate, cgst, sgst, total_tax, total. For a Tax Invoice, set "ignore": false and "document_type": "Tax Invoice". If a field is missing, use an empty string.'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: `data:image/jpeg;base64,${image}` }
                            }
                        ]
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0
            })
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Unknown API error (non-JSON response)' };
            }
            console.error('Groq API Error:', errorData);

            // Handle rate limits specifically
            if (response.status === 429) {
                const message = errorData.error?.message || '';
                // Stricter check for daily limit to avoid false positives with reset times (e.g. "0.0001 days")
                const isDaily = /daily limit|requests per day|limit for the day/i.test(message);
                
                return res.status(429).json({ 
                    error: message,
                    code: isDaily ? 'DAILY_LIMIT_REACHED' : 'RATE_LIMIT_EXCEEDED',
                    retryAfter: response.headers.get('retry-after') || response.headers.get('x-ratelimit-reset-requests') || '5'
                });
            }

            return res.status(response.status).json({ 
                error: errorData.error?.message || errorData.error || 'Groq API failed' 
            });
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;
        
        let content;
        try {
            content = JSON.parse(rawContent);
        } catch (parseError) {
            console.warn('Direct JSON parse failed, attempting regex extraction');
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not extract valid JSON from model response');
            }
        }

        if (
            content.ignore === true ||
            content.ignore === "true" ||
            content.document_type === "e-Way Bill" ||
            /^\s*e[- ]?way\s*bill\s*$/i.test(content.document_type || "")
        ) {
            return res.status(200).json({ ignore: true, document_type: "e-Way Bill" });
        }

        return res.status(200).json(content);
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message || 'Extraction failed' });
    }
}
