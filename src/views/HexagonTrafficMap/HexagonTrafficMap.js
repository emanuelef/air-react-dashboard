import React, { Component } from "react";
import { defaultMapStyle, pointLayer } from "./map-style.js";
import axios from "axios";
import moment from "moment";

import ReactMapGL from "react-map-gl";
import DeckGLOverlay from "./deckgl-overlay";
import taxiData from "./taxi";

class HexagonTrafficMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: defaultMapStyle,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -0.350713,
        latitude: 51.444,
        zoom: 12,
        maxZoom: 16
      }
    };
    this._resize = this._resize.bind(this);
  }

  /*   state = {
    mapStyle: defaultMapStyle,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: 51.444,
      longitude: -0.350713,
      zoom: 11,
      maxZoom: 16
    }
  }; */

  componentDidMount() {
    window.addEventListener("resize", this._resize);

    let start = moment
      .utc()
      .startOf("day")
      .unix();
    let end = moment.utc().endOf("day").unix();
/*     let end = moment
      .utc()
      .startOf("day")
      .add(7, "hours")
      .unix(); */

    // 1531259370
    // 1531864196

    console.log(start, end);

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/all?from=${start}&to=${end}&latLonOnly=1`
      )
      .then(res => {
        console.log(res.data.length);
        this._processDataFlights(res.data);
      })
      .catch(error => {
        console.log("ERROR");
        console.log(error);
      });

    //this._processData();
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
  }

  _processDataFlights(flights) {
    if (flights) {
      this.setState({ status: "LOADED" });
      const points = flights.reduce((accu, curr) => {
        accu.push({
          position: [Number(curr.longitude), Number(curr.latitude)],
          altitude: Number(curr.galtM)
        });
        return accu;
      }, []);
      this.setState({
        points,
        status: "READY"
      });
    }
  }

  _resize = () =>
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });

  _onViewportChange = viewport =>
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });

  render() {
    return (
      <ReactMapGL
        {...this.state.viewport}
        mapboxApiAccessToken={
          "pk.eyJ1IjoiZW1hZnVtYSIsImEiOiJjamh1ZGVoZGowbGExM3duMDkwMnhtNDhiIn0.xgW6mtfaTEgFNw8jC6i_Yw"
        }
        onViewportChange={viewport => this._onViewportChange(viewport)}
      >
        <DeckGLOverlay
          viewport={this.state.viewport}
          data={this.state.points}
        />
      </ReactMapGL>
    );
  }
}

export default HexagonTrafficMap;
