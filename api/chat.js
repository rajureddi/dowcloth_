import axios from 'axios';
import jsrsasign from 'jsrsasign';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return res.status(500).json({ error: 'CRITICAL SECURITY ERROR: GOOGLE_SERVICE_ACCOUNT_KEY is not configured.' });
  }

  try {
    const { messages, context } = req.body;
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const PROJECT_ID = credentials.project_id || 'dowcloth-492517';
    const REGION = 'us-central1';

    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    const jwt = jsrsasign.jws.JWS.sign("RS256", JSON.stringify(header), JSON.stringify(payload), credentials.private_key);

    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    authParams.append('assertion', jwt);
    const authRes = await axios.post('https://oauth2.googleapis.com/token', authParams.toString());
    const accessToken = authRes.data.access_token;

    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/gemini-2.5-flash-lite:generateContent`;

    let systemInstruction = "You are an expert AI fashion stylist for DowCloth, an Indian e-commerce platform. Provide helpful, short, and stylish advice. Keep your responses friendly and concise.";
    if (context && context.language && context.language !== 'en') {
       systemInstruction += ` You MUST reply entirely in the language corresponding to code '${context.language}'.`;
    }

    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const aiPayload = {
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    };

    const aiRes = await axios.post(endpoint, aiPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const aiText = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ message: aiText });

  } catch (error) {
    console.error('Gemini Chat Error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to process chat with AI.' });
  }
}
