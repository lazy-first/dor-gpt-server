
// 서버를 띄우기 위한 express 라이브러리 기본세팅
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser= require('body-parser')
const axios = require('axios');

// RIOT API KEY
const API_KEY = 'RGAPI-bd475f82-111c-402a-96dd-95c8a377bfc8';
const baseUrl = 'https://KR.api.riotgames.com/lol';
const baseUrl2 = 'https://asia.api.riotgames.com/lol';

app.use(cors());
app.use(bodyParser.json());

// listen( 포트번호, 띄운 뒤 실행코드 )
app.listen(8080, function(){
    console.log('listening on 8080')
});



async function getMatchDetails(matchId, puuid) {
    try {
      const matchResponse = await axios.get(`${baseUrl2}/match/v5/matches/${matchId}`, {
        headers: {
          'X-Riot-Token': API_KEY,
        },
      });
  
      const matchData = matchResponse.data;
  
      // 매치 데이터에서 필요한 정보 추출
      const participantIdentities = matchData.info.participants;
      const participantId = participantIdentities.find(participant => participant.puuid === puuid)?.participantId;
  
      const participant = matchData.info.participants.find(participant => participant.participantId === participantId);
  
      const kills = participant.kills;
      const deaths = participant.deaths;
      const assists = participant.assists;
      const championName = participant.championName;
      const win = participant.win;

      // 챔피언 이름에 따른 이미지 url
      const championImageUrl = `http://ddragon.leagueoflegends.com/cdn/13.15.1/img/champion/${championName}.png`;
  
      return { kills, deaths, assists, championName, championImageUrl, win, teams };
    } catch (error) {
      console.error(error);
      return null;
    }
  }


app.post('/summoner', async function (req, res) {
    const summonerName = req.body.name;
  
    try {
      const response = await axios.get(`${baseUrl}/summoner/v4/summoners/by-name/${summonerName}`, {
        headers: {
          'X-Riot-Token': API_KEY,
        },
      });
  
      const puuid = response.data.puuid;
  
    //   console.log(puuid)


      try {
        const matchResponse = await axios.get(`${baseUrl2}/match/v5/matches/by-puuid/${puuid}/ids`, {
          headers: {
            'X-Riot-Token': API_KEY,
          },
        });
        
        
        // 최근 4개의 경기
        const matchIds = matchResponse.data.slice(0, 4);

        const matchDetails = await Promise.all(matchIds.map(matchIds => getMatchDetails(matchIds, puuid)));
         
        
        res.json({ matchDetails });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: '오류 발생' });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '오류 발생' });
    }
  });