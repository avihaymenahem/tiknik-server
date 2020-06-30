require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mailjet = require('node-mailjet')
    .connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

app.use(cors());
app.use(bodyParser.json())

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

app.listen(process.env.PORT);