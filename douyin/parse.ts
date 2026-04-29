import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const STANDARD_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CUSTOM_B64 = "ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_";
const XOR_KEY = 0x5A;
const NOISE_CHAR = "#";
const NOISE_INTERVAL = 10;

function base64CustomEncode(str) {
    return str.split('').map(c => {
        const idx = STANDARD_B64.indexOf(c);
        return idx === -1 ? c : CUSTOM_B64[idx];
    }).join('');
}

function base64CustomDecode(str) {
    return str.split('').map(c => {
        const idx = CUSTOM_B64.indexOf(c);
        return idx === -1 ? c : STANDARD_B64[idx];
    }).join('');
}

function blockReverse(str, blockSize = 8) {
    let result = '';
    for (let i = 0; i < str.length; i += blockSize) {
        const chunk = str.slice(i, i + blockSize);
        result += chunk.split('').reverse().join('');
    }
    return result;
}

function xorString(str, key = XOR_KEY) {
    const arr = [];
    for (let i = 0; i < str.length; i++) {
        // @ts-ignore
        arr.push(String.fromCharCode(str.charCodeAt(i) ^ key));
    }
    return arr.join('');
}

function removeNoise(str, noiseChar = NOISE_CHAR) {
    return str.split('').filter(c => c !== noiseChar).join('');
}

/**
 * AES解密
 */
function aesDecrypt(dataBase64, ivBase64, keyStr) {
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const encryptedData = CryptoJS.enc.Base64.parse(dataBase64);

    const decrypted = CryptoJS.AES.decrypt(
        {ciphertext: encryptedData},
        key,
        {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
}

/**
 * 组合解密
 */
function kukudemethod(encryptedData, encryptedIv, keyStr) {
    try {
        // 1. 去除噪声
        // let data = removeNoise(encryptedData);
        // let iv = removeNoise(encryptedIv);

        let data = encryptedData;
        let iv = encryptedIv;

        // console.log('After noise removal:', { data, iv });

        // 2. XOR解混淆
        data = xorString(data);
        iv = xorString(iv);
        // console.log('After XOR:', { data, iv });

        // 3. 分块倒序
        data = blockReverse(data);
        iv = blockReverse(iv);
        // console.log('After block reverse:', { data, iv });

        // 4. Base64自定义解码
        data = base64CustomDecode(data);
        iv = base64CustomDecode(iv);
        // console.log('After Base64 decode:', { data, iv });

        // 5. AES解密
        return aesDecrypt(data, iv, keyStr);
    } catch (error) {
        // console.error('Decryption error:', error);
        // console.log('Input data:', { encryptedData, encryptedIv, keyStr });
        throw error;
    }
}


const getAuthResult = async (url) => {
    let o = await fetch("https://dy.kukutool.com/api/auth-25e532", {
        "headers": {
            "content-type": "application/json",
            "cookie": "parse_sid=e51c67fdc2a5eec07bf3a4041842db97c2d0b69886a0df21; _pk_id.1.2b9a=f8c94869b7fc3625.1776733841.; NEXT_LOCALE=zh; _pk_ref.1.2b9a=%5B%22%22%2C%22%22%2C1777443306%2C%22https%3A%2F%2Fcn.bing.com%2F%22%5D; _pk_ses.1.2b9a=1",
            "Referer": "https://dy.kukutool.com/douyin"
        },
        "body": JSON.stringify({
            "requestURL": url,
            "pagePath": "/douyin",
            "mode": "single"
        }),
        "method": "POST"
    });

    return o.json()
}
const parseDouyin = async (data) => {
    const parseResponse = await fetch("https://dy.kukutool.com/api/parse", {
        "headers": {
            "content-type": "application/json",
            "cookie": "parse_sid=e51c67fdc2a5eec07bf3a4041842db97c2d0b69886a0df21; _pk_id.1.2b9a=f8c94869b7fc3625.1776733841.; NEXT_LOCALE=zh; _pk_ref.1.2b9a=%5B%22%22%2C%22%22%2C1777443306%2C%22https%3A%2F%2Fcn.bing.com%2F%22%5D; _pk_ses.1.2b9a=1",
            "Referer": "https://dy.kukutool.com/douyin"
        },
        "body": JSON.stringify(data),
        "method": "POST"
    });

    return parseResponse.json();
};

const asf = function (e) {
    const a = {};
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : a
        , i = (null == e ? void 0 : e.authResponseFields) || a;
    return {
        authKey: null == t ? void 0 : t[i.key || "authKey"],
        authSeed: null == t ? void 0 : t[i.seed || "authSeed"]
    }
}

function f(e) {
    let t = new Uint8Array(e);
    return Buffer.from(t).toString('base64');
}

function c(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
        , i = (null == e ? void 0 : e.parseRequestFields) || {}
        , r = {
        version: 3,
        [i.key || "authKey"]: t.authKey,
        [i.payload || "payload"]: t.payload,
        [i.version || "v"]: t.v
    };
    if (i.iv || Object.prototype.hasOwnProperty.call(t, "iv")) {
        var n;
        r[i.iv || "iv"] = null != (n = t.iv) ? n : ""
    }
    return r
}

function _() {
    return parseInt("1", 10) || 1
}

async function m(e, t) {
    let i = new TextEncoder().encode("".concat(e, ":").concat(t));
    let r = await crypto.subtle.digest("SHA-256", i);
    return crypto.subtle.importKey("raw", r, {
        name: "AES-GCM"
    }, false, ["encrypt"])
}

async function y(e, t, i) {
    if (!crypto.subtle || !crypto.getRandomValues) {
        // @ts-ignore
        return c(i, {
            authKey: t.authKey,
            payload: e,
            iv: "",
            v: _()
        });
    }

    let a = crypto.getRandomValues(new Uint8Array(12));
    let s = await m(t.authKey, t.authSeed);
    let o = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: a
    }, s, new TextEncoder().encode(JSON.stringify(e)));

    // @ts-ignore
    return c(i, {
        authKey: t.authKey,
        payload: f(o),
        iv: f(a.buffer),
        v: _()
    });
}

// 解析视频链接
export async function parse(douxinUrl: string) {
    const data = {
        "requestURL": douxinUrl,
        "captchaKey": "",
        "captchaInput": "",
        "totalSuccessCount": "0",
        "successCount": "0",
        "firstSuccessDate": "0",
        "pagePath": "/douyin",
        "uwx_id": "uwx_0450697tv5SU",
        "isMobile": "false",
        "geoipIp": "123.202.251.187"
    }
    const formData = {
        "id": "2026w16",
        "authRoute": "auth-25e532",
        "authResponseFields": {
            "key": "k_25e532",
            "seed": "s_25e532"
        },
        "parseRequestFields": {
            "key": "k_25e532",
            "payload": "p_25e532",
            "iv": "i_25e532",
            "version": "r_25e532"
        },
        "reasonMap": {
            "rate_limited": "ra_25e532",
            "ticket_ip_rate_limited": "request_cooling_down",
            "ticket_ip_daily_limited": "daily_request_ceiling",
            "ticket_ip_restricted": "temporary_access_unavailable",
            "ticket_profile_inactive": "pi_25e532",
            "ticket_expired": "ex_25e532",
            "ticket_missing": "ms_25e532",
            "ticket_subject_mismatch": "sm_25e532",
            "ticket_request_mismatch": "rm_25e532",
            "ticket_used": "ud_25e532"
        }
    }
    let authResult = await getAuthResult(douxinUrl)
    // @ts-ignore
    let a = await y(data, asf(formData, authResult), formData)
    let parseResult = await parseDouyin(a);
    let result = kukudemethod(parseResult.data, parseResult.iv, "12345678901234567890123456789013")
    console.log(result)
    return result
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
