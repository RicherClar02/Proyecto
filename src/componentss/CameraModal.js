"use client";
import { useState, useRef, useEffect } from "react";

export default function CameraModal({ isOpen, onClose, onPhotoTaken }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [error, setError] = useState("");

  // Iniciar cámara cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Cámara trasera
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara: " + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    setPhotoData(photoDataUrl);
  };

  const retakePhoto = () => {
    setPhotoData(null);
  };

  const acceptPhoto = () => {
    onPhotoTaken(photoData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4">Tomar Foto del Producto</h2>
        
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            {!photoData ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-200 rounded"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={takePhoto}
                    className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
                  >
                    📸
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={photoData}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded mb-4"
                />
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={retakePhoto}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Volver a tomar
                  </button>
                  <button
                    onClick={acceptPhoto}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Usar foto
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}