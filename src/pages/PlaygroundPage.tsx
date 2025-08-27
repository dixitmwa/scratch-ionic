import { IonButton, IonIcon, IonPage, useIonRouter, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getSavedProjectBuffer, getUploadedProjectBuffer, getVMInstance } from '../scratchVMInstance';
import '../css/playground.css'
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { arrowBackCircle, arrowForwardCircle, arrowUpCircle, arrowDownCircle, flag, ellipse, aperture, home, accessibility } from 'ionicons/icons'
import { useReactMediaRecorder } from 'react-media-recorder';
import CustomButton from '../components/common-component/Button';
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

const PlaygroundPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vm = getVMInstance();
    const router = useIonRouter()
    const history = useHistory()
    const [recording, setRecording] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: true });

    const fetchProjectBuffer = async () => {
        return await getProjectBuffer();
    }

    const startGame = () => {
        if (gameStarted) return;
        setGameStarted(true);
        vm.greenFlag();
    }

    const stopGame = () => {
        setGameStarted(false);
        vm.stopAll();
    }

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    const run = async () => {
        let buffer;
        // const projectBuffer = await fetchProjectBuffer();
        // const buffer123 = await getSavedProjectBuffer();
        // console.log("buffer", buffer, buffer123);
        // console.log("projectBuffer", new Uint8Array(projectBuffer));

        const { value: base64 } = await Preferences.get({ key: "buffer_base64" });
debugger
        if (base64) {
            buffer = base64ToUint8Array(base64);
            console.log("Retrieved buffer:", buffer);
        }

        attachRendererIfNone(canvasRef.current!);

        if (buffer) {
            try {
                // await vm.loadProject(buffer123);
                await vm.loadProject(buffer);
                const xml1 = vm.editingTarget.blocks.toXML();

                // await vm.loadProject(buffer123);
                // const xml2 = vm.editingTarget.blocks.toXML();

                console.log("XML from buffer:", xml1);
                console.log("Project loaded into playground");
                setTimeout(() => {
                    const editingTarget = vm.editingTarget;
                    if (editingTarget && editingTarget.blocks) {
                        let xmlString = editingTarget.blocks.toXML();
                        if (!xmlString.trim().startsWith("<xml")) {
                            xmlString = `<xml>${xmlString}</xml>`;
                        }
                        console.log("📦 XML from buffer123:", xmlString);
                    } else {
                        console.warn("⚠ No editingTarget.blocks found");
                    }
                }, 500);
            } catch (error) {
                console.error("Failed to load project:", error);
            }
        } else {
            console.warn("No uploaded project buffer found");
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
        await Preferences.set({ key: 'isBackFromPlayground', value: 'true' });
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

    // const startRecording = async () => {
    //     if (!Capacitor.isNativePlatform()) {
    //         setErrorMsg('Screen recording is only available on native platforms');
    //         return;
    //     }

    //     try {
    //         setLoading(true);
    //         setErrorMsg(null);
    //         const hasPermission = await checkRecordingPermissions();
    //         if (!hasPermission) {
    //             setErrorMsg('Screen recording permission denied');
    //             return;
    //         }

    //         console.log('Starting screen recording...');
    //         setTimeout(() => {
    //             ScreenRecorder.start({
    //                 recordAudio: false,
    //             });
    //         }, 10000);
    //         setRecording(true);
    //         console.log('Recording started successfully');

    //     } catch (error: any) {
    //         console.error('Recording start error:', error);

    //         let errorMessage = 'Failed to start recording';
    //         if (error.message && error.message.includes('prepare failed')) {
    //             errorMessage = 'Recording setup failed. Please ensure the app has screen recording permissions and try again.';
    //         } else if (error.message && error.message.includes('permission')) {
    //             errorMessage = 'Screen recording permission denied. Please enable it in Android settings.';
    //         } else if (error.message) {
    //             errorMessage = `Recording error: ${error.message}`;
    //         }

    //         setErrorMsg(errorMessage);
    //         setRecording(false);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const startRecording = async () => {
    //     try {
    //         console.log("navigator.mediaDevices", JSON.stringify(navigator.mediaDevices))
    //         const stream = await (navigator.mediaDevices as any).getDisplayMedia({
    //             video: { mediaSource: 'screen' }
    //         });

    //         const mediaRecorder = new MediaRecorder(stream);
    //         mediaRecorderRef.current = mediaRecorder;

    //         mediaRecorder.ondataavailable = (event) => {
    //             if (event.data.size > 0) recordedChunks.push(event.data);
    //         };

    //         mediaRecorder.onstop = () => {
    //             const blob = new Blob(recordedChunks, {
    //                 type: 'video/webm'
    //             });
    //             setVideoURL(URL.createObjectURL(blob));
    //         };

    //         mediaRecorder.start();
    //         setRecording(true);
    //     } catch (err) {
    //         console.error('Error: ' + err);
    //     }
    // };

    // const stopRecording = () => {
    //     mediaRecorderRef.current?.stop();
    //     setRecording(false);
    // };

    // const stopRecording = async () => {
    //     try {
    //         setLoading(true);
    //         setErrorMsg(null);
    //         const result: any = await ScreenRecorder.stop();
    //         setRecording(false);

    //         if (result?.value) {
    //             setVideoUri(result.value);
    //         } else {
    //             setVideoUri(null);
    //         }
    //     } catch (e: any) {
    //         setErrorMsg(`Failed to stop recording: ${e.message || e}`);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // const buffer = getUploadedProjectBuffer();
        // const projectBuffer = fetchProjectBuffer();
        // attachRendererIfNone(canvas);
        // console.log("buffer", buffer, projectBuffer)
        // if (projectBuffer) {
        //     vm.loadProject(projectBuffer).then(() => {
        //         // vm.greenFlag();
        //     }).catch(console.error);
        // } else {
        //     console.warn("No uploaded project buffer found");
        // }
        lockOrientation();
        run()

        const handleKeyDown = (e: any) => {

            if (e.target !== document && e.target !== document.body) return;
            const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
            vm.postIOData('keyboard', {
                key: key,
                isDown: true
            });
            console.log("--------->")
            // if (e.key === ' ') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: true })
            // }
            // if (e.key === 'ArrowLeft') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: true })
            //     vm.postIOData('keyboard', { keyCode: 37, key: 'ArrowLeft', isDown: true });
            // }
            // if (e.key === 'ArrowRight') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: true })
            //     vm.postIOData('keyboard', { key: 'ArrowRight', isDown: true });
            // }
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
        };
    }, []);

    useIonViewDidEnter(() => {
        run()
        lockOrientation()
    })

    useIonViewDidLeave(() => {
        disposeRenderer();
    })

    return (
        // <IonPage>
            <div className="playground-wrapper">
                {/* Left Control Buttons */}
                <div className="left" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <CustomButton btnText='' icon={<IonIcon icon={GreenFlag} style={{ fontSize: '32px' }} />} onClick={startGame} background="#FFFFFF" txtColor="#59C059" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={Home} style={{ fontSize: '32px' }} />} onClick={handleBack} background="#FFFFFF" txtColor="#2966FF" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={UpArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={DownArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                </div>

                {/* Center Game Canvas */}
                <div className="canvas-container">
                    <canvas ref={canvasRef} className="playground-canvas" />
                </div>

                {/* Right Control Buttons */}
                <div className="right" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <CustomButton btnText='' icon={<IonIcon icon={Record} style={{ fontSize: '32px' }} />} onClick={stopGame} background="#FFFFFF" txtColor="#FF0000" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={Jump} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: false })
                    } background="#FFFFFF" txtColor="#FF8429" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={LeftArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                    <CustomButton btnText='' icon={<IonIcon icon={RightArrow} style={{ fontSize: '32px' }} />} onClick={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: true })
                    } onRelease={() =>
                        vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: false })
                    } background="#FFFFFF" txtColor="#29B0FF" style={{ width: "60px", padding: "5px" }} />
                </div>
            </div>
        // </IonPage>
    );
};

export default PlaygroundPage;
