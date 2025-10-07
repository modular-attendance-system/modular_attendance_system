import React from 'react';

const SessionDecoderPanel = ({ sessionData, apiClient, onComplete }) => {
  return (
    <div style={{ padding: '2rem', border: '2px solid red', background: '#222', color: 'white' }}>
      <h2>-- Remote Session Decoder Panel --</h2>
      <p>I am a separate React application loaded dynamically!</p>
      <p>Session Name: {sessionData.name}</p>
      <button onClick={onComplete}>Close Panel</button>
    </div>
  );
};

export default SessionDecoderPanel;