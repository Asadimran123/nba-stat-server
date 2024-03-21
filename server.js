const express = require('express')
const cors = require('cors')
const axios = require('axios')
const rateLimiter = require('express-rate-limit')

require('dotenv').config()

const PORT = process.env.PORT || 5001

const app = express()

//rate limit
const limiter = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 50
})

app.use(limiter)
app.set('trust proxy', 1)

app.use(cors())


/** routing */
app.get('/teams', async (req, res) =>{
    console.log('received request.')
    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/standings',
        params: {
          league: 'standard',
          season: req.query.season
        },
        headers: {
          'X-RapidAPI-Key': process.env.TEAMS_API_KEY,
          'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
        }
      };
      
      try {
            const response = await axios.request(options);
            res.status(200).json(response.data.response)
            console.log('request success')
      } catch (error) {
            console.log('request error')
            res.status(500).json(error)
      }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
