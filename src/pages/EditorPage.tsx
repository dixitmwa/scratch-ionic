import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent
} from '@ionic/react';
import { useState } from 'react';
import { ScratchProvider } from '../scratch/ScratchProvider';
import useScratchVm from '../scratch/useScratchVm';
import DroppableWorkspaceWrapper from '../components/DroppableWorkspaceWrapper';
import SafeAreaView from '../theme/SafeAreaView';

export default function EditorPage() {
  const vm = useScratchVm();
  const [dirty, setDirty] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Scratch Vision</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className='ion-padding'>
        <SafeAreaView>
          <ScratchProvider>
            {/* <ScratchFileUploaderV1
            vm={vm}
            projectChanged={dirty}
            projectOwner="alice"
            currentUser="alice"
            onProjectLoaded={() => setDirty(false)}
          /> */}
            <DroppableWorkspaceWrapper />
          </ScratchProvider>
        </SafeAreaView>
        {/* <div style={{ height: '70vh' }}>
          <ScratchWorkspace />
        </div> */}
      </IonContent>
    </IonPage>
  );
}
