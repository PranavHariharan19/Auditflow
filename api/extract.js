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
                                text: 'Extract billing information from this image. Return ONLY a valid JSON object with these exact keys: gst_no, seller_name, buyer_name, bill_no, date, amount, rate, cgst, sgst, total_tax, total. Identify SELLER as the entity in the header and BUYER as the customer. If a field is missing, use an empty string.'
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

        return res.status(200).json(content);
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message || 'Extraction failed' });
    }
}
