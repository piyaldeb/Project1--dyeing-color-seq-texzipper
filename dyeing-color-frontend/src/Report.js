import React from "react";

const Report = ({ sortedColors }) => {
    const handlePrint = () => {
        window.print(); // Allow manual printing
    };

    return (
        <div style={{ padding: "10px", maxWidth: "600px", margin: "0 auto", fontSize: "14px" }}>
            <h1 style={{ fontSize: "20px" }}>Basic Dyeing Color Sequence Report</h1>
            <button onClick={handlePrint} style={{ marginBottom: "20px" }}>
                Print Report
            </button>
            {sortedColors.map((color, index) => (
                <div key={index} style={{ border: "1px solid #000", padding: "10px", marginBottom: "10px" }}>
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
                            <tr>
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
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default Report;