import express from 'express';
import cors from 'cors';
import axios from 'axios';
import rateLimiter from 'express-rate-limit';
import serverless from 'serverless-http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(cors());

app.get('/teams', async (req, res) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://api-nba-v1.p.rapidapi.com/standings',
      params: {
        league: 'standard',
        // season: req.apiGateway.event.season
        season: req.query.season
      },
      headers: {
        'X-RapidAPI-Key': process.env.TEAMS_API_KEY,
        'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com',
      },
    };

    const response = await axios.request(options);
    res.status(200).json(response.data.response);
    console.log('Request success ');

  } catch (error) {
    console.error('Request error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const lambda = serverless(app)

export async function handler(event, context) {
  return lambda(event, context)
}

// app.listen(5001, ()=>{
//   console.log('server running on 5001')
// })

