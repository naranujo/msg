const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);

const twilioNumber = 'whatsapp:+14155238886';
const yourNumber = 'whatsapp:+5491135646079';

const openai = require('openai-api');
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = new openai(openaiApiKey);

async function processIncomingMessage(message) {
    try {
      const response = await openaiClient.complete({
        engine: 'text-davinci-003',
        prompt: `Human: ${message}\nAI:`,
        maxTokens: 256,
        temperature: 0.9,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ['\n', ' Human:', ' AI:']
        });
        return response.data.choices[0].text;
    } catch (error) {
      console.error(error);
    }
  }

app.use(express.json())

app.post('/webhook', async (req, res) => {
  const message = req.body.q;
  if (!message) {
    return res.send('NOT OK');
  }
  console.log(`Received message: ${message}`);
  
  const reply = await processIncomingMessage(message);
  
  client.messages.create({
    from: twilioNumber,
    to: yourNumber,
    body: reply
  })
  .then(message => console.log(`Sent reply: ${message.sid}, ${reply}`));

  
  res.send('OK');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
