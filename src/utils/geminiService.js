import axios from 'axios';

// Ideally, this should be in an environment variable like import.meta.env.VITE_GEMINI_API_KEY
// But for now, we will use the provided key.
const GEMINI_API_KEY = 'AIzaSyATSBk4uBGpOIa7InraajTHsmF70zg88JQ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Summarizes the patient's prescription history using Gemini.
 * @param {Array} prescriptions - List of prescription objects.
 * @param {Object} patientDetails - Basic patient details (name, age, gender).
 * @returns {Promise<string>} - The summary text.
 */
export const summarizePatientHistory = async (prescriptions, patientDetails) => {
  if (!prescriptions || prescriptions.length === 0) {
    return "No prescription history available to summarize.";
  }

  // Format the data for the prompt
  const historyText = prescriptions.map((rx, index) => {
    const medicines = rx.items?.map(m => 
      `- ${m.medicine_name} (${m.dosage}, ${m.frequency}) - ${m.duration}`
    ).join('\n    ');

    return `
    Record #${index + 1}:
    Date: ${new Date(rx.issue_date || rx.createdAt).toLocaleDateString()}
    Diagnosis: ${rx.diagnosis || 'N/A'}
    Doctor: ${rx.doctor_id?.firstName ? `Dr. ${rx.doctor_id.firstName} ${rx.doctor_id.lastName}` : 'N/A'}
    Notes: ${rx.notes || 'None'}
    Medicines:
    ${medicines || '    None'}
    `;
  }).join('\n');

  const prompt = `
    You are a helpful medical assistant AI. Please summarize the following patient medical history for a doctor.
    
    Patient: ${patientDetails.name} (${patientDetails.gender}, ${patientDetails.age} yrs)
    
    Past Prescriptions:
    ${historyText}
    
    Please provide a concise summary that highlights:
    1. Recurring diagnoses or chronic conditions.
    2. Major treatments or medicines prescribed repeatedly.
    3. Any significant notes or patterns in the history.
    4. A brief overview of the patient's recent health trajectory.

    Keep it professional, clinical, and concise.
  `;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const candidate = response.data?.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts) {
      return candidate.content.parts.map(part => part.text).join('');
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }

  } catch (error) {
    console.error("Error summarizing patient history:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
};
