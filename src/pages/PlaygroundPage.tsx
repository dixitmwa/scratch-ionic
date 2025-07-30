import { IonButton, IonContent, IonIcon, IonPage, IonText, useIonRouter, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getSavedProjectBuffer, getUploadedProjectBuffer, getVMInstance } from '../scratchVMInstance';
import { Button } from '@mui/material';
import '../css/playground.css'
import { ScreenOrientation } from '@capacitor/screen-orientation';
import SafeAreaView from '../theme/SafeAreaView';
import { ScreenRecorder } from '@capgo/capacitor-screen-recorder';
import { Capacitor } from '@capacitor/core';
import { arrowBackCircle, arrowForwardCircle, arrowUpCircle, arrowDownCircle, flag, ellipse, aperture, home, accessibility } from 'ionicons/icons'

const PlaygroundPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vm = getVMInstance();
    const router = useIonRouter()
    const [recording, setRecording] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const run = async () => {
        const buffer = getUploadedProjectBuffer(); // Uint8Array ✅
        const projectBuffer = await fetchProjectBuffer(); // ✅ Await here
        const buffer123 = await getSavedProjectBuffer();
        console.log("buffer", buffer, buffer123);
        console.log("projectBuffer", new Uint8Array(projectBuffer)); // Also valid sb3

        attachRendererIfNone(canvasRef.current!);

        if (buffer) {
            try {
                // await vm.loadProject(buffer123);
                await vm.loadProject(buffer);
                const xml1 = vm.editingTarget.blocks.toXML();

                await vm.loadProject(buffer123);
                const xml2 = vm.editingTarget.blocks.toXML();

                console.log("XML from buffer:", xml1);
                console.log("XML from buffer123:", xml2);
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

    const handleBack = () => {
        router.push('/editor', 'root');
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

    const startRecording = async () => {
        if (!Capacitor.isNativePlatform()) {
            setErrorMsg('Screen recording is only available on native platforms');
            return;
        }

        try {
            setLoading(true);
            setErrorMsg(null);
            const hasPermission = await checkRecordingPermissions();
            if (!hasPermission) {
                setErrorMsg('Screen recording permission denied');
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Starting screen recording...');
            await ScreenRecorder.start({
                recordAudio: true,
            });

            setRecording(true);
            console.log('Recording started successfully');

        } catch (error: any) {
            console.error('Recording start error:', error);

            let errorMessage = 'Failed to start recording';
            if (error.message && error.message.includes('prepare failed')) {
                errorMessage = 'Recording setup failed. Please ensure the app has screen recording permissions and try again.';
            } else if (error.message && error.message.includes('permission')) {
                errorMessage = 'Screen recording permission denied. Please enable it in Android settings.';
            } else if (error.message) {
                errorMessage = `Recording error: ${error.message}`;
            }

            setErrorMsg(errorMessage);
            setRecording(false);
        } finally {
            setLoading(false);
        }
    };

    const stopRecording = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const result: any = await ScreenRecorder.stop();
            setRecording(false);

            if (result?.value) {
                setVideoUri(result.value);
            } else {
                setVideoUri(null);
            }
        } catch (e: any) {
            setErrorMsg(`Failed to stop recording: ${e.message || e}`);
        } finally {
            setLoading(false);
        }
    };

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
        // lockOrientation();
        // run()

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
            // if (e.key === ' ') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: false })
            // }
            // if (e.key === 'ArrowLeft') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: false })
            //     vm.postIOData('keyboard', { keyCode: 37, key: 'ArrowLeft', isDown: false });
            // }
            // if (e.key === 'ArrowRight') {
            //     vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: false })
            //     vm.postIOData('keyboard', { key: 'ArrowRight', isDown: false });
            // }
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
        <IonPage>
            <IonContent fullscreen className='ion-padding'>
                <SafeAreaView>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexDirection: "column" }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            {/* <Button variant='contained' onClick={() => vm.greenFlag()} >Play</Button> */}
                            <IonButton fill="clear" style={{ opacity: gameStarted ? 0.5 : 1 }} onClick={() => startGame()}>
                                <IonIcon color={'success'} slot="icon-only" icon={flag} />
                            </IonButton>
                            <IonButton fill="clear" onClick={() => vm.stopAll()}>
                                <IonIcon color="danger" slot="icon-only" icon={ellipse} />
                            </IonButton>
                            <IonButton fill="clear" onClick={() => handleBack()}>
                                <IonIcon color='danger' slot='icon-only' icon={home} />
                            </IonButton>
                            <IonButton shape="round" className="right"
                                onTouchStart={() => vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: true })}
                                onTouchEnd={() => vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: false })}
                                onMouseDown={() => vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: true })}
                                onMouseUp={() => vm.runtime.ioDevices['keyboard'].postData({ key: ' ', isDown: false })}>
                                <IonIcon slot="icon-only" icon={accessibility} />
                            </IonButton>
                            {!recording ? (
                                <IonButton fill="clear" onClick={startRecording}>
                                    <IonIcon slot="icon-only" color='medium' icon={aperture} />
                                </IonButton>
                            ) : (
                                <IonButton color="danger" fill="clear" onClick={stopRecording}>
                                    <IonIcon slot="icon-only" color='danger' icon={aperture} />
                                </IonButton>
                            )}
                        </div>
                        <div className="playground-wrapper">
                            <div className='left'>
                                <IonButton
                                    shape="round"
                                    className="arrow-button left"
                                    onTouchStart={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: true })}
                                    onTouchEnd={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowLeft', isDown: false })}
                                >
                                    <IonIcon slot="icon-only" icon={arrowBackCircle} />
                                </IonButton>

                                <IonButton
                                    shape="round"
                                    className="arrow-button left"
                                    onTouchStart={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: true })}
                                    onTouchEnd={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowRight', isDown: false })}
                                >
                                    <IonIcon slot="icon-only" icon={arrowForwardCircle} />
                                </IonButton>
                            </div>
                            <div className="canvas-container">
                                <canvas ref={canvasRef} className="playground-canvas" />
                            </div>
                            <div className='right'>
                                <IonButton
                                    shape="round"
                                    className="arrow-button"
                                    onTouchStart={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: true })}
                                    onTouchEnd={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowUp', isDown: false })}
                                >
                                    <IonIcon slot="icon-only" icon={arrowUpCircle} />
                                </IonButton>
                                <IonButton
                                    shape="round"
                                    className="arrow-button"
                                    onTouchStart={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: true })}
                                    onTouchEnd={() => vm.runtime.ioDevices['keyboard'].postData({ key: 'ArrowDown', isDown: false })}
                                >
                                    <IonIcon slot="icon-only" icon={arrowDownCircle} />
                                </IonButton>
                            </div>
                            {/* <div className="accessibility-button-wrapper"> */}
                            {/* </div> */}
                        </div>
                    </div>
                </SafeAreaView>
            </IonContent>
        </IonPage >
    );
};

export default PlaygroundPage;
