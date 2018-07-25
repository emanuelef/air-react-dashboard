import React, { Component } from "react";
import LocationPicker from "react-location-picker";
import axios from "axios";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
import "react-widgets/dist/css/react-widgets.css";
import DateTimePicker from "react-widgets/lib/DateTimePicker";

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
      },
      currentDate: Date()
    };

    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    //this.updateStats = this.updateStats.bind(this);

    moment.locale("en");
    momentLocalizer();
  }

  updateStats() {
    let start = moment(this.state.currentDate)
      .utc()
      .startOf("day")
      .unix();
    let end = moment(this.state.currentDate)
      .utc()
      .endOf("day")
      .unix();

    const lat = this.state.position.lat;
    const lng = this.state.position.lng;

    this.setState({ status: "LOADING..." });

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/allFlightsInBox?from=${start}&to=${end}&lat=${lat}&lon=${lng}&max=2500&minDistance=1200&summaryOnly=1`
      )
      .then(res => {
        console.log(res.data);
        this.setState({ data: res.data, status: "OK" });
      })
      .catch(error => {
        console.log("ERROR");
        this.setState({ status: "ERROR" });
        console.log(error);
      });
  }

  handleDateChange(date) {
    this.setState({ currentDate: date });
    this.updateStats();
  }

  handleLocationChange({ position, address }) {
    this.props.onLocationChanged(position);
    this.setState({ position, address });
    this.updateStats();
  }

  render() {
    return (
      <div>
        <h1>{this.state.address}</h1>
        <DateTimePicker
          format='D MMMM YY'
          defaultValue={new Date()}
          time={false}
          onCurrentDateChange={this.handleDateChange}
        />
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
