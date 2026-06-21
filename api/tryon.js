import axios from 'axios';
import jsrsasign from 'jsrsasign';

/**
 * 🔒 SECURE VERCEL SERVERLESS FUNCTION
 * This lives on Vercel's backend and hides your Google Cloud Private Key.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 🛡️ SECURITY CHECK: Detect missing credentials early
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return res.status(500).json({ 
      error: 'CRITICAL SECURITY ERROR: GOOGLE_SERVICE_ACCOUNT_KEY is not configured in Vercel Environment Variables.' 
    });
  }

  try {
    // 🛡️ LOAD KEY FROM VERCEL ENVIRONMENT VARIABLES
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // 🛡️ BOLD ACTION: Dynamically extract Config from the Key file
    const PROJECT_ID = credentials.project_id || 'dowcloth-492517';
    const REGION = 'us-central1';
    const MODEL_ID = 'virtual-try-on-001';

    // 1. Generate JWT (jsrsasign is more stable for Vercel)
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

    // 3. Call Vertex AI
    const { personBase64, garmentBase64, garmentCategory } = req.body;
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:predict`;

    const predictPayload = {
      instances: [
        {
          personImage: { image: { bytesBase64Encoded: personBase64 } },
          productImages: [
            {
              image: { bytesBase64Encoded: garmentBase64 },
              productImageConfig: { productDescription: garmentCategory || 'upper body' }
            }
          ]
        }
      ],
      parameters: { baseSteps: 80 }
    };

    const response = await axios.post(endpoint, predictPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      timeout: 120000,
    });

    if (response.data && response.data.predictions && response.data.predictions[0]) {
      const resultBase64 = response.data.predictions[0].bytesBase64Encoded;
      return res.status(200).json({ success: true, imageUri: `data:image/png;base64,${resultBase64}` });
    } else {
      throw new Error('API Prediction failed.');
    }

  } catch (error) {
    console.error('❌ VERCEL API ERROR:', error.message);
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return res.status(500).json({ success: false, error: detail });
  }
}
