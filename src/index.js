require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mailjet = require('node-mailjet')
    .connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

const privateKey = fs.readFileSync('/etc/letsencrypt/live/tiknik.co.il/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/tiknik.co.il/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/tiknik.co.il/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(cors());
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World')
});

app.post('/email', (req, res) => {
    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
        throw new Error('Missing parameters')
    }

    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "avihay@three-dev.com",
                        "Name": "Tiknik Request"
                    },
                    "To": [
                        {
                            "Email": "avihay@three-dev.com",
                            "Name": "Avihay Menahem"
                        }
                    ],
                    "Subject": "[Tiknik] New Site Order",
                    "HTMLPart": `
                     <ul>
                        <li>Name: ${name}</li><br/>
                        <li>Phone: ${phone}</li><br/>
                        <li>Message: ${message}</li>
                     </ul>
                    `,
                }
            ]
        })
    request
        .then((result) => {
            res.send({
                status: 'ok'
            });
            //console.log(result.body)
        })
        .catch((err) => {
            throw new Error('Send mail failed')
            //console.log(err.statusCode)
        })
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.HTTP_PORT, () => {
	console.log('HTTP Server running on port ' + process.env.HTTP_PORT);
});

httpsServer.listen(process.env.HTTPS_PORT, () => {
	console.log('HTTPS Server running on port ' + process.env.HTTPS_PORT);
});