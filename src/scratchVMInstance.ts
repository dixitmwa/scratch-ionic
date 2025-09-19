import VM from 'scratch-vm';
import AudioEngine from 'scratch-audio';
import RenderWebGL from 'scratch-render';
import { BitmapAdapter as V2BitmapAdapter } from 'scratch-svg-renderer';
import { ScratchStorage } from 'scratch-storage';
import { getLastSavedProjectData } from './components/commonfunction';

let renderer: RenderWebGL | null = null;
let playgroundRenderer: RenderWebGL | null = null;
let uploadedProjectBuffer: Uint8Array | null = null; // 🟡 NEW

const vm = new VM();
const vmPlayGround = new VM();

const audioEngine = new AudioEngine();
const storage = new ScratchStorage();
const bitmapAdapter = new V2BitmapAdapter();

vm.attachAudioEngine(audioEngine);
vm.attachStorage(storage);
vm.attachV2BitmapAdapter(bitmapAdapter);

vm.setCompatibilityMode(true);
vm.setTurboMode(false);
vm.start();

vmPlayGround.attachAudioEngine(audioEngine);
vmPlayGround.attachStorage(storage);
vmPlayGround.attachV2BitmapAdapter(bitmapAdapter);

vmPlayGround.setCompatibilityMode(true);
vmPlayGround.setTurboMode(false);
vmPlayGround.start();

export function getVMInstance() {
    return vm;
}

export function getPlaygroundVMInstance() {
    return vmPlayGround;
}

// Only one renderer allowed at a time
export function attachRendererIfNone(canvas: HTMLCanvasElement) {
    if (renderer) return renderer;

    renderer = new RenderWebGL(canvas);
    vm.attachRenderer(renderer);
    return renderer;
}

export function attachPlaygroundRendererIfNone(canvas: HTMLCanvasElement) {
    if (playgroundRenderer) return playgroundRenderer;

    playgroundRenderer = new RenderWebGL(canvas);
    vmPlayGround.attachRenderer(playgroundRenderer);
    return playgroundRenderer;
}

export function disposeRenderer() {
    if (renderer && typeof (renderer as any).dispose === 'function') {
        (renderer as any).dispose();
    }
    renderer = null;
}

export function setUploadedProjectBuffer(buffer: Uint8Array) {
    uploadedProjectBuffer = buffer;
}

console.log("buffer", uploadedProjectBuffer)

// 🟡 NEW: Get uploaded project buffer
export function getUploadedProjectBuffer(): Uint8Array | null {
    return uploadedProjectBuffer;
}

export async function getProjectBuffer(): Promise<any> {
    // return vm.saveProjectSb3();
    return lastSavedProject!;
}

let lastSavedProject: ArrayBuffer | null = null;

export async function saveCurrentProjectBuffer() {
    try {
        const vm = getVMInstance();
        const blob = await vm.saveProjectSb3();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        lastSavedProject = arrayBuffer
        // Convert Uint8Array to base64
        const base64 = uint8ToBase64(uint8Array);
        // localStorage.setItem("lastSavedProject", base64);
        console.log("Project saved to localStorage");
    } catch (error) {
        console.error("Error saving project buffer:", error);
    }
}

function uint8ToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize) as any);
    }
    return btoa(binary);
}

export async function getSavedProjectBuffer(): Uint8Array | null {
    // const base64 = localStorage.getItem("lastSavedProject");
    const base64 = await getLastSavedProjectData()
    if (!base64) return null;

    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
}