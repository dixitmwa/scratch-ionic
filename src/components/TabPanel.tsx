import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import VM from 'scratch-vm';
import TargetPaneComponent from '../components/target-pane/target-pane.jsx';
import DragConstants from '../lib/drag-constants';
import { BLOCKS_DEFAULT_SCALE, STAGE_DISPLAY_SIZES } from '../lib/layout-constants'

// Include any utility files as needed (import statements here...)

function TargetPane({ vm, spriteLibraryContent, emptySprite, sharedMessages, randomizeSpritePosition, handleFileUpload, spriteUpload, downloadBlob, fetchSprite, fetchCode, initialSprites, initialStage, isRtl, intl }: any) {
    // --- Replace all Redux state with useState or useEffect here ---
    const [editingTarget, setEditingTarget] = useState(null);
    const [hoveredTarget, setHoveredTarget] = useState({});
    const [spriteLibraryVisible, setSpriteLibraryVisible] = useState(false);
    const [sprites, setSprites] = useState(initialSprites);
    const [stage, setStage] = useState(initialStage);
    const [raiseSprites, setRaiseSprites] = useState(false);
    const [workspaceMetrics, setWorkspaceMetrics] = useState({});
    const [importing, setImporting] = useState(false);
    // Files and refs
    const fileInputRef = useRef(null);

    // Side effect for block drag event
    useEffect(() => {
        if (!vm) return;
        const handleBlockDragEnd = (blocks) => {
            if (hoveredTarget?.sprite && hoveredTarget.sprite !== editingTarget) {
                shareBlocks(blocks, hoveredTarget.sprite, editingTarget);
                // If you have a "received blocks" state, set here:
                // setReceivedBlocks(true);
            }
        };
        vm.addListener('BLOCK_DRAG_END', handleBlockDragEnd);
        return () => vm.removeListener('BLOCK_DRAG_END', handleBlockDragEnd);
    }, [vm, hoveredTarget, editingTarget]);

    // Local logic for all actions -- no Redux dispatch!
    const handleActivateBlocksTab = useCallback(() => {
        // Implement according to your tab logic
    }, []);

    const handleChangeSpriteDirection = (dir) => vm.postSpriteInfo({ direction: dir });
    const handleChangeSpriteRotationStyle = (style) => vm.postSpriteInfo({ rotationStyle: style });
    const handleChangeSpriteName = (name) => vm.renameSprite(editingTarget, name);
    const handleChangeSpriteSize = (size) => vm.postSpriteInfo({ size });
    const handleChangeSpriteVisibility = (visible) => vm.postSpriteInfo({ visible });
    const handleChangeSpriteX = (x) => vm.postSpriteInfo({ x });
    const handleChangeSpriteY = (y) => vm.postSpriteInfo({ y });

    const handleDeleteSprite = (id) => {
        vm.deleteSprite(id);
        // If you need to support restore, manage a local deletedSprites array and undo logic here.
    };
    const handleDuplicateSprite = (id) => vm.duplicateSprite(id);

    const handleExportSprite = (id) => {
        const spriteName = vm.runtime.getTargetById(id).getName();
        vm.exportSprite(id).then(content => {
            downloadBlob(`${spriteName}.sprite3`, content);
        });
    };

    const handleSelectSprite = (id) => {
        setEditingTarget(id);
        vm.setEditingTarget(id);
        // "highlight" logic if needed
    };

    const handleSurpriseSpriteClick = () => {
        const surpriseSprites = spriteLibraryContent.filter(sprite =>
            (sprite.tags.indexOf('letters') === -1) && (sprite.tags.indexOf('numbers') === -1)
        );
        const item = surpriseSprites[Math.floor(Math.random() * surpriseSprites.length)];
        randomizeSpritePosition(item);
        vm.addSprite(JSON.stringify(item)).then(handleActivateBlocksTab);
    };

    const handlePaintSpriteClick = () => {
        const formatMessage = intl.formatMessage;
        const emptyItem = emptySprite(
            formatMessage(sharedMessages.sprite, { index: 1 }),
            formatMessage(sharedMessages.pop),
            formatMessage(sharedMessages.costume, { index: 1 })
        );
        vm.addSprite(JSON.stringify(emptyItem)).then(() => {
            setTimeout(handleActivateBlocksTab, 0);
            // Optionally switch to costumes tab here
        });
    };

    const handleNewSprite = (spriteJSONString) => {
        return vm.addSprite(spriteJSONString).then(handleActivateBlocksTab);
    };

    const handleFileUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleSpriteUpload = (e) => {
        const storage = vm.runtime.storage;
        setImporting(true);
        handleFileUpload(
            e.target,
            (buffer, fileType, fileName, fileIndex, fileCount) => {
                spriteUpload(buffer, fileType, fileName, storage, newSprite => {
                    handleNewSprite(newSprite)
                        .then(() => {
                            if (fileIndex === fileCount - 1) setImporting(false);
                        })
                        .catch(() => setImporting(false));
                }, () => setImporting(false));
            },
            () => setImporting(false)
        );
    };

    const shareBlocks = (blocks, targetId, optFromTargetId) => {
        const topBlock = blocks.find(block => block.topLevel);
        let metrics = workspaceMetrics.targets?.[targetId] ?? {
            scrollX: 0, scrollY: 0, scale: BLOCKS_DEFAULT_SCALE
        };
        if (topBlock) {
            const { scrollX, scrollY, scale } = metrics;
            const posY = -scrollY + 30;
            let posX = isRtl ? scrollX + 30 : -scrollX + 30;
            topBlock.x = posX / scale;
            topBlock.y = posY / scale;
        }
        return vm.shareBlocksToTarget(blocks, targetId, optFromTargetId);
    };

    const handleDrop = (dragInfo) => {
        const { sprite: targetId } = hoveredTarget || {};
        if (dragInfo.dragType === DragConstants.SPRITE) {
            vm.reorderTarget(dragInfo.index + 1, dragInfo.newIndex + 1);
        } else if (dragInfo.dragType === DragConstants.BACKPACK_SPRITE) {
            fetchSprite(dragInfo.payload.bodyUrl)
                .then(sprite3Zip => vm.addSprite(sprite3Zip));
        } else if (targetId) {
            if (dragInfo.dragType === DragConstants.COSTUME) {
                vm.shareCostumeToTarget(dragInfo.index, targetId);
            } else if (dragInfo.dragType === DragConstants.SOUND) {
                vm.shareSoundToTarget(dragInfo.index, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_COSTUME) {
                vm.addCostume(dragInfo.payload.body, { name: dragInfo.payload.name }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_SOUND) {
                vm.addSound({ md5: dragInfo.payload.body, name: dragInfo.payload.name }, targetId);
            } else if (dragInfo.dragType === DragConstants.BACKPACK_CODE) {
                fetchCode(dragInfo.payload.bodyUrl)
                    .then(blocks => shareBlocks(blocks, targetId))
                    .then(() => vm.refreshWorkspace());
            }
        }
    };

    // Control library modal
    const onNewSpriteClick = () => setSpriteLibraryVisible(true);
    const onRequestCloseSpriteLibrary = () => setSpriteLibraryVisible(false);

    // Render presentational component using local state
    return (
        <TargetPaneComponent
            editingTarget={editingTarget}
            fileInputRef={elem => { fileInputRef.current = elem; }}
            hoveredTarget={hoveredTarget}
            raiseSprites={raiseSprites}
            spriteLibraryVisible={spriteLibraryVisible}
            sprites={sprites}
            stage={stage}
            stageSize={Object.keys(STAGE_DISPLAY_SIZES)[0]} // or provide as prop
            vm={vm}
            onActivateBlocksTab={handleActivateBlocksTab}
            onChangeSpriteDirection={handleChangeSpriteDirection}
            onChangeSpriteName={handleChangeSpriteName}
            onChangeSpriteRotationStyle={handleChangeSpriteRotationStyle}
            onChangeSpriteSize={handleChangeSpriteSize}
            onChangeSpriteVisibility={handleChangeSpriteVisibility}
            onChangeSpriteX={handleChangeSpriteX}
            onChangeSpriteY={handleChangeSpriteY}
            onDeleteSprite={handleDeleteSprite}
            onDrop={handleDrop}
            onDuplicateSprite={handleDuplicateSprite}
            onExportSprite={handleExportSprite}
            onFileUploadClick={handleFileUploadClick}
            onNewSpriteClick={onNewSpriteClick}
            onPaintSpriteClick={handlePaintSpriteClick}
            onRequestCloseSpriteLibrary={onRequestCloseSpriteLibrary}
            onSelectSprite={handleSelectSprite}
            onSpriteUpload={handleSpriteUpload}
            onSurpriseSpriteClick={handleSurpriseSpriteClick}
        />
    );
}

TargetPane.propTypes = {
    vm: PropTypes.instanceOf(VM),
    spriteLibraryContent: PropTypes.array,
    emptySprite: PropTypes.func,
    sharedMessages: PropTypes.object,
    randomizeSpritePosition: PropTypes.func,
    handleFileUpload: PropTypes.func,
    spriteUpload: PropTypes.func,
    downloadBlob: PropTypes.func,
    fetchSprite: PropTypes.func,
    fetchCode: PropTypes.func,
    initialSprites: PropTypes.object,
    initialStage: PropTypes.object,
    isRtl: PropTypes.bool,
    intl: PropTypes.object.isRequired,
};

export default TargetPane;
