# 使用官方 Node.js 22.17.0 作为基础镜像
FROM node:22.17.0-alpine

# 设置工作目录
WORKDIR /app

# 创建日志目录
RUN mkdir -p logs

# 复制 package.json
COPY package.json ./

# 安装依赖（包括开发依赖，因为 start 命令需要 tsx）
RUN npm install --include=dev

# 复制源代码（根据 .dockerignore 规则会忽略 node_modules、dist 等目录）
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start"]