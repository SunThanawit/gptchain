import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowNode, WorkflowVariable } from '../../types/workflow';
import VariableManager from './VariableManager';

interface WorkflowEditorProps {
  workflow: Workflow | null;
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflow,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [variableDefinitions, setVariableDefinitions] = useState<WorkflowVariable[]>([]);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setNodes(workflow.nodes);
      setVariableDefinitions(workflow.variableDefinitions || []);
    }
  }, [workflow]);

  const addPromptNode = () => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: 'prompt',
      position: { x: 0, y: nodes.length * 100 },
      data: {
        label: `Prompt ${nodes.length + 1}`,
        prompt: '',
        variables: {}
      }
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode['data']>) => {
    setNodes(nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  };

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const handleSave = () => {
    if (!workflow) return;

    const updatedWorkflow: Workflow = {
      ...workflow,
      name,
      description,
      nodes,
      edges: [],
      variableDefinitions,
      updatedAt: new Date()
    };

    onSave(updatedWorkflow);
  };

  if (!workflow) return null;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Save Workflow
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
            Workflow Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="Enter workflow name..."
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Describe what this workflow does..."
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Workflow Steps</h3>
          <button
            onClick={addPromptNode}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Add Prompt
          </button>
        </div>

        {nodes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <p style={{ margin: 0, fontSize: '14px' }}>
              No steps yet. Add your first prompt to get started.
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {nodes.map((node, index) => (
              <div
                key={node.id}
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
                    Step {index + 1}: {node.data.label}
                  </span>
                  <button
                    onClick={() => removeNode(node.id)}
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
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={node.data.label}
                    onChange={(e) => updateNode(node.id, { label: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                    placeholder="Step name..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    Prompt
                  </label>
                  <textarea
                    value={node.data.prompt || ''}
                    onChange={(e) => updateNode(node.id, { prompt: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter your prompt here... Use {variable_name} for variables."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <VariableManager
        variables={variableDefinitions}
        prompts={nodes.map(node => node.data.prompt || '')}
        onChange={setVariableDefinitions}
      />
    </div>
  );
};

export default WorkflowEditor;