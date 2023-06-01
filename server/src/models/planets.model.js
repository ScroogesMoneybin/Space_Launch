const {parse} = require('csv-parse');
const fs = require('fs');
const path = require('path');
const planets = require('./planets.mongo');

const isHabitable = (planet) => {
    return planet['koi_disposition']==='CONFIRMED' && 0.36<planet['koi_insol'] && planet['koi_insol']<1.11 && planet['koi_prad']<1.6;
}

//Need a function to return a promise so data has a chance to load before website pulls up data so data isn't streamed empty when initially loaded
function loadPlanetsData () {
    //fs reads in stream of raw buffers, which we parse into useable csv info with parse function that goes with stream functions.  pipe() connects fs stream module with parse (readable -> writeable)
    return new Promise ((resolve, reject) => {fs.createReadStream(path.join(__dirname,'..','data','kepler_data.csv')).pipe(parse({
        comment: '#', /*says anything starting with # is a comment*/
        columns: true  /*returns js object with key-value pairs*/
    })).on('data',async (data)=>{
        if (isHabitable(data)) {
            updatePlanets(data);
        }
    }).on('error',(error)=>{
        console.log('error',error)
        reject(error);
    }).on('end', async ()=> {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} planets`);
        resolve();
    });
    
    });
}

async function getAllPlanets () {
    return await planets.find({}, {'_id': 0, '__v': 0});
}

async function updatePlanets (planet) {
    try {
         //insert + update = upsert   -> Mongoose operation to insert database values only if they don't exist
         await planets.findOneAndUpdate({  /*We use findOneAndUpdate instead of updateOne because updateOne can return extranious data to the console, but findOneAndUpdate only returns the info we specify */
            keplerName: planet.kepler_name  /*creating Mongodo object with planet name corresponding to the name from the kepler data name column */
        },
        {
            keplerName: planet.kepler_name  /*creating Mongodo object with planet name corresponding to the name from the kepler data name column */
        },
        {
            upsert: true  /*creating Mongodo object with planet name corresponding to the name from the kepler data name column */
        });
    }
    catch (err) {
        console.error(`Planet not saved: ${err}`)
    }
   
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
};