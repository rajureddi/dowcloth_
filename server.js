require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsrsasign = require('jsrsasign');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Path to your Google Cloud service account key
const KEY_PATH = './service-account.json';

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try { return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY); } 
    catch (e) { console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_KEY env var.'); }
  }
  return require(KEY_PATH);
}


app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/api/tryon', async (req, res) => {
  console.log('🚀 RECEIVED TRY-ON REQUEST LOCALLY...');

  try {
    // 🛡️ Load Credentials
    let credentials;
    try {
      credentials = require(KEY_PATH);
    } catch (err) {
      console.error(`❌ LOCAL SERVER ERROR: Missing Service Account JSON at ${KEY_PATH}`);
      return res.status(500).json({ error: 'Service Account Key missing. Please check KEY_PATH.' });
    }
    const PROJECT_ID = credentials.project_id;
    const REGION = 'us-central1';
    const MODEL_ID = 'virtual-try-on-001';

    // 1. Generate JWT (Stable)
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
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:predict`;
    const predictPayload = {
      instances: [{
        personImage: { image: { bytesBase64Encoded: req.body.personBase64 } },
        productImages: [{
          image: { bytesBase64Encoded: req.body.garmentBase64 },
          productImageConfig: { productDescription: req.body.garmentCategory || 'upper body' }
        }]
      }],
      parameters: { baseSteps: 80 }
    };

    console.log(`📡 Calling Vertex AI for Project: ${PROJECT_ID}...`);
    const aiResponse = await axios.post(endpoint, predictPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      timeout: 120000,
    });

    console.log('✅ AI Render Success!');
    if (aiResponse.data && aiResponse.data.predictions && aiResponse.data.predictions[0]) {
      const resultBase64 = aiResponse.data.predictions[0].bytesBase64Encoded;
      return res.status(200).json({ success: true, imageUri: `data:image/png;base64,${resultBase64}` });
    } else {
      throw new Error('API returned success but no predictions array found.');
    }

  } catch (error) {
    console.error('❌ LOCAL SERVER ERROR:', error.message);
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    res.status(500).json({ error: detail });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 🤖 AI BODY ANALYSIS & STYLE RECOMMENDATION  (Gemini 1.5 Pro Vision)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/analyze-body', async (req, res) => {
  console.log('🤖 RECEIVED BODY ANALYSIS REQUEST...');
  try {
    const { imageBase64, bodyPart = 'full' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    let credentials;
    try {
      credentials = require(KEY_PATH);
    } catch (err) {
      console.error(`❌ LOCAL SERVER ERROR: Missing Service Account JSON at ${KEY_PATH}`);
      return res.status(500).json({ error: 'Service Account Key missing.' });
    }

    const PROJECT_ID = credentials.project_id || 'dowcloth-492517';
    const REGION = 'us-central1';

    // Build JWT access token (same pattern as /tryon)
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };
    const jwt = jsrsasign.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(payload), credentials.private_key);
    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    authParams.append('assertion', jwt);
    const authRes = await axios.post('https://oauth2.googleapis.com/token', authParams.toString());
    const accessToken = authRes.data.access_token;

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

    console.log(`📡 Calling Gemini Vision for Project: ${PROJECT_ID}...`);
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
    console.log('✅ Body Analysis complete!');
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('❌ BODY ANALYSIS ERROR:', error.message);
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    res.status(500).json({ error: detail });
  }
});



// 📡 SOCKET.IO REALTIME ORDER TRACKING
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('subscribe_order', (data) => {
    const { orderId } = data;
    socket.join(`order_${orderId}`);
    console.log(`📦 Client subscribed to order: ${orderId}`);
  });

  socket.on('unsubscribe_order', (data) => {
    const { orderId } = data;
    socket.leave(`order_${orderId}`);
    console.log(`📦 Client unsubscribed from order: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  // Handle simulation requests
  socket.on('start_simulation', (data) => {
    const { orderId } = data;
    console.log(`🎮 Starting simulation for order ${orderId}`);
    startDriverLocationSimulation(orderId);
  });

  socket.on('stop_simulation', (data) => {
    const { orderId } = data;
    if (activeSimulations.has(orderId)) {
      clearInterval(activeSimulations.get(orderId));
      activeSimulations.delete(orderId);
      console.log(`⏹️ Stopped simulation for order ${orderId}`);
    }
  });
});

// 📡 Helper function to broadcast order updates
function broadcastOrderUpdate(orderId, updateData) {
  io.to(`order_${orderId}`).emit('order_update', {
    orderId,
    ...updateData,
    timestamp: Date.now()
  });
}

// 📡 Helper function to broadcast driver location
function broadcastDriverLocation(orderId, locationData) {
  io.to(`order_${orderId}`).emit('driver_location', {
    orderId,
    ...locationData,
    timestamp: Date.now()
  });
}

// 📡 Helper function to broadcast ETA updates
function broadcastEtaUpdate(orderId, etaData) {
  io.to(`order_${orderId}`).emit('eta_update', {
    orderId,
    ...etaData,
    timestamp: Date.now()
  });
}

// 📡 Helper function to send push notifications
function sendPushNotification(orderId, notificationData) {
  io.to(`order_${orderId}`).emit('push_notification', {
    orderId,
    ...notificationData,
    timestamp: Date.now()
  });
}

// 🚗 REAL-TIME DRIVER LOCATION SIMULATION
const activeSimulations = new Map();

function startDriverLocationSimulation(orderId) {
  if (activeSimulations.has(orderId)) {
    console.log(`⚠️ Simulation already running for order ${orderId}`);
    return;
  }

  // Bengaluru coordinates for simulation
  const warehouse = { lat: 12.9352, lng: 77.6245 };
  const destination = { lat: 12.9716, lng: 77.5946 };

  let currentLocation = { ...warehouse };
  let progress = 0;
  const totalSteps = 20;
  const stepSize = 1 / totalSteps;

  console.log(`🚗 Starting driver location simulation for order ${orderId}`);

  const interval = setInterval(() => {
    progress += stepSize;

    if (progress >= 1) {
      progress = 1;
      clearInterval(interval);
      activeSimulations.delete(orderId);
      console.log(`✅ Driver reached destination for order ${orderId}`);
    }

    // Interpolate position
    currentLocation = {
      lat: warehouse.lat + (destination.lat - warehouse.lat) * progress,
      lng: warehouse.lng + (destination.lng - warehouse.lng) * progress
    };

    // Add some randomness for realism
    currentLocation.lat += (Math.random() - 0.5) * 0.001;
    currentLocation.lng += (Math.random() - 0.5) * 0.001;

    // Calculate speed (km/h)
    const speed = 20 + Math.random() * 30;

    // Broadcast driver location
    broadcastDriverLocation(orderId, {
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      heading: Math.random() * 360,
      speed: speed,
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'KA 01 AB 1234',
      phone: '+91 98765 43210'
    });

    // Broadcast ETA update
    const remainingTime = Math.round((1 - progress) * 30);
    broadcastEtaUpdate(orderId, {
      eta: Math.max(5, remainingTime),
      distance: ((1 - progress) * 5.2).toFixed(1) + ' km'
    });

    // Broadcast order status updates at specific milestones
    if (progress >= 0.2 && progress < 0.21) {
      broadcastOrderUpdate(orderId, {
        status: 'processing',
        message: 'Processing',
        icon: '📦',
        progress: 25
      });
    } else if (progress >= 0.4 && progress < 0.41) {
      broadcastOrderUpdate(orderId, {
        status: 'shipped',
        message: 'Shipped',
        icon: '🚚',
        progress: 50
      });
    } else if (progress >= 0.6 && progress < 0.61) {
      broadcastOrderUpdate(orderId, {
        status: 'out_for_delivery',
        message: 'Out for Delivery',
        icon: '🚗',
        progress: 75
      });
    } else if (progress >= 1) {
      broadcastOrderUpdate(orderId, {
        status: 'delivered',
        message: 'Delivered',
        icon: '🎉',
        progress: 100
      });
      sendPushNotification(orderId, {
        title: 'Order Delivered!',
        message: 'Your order has been successfully delivered. Enjoy!'
      });
    }

  }, 3000); // Update every 3 seconds

  activeSimulations.set(orderId, interval);

  return () => {
    clearInterval(interval);
    activeSimulations.delete(orderId);
  };
}



// Export io instance for use in other modules
module.exports.io = io;
module.exports.broadcastOrderUpdate = broadcastOrderUpdate;
module.exports.broadcastDriverLocation = broadcastDriverLocation;
module.exports.broadcastEtaUpdate = broadcastEtaUpdate;
module.exports.sendPushNotification = sendPushNotification;
module.exports.startDriverLocationSimulation = startDriverLocationSimulation;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ DowCloth Stable Proxy is RUNNING at http://localhost:${PORT}`);
  console.log(`📡 Socket.io server is ready for realtime connections`);
  console.log(`🚗 Driver location simulation enabled`);
  console.log(`-------------------------------------------------\n`);
});
