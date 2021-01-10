const crypto = require('crypto');
const express = require("express");
const bp = require('body-parser');
const childp = require('child_process');
const app = express();
const port = 6666;

const secret = 'SECRET_CHANGE_ME';

const sigHeaderName = 'x-hub-signature';

app.use(bp.json());

function verify(req, res, next) {
	const payload = JSON.stringify(req.body);
	if (!payload) {
		return next('Request body empty');
	}
	req.payload = req.body;
	const sig = req.get(sigHeaderName) || '';
	const hmac = crypto.createHmac('sha1', secret);
	const digest = Buffer.from('sha1=' + hmac.update(JSON.stringify(req.body), 'utf-8').digest('hex'), 'utf8');
	const checksum = Buffer.from(sig, 'utf8');
	if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
		next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`);
	}

	return next();
}

function deploy(res) {
	console.log('deploying');
	childp.exec('sh update.sh', function (err, stdout, stderr) {
		if (err) {
			console.error(err);
			return res.send(500);
		}

		res.sendStatus(200);
	});
}

function echo(res) {
	console.log('echo');
	childp.exec('sh echo.sh', function (err, stdout, stderr) {
		if (err) {
			console.error(err);
			return res.send(500);
		}
		res.sendStatus(200, stdout);
	});
}

app.post("/", verify, function (req, res) {
	if (req.body == undefined || req.body == null) {
		return res.send(400);
	}
	const payload = req.payload;
	console.log(`payload : ${payload}`);
	let sender = req.payload.sender;
	let branch = req.payload.ref;
	console.log(`Sender ${sender} at branch ${branch}`);
	deploy(res);
});

app.post("/echo", function (req, res) {
	console.log('echo hook received');
	return echo(res);
});

app.listen(port, () => {
	console.log(`Github WebHook listening at http://localhost:${port}`);
});

