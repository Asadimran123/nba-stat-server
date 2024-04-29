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

app.get('/playerSearch', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/players',
    params: {search: req.query.search},
    headers: {
      'X-RapidAPI-Key': process.env.TEAMS_API_KEY,
      'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
    }
  };

    try {
      const response = await axios.request(options);
      res.status(200).json(response.data.response);
      // console.log(response.data.response)
      // console.log('player query success')
  } catch (error) {
      console.error(error);
  }
});

app.get('/playerStats', async (req, res) => {

  console.log('fetching player stats')
  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/players/statistics',
    params: {
      id: req.query.id,
      season: req.query.season
    },
    headers: {
      'X-RapidAPI-Key': process.env.TEAMS_API_KEY,
      'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
    }
  };

  try {
      const response = await axios.request(options);
      if(!response.data.response){
        console.log("no data found");
        res.status(404).json({msg: "no data found"});
        return;
      }
      delete response.data.response.min
      /* this object returns TOTALS */
      const myRes = [
        {
          "firstname" : response.data.response[0].player.firstname,
          "lastname" : response.data.response[0].player.lastname,
          "id" : response.data.response[0].player.id,
          "pos" : response.data.response[0].pos,
          "season" : req.query.season
        },
        {
        totalPoints : 0, 
        totalAssists : 0,
        // totalMinsPlayed : 0, 
        totalfgm : 0, 
        totalfga : 0, 
        totalfgp : 0,
        totalftm : 0,
        totalfta : 0,
        totalftp : 0,
        totaltpm : 0,
        totaltpa : 0,
        totaltpp :  0,
        totaloffReb : 0,
        totaldefReb : 0,
        totalReb : 0,
        totalpFouls : 0,
        totalsteals : 0,
        totalturnovers : 0,
        totalblocks : 0,
        totalplusMinus : 0
      }, 
      {
        avgPoints : 0, 
        avgAssists : 0,
        // avgMinsPlayed : 0, 
        avgfgm : 0, 
        avgfga : 0, 
        avgfgp : 0,
        avgftm : 0,
        avgfta : 0,
        avgftp : 0,
        avgtpm : 0,
        avgtpa : 0,
        avgtpp :  0,
        avgoffReb : 0,
        avgdefReb : 0,
        avgReb : 0,
        avgpFouls : 0,
        avgsteals : 0,
        avgturnovers : 0,
        avgblocks : 0,
        avgplusMinus : 0
    }];
      
       for (const item of response.data.response) {
          myRes[1].totalPoints += item.points;
          myRes[1].totalAssists += item.assists;
          // const arr = item.min.split(':')
          // const minsPlayed = (Number(arr[0]) * 60) + (Number(arr[1]))
          // myRes[1].totalMinsPlayed += Number(minsPlayed/60);
          myRes[1].totalfgm  += item.fgm;
          myRes[1].totalfga  += item.fga;
          myRes[1].totalfgp  = Number(item.fgp);
          myRes[1].totalftm  += item.ftm;
          myRes[1].totalfta += item.fta;
          myRes[1].totalftp = Number(item.ftp);
          myRes[1].totaltpm += item.tpm;
          myRes[1].totaltpa += item.tpa;
          myRes[1].totaltpp  = Number(item.tpp);
          myRes[1].totaloffReb += item.offReb;
          myRes[1].totaldefReb += item.defReb;
          myRes[1].totalReb += item.totReb;
          myRes[1].totalpFouls += item.pFouls;
          myRes[1].totalsteals += item.steals;
          myRes[1].totalturnovers += item.turnovers;
          myRes[1].totalblocks += item.blocks;
          myRes[1].totalplusMinus  += Number(item.plusMinus);
      }

      const itemCount = response.data.response.length;

      // Check if itemCount is greater than zero to avoid division by zero
      if (itemCount > 0) {
          for (const key in myRes[1]) {
              if (key.startsWith("total")) {
                  // Replace "total" with "avg" for keys and calculate the average for the current statistic
                  myRes[2]["avg" + key.substring(5)] = myRes[1][key] / itemCount;
              }
          }

      } else {
          console.log("No items in the data set.");
          res.status(404);
      }
      myRes[2]["avgftp"] = myRes[1]["totalftm"] / myRes[1]["totalfta"];
      myRes[2]["avgtpp"] = myRes[1]["totaltpm"] / myRes[1]["totaltpa"];
      res.status(200).json(myRes);
      // console.log(myRes)
      console.log("success");
  } catch (error) {
      console.error("could not fetch data ", error);
      res.status(202).json([{msg: `no data available`}])
  }
});


app.get('/news', async (req, res) => {
    const options = {
      method: 'GET',
      url: 'https://nba-latest-news.p.rapidapi.com/articles',
      headers: {
        'X-RapidAPI-Key': process.env.TEAMS_API_KEY,
        'X-RapidAPI-Host': 'nba-latest-news.p.rapidapi.com'
      }
    };
    
    try {
      const response = await axios.request(options);
      res.status(200).json(response.data.splice(0, 5));
    } catch (error) {
      console.error(error);
      res.status(404);
    }
});



const lambda = serverless(app)

export async function handler(event, context) {
  return lambda(event, context)
}
