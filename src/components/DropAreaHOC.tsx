// DropAreaHOC.tsx
import React, { useState, useEffect, useRef } from 'react';

export default function DropAreaHOC(WrappedComponent: any) {
    return function DropAreaWrapper(props: any) {
        const [dragOver, setDragOver] = useState(false);
        const ref: any = useRef(null);

        useEffect(() => {
            const handleDragOver = (e: any) => {
                if (ref.current && ref.current.contains(e.target)) {
                    e.preventDefault();
                    setDragOver(true);
                }
            };

            const handleDragLeave = (e: any) => {
                if (ref.current && !ref.current.contains(e.relatedTarget)) {
                    setDragOver(false);
                }
            };

            const handleDrop = (e: any) => {
                e.preventDefault();
                setDragOver(false);
                if (props.onDrop) props.onDrop(e);
            };

            const node: any = ref.current;
            if (node) {
                node.addEventListener('dragover', handleDragOver);
                node.addEventListener('dragleave', handleDragLeave);
                node.addEventListener('drop', handleDrop);
            }

            return () => {
                if (node) {
                    node.removeEventListener('dragover', handleDragOver);
                    node.removeEventListener('dragleave', handleDragLeave);
                    node.removeEventListener('drop', handleDrop);
                }
            };
        }, [props]);

        return (
            <WrappedComponent
                {...props}
                containerRef={ref}
                dragOver={dragOver}
            />
        );
    };
}
