import { IonButton, IonIcon, IonPage, IonToast, useIonRouter, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { attachPlaygroundRendererIfNone, disposeRenderer, getPlaygroundVMInstance, getProjectBuffer, getSavedProjectBuffer, getUploadedProjectBuffer, getVMInstance } from '../scratchVMInstance';
import '../css/playground.css'
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { arrowBackCircle, arrowForwardCircle, arrowUpCircle, arrowDownCircle, flag, ellipse, aperture, home, accessibility } from 'ionicons/icons'
import CustomButton from '../components/common-component/Button';
import { ScreenRecordingHelper } from '../utils/ScreenRecordingHelper';
// import { CapgoScreenRecordingHelper as ScreenRecordingHelper } from '../utils/CapgoScreenRecordingHelper';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router';
import GreenFlag from '../assets/green_flag.svg'
import Home from '../assets/home.svg'
import Record from '../assets/record.svg'
import UpArrow from '../assets/up_arrow.svg'
import DownArrow from '../assets/down_arrow.svg'
import LeftArrow from '../assets/left_arrow_playground.svg'
import RightArrow from '../assets/right_arrow_playground.svg'
import Jump from '../assets/jump.svg'
import blocksInit from '../comv1/blocks';
import ClassRoomService from '../service/ClassroomService/ClassRoomService';
import { useSection } from '../context/SectionContext';
import { usePlayground } from '../context/PlaygroundContext';

const PlaygroundPage = () => {
    const playLabelStyle = { color: "#607E9C", textTransform: 'uppercase' as const, fontWeight: 600, textAlign: 'center' as const, margin: 0 };
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vm = getPlaygroundVMInstance();
    const vmWorkspace = getVMInstance();
    // Initialize custom blocks for this VM instance
    blocksInit(vm, false);
    const router = useIonRouter()
    const history = useHistory();
    const { projectId } = useSection();
    const {
        isBackFromPlaygroundRef,
        setIsBackFromPlayground,
        bufferBase64Ref,
        setBufferBase64
    } = usePlayground();
    const [recording, setRecording] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");
    // Removed useReactMediaRecorder (not needed for native plugin)

    const fetchProjectBuffer = async () => {
        return await getProjectBuffer();
    }

    const startGame = () => {
        if (vmWorkspace && typeof vmWorkspace.clear === 'function') {
            vmWorkspace.clear();
        }
        // if (gameStarted) return;
        setGameStarted(true);
        vm.greenFlag();
    }

    const stopGame = async () => {
        setGameStarted(false);
        vm.stopAll();
        const formData = new FormData();
        if (projectId) {
            try {
                const uint8Array = base64ToUint8Array(bufferBase64Ref.current || "");
                console.log('🛑 STOP GAME - converted uint8Array length:', uint8Array.length);
                console.log('🛑 STOP GAME - uint8Array first 20 bytes:', Array.from(uint8Array.slice(0, 20)));

                // Download the project as ZIP for debugging
                downloadBase64AsZip(bufferBase64Ref.current || "", `playground_project_${Date.now()}.sb3`);
                console.log('💾 STOP GAME - Project ZIP download triggered');

                const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
                console.log('🛑 STOP GAME - blob size:', blob.size);

                formData.append("file", blob, "project.sb3");
                const response = await ClassRoomService.submitProjectService(projectId, formData)
                console.log('🛑 STOP GAME - response:', response)
                if (response?.status === 200) {
                    setShowMessage(true);
                    setMessage("Assignment submitted successfully");
                }
            } catch (error) {
                console.error('🛑 STOP GAME - Error processing bufferBase64:', error);
                setShowMessage(true);
                setMessage("Error submitting assignment");
            }
        }
    }

    // Function to handle Android-specific project loading issues
    const loadProjectWithAndroidFix = async (buffer: Uint8Array) => {
        try {
            // First try normal loading
            await vm.loadProject(buffer);
            return true;
        } catch (error: any) {
            console.log("🔧 Normal loading failed, trying Android fixes...");

            // Check if it's the isStage validation error
            if (error?.sb3Errors?.some((err: any) => err.dataPath?.includes('isStage'))) {
                console.log("🔧 Detected isStage validation error - attempting fixes...");

                // Try various Android-specific fixes
                const fixes = [
                    async () => {
                        console.log("🔧 Fix 1: VM reset with delay");
                        vm.clear();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await vm.loadProject(buffer);
                    },
                    async () => {
                        console.log("🔧 Fix 2: Load empty project first");
                        vm.clear();
                        await vm.loadProject(new Uint8Array(0));
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await vm.loadProject(buffer);
                    },
                    async () => {
                        console.log("🔧 Fix 3: Force VM reinitialization");
                        // This might need additional VM reinitialization logic
                        vm.clear();
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await vm.loadProject(buffer);
                    }
                ];

                for (let i = 0; i < fixes.length; i++) {
                    try {
                        await fixes[i]();
                        console.log(`✅ Android fix ${i + 1} successful!`);
                        return true;
                    } catch (fixError) {
                        console.log(`❌ Android fix ${i + 1} failed:`, fixError);
                    }
                }
            }

            // If all fixes fail, throw the original error
            throw error;
        }
    };

    console.log("vmvmvmvmvmvmvm", vm?.runtime?.targets)

    function base64ToUint8Array(base64: string) {
        console.log("🔄 Converting base64 to Uint8Array...");
        console.log("📏 Input base64 length:", base64.length);
        console.log("📄 Input base64 first 50 chars:", base64.substring(0, 50));

        try {
            const binaryString = atob(base64);
            console.log("📏 Binary string length:", binaryString.length);

            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            console.log("✅ Uint8Array conversion completed");
            console.log("📊 Output array length:", bytes.length);
            console.log("🔢 Output array first 10 bytes:", Array.from(bytes.slice(0, 10)));

            // Validate that it's a ZIP file (SB3 format)
            if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
                console.log("✅ Converted data appears to be a valid ZIP file");
            } else {
                console.log("❌ WARNING: Converted data does not appear to be a ZIP file!");
                console.log("🔍 First 8 bytes:", Array.from(bytes.slice(0, 8)));
            }

            return bytes;
        } catch (error) {
            console.error("❌ Error in base64 to Uint8Array conversion:", error);
            throw error;
        }
    }

    // Safe Uint8Array to base64 conversion
    function uint8ArrayToBase64Safe(uint8Array: Uint8Array): string {
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, uint8Array.slice(i, i + chunkSize) as any);
        }
        return btoa(binary);
    }

    // Convert base64 to ZIP file and download
    const downloadBase64AsZip = (base64Data: string, filename: string = 'playground_project.sb3') => {
        try {
            console.log("💾 PlaygroundPage - Converting base64 to ZIP file...");
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
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            console.log("✅ PlaygroundPage - ZIP file download triggered:", filename);

        } catch (error) {
            console.error("❌ PlaygroundPage - Error downloading ZIP file:", error);
            alert("Failed to download project file");
        }
    }

    const run = async () => {
        let buffer;
        // const projectBuffer = await fetchProjectBuffer();
        // const buffer123 = await getSavedProjectBuffer();
        // console.log("buffer", buffer, buffer123);
        // console.log("projectBuffer", new Uint8Array(projectBuffer))

        if (bufferBase64Ref?.current) {
            try {
                let latestDecoded = bufferBase64Ref?.current;
                // Defensive: Clean up targets array, remove undefined/null, ensure variables property
                if (vm && typeof vm.runtime?.targets === 'object' && Array.isArray(vm.runtime.targets)) {
                    // Remove undefined/null targets
                    vm.runtime.targets = vm.runtime.targets.filter((target: any) => !!target && typeof target === 'object');
                    // Ensure every target has a variables object
                    vm.runtime.targets.forEach((target: any) => {
                        if (!target || typeof target !== 'object') return;
                        if (typeof target.variables !== 'object' || target.variables === null) {
                            target.variables = {};
                        }
                    });
                    // Remove duplicate targets by ID
                    const seenIds = new Set();
                    vm.runtime.targets = vm.runtime.targets.filter((target: any) => {
                        if (!target || typeof target !== 'object') return false;
                        if (seenIds.has(target.id)) {
                            return false;
                        }
                        seenIds.add(target.id);
                        return true;
                    });
                    // Save cleaned project to bufferBase64
                    if (typeof vm.saveProjectSb3 === 'function') {
                        const blob = await vm.saveProjectSb3();
                        const arrayBuffer = await blob.arrayBuffer();
                        const uint8Array = new Uint8Array(arrayBuffer);
                        let binary = '';
                        const chunkSize = 8192;
                        for (let i = 0; i < uint8Array.length; i += chunkSize) {
                            binary += String.fromCharCode.apply(null, uint8Array.slice(i, i + chunkSize) as any);
                        }
                        const cleanedBase64 = btoa(binary);
                        // latestDecoded = cleanedBase64;
                        // setBufferBase64(cleanedBase64);
                    }
                }
                // Download the project for debugging before loading
                downloadBase64AsZip(latestDecoded, `run_project_${Date.now()}.sb3`);
                console.log("💾 RUN - Project ZIP download triggered before loading", latestDecoded);
                buffer = base64ToUint8Array(bufferBase64Ref?.current);
                // attachRendererIfNone(canvasRef.current!);

                const magicBytes = Array.from(buffer.slice(0, 8));

                const blob = new Blob([buffer], { type: 'application/zip' });

                // Test round-trip conversion to check for data corruption
                console.log("🔄 Testing round-trip conversion...");
                const testBase64 = uint8ArrayToBase64Safe(buffer);
                const testBuffer = base64ToUint8Array(testBase64);
                const isIdentical = buffer.every((byte, index) => byte === testBuffer[index]);
                console.log("🧪 Round-trip test result:", isIdentical ? "✅ PASSED" : "❌ FAILED");
                if (!isIdentical) {
                    console.log("❌ Data corruption detected in base64 conversion!");
                    console.log("📊 Original length:", buffer.length, "Test length:", testBuffer.length);
                }

            } catch (decodeError) {
                console.error("❌ Failed to decode base64:", decodeError);
                buffer = null;
            }
        } else {
            console.log("❌ No bufferBase64 found in context");
        }

        attachPlaygroundRendererIfNone(canvasRef.current!);

        // Always reset VM before loading project
        // vm.clear();

        if (buffer) {
            console.log("🚀 Attempting to load project...");

            try {
                console.log("📤 Calling vm.loadProject with buffer length:", buffer.length);

                // Always clear VM before loading project to prevent duplicate targets
                // if (vm && typeof vm.clear === 'function') {
                //     vm.clear();
                // }

                // Defensive: Ensure every target is valid before loading
                if (vm && typeof vm.runtime?.targets === 'object' && Array.isArray(vm.runtime.targets)) {
                    vm.runtime.targets = vm.runtime.targets.filter((target: any) => !!target && typeof target === 'object');
                    vm.runtime.targets.forEach((target: any) => {
                        if (!target || typeof target !== 'object') return;
                        if (typeof target.variables !== 'object' || target.variables === null) {
                            target.variables = {};
                        }
                    });
                }
                debugger
                await vm.loadProject(buffer);
                console.log("✅ Project loaded successfully!");

                const xml1 = vm.editingTarget?.blocks?.toXML?.() ?? '';
                console.log("📦 XML from loaded project:", xml1);
                console.log("✅ Project loaded into playground successfully");

                setTimeout(() => {
                    const editingTarget = vm.editingTarget;
                    if (editingTarget && editingTarget.blocks) {
                        let xmlString = editingTarget.blocks.toXML();
                        if (!xmlString.trim().startsWith("<xml")) {
                            xmlString = `<xml>${xmlString}</xml>`;
                        }
                        console.log("📦 XML from editingTarget after timeout:", xmlString);
                    } else {
                        console.warn("⚠ No editingTarget.blocks found after timeout");
                    }
                }, 500);
            } catch (error: any) {
                // ...existing code...
            }
        } else {
            // ...existing code...
        }
    };

    const lockOrientation = async () => {
        try {
            await ScreenOrientation.lock({ orientation: 'landscape-primary' });
        } catch (error) {
            console.error('Error locking orientation:', error);
        }
    };

    const handleBack = async () => {
        if (vm && typeof vm.clear === 'function') {
            vm.clear();
        }
        setIsBackFromPlayground(true);
        history.push('/tabs/scratch-editor');
    };

    const checkRecordingPermissions = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                console.log('Screen recording permissions will be handled at runtime');
                return true;
            } catch (error) {
                console.error('Permission check failed:', error);
                return false;
            }
        }
        return true;
    };

    const handleStartRecording = async () => {
        if (!ScreenRecordingHelper.isSupported()) {
            setShowMessage(true);
            setMessage('Screen recording is only available on native platforms');
            return;
        }
        setLoading(true);
        setShowMessage(true);
        setMessage("Starting recording...");
        try {
            const result = await ScreenRecordingHelper.startRecording();
            console.log("Recording started, result:", result);
            if (result.success) {
                setRecording(true);
                setShowMessage(true);
                setMessage('Recording started successfully');
            } else {
                setShowMessage(true);
                setMessage(result.error || 'Failed to start recording');
            }
        } catch (error: any) {
            console.error("Error starting recording:", error);
            setShowMessage(true);
            setMessage(error.message || 'Failed to start recording');
        } finally {
            setLoading(false);
        }
    };

    const handleStopRecording = async () => {
        setLoading(true);
        setShowMessage(true);
        setMessage("Stopping recording...");
        try {
            const result = await ScreenRecordingHelper.stopRecording();
            console.log("Recording stopped, result:", result);
            setRecording(false);
            if (result.success && result.videoUri) {
                setVideoUri(result.videoUri);
                setShowMessage(true);
                setMessage('Recording saved: ' + result.videoUri);
            } else {
                setShowMessage(true);
                setMessage(result.error || 'No video returned');
            }
        } catch (error: any) {
            setShowMessage(true);
            setMessage(error.message || 'Failed to stop recording');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

    lockOrientation();
    run();
    // Defensive: re-initialize custom blocks if VM changes
    blocksInit(vm, false);

        const handleKeyDown = (e: any) => {

            if (e.target !== document && e.target !== document.body) return;
            const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
            vm.postIOData('keyboard', {
                key: key,
                isDown: true
            });
        };
        const handleKeyUp = (e: any) => {
            const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
            vm?.postIOData('keyboard', {
                key: key,
                isDown: false
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            vm.stopAll();
            disposeRenderer();
            ScreenRecordingHelper.resetRecordingState();
        };
    }, []);

    useIonViewDidEnter(() => {
    lockOrientation();
    run();
    // Defensive: re-initialize custom blocks on view enter
    blocksInit(vm, false);
    })

    useIonViewDidLeave(() => {
        disposeRenderer();
    })

    return (
        // <IonPage>
        <div className="playground-wrapper">
            {/* Left Control Buttons */}
            <div className="left" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={GreenFlag} style={{ fontSize: '32px' }} />} onClick={() => startGame()} background="#FFFFFF" txtColor="#59C059" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Play</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={Home} style={{ fontSize: '32px' }} />} onClick={handleBack} background="#FFFFFF" txtColor="#2966FF" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Home</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={UpArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Up</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={DownArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Down</p>
                </div>
            </div>

            {/* Center Game Canvas */}
            <div className="canvas-container">
                <canvas ref={canvasRef} className="playground-canvas" />
            </div>

            {/* Right Control Buttons */}
            <div className="right" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    {!recording ? (
                        <CustomButton
                            btnText=''
                            icon={<IonIcon icon={Record} style={{ fontSize: '32px' }} />}
                            onClick={handleStartRecording}
                            background="#FFFFFF"
                            txtColor="#FF0000"
                            style={{ width: "60px", padding: "5px" }}
                            disable={loading}
                        />
                    ) : (
                        <CustomButton
                            btnText=''
                            icon={<IonIcon icon={Record} style={{ fontSize: '32px', color: '#FFFFFF' }} />}
                            onClick={handleStopRecording}
                            background="#FF0000"
                            txtColor="#FFFFFF"
                            style={{ width: "60px", padding: "5px", border: '2px solid #FF0000' }}
                            disable={loading}
                        />
                    )}
                    <p style={playLabelStyle}>Record</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={Jump} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: false })
                    } background="#FFFFFF" txtColor="#FF8429" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Jump</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={LeftArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Left</p>
                </div>
                <div>
                    <CustomButton btnText='' icon={<IonIcon icon={RightArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <p style={playLabelStyle}>Right</p>
                </div>
            </div>
            <IonToast
                isOpen={showMessage}
                onDidDismiss={() => setShowMessage(false)}
                message={message}
                duration={2000}>
            </IonToast>
        </div>
        // </IonPage>
    );
};

export default PlaygroundPage;
