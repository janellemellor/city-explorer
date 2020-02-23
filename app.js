const express = require('express');
const app = express();
const request = require('superagent');
require('dotenv').config();

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
        const location = req.query.search;
        
    //     //hide Key!
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;


        const cityData = await request.get(URL);
        const firstResult = cityData.body[0];

        console.log(cityData.body);

        lat = firstResult.lat;
        lng = firstResult.lon;

        res.json({
            formatted_query: firstResult.display_name,
            latitude: lat, 
            longtitude: lng,
        });
       
    } catch (err) {
        next(err);
    }
});
    // //Below code is using the hardcoded geo data
    //     const cityData = geoData.results[0];

    // //update state so it is accessible in oither routes
    //     lat = cityData.geometry.location.lat;
    //     lng = cityData.geometry.location.lng;
  
        // res.json({
        //     formattedQuery: cityData.formatted_address,
        //     latitude: cityData.geometry.location.lat,
        //     longitutde: cityData.geometry.location.lng,
        
//will use lat and lng below when we hit the api
const getWeatherData = async(lat, lng) => {
   
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);

    return weather.body.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            //new Data is standard. Time is in seconds in API so must convert
            time: new Date(forecast.time * 1000),
        };
    });
};

app.get('/weather', async(req, res, next) => {
    try {
    //use the lat and lng from earlier to get weather data for the selected area
        const portlandWeather = await getWeatherData(lat, lng); 

    //res.json that weather data in the appropriate form
        res.json(portlandWeather);
    } catch (err) {
        next(err);
    }
});


const getYelpData = async(lat, lng) => {
   
    const restaurants = await request.get(`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);

    return restaurants.body.businesses.map(business => {
        return {
            name: business.name,
            image_url: business.image_url,
            price: business.price,
            rating: business.rating,
            url: business.url,
        };
    });
};


app.get('/restaurants', async(req, res, next) => {
    try {
        const getReviews = await getYelpData(lat, lng);
        res.json(getReviews);

    } catch (err) {
        next(err);
    }
});


const getTrailData = async(lat, lng) => {
   
    const trails = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`);

    return trails.body.trails.map(trail => {
        const conditionDateAndTimeArray = trail.conditionDate.split(' ');

        return {
            name: trail.name,
            location: trail.location,
            length: trail['length'],
            stars: trail.stars,
            star_votes: trail.starVotes,
            summary:trail.summary,
            trail_url: trail.url,
            conditions: trail.conditionDetails,
            condition_date: conditionDateAndTimeArray[0],
            condition_time: conditionDateAndTimeArray[1],
        };
    });
};


app.get('/trails', async(req, res, next) => {
    try {
        const findTrails = await getTrailData(lat, lng);
        res.json(findTrails);

    } catch (err) {
        next(err);
    }
});

const getEventData = async(lat, lng) => {
    const eventURL = await request.get(`http://api.eventful.com/json/events/search?app_key=${process.env.EVENT_API_KEY}&where=${lat},${lng}&within=25&page_size=20&page_number=1`);
    
    const nearbyEvents = JSON.parse(eventURL.text);

    return nearbyEvents.events.event.map(event => {
        const eventDateAndTimeArray = event.start_time.split(' ');
        return {
            link: event.url,
            name: event.title, 
            event_date: eventDateAndTimeArray[0], 
            summary: event.description === null ? 'no description provided' : event.description
        };
    });
};

app.get('/events', async(req, res, next) => {
    try {
        const findEvents = await getEventData(lat, lng);
        res.json(findEvents);

    } catch (err) {
        next(err);
    }
});

//404 route must be at the end of the routes or the route will default here. 
app.get('*', (request, respond) => {
    respond.send('404');
});

module.exports = {
    app: app
};

