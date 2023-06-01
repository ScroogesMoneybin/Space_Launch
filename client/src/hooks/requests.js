// const API_URL = 'http://localhost:8000/v1';

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${process.env.HOST_URL}/v1/planets`)   /*fetch defaults to GET*/
  //.json() returns a promise so we must await it
  return await response.json();
  
}

async function httpGetLaunches() {
  
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${process.env.HOST_URL}/v1/launches`)  /*fetch defaults to GET*/
  //.json() returns a promise so we must await it
  const listOfLaunches = await response.json();
  //sort launch list by ascending number of flight number
  return listOfLaunches.sort((a,b)=> a.flightnumber - b.flightnumber);
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try{
    //If success, we return 200 status that returns a ok value of true, which is needed on front end in useLaunches() function in hooks
    return await fetch(`${process.env.HOST_URL}/v1/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch) /*launch is an object passed in so we need to convert it to a string */
    })
  }
  catch (error) {
    return {
      //ok value of false triggers failure on front end
      ok: false
    }
  }
 
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try {
    return await fetch(`${process.env.HOST_URL}/v1/launches/${id}`, {
      method: "delete",

    })
  }
  catch (error) {
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};