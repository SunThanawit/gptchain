import React, { useState, useEffect } from 'react';
import { Workflow } from '../types/workflow';
import WorkflowList from './components/WorkflowList';
import WorkflowEditor from './components/WorkflowEditor';

const App: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [view, setView] = useState<'list' | 'editor'>('list');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'LOAD_WORKFLOWS' });
      setWorkflows(response);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: 'A new workflow',
      nodes: [],
      edges: [],
      variables: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentWorkflow(newWorkflow);
    setView('editor');
  };

  const editWorkflow = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setView('editor');
  };

  const saveWorkflow = async (workflow: Workflow) => {
    try {
      await chrome.runtime.sendMessage({ 
        type: 'SAVE_WORKFLOW', 
        workflow 
      });
      await loadWorkflows();
      setView('list');
      setCurrentWorkflow(null);
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      await chrome.runtime.sendMessage({ 
        type: 'DELETE_WORKFLOW', 
        workflowId 
      });
      await loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXECUTE_WORKFLOW',
        workflowId,
        variables: {}
      });
      console.log('Workflow execution result:', response);
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '500px' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6', paddingBottom: '15px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#212529' }}>GPTChain</h1>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Automate your ChatGPT workflows</p>
      </div>

      {view === 'list' ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={createNewWorkflow}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span> Create New Workflow
            </button>
          </div>
          
          <WorkflowList
            workflows={workflows}
            onEdit={editWorkflow}
            onDelete={deleteWorkflow}
            onExecute={executeWorkflow}
          />
        </div>
      ) : (
        <WorkflowEditor
          workflow={currentWorkflow}
          onSave={saveWorkflow}
          onCancel={() => {
            setView('list');
            setCurrentWorkflow(null);
          }}
        />
      )}
    </div>
  );
};

export default App;