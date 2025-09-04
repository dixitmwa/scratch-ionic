import { IonIcon, useIonViewDidLeave } from "@ionic/react";
import { useEffect, useState } from "react";
import CustomButton from "../components/common-component/Button";
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router";
import { DocumentScanner } from "capacitor-document-scanner";
import { Capacitor } from "@capacitor/core";
import { PDFDocument } from "pdf-lib";
import { Preferences } from "@capacitor/preferences";
import { useSection } from "../context/SectionContext";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";

const ProjectDetailsPage = () => {
    const history = useHistory()
    const { projectId } = useSection();
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    console.log("projectId", projectId)

    const fetchProjectDetail = async ()=>{
        const response = await ClassRoomService.fetchProjectDetailByIdService(projectId);
        if (response?.status === 200) {
            console.log("Project Details:", response?.data?.data);
            setProjectDetails(response?.data?.data);
        }
    }

    const scanDocument = async () => {
        setLoading(true);
        const { scannedImages } = await DocumentScanner.scanDocument({
            maxNumDocuments: 5,
        });
        if (scannedImages && scannedImages?.length > 0) {
            try {
                const displayUri = Capacitor.convertFileSrc(scannedImages[0]);

                const pdfDoc = await PDFDocument.create();
                for (const imageUri of scannedImages) {
                    // Fetch image data
                    const response = await fetch(Capacitor.convertFileSrc(imageUri));
                    const imageBlob = await response.blob();
                    const imageArrayBuffer = await imageBlob.arrayBuffer();

                    // Determine image type (assume jpeg unless png)
                    const imageMimeType = imageUri.toLowerCase().endsWith(".png")
                        ? "image/png"
                        : "image/jpeg";

                    let embeddedImage;
                    if (imageMimeType === "image/jpeg") {
                        embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
                    } else {
                        embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
                    }

                    // A4 in points: 595 x 842
                    const PAGE_WIDTH = 595;
                    const PAGE_HEIGHT = 842;

                    const imageWidth = embeddedImage.width;
                    const imageHeight = embeddedImage.height;

                    const scaleX = PAGE_WIDTH / imageWidth;
                    const scaleY = PAGE_HEIGHT / imageHeight;
                    const scale = Math.min(scaleX, scaleY);

                    const drawWidth = imageWidth * scale;
                    const drawHeight = imageHeight * scale;

                    const x = (PAGE_WIDTH - drawWidth) / 2;
                    const y = (PAGE_HEIGHT - drawHeight) / 2;

                    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
                    page.drawImage(embeddedImage, {
                        x,
                        y,
                        width: drawWidth,
                        height: drawHeight,
                    });
                }

                const pdfBytes = await pdfDoc.save();
                const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

                const formData = new FormData();
                debugger;
                formData.append("pdf_file", pdfBlob, "scanned_document.pdf");

                const response = await fetch(
                    "https://prthm11-scratch-vision-game.hf.space/process_pdf",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await response.json();
                localStorage.setItem("project", data?.test_url);
                console.log("data", data);
                await Preferences.set({ key: "project", value: data?.test_url });
                // setProjectFile(data?.test_url)
                // setShowLoading(false);
                // router.push('/editor', 'root');
                setLoading(false);
                history.push("/tabs/scratch-editor");

                ionRouter.push("/scratch-editor", "forward", "replace");
                // setImageUploaded(true);
            } catch (e) {
                setLoading(false);
                // setErrorShow(e)
                console.log("eee", e);
            }
        }
    };

    useEffect(() => {
        fetchProjectDetail();
        return () => {
            // document.querySelector(".project-details-content")?.remove();
        };
    }, []);

    // useIonViewDidLeave(() => {
    //     document.querySelector(".project-details-content")?.remove();
    // })

    return (
        // projectId is available here for fetching project details
        <div className="project-details-content" style={{
            margin: "6vh 0px 10px 0px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            // overflowY: "scroll",
        }}>
            <div className="header" style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/project") }} />
                    <div>
                        <p style={{
                            fontSize: "24px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: "#607E9C",
                            textAlign: "center",
                            marginTop: "0px",
                            marginBottom: "0px"
                        }}>
                            {projectDetails?.title}
                        </p>
                        <p style={{
                            fontSize: "18px",
                            color: "#607E9C",
                            textAlign: "center",
                            marginTop: "0px",
                            marginBottom: "0px"
                        }}>
                            Last date : {projectDetails?.endDate ? (() => {
                                const d = new Date(projectDetails.endDate);
                                const day = String(d.getDate()).padStart(2, '0');
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const year = d.getFullYear();
                                return `${day}-${month}-${year}`;
                            })() : "-"}
                        </p>
                    </div>
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                flexGrow: 1,
                height: "72vh",
                maxHeight: "72vh",
                maxWidth: "366px",
                margin: "0 auto",
                width: "100%",
                overflowY: "scroll",
            }}>
                <div style={{ width: "100%" }}>
                    <h3 style={{ color: "#607E9C" }}>Description</h3>
                    <div style={{
                        border: "1px solid #607E9C",
                        borderRadius: "20px",
                        background: "#fff",
                        padding: "20px",
                        color: "#607E9C",
                        fontSize: "18px"
                    }}>
                        {projectDetails?.description}
                    </div>
                </div>
                <CustomButton
                    btnText="START SCANNING"
                    background="#FF8429"
                    onClick={() => { scanDocument() }}
                    disable={
                        !!projectDetails && (
                            projectDetails.isSubmitted ||
                            (projectDetails.endDate && new Date() > new Date(projectDetails.endDate))
                        )
                    }
                />
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
