const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config'); // Import the config file
const OPENAI_API_KEY = config.openaiApiKey;
const { OpenAI } = require('openai');

const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function analyzeSentiment(sentence) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'Sentiment score as a number between -1 and 1' }, { role: 'user', content: sentence }],
    model: 'gpt-3.5-turbo',
  });

  // Extract the sentiment score from the completion
  const sentimentScore = completion.choices[0].message.content; 
  console.log(parseFloat(completion.choices[0].message.content.split(':')[1]));

  return {
    sentence: sentence,
    sentimentScore: sentimentScore,
  };
}

// Route to handle sentiment analysis
app.post('/analyze-sentiment', async (req, res) => {
  const sentence = req.body.sentence;

  if (!sentence) {
    return res.status(400).json({ error: 'Missing sentence in the request body' });
  }

  try {
    const sentimentAnalysis = await analyzeSentiment(sentence);
    res.json(sentimentAnalysis);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
