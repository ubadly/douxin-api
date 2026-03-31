process.env.FASTIFY_AUTOLOAD_TYPESCRIPT = "1";
import { FastifyInstance } from "fastify";

import path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";

// 👇 加上这一行！修复 __dirname 报错！
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
};

export default async function (fastify: FastifyInstance, opts: any) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}

export { options };
