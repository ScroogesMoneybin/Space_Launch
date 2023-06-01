//controllers deal with data models

const {getAllLaunches, addNewLaunch, existsLaunchId, abortLaunchById} = require('../../models/launches.model');
const {getPagination} = require('../../services/query')

async function httpGetAllLaunches (req,res) {
    const {skip, limit} = getPagination(req.query);
    //Array.from(launches.values()) takes values from key-value pairs in object then converts the list into an array 
    //that can be converted to json and returned back to front end
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch (req,res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Error in one of the entries"
        })
    }

    // Our launch date is passed in req as a json object, so we need to change it to a Date object
    launch.launchDate = new Date(launch.launchDate);

    //If the inputted launch date is not a date, then the following will return an error. 
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid entry for launch date"
        })
    }

    await addNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch (req, res) {
    const launchId = Number(req.params.id); 
    const existsLaunch = await existsLaunchId(launchId);

    if (!existsLaunch) {
        return res.status(404).json({
            error: "Launch Mission Not Found"
        });
    }
    const aborted = await abortLaunchById(launchId);

    if (!aborted) {
        return res.status(400).json({error: 'Launch abort failed.'})
    }

    return res.status(200).json({ok: true});

}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch, 
    httpAbortLaunch
}