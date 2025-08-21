import { useEffect, useRef, useState } from 'react';
import ScratchBlocks from 'scratch-blocks'; // or 'blockly'
import './blocks.css'; // Ensure this file contains relevant styles, e.g. `.blocklyWorkspace`
import { getProjectFile, loadProject, setLastSavedProjectData } from './commonfunction';
import { IonButton, IonIcon, IonPage, useIonRouter, useIonViewDidEnter } from '@ionic/react';
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getVMInstance, saveCurrentProjectBuffer, setUploadedProjectBuffer } from '../scratchVMInstance';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Preferences } from '@capacitor/preferences';
import CommonCard from './common-component/Card';
import CustomButton from './common-component/Button';
import { chevronForwardOutline, reloadOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';

export default function ScratchWorkspace() {
  const blockRef = useRef(null);
  const workspaceRef = useRef(null);
  const canvasRef = useRef(null);
  const vmRef = useRef(null);
  const router = useIonRouter();
  const history = useHistory()
  const [ready, setReady] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);

  const lockOrientation = async () => {
    try {
      await ScreenOrientation.lock({ orientation: 'portrait-primary' });
    } catch (error) {
      console.error('Error locking orientation:', error);
    }
  };

  useEffect(() => {
    vmRef.current = getVMInstance();
  }, []);

  useEffect(() => {
    if (!blockRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setReady(true);
          observer.disconnect();
        }
      }
    });

    lockOrientation();
    handleUpload()

    observer.observe(blockRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ready || !blockRef.current) return;

    workspaceRef.current = ScratchBlocks.inject(blockRef.current, {
      toolbox: null,
      media: 'https://unpkg.com/scratch-blocks/media/',
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

    const handleBlockChange = (e) => {
      const vm = vmRef.current;
      const ws = workspaceRef.current;
      if (!vm || !vm.editingTarget || !ws) return;
      try {
        vm.editingTarget.blocks.blocklyListen(e);
      } catch (err) {
        console.error("❌ Error syncing blocks to VM", err);
      }
    };

    workspaceRef.current.addChangeListener(handleBlockChange);

    const handleProjectLoaded = () => {
      const spriteTargets = vmRef.current?.runtime?.targets.filter(t => t.isSprite);
      if (!selectedSpriteId) {
        vmRef.current?.setEditingTarget(spriteTargets[1].id);
        updateBlocksForSprite(spriteTargets[1].id);
      }
      else {
        updateBlocksForSprite(selectedSpriteId);
      }
      setTimeout(() => {
        const ws: any = workspaceRef.current;
        if (!ws) return;

        ws.setScale(0.9);
        ws.resize();

        const { viewLeft: offsetX, viewTop: offsetY } = ws.getMetrics();

        ws.scrollX -= offsetX;
        ws.scrollY -= offsetY;

        if (ws.updateScreenCalculations) {
          ws.updateScreenCalculations();
        }
        ScratchBlocks.svgResize(ws);
        ws.resize();
        if (ws.dragSurface_ && ws.dragSurface_.updateTransform) {
          ws.dragSurface_.updateTransform();
        }
      }, 500);
      // setTimeout(() => {
      //   const ws = workspaceRef.current;
      //   if (!ws) return;

      //   ws.setScale(1);
      //   ws.resize();

      //   const { viewLeft: offsetX, viewTop: offsetY } = ws.getMetrics();

      //   ws.scrollX -= offsetX;
      //   ws.scrollY -= offsetY;

      //   if (ws.updateScreenCalculations) {
      //     ws.updateScreenCalculations();
      //   }
      //   ScratchBlocks.svgResize(ws);
      //   ws.resize();
      //   if (ws.dragSurface_ && ws.dragSurface_.updateTransform) {
      //     ws.dragSurface_.updateTransform();
      //   }
      // }, 100);
    };

    const vm: any = vmRef.current;

    vm?.on('PROJECT_LOADED', () => {
      console.log('Project loaded, updating workspace blocks');
      handleProjectLoaded();
    });

    vm?.on('TARGETS_UPDATE', () => {
      console.log('Targets updated, refreshing blocks');
      handleProjectLoaded();
    });

    vm?.on('BLOCKSINFO_UPDATE', () => {
      console.log('Blocks info updated, refreshing blocks');
      handleProjectLoaded();
    });

    vm?.on('workspaceUpdate', () => {
      console.log('Workspace updated, refreshing blocks');
      handleProjectLoaded();
    });

    vm?.on('targetsUpdate', () => {
      if (fileUploaded && selectedSpriteId) {
        console.log('Targets updated, refreshing blocks');
        handleProjectLoaded();
      }
    });

    const blockCanvas = document.querySelector('.blocklyBlockCanvas');
    if (blockCanvas) blockCanvas.setAttribute('transform', 'translate(0,0) scale(1)');

    return () => {
      window.removeEventListener('resize', onResize);
      workspaceRef.current?.dispose();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      vm?.runtime?.off('PROJECT_LOADED', handleProjectLoaded);
      vm?.runtime?.off('TARGETS_UPDATE', handleProjectLoaded);
      vm?.runtime?.off('BLOCKSINFO_UPDATE', handleProjectLoaded);
      vm?.runtime?.off('workspaceUpdate', handleProjectLoaded);
      vm?.runtime?.off('targetsUpdate', handleProjectLoaded);
      disposeRenderer();
    };
  }, [ready]);

  const updateBlocksForSprite = (spriteId: any) => {
    const ws = workspaceRef.current;
    const target = vmRef.current?.runtime?.targets.find(t => t.id === spriteId);
    if (!ws || !target) return;

    let xmlString = target.blocks.toXML();
    if (!xmlString.trim().startsWith('<xml')) {
      xmlString = `<xml>${xmlString}</xml>`;
    }
    try {
      ws.clear();
      const dom = ScratchBlocks.Xml.textToDom(xmlString);
      ScratchBlocks.Xml.domToWorkspace(dom, ws);
      ScratchBlocks.svgResize(ws);
      ws.resize();
      setSelectedSpriteId(spriteId);
    } catch (e) {
      console.error('Failed to set blocks for sprite', e);
    }
  };

  const handleSpriteClick = (spriteId: any) => {
    if (selectedSpriteId) {
      saveBlocksToVM(selectedSpriteId);
    }
    setSelectedSpriteId(spriteId);
    vmRef.current?.setEditingTarget(spriteId);
    // handleProjectLoaded()
    // updateBlocksForSprite(spriteId);
    const onTargetsUpdate = () => {
      updateBlocksForSprite(spriteId);
      vmRef.current?.runtime?.off('targetsUpdate', onTargetsUpdate);
    };

    vmRef.current?.runtime?.on('targetsUpdate', onTargetsUpdate);

    setTimeout(() => {
      updateBlocksForSprite(spriteId);
    }, 100);
  };

  // function uint8ArrayToBase64Storage(u8Arr: any) {
  //   return btoa(String.fromCharCode(...u8Arr));
  // }

  function uint8ArrayToBase64Storage(u8Arr: Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([u8Arr]);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string; // e.g. "data:application/octet-stream;base64,..."
        const base64 = dataUrl.split(',')[1]; // get only base64 part
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const handleUpload = async () => {
    const { value: isBackFromPlayground } = await Preferences.get({ key: 'isBackFromPlayground' })
    if (isBackFromPlayground == 'true') {
      try {
        await Preferences.set({ key: 'isBackFromPlayground', value: 'false' });
        const { value: base64 } = await Preferences.get({ key: "buffer_base64" });
        const buffer = base64ToUint8Array(base64);
        setFileUploaded(true)
        await loadProject(vmRef.current, buffer);
        setUploadedProjectBuffer(buffer)
      } catch (error) {
        setFileUploaded(false)
        console.error('Error loading project:', error);
      }
    } else {
      const { value } = await Preferences.get({ key: 'project' })
      console.log("value->", value);
      // const projectUrl = value;
      const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping";
      if (!projectUrl) throw new Error("No file and no project URL in localStorage");

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
        const base64 = uint8ArrayToBase64(buffer);
        // await Preferences.set({ key: "buffer_base64", value: base64 });
        // const file = e.target.files[0];
        // const buffer = new Uint8Array(await file.arrayBuffer());
        setFileUploaded(true)
        await loadProject(vmRef.current, buffer);
        setUploadedProjectBuffer(buffer)
      } catch (error) {
        setFileUploaded(false)
        console.error('Error loading project:', error);
      }
    }
  };

  function uint8ArrayToBase64(uint8Array) {
    let binary = '';
    const chunkSize = 0x8000; // 32KB per chunk
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        uint8Array.subarray(i, i + chunkSize)
      );
    }
    return btoa(binary);
  }

  const navigateToPlaygorund = async () => {
    try {
      console.log("1---")
      await saveCurrentProjectBuffer();
      console.log("1")
      const latestBuffer = await getProjectBuffer();
      if (!latestBuffer) {
        alert("Could not retrieve latest project buffer.");
        return;
      }
      console.log("2")

      const uint8Buffer = new Uint8Array(latestBuffer);
      console.log("3")

      setUploadedProjectBuffer(uint8Buffer);
      console.log("4")

      const blob = await vmRef.current.saveProjectSb3();
      console.log("5")

      const arrayBuffer = await blob.arrayBuffer();
      console.log("6")
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log("7")
      const base64 = await uint8ArrayToBase64Storage(uint8Array);
      console.log("8")
      await Preferences.set({ key: "buffer_base64", value: base64 });
      console.log("9")
      localStorage.setItem('lastSavedProject', base64);
      console.log("10")
      setLastSavedProjectData(base64);
      console.log("11")

      history.push('/tabs/playground');
    } catch (e) {
      console.error("Failed to navigate to playground:", e);
      alert("Failed to prepare project for navigation.");
    }
  };

  const backToScan = () => {
    history.push('/tabs/editor')
  }

  const getImageFromAsset = (asset: any) => {
    const base64String = btoa(
      new Uint8Array(asset.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const mimeType = asset.dataFormat === 'svg' ? 'image/svg+xml' :
      asset.dataFormat === 'png' ? 'image/png' :
        asset.dataFormat === 'jpg' ? 'image/jpeg' :
          'application/octet-stream';

    return `data:${mimeType};base64,${base64String}`;
  };

  function saveBlocksToVM(spriteId) {
    debugger
    const ws = workspaceRef.current;
    const target = vmRef.current?.runtime?.targets.find(t => t.id === spriteId);
    if (!ws || !target) return;
    try {
      // Export workspace to XML
      const xml = ScratchBlocks.Xml.workspaceToDom(ws);
      // Update VM's block XML for the target
      target.blocks.fromXML(ScratchBlocks.Xml.domToText(xml));
    } catch (e) {
      console.error('Error saving workspace blocks to VM', e);
    }
  }

  useIonViewDidEnter(() => {
    lockOrientation();
    handleUpload();
  })

  console.log("selectedSpriteId", selectedSpriteId);

  return (
    // <IonPage>
    <div style={{
      margin: "30px 10px 10px 10px",
      height: "94vh",
      overflowY: "scroll"
    }}>
      <CommonCard style={{ padding: "20px", maxWidth: "100%", minWidth: "340px" }}>
        <div
          ref={blockRef}
          style={{
            position: 'relative',
            height: '70vh',
            width: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            touchAction: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "4px" }}>
          <CustomButton btnText='' icon={<IonIcon icon={reloadOutline} style={{ fontSize: '32px' }} />} onClick={() => backToScan()} background="#FF8429" txtColor="white" style={{ width: "60px", padding: "5px" }} />
          <CustomButton btnText='' icon={<IonIcon icon={chevronForwardOutline} style={{ fontSize: '32px' }} />} onClick={() => navigateToPlaygorund()} background="#FBD213" txtColor="white" style={{ width: "60px", padding: "5px" }} />
        </div>
      </CommonCard>

      {/* <div className="canvas-container">
        <canvas ref={canvasRef} className="playground-canvas" />
      </div> */}

      {
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          justifyContent: 'center',
          gap: 8,
          marginTop: "8px"
        }}>
          {vmRef.current?.runtime?.targets
            .filter(t => t.isSprite || t.isStage)
            .map(sprite => {
              const costume = sprite.getCurrentCostume();
              const asset = costume?.asset;
              const imageUrl = asset ? getImageFromAsset(asset) : null;

              return (
                <div onClick={() => handleSpriteClick(sprite.id)}>
                  <CommonCard key={sprite.id} style={{ padding: 5 }} bottomText={sprite.getName()} border={sprite.id === selectedSpriteId ? true : false}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      {imageUrl && (
                        <img src={imageUrl} alt={sprite.getName()} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                      )}
                    </div>
                  </CommonCard>
                </div>
              );
            })}

        </div>
      }
    </div>
    // </IonPage>
  );
}
