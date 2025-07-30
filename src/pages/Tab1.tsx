import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import ScratchPlayer from '../ScratchPlayer';
const sb3Url = '../../public/cat_jumping.sb3';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" /> */}
        <ScratchPlayer />
        {/* <IonContent fullscreen>
          <iframe
            src="http://localhost:8601"
            title="Scratch Editor"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0,
            }}
          />
        </IonContent> */}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
