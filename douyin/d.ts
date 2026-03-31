interface VideoResolution {
  url: string;
  size: number;
  type: '540p' | '720p' | '1080p' | '超高清' | string;
}

interface MediaVideo {
  url: string;
  video_fullinfo: VideoResolution[];
}

interface ParseResult {
  title: string;
  type: string;
  cover: string;
  url: string;
  videos: MediaVideo[];
  pics: string[];
}