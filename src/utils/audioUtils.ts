export async function playPCM(base64Data: string): Promise<void> {
  let audioCtx: AudioContext | null = null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Speech synthesis is not supported in this browser. Please use a modern browser like Chrome.");
    }
    
    audioCtx = new AudioContextClass({ sampleRate: 24000 });
    
    if (audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch (e) {
        throw new Error("Audio playback is blocked by the browser. Please click on the page to enable sound.");
      }
    }

    let binaryString: string;
    try {
      binaryString = atob(base64Data);
    } catch (e) {
      throw new Error("Unable to decode audio signature. The response from the AI may have been interrupted.");
    }

    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const buffer = new Int16Array(bytes.buffer);
    if (buffer.length === 0) return;

    const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = buffer[i] / 32768.0;
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    
    return new Promise<void>((resolve) => {
      source.onended = () => {
        if (audioCtx) {
          audioCtx.close().catch(() => {});
        }
        resolve();
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during audio playback.";
    console.error("playPCM playback error:", error);
    // Explicitly notify the user or handle it
    throw new Error(errorMessage);
  }
}
