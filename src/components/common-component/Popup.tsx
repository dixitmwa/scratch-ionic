import React, { useRef } from 'react';
import { IonModal } from '@ionic/react';
import '../../css/popup.css'

interface CommonPopupProps {
    children: React.ReactNode;
    modalRef?: React.RefObject<HTMLIonModalElement>;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const CommonPopup: React.FC<CommonPopupProps> = ({ children, modalRef ,isOpen, setIsOpen}) => {
    const internalRef = useRef<HTMLIonModalElement>(null);

    return (
        <IonModal id='custom-dialog' backdropDismiss={true} isOpen={isOpen} onDidDismiss={() => setIsOpen(false)} ref={modalRef ?? internalRef}
        >
            <div className="wrapper">
                {children}
            </div>
        </IonModal>
    );
};

export default CommonPopup;
