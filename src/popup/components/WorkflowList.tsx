import React from 'react';
import { Workflow } from '../../types/workflow';

interface WorkflowListProps {
  workflows: Workflow[];
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void;
  onExecute: (workflowId: string) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onEdit,
  onDelete,
  onExecute
}) => {
  if (workflows.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
        <h3 style={{ margin: '0 0 8px 0' }}>No workflows yet</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Create your first workflow to automate ChatGPT tasks
        </p>
      </div>
    );
  }

  return (
    <div>
      {workflows.map(workflow => (
        <div
          key={workflow.id}
          style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '16px',
              color: '#212529'
            }}>
              {workflow.name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#6c757d'
            }}>
              {workflow.description}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            fontSize: '12px'
          }}>
            <span style={{
              backgroundColor: '#e9ecef',
              color: '#495057',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {workflow.nodes.length} steps
            </span>
            <span style={{
              backgroundColor: '#e9ecef',
              color: '#495057',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              Updated {new Date(workflow.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px'
          }}>
            <button
              onClick={() => onExecute(workflow.id)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Execute
            </button>
            <button
              onClick={() => onEdit(workflow)}
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
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this workflow?')) {
                  onDelete(workflow.id);
                }
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowList;