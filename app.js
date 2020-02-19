const express = require('express');
const geoData = require('./geo.js');
const weatherData = require('./darksky.js');
const app = express();
// const request = require('superagent');
// const port = process.env.PORT || 3000;
// const dotenv = require

//add cors?

//middleware - shoving things onto the request
// app.use((req, res, next) => {
//     console.log(req);
//     next;
// });

// console.log(data)

//set state of lat and long so it can be used globally
let lat;
let lng;


app.get('/location', async(req, res, next) => {
    try {
    
    //get location from query params
    //     const location = req.query.search;

    //     //hide Key!
    //     const URL = 'api link goes here'
    //     // GET https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json



    // //will use the below data when we actually hit the API
    //     console.log('using location...', location);


    //     const cityData = await request.get(URL);



    //     console.log(cityData.body);

    //     lat = firstResult.lat;
    //     lng = firstResult.lon;


        // res.json({
        //     formatted_query: firstResult, 
        //     display_name, 
        //     latitude: lat, 
        //     longtitude: lng,
        // })
       

    //using the hardcoded geo data
        const cityData = geoData.results[0];

    //update state so it is accessible in oither routes
        lat = cityData.geometry.location.lat;
        lng = cityData.geometry.location.lng;
  
        res.json({
            formattedQuery: cityData.formatted_address,
            latitude: cityData.geometry.location.lat,
            longitutde: cityData.geometry.location.lng,
        });
    } catch (err) {
        next(err);
    }
});

//will use lat and lng below when we hit the api
const getWeatherData = (lat, lng) => {
    return weatherData.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            //new Data is standard. Time is in seconds in API so must convert
            time: new Date(forecast.time * 1000),
        };
    });
};

app.get('./weather', (req, res) => {
    //use the lat and lng from earlier to get weather data for the selected area
    const portlandWeather = getWeatherData(lat, lng); 

    //res.json that weather data in the appropriate form
    res.json(portlandWeather);
});

//404 route must be at the end of the routes or the route will default here. 
app.get('*', (request, respond) => {
    respond.send('404');
});



app.listen(3000, () => {console.log('running ...')})