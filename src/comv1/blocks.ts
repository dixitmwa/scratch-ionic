/**
 * Connect scratch blocks with the vm
 * @param {VirtualMachine} vm - The scratch vm
 * @param {Bool} useCatBlocks - Whether to use cat blocks rendering of ScratchBlocks
 * @return {ScratchBlocks} ScratchBlocks connected with the vm
 */
import * as ScratchBlocks from 'scratch-blocks';
import { customSoundsData } from '../constant/Constant';
export default function (vm: any, useCatBlocks: any) {
    // Add idempotent init guard - return early if already initialized for this VM
    // const vmInstanceId = `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // if (vm._blocksInitialized) {
    //     console.log('[blocksInit] already initialized for VM instance:', vm._blocksInitialized);
    //     return vm._blocksInitialized;
    // }
    // vm._blocksInitialized = vmInstanceId;
    // console.log('[blocksInit] initializing custom blocks for VM instance:', vmInstanceId);
    // const ScratchBlocks = useCatBlocks ? require('cat-blocks') : require('scratch-blocks');
    const jsonForMenuBlock = function (name: string, menuOptionsFn: any, colors: { secondary: any; tertiary: any; quaternary: any; }, start: any[] | string[]) {
        return {
            message0: '%1',
            args0: [
                {
                    type: 'field_dropdown',
                    name: name,
                    options: function () {
                        // Ensure both start and menuOptionsFn return arrays of [label, value]
                        const startArr = Array.isArray(start) ? (start as any[]) : [];
                        const menuArr = menuOptionsFn() || [];
                        return startArr.concat(menuArr as any[]);
                    }
                }
            ],
            inputsInline: true,
            output: 'String',
            colour: colors.secondary,
            colourSecondary: colors.secondary,
            colourTertiary: colors.tertiary,
            colourQuaternary: colors.quaternary,
            outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND
        };
    };

    const jsonForHatBlockMenu = function (hatName: any, name: string, menuOptionsFn: { (): any; (): any; }, colors: { primary: any; secondary: any; tertiary: any; quaternary: any; }, start: string | any[]) {
        return {
            message0: hatName,
            args0: [
                {
                    type: 'field_dropdown',
                    name: name,
                    options: function () {
                        return start.concat(menuOptionsFn());
                    }
                }
            ],
            colour: colors.primary,
            colourSecondary: colors.secondary,
            colourTertiary: colors.tertiary,
            colourQuaternary: colors.quaternary,
            extensions: ['shape_hat']
        };
    };


    const jsonForSensingMenus = function (menuOptionsFn: { (): any[][]; (): any; }) {
        return {
            message0: ScratchBlocks.Msg.SENSING_OF,
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PROPERTY',
                    options: function () {
                        return menuOptionsFn();
                    }

                },
                {
                    type: 'input_value',
                    name: 'OBJECT'
                }
            ],
            output: true,
            colour: ScratchBlocks.Colours.sensing.primary,
            colourSecondary: ScratchBlocks.Colours.sensing.secondary,
            colourTertiary: ScratchBlocks.Colours.sensing.tertiary,
            colourQuaternary: ScratchBlocks.Colours.sensing.quaternary,
            outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND
        };
    };

    // Helper function to load and play custom audio files from assets
    // If waitUntilDone is true, returns a Promise that resolves when playback ends
    const recentPlays = new Map<string, number>();
    const activeAudios = new Map<string, HTMLAudioElement>();
    // Primitive-level debounce to avoid duplicate primitive invocations
    const recentPrimitiveCalls = new Map<string, number>();
    // Resolve a sound value (name, assetId or md5ext) to an assetId if available.
    const resolveSoundId = (soundValue: string): string | null => {
        if (!soundValue) return null;
        let soundsArr: any[] = [];
        if (vm && vm.editingTarget) {
            if (Array.isArray(vm.editingTarget.sounds) && vm.editingTarget.sounds.length > 0) {
                soundsArr = vm.editingTarget.sounds;
            } else if (vm.editingTarget.sprite && Array.isArray(vm.editingTarget.sprite.sounds)) {
                soundsArr = vm.editingTarget.sprite.sounds;
            }
        }
        // 1) match by name
        let found = soundsArr.find((s: any) => s.name === soundValue);
        if (found?.assetId) return found.assetId;
        // 2) match by assetId or md5ext
        found = soundsArr.find((s: any) => s.assetId === soundValue || s.md5ext === soundValue);
        if (found?.assetId) return found.assetId;
        // 3) fallback to customSoundsData
        const customSound = customSoundsData.find(([name, id]) => name === soundValue || id === soundValue);
        if (customSound?.[1]) return customSound[1];
        return null;
    };
    const playCustomSound = function (soundValue: string, waitUntilDone = false, callerId?: string) {
        console.log('Playing custom sound:', soundValue, 'callerId:', callerId);
        // Debounce: ignore duplicate requests for same sound+caller within 150ms
        try {
            const now = Date.now();
            const key = `${callerId || 'global'}:${soundValue}`;
            const last = recentPlays.get(key) || 0;
            if (now - last < 150) {
                console.log('[playCustomSound] debounced duplicate call for', key);
                if (waitUntilDone) return Promise.resolve();
                return;
            }
            recentPlays.set(key, now);
            recentPlays.set(soundValue, now);
        } catch (e) {
            // ignore debounce errors
        }
        let resolvedId = soundValue;
        let soundsArr: any[] = [];

        if (vm && vm.editingTarget) {
            if (Array.isArray(vm.editingTarget.sounds) && vm.editingTarget.sounds.length > 0) {
                soundsArr = vm.editingTarget.sounds;
            } else if (vm.editingTarget.sprite && Array.isArray(vm.editingTarget.sprite.sounds)) {
                soundsArr = vm.editingTarget.sprite.sounds;
            }
        }

        // Case 1: field is a sound *name*
        let found = soundsArr.find((s: any) => s.name === soundValue);
        if (found?.assetId) {
            resolvedId = found.assetId;
            console.log(`Mapped sound name '${soundValue}' → assetId '${resolvedId}'`);
        }

        // Case 2: field is an assetId or md5ext
        if (resolvedId === soundValue) {
            found = soundsArr.find((s: any) =>
                s.assetId === soundValue ||
                s.md5ext === soundValue
            );
            if (found?.assetId) {
                resolvedId = found.assetId;
                console.log(`Confirmed assetId '${resolvedId}' is valid`);
            }
        }

        // Case 3: fallback lookup in customSoundsData
        if (resolvedId === soundValue) {
            const customSound = customSoundsData.find(([name, id]) =>
                name === soundValue || id === soundValue
            );
            if (customSound?.[1]) {
                resolvedId = customSound[1];
                console.log(`Mapped custom sound '${soundValue}' → assetId '${resolvedId}'`);
            }
        }

        // Build URL and play
        const HUGGINGFACE_BASE =
            "https://huggingface.co/spaces/prthm11/Scratch_Vision_Game/resolve/main/blocks/sound/";
        const assetPath = `${HUGGINGFACE_BASE}${resolvedId}.wav`;
        // const assetPath = "http://prthm11-scratch-vision-game.hf.space/download_sound/1cb60ecdb1075c8769cb346d5c2a22c7"
        // const assetPath = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav";

        console.log("Resolved id is =", resolvedId)

        // Stop any currently playing instance of this sound
        const audioKey = `${callerId || 'global'}:${resolvedId}`;
        if (activeAudios.has(audioKey)) {
            const existingAudio = activeAudios.get(audioKey);
            if (existingAudio && !existingAudio.paused) {
                console.log('[playCustomSound] stopping existing audio for:', audioKey);
                existingAudio.pause();
                existingAudio.currentTime = 0;
            }
            activeAudios.delete(audioKey);
        }

        try {
            console.log('[playCustomSound] soundValue:', soundValue, '| resolvedId:', resolvedId, '| assetPath:', assetPath);
            const audio = new Audio(assetPath);
            audio.volume = 1;
            let played = false;

            // Track this audio instance
            activeAudios.set(audioKey, audio);

            // Clean up when audio ends or errors
            const cleanup = () => {
                if (activeAudios.get(audioKey) === audio) {
                    activeAudios.delete(audioKey);
                }
            };
            console.log("waitUntilDone", waitUntilDone)
            if (waitUntilDone) {
                // Return a Promise that resolves when playback ends
                return new Promise<void>((resolve, reject) => {
                    audio.addEventListener('canplaythrough', () => {
                        if (!played) {
                            played = true;
                            audio.play()
                                .then(() => console.log('Successfully played:', resolvedId))
                                .catch((err) => {
                                    console.error('[playCustomSound] Error playing custom sound:', err, '\nURL:', assetPath);
                                    // alert(`Failed to play sound.\nURL: ${assetPath}\nSound: ${soundValue}\nID: ${resolvedId}`);
                                    reject(err);
                                });
                        }
                    });
                    audio.addEventListener('error', (e) => {
                        console.error('[playCustomSound] Audio element error:', e, '\nURL:', assetPath, '\nresolvedId:', resolvedId, '\nsoundValue:', soundValue);
                        // alert(`Failed to load sound file.\nURL: ${assetPath}\nSound: ${soundValue}\nID: ${resolvedId}`);
                        cleanup();
                        reject(e);
                    });
                    audio.addEventListener('ended', () => {
                        console.log('Audio playback ended for:', resolvedId);
                        cleanup();
                        resolve();
                    });
                    // setTimeout(() => {
                    //     if (!played) {
                    //         played = true;
                    //         audio.play().catch(() => {});
                    //     }
                    // }, 8000);
                });
            } else {
                audio.addEventListener('canplaythrough', () => {
                    if (!played) {
                        played = true;
                        audio.play()
                            .then(() => console.log('Successfully played:', resolvedId))
                            .catch((err) => {
                                // console.error('[playCustomSound] Error playing custom sound:', err, '\nURL:', assetPath);
                                // alert(`Failed to play sound.\nURL: ${assetPath}\nSound: ${soundValue}\nID: ${resolvedId}`);
                            });
                    }
                });
                audio.addEventListener('error', (e) => {
                    console.error('[playCustomSound] Audio element error:', e, '\nURL:', assetPath, '\nresolvedId:', resolvedId, '\nsoundValue:', soundValue);
                    // alert(`Failed to load sound file.\nURL: ${assetPath}\nSound: ${soundValue}\nID: ${resolvedId}`);
                    cleanup();
                });
                audio.addEventListener('ended', () => {
                    console.log('Audio playback ended for:', resolvedId)
                    cleanup();
                    return;
                });
            }
        } catch (err) {
            console.error('[playCustomSound] Error creating audio element:', err, '\nURL:', assetPath);
            // alert(`Failed to create audio element.\nURL: ${assetPath}\nSound: ${soundValue}\nID: ${resolvedId}`);
            if (waitUntilDone) return Promise.reject(err);
        }
    };

    const soundsMenu = function () {
        let menu = [['', '']];
        // Add custom sound options from assets
        const customSounds = customSoundsData;

        if (vm.editingTarget) {
            // Try multiple paths to access sounds from VM
            let sounds = vm.editingTarget.sounds ||
                (vm.editingTarget.sprite && vm.editingTarget.sprite.sounds) ||
                [];

            console.log('soundsMenu: vm.editingTarget:', vm.editingTarget);
            console.log('soundsMenu: sounds found:', sounds);

            if (sounds.length > 0) {
                menu = customSounds;
            } else {
                menu = customSounds;
            }
        } else {
            menu = customSounds;
        }

        // Remove any existing 'record...' entries to avoid duplicates
        menu = menu.filter(([label, value]) => label !== 'record...' && value !== ScratchBlocks.recordSoundCallback);

        // Add a single 'record...' entry at the end
        menu.push([
            ScratchBlocks.ScratchMsgs.translate('SOUND_RECORD', 'record...'),
            ScratchBlocks.recordSoundCallback
        ]);
        console.log('soundsMenu: final menu:', menu);
        return menu;
    };

    const costumesMenu = function () {
        if (vm.editingTarget && vm.editingTarget.getCostumes().length > 0) {
            return vm.editingTarget.getCostumes().map((costume: { name: any; }) => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const backdropsMenu = function () {
        const next = ScratchBlocks.ScratchMsgs.translate('LOOKS_NEXTBACKDROP', 'next backdrop');
        const previous = ScratchBlocks.ScratchMsgs.translate('LOOKS_PREVIOUSBACKDROP', 'previous backdrop');
        const random = ScratchBlocks.ScratchMsgs.translate('LOOKS_RANDOMBACKDROP', 'random backdrop');
        if (vm.runtime.targets[0] && vm.runtime.targets[0].getCostumes().length > 0) {
            return vm.runtime.targets[0].getCostumes().map((costume: { name: any; }) => [costume.name, costume.name])
                .concat([[next, 'next backdrop'],
                [previous, 'previous backdrop'],
                [random, 'random backdrop']]);
        }
        return [['', '']];
    };

    const backdropNamesMenu = function () {
        const stage = vm.runtime.getTargetForStage();
        if (stage && stage.getCostumes().length > 0) {
            return stage.getCostumes().map((costume: { name: any; }) => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const spriteMenu = function () {
        const sprites = [];
        for (const targetId in vm.runtime.targets) {
            if (!Object.prototype.hasOwnProperty.call(vm.runtime.targets, targetId)) continue;
            if (vm.runtime.targets[targetId].isOriginal) {
                if (!vm.runtime.targets[targetId].isStage) {
                    if (vm.runtime.targets[targetId] === vm.editingTarget) {
                        continue;
                    }
                    sprites.push([vm.runtime.targets[targetId].sprite.name, vm.runtime.targets[targetId].sprite.name]);
                }
            }
        }
        return sprites;
    };

    const cloneMenu = function () {
        if (vm.editingTarget && vm.editingTarget.isStage) {
            const menu = spriteMenu();
            if (menu.length === 0) {
                return [['', '']]; // Empty menu matches Scratch 2 behavior
            }
            return menu;
        }
        const myself = ScratchBlocks.ScratchMsgs.translate('CONTROL_CREATECLONEOF_MYSELF', 'myself');
        return [[myself, '_myself_']].concat(spriteMenu());
    };

    const soundColors = ScratchBlocks.Colours.sounds;

    const looksColors = ScratchBlocks.Colours.looks;

    const motionColors = ScratchBlocks.Colours.motion;

    const sensingColors = ScratchBlocks.Colours.sensing;

    const controlColors = ScratchBlocks.Colours.control;

    const eventColors = ScratchBlocks.Colours.event;

    ScratchBlocks.Blocks.sound_sounds_menu.init = function () {
        const json = jsonForMenuBlock('SOUND_MENU', soundsMenu, soundColors, []);
        this.jsonInit(json);
    };

    // Override sound playing to handle custom sounds
    const originalSoundPlay = vm.runtime._primitives['sound_play'];
    vm.runtime._primitives['sound_play'] = function (args: any, util: any) {
        const soundName = args.SOUND_MENU;
        // Primitive-level debounce: ignore near-duplicate primitive calls (200ms)
        try {
            // Use a window-scoped map so debounce is shared across multiple VM instances
            const globalMapKey = '__scratch_recentPrimitiveCalls';
            const globalMap: Map<string, number> = (window as any)[globalMapKey] || new Map();
            if (!(window as any)[globalMapKey]) (window as any)[globalMapKey] = globalMap;
            // Resolve to assetId if possible so duplicates across VMs with same sound collapse
            const resolvedForDebounce = resolveSoundId(soundName) || soundName;
            const primitiveKey = `prim:${resolvedForDebounce}`;
            const nowP = Date.now();
            const last = globalMap.get(primitiveKey) || 0;
            if (nowP - last < 200) {
                console.log('[primitive sound_play] ignored duplicate primitive call (debounce global) for', primitiveKey);
                return;
            }
            globalMap.set(primitiveKey, nowP);
        } catch (e) {
            // ignore debounce errors
        }
        console.log('[primitive sound_play] called with:', {
            soundName,
            typeOfSoundName: typeof soundName,
            args,
            util,
        });

        // Prevent duplicate calls from different VM instances
        try {
            const callerTarget = util && util.target;
            if (callerTarget && callerTarget.runtime && vm && vm.runtime) {
                // More robust VM instance detection
                if (callerTarget.runtime !== vm.runtime) {
                    console.log('[primitive sound_play] ignored call from different VM runtime');
                    return;
                }
                // Additional check for different VM contexts
                if (callerTarget.runtime.constructor !== vm.runtime.constructor) {
                    console.log('[primitive sound_play] ignored call from different VM constructor');
                    return;
                }
            }
            console.log('[primitive sound_play] processing sound from VM instance:', callerTarget);
        } catch (e) {
            console.warn('[primitive sound_play] error in VM instance guard:', e);
        }

        try {
            const targetSounds = (vm && vm.editingTarget && (vm.editingTarget.sounds || (vm.editingTarget.sprite && vm.editingTarget.sprite.sounds))) || [];
            console.log('[primitive sound_play] vm.editingTarget.sounds:', targetSounds.map((s: any) => ({ name: s.name, assetId: s.assetId, md5ext: s.md5ext })));
        } catch (e) {
            console.warn('[primitive sound_play] failed to read editingTarget.sounds', e);
        }
        const callerId = util && util.target ? util.target.id : undefined;
        const resolved = resolveSoundId(soundName);
        if (resolved) {
            console.log('[primitive sound_play] handling custom sound, resolvedId=', resolved);
            const result = playCustomSound(soundName, false, callerId);
            if (result && typeof result.then === 'function') return result;
            return;
        }
        if (originalSoundPlay) {
            return originalSoundPlay.call(this, args, util);
        }
    };

    const originalSoundPlayUntilDone = vm.runtime._primitives['sound_playuntildone'];
    // vm.runtime._primitives['sound_playuntildone'] = function (args: any, util: any) {
    //     const soundName = args.SOUND_MENU;
    //     console.log('[primitive sound_playuntildone] called with:', {
    //         soundName,
    //         typeOfSoundName: typeof soundName,
    //         args,
    //         util
    //     });
    //     // Primitive-level global debounce for playUntildone to prevent near-simultaneous duplicates
    //     try {
    //         const globalMapKey = '__scratch_recentPrimitiveCalls';
    //         const globalMap: Map<string, number> = (window as any)[globalMapKey] || new Map();
    //         if (!(window as any)[globalMapKey]) (window as any)[globalMapKey] = globalMap;
    //         const resolvedForDebounce = resolveSoundId(soundName) || soundName;
    //         const primitiveKey = `prim:until:${resolvedForDebounce}`;
    //         const nowP = Date.now();
    //         const last = globalMap.get(primitiveKey) || 0;
    //         // use slightly larger window for until-done
    //         if (nowP - last < 300) {
    //             console.log('[primitive sound_playuntildone] ignored duplicate primitive call (debounce global) for', primitiveKey);
    //             return;
    //         }
    //         globalMap.set(primitiveKey, nowP);
    //     } catch (e) {
    //         // ignore debounce errors
    //     }

    //     // Prevent duplicate calls from different VM instances
    //     try {
    //         const callerTarget = util && util.target;
    //         if (callerTarget && callerTarget.runtime && vm && vm.runtime && callerTarget.runtime !== vm.runtime) {
    //             console.log('[primitive sound_playuntildone] ignored call from different VM instance (callerTarget.runtime !== vm.runtime)');
    //             return;
    //         }
    //     } catch (e) {
    //         // ignore errors in guard
    //     }

    //     try {
    //         const targetSounds = (vm && vm.editingTarget && (vm.editingTarget.sounds || (vm.editingTarget.sprite && vm.editingTarget.sprite.sounds))) || [];
    //         console.log('[primitive sound_playuntildone] vm.editingTarget.sounds:', targetSounds.map((s: any) => ({ name: s.name, assetId: s.assetId, md5ext: s.md5ext })));
    //     } catch (e) {
    //         console.warn('[primitive sound_playuntildone] failed to read editingTarget.sounds', e);
    //     }
    //     // If this primitive call comes from a different VM instance, ignore it.
    //     // try {
    //     //     const callerTarget = util && util.target;
    //     //     if (callerTarget && callerTarget.runtime && vm && vm.runtime && callerTarget.runtime !== vm.runtime) {
    //     //         console.log('[primitive sound_playuntildone] ignored call from different VM instance (callerTarget.id=', callerTarget.id, ')');
    //     //         return;
    //     //     }
    //     // } catch (e) {
    //     //     // ignore errors in guard
    //     // }
    //     const callerId = util && util.target ? util.target.id : undefined;
    //     console.log("Resolved id is ==", callerId, util, args);
    //     // If custom sound, play and wait here, then don't call original primitive
    //     const resolved = resolveSoundId(soundName);
    //     if (resolved) {
    //         console.log('[primitive sound_playuntildone] handling custom sound, resolvedId=', resolved);
    //         const result = playCustomSound(soundName, true, callerId);
    //         if (result && typeof result.then === 'function') return result;
    //         return;
    //     }
    //     // Otherwise use original primitive
    //     if (originalSoundPlayUntilDone) {
    //         return originalSoundPlayUntilDone.call(this, args, util);
    //     }
    // };

    vm.runtime._primitives['sound_playuntildone'] = function (args: any, util: any) {
        const soundName = args.SOUND_MENU;
        const callerId = util && util.target ? util.target.id : undefined;
        const resolved = resolveSoundId(soundName);

        if (resolved) {
            return playCustomSound(soundName, true, callerId);
        }

        if (originalSoundPlayUntilDone) {
            return originalSoundPlayUntilDone.call(this, args, util);
        }
    };

    ScratchBlocks.Blocks.looks_costume.init = function () {
        const json = jsonForMenuBlock('COSTUME', costumesMenu, looksColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.looks_backdrops.init = function () {
        const json = jsonForMenuBlock('BACKDROP', backdropsMenu, looksColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.event_whenbackdropswitchesto.init = function () {
        const json = jsonForHatBlockMenu(
            ScratchBlocks.Msg.EVENT_WHENBACKDROPSWITCHESTO,
            'BACKDROP', backdropNamesMenu, eventColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_pointtowards_menu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_POINTTOWARDS_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TOWARDS', spriteMenu, motionColors, [
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_goto_menu.init = function () {
        const random = ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_RANDOM', 'random position');
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TO', spriteMenu, motionColors, [
            [random, '_random_'],
            [mouse, '_mouse_']
        ]);
        +0
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.motion_glideto_menu.init = function () {
        const random = ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_RANDOM', 'random position');
        const mouse = ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('TO', spriteMenu, motionColors, [
            [random, '_random_'],
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_of_object_menu.init = function () {
        const stage = ScratchBlocks.ScratchMsgs.translate('SENSING_OF_STAGE', 'Stage');
        const json = jsonForMenuBlock('OBJECT', spriteMenu, sensingColors, [
            [stage, '_stage_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_of.init = function () {
        const blockId = this.id;
        const blockType = this.type;

        let defaultSensingOfBlock: any;
        const blocks = vm.runtime.flyoutBlocks._blocks;
        Object.keys(blocks).forEach(id => {
            const block = blocks[id];
            if (id === blockType || (block && block.opcode === blockType)) {
                defaultSensingOfBlock = block;
            }
        });

        const menuFn = function () {
            const stageOptions = [
                [ScratchBlocks.Msg.SENSING_OF_BACKDROPNUMBER, 'backdrop #'],
                [ScratchBlocks.Msg.SENSING_OF_BACKDROPNAME, 'backdrop name'],
                [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']
            ];
            const spriteOptions = [
                [ScratchBlocks.Msg.SENSING_OF_XPOSITION, 'x position'],
                [ScratchBlocks.Msg.SENSING_OF_YPOSITION, 'y position'],
                [ScratchBlocks.Msg.SENSING_OF_DIRECTION, 'direction'],
                [ScratchBlocks.Msg.SENSING_OF_COSTUMENUMBER, 'costume #'],
                [ScratchBlocks.Msg.SENSING_OF_COSTUMENAME, 'costume name'],
                [ScratchBlocks.Msg.SENSING_OF_SIZE, 'size'],
                [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']
            ];
            if (vm.editingTarget) {
                let lookupBlocks = vm.editingTarget.blocks;
                let sensingOfBlock = lookupBlocks.getBlock(blockId);

                if (!sensingOfBlock) {
                    sensingOfBlock = vm.runtime.flyoutBlocks.getBlock(blockId) || defaultSensingOfBlock;
                    if (!sensingOfBlock) {
                        return [['', '']];
                    }
                    lookupBlocks = vm.runtime.flyoutBlocks;
                }
                const sort = function (options: any[]) {
                    options.sort(ScratchBlocks.scratchBlocksUtils.compareStrings);
                };
                const stageVariableOptions = vm.runtime.getTargetForStage().getAllVariableNamesInScopeByType('');
                sort(stageVariableOptions);
                const stageVariableMenuItems = stageVariableOptions.map((variable: any) => [variable, variable]);
                if (sensingOfBlock.inputs.OBJECT.shadow !== sensingOfBlock.inputs.OBJECT.block) {
                    return stageOptions.concat(stageVariableMenuItems);
                }
                const menuBlock = lookupBlocks.getBlock(sensingOfBlock.inputs.OBJECT.shadow);
                const selectedItem = menuBlock.fields.OBJECT.value;
                if (selectedItem === '_stage_') {
                    return stageOptions.concat(stageVariableMenuItems);
                }
                const target = vm.runtime.getSpriteTargetByName(selectedItem);
                let spriteVariableOptions = [];
                if (target) {
                    spriteVariableOptions = target.getAllVariableNamesInScopeByType('', true);
                    sort(spriteVariableOptions);
                }
                const spriteVariableMenuItems = spriteVariableOptions.map((variable: any) => [variable, variable]);
                return spriteOptions.concat(spriteVariableMenuItems);
            }
            return [['', '']];
        };

        const json = jsonForSensingMenus(menuFn);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_distancetomenu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('SENSING_DISTANCETO_POINTER', 'mouse-pointer');
        const json = jsonForMenuBlock('DISTANCETOMENU', spriteMenu, sensingColors, [
            [mouse, '_mouse_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.sensing_touchingobjectmenu.init = function () {
        const mouse = ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_POINTER', 'mouse-pointer');
        const edge = ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_EDGE', 'edge');
        const json = jsonForMenuBlock('TOUCHINGOBJECTMENU', spriteMenu, sensingColors, [
            [mouse, '_mouse_'],
            [edge, '_edge_']
        ]);
        this.jsonInit(json);
    };

    ScratchBlocks.Blocks.control_create_clone_of_menu.init = function () {
        const json = jsonForMenuBlock('CLONE_OPTION', cloneMenu, controlColors, []);
        this.jsonInit(json);
    };

    ScratchBlocks.VerticalFlyout.getCheckboxState = function (blockId: string | number) {
        const monitorBlocks = vm.runtime && vm.runtime.monitorBlocks && vm.runtime.monitorBlocks._blocks;
        if (!monitorBlocks || typeof monitorBlocks !== 'object') return false;
        const monitoredBlock = monitorBlocks[blockId];
        return monitoredBlock ? monitoredBlock.isMonitored : false;
    };

    ScratchBlocks.FlyoutExtensionCategoryHeader.getExtensionState = function (extensionId: any) {
        if (vm.getPeripheralIsConnected(extensionId)) {
            return ScratchBlocks.StatusButtonState.READY;
        }
        return ScratchBlocks.StatusButtonState.NOT_READY;
    };

    ScratchBlocks.FieldNote.playNote_ = function (noteNum: any, extensionId: any) {
        vm.runtime.emit('PLAY_NOTE', noteNum, extensionId);
    };

    // Use a collator's compare instead of localeCompare which internally
    // creates a collator. Using this is a lot faster in browsers that create a
    // collator for every localeCompare call.
    const collator = new Intl.Collator([], {
        sensitivity: 'base',
        numeric: true
    });
    ScratchBlocks.scratchBlocksUtils.compareStrings = function (str1: string, str2: string) {
        return collator.compare(str1, str2);
    };

    // Blocks wants to know if 3D CSS transforms are supported. The cross
    // section of browsers Scratch supports and browsers that support 3D CSS
    // transforms will make the return always true.

    // Shortcutting to true lets us skip an expensive style recalculation when
    // first loading the Scratch editor.
    ScratchBlocks.utils.is3dSupported = function () {
        return true;
    };

    return ScratchBlocks;
}
