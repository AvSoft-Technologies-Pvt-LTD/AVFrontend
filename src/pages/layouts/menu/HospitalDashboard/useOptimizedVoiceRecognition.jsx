import { useState, useEffect, useRef, useCallback } from "react";

export const useOptimizedVoiceRecognition = (onDataParsed, options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastResultRef = useRef("");
  const processingRef = useRef(false);

  const {
    continuous = true,
    interimResults = true,
    lang = "en-US",
    maxAlternatives = 2,
    sensitivity = 0.6,
    pauseThreshold = 1500,
    realTimeProcessing = true,
  } = options;

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = lang;
      recognitionRef.current.maxAlternatives = maxAlternatives;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        processingRef.current = false;
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0;

          if (result.isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = (
          lastResultRef.current +
          " " +
          finalTranscript +
          " " +
          interimTranscript
        ).trim();
        setTranscript(currentTranscript);

        if (finalTranscript && maxConfidence >= sensitivity) {
          const newFinalTranscript = (
            lastResultRef.current +
            " " +
            finalTranscript
          ).trim();
          lastResultRef.current = newFinalTranscript;
          setConfidence(maxConfidence);

          if (onDataParsed) {
            onDataParsed(finalTranscript.trim(), maxConfidence, "final");
          }

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            if (
              lastResultRef.current &&
              onDataParsed &&
              !processingRef.current
            ) {
              processingRef.current = true;
              onDataParsed(lastResultRef.current, maxConfidence, "pause");

              setTimeout(() => {
                processingRef.current = false;
              }, 500);
            }
          }, pauseThreshold);
        }

        if (interimTranscript && realTimeProcessing && onDataParsed) {
          onDataParsed(interimTranscript.trim(), 0.5, "interim");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);

        if (lastResultRef.current && onDataParsed && !processingRef.current) {
          onDataParsed(lastResultRef.current, confidence, "end");
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    onDataParsed,
    continuous,
    interimResults,
    lang,
    maxAlternatives,
    sensitivity,
    pauseThreshold,
    realTimeProcessing,
  ]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript("");
        lastResultRef.current = "";
        setConfidence(0);
        processingRef.current = false;
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (lastResultRef.current && onDataParsed && !processingRef.current) {
        onDataParsed(lastResultRef.current, confidence, "stop");
      }
    }
  }, [isListening, onDataParsed, confidence]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    confidence,
    startListening,
    stopListening,
    toggleListening,
  };
  };
