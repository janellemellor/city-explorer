const express = require('express');
const app = express();
const request = require('superagent');
require('dotenv').config();

let lat;
let lng;


app.get('/location', async(req, res, next) => {
    try {
        const location = req.query.search;
    
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;


        const cityData = await request.get(URL);
        const firstResult = cityData.body[0];

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


const getWeatherData = async(lat, lng) => {
   
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);

    return weather.body.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
        };
    });
};

app.get('/weather', async(req, res, next) => {
    try {
        const portlandWeather = await getWeatherData(lat, lng); 

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

app.get('*', (request, respond) => {
    respond.send('404');
});

module.exports = {
    app: app
};

