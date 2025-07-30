import {
    IonButton,
    IonIcon,
    IonLoading,
    IonAlert,
    IonToast
} from '@ionic/react';
import { cloudUploadOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import VM from 'scratch-vm';

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface Props {
    /** Scratch‑VM instance (shared via context or prop) */
    vm: VM;

    /** Has the current project been modified? (Unsaved changes flag) */
    projectChanged?: boolean;

    /** Username of the project owner (used for confirmation logic) */
    projectOwner?: string;

    /** Currently logged‑in username (optional) */
    currentUser?: string;

    /** Callback fired after successful load; receives project title */
    onProjectLoaded?: (title: string) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const ACCEPT = '.sb,.sb2,.sb3';

const ScratchFileUploaderV1: React.FC<Props> = ({
    vm,
    projectChanged = false,
    projectOwner,
    currentUser,
    onProjectLoaded
}) => {
    /* refs ---------------------------------------------------------------- */
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingFileRef = useRef<File | null>(null);

    /* local state --------------------------------------------------------- */
    const [busy, setBusy] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    /* helpers ------------------------------------------------------------- */
    const getTitleFromName = (name: string) => {
        const m = name.match(/^(.*)\.sb[23]?$/);
        return m ? m[1].substring(0, 100) : 'Scratch Project';
    };

    const shouldConfirmReplace = () => {
        const ownsProject = projectOwner && currentUser && projectOwner === currentUser;
        return ownsProject || projectChanged;
    };

    /* flow handlers ------------------------------------------------------- */
    const triggerPick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const file = evt.target.files?.[0];
        if (!file) return;
        pendingFileRef.current = file;

        // decide whether to confirm
        if (shouldConfirmReplace()) {
            setConfirmOpen(true);
        } else {
            loadPendingFile();
        }

        // reset input so selecting same file twice works
        evt.target.value = '';
    };

    const loadPendingFile = () => {
        const file = pendingFileRef.current;
        if (!file) return;

        setBusy(true);
        const reader = new FileReader();
        reader.onload = () => {
            vm.loadProject(reader.result as ArrayBuffer)
                .then(() => {
                    const title = getTitleFromName(file.name);
                    onProjectLoaded?.(title);
                    document.title = title; // optional
                })
                .catch((err: any) => {
                    console.error(err);
                    setToast('Failed to load project file.');
                })
                .finally(() => {
                    pendingFileRef.current = null;
                    setBusy(false);
                });
        };
        reader.readAsArrayBuffer(file);
    };

    /* render -------------------------------------------------------------- */
    return (
        <>
            {/* MAIN BUTTON */}
            <IonButton
                expand="block"
                color="primary"
                disabled={busy}
                onClick={triggerPick}
            >
                <IonIcon icon={cloudUploadOutline} slot="start" />
                {busy ? 'Loading…' : 'Load .sb3 File'}
            </IonButton>

            {/* HIDDEN NATIVE FILE INPUT */}
            <input
                type="file"
                accept={ACCEPT}
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {/* IONIC LOADING OVERLAY */}
            <IonLoading
                isOpen={busy}
                message="Loading project…"
                spinner="crescent"
                backdropDismiss={false}
            />

            {/* CONFIRM REPLACE ALERT */}
            <IonAlert
                isOpen={confirmOpen}
                header="Replace current project?"
                message="Opening a new project will replace the one currently in the editor. Continue?"
                buttons={[
                    { text: 'Cancel', role: 'cancel', handler: () => setConfirmOpen(false) },
                    {
                        text: 'Replace', handler: () => {
                            setConfirmOpen(false);
                            loadPendingFile();
                        }
                    }
                ]}
                onDidDismiss={() => setConfirmOpen(false)}
            />

            {/* ERROR TOAST */}
            <IonToast
                isOpen={!!toast}
                message={toast || ''}
                duration={3000}
                color="danger"
                onDidDismiss={() => setToast(null)}
            />
        </>
    );
};

export default ScratchFileUploaderV1;
