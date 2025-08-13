import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonButton, IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Button } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { useIonRouter } from '@ionic/react';
import { useState } from 'react';
import { DocumentScanner } from 'capacitor-document-scanner'
import { startDocumentScanner, DocumentScanningFlow } from 'capacitor-plugin-scanbot-sdk/ui_v2';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { setProjectFile } from '../components/commonfunction';

const HomePage = () => {
    const router = useIonRouter();
    const [showLoading, setShowLoading] = useState(false);
    const [scannedDocs, setScannedDocs] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState();
    const [scannedImageUri, setScannedImageUri] = useState();
    const [errorShow, setErrorShow] = useState<any>();

    const takePhoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            quality: 100,
        });
        debugger
        setShowLoading(true);
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);

        const imageMimeType = photo.format === 'jpeg' ? 'image/jpeg' : 'image/png';

        const base64Data = photo.base64String!;
        const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        let embeddedImage;
        if (imageMimeType === 'image/jpeg') {
            embeddedImage = await pdfDoc.embedJpg(byteArray);
        } else {
            embeddedImage = await pdfDoc.embedPng(byteArray);
        }

        const { width, height } = embeddedImage.scale(0.5);
        page.drawImage(embeddedImage, {
            x: 50,
            y: 700,
            width,
            height,
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        debugger
        const formData = new FormData();
        debugger
        formData.append('pdf_file', pdfBlob, 'photo.pdf');

        fetch('https://prthm11-scratch-vision-game.hf.space/process_pdf', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log("data", data)
                localStorage.setItem("project", data?.test_url);
                Preferences.set({ key: 'project', value: data?.test_url })
                setProjectFile(data?.test_url)
                setShowLoading(false);
                router.push('/editor', 'root')
            })
            .catch(error => {
                console.error("Error processing PDF:", error);
                setShowLoading(false);
            });
    };

    const scanDocument = async () => {
        const { scannedImages } = await DocumentScanner.scanDocument({
            maxNumDocuments: 1
        })
        console.log("scannedImages", scannedImages)
        setAlertMessage(scannedImages)
        if (scannedImages && scannedImages?.length > 0) {
            setShowLoading(true);
            try {
                const displayUri = Capacitor.convertFileSrc(scannedImages[0]);
                setScannedImageUri(displayUri);

                const pdfDoc = await PDFDocument.create();

                // for (const imageUri of scannedImages) {
                //     const response = await fetch(Capacitor.convertFileSrc(imageUri));
                //     const imageBlob = await response.blob();
                //     const imageArrayBuffer = await imageBlob.arrayBuffer();

                //     const imageMimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

                //     let embeddedImage;
                //     if (imageMimeType === 'image/jpeg') {
                //         embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
                //     } else {
                //         embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
                //     }

                //     const page = pdfDoc.addPage([595, 842]);
                //     const { width, height } = embeddedImage.scale(0.5);

                //     page.drawImage(embeddedImage, {
                //         x: 50,
                //         y: 700,
                //         width,
                //         height,
                //     });
                // }

                for (const imageUri of scannedImages) {
                    // Fetch image data
                    const response = await fetch(Capacitor.convertFileSrc(imageUri));
                    const imageBlob = await response.blob();
                    const imageArrayBuffer = await imageBlob.arrayBuffer();

                    // Determine image type (assume jpeg unless png)
                    const imageMimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

                    let embeddedImage;
                    if (imageMimeType === 'image/jpeg') {
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
                const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

                const formData = new FormData();
                debugger
                formData.append('pdf_file', pdfBlob, 'scanned_document.pdf');

                const response = await fetch('https://prthm11-scratch-vision-game.hf.space/process_pdf', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                localStorage.setItem('project', data?.test_url);
                Preferences.set({ key: 'project', value: data?.test_url })
                setProjectFile(data?.test_url)
                setShowLoading(false);
                router.push('/editor', 'root');
            } catch (e) {
                setErrorShow(e)
            }
        }
    }

    // async function startDocumentScanner() {
    //     const configuration: any = new DocumentScanningFlow();
    //     try {
    //         const result: any = await startDocumentScanner(configuration);
    //         if (result.status === 'OK') {
    //             result.data.pages.forEach(page => console.log(page.documentImageURI));
    //         }
    //     } catch (e) {
    //         console.error("Scan failed:", e.message);
    //     }
    // }

    // async function startDocumentScanner() {
    //     try {
    //         const result: any = await startDocumentScanner();
    //         if (result.status === 'OK') {
    //             result.data.pages.forEach(page => console.log(page.documentImageURI));
    //         }
    //     } catch (e: any) {
    //         console.error("Scan failed:", e.message);
    //     }
    // }

    return (
        <>
            {scannedImageUri && (
                <img
                    src={scannedImageUri}
                    alt="Scanned"
                    style={{ width: '100%', maxWidth: 400, margin: '20px 0', border: '1px solid #ccc' }}
                />
            )}
            <IonButton
                expand="block"
                onClick={scanDocument}
                disabled={isLoading}
                className="ion-margin-bottom"
            >
                Scan Document (ML Kit)
            </IonButton>
            <IonButton onClick={startDocumentScanner}>Start Document Scanner</IonButton>
            <Button variant="contained" onClick={takePhoto}>Take Photo</Button>
            <div id="scannedImage"></div>
            {/* <p>{alertMessage}</p>
                <p>{errorShow}</p> */}

            <IonLoading
                isOpen={showLoading}
                onDidDismiss={() => setShowLoading(false)}
                message={'Please wait...'}
                spinner="circles"
            />
        </>
    )
}

export default HomePage;