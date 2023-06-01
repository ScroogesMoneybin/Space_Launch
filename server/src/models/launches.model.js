//models deal with the data directly
const axios = require('axios');
const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_INITIAL_FLIGHT_NUMBER = 100;

//This was a sample object for a launch to show key-value pairs in it.
// const launch = {
//     mission: '100',
//     rocket: 'Apollo 11',
//     target: 'Kepler-62 f',
//     launchDate: 'January 1, 2030',
//     success: true,
//     upcoming: true,
//     customers: ['You', 'NASA'],
//     flightNumber: 100
// }
// saveLaunch(launch);

async function populateLaunchesData() {

    //We use a POST request to the SpaceX API to allow us to send a set of query parameters as the 2nd argument giving more control than GET request
    const response = await axios.post(`${process.env.SPACEX_API_URL}`,{
        
        query: {},  /*Query all launches */
        options: {
            pagination: false,  /*Turn off pagination that splits up api response into pages */
            //Most of our needed values are on the top line of the response, but we have only references to rocket and customers in a different path.
            //So we use populate with path and parameters to grab the rocket and customers
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    })

    if (response.status !== 200) {
        console.log('Problem downloading launch data...');
        throw new Error ('Launch data download failed...')
    }

    const launchDocs = response.data.docs;

    for (let launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload)=> payload['customers'])

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }

        await saveLaunch(launch);
    }

}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if (firstLaunch) {
        console.log("Launch already loaded")        
    }
    else {
        await populateLaunchesData();
    }
    
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function existsLaunchId (launchId) {
    return await findLaunch({flightNumber: launchId});
}

async function getAllLaunches (skip, limit) {
    return await launches.find({}, {'_id': 0, '__v': 0})
    .sort({flightNumber: 1}) /*sort the results by flightNumber where 1 indicates ascending order (-1 value would give descending order)*/
    .skip(skip)
    .limit(limit);
} 

async function getLatestFlightNumber () {
    const latestLaunch = await launches.findOne().sort('-flightNumber');   /* -flightNumber sorts launches by launchNumber in descending order, findOne returns the first item in the returned array */
    if (!latestLaunch) {
        return DEFAULT_INITIAL_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}


async function saveLaunch (launch) {
    try{
        await launches.findOneAndUpdate({flightNumber: launch.flightNumber}, launch,
            {
            upsert: true  /*creating Mongodo object with planet name corresponding to the name from the kepler data name column */
        })
    }
    catch (err) {
        console.error(`Launch not saved: ${err}`)
    }
}

async function addNewLaunch (launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })
    if(!planet) {
        //prevents a planet not in our list from being added to the launch as a target
        throw new Error('That planet is not found!')
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['placeholder', 'NASA'],
        flightNumber: newFlightNumber,
        
    })
    await saveLaunch(newLaunch);


    
}

async function abortLaunchById(launchId) {
    const aborted = await launches.updateOne({flightNumber: launchId}, {upcoming: false, success: false})

    return aborted.modifiedCount === 1;;

}

module.exports = {
    loadLaunchesData,
    existsLaunchId,
    getAllLaunches,
    addNewLaunch,
    abortLaunchById
}