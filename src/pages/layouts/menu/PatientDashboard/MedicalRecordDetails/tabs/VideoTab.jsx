

import React, { useState, useEffect } from "react";
import { Video, X } from "lucide-react";
import DynamicTable from "../../../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../../../components/DocsReader";
import { getVideos } from "../../../../../../utils/masterService";

const VideoTab = ({
  isExactPatient,
  isExactDoctor,
  patientId,
  recordId,
  recordTab,
  setVideoModal
}) => {
  const [videoRecordings, setVideoRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoData, setSelectedVideoData] = useState(null);

  useEffect(() => {
    const fetchVideoRecordings = async () => {
      if (!recordId) {
        console.warn("No recordId available to fetch video recordings");
        setError("No patient record selected");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching video recordings for Patient ID:", patientId, "Record ID:", recordId);

        const response = await getVideos(patientId, recordId);
        console.log("Video Recordings API Response:", response);

        if (response?.data) {
          const recordings = Array.isArray(response.data) ? response.data : [response.data];
          const formattedRecordings = recordings.map(recording => {
            if (!recording) {
              console.error("Recording is undefined or null:", recording);
              return null;
            }
            return {
              ...recording,
              videoUrl: recording.actions || "N/A",
              date: recording.visitDate || "N/A",
              type: recording.type || 'Video',
              doctorName: recording.doctorName || 'N/A',
              virtualRecordId: recording.virtualRecordId || recording.id || 'N/A'
            };
          }).filter(Boolean);

          console.log("Formatted Recordings:", formattedRecordings);
          setVideoRecordings(formattedRecordings);

          if (formattedRecordings.length === 0) {
            setError("No video recordings found for this patient");
          }
        } else {
          setError("No video recording data available");
          setVideoRecordings([]);
        }
      } catch (error) {
        console.error("Error fetching video recordings:", error);
        setError(error.response?.data?.message || "Failed to load video recordings");
        setVideoRecordings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoRecordings();
  }, [recordId, patientId, recordTab]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="ml-6 mr-6 space-y-4 md:space-y-6">
        {videoRecordings.length > 0 && (
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
           
            
          </div>
        )}

        {loading ? (
          <div className="text-center py-6 md:py-8 text-sm md:text-base">
            Loading video recordings...
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <p className="text-red-500 text-sm md:text-base">
              {error}
            </p>
          </div>
        ) : videoRecordings.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <DynamicTable
              columns={[
                {
                  header: "Record ID",
                  accessor: "virtualRecordId",
                  sortable: true,
                  className: "min-w-[100px]",
                },
                {
                  header: "Visit Date",
                  accessor: "date",
                  sortable: true,
                  className: "min-w-[120px]",
                },
                {
                  header: "Consultation Type",
                  accessor: "type",
                  sortable: true,
                  className: "min-w-[150px]",
                },
                {
                  header: "Doctor",
                  accessor: "doctorName",
                  sortable: true,
                  className: "min-w-[200px]",
                },
                {
                  header: "Actions",
                  accessor: "videoUrl",
                  className: "min-w-[120px] text-center",
                  cell: (row) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(row.videoUrl);
                        setSelectedVideoData({
                          patientName: row.patientName || 'Patient',
                          date: row.date || 'N/A'
                        });
                      }}
                      className="px-3 py-1 btn-primary text-white rounded  text-sm"
                    >
                      View Video
                    </button>
                  ),
                },
              ]}
              showSearchBar={true}
              data={videoRecordings}
              searchFields={["date", "type", "doctorName", "virtualRecordId"]}
              defaultSortField="date"
              defaultSortOrder="desc"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <DocsReader />
            <p className="mt-4 text-gray-600 text-sm md:text-base">
              No video recordings available for this patient
            </p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setSelectedVideo(null)}
                className="bg-white rounded-full p-1 text-gray-700 hover:bg-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="aspect-video w-full">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {videoRecordings.find(v => v.videoUrl === selectedVideo)?.patientName || 'Patient'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const video = videoRecordings.find(v => v.videoUrl === selectedVideo);
                      if (!video?.date) return 'Date not available';
                      return new Date(video.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTab;
