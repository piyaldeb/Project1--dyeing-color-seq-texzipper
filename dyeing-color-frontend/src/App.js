import React, { useState } from "react";
import axios from "axios";
import Report from "./Report";
import AdvancedReport from "./AdvancedReport";
import API_BASE_URL from "./config";


function App() {
    const [sortedColors, setSortedColors] = useState([]);
    const [groupedBatches, setGroupedBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAdvancedReport, setShowAdvancedReport] = useState(false);

    const handleImageUpload = async (event) => {
        const files = event.target.files;

        if (files.length === 0) {
            alert("Please upload at least one image.");
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append("images", file);
        }

        setLoading(true);
        setError("");

        try {
            // const response = await axios.post("http://localhost:5000/sort-colors", formData, {
            //     headers: {
            //         "Content-Type": "multipart/form-data",
            //     },
            // });
            const response = await axios.post(`${API_BASE_URL}/sort-colors`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            

            setSortedColors(response.data.sortedColors);
            setGroupedBatches(response.data.groupedBatches || []);
        } catch (err) {
            console.error("Error uploading files:", err);
            setError("Failed to process images. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Dyeing Color Sequence Report</h1>
            <div>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={loading} />
            </div>

            {loading && <p>Processing images...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {sortedColors.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Basic Sorting Report</h2>
                    <Report sortedColors={sortedColors} />

                    <button
                        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", marginLeft: "10px" }}
                        onClick={() => setShowAdvancedReport(!showAdvancedReport)}
                    >
                        {showAdvancedReport ? "Hide Advanced Report" : "Show Advanced Report"}
                    </button>

                    {showAdvancedReport && (
                        <div style={{ marginTop: "20px" }}>
                            <h2>Advanced Sorting Report</h2>
                            <AdvancedReport batches={groupedBatches} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;