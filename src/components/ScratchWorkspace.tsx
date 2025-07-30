import { useEffect, useRef, useState } from 'react';
import ScratchBlocks from 'scratch-blocks'; // or 'blockly'
import './blocks.css'; // Ensure this contains `.blocklyWorkspace`
import { getProjectFile, loadProject, setLastSavedProjectData } from './commonfunction';
import { IonButton, IonNavLink, useIonRouter, useIonViewDidEnter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getVMInstance, saveCurrentProjectBuffer, setUploadedProjectBuffer } from '../scratchVMInstance';
import { Box, Button } from '@mui/material';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Preferences } from '@capacitor/preferences';

export default function ScratchWorkspace() {
  const blockRef = useRef(null);
  const workspaceRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useIonRouter();
  const vmRef = useRef<any>(getVMInstance());
  const [fileUploaded, setFileUploaded] = useState(false);

  const lockOrientation = async () => {
    try {
      await ScreenOrientation.lock({ orientation: 'portrait-primary' });
    } catch (error) {
      console.error('Error locking orientation:', error);
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setReady(true);
          observer.disconnect();
        }
      }
    });
    lockOrientation()
    // workspaceRef?.current?.addChangeListener(handleEvent);

    if (blockRef.current) observer.observe(blockRef.current);
    return () => {
      observer.disconnect();
      // workspaceRef?.current?.removeChangeListener(handleEvent);
    };
  }, []);

  const handleBlockChange = async (e: any) => {
    const vm = vmRef.current;
    const ws = workspaceRef.current;

    if (!vm || !vm.editingTarget || !ws) return;

    try {
      vm.editingTarget.blocks.blocklyListen(e);
    } catch (err) {
      console.error("❌ Error syncing blocks to VM", err);
    }
  };

  const handleUpload = async () => {
    // const projectUrl = localStorage.getItem("project");
    // const projectUrl = await getProjectFile()
    const { value } = await Preferences.get({ key: 'project' })
    console.log("value->", value)
    const projectUrl = value;
    // const projectUrl: any = "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping";
    if (!projectUrl) throw new Error("No file and no project URL in localStorage");

    debugger
    try {
      const response = await fetch(projectUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
      console.log("response--->", response)
      if (!response.ok) throw new Error("Failed to fetch project from URL");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      // const file = e.target.files[0]; ,
      // const buffer = new Uint8Array(await file.arrayBuffer());
      setFileUploaded(true)
      await loadProject(vmRef.current, buffer);
      setUploadedProjectBuffer(buffer)
    } catch (error) {
      setFileUploaded(false)
      console.error('Error loading project:', error);
    }
  };


  useIonViewDidEnter(() => {
    debugger
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setReady(true);
          observer.disconnect();
        }
      }
    });
    handleUpload()
    lockOrientation()

    workspaceRef?.current?.addChangeListener(handleBlockChange);
    const blockCanvas = document.querySelector('.blocklyBlockCanvas');
    if (blockCanvas) blockCanvas.setAttribute('transform', 'translate(0,0) scale(1)');


    if (blockRef.current) observer.observe(blockRef.current);
    return () => {
      observer.disconnect();
      // workspaceRef?.current?.removeChangeListener(handleEvent);
      workspaceRef?.current?.removeChangeListener(handleBlockChange);
    }
  })

  useEffect(() => {
    if (!ready || !blockRef.current) return;

    workspaceRef.current = ScratchBlocks.inject(blockRef.current, {
      // toolbox: TOOLBOX_XML,
      toolbox: null,
      media: 'https://unpkg.com/scratch-blocks/media/',
      // renderer: 'zelos',
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.8,
        maxScale: 1.5,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true
      },
      renderer: 'zelos',
    });

    ScratchBlocks.svgResize(workspaceRef.current);

    const onResize = () => ScratchBlocks.svgResize(workspaceRef.current);
    window.addEventListener('resize', onResize);

    if (canvasRef.current) {
      attachRendererIfNone(canvasRef.current);
    }

    workspaceRef.current.addChangeListener(handleBlockChange);

    const handleProjectLoaded = () => {
      updateBlocksWorkspace();
      if (workspaceRef.current) {
        setTimeout(() => {
          const ws = workspaceRef.current;
          if (ws) {
            ws.setScale(1);
            ws.resize();

            ws.scrollCenter();

            if (ws.updateScreenCalculations) {
              ws.updateScreenCalculations();
            }

            if (ws.dragSurface_ && ws.dragSurface_.updateTransform) {
              ws.dragSurface_.updateTransform();
            }
          }
        }, 100);
      }
    };

    vmRef.current.on('PROJECT_LOADED', () => {
      console.log('Project loaded, updating workspace blocks');
      handleProjectLoaded();
    });

    vmRef.current.on('TARGETS_UPDATE', () => {
      console.log('Targets updated, refreshing blocks');
      handleProjectLoaded();
    });

    vmRef.current.on('BLOCKSINFO_UPDATE', () => {
      console.log('Blocks info updated, refreshing blocks');
      handleProjectLoaded();
    });

    vmRef.current.on('workspaceUpdate', () => {
      console.log('Workspace updated, refreshing blocks');
      handleProjectLoaded();
    });

    const blockCanvas = document.querySelector('.blocklyBlockCanvas');
    if (blockCanvas) blockCanvas.setAttribute('transform', 'translate(0,0) scale(1)');

    // handleUpload();

    return () => {
      saveCurrentProjectBuffer()
      workspaceRef.current?.dispose();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      vmRef.current.runtime.off('BLOCK_DRAG_END', handleBlockChange);
      vmRef.current.runtime.off('SCRIPT_GLOW_ON', handleBlockChange);
      vmRef.current.runtime.off('VISUAL_REPORT', handleBlockChange);
      disposeRenderer()
    };
  }, [ready]);

  useIonViewDidEnter(() => {
    setTimeout(() => {
      updateBlocksWorkspace();
    }, 50);
  });

  const updateBlocksWorkspace = async () => {
    const vm = vmRef.current;
    const ws = workspaceRef.current;
    const editingTarget = vm && vm.editingTarget;

    if (!ws || !editingTarget) return;

    try {
      const xmlDom = ScratchBlocks.Xml.workspaceToDom(ws);
      const xmlString = ScratchBlocks.Xml.domToText(xmlDom);
      console.log("Updated XML from workspace:", xmlString);

      if (xmlString.length > 80) {

        const blob = await vm.saveProjectSb3();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));

        localStorage.setItem('lastSavedProject', base64);
        setLastSavedProjectData(base64);
        setUploadedProjectBuffer(uint8Array);

        console.log("VM updated with latest blocks");
      } else {
        let vmXmlString = editingTarget.blocks.toXML();
        if (!vmXmlString.trim().startsWith('<xml')) {
          vmXmlString = `<xml>${vmXmlString}</xml>`;
        }

        const dom = ScratchBlocks.Xml.textToDom(vmXmlString);
        ws.clear();
        ScratchBlocks.Xml.domToWorkspace(dom, ws);
        ScratchBlocks.svgResize(ws);
      }
    } catch (error) {
      console.error("Error updating blocks workspace:", error);
    }
  };

  const navigateToPlaygorund = async () => {
    try {
      await saveCurrentProjectBuffer();

      const latestBuffer = await getProjectBuffer();
      if (!latestBuffer) {
        alert("Could not retrieve latest project buffer.");
        return;
      }

      const uint8Buffer = new Uint8Array(latestBuffer);

      setUploadedProjectBuffer(uint8Buffer);

      const blob = await vmRef.current.saveProjectSb3();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const base64 = btoa(String.fromCharCode(...uint8Array));
      localStorage.setItem('lastSavedProject', base64);
      setLastSavedProjectData(base64);

      router.push('/playground', 'none');
    } catch (e) {
      console.error("Failed to navigate to playground:", e);
      alert("Failed to prepare project for navigation.");
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        {/* <Button variant='contained' onClick={() => fileInputRef.current?.click()}>Upload File</Button> */}
        {/* <Button variant='contained' disabled={!fileUploaded} onClick={navigateToPlaygorund}>Play</Button> */}
        {/* <Button variant='contained' disabled={!fileUploaded} onClick={navigateToPlaygorund}>Play</Button> */}
        <IonButton
          expand="block"
          disabled={!fileUploaded}
          onClick={navigateToPlaygorund}
        >
          Play
        </IonButton>
        {/* <IonNavLink routerDirection="forward" component={() => <PlaygroundPage />}>
          <IonButton onClick={navigateToPlaygorund}>Play</IonButton>
        </IonNavLink> */}
      </Box >
      <div
        ref={blockRef}
        style={{
          position: 'relative',
          height: '90vh',
          width: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          touchAction: 'none',
          WebkitOverflowScrolling: 'touch',
        }
        }
      />
    </>
  );
}