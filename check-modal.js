const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Make sure you have dotenv installed

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelResponse = await genAI.getGenerativeModel({
      model: "gemini-pro",
    });
    // We can't list models directly with the basic SDK client easily in some versions,
    // but we can try to hit the REST endpoint to see the list.

    console.log("Checking available models via Fetch...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    if (data.models) {
      console.log("✅ Available Models:");
      data.models.forEach((m) => {
        if (m.name.includes("flash") || m.name.includes("pro")) {
          console.log(` - ${m.name.replace("models/", "")}`);
        }
      });
    } else {
      console.log("❌ Error listing models:", data);
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

listModels();
