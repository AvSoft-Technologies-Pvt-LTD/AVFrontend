
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, Crop } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const [frameSize, setFrameSize] = useState('a4'); // 'a4' or 'small'

  const sizes = {
    a4: { width: 300, height: 300 * 1.414 }, // A4 ratio
    small: { width: 200, height: 120 }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Match canvas to frame size
    const { width: frameW, height: frameH } = sizes[frameSize];
    canvas.width = frameW;
    canvas.height = frameH;

    // Calculate center crop from video
    const videoAspect = video.videoWidth / video.videoHeight;
    const frameAspect = frameW / frameH;

    let sx, sy, sw, sh;

    if (videoAspect > frameAspect) {
      // Crop horizontally
      sh = video.videoHeight;
      sw = sh * frameAspect;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      // Crop vertically
      sw = video.videoWidth;
      sh = sw / frameAspect;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }

    context.drawImage(video, sx, sy, sw, sh, 0, 0, frameW, frameH);

    canvas.toBlob((blob) => {
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);
      setIsCapturing(true);
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const confirmCapture = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], `captured-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        className="
          relative
          w-[250px] h-[300px]   /* Mobile */
          sm:w-[350px] sm:h-[400px]   /* Small screens */
          md:w-[450px] md:h-[500px]   /* Medium screens */
          lg:w-[550px] lg:h-[600px]   /* Large screens */
          mx-auto
          rounded-lg overflow-hidden bg-black
        "
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 p-4 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">Capture Document</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera View */}
        {!isCapturing && (
          <div className="relative w-full h-full pt-14"> {/* Added padding-top for spacing */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="border-2 border-white border-dashed rounded-lg bg-black/20"
                style={{
                  width: `${sizes[frameSize].width}px`,
                  height: `${sizes[frameSize].height}px`,
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                    Position document within frame
                  </span>
                </div>
              </div>
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <Camera size={24} className="text-gray-800" />
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {isCapturing && capturedImage && (
          <div className="relative w-full h-full bg-black/40 flex flex-col pt-14">
            <div className="flex-1 flex items-center justify-center p-4">
              <div
                style={{
                  width: `${sizes[frameSize].width}px`,
                  height: `${sizes[frameSize].height}px`,
                }}
                className="overflow-hidden rounded-lg bg-black/40 flex items-center justify-center"
              >
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex justify-center gap-4">
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={20} />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex items-center gap-2 bg-gradient-to-r from-[#01B07A] to-[#1A223F] text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={20} />
                Use Photo
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={sizes[frameSize].width}
          height={sizes[frameSize].height}
        />
      </div>
    </div>
  );
};

export default CameraCapture;
