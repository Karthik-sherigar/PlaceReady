import { useEffect, useRef } from "react";
import { useDiagnostic } from "../context/DiagnosticContext";
import { proctorManager } from "../utils/ProctoringManager";
import { Camera } from "lucide-react";

const LiveCameraPreview = () => {
  const { webcamStream, startWebcam } = useDiagnostic();
  const videoRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      let stream = webcamStream;
      if (!stream) {
        stream = await startWebcam();
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    setup();
  }, [webcamStream, startWebcam]);

  return (
    <div className="camera-preview-card">
      <div className="camera-preview-label">
        <div className="status-dot"></div>
        <Camera size={10} />
        LIVE PROCTORING
      </div>
      <video ref={videoRef} autoPlay playsInline muted></video>
    </div>
  );
};

export default LiveCameraPreview;
