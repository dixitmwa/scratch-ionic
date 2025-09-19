import { IonIcon, isPlatform, useIonViewDidEnter, useIonViewWillEnter } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { ScratchProvider } from "../scratch/ScratchProvider";
import useScratchVm from "../scratch/useScratchVm";
import { Capacitor } from "@capacitor/core";
import { PDFDocument } from "pdf-lib";
import { DocumentScanner } from "capacitor-document-scanner";
import { Preferences } from "@capacitor/preferences";
import { Button } from "@mui/material";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useHistory } from "react-router";
import ScannerSvg from "../assets/scanner.svg";
import { informationCircleOutline } from "ionicons/icons";
import CustomButton from "../components/common-component/Button";
import InfoScanner from "../assets/info_scanner.svg"
import { useSection } from "../context/SectionContext";

export default function EditorPage() {
  const history = useHistory();
  const { setProjectId } = useSection();
  const vm = useScratchVm();
  const containerRef = useRef(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorShow, setErrorShow] = useState<boolean>(false);

  console.log(isStudent)

  const takePhoto = async () => {
    setProjectId("");
    // history.push("/tabs/scratch-editor");
    // return
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100,
    });
    debugger;
    setLoading(true);
    // setShowLoading(true);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const imageMimeType = photo.format === "jpeg" ? "image/jpeg" : "image/png";

    const base64Data = photo.base64String!;
    const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    let embeddedImage;
    if (imageMimeType === "image/jpeg") {
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
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    debugger;
    const formData = new FormData();
    debugger;
    formData.append("pdf_file", pdfBlob, "photo.pdf");

    fetch("https://prthm11-scratch-vision-game.hf.space/process_pdf", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data?.isError) {
          setLoading(false);
          setErrorMsg("Your file is corrupted, please retry!");
        } else {
          localStorage.setItem("project", data?.test_url);
          Preferences.set({ key: "project", value: data?.test_url });
          setImageUploaded(true);
          setLoading(false);
          history.push("/tabs/scratch-editor");
        }
      })
      .catch((error) => {
        setLoading(false);
        setErrorMsg("Your file is corrupted, please retry!");
        console.error("Error processing PDF:", error);
      });
  };

  const scanDocument = async () => {
    setProjectId("");
    // setLoading(true);
    localStorage.removeItem("project");
    await Preferences.remove({ key: "project" });
    // history.push("/tabs/scratch-editor");
    // return
    const { scannedImages } = await DocumentScanner.scanDocument({
      maxNumDocuments: 5,
    });
    // setLoading(true);
    // debugger;
    console.log("scannedImages", scannedImages);
    // setAlertMessage(scannedImages)
    if (scannedImages && scannedImages?.length > 0) {
      setLoading(true);
      try {
        const displayUri = Capacitor.convertFileSrc(scannedImages[0]);
        // setScannedImageUri(displayUri);

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
        console.log("data", JSON.stringify(data));
        if (data?.isError) {
          setLoading(false);
          setImageUploaded(false);
          setErrorMsg(data?.message || "Your images is corrupted, please retry!");
          setErrorShow(true);
          return;
        }
        localStorage.setItem("project", data?.test_url);
        await Preferences.set({ key: "project", value: data?.test_url });
        // setProjectFile(data?.test_url)
        // setShowLoading(false);
        // router.push('/editor', 'root');
        history.push("/tabs/scratch-editor");
        setLoading(false);

        // ionRouter.push("/scratch-editor", "forward", "replace");
        setImageUploaded(true);
      } catch (e) {
        setLoading(false);
        // setErrorShow(e)
        console.log("eee", e);
      }
    }
  };

  const fetchUserType = async () => {
    const { value } = await Preferences.get({ key: "userType" })
    console.log("value------", value)
    if (value === "student") {
      setIsStudent(true)
    } else {
      setIsStudent(false)
    }
  }

  useIonViewDidEnter(() => {
    fetchUserType()
  })

  useEffect(() => {
    fetchUserType()
  }, [])

  return (
    <ScratchProvider>
      {/* <IonPage> */}
      <>
        {loading ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(75, 85, 99, 0.95)",
              zIndex: 9998,
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: "66px",
                textTransform: "uppercase",
                margin: 0,
                textAlign: "center",
              }}
            >
              Loading...
            </p>
          </div>
        ) : errorShow ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "rgba(75, 85, 99, 0.95)",
              zIndex: 9999,
            }}
          >
            <p style={{ fontWeight: 600, fontSize: "28px", marginBottom: 24, padding: "20px", textAlign: "center" }}>{errorMsg}</p>
            <CustomButton
              btnText="Back to Scan"
              background="#FF8D29"
              onClick={() => {
                setLoading(false);
                setErrorShow(false);
                setImageUploaded(false);
              }}
              style={{ width: "fit-content" }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              flexGrow: 1,
              height: isPlatform('ios') ? "79vh" : "85vh",
              maxHeight: isPlatform('ios') ? "79vh" : "85vh",
              maxWidth: "366px",
              margin: "0 auto",
              width: "100%",
              marginTop: "6vh",
              overflowY: "scroll",
            }}
          >
            {/* <CommonCard style={{ padding: "20px", width: "100%", height: "78vh" }}> */}
            <p
              style={{
                fontSize: "24px",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#607E9C",
                textAlign: "center",
                marginTop: "0px"
              }}
            >
              Align the Corners to Scan
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                margin: "10px",
              }}
            >
              <img
                src={ScannerSvg}
                alt="scanner"
                style={{ maxHeight: "45vh" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                margin: "10px",
              }}
            >
              <IonIcon
                icon={InfoScanner}
                style={{ fontSize: "45px", color: "#607E9C" }}
              />
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#607E9C",
                  textTransform: "uppercase",
                }}
              >
                Place all 4 corner dots within the frame for accurate
                scanning.
              </p>
            </div>
            <CustomButton
              btnText="START SCANNING"
              background="#FF8D29"
              onClick={scanDocument}
            />
            {
              !isStudent && (
                <CustomButton
                  btnText="My Library"
                  background="#D929FF"
                  style={{ marginTop: "10px" }}
                  onClick={() => history.push("/tabs/editor/my-library")}
                />
              )
            }
            <Button variant="contained" onClick={takePhoto} sx={{ mt: 2 }}>
              Take Photo
            </Button>
            {/* <IonButton
              expand="block"
              onClick={scanDocument}
              // disabled={isLoading}
              className="ion-margin-bottom"
            >
              Scan Document (ML Kit)
            </IonButton> */}
            {/* </CommonCard> */}
          </div>
        )}
      </>
      {/* </IonPage> */}
    </ScratchProvider>
  );
}
