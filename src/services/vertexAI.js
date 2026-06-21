import axios from 'axios';

/**
 * 🏛️ PURE REACT JS VERCEL API MESSENGER
 * Securely calls the /api/tryon proxy for AI Virtual Fitting.
 * This removes all sensitive keys and heavy logic from the client side.
 */

/**
 * 📸 PURE WEB BASE64 LOADER
 */
async function toBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 🚀 SECURE VERCEL API CALL
 */
export async function performVirtualTryOn(personImageUri, garmentImageUri, garmentCategory = 'upper body') {
  console.log('📡 SENDING REQUEST TO VERCEL API...');

  try {
    const personBase64 = await toBase64(personImageUri);
    const garmentBase64 = await toBase64(garmentImageUri);

    // 🛡️ CALLING THE VERCEL SERVERLESS PROXY
    const response = await axios.post('/api/tryon', {
      personBase64,
      garmentBase64,
      garmentCategory
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    });

    if (response.data && response.data.success) {
      console.log('📥 Success: AI Render Received from Vercel.');
      return { success: true, imageUri: response.data.imageUri };
    } else {
      throw new Error(response.data.error || 'API Prediction failed.');
    }

  } catch (error) {
    let errorMsg = error.message;
    if (error.response && error.response.data) {
      errorMsg = JSON.stringify(error.response.data);
    }
    console.log('❌ VERCEL PROXY ERROR:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
