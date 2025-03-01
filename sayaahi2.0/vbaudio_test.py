import tkinter as tk
import pyaudio
import wave
import threading

# Audio settings
FORMAT = pyaudio.paInt16  # 16-bit audio
CHANNELS = 1             # Mono audio
RATE = 44100             # 44.1kHz sampling rate
CHUNK = 1024             # Audio chunk size
RECORD_FILE = "output.wav"  # Temporary file for recording

class AudioRecorderPlayer:
    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.input_device = None
        self.output_device = None
        self.stream = None
        self.frames = []
        self.recording = False
        self._find_vb_cable_devices()

    def _find_vb_cable_devices(self):
        """Find VB-Cable input and output devices."""
        for i in range(self.p.get_device_count()):
            device_info = self.p.get_device_info_by_index(i)
            if "vb-audio" in device_info["name"].lower():
                if device_info["maxInputChannels"] > 0 and self.input_device is None:
                    self.input_device = i
                if device_info["maxOutputChannels"] > 0 and self.output_device is None:
                    self.output_device = i

        if self.input_device is None or self.output_device is None:
            raise RuntimeError("VB-Cable devices not found. Check your setup!")

        print(f"VB-Cable Input Device Index: {self.input_device}")
        print(f"VB-Cable Output Device Index: {self.output_device}")

    def start_recording(self):
        """Start recording audio."""
        self.recording = True
        self.frames = []
        self.stream = self.p.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                                  input=True, input_device_index=self.input_device, frames_per_buffer=CHUNK)
        print("Recording started.")
        while self.recording:
            data = self.stream.read(CHUNK, exception_on_overflow=False)
            self.frames.append(data)

    def stop_recording(self):
        """Stop recording and save audio to file."""
        self.recording = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        with wave.open(RECORD_FILE, 'wb') as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(self.p.get_sample_size(FORMAT))
            wf.setframerate(RATE)
            wf.writeframes(b''.join(self.frames))
        print("Recording stopped and saved.")

    def play_audio(self):
        """Play the recorded audio."""
        with wave.open(RECORD_FILE, 'rb') as wf:
            stream = self.p.open(format=self.p.get_format_from_width(wf.getsampwidth()),
                                 channels=wf.getnchannels(),
                                 rate=wf.getframerate(),
                                 output=True, output_device_index=self.output_device)
            data = wf.readframes(CHUNK)
            while data:
                stream.write(data)
                data = wf.readframes(CHUNK)
            stream.stop_stream()
            stream.close()
        print("Audio playback complete.")

    def terminate(self):
        """Terminate PyAudio."""
        self.p.terminate()

# Tkinter GUI
class AudioApp:
    def __init__(self, root):
        self.recorder = AudioRecorderPlayer()
        self.record_thread = None

        # Create GUI elements
        self.record_button = tk.Button(root, text="Press and Hold to Record", bg="red", fg="white",
                                       font=("Arial", 14), width=25, height=3)
        self.record_button.pack(pady=20)

        # Bind events
        self.record_button.bind("<ButtonPress>", self.start_recording)
        self.record_button.bind("<ButtonRelease>", self.stop_recording_and_play)

    def start_recording(self, event):
        """Start recording on button press."""
        self.record_thread = threading.Thread(target=self.recorder.start_recording)
        self.record_thread.start()

    def stop_recording_and_play(self, event):
        """Stop recording and play audio on button release."""
        self.recorder.stop_recording()
        self.recorder.play_audio()

    def on_close(self):
        """Clean up resources on close."""
        self.recorder.terminate()
        root.destroy()

# Run the application
if __name__ == "__main__":
    root = tk.Tk()
    root.title("VB-Cable Audio Recorder & Player")
    app = AudioApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
