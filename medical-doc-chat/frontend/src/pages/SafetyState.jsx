import React from 'react';

const SafetyState = ({ type }) => {
  if (type === 'error') {
    return (
      <div className="safety-state error">
        <h2>Error</h2>
        <p>Something went wrong. Please try again.</p>
      </div>
    );
  }
  if (type === 'empty') {
    return (
      <div className="safety-state empty">
        <h2>No Documents</h2>
        <p>Please select a document to start chatting.</p>
      </div>
    );
  }
  return (
    <div className="safety-state safety">
      <h2>Safety Notice</h2>
      <p>This is a medical document chat. Use with caution.</p>
    </div>
  );
};

export default SafetyState;