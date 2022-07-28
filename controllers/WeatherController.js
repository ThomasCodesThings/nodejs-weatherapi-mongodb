import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { antiParameterPullution } from '../controllers/ExpressHelper.js';

export function parseCoordinates(req, res, next) {
    if(!req.query.lat && !req.query.lon) {
        return res.status(400).json({error: 'Missing lat and lon parameters in url'});
    }

    if(!req.query.lat) {
        return res.status(400).json({error: 'Missing lat parameter in url'});
    }

    //if req query lon is undefined, return error
    if(!req.query.lon) {
        return res.status(400).json({error: 'Missing lon parameter in url'});
    }

    if(req.query.lat && req.query.lon) {
        req.coordinates = {}
        var parsedLat =  Number(antiParameterPullution(req.query.lat));
        var parsedLon = Number(antiParameterPullution(req.query.lon));
        if(!isNaN(parsedLat) && !isNaN(parsedLon)) {
            if(!(parsedLat >= -90 && parsedLat <= 90) && !(parsedLon >= -180 && parsedLon <= 180)) {
                return res.status(400).json({error: 'Lat must be a number between -90 and 90 and Lon must be a number between -180 and 180'});
            }

            if(!(parsedLat >= -90 && parsedLat <= 90)){
                return res.status(400).json({error: 'Lat must be a number between -90 and 90'});
            }

            if(!(parsedLon >= -180 && parsedLon <= 180)){
                return res.status(400).json({error: 'Lon must be a number between -180 and 180'});
            }

            req.coordinates.lat = parsedLat;
            req.coordinates.lon = parsedLon;
            return next();
        }

        if(isNaN(parsedLat) && isNaN(parsedLon)) {
            return res.status(400).json({error: 'Lat and lon must be numbers'});
        }

        if(isNaN(parsedLat) && !isNaN(parsedLon)) {
            return res.status(400).json({error: 'Lat must be a number'});
        }

        if(!isNaN(parsedLat) && isNaN(parsedLon)) {
            return res.status(400).json({error: 'Lon must be a number'});
        }
        req.coordinates.lat = parsedLat;
        req.coordinates.lon = parsedLon;
    }

    //if req query lat is undefined, return error
    
}

function windDirection(angle){
    switch(true){
        case angle >= 348.75 || angle <= 11.25:
            return 'N';
        case angle >= 11.25 && angle <= 33.75:
            return 'NNE';
        case angle >= 33.75 && angle <= 56.25:
            return 'NE';
        case angle >= 56.25 && angle <= 78.75:
            return 'ENE';
        case angle >= 78.75 && angle <= 101.25:
            return 'E';
        case angle >= 101.25 && angle <= 123.75:
            return 'ESE';
        case angle >= 123.75 && angle <= 146.25:
            return 'SE';
        case angle >= 146.25 && angle <= 168.75:
            return 'SSE';
        case angle >= 168.75 && angle <= 191.25:
            return 'S';
        case angle >= 191.25 && angle <= 213.75:
            return 'SSW';
        case angle >= 213.75 && angle <= 236.25:
            return 'SW';
        case angle >= 236.25 && angle <= 258.75:
            return 'WSW';
        case angle >= 258.75 && angle <= 281.25:
            return 'W';
        case angle >= 281.25 && angle <= 303.75:
            return 'WNW';
        case angle >= 303.75 && angle <= 326.25:
            return 'NW';
        case angle >= 326.25 && angle <= 348.75:
            return 'NNW';
        default:
            return 'N/A';
    }
}

export const index = async (req, res)  =>{
    let response = await fetch(`${process.env.API_URL}?lat=${req.coordinates.lat}&lon=${req.coordinates.lon}&appid=${process.env.API_KEY}`);
    let data = await response.json();
    const weatherData = {
        coordinates: req.coordinates,
        temperature: data.main.temp - 273.15,
        wind: {
            speed: data.wind.speed,
            degree: data.wind.deg,
            direction: windDirection(data.wind.deg)
        },
        time: new Date((data.dt + data.timezone) * 1000).toUTCString(),
        clouds: data.clouds.all,
        rain: data.rain ? data.rain['1h'] : 0,
        humidity: data.main.humidity,
        snow: data.snow ? data.snow['1h'] : 0,
        location: {
            city: data.name !== "" ? data.name : "Unknown",
            country: data.sys.country ? data.sys.country : "Unknown"
        } 
    }
    const db = mongoose.connection;
    if(db.readyState === 1){
        try {
            db.collection('WeatherData').insertOne(weatherData, (err, result) => {
                if(err) {
                    console.error(err);
                }
                res.status(200).json(weatherData);
            });
            return;
        }
        catch(err) {
            console.error(err);
            return res.status(500).json({error: 'Failed to insert weather data into database'});
        }
    }
    return res.status(503).json({error: 'Failed to connect to database'});
}