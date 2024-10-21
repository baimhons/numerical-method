import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const LinearInterpolation = () => {
    const [points, setPoints] = useState([
        { x: '', fx: '' }
    ]); // Dynamic points input
    const [point1, setPoint1] = useState(0); // Index for Point 1 (Default is first point)
    const [point2, setPoint2] = useState(1); // Index for Point 2 (Default is second point)
    const [xValue, setXValue] = useState(0); // Input x value
    const [result, setResult] = useState(null); // Result of interpolation

    // Function to handle input changes
    const handlePointChange = (index, field, value) => {
        const newPoints = [...points];
        newPoints[index][field] = value;
        setPoints(newPoints);
    };

    // Add new point
    const addPoint = () => {
        setPoints([...points, { x: '', fx: '' }]);
    };

    // Remove a point
    const removePoint = (index) => {
        const newPoints = points.filter((_, i) => i !== index);
        setPoints(newPoints);
    };

    // Calculate the divided differences for linear interpolation
    const calculateLinearDividedDifferences = (points) => {
        const n = points.length;
        const dividedDifferences = Array(n).fill(null).map(() => Array(n).fill(0));

        // Set the function values f(x) for each point
        for (let i = 0; i < n; i++) {
            dividedDifferences[i][0] = parseFloat(points[i].fx);
        }

        // Calculate the first order divided differences (linear interpolation)
        for (let i = 0; i < n - 1; i++) {
            dividedDifferences[i][1] = (dividedDifferences[i + 1][0] - dividedDifferences[i][0]) / 
                                       (parseFloat(points[i + 1].x) - parseFloat(points[i].x));
        }

        return dividedDifferences;
    };

    // Calculate Newton's linear interpolation
    const calculateLinearInterpolation = () => {
        const selected = [points[point1], points[point2]]; // Get selected points
        if (selected.length !== 2) {
            alert("Please select exactly two points for linear interpolation.");
            return;
        }

        const dividedDifferences = calculateLinearDividedDifferences(selected);
        const x = parseFloat(xValue); // Value where we want to estimate f(x)
        
        // Linear interpolation formula: f(x) = f(x0) + f[x0, x1](x - x0)
        const interpolatedValue = dividedDifferences[0][0] + 
                                  dividedDifferences[0][1] * (x - parseFloat(selected[0].x));

        setResult(interpolatedValue);
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-10">
                <h2 className="text-3xl mb-5">Linear Interpolation</h2>
                
                {/* Dynamic points input */}
                <div>
                    <h3 className="text-xl mb-3">Enter Points Data</h3>
                    {points.map((point, index) => (
                        <div key={index} className="mb-3">
                            <label>Point {index + 1}:</label>
                            <input
                                type="number"
                                className="mx-2 p-2 border rounded-md"
                                placeholder="x"
                                value={point.x}
                                onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                            />
                            <input
                                type="number"
                                className="mx-2 p-2 border rounded-md"
                                placeholder="f(x)"
                                value={point.fx}
                                onChange={(e) => handlePointChange(index, 'fx', e.target.value)}
                            />
                            {points.length > 1 && (
                                <button
                                    onClick={() => removePoint(index)}
                                    className="mx-2 px-2 py-1 bg-red-500 text-white rounded-md">
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Button to add more points */}
                <button
                    onClick={addPoint}
                    className="my-3 px-4 py-2 bg-gray-500 text-white rounded-md">
                    Add Point
                </button>

                {/* Selection of point1 and point2 */}
                <div className="flex space-x-6">
                    <div>
                        <label className="text-gray-500">Select Point 1</label>
                        <input
                            type="number"
                            className="block w-full my-3 p-2 border rounded-md"
                            placeholder="Point 1 index"
                            value={point1 + 1}
                            onChange={(e) => setPoint1(parseInt(e.target.value) - 1)}
                        />
                    </div>
                    <div>
                        <label className="text-gray-500">Select Point 2</label>
                        <input
                            type="number"
                            className="block w-full my-3 p-2 border rounded-md"
                            placeholder="Point 2 index"
                            value={point2 + 1}
                            onChange={(e) => setPoint2(parseInt(e.target.value) - 1)}
                        />
                    </div>
                </div>

                {/* Input x value */}
                <div>
                    <label className="text-gray-500">Enter x value for interpolation</label>
                    <input
                        type="number"
                        className="block w-full my-3 p-2 border rounded-md"
                        placeholder="x value"
                        value={xValue}
                        onChange={(e) => setXValue(parseFloat(e.target.value))}
                    />
                </div>

                {/* Calculate button */}
                <button
                    onClick={calculateLinearInterpolation}
                    className="my-5 px-4 py-2 bg-blue-500 text-white rounded-md">
                    Calculate
                </button>

                {/* Display result */}
                {result !== null && (
                    <div className="mt-5">
                        <p>Interpolated y value: {result.toFixed(6)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinearInterpolation;
