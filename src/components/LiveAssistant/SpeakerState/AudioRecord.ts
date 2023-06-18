function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

export class AudioRecorder {
    private recorder;
    private mediaStream;
  
    private constructor(recorder: MediaRecorder, mediaStream: MediaStream) {
      this.recorder = recorder;
      this.mediaStream = mediaStream;
    }
  
    static async create(): Promise<AudioRecorder> {
      const mediaOptions = { video: false, audio: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaOptions);
      const recorder = new MediaRecorder(mediaStream);
      return new AudioRecorder(recorder, mediaStream);
    }
  
    async stopRecording() {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  
    record(length: number): Promise<Blob> {
      return new Promise(async (resolve: (blob: Blob) => void, _) => {
        this.recorder.ondataavailable = (blobEvent) => {
          resolve(blobEvent.data);
        };
  
        if (this.recorder.state !== "recording") this.recorder.start();
        await sleep(length);
        if (this.recorder.state === "recording") this.recorder.stop();
      });
    }
}

export function blobToBase64(blob: Blob) {
    return new Promise((resolve: (value: string) => void, _) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        }
      };
      reader.readAsDataURL(blob);
    });
  }