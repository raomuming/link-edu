
let config = require('../../config.json');
const https = require('https');
var WXBizDataCrypt = require('./WXBizDataCrypt');

// this function returns session_key and openid, which used to get the unionId of the weChat user.
function jscode2session(code, callback) {
	let appid = config.appid;
	let appsecret = config.appsecret;

	const url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + appsecret + "&js_code=" + code + "&grant_type=authorization_code";

	https.get(url, (res) => {
		console.log('statusCode:', res.statusCode);

		res.on('data', (d) => {
			let result = JSON.parse(d.toString('utf8'));
			if (result.errcode) {
				callback(result);
			}
			else {
				callback(null, result);
			}
		});
	}).on('error', (e) => {
		callback(e);
	});
};

// main purpose is to get unionId, an unique id cross the open platform
// if the encryptedData is from client, better to call [var encryptedData = encodeURIComponent(res2.encryptedData);] before send
module.exports.decryptWxUserData = function(code, encryptedData, iv, callback) {
	jscode2session(code, (error, result) => {
		if (error) {
			callback(error);
		}
		else {
			var pc = new WXBizDataCrypt(config.appid, result.session_key);
			var data = pc.decryptData(encryptedData, iv);

			if (data.watermark.appid != config.appid) {
				var error = {
					errcode: 502,
					errmsg: 'it is an request from an un-supported client.'
				}
				callback(error);
				return;
			}

			callback(null, data);
		}
	});
};