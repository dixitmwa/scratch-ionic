import React, { useRef } from 'react';
import { IonModal } from '@ionic/react';
import '../../css/popup.css'

interface CommonPopupProps {
    trigger: string;
    children: React.ReactNode;
    modalRef?: React.RefObject<HTMLIonModalElement>;
}

const CommonPopup: React.FC<CommonPopupProps> = ({ trigger, children, modalRef }) => {
    const internalRef = useRef<HTMLIonModalElement>(null);

    return (
        <IonModal id="common-popup" ref={modalRef ?? internalRef} trigger={trigger}>
            <div className="wrapper">
                {children}
            </div>
        </IonModal>
    );
};

export default CommonPopup;
