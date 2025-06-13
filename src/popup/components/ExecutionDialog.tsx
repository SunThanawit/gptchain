import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowVariable } from '../../types/workflow';
import { extractVariablesFromPrompt } from '../../utils/variableParser';

interface ExecutionDialogProps {
  workflow: Workflow;
  onExecute: (workflow: Workflow, variableValues: Record<string, string>) => void;
  onCancel: () => void;
}

const ExecutionDialog: React.FC<ExecutionDialogProps> = ({
  workflow,
  onExecute,
  onCancel
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [requiredVariables, setRequiredVariables] = useState<string[]>([]);

  useEffect(() => {
    const allVariables = new Set<string>();
    workflow.nodes.forEach(node => {
      if (node.data.prompt) {
        extractVariablesFromPrompt(node.data.prompt).forEach(variable => {
          allVariables.add(variable);
        });
      }
    });

    const variables = [...allVariables];
    setRequiredVariables(variables);

    const initialValues: Record<string, string> = {};
    variables.forEach(variable => {
      const workflowVariable = workflow.variableDefinitions?.find(v => v.name === variable);
      initialValues[variable] = workflowVariable?.value || '';
    });
    setVariableValues(initialValues);
  }, [workflow]);

  const updateVariableValue = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleExecute = () => {
    onExecute(workflow, variableValues);
  };

  const isReadyToExecute = requiredVariables.every(variable => 
    variableValues[variable] && variableValues[variable].trim() !== ''
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '10px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        width: '100%',
        maxWidth: '380px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>
            Execute: {workflow.name}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
            {workflow.description}
          </p>
        </div>

        {requiredVariables.length > 0 ? (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              Set Variable Values
            </h3>
            
            {requiredVariables.map(variable => {
              const workflowVariable = workflow.variableDefinitions?.find(v => v.name === variable);
              return (
                <div key={variable} style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '3px', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    {'{' + variable + '}'}
                  </label>
                  {workflowVariable?.description && (
                    <p style={{ 
                      margin: '0 0 6px 0', 
                      fontSize: '11px', 
                      color: '#6c757d',
                      fontStyle: 'italic'
                    }}>
                      {workflowVariable.description}
                    </p>
                  )}
                  <textarea
                    value={variableValues[variable] || ''}
                    onChange={(e) => updateVariableValue(variable, e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                    placeholder={`Enter value for ${variable}...`}
                  />
                </div>
              );
            })}

            {!isReadyToExecute && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '6px 8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#856404'
              }}>
                ⚠️ Please fill in all variable values before executing.
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#155724'
          }}>
            ✅ This workflow has no variables. Ready to execute!
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={!isReadyToExecute}
            style={{
              backgroundColor: isReadyToExecute ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              cursor: isReadyToExecute ? 'pointer' : 'not-allowed',
              opacity: isReadyToExecute ? 1 : 0.6
            }}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDialog;