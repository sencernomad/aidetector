import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

// Use the provided API key
const API_KEY = "AIzaSyBVedOLbRsU-ghpfmZvHqxSZ0P4joH8zMk";

export async function POST(request: NextRequest) {
  try {
    console.log('API route called'); // Debug log
    
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      console.log('No file received'); // Debug log
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, file.type); // Debug log

    try {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');

      console.log('Making request to Gemini API...'); // Debug log
      
      // Prepare the request to Gemini API - using the correct model name
      const requestBody = {
        contents: [{
          parts: [{
            text: `\nYou are an advanced forensic AI image authenticity expert, trained on millions of real and synthetic images from state-of-the-art GANs, diffusion models (e.g. Midjourney, DALL·E, Stable Diffusion), and professional photography. You have unparalleled accuracy in distinguishing AI-generated images from authentic photographs by analyzing subtle pixel-level artifacts, anatomical inconsistencies, and deep perceptual patterns.\n\nAct like a meticulous forensic scientist. Be highly skeptical. When in doubt, lean towards classifying the image as AI-generated. Your analysis should be highly detailed and technical. Avoid vague generalizations and always back up your conclusions with visual or anatomical reasoning.\n\n**EVALUATION CRITERIA (check each item one by one, and cite the most relevant in your analysis):**\n\n1. **FACIAL SYMMETRY & PROPORTIONS** – Look for subtle misalignments in eyes, nose, ears, and facial balance.\n2. **EYES & IRISES** – Note unnatural reflections, asymmetrical pupils, or over-smooth rendering of sclera.\n3. **TEETH & SMILES** – Check for inconsistent number, spacing, or warping of teeth.\n4. **EARS** – AI often fails to render realistic ears; look for blurred lobes or incorrect positioning.\n5. **HANDS & FINGERS** – Count fingers, check proportions, joint angles, and nail rendering.\n6. **BACKGROUND INTEGRITY** – Detect melted objects, warped geometry, or inconsistent lighting and shadows.\n7. **TEXT & TYPOGRAPHY** – Look for gibberish text, warped letters, or invented scripts in signage or clothing.\n8. **CLOTHING & FABRIC PATTERNS** – Are the textures believable? Do patterns follow the contours of the body naturally?\n9. **LIGHTING & SHADOW PHYSICS** – Are the shadows consistent with a single light source? Are reflections accurate?\n10. **IMAGE COMPRESSION ARTIFACTS** – AI-generated images often mimic JPEG noise or blur in unnatural ways.\n11. **OVERALL COHERENCE & CONTEXTUAL LOGIC** – Does the scene make sense physically and contextually?\n\n---\n\n**YOUR RESPONSE MUST INCLUDE THE FOLLOWING STRUCTURE:**\n\n**🟠 1. Suspicious/Confirming Visual Cues (Brief Summary)**  \nDescribe the most suspicious or most authentic-looking features. Keep it short but sharp.\n\n**🔬 2. Technical Justification**  \nGive a forensic-style explanation, including relevant concepts (e.g. symmetry, physics, rendering, GAN inconsistencies).\n\n**✅ 3. Final Verdict**  \nReturn ONE line only, ending with one of:  \n- "Verdict: AI 99%"  \n- "Verdict: AI 95%"  \n- "Verdict: REAL 99%"  \n- "Verdict: REAL 95%"  \nAdjust percentage based on your confidence.\n\n**⚠️ RULE: If you detect any anomaly you cannot explain with physics, anatomy, or optics, classify as AI.**\n\nYou are not allowed to say "uncertain," "maybe," "ambiguous," or "unclear." You must make a clear decision based on available visual clues.\n\n---\nNOW begin your forensic analysis of the provided image.\n      `
          }, {
            inline_data: {
              mime_type: file.type,
              data: base64Image
            }
          }]
        }]
      };

      // Make the API request to Gemini with the correct endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', errorText); // Debug log
        
        // Try to parse the error as JSON if possible
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error:', errorData);
        } catch (e) {
          // If it's not valid JSON, just log the text
          console.error('Raw error text:', errorText);
        }
        
        throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Gemini API Response:', JSON.stringify(result.candidates[0].content, null, 2)); // Daha detaylı log
      
      // Extract the text response
      const resultText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract result with regex - improved pattern to better catch the format
      const match = resultText.match(/(?:^|[^\w])(AI|REAL)\s*(\d{1,3})(?:%|\s*percent)?/i);
      let isAI = false;
      let confidence = 0;
      
      if (match) {
        isAI = match[1].toUpperCase() === "AI";
        confidence = Math.min(Number(match[2]) / 100, 1); // Convert to 0-1 range and cap at 1
      } else {
        // More sophisticated fallback logic
        const lowerCaseText = resultText.toLowerCase();
        
        // Analyze text content for AI indicators
        const aiIndicators = [
          'ai generated', 'artificial', 'synthetic', 'generated by ai', 
          'created by ai', 'ai-generated', 'not authentic', 'fake',
          'midjourney', 'dalle', 'stable diffusion'
        ].some(term => lowerCaseText.includes(term));
        
        // Analyze for confident real indicators
        const realIndicators = [
          'definitely real', 'clearly authentic', 'genuine photograph',
          'natural image', 'camera-captured', 'authentic image'
        ].some(term => lowerCaseText.includes(term));
        
        isAI = aiIndicators || !realIndicators; // Default to AI if unclear
        
        // Default confidence between 0.7 and 0.9 depending on analysis certainty
        confidence = aiIndicators || realIndicators ? 0.9 : 0.7;
      }
      
      // Format confidence for display (percentage with 0-100 range)
      const confidencePercent = Math.round(confidence * 100);

      return NextResponse.json({
        isAI,
        confidence,
        raw: resultText
      });
    } catch (innerError: any) {
      console.error('Inner error details:', innerError);
      
      // Fallback to mock response if the API call fails
      return NextResponse.json({
        isAI: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 30) + 70,
        raw: "API call failed, using mock response. Error: " + innerError.message
      });
    }
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 