import { Capacitor } from '@capacitor/core';
import { ScreenRecorder } from '@capgo/capacitor-screen-recorder';

export interface ScreenRecordingResult {
  success: boolean;
  videoUri?: string;
  error?: string;
}

export class CapgoScreenRecordingHelper {
  private static isRecording = false;

  /**
   * Check if screen recording is supported on this platform
   */
  static isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Check if currently recording
   */
  static getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Start screen recording using @capgo/capacitor-screen-recorder
   */
  static async startRecording(): Promise<ScreenRecordingResult> {
    try {
      if (!this.isSupported()) {
        return {
          success: false,
          error: 'Screen recording is only available on native platforms'
        };
      }

      if (this.isRecording) {
        return {
          success: false,
          error: 'Recording is already in progress'
        };
      }

      console.log('Starting screen recording with @capgo plugin...');
      await ScreenRecorder.start();
      
      this.isRecording = true;
      console.log('Screen recording started successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error starting screen recording:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while starting recording'
      };
    }
  }

  /**
   * Stop screen recording using @capgo/capacitor-screen-recorder
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
      await ScreenRecorder.stop();
      
      this.isRecording = false;
      
      console.log('Screen recording stopped successfully');
      return {
        success: true,
        videoUri: 'Check device gallery for recorded video'
      };
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
   * Reset recording state (useful for cleanup)
   */
  static resetRecordingState(): void {
    this.isRecording = false;
  }
}