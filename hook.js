let express = require("express");
let app = express();
let port = 6666

app.post("/github", function (req, res) {
	console.log('github web hook received');
	console.log(`Body: ${req.body}`);
	if (!req.body) {
		return res.send(500);
	}
	if (!req.body.sender) {
		console.log('A non-github hook received, run echo.sh');
		return echo(res);
	}
	let sender = req.body.sender;
    let branch = req.body.ref;
	console.log(`Sender ${sender} at branch ${branch}`);
	if(branch.indexOf('master') > -1){
		return deploy(res);
	} else {
		console.log('push not received from master branch');
		return res.send(500);
	} 
})

app.listen(port, () => {
	console.log(`GitHub webhook listener started at http://localhost:${port}`)
})

function deploy(res){
	childProcess.exec('sh deploy.sh', function(err, stdout, stderr){
        	if (err) {
        		console.error(err);
        		return res.send(500);
        	}
        	res.send(200);
      	});
}
function echo(res) {
	childProcess.exec('sh echo.sh', function (err, stdout, stderr) {
		if (err) {
			console.error(err);
			return res.send(500);
		}
		res.send(200, stdout);
	});
}
