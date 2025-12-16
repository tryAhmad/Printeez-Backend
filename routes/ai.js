const express = require("express");
const router = express.Router();
// Import the official Google SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * @swagger
 * /api/ai/generate-seo:
 *   post:
 *     summary: Generate SEO meta description using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - category
 *             properties:
 *               productName:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               existingSEO:
 *                 type: string
 *     responses:
 *       200:
 *         description: SEO description generated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: AI generation failed
 */
router.post("/generate-seo", async (req, res) => {
  try {
    const { productName, category, description, existingSEO } = req.body;

    // 1. Validate Input
    if (!productName || !category) {
      return res.status(400).json({
        error: "Product name and category are required",
      });
    }

    // 2. Initialize Gemini Client
    // Ensure process.env.GEMINI_API_KEY is set in your .env file
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use the specific '001' version to avoid 404 alias errors
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Build the Prompt
    const prompt = `You are an expert SEO copywriter for an e-commerce t-shirt store called "Printeez".

Product Details:
- Name: ${productName}
- Category: ${category}
- Description: ${description || "N/A"}
${existingSEO ? `- Current SEO Draft: ${existingSEO}` : ""}

Task: Create a compelling, SEO-optimized meta description for this t-shirt product that:
1. Is between 150-160 characters long (critical).
2. Includes the product name naturally.
3. Uses action-oriented language.

Requirements:
- Must be exactly one sentence.
- No quotes or special formatting.
- Output ONLY the description text.`;

    // 4. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let seoDescription = response.text().trim();

    // 5. Post-process (Safety cleanup)
    seoDescription = seoDescription.replace(/^["']|["']$/g, ""); // Remove surrounding quotes

    // Enforce character limit hard cutoff if AI overshot
    if (seoDescription.length > 165) {
      seoDescription = seoDescription.substring(0, 160) + "...";
    }

    res.json({ seoDescription });
  } catch (err) {
    console.error("AI SEO generation error:", err);
    res.status(500).json({
      error: "Failed to generate SEO description",
      details: err.message, // This will help us debug if it fails again
    });
  }
});

module.exports = router;
