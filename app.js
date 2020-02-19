const express = require('express');
const data = require('./geo.json');
const app = express();
const request = require('superagent');
const port = process.env.PORT || 3000;

// console.log(data)



app.get('/location', (request, respond) => {
  const cityData = data.results[0];
  
  respond.json({
    formattedQuery: cityData.formatted_address,
    latitude: cityData.geometry.location.lat,
    longitutde: cityData.geometry.location.long,

})
}


app.listen(3000, () => {console.log('running ...')})