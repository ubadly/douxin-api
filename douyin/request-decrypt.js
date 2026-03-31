import CryptoJS from 'crypto-js';
const STANDARD_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CUSTOM_B64 = "ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_";
const XOR_KEY = 0x5A;
const NOISE_CHAR = "#";
const NOISE_INTERVAL = 10;

function base64CustomEncode (str) {
	return str.split('').map(c => {
		const idx = STANDARD_B64.indexOf(c);
		return idx === -1 ? c : CUSTOM_B64[idx];
	}).join('');
}

function base64CustomDecode (str) {
	return str.split('').map(c => {
		const idx = CUSTOM_B64.indexOf(c);
		return idx === -1 ? c : STANDARD_B64[idx];
	}).join('');
}

function blockReverse (str, blockSize = 8) {
	let result = '';
	for (let i = 0; i < str.length; i += blockSize) {
		const chunk = str.slice(i, i + blockSize);
		result += chunk.split('').reverse().join('');
	}
	return result;
}

function xorString (str, key = XOR_KEY) {
	const arr = [];
	for (let i = 0; i < str.length; i++) {
		arr.push(String.fromCharCode(str.charCodeAt(i) ^ key));
	}
	return arr.join('');
}

function removeNoise (str, noiseChar = NOISE_CHAR) {
	return str.split('').filter(c => c !== noiseChar).join('');
}

/**
 * AES解密
 */
function aesDecrypt (dataBase64, ivBase64, keyStr) {
	const key = CryptoJS.enc.Utf8.parse(keyStr);
	const iv = CryptoJS.enc.Base64.parse(ivBase64);
	const encryptedData = CryptoJS.enc.Base64.parse(dataBase64);

	const decrypted = CryptoJS.AES.decrypt(
		{ ciphertext: encryptedData },
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
function kukudemethod (encryptedData, encryptedIv, keyStr) {
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

export {kukudemethod}