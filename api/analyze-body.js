import axios from 'axios';
import jsrsasign from 'jsrsasign';

/**
 * 🔒 SECURE VERCEL SERVERLESS FUNCTION
 * AI Body Analysis & Style Recommendation (Gemini 1.5 Pro Vision)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 🛡️ SECURITY CHECK
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return res.status(500).json({
      error: 'CRITICAL SECURITY ERROR: GOOGLE_SERVICE_ACCOUNT_KEY is not configured in Vercel Environment Variables.'
    });
  }

  try {
    const { imageBase64, bodyPart = 'full' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    // 🛡️ LOAD KEY FROM VERCEL ENVIRONMENT VARIABLES
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const PROJECT_ID = credentials.project_id || 'dowcloth-492517';
    const REGION = 'us-central1';

    // 1. Generate JWT
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

    // 2. Get Access Token
    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    authParams.append('assertion', jwt);
    const authRes = await axios.post('https://oauth2.googleapis.com/token', authParams.toString());
    const accessToken = authRes.data.access_token;

    // 3. Call Gemini Vision
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/gemini-2.5-flash-lite:generateContent`;

    const bodyPartCtx = {
      upper: 'The photo shows the upper body (torso and face visible, from waist up).',
      lower: 'The photo shows the lower body (from waist down, legs visible).',
      full: 'The photo shows the full body from head to toe.',
    }[bodyPart] || 'The photo shows the full body.';

    const prompt = `You are an expert AI fashion stylist for an Indian e-commerce platform called DowCloth.

${bodyPartCtx}

Analyze this photo carefully and return ONLY a valid JSON object (no markdown, no explanation):

{
  "skinTone": {
    "label": "one of: Fair, Wheatish, Medium Brown, Dark Brown, Deep",
    "hex": "approximate skin hex color",
    "description": "one friendly sentence"
  },
  "bodyType": {
    "label": "one of: Petite, Slim, Athletic, Average, Curvy, Plus-Size, Tall-Slim, Tall-Athletic",
    "description": "2 sentence friendly description of their body shape and proportions"
  },
  "bodyFit": {
    "label": "one of: Very Slim, Slim, Average, Slightly Broad, Broad, Heavy",
    "weight_category": "one of: Underweight, Healthy, Slightly Overweight, Overweight"
  },
  "styleProfile": {
    "recommended_colors": ["5 colors that suit this skin tone, e.g. Coral, Olive Green, Burgundy, Cream, Navy Blue"],
    "avoid_colors": ["3 colors to avoid for this skin tone"],
    "recommended_fits": ["4 clothing fit styles that flatter this body type, e.g. A-line, Slim Fit, High Waist, Wrap"],
    "avoid_fits": ["2 fits to avoid"],
    "style_keywords": ["5 style keywords, e.g. Minimalist, Ethnic Fusion, Smart Casual, Streetwear, Boho"]
  },
  "personalityVibes": ["3 fashion personality titles, e.g. Modern Minimalist, Festive Queen, Urban Explorer"],
  "stylistNote": "A warm 2-3 sentence personalized note from the AI stylist about their best features and how to dress them beautifully."
}

Be accurate, culturally aware for Indian fashion, and always encouraging and body-positive.`;

    const geminiPayload = {
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] }],
      generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 2048 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const gemRes = await axios.post(endpoint, geminiPayload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      timeout: 60000,
    });

    const rawText = gemRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let analysis;
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { parseError: true, raw: rawText };
    }

    return res.status(200).json({ success: true, analysis });

  } catch (error) {
    console.error('❌ VERCEL API ERROR:', error.message);
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return res.status(500).json({ success: false, error: detail });
  }
}
