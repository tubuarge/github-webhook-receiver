let express = require("express");
let app = express();
let port = 6666

app.post("/webhooks/github", function (req, res) {
	console.log('web hook received');
	console.log(`Body: ${req.body}`);
	let sender = req.body.sender;
    	let branch = req.body.ref;
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
