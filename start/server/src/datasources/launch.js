// RESTDataSource = apollo class for fetching data from REST API
const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  async getAllLaunches() {
    // User Apollo REST data sources helper method 'get' to make a request to this.baseURL
    const response = await this.get('launches');
    return Array.isArray(response)
      //If content exists we map over each 'response' object with our reducer
      ? response.map(launch => this.launchReducer(launch))
      : [];
  }

  //We're writing this separately from getAllLaunches() so that our graph API is decoupled from logic specific to our REST API. This is our 'Convert Space X to our info' section while getAllLaunches() is simply getting and mapping our response
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }

  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }
  
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })),
    );
  }
}

module.exports = LaunchAPI;