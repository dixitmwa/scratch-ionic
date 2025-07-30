import React, { useEffect, useRef } from 'react';
import ScratchWorkspace from './ScratchWorkspace';

export default function DroppableWorkspaceWrapper() {
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row', // sidebar + blocks side by side
      }}
    >
      {/* <div style={{ width: '240px', background: '#eee' }}>
      </div> */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ScratchWorkspace />
      </div>
    </div>
  );
}
