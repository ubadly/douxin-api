import {
  encryptRequestParams,
  createSignedParamsHMAC,
} from "./request-encrypt";
import { kukudemethod } from "./request-decrypt";
const URL = "https://dy.kukutool.com/api/parse";

// 解析视频链接
export async function parse(douxinUrl: string): Promise<ParseResult> {
  const encryptedData = encryptRequestParams(
    {
      requestURL: douxinUrl,
      captchaKey: "",
      captchaInput: "",
      totalSuccessCount: "1",
      successCount: "1",
      firstSuccessDate: "",
      pagePath: "/",
      uwx_id: "uwx_0450697tv5SU",
      isMobile: "false",
      geoipIp: "210.6.50.65",
    },
    "abcdef1234567890abcdef1234567890",
  );

  const signedData = createSignedParamsHMAC(
    {
      data: (encryptedData as { data: string }).data,
      iv: (encryptedData as { iv: string }).iv,
    },
    "5Q0NvQxD0zd8Q5RLQy5xcs",
  );
  const res = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      encrypted: true,
      version: 2,
      ...signedData,
    }),
    headers: {
      "Content-Type": "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
      origin: "https://dy.kukutool.com",
    },
  });
  const data = await res.json();

  return kukudemethod(
    (data as any).data,
    (data as any).iv,
    "12345678901234567890123456789013",
  );
}

// 构建响应数据
export function makeApiResponse(
  parseResponse: ParseResult,
): DouyinApiParseResponse | null {
  const data: DouyinApiParseResponse = {};

  // 视频标题
  data.desc = parseResponse.title;

  // 链接类型
  if (parseResponse.type === "video") {
    data.type = "video";
    data.cover = parseResponse.cover;
    data.url =
      (parseResponse.videos &&
        parseResponse.videos[parseResponse.videos.length - 1].url) ||
      parseResponse.url;
  } else if (parseResponse.type === "images") {
    data.type = "image";
    data.pics = parseResponse.pics;
  } else {
    return null;
  }

  return data;
}
