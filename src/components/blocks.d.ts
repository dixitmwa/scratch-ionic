import { VirtualMachine } from 'scratch-vm';

declare module './blocks' {
    interface ScratchBlocks {
        Colours: {
            sounds: any;
            looks: any;
            motion: any;
            sensing: any;
            control: any;
            event: any;
        };
        Msg: any;
        Blocks: any;
        recordSoundCallback: string;
        ScratchMsgs: {
            translate: (key: string, defaultMsg: string) => string;
        };
        // Add other necessary ScratchBlocks properties as needed
    }

    const blocks: (vm: VirtualMachine, useCatBlocks: boolean) => ScratchBlocks;
    export default blocks;
}
