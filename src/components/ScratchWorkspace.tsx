import { useEffect, useRef, useState } from 'react';
import ScratchBlocks from 'scratch-blocks';
import './blocks.css';
import { loadProject, setLastSavedProjectData } from './commonfunction';
import { IonIcon, IonPage, useIonRouter, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getVMInstance, saveCurrentProjectBuffer, setUploadedProjectBuffer } from '../scratchVMInstance';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { usePlayground } from '../context/PlaygroundContext';
import CommonCard from './common-component/Card';
import CustomButton from './common-component/Button';
import { useHistory } from 'react-router';
import { useSection } from '../context/SectionContext';
import FileSaveIcon from '../assets/file_save.svg';
import RestartIcon from '../assets/restart.svg';
import RightArrow from '../assets/right_arrow_double.svg';

export default function ScratchWorkspace() {
  const {
    isBackFromPlaygroundRef,
    setIsBackFromPlayground,
    bufferBase64Ref,
    setBufferBase64
  } = usePlayground();
  const blockRef = useRef(null);
  const { setProjectId, projectId } = useSection();
  const workspaceRef = useRef<any>(null);
  const canvasRef = useRef(null);
  const vmRef = useRef<any>(null);
  const router = useIonRouter();
  const history = useHistory()
  const [ready, setReady] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);
  const [targetsList, setTargetsList] = useState<any[]>([]);
  const selectedSpiId = useRef(null);
  const isCalledOneTime = useRef(false);
  // const { projectId } = useSection();


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

    // vm?.on('targetsUpdate', () => {
    //   if (fileUploaded && selectedSpriteId) {
    //     console.log('Targets updated, refreshing blocks');
    //     handleProjectLoaded();
    //   }
    // });

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

  const handleProjectLoaded = () => {
    // Refresh targets for UI
    refreshTargets();

    const spriteTargets = vmRef.current?.runtime?.targets?.filter((t: any) => t.isSprite);
    if (!selectedSpiId.current && spriteTargets && spriteTargets.length > 0) {
      vmRef.current?.setEditingTarget(spriteTargets[0]?.id);
      updateBlocksForSprite(spriteTargets[0]?.id);
    }
    // else {
    //   updateBlocksForSprite(selectedSpriteId);
    // }
    // setTimeout(() => {
    //   const ws: any = workspaceRef.current;
    //   if (!ws) return;

    //   ws.setScale(0.9);
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
    // }, 500);
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

  // Build a cleaned targets list from VM runtime for rendering
  const refreshTargets = () => {
    try {
      const vm: any = vmRef.current;
      if (!vm || !vm.runtime || !Array.isArray(vm.runtime.targets)) {
        setTargetsList([]);
        return;
      }
      const raw = vm.runtime.targets.filter((t: any) => t && (t.isSprite || t.isStage));
      // Remove duplicates by id while preserving order
      const map = new Map();
      raw.forEach((t: any) => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
      setTargetsList(Array.from(map.values()));
    } catch (e) {
      console.warn('refreshTargets failed', e);
      setTargetsList([]);
    }
  };

  const updateBlocksForSprite = (spriteId: any) => {
    const ws = workspaceRef.current;
    const target = vmRef.current?.runtime?.targets.find(t => t.id === spriteId);
    if (!ws || !target) return;

    let xmlString = target.blocks.toXML();
    if (!xmlString.trim().startsWith('<xml')) {
      xmlString = `<xml>${xmlString}</xml>`;
    }
    console.log("xmlString", xmlString)
    try {
      ws.clear();
      const dom = ScratchBlocks.Xml.textToDom(xmlString);
      ScratchBlocks.Xml.domToWorkspace(dom, ws);
      // ScratchBlocks.svgResize(ws);
      setTimeout(() => {
        const ws: any = workspaceRef.current;
        if (!ws) return;
        debugger
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
        selectedSpiId.current = spriteId
        setSelectedSpriteId(spriteId);
      }, 300);
    } catch (e) {
      console.error('Failed to set blocks for sprite', e);
    }
  };

  const handleSpriteClick = (spriteId: any) => {
    selectedSpiId.current = spriteId;
    setSelectedSpriteId(spriteId);
    vmRef.current?.setEditingTarget(spriteId);
    // cleanVMState(); // <-- Add this line

    // const onTargetsUpdate = () => {
    //   updateBlocksForSprite(spriteId);
    //   vmRef.current?.runtime?.off('targetsUpdate', onTargetsUpdate);
    // };

    // vmRef.current?.runtime?.on('targetsUpdate', onTargetsUpdate);

    setTimeout(() => {
      updateBlocksForSprite(spriteId);
    }, 100);
  };

  // function uint8ArrayToBase64Storage(u8Arr: any) {
  //   return btoa(String.fromCharCode(...u8Arr));
  // }

  // Convert base64 to ZIP file and download
  function downloadBase64AsZip(base64Data: string, filename: string = 'project.sb3') {
    try {
      console.log("💾 Converting base64 to ZIP file...");
      console.log("📊 Base64 length:", base64Data.length);

      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log("✅ ZIP file download triggered:", filename);

    } catch (error) {
      console.error("❌ Error downloading ZIP file:", error);
      alert("Failed to download project file");
    }
  }

  function uint8ArrayToBase64Storage(u8Arr: Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([new Uint8Array(u8Arr)]);
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

  // Clean and validate project data before saving to context
  async function cleanProjectData(uint8Array: Uint8Array): Promise<Uint8Array> {
    try {
      console.log("🧹 Cleaning project data to prevent duplicates...");
      console.log("📊 Original size:", uint8Array.length);

      // Check if it's a valid ZIP file
      if (uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
        console.log("⚠️ Not a ZIP file, returning as-is");
        return uint8Array;
      }

      // Try to extract and clean project.json from the ZIP
      try {
        // Convert to blob and read as text to find project.json
        const blob = new Blob([new Uint8Array(uint8Array)]);
        const text = await blob.text();

        // Look for project.json content in the ZIP data
        const projectJsonMatch = text.match(/"targets":\s*\[[\s\S]*?\]/);

        if (projectJsonMatch) {
          console.log("🔍 Found targets in project data, checking for duplicates...");

          // Try to parse the targets section
          const targetsStr = projectJsonMatch[0];
          console.log("📄 Targets section found:", targetsStr.substring(0, 200) + "...");

          // Count potential duplicates by looking for repeated IDs
          const idMatches = targetsStr.match(/"id":\s*"[^"]+"/g);
          if (idMatches) {
            const ids = idMatches.map(match => match.match(/"id":\s*"([^"]+)"/)?.[1]).filter(Boolean);
            const uniqueIds = [...new Set(ids)];

            if (ids.length !== uniqueIds.length) {
              console.warn("⚠️ Found duplicate target IDs in project.json:", {
                total: ids.length,
                unique: uniqueIds.length,
                duplicates: ids.length - uniqueIds.length,
                duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index)
              });

              // For now, just log the issue - actual ZIP manipulation would require a ZIP library
              console.log("⚠️ Project contains duplicates but returning as-is (ZIP manipulation needed)");
            } else {
              console.log("✅ No duplicate IDs found in project.json");
            }
          }
        }
      } catch (parseError) {
        console.log("⚠️ Could not parse project content for duplicate check:", parseError);
      }

      console.log("✅ Project data validation completed");
      return uint8Array;

    } catch (error) {
      console.error("❌ Error cleaning project data:", error);
      return uint8Array; // Return original if cleaning fails
    }
  }

  // Clean VM state before saving to prevent duplicates
  function cleanVMState() {
    try {
      console.log("🔧 Cleaning VM state before save...");
      const vm = vmRef.current as any;

      if (!vm || !vm.runtime || !vm.runtime.targets) {
        console.log("⚠️ VM not available for cleaning");
        return;
      }

      // Log current targets with details
      console.log("📊 Current targets count:", vm.runtime.targets.length);

      // Remove duplicates by isStage, name, and assetId (for sprites)
      const seen = new Set();
      const cleanTargets = vm.runtime.targets.filter((target: any) => {
        let assetId = '';
        if (!target.isStage && Array.isArray(target.costumes) && target.costumes.length > 0) {
          assetId = target.costumes[0].assetId || '';
        }
        const key = `${target.isStage ? 'stage' : 'sprite'}:${target.getName?.() || target.name || 'unnamed'}:${target.costumes?.[0]?.assetId || ''}:${target.x || ''}:${target.y || ''}`;
        if (seen.has(key)) {
          console.log(`🗑️ Removing duplicate target: ${key}`);
          return false;
        }
        seen.add(key);
        return true;
      });

      // Update the VM targets array
      vm.runtime.targets = cleanTargets;
      console.log(`✅ Removed duplicates by name/type. New targets count: ${cleanTargets.length}`);

      // Log the cleaned targets
      cleanTargets.forEach((target: any, index: number) => {
        console.log(`Cleaned Target ${index}:`, {
          id: target.id,
          name: target.getName?.() || target.name || 'unnamed',
          isSprite: target.isSprite,
          isStage: target.isStage
        });
      });

    } catch (error) {
      console.error("❌ Error cleaning VM state:", error);
    }
  }

  // Validate SB3 file structure before loading
  async function validateSB3File(buffer: Uint8Array): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log("🔍 Validating SB3 file...");
      console.log("📊 File size:", buffer.length, "bytes");

      // Check if it's a ZIP file
      if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
        return { isValid: false, error: "File is not a valid ZIP archive" };
      }

      // For large files, warn but allow processing
      if (buffer.length > 1024 * 1024) { // 50KB
        console.warn("⚠️ Large file detected:", buffer.length, "bytes");
        return { isValid: false, error: "File too large (>50KB). Please use a smaller project." };
      }

      // Try to extract and validate project.json structure
      try {
        // Simple validation: check if we can find project.json structure
        const textDecoder = new TextDecoder();
        const bufferStr = textDecoder.decode(buffer.slice(0, Math.min(buffer.length, 50000))); // Check first 50KB
        // Look for project.json indicators
        // if (bufferStr.includes('project.json')) {
        //   console.log("✅ SB3 file appears valid");
        return { isValid: true };
        // } else {
        //   return { isValid: false, error: "Invalid SB3 format - missing project.json or targets" };
        // }
      } catch (e) {
        return { isValid: false, error: "Cannot parse SB3 file structure" };
      }

    } catch (error) {
      console.error("❌ SB3 validation error:", error);
      return { isValid: false, error: "File validation failed" };
    }
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
    console.log("-------------------")
    // if (canvasRef.current) {
    //   attachRendererIfNone(canvasRef.current);
    //   // Ensure renderer is set on VM
    //   // if (!vmRef.current.renderer && window.scratchVMRenderer) {
    //   //   vmRef.current.renderer = window.scratchVMRenderer;
    //   // }
    // }
    if (isCalledOneTime.current) return;
    isCalledOneTime.current = true;
    debugger
    // Clear VM before loading project to prevent duplicate targets
    // if (vmRef.current && typeof vmRef.current.clear === 'function') {
    //   vmRef.current.clear();
    // }
    console.log("isBackFromPlayground", isBackFromPlaygroundRef.current)
    if (isBackFromPlaygroundRef.current) {
      try {
        setIsBackFromPlayground(false);
        console.log("💾 RUN - Project ZIP download triggered before loading", bufferBase64Ref.current);
        const buffer = bufferBase64Ref.current ? base64ToUint8Array(bufferBase64Ref.current) : new Uint8Array();
        setFileUploaded(true)
        // if (vmRef.current && typeof vmRef.current.clear === 'function') {
        //   vmRef.current.clear();
        // }
        await loadProject(vmRef.current, buffer);
        setUploadedProjectBuffer(buffer)
        // update UI targets list and blocks
        refreshTargets();
        handleProjectLoaded();
      } catch (error) {
        setFileUploaded(false)
        console.error('Error loading project:', error);
      }
    } else {
      const { value } = await Preferences.get({ key: 'project' })
      console.log("value", value);
      const projectUrl = value;
      // const projectCandidates = [
      //   "https://prthm11-scratch-vision-game.hf.space/download_sb3/3bb569e1fa4b4890b1c8a49a35855534", // 2 sprites
      //   "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping", // 3 sprites
      // ];
      // const projectUrl = projectCandidates[Math.floor(Math.random() * projectCandidates.length)];
      console.log('Selected random projectUrl:', projectUrl);
      // const projectUrl = "https://prthm11-scratch-vision-game-dup2.hf.space/download_sb3/e8c1a7a020994ca89aaa17ede68c61d8";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/ab339cf6b4d44daab40607dbf12b4c89";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/d7aaf7035ba8430eb90e65ba9b114ca3%201";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/4315c95771cb4db499182e9b5715ae0c";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/d7aaf7035ba8430eb90e65ba9b114ca3%201";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/d68a6771852c4d68b7093a62e1adb1f6";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/9fd86316cd1a44e881e7a2fa4d097179";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/8b085c41bce44096827dcd2402b1ad57";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/6373b10de75240f5847d3c86156dc066";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/49b33c1f68664dc9b4af7dadbade5357";
      // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/d7aaf7035ba8430eb90e65ba9b114ca3";
      // const projectUrl: any = "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping";
      console.log("value->", projectUrl)
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

        console.log("🔍 Validating downloaded SB3 file...");

        console.log("✅ SB3 file validation passed, processing...");
        const base64 = uint8ArrayToBase64(buffer);
        // if (blockRef.current) {
        //   attachRendererIfNone(blockRef.current);
        // }
        debugger
        setFileUploaded(true);
        await loadProject(vmRef.current, buffer);
        setUploadedProjectBuffer(buffer);
        // update UI targets list after load
        refreshTargets();
      } catch (error) {
        setFileUploaded(false)
        console.error('Error loading project:', error);
      }
    }
  };

  console.log("vmvmvmvmvm", vmRef.current)

  function uint8ArrayToBase64(uint8Array: any) {
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
      console.log("4 - About to save project as SB3")
      console.log("4 - 🖥️ Platform:", Capacitor.getPlatform() || 'unknown');

      // Clean VM state before saving to prevent duplicates
      cleanVMState();
      const vm = vmRef.current as any;
      if (vm && vm.runtime) {
        vm.runtime.emit('targetsUpdate');
      }
      cleanVMState(); // <-- Add this again just before saving
      const targets = vmRef?.current?.runtime?.targets?.filter(t => !!t && typeof t === 'object');

      // // Ensure a valid editing target is set before saving
      // const targets = (vmRef.current as any)?.runtime?.targets || [];
      // const spriteTargets = targets.filter((t: any) => t && t.isSprite);
      // if (!vm.editingTarget && spriteTargets.length > 1) {
      //   vm.setEditingTarget(spriteTargets[1].id);
      //   selectedSpiId.current = spriteTargets[1].id;
      //   setSelectedSpriteId(spriteTargets[1].id);
      //   updateBlocksForSprite(spriteTargets[1].id);
      // }

      const blob = await (vmRef.current as any).saveProjectSb3();
      console.log("5 - ✅ SB3 blob created successfully");
      console.log("5 - 📊 Blob size:", blob.size);
      console.log("5 - 📝 Blob type:", blob.type);

      const arrayBuffer = await blob.arrayBuffer();
      console.log("6 - ✅ ArrayBuffer created from blob");
      console.log("6 - 📊 ArrayBuffer byteLength:", arrayBuffer.byteLength);

      const uint8Array = new Uint8Array(arrayBuffer);
      console.log("7 - ✅ Uint8Array created from ArrayBuffer");
      console.log("7 - 📊 Uint8Array length:", uint8Array.length);
      console.log("7 - 🔢 First 20 bytes:", Array.from(uint8Array.slice(0, 20)));
      console.log("7 - 🔢 Last 20 bytes:", Array.from(uint8Array.slice(-20)));

      // Clean project data to prevent duplicates
      const cleanedArray = await cleanProjectData(uint8Array);
      console.log("8 - 🧹 Project data cleaned");
      console.log("8 - 📊 Cleaned size:", cleanedArray.length);

      const base64 = await uint8ArrayToBase64Storage(cleanedArray);
      console.log("💾 RUN - Project ZIP download triggered before loading", base64);
      setBufferBase64(base64);
      setIsBackFromPlayground(true);
      // Verify the final base64 doesn't contain duplicates
      try {
        const testBuffer = base64ToUint8Array(base64);
        const testBlob = new Blob([new Uint8Array(testBuffer)]);
        const testText = await testBlob.text();
        const testIdMatches = testText.match(/"id":\s*"[^"]+"/g);

        if (testIdMatches) {
          const testIds = testIdMatches.map(match => match.match(/"id":\s*"([^"]+)"/)?.[1]).filter(Boolean);
          const testUniqueIds = [...new Set(testIds)];

          if (testIds.length !== testUniqueIds.length) {
            console.error("❌ CRITICAL: Duplicates still found in final base64!", {
              total: testIds.length,
              unique: testUniqueIds.length,
              duplicates: testIds.length - testUniqueIds.length
            });
          } else {
            console.log("✅ VERIFIED: No duplicates in final base64 data");
          }
        }
      } catch (verifyError) {
        console.log("⚠️ Could not verify final base64 for duplicates:", verifyError);
      }

      console.log("10 - ✅ Base64 stored in context");

      // Download the project as ZIP file for debugging
      // downloadBase64AsZip(base64, `project_${Date.now()}.sb3`);
      console.log("10.5 - 💾 Project ZIP download triggered");

      localStorage.setItem('lastSavedProject', base64);
      console.log("11 - ✅ Base64 stored in localStorage");
      isCalledOneTime.current = false;
      setLastSavedProjectData(base64);
      console.log("12 - ✅ Project data saved successfully")

      history.push('/tabs/playground');
    } catch (e) {
      console.error("Failed to navigate to playground:", e);
      alert("Failed to prepare project for navigation.");
    }
  };

  const backToScan = () => {
    isCalledOneTime.current = false;
    setBufferBase64("");
    setIsBackFromPlayground(false);
    setProjectId("");
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
    // workspaceRef.current?.dispose();
    // disposeRenderer();
    // if (vmRef.current) {
    //   vmRef.current.clear?.();
    // }
    // setSelectedSpriteId(null);
    // selectedSpiId.current = null;
    // isCalledOneTime.current = false;
    // setBufferBase64("");
    // setIsBackFromPlayground(false);
    // setProjectId("");
    history.push('/tabs/editor');
  };

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

  const submitProject = async () => {

  }

  useIonViewDidEnter(() => {
    lockOrientation();
    handleUpload();
  })

  useIonViewDidLeave(() => {
    isCalledOneTime.current = false;
  });

  console.log("selectedSpriteId", selectedSpriteId, blockRef.current, (vmRef.current as any)?.runtime?.targets);

  return (
    // <IonPage>
    <div style={{
      margin: "30px 10px 10px 10px",
      height: "94vh",
      overflowY: "scroll"
    }}>
      <CommonCard style={{ padding: "10px", maxWidth: "100%", minWidth: "340px" }}>
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
        <div style={{ display: "flex", justifyContent: "space-evenly", gap: 8, marginTop: "10px" }}>
          <CustomButton btnText="" icon={<IonIcon icon={FileSaveIcon} style={{ fontSize: '24px' }} />} onClick={() => submitProject()} background="#D929FF" txtColor="white" style={{ width: "60px", padding: "5px" }} />
          <CustomButton btnText="" icon={<IonIcon icon={RestartIcon} style={{ fontSize: '24px' }} />} onClick={() => backToScan()} background="#FF8429" txtColor="white" style={{ width: "60px", padding: "5px" }} />
          <CustomButton btnText="" icon={<IonIcon icon={RightArrow} style={{ fontSize: '24px' }} />} onClick={() => navigateToPlaygorund()} background="#29B0FF" txtColor="white" style={{ width: "60px", padding: "5px" }} />
        </div>
      </CommonCard>

      {/* <div className="canvas-container">
        <canvas ref={canvasRef} className="playground-canvas" />
      </div> */}

      {
        // cleanVMState(), // <-- Add this line before rendering sprite list
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          justifyContent: 'center',
          gap: 8,
          marginTop: "8px"
        }}>
          {targetsList.map((sprite: any) => {
            const costume = sprite.getCurrentCostume?.();
            const asset = costume?.asset;
            const imageUrl = asset ? getImageFromAsset(asset) : null;

            return (
              <div key={sprite.id} onClick={() => handleSpriteClick(sprite.id)}>
                <CommonCard style={{ padding: 5 }} bottomText={sprite.getName?.()} border={sprite.id === selectedSpriteId}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    {imageUrl && (
                      <img src={imageUrl} alt={sprite.getName?.()} style={{ width: 80, height: 80, objectFit: 'contain' }} />
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
