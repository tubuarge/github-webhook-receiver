const crypto = require('crypto');
const express = require("express");
const app = express();
const port = 6666;

const secret = 'SECRET_CHANGE_ME';

const sigHeaderName = 'X-Hub-Signature'

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

function verify(req, res, next) {
  	const payload = req.body.payload;
  	if (!payload) {
    		return next('Request body empty')
  	}
	//console.log(`paylod ${payload}`);
	req.payload = JSON.parse(payload);
  	const sig = req.get(sigHeaderName) || ''
  	const hmac = crypto.createHmac('sha1', secret)
  	const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
  	const checksum = Buffer.from(sig, 'utf8')
  	if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    		//return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
  	}
  	return next();
}

app.post("/", verify, function (req, res) {
	if(req.body.payload == undefined || req.body == null){
		return res.send(400);
	}
	const payload = req.payload;
	console.log(`payload : ${payload}`);
	let sender = req.payload.sender;
    	let branch = req.payload.ref;
	console.log(`Sender ${sender} at branch ${branch}`);
	if(branch.indexOf('master') > -1){
		deploy(res);
	} 
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

function deploy(res){
	childProcess.exec('cd /home/ubuntu && ./update.sh', function(err, stdout, stderr){
        	if (err) {
        		console.error(err);
        		return res.send(500);
        	}
        	res.send(200);
      	});
}
