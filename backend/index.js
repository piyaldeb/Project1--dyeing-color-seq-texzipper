const express = require("express");
const multer = require("multer");
const ColorThief = require("colorthief");
const sharp = require("sharp");
const tinycolor = require("tinycolor2");
const cors = require("cors");

// Initialize Express app
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

let sortedColorsData = [];
let groupedBatchesData = [];

// Endpoint to process images
app.post("/sort-colors", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No images uploaded." });
        }

        const colorData = [];

        for (const file of req.files) {
            try {
                const imageBuffer = await sharp(file.buffer).resize(200, 200).toBuffer();
                const [r, g, b] = await ColorThief.getColor(imageBuffer);
                const hexColor = rgbToHex(r, g, b);
                const lightness = tinycolor(hexColor).getBrightness();

                // Check if the color requires a mandatory wash
                const requiresWash = requiresMandatoryWash(hexColor);

                const base64Image = imageBuffer.toString("base64");
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;

                colorData.push({
                    hex: hexColor,
                    lightness,
                    fileName: file.originalname,
                    imageUrl,
                    requiresWash,
                });
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
            }
        }

        // Sort colors by lightness (lightest to darkest)
        colorData.sort((a, b) => b.lightness - a.lightness);

        // Group colors into batches until a wash is required
        const batches = [];
        let currentBatch = [];

        for (let i = 0; i < colorData.length; i++) {
            const color = colorData[i];

            // If the color requires a wash, start a new batch
            if (color.requiresWash && currentBatch.length > 0) {
                batches.push(currentBatch);
                currentBatch = [];
            }

            // Add the color to the current batch
            currentBatch.push(color);

            // If the next color requires a wash, start a new batch
            if (i < colorData.length - 1 && colorData[i + 1].requiresWash) {
                batches.push(currentBatch);
                currentBatch = [];
            }
        }

        // Add the last batch
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