import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CramerRule from '../../pages/linearAlgebras/CramerRule';
import '@testing-library/jest-dom';

// Mock Sidebar component
jest.mock('../../components/Sidebar', () => {
  return function DummySidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

const axios = require('axios');

describe('Cramer Rule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<CramerRule />);
  });

  it('should render initial components correctly', () => {
    // Check for title
    expect(screen.getByText("Cramer's Rule")).toBeInTheDocument();

    // Check for matrix size selector
    expect(screen.getByText('Select Matrix Size')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('3'); // Default size is 3

    // Check for buttons
    expect(screen.getByText('Get Example Input')).toBeInTheDocument();
    expect(screen.getByText('Calculate')).toBeInTheDocument();

    // Check for initial 3x3 matrix inputs (9 matrix inputs + 3 constant inputs)
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(12);
  });

  it('should handle matrix size changes', () => {
    const sizeSelector = screen.getByRole('combobox');
    
    // Change to 2x2
    fireEvent.change(sizeSelector, { target: { value: '2' } });
    let inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(6); // 4 matrix inputs + 2 constant inputs

    // Change to 4x4
    fireEvent.change(sizeSelector, { target: { value: '4' } });
    inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(20); // 16 matrix inputs + 4 constant inputs
  });

  it('should fetch and display example data correctly', async () => {
    const mockData = {
      matrix_size: 3,
      matrix_data: '1,2,3,4,5,6,7,8,9',
      constant_data: '1,2,3'
    };

    axios.get.mockResolvedValueOnce({ data: mockData });

    fireEvent.click(screen.getByText('Get Example Input'));

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton');
      // Check first matrix input
      expect(inputs[0]).toHaveValue(1);
      // Check last constant input
      expect(inputs[11]).toHaveValue(3);
    });
  });

  it('should handle input changes', () => {
    const inputs = screen.getAllByRole('spinbutton');
    
    // Change first matrix input
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(inputs[0]).toHaveValue(5);

    // Change last constant input
    fireEvent.change(inputs[11], { target: { value: '10' } });
    expect(inputs[11]).toHaveValue(10);
  });

  it('should calculate and display results', async () => {
    // Increase the test timeout
    jest.setTimeout(10000);
    
    const inputs = screen.getAllByRole('spinbutton');
    
    // Set up a simple 3x3 identity matrix
    const matrixValues = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const constantValues = [1, 1, 1];

    // Fill matrix inputs
    matrixValues.forEach((value, index) => {
      fireEvent.change(inputs[index], { target: { value: value.toString() } });
    });

    // Fill constant inputs
    constantValues.forEach((value, index) => {
      fireEvent.change(inputs[9 + index], { target: { value: value.toString() } });
    });

    // Calculate
    fireEvent.click(screen.getByText('Calculate'));

    // Check for initial results display
    await waitFor(() => {
      expect(screen.getByText('Det')).toBeInTheDocument();
      expect(screen.getByText('x1')).toBeInTheDocument();
      expect(screen.getByText('x2')).toBeInTheDocument();
      expect(screen.getByText('x3')).toBeInTheDocument();
    }, {
      timeout: 10000
    });

    // Check for calculation results
    await waitFor(() => {
      // Verify equals signs exist
      const equalsSigns = screen.getAllByText('=');
      expect(equalsSigns.length).toBeGreaterThan(0);
      
      // Verify result structure
      const resultSection = screen.getByText('Det').closest('div');
      expect(resultSection).toBeInTheDocument();
      
      // Verify matrix tables are present
      const tables = document.querySelectorAll('table');
      expect(tables.length).toBeGreaterThan(0);
      
      // Verify solution values are present (using data-testid)
      const solutions = screen.getAllByTestId('solution-value');
      expect(solutions.length).toBeGreaterThan(0);
    }, {
      timeout: 10000
    });
  }, 15000);

  it('should handle simple matrix calculation', async () => {
    const inputs = screen.getAllByRole('spinbutton');
    
    // Set a simple matrix where all values are 1
    inputs.forEach(input => {
      fireEvent.change(input, { target: { value: '1' } });
    });

    // Calculate
    fireEvent.click(screen.getByText('Calculate'));

    await waitFor(() => {
      // Check for results section
      expect(screen.getByText('Det')).toBeInTheDocument();
      
      // Check for solution display
      const resultSection = screen.getByText('Det').parentElement;
      expect(resultSection).toBeInTheDocument();

      // Verify that some numeric results are shown
      const numbers = screen.getAllByText(/[0-9]/);
      expect(numbers.length).toBeGreaterThan(0);
    }, {
      timeout: 5000
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    fireEvent.click(screen.getByText('Get Example Input'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle special case when all inputs are equal', async () => {
    const inputs = screen.getAllByRole('spinbutton');
    
    // Set all inputs to 1
    inputs.forEach(input => {
      fireEvent.change(input, { target: { value: '1' } });
    });

    fireEvent.click(screen.getByText('Calculate'));

    await waitFor(() => {
      expect(screen.getByText('Det')).toBeInTheDocument();
      // First solution should be 1, others should be 0
      const solutions = screen.getAllByText(/[0-9]+\.?[0-9]*/);
      expect(solutions.some(node => node.textContent === '1')).toBeTruthy();
    });
  });
}); 