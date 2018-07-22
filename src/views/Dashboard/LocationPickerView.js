import React, { Component } from "react";
import LocationPicker from "react-location-picker";
import axios from "axios";
import moment from "moment";

/* Default position */
const defaultPosition = {
  lat: 51.444,
  lng: -0.350713
};

class LocationPickerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      status: "INIT",
      position: {
        lat: 0,
        lng: 0
      },
      data: {
        belowMaxDistance: 0,
        medianDistance: 0,
        minDistance: 0
      }
    };

    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  handleLocationChange({ position, address }) {
    this.props.onLocationChanged(position);

    let start = moment
      .utc()
      .startOf("day")
      .unix();
    let end = moment
      .utc()
      .endOf("day")
      .unix();

    this.setState({ status: "LOADING..." });

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/allFlightsInBox?from=${start}&to=${end}&lat=${
          position.lat
        }&lon=${position.lng}&max=2500&minDistance=1200&summaryOnly=1`
      )
      .then(res => {
        console.log(res.data);
        this.setState({ position, address, data: res.data, status: "OK" });
      })
      .catch(error => {
        console.log("ERROR");
        this.setState({ status: "ERROR" });
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <h1>{this.state.address}</h1>
        <div>
          <LocationPicker
            containerElement={<div style={{ height: "100%" }} />}
            mapElement={<div style={{ height: "400px" }} />}
            defaultPosition={defaultPosition}
            onChange={this.handleLocationChange}
          />
        </div>
        <h3>Status: {this.state.status}</h3>
        <h3>Num below: {this.state.data.belowMaxDistance}</h3>
        <h3>Median Distance: {this.state.data.medianDistance}m</h3>
        <h3>Min Distance: {this.state.data.minDistance}m</h3>
      </div>
    );
  }
}

export default LocationPickerView;
