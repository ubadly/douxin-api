"use strict";

import * as douyinParse from "../../douyin/parse";
import { FastifyInstance } from "fastify";
module.exports = async function (fastify: FastifyInstance, opts: any) {
  fastify.post("/parse", async function (request, reply) {
    const jsonResponse: JsonResponse = {
      code: 0,
      msg: "解析失败",
      data: null,
    };

    // 校验参数
    const body = request.body as { url: string };
    if (!body.url) {
      jsonResponse.msg = "url不能为空";
      return jsonResponse;
    }

    // 解析抖音资源链接
    try {
      const douyinParsedResponse: ParseResult = await douyinParse.parse(
        body.url,
      );
      
      const data = douyinParse.makeApiResponse(douyinParsedResponse);

      // 构建响应数据
      jsonResponse.code = 1;
      jsonResponse.msg = "解析成功";
      jsonResponse.data = data;

      return jsonResponse;
    } catch (err) {
      jsonResponse.msg = "解析失败";
      return jsonResponse;
    }
  });
};
