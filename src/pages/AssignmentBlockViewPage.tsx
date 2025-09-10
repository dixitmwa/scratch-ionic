import { IonIcon, useIonViewDidEnter } from "@ionic/react";
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useState, useRef } from "react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import { useSection } from "../context/SectionContext";
import LeftArrow from "../assets/left_arrow_double.svg";
import PlayArrow from "../assets/play.svg";
import RightArrow from "../assets/right_arrow_double.svg";
import CustomButton from "../components/common-component/Button";
import Loader from "../components/common-component/Loader";
import AssignmentService from "../service/AssignmentService/AssignmentService";
import { Preferences } from "@capacitor/preferences";
import { loadProject, setLastSavedProjectData } from "../components/commonfunction";
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getVMInstance, saveCurrentProjectBuffer, setUploadedProjectBuffer } from "../scratchVMInstance";
import ScratchBlocks from 'scratch-blocks';
import '../components/blocks.css';
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { rootUrl } from "../service/api";
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";

const AssignmentBlockViewPage = () => {
    const { sectionId, selectedAssignmentItem } = useSection();

    function formatDate(dateString: string) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    const blockRef = useRef(null);
    const workspaceRef = useRef(null);
    const canvasRef = useRef(null);
    const vmRef = useRef(null);
    // const router = useIonRouter();
    const history = useHistory()
    const [ready, setReady] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [selectedSpriteId, setSelectedSpriteId] = useState(null);
    const selectedSpiId = useRef(null)
    const [selectedAnswer, setSelectedAnswer] = useState<"correct" | "wrong" | null>(null);
    // Set selectedAnswer based on selectedAssignmentItem.isCorrect
    useEffect(() => {
        if (selectedAssignmentItem?.isCorrect === true) {
            setSelectedAnswer("correct");
        } else if (selectedAssignmentItem?.isCorrect === false) {
            setSelectedAnswer("wrong");
        } else {
            setSelectedAnswer(null);
        }
    }, [selectedAssignmentItem]);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [pendingAnswer, setPendingAnswer] = useState<"correct" | "wrong" | null>(null);
    const [popupLoading, setPopupLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [backPage, setBackPage] = useState<string>("");
    const [assignmentDetails, setAssignmentDetails] = useState<any>({});
    const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const lockOrientation = async () => {
        try {
            await ScreenOrientation.lock({ orientation: 'portrait-primary' });
        } catch (error) {
            console.error('Error locking orientation:', error);
        }
    };

    const fetchAssignmentDetails = async () => {
        return;
        setIsLoading(true);
        const { value } = await Preferences.get({ key: "backPage" })
        setBackPage(value || "");
        const response = await AssignmentService.fetchAssignmentByIdService(sectionId);
        if (response?.status === 200) {
            debugger
            setAssignmentDetails(response?.data?.data);
            setFilteredAssignments(response?.data?.data?.assignments || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAssignmentDetails();
    }, [])

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
    }, [ready, showDetails]);

    useEffect(() => {
        if (!blockRef.current || !showDetails) return;
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
    }, [showDetails]);

    const handleProjectLoaded = () => {
        const spriteTargets = vmRef.current?.runtime?.targets.filter(t => t.isSprite);
        // debugger
        if (!selectedSpiId.current) {
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

    const updateBlocksForSprite = (spriteId: any) => {
        const ws = workspaceRef.current;
        debugger
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
            ScratchBlocks.svgResize(ws);
            ws.resize();
            selectedSpiId.current = spriteId
            setSelectedSpriteId(spriteId);
        } catch (e) {
            debugger
            console.error('Failed to set blocks for sprite', e);
        }
    };

    const handleSpriteClick = (spriteId: any) => {
        // debugger
        selectedSpiId.current = spriteId;
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

        const { value } = await Preferences.get({ key: 'project' })
        debugger
        const projectUrl = rootUrl + selectedAssignmentItem.filePaths[9]
        console.log("value->", value, projectUrl)
        // const projectUrl = value;
        // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping";
        // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/49b33c1f68664dc9b4af7dadbade5357";
        // const projectUrl = "https://prthm11-scratch-vision-game.hf.space/download_sb3/d7aaf7035ba8430eb90e65ba9b114ca3";
        // const projectUrl: any = "https://prthm11-scratch-vision-game.hf.space/download_sb3/cat_jumping";
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


    // Navigate to playground page after saving current project
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

    const handleAnswerClick = (answer: "correct" | "wrong") => {
        // If clicking 'correct' and already correct, do nothing
        if (answer === "correct" && selectedAnswer === "correct") {
            return;
        }
        // If clicking 'wrong' and already wrong, do nothing
        if (answer === "wrong" && selectedAnswer === "wrong") {
            return;
        }
        setPendingAnswer(answer);
        setShowConfirmPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setPopupLoading(true);
        try {
            const StudentId = selectedAssignmentItem?.studentId;
            const ProjectId = sectionId;
            const response = await AssignmentService.validateAnswerService({
                StudentId,
                ProjectId,
                isCorrect: pendingAnswer === "correct" ? true : false
            });
            if (response?.status === 200) {
                setPopupMessage("Answer submitted successfully.");
                setSelectedAnswer(pendingAnswer);
            } else {
                setPopupMessage("Failed to submit answer.");
            }
        } catch (e) {
            setPopupMessage("Error submitting answer.");
        } finally {
            setPopupLoading(false);
            setShowConfirmPopup(false);
            setPopupMessage("");
        }
    };

    const handlePrev = () => {
        debugger
        if (selectedIndex !== null) {
            let prevIndex = selectedIndex - 1;
            while (prevIndex >= 0) {
                const prevItem = assignmentDetails.assignments[prevIndex];
                if (prevItem?.isSubmitted && prevItem?.submittedDate) {
                    setSelectedIndex(prevIndex);
                    setSelectedItem(prevItem);
                    return;
                }
                prevIndex--;
            }
        }
    };

    const handleBack = async () => {
        history.push("/tabs/assignment/details");
    }

    const handleNext = () => {
        debugger
        if (selectedIndex !== null && assignmentDetails.assignments) {
            let nextIndex = selectedIndex + 1;
            while (nextIndex < assignmentDetails.assignments.length) {
                const nextItem = assignmentDetails.assignments[nextIndex];
                if (nextItem?.isSubmitted && nextItem?.submittedDate) {
                    setSelectedIndex(nextIndex);
                    setSelectedItem(nextItem);
                    return;
                }
                nextIndex++;
            }
        }
    };

    const handleNavigatePlayVideo = async () => {
        history.push('/tabs/assignment/project-video')
    }

    useIonViewDidEnter(() => {
        lockOrientation();
        handleUpload();
    })

    console.log('blockRef', blockRef.current)

    return (
        <div style={{
            margin: "6vh 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            overflowY: "scroll"
        }}>
            <div style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleBack() }} />
                    <div>
                        <p style={{ color: "#607E9C", fontSize: "24px", fontWeight: "bold", marginBottom: "0px", marginTop: "0px", textAlign: "center" }}>
                            {selectedAssignmentItem?.name || ""}
                        </p>
                        <p style={{ color: "#607E9C", textAlign: "center", fontSize: "18px", marginBottom: "0px", marginTop: "0px" }}>
                            {selectedAssignmentItem?.submittedDate ? "Submitted date : " + formatDate(selectedAssignmentItem.submittedDate) : ""}
                        </p>
                    </div>
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>
            <div style={{
                background: '#F7FAFF',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: '24px 12px 16px 12px',
                width: '100%',
                margin: '0 auto',
                position: 'relative',
                display: 'flex',
                // display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* <CustomButton btnText="" icon={<IonIcon icon={LeftArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', left: '8px', top: '50%', zIndex: 2, transform: 'translateY(-50%)', width: "60px" }} onClick={handlePrev} />
                <CustomButton btnText="" icon={<IonIcon icon={RightArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', right: '8px', top: '50%', zIndex: 2, transform: 'translateY(-50%)', width: "60px" }} onClick={handleNext} /> */}
                <div
                    ref={blockRef}
                    style={{
                        position: 'relative',
                        height: '60vh',
                        width: '100%',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        touchAction: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                />
                <CustomButton btnText="" style={{ width: "auto", marginTop: "10px" }} icon={<IonIcon icon={PlayArrow} style={{ fontSize: "25px" }} />} onClick={() => handleNavigatePlayVideo()} />
                <div style={{ display: 'flex', gap: "5px", justifyContent: 'space-between', marginTop: '8px' }}>
                    <CustomButton
                        btnText="wrong"
                        txtColor={selectedAnswer === "wrong" ? "#FFFFFF" : "#607E9C"}
                        background={selectedAnswer === "wrong" ? "#FF297A" : "#FFFFFF"}
                        style={{ padding: '12px 20px', border: selectedAnswer === "wrong" ? "2px solid #FF297A" : "2px solid #607E9C" }}
                        onClick={() => handleAnswerClick("wrong")}
                    />
                    <CustomButton
                        btnText="correct"
                        txtColor={selectedAnswer === "correct" ? "#FFFFFF" : "#607E9C"}
                        background={selectedAnswer === "correct" ? "#29B0FF" : "#FFFFFF"}
                        style={{ padding: '12px 20px', border: selectedAnswer === "correct" ? "2px solid #29B0FF" : "2px solid #607E9C" }}
                        onClick={() => handleAnswerClick("correct")}
                    />
                </div>
                <CommonPopup isOpen={showConfirmPopup} setIsOpen={setShowConfirmPopup}>
                    <CommonCard headerText="Confirm Submission">
                        <h3 style={{ color: "#607E9C", margin: "0px 0px 10px 0px" }}>Are you sure you want to submit this answer?</h3>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <CustomButton
                                btnText="No"
                                background="#607E9C"
                                txtColor="#fff"
                                onClick={() => setShowConfirmPopup(false)}
                                style={{ padding: '8px 24px' }}
                            />
                            <CustomButton
                                btnText={popupLoading ? "Submitting..." : "Yes"}
                                background="#29B0FF"
                                txtColor="#fff"
                                onClick={handleConfirmSubmit}
                                style={{ padding: '8px 24px' }}
                                disable={popupLoading}
                            />
                        </div>
                    </CommonCard>
                </CommonPopup>
            </div>
        </div>

    );
};

export default AssignmentBlockViewPage;