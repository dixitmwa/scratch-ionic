import React, { useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';
import VM from 'scratch-vm';
import RenderWebGL from 'scratch-render';
import * as Blockly from 'blockly';
import 'blockly/blocks';            // Add default blocks
import 'blockly/javascript';        // Optional, for code generation

const ScratchPlayer: React.FC = () => {
  const canvasRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const [workspace, setWorkspace] = useState<any>(null);

  // Handle file upload
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const zip = await JSZip.loadAsync(file);
    const projectJSON = await zip.file('project.json')?.async('string');
    const project = JSON.parse(projectJSON || '{}');

    const blocks = project.targets?.[0]?.blocks || {};

    // Set up VM and start animation
    const vm = new VM();
    // const renderer = new RenderWebGL(canvasRef.current!);
    // vm.attachRenderer(renderer);
    // const canvas = document.createElement('canvas');
    // document.body.appendChild(canvas); // For testing, put it in the body
    // const renderer = new RenderWebGL(canvas);
    // vm.attachRenderer(renderer);
    // await vm.loadProject(await file.arrayBuffer());
    // await vm.start();
    // vm.greenFlag();

    // Create a Blockly-compatible XML workspace (basic example)
    const xmlText = scratchBlocksToBlocklyXml(blocks);
    if (workspace) Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.textToDom(xmlText), workspace);
  };

  // Convert simplified Scratch JSON blocks to Blockly XML (dummy example)
  const scratchBlocksToBlocklyXml = (blocksJson: any) => {
    // NOTE: This is VERY SIMPLIFIED — in a real case, convert the block JSON properly
    const sampleXml = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="controls_if" x="10" y="20"></block>
      </xml>
    `;
    return sampleXml;
  };

  // Initialize Blockly once on mount
  useEffect(() => {
    const ws = Blockly.inject(blocklyDivRef.current!, {
      readOnly: true,
      scrollbars: true,
    });
    setWorkspace(ws);
  }, []);

  return (
    <div>
      <input type="file" accept=".sb3" onChange={handleFileUpload} />

      <div style={{ display: 'flex', gap: '20px' }}>
        <div
          ref={blocklyDivRef}
          id="blocklyDiv"
          style={{ width: '50%', height: '360px', border: '1px solid #ccc' }}
        />
        <canvas ref={canvasRef} width={480} height={360} />
      </div>
    </div>
  );
};

export default ScratchPlayer;
