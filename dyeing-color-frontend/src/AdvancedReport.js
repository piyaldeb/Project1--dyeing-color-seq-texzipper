import React from "react";

const AdvancedReport = ({ batches }) => {
    const handlePrint = () => {
        window.print(); // Allow manual printing
    };

    if (!batches || batches.length === 0) {
        return <p>No batches available.</p>;
    }

    return (
        <div style={{ padding: "10px", maxWidth: "600px", margin: "0 auto", fontSize: "14px" }}>
            <h1 style={{ fontSize: "20px" }}>Advanced Dyeing Color Sequence Report</h1>
            <button onClick={handlePrint} style={{ marginBottom: "20px" }}>
                Print Advanced Report
            </button>
            {batches.map((batch, batchIndex) => (
                <div key={batchIndex} style={{ marginBottom: "20px", border: "1px solid #000", padding: "10px" }}>
                    <h3>Batch {batchIndex + 1}</h3>
                    <p>No dyeing required for this batch. Colors can be dyed in any order without washing.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Seq</th>
                                <th>Color</th>
                                <th>Filename</th>
                                <th>Image</th>
                                <th>Remarks</th>
                                <th>Requires Wash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batch.map((color, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <div
                                            className="color-box"
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                backgroundColor: color.hex,
                                                border: "1px solid #000",
                                            }}
                                        ></div>
                                    </td>
                                    <td style={{ textAlign: "center" }}>{color.fileName}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <img
                                            src={color.imageUrl}
                                            alt={color.fileName}
                                            style={{ width: "70px", height: "auto" }}
                                        />
                                    </td>
                                    <td style={{ textAlign: "center" }}>{color.remarks}</td>
                                    <td style={{ textAlign: "center" }}>{color.requiresWash ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default AdvancedReport;