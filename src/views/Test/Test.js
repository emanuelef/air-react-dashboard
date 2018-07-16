import React, { Component } from "react";
import { defaultMapStyle, pointLayer } from "./map-style.js";

import ReactMapGL from "react-map-gl";
import DeckGLOverlay from "./deckgl-overlay";
import taxiData from "./taxi";

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: defaultMapStyle,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -74,
        latitude: 40.7,
        zoom: 11,
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
    this._processData();
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
  }

  _processData() {
    if (taxiData) {
      this.setState({ status: "LOADED" });
      const points = taxiData.reduce((accu, curr) => {
        accu.push({
          position: [
            Number(curr.pickup_longitude),
            Number(curr.pickup_latitude)
          ],
          pickup: true
        });
        accu.push({
          position: [
            Number(curr.dropoff_longitude),
            Number(curr.dropoff_latitude)
          ],
          pickup: false
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

export default Test;
