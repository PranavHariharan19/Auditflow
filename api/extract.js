export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error('GROQ_API_KEY is not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
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
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            return res.status(response.status).json({ error: 'Groq API failed' });
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        return res.status(200).json(content);
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Extraction failed' });
    }
}
