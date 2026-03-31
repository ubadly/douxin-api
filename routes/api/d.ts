interface JsonResponse {
  code: number;
  msg: string;
  data: any | null;
}

// 视频类型

interface DouyinResponseType {
  code: number;
  msg: string;
  wechat: string;
  title: string;
  downurl: string;
  pics: string;
  picshh: null;
  url2: string;
  photo: string;
  type: string;
}


interface DouyinApiParseResponse {
  desc?: string;
  pics?: string[];
  videoUrl?: string;
  url?: string;
  type?: "video" | "image";
  cover?: string;
}
