import React, { useState, useEffect } from 'react';
import { WorkflowVariable } from '../../types/workflow';
import { extractVariablesFromPrompt } from '../../utils/variableParser';

interface VariableManagerProps {
  variables: WorkflowVariable[];
  prompts: string[];
  onChange: (variables: WorkflowVariable[]) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  prompts,
  onChange
}) => {
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  useEffect(() => {
    const allVariables = new Set<string>();
    prompts.forEach(prompt => {
      extractVariablesFromPrompt(prompt).forEach(variable => {
        allVariables.add(variable);
      });
    });
    setDetectedVariables([...allVariables]);
  }, [prompts]);

  const addVariable = (variableName: string) => {
    if (!variables.find(v => v.name === variableName)) {
      onChange([...variables, {
        name: variableName,
        value: '',
        description: ''
      }]);
    }
  };

  const updateVariable = (index: number, updates: Partial<WorkflowVariable>) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    onChange(updatedVariables);
  };

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const addCustomVariable = () => {
    const name = prompt('Enter variable name (without {}):');
    if (name && name.trim()) {
      addVariable(name.trim());
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Variables</h3>
        <button
          onClick={addCustomVariable}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Add Variable
        </button>
      </div>

      {detectedVariables.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            Detected in prompts:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {detectedVariables.map(variable => (
              <button
                key={variable}
                onClick={() => addVariable(variable)}
                disabled={variables.some(v => v.name === variable)}
                style={{
                  backgroundColor: variables.some(v => v.name === variable) ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: variables.some(v => v.name === variable) ? 'default' : 'pointer',
                  opacity: variables.some(v => v.name === variable) ? 0.6 : 1
                }}
              >
                {variable} {variables.some(v => v.name === variable) && '✓'}
              </button>
            ))}
          </div>
        </div>
      )}

      {variables.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
          <p style={{ margin: 0, fontSize: '14px' }}>
            No variables defined. Use {'{variable_name}'} in your prompts to create variables.
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {variables.map((variable, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {'{' + variable.name + '}'}
                </span>
                <button
                  onClick={() => removeVariable(index)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  Default Value
                </label>
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) => updateVariable(index, { value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="Enter default value..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={variable.description || ''}
                  onChange={(e) => updateVariable(index, { description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="Describe this variable..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariableManager;