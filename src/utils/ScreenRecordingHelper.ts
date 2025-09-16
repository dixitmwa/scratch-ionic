import { Capacitor } from '@capacitor/core';
import { ScreenRecorder } from '../../screenrecorder/src';
// Fallback option:
// import { ScreenRecorder } from '@capgo/capacitor-screen-recorder';

export interface ScreenRecordingResult {
  success: boolean;
  videoUri?: string;
  error?: string;
}

export class ScreenRecordingHelper {
  private static isRecording = false;

  /**
   * Check if screen recording is supported on this platform
   */
  static isSupported(): boolean {
    const isNative = Capacitor.isNativePlatform();
    console.log('ScreenRecordingHelper.isSupported:', isNative);
    return isNative;
  }

  /**
   * Check if currently recording
   */
  static getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Start screen recording using custom plugin
   */
  static async startRecording(): Promise<ScreenRecordingResult> {
    try {
      console.log('ScreenRecordingHelper.startRecording called');
      
      if (!this.isSupported()) {
        console.log('Platform not supported for screen recording');
        return {
          success: false,
          error: 'Screen recording is only available on native platforms'
        };
      }

      if (this.isRecording) {
        console.log('Already recording, cannot start again');
        return {
          success: false,
          error: 'Recording is already in progress'
        };
      }

      console.log('Starting screen recording...');
      const result = await ScreenRecorder.startRecording();
      console.log('ScreenRecorder.startRecording result:', result);
      
      if (result.success) {
        this.isRecording = true;
        console.log('Screen recording started successfully');
        return {
          success: true
        };
      } else {
        console.log('Failed to start recording - success was false');
        return {
          success: false,
          error: 'Failed to start recording'
        };
      }
    } catch (error: any) {
      console.error('Error starting screen recording:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while starting recording'
      };
    }
  }

  /**
   * Stop screen recording using custom plugin
   */
  static async stopRecording(): Promise<ScreenRecordingResult> {
    try {
      if (!this.isRecording) {
        return {
          success: false,
          error: 'No recording in progress'
        };
      }

      console.log('Stopping screen recording...');
      const result = await ScreenRecorder.stopRecording();

      this.isRecording = false;

      if (result.videoUri) {
        console.log('Screen recording stopped successfully. Video saved at:', result.videoUri);
        return {
          success: true,
          videoUri: result.videoUri
        };
      } else {
        return {
          success: false,
          error: 'Recording stopped but no video was returned'
        };
      }
    } catch (error: any) {
      console.error('Error stopping screen recording:', error);
      this.isRecording = false;
      return {
        success: false,
        error: error.message || 'Unknown error occurred while stopping recording'
      };
    }
  }

  /**
   * Alternative implementation using @capgo/capacitor-screen-recorder
   * Switch to this if custom plugin doesn't work
   */
  static async startRecordingAlternative(): Promise<ScreenRecordingResult> {
    try {
      // Uncomment and use if switching to @capgo plugin:
      // import { ScreenRecorder } from '@capgo/capacitor-screen-recorder';
      // const result = await ScreenRecorder.start();
      // this.isRecording = true;
      // return { success: true };
      
      return {
        success: false,
        error: 'Alternative implementation not enabled'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Alternative implementation failed'
      };
    }
  }

  static async stopRecordingAlternative(): Promise<ScreenRecordingResult> {
    try {
      // Uncomment and use if switching to @capgo plugin:
      // import { ScreenRecorder } from '@capgo/capacitor-screen-recorder';
      // const result = await ScreenRecorder.stop();
      // this.isRecording = false;
      // return { success: true, videoUri: result.videoUri };
      
      return {
        success: false,
        error: 'Alternative implementation not enabled'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Alternative implementation failed'
      };
    }
  }

  /**
   * Reset recording state (useful for cleanup)
   */
  static resetRecordingState(): void {
    this.isRecording = false;
  }
}