import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { fraction } from 'mathjs';
import axios from 'axios';


const GaussEliminate = () => {
    const [matrixSize, setMatrixSize] = useState(3);
    const [matrix, setMatrix] = useState({});
    const [constants, setConstants] = useState({});
    const [solution, setSolution] = useState([]);
    const [steps, setSteps] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const fetchExampleInput = () => {
        axios.get('/numerical-method/linear-algrebra/matrix/1')
            .then((response) => {
                const data = response.data;
    
                // Extract the matrix and constant data from the response
                const matrixSize = data.matrix_size;
                const matrixValues = data.matrix_data.split(',').map(Number);
                const constantValues = data.constant_data.split(',').map(Number);
    
                // Set matrix
                let newMatrix = {};
                let index = 0;
                for (let i = 1; i <= matrixSize; i++) {
                    for (let j = 1; j <= matrixSize; j++) {
                        newMatrix[`a${i}${j}`] = matrixValues[index];
                        index++;
                    }
                }
    
                // Set constants
                let newConstants = {};
                for (let i = 1; i <= matrixSize; i++) {
                    newConstants[`x${i}`] = constantValues[i - 1];
                }
    
                // Update the state
                setMatrixSize(matrixSize); // Update matrix size
                setMatrix(newMatrix); // Set matrix values
                setConstants(newConstants); // Set constant values
                setShowResults(false); // Reset any previous results
            })
            .catch((error) => {
                console.error("There was an error fetching the example input!", error);
            });
    };

    const initializeMatrix = (size) => {
        let newMatrix = {};
        let newConstants = {};
        for (let i = 1; i <= size; i++) {
            for (let j = 1; j <= size; j++) {
                newMatrix[`a${i}${j}`] = '';
            }
            newConstants[`x${i}`] = '';
        }
        setMatrix(newMatrix);
        setConstants(newConstants);
    };

    const handleSizeChange = (e) => {
        const size = parseInt(e.target.value);
        setMatrixSize(size);
        initializeMatrix(size);
        setShowResults(false);
    };

    const handleMatrixChange = (e) => {
        const { name, value } = e.target;
        setMatrix(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleConstantChange = (e) => {
        const { name, value } = e.target;
        setConstants(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const checkInput = () => {
        const matrixValues = Object.values(matrix);
        const constantValues = Object.values(constants);
        
        const firstMatrixValue = matrixValues[0];
        const firstConstantValue = constantValues[0];
    
        const allMatrixSame = matrixValues.every(val => val === firstMatrixValue);
        const allConstantsSame = constantValues.every(val => val === firstConstantValue);
    
        if (allMatrixSame && allConstantsSame) {
            const newSolution = Array(matrixSize).fill(0);
            newSolution[0] = firstConstantValue; 
            setSolution(newSolution);
            setSteps([]); 
            setShowResults(true);
            return true; 
        }
    
        return false; 
    };



    const calculateGaussElimination = () => {

        if (checkInput()) {
            return;
        }

        const A = [];
        const constantValues = Object.values(constants);

        for (let i = 1; i <= matrixSize; i++) {
            A.push([]);
            for (let j = 1; j <= matrixSize; j++) {
                A[i-1].push(matrix[`a${i}${j}`]);
            }
        }

        const augmentedMatrix = A.map((row, index) => [...row, constantValues[index]]);
        const steps = [JSON.parse(JSON.stringify(augmentedMatrix))];

        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                const factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];
                for (let k = 0; k <= matrixSize; k++) {
                    augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                }
            }
            steps.push(JSON.parse(JSON.stringify(augmentedMatrix)));
        }

        const results = new Array(matrixSize).fill(0);
        for (let i = matrixSize - 1; i >= 0; i--) {
            results[i] = augmentedMatrix[i][matrixSize] / augmentedMatrix[i][i];
            for (let j = i + 1; j < matrixSize; j++) {
                results[i] -= (augmentedMatrix[i][j] / augmentedMatrix[i][i]) * results[j];
            }
        }

        setSolution(results.map(x => x.toFixed(6)));
        setSteps(steps);
        setShowResults(true);
    };

    const renderFraction = (value) => {
        if (Number.isInteger(value)) return value;
        const frac = fraction(value);
        const sign = frac.s < 0 ? '-' : ''; 
    
        return (
            <div className="flex items-center">
                {sign && <div className="mr-1">{sign}</div>}
                <div className="flex flex-col items-center">
                    <div>{Math.abs(frac.n)}</div>
                    <div className="border-t border-black w-full"></div> {/* Fraction bar */}
                    <div>{Math.abs(frac.d)}</div> 
                </div>
            </div>
        );
    };

    const renderMatrix = (matrix) => (
        <table className="border-collapse mx-auto">
            <tbody>
                {matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((value, colIndex) => (
                            <td key={colIndex} className="border border-white px-3 py-1 text-center text-xl">
                                {renderFraction(value)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-10">
                <h2 className="text-3xl mb-5 ">Gauss Elimination</h2>
                <div className="flex justify-end px-10">
                <button
                    onClick={fetchExampleInput}
                    className="my-5 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200">
                    Get Example Input
                </button>
                </div>
                    <label className="block mb-4">
                        Select Matrix Size
                        <select 
                            className="block mt-2 p-2 border rounded-md" 
                            value={matrixSize} 
                            onChange={handleSizeChange}
                        >
                            <option value={2}>2 x 2</option>
                            <option value={3}>3 x 3</option>
                            <option value={4}>4 x 4</option>
                        </select>
                    </label>
            

                <div className="flex justify-center mb-6">
                    <div>
                        {Array.from({ length: matrixSize }, (_, i) => (
                            <div key={i} className="flex mb-2">
                                {Array.from({ length: matrixSize }, (_, j) => (
                                    <input
                                        key={j}
                                        type="number"
                                        className="w-14 h-14 mx-2 my-2 text-center border rounded-md"
                                        placeholder={`a${i + 1}${j + 1}`}
                                        name={`a${i + 1}${j + 1}`}
                                        value={matrix[`a${i + 1}${j + 1}`] || ''}
                                        onChange={handleMatrixChange}
                                    />
                                ))}
                                <span className="mx-3 my-6">=</span>
                                <input
                                    type="number"
                                    className="w-14 h-14 mx-2 my-2 text-center border rounded-md"
                                    placeholder={`x${i + 1}`}
                                    name={`x${i + 1}`}
                                    value={constants[`x${i + 1}`] || ''}
                                    onChange={handleConstantChange}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                    <button
                        onClick={calculateGaussElimination}
                        className="my-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
                        Calculate
                    </button>
        

                {showResults && (
                        <div className="mt-5">
                            <h3 className="text-xl mb-5">Solution Steps</h3>
                            <div className="flex justify-center">
                                <div className="space-y-10 my-3">
                                    {steps.map((step, index) => (
                                        <div key={index} className="mb-6">
                                            <h4 className="text-xl mb-5">Step {index + 1}:</h4>
                                            {renderMatrix(step)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                                <div className="flex flex-wrap gap-4 px-20">
                                    {solution.map((sol, index) => (
                                        <div key={index} className="text-xl">
                                            x{index + 1} = {(parseFloat(sol).toFixed(6))}
                                        </div>
                                    ))}
                                </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default GaussEliminate;