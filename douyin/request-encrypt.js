// request-encrypt.js
// 客户端请求参数加密模块
// 需先引入CryptoJS
// 引入CryptoJS库
import CryptoJS from "crypto-js";

const STANDARD_B64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CUSTOM_B64 =
  "ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_";
const XOR_KEY = 0x5a;

/**
 * 自定义Base64替换
 */
function base64CustomEncode(str) {
  return str
    .split("")
    .map((c) => {
      const idx = STANDARD_B64.indexOf(c);
      return idx === -1 ? c : CUSTOM_B64[idx];
    })
    .join("");
}

/**
 * 分块倒序，每块8字符
 */
function blockReverse(str, blockSize = 8) {
  let result = "";
  for (let i = 0; i < str.length; i += blockSize) {
    const chunk = str.slice(i, i + blockSize);
    result += chunk.split("").reverse().join("");
  }
  return result;
}

/**
 * XOR混淆
 */
function xorString(str, key = XOR_KEY) {
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    arr.push(String.fromCharCode(str.charCodeAt(i) ^ key));
  }
  return arr.join("");
}

/**
 * AES加密
 */
function aesEncrypt(jsonData, keyStr) {
  const plaintext = JSON.stringify(jsonData);
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    data: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  };
}

/**
 * 加密请求参数
 * @param {Object} params - 要加密的参数对象
 * @param {string} keyStr - 加密密钥
 * @returns {Object} {data, iv}
 */
function encryptRequestParams(params, keyStr) {
  try {
    // 1. AES加密
    const { data, iv } = aesEncrypt(params, keyStr);

    // 2. 自定义Base64替换
    let customData = base64CustomEncode(data);
    let customIv = base64CustomEncode(iv);

    // 3. 分块倒序
    customData = blockReverse(customData);
    customIv = blockReverse(customIv);

    // 4. XOR混淆
    customData = xorString(customData);
    customIv = xorString(customIv);

    return { data: customData, iv: customIv };
  } catch (error) {
    console.error("Request params encryption error:", error);
    throw new Error("参数加密失败");
  }
}

function generateSalt() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 生成HMAC-SHA256签名
 * @param {Object} params - 参数对象（包含data和iv）
 * @param {string} salt - 随机盐
 * @param {number} timestamp - 时间戳
 * @param {string} secret - 签名密钥
 * @returns {string} HMAC签名
 */
function generateHmacSignature(params, salt, timestamp, secret) {
  // 构建签名字符串：data + iv + salt + timestamp
  const signString = `${params.data}${params.iv}${salt}${timestamp}`;

  // 使用HMAC-SHA256生成签名
  const hmac = CryptoJS.HmacSHA256(signString, secret);
  return hmac.toString(CryptoJS.enc.Hex);
}

/**
 * 创建带HMAC签名的参数对象
 * @param {Object} params - 加密后的参数对象 {data, iv}
 * @param {string} secret - 签名密钥
 * @returns {Object} 包含签名的完整参数对象
 */
function createSignedParamsHMAC(params, secret) {
  const salt = generateSalt();
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = generateHmacSignature(params, salt, timestamp, secret);

  return {
    data: params.data,
    iv: params.iv,
    salt: salt,
    ts: timestamp,
    sign: sign,
  };
}

export { encryptRequestParams, createSignedParamsHMAC };
