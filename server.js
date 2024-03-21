/**
 * boilerplate code for proxy api 
 * requires : 
 *          expressJS
 *          cors
 *          axios
 *          express-rate-limiter
 *          dot-env
 * 
 */



const express = require('express')
const cors = require('cors')
const axios = require('axios')
const rateLimiter = require('express-rate-limit')

require('dotenv').config()

const PORT = process.env.PORT || 5001

const app = express()

/**
 * rate limiter
 * 50 requests/10 mins
 */
const limiter = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 50
})

app.use(limiter)
app.set('trust proxy', 1)

app.use(cors())


/** routing 
 * create route for frontend
 * replace '/teams' with your route
*/
app.get('/teams', async (req, res) =>{
    console.log('received request.')
    /** GET request to api 
     * replace url, params, and headers with what you need
     */
    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/standings',
        params: {
          league: 'standard',
          season: req.query.season
        },
        headers: {
          'X-RapidAPI-Key': process.env.TEAMS_API_KEY,  //use .env to hide your epi key
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
