import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { evaluate } from "mathjs";
import axios from 'axios';

const CentralDividedDifference = () => {
  const [fx, setFx] = useState("");
  const [x, setX] = useState('');
  const [h, setH] = useState('');
  const [order, setOrder] = useState('');
  const [result, setResult] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);

  const handleFxChange = (e) => {
    setFx(e.target.value);
  };

  const handleXChange = (e) => {
    const value = e.target.value;
    if (value === '' || isNaN(value)) {
        setX('');
    } else {
        setX(parseFloat(value));
    }
};

  const handleHChange = (e) => {
    const value = e.target.value;
    if (value === '' || isNaN(value)) {
        setH('');
    } else {
        setH(parseFloat(value));
    }
};

  const handleOrderChange = (e) => {
    const value = e.target.value;
    if (value === '' || isNaN(value)) {
        setOrder('');
    } else {
        setOrder(parseInt(value));
    }
};

  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const fetchExampleInput = () => {
    axios.get('/numerical-method/numerical-diff/1')
        .then((response) => {
            const data = response.data;
            
            // Convert e(x) to exp(x) for mathjs compatibility
            const functionExpression = data.function.replace('e(x)', 'exp(x)');
            
            setFx(functionExpression);
            setX(parseFloat(data.x));
            setH(parseFloat(data.h));
            setOrder(parseInt(data.order));
        })
        .catch((error) => {
            console.error("Error fetching example input:", error);
        });
  };

  const calculateCentralDividedDifference = () => {
    try {
      if (!fx || x === '' || h === '' || order === '') {
        throw new Error('Please enter all values');
      }

      const parsedX = parseFloat(x);
      const parsedH = parseFloat(h);
      const parsedOrder = parseInt(order);

      if (parsedH === 0) {
        throw new Error('Step size (h) cannot be zero');
      }

      const expression = fx
        .replace(/e\^x/gi, 'exp(x)')
        .replace(/\(e\^x\)/gi, '(exp(x))')
        .replace(/e\^/gi, 'exp');

      if (parsedOrder === 1) {
        // First order central difference: [f(x + h) - f(x - h)] / (2h)
        const fxPlusH = evaluate(expression, { x: parsedX + parsedH });
        const fxMinusH = evaluate(expression, { x: parsedX - parsedH });
        const approx = (fxPlusH - fxMinusH) / (2 * parsedH);

        const currentSteps = [
          {
            xValue: parsedX + parsedH,
            fxValue: fxPlusH,
            description: "f(x + h)"
          },
          {
            xValue: parsedX - parsedH,
            fxValue: fxMinusH,
            description: "f(x - h)"
          }
        ];

        setResult(approx);
        setSteps(currentSteps);
        setShowSteps(true);
      } else {
        // Higher order central differences
        let coefficients = [];
        const n = Math.floor((parsedOrder + 1) / 2);
        
        // Generate coefficients for central difference
        for (let i = -n; i <= n; i++) {
          if (parsedOrder % 2 === 0 && i === 0) continue;
          const coef = Math.pow(-1, i) * factorial(parsedOrder) /
            (factorial(n + i) * factorial(n - i));
          coefficients.push({ i, coef });
        }

        let terms = [];
        let currentSteps = [];

        coefficients.forEach(({ i, coef }) => {
          const xValue = parsedX + i * parsedH;
          const fxValue = evaluate(expression, { x: xValue });
          const term = coef * fxValue / Math.pow(2 * parsedH, parsedOrder);
          terms.push(term);

          currentSteps.push({
            xValue: xValue,
            fxValue: fxValue,
            coefficient: coef,
            term: term
          });
        });

        const approx = terms.reduce((sum, term) => sum + term, 0);
        setResult(approx);
        setSteps(currentSteps);
        setShowSteps(true);
      }
    } catch (error) {
      alert("Error in calculation. Please check your input and try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10">
        <h2 className="text-3xl mb-5">Central Divided Difference</h2>
        
        <div className="flex space-x-6">
          <div>
            <label className="text-gray-500">Function f(x)</label>
            <input
              type="text"
              value={fx}
              onChange={handleFxChange}
              className="block w-full my-3 p-2 border rounded-md"
              placeholder="Enter function (e.g., x^2, exp(x))"
            />
            <small className="text-gray-500">Use 'exp(x)' for exponential function</small>
          </div>
          <div>
            <label className="text-gray-500">x value</label>
            <input
              type="number"
              value={x}
              onChange={handleXChange}
              className="block w-full my-3 p-2 border rounded-md"
              placeholder="x value"
            />
          </div>
          <div>
            <label className="text-gray-500">Step size (h)</label>
            <input
              type="number"
              value={h}
              onChange={handleHChange}
              className="block w-full my-3 p-2 border rounded-md"
              step="0.1"
              placeholder="Step size"
            />
          </div>
          <div>
            <label className="text-gray-500">Order of Derivative</label>
            <input
              type="number"
              value={order}
              onChange={handleOrderChange}
              className="block w-full my-3 p-2 border rounded-md"
              min="1"
              placeholder="Order"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={fetchExampleInput}
            className="my-5 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200">
            Get Example
          </button>
        </div>

        <button
          onClick={calculateCentralDividedDifference}
          className="my-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          Calculate
        </button>

        {showSteps && (
          <div className="mt-5">
            <p className="mb-5">Result: f{`${"′".repeat(order)}`}({x}) ≈ {result?.toFixed(6)}</p>
            
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Step</th>
                  <th className="border px-4 py-2">x Value</th>
                  <th className="border px-4 py-2">f(x)</th>
                  {order > 1 && <th className="border px-4 py-2">Coefficient</th>}
                  {order > 1 && <th className="border px-4 py-2">Term</th>}
                </tr>
              </thead>
              <tbody>
                {steps.map((step, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{step.xValue.toFixed(4)}</td>
                    <td className="border px-4 py-2">{step.fxValue.toFixed(6)}</td>
                    {order > 1 && step.coefficient && <td className="border px-4 py-2">{step.coefficient.toFixed(6)}</td>}
                    {order > 1 && step.term && <td className="border px-4 py-2">{step.term.toFixed(6)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentralDividedDifference; 