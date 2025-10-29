

import React, { useState, useEffect, useRef } from "react";
import { FaPhone, FaVideo, FaUser, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FiVideo } from "react-icons/fi";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import Videocall from "../../assets/videocalling.avif";

// Helper: Save recording to localStorage
const saveRecordingToLocalStorage = (blob, key, context, metadata) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem(key, reader.result);
      localStorage.setItem(`${key}_context`, context);
      localStorage.setItem(`${key}_metadata`, JSON.stringify(metadata));
      resolve();
    };
    reader.readAsDataURL(blob);
  });
};

// Helper: Load recording from localStorage
const loadRecordingFromLocalStorage = (key) => {
  const dataUrl = localStorage.getItem(key);
  const context = localStorage.getItem(`${key}_context`);
  const metadataStr = localStorage.getItem(`${key}_metadata`);
  if (!dataUrl) return { blob: null, context: null, metadata: null };
  try {
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return {
      blob: new Blob([ab], { type: mimeString }),
      context,
      metadata: metadataStr ? JSON.parse(metadataStr) : null,
    };
  } catch (error) {
    console.error("Failed to decode data URL from localStorage:", error);
    return { blob: null, context: null, metadata: null };
  }
};

// --- Modal Components ---
const Modal = ({ show, onClose, children, large, showEndButton, widthClass = "max-w-md" }) =>
  show
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div onClick={onClose} className="absolute inset-0" />
          <div
            className={`relative bg-white p-6 rounded-xl z-10 shadow-lg animate-fadeInUp ${
              large ? "w-[90%] max-w-4xl" : `w-full ${widthClass}`
            }`}
          >
            {showEndButton && (
              <button
                onClick={onClose}
                className="absolute top-2 right-3 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                End Consultation
              </button>
            )}
            {children}
          </div>
        </div>,
        document.body
      )
    : null;

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return <p className="text-sm text-gray-600">Duration: {formatTime(seconds)}</p>;
};

const VideoModal = ({ show, onClose, videoBlob, patientName }) =>
  show
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white p-6 rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Consultation Recording - {patientName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                controls
                className="w-full h-96 object-contain"
                src={videoBlob ? URL.createObjectURL(videoBlob) : undefined}
              >
                <p className="text-center text-white p-8">
                  Unable to load video recording.
                </p>
              </video>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (videoBlob) {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(videoBlob);
                    a.download = `consult_${patientName}_${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    toast.success("Video download started");
                  }
                }}
              >
                Download Video
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

// --- TeleConsultFlow Component ---
const TeleConsultFlow = ({ phone, patientName, context = "virtual", patientEmail, hospitalName }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [callType, setCallType] = useState("");
  const [amount, setAmount] = useState("");
  const [stream, setStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showRecordedVideo, setShowRecordedVideo] = useState(false);
  const chunks = useRef([]);

  const reset = () => {
    setStep(1);
    setCallType("");
    setAmount("");
    setAudioEnabled(true);
    setError("");
    setOpen(false);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setParticipants([]);
    chunks.current = [];
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setParticipants([{ id: "You", stream: mediaStream }]);
      const recorder = new MediaRecorder(mediaStream);
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const metadata = {
          patientEmail,
          hospitalName,
          timestamp: Date.now(),
          type: context,
        };
        const key = `consultationVideo_${patientEmail}_${hospitalName}_${Date.now()}`;
        saveRecordingToLocalStorage(blob, key, context, metadata);
        toast.success("Consultation recorded successfully!");
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      setError("Camera or microphone access denied.");
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const handleEndConsultation = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    toast.success("Consultation Ended");
    reset();
  };

  const floatLabel =
    "absolute left-3 text-gray-400 transition-all duration-200 bg-white px-1 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-[-0.6rem] peer-focus:text-xs peer-focus:text-[var(--primary-color)] top-[-0.6rem] text-xs";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[var(--accent-color)] hover:text-[var(--primary-color)] transition"
      >
        <FaPhone className="rotate-[100deg] text-sm" />
      </button>
      <Modal
        show={open}
        onClose={handleEndConsultation}
        large={step === 3 && callType === "video"}
        showEndButton={step === 3 && callType === "video"}
        widthClass={step === 1 || step === 2 ? "max-w-3xl" : "max-w-md"}
      >
        <h2 className="h4-heading text-center mb-5 font-semibold mb-2">Tele Consult</h2>

        {step === 1 && (
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <img
                src={Videocall}
                alt="Video Call"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <p className="paragraph">Consultation Type</p>
                <div className="flex gap-4">
                  {["Consultation", "Followup"].map((t) => (
                    <label key={t} className="flex items-center gap-2">
                      <input type="radio" name="type" /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="peer w-full rounded-lg p-2 pb-3 border shadow-sm placeholder-transparent focus:outline-none focus:border-[var(--primary-color)]"
                  required
                />
                <label htmlFor="amount" className={floatLabel}>
                  Amount
                </label>
              </div>
              <select className="w-full border border-gray-300 p-2 rounded-md">
                <option>Select Payment Mode</option>
                {[
                  "Cash",
                  "GPay",
                  "Paytm",
                  "PhonePe",
                  "Credit Card",
                  "Debit Card",
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button
                onClick={() => setStep(2)}
                className="relative w-full mt-2 px-6 py-2 font-semibold text-white bg-[var(--primary-color)] rounded-lg group overflow-hidden"
              >
                <span className="absolute inset-0 bg-[var(--accent-color)] transform translate-y-full group-hover:translate-y-0 transition duration-300 ease-in-out z-0" />
                <span className="relative z-10 group-hover:opacity-0 transition duration-300">
                  Create Online Consultation
                </span>
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold z-10 transition duration-300">
                  Booking Ready!
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <img
                src={Videocall}
                alt="Video Call"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-4 text-center">
              <div className="relative">
                <input
                  type="text"
                  id="patientPhone"
                  value={phone}
                  readOnly
                  placeholder="Patient Phone Number"
                  className="peer w-full rounded-lg p-2 pb-3 border shadow-sm placeholder-transparent focus:outline-none focus:border-[var(--primary-color)]"
                  required
                />
                <label htmlFor="patientPhone" className={floatLabel}>
                  Patient Phone Number
                </label>
              </div>
              <div className="flex justify-center gap-4">
                {[
                  {
                    type: "voice",
                    icon: <FaPhone className="rotate-[100deg]" />,
                    label: "Phone Call",
                  },
                  { type: "video", icon: <FaVideo />, label: "Video Call" },
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setCallType(type);
                      setStep(3);
                      if (type === "video") setTimeout(openCamera, 1000);
                    }}
                    className="relative overflow-hidden px-5 py-2 rounded-lg text-white font-semibold bg-[var(--primary-color)] group"
                  >
                    <span className="absolute inset-0 bg-[var(--accent-color)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                    <span className="relative z-10 flex items-center gap-2">
                      {icon} <span>{label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && callType === "voice" && (
          <div className="text-center space-y-4">
            <FaUser className="text-5xl mx-auto text-gray-500" />
            <p className="paragraph">
              You will get a call from our system to connect you to the patient.
              Your number will not be shared.
            </p>
            <button className="mt-4 px-5 py-2 bg-[var(--accent-color)] text-white rounded-lg">
              Connecting a call...
            </button>
          </div>
        )}

        {step === 3 && callType === "video" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">Consultation in Progress</p>
              <Timer />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p) => (
                <div key={p.id} className="rounded-lg overflow-hidden shadow">
                  <video
                    ref={(el) => el && p.stream && (el.srcObject = p.stream)}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <p className="text-center text-sm mt-1 font-semibold">
                    {p.id} (Doctor)
                  </p>
                </div>
              ))}
              <div className="rounded-lg overflow-hidden shadow flex items-center justify-center h-64 bg-gray-100">
                <p className="text-gray-500 text-sm">
                  Waiting for patient to connect...
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleAudio}
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                {audioEnabled ? (
                  <FaMicrophone className="text-green-600" />
                ) : (
                  <FaMicrophoneSlash className="text-red-600" />
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <VideoModal
        show={showRecordedVideo}
        onClose={() => setShowRecordedVideo(false)}
        videoBlob={recordedBlob}
        patientName={patientName}
      />
    </>
  );
};

export default TeleConsultFlow;





