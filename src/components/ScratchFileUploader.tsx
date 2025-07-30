import {IonButton, IonIcon, IonLoading} from '@ionic/react';
import {cloudUploadOutline} from 'ionicons/icons';
import React, {useRef, useState} from 'react';
import useScratchVm from '../scratch/useScratchVm';

const ACCEPT = '.sb,.sb2,.sb3';

export default function ScratchFileUploader() {
  const vm               = useScratchVm();
  const inputRef         = useRef(null);
  const [busy, setBusy]  = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);

    const reader = new FileReader();
    reader.onload = () => {
      vm.loadProject(reader.result)
        .then(() => {
          const m = file.name.match(/^(.*)\.sb[23]?$/);
          if (m) document.title = m[1].slice(0, 100);
        })
        .catch((err) => alert('Failed to load project:\n' + err))
        .finally(() => setBusy(false));
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // let user choose same file again
  };

  return (
    <>
      <IonButton expand="block" color="primary" onClick={pickFile} disabled={busy}>
        <IonIcon icon={cloudUploadOutline} slot="start" />
        {busy ? 'Loading…' : 'Load .sb3 File'}
      </IonButton>

      <input
        type="file"
        accept={ACCEPT}
        ref={inputRef}
        style={{display:'none'}}
        onChange={handleChange}
      />

      <IonLoading isOpen={busy} message="Loading project…" backdropDismiss={false} />
    </>
  );
}
