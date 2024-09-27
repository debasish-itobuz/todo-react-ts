import React from "react";
import Select from "react-select";

type Video = {
  title: string;
  url: string;
  thumbnail: string;
};

type VideoSelectProps = {
  videoList: Video[];
  selectedVideos: Video[];
  onVideoSelect: (videos: Video[]) => void;
};

const VideoSelect: React.FC<VideoSelectProps> = ({
  videoList,
  selectedVideos,
  onVideoSelect,
}) => {
  const handleVideoSelection = (selectedOptions: any) => {
    const selected = selectedOptions.map((option: any) => ({
      title: option.label,
      url: option.value,
      thumbnail: option.thumbnail,
    }));
    onVideoSelect(selected);
  };

  const videoOptions = videoList.map((video: any) => ({
    label: video.title,
    value: video.url,
    thumbnail: video.thumbnail,
  }));

  return (
    <Select
      isMulti
      options={videoOptions}
      onChange={handleVideoSelection}
      value={selectedVideos.map((video) => ({
        label: video.title,
        value: video.url,
      }))}
      placeholder="Choose videos..."
      className="w-[21rem]"
    />
  );
};

export default VideoSelect;
