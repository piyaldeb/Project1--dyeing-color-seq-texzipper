const express = require("express");
const multer = require("multer");
const ColorThief = require("colorthief");
const sharp = require("sharp");
const tinycolor = require("tinycolor2");
const DeltaE = require("delta-e");
const Color = require("color"); // Add the "color" library for RGB-to-LAB conversion
const cors = require("cors");

// Initialize Express app
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to convert RGB to LAB
function rgbToLab(rgb) {
    const colorObj = Color.rgb(rgb); // Create a color object from RGB
    const lab = colorObj.lab(); // Convert to LAB color space
    return { L: lab[0], A: lab[1], B: lab[2] }; // Return LAB values
}

// Endpoint to process images
app.post("/sort-colors", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No images uploaded." });
        }

        const colorData = [];
        for (const file of req.files) {
            try {
                // Validate file type
                if (!file.mimetype.startsWith("image/")) {
                    console.warn(`Skipping file ${file.originalname}: Not an image.`);
                    continue;
                }

                // Process the image using Sharp
                let imageBuffer;
                try {
                    imageBuffer = await sharp(file.buffer)
                        .resize(200, 200) // Resize for consistency
                        .toFormat("jpeg") // Convert to JPEG
                        .toBuffer();
                } catch (error) {
                    console.error(`Failed to process image ${file.originalname} with Sharp:`, error);
                    continue; // Skip this file if Sharp fails
                }

                // Extract dominant color using ColorThief
                let dominantColor;
                try {
                    dominantColor = await ColorThief.getColor(imageBuffer);
                } catch (error) {
                    console.error(`Failed to extract color from ${file.originalname}:`, error);
                    continue; // Skip this file if ColorThief fails
                }

                // Handle cases where ColorThief returns null (e.g., solid-color images)
                if (!dominantColor) {
                    console.warn(`No dominant color detected for ${file.originalname}. Using fallback logic.`);

                    // Fallback: Use pixel data from the top-left corner of the image
                    const { data } = await sharp(imageBuffer)
                        .raw()
                        .ensureAlpha() // Ensure alpha channel is present
                        .toBuffer({ resolveWithObject: true });

                    // Extract RGB values from the first pixel
                    const r = data[0];
                    const g = data[1];
                    const b = data[2];

                    dominantColor = [r, g, b];
                }

                const [r, g, b] = dominantColor;
                const hexColor = rgbToHex(r, g, b);
                const lightness = tinycolor(hexColor).getBrightness();
                const requiresWash = requiresMandatoryWash(hexColor);

                // Convert RGB to LAB for Delta-E calculations
                const labColor = rgbToLab([r, g, b]);

                // Encode image as Base64
                const base64Image = imageBuffer.toString("base64");
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;

                // Add color data
                colorData.push({
                    hex: hexColor,
                    lightness,
                    fileName: file.originalname,
                    imageUrl,
                    requiresWash,
                    lab: labColor, // Include LAB values for Delta-E
                });
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
            }
        }

        if (colorData.length === 0) {
            return res.status(400).json({ error: "No valid colors extracted from images." });
        }

        // Sort colors by lightness (lightest to darkest)
        colorData.sort((a, b) => b.lightness - a.lightness);

        // Group colors into batches based on Delta-E
        const batches = [];
        let currentBatch = [];

        for (let i = 0; i < colorData.length; i++) {
            const color = colorData[i];

            if (currentBatch.length > 0) {
                const lastColor = currentBatch[currentBatch.length - 1];

                // Calculate Delta-E between the current color and the last color in the batch
                const deltaE = DeltaE.getDeltaE00(color.lab, lastColor.lab);

                // If the color requires a wash or Delta-E is too high, start a new batch
                if (color.requiresWash || deltaE > 10) { // Adjust threshold as needed
                    batches.push(currentBatch);
                    currentBatch = [];
                }
            }

            currentBatch.push(color);
        }

        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        // Calculate washing savings
        const totalWashesWithoutOptimization = colorData.length;
        const totalWashesWithOptimization = batches.length;
        const washesSaved = totalWashesWithoutOptimization - totalWashesWithOptimization;

        // Prepare the response
        const response = {
            sortedColors: colorData,
            groupedBatches: batches,
            washesSaved,
        };

        res.json(response);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Failed to process images." });
    }
});

// Helper function to check if a color requires a mandatory wash
function requiresMandatoryWash(hexColor) {
    const color = tinycolor(hexColor);
    const hue = color.toHsl().h; // Get the hue value (0-360)

    // Define problematic colors (e.g., red and black)
    const isRed = hue >= 0 && hue <= 30; // Red hues
    const isBlack = color.getBrightness() <= 10; // Very dark colors

    return isRed || isBlack;
}

// Helper function to convert RGB to hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));