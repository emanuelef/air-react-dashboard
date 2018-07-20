import React, { Component } from "react";
import axios from "axios";
import moment from "moment";

import ReactMapGL from "react-map-gl";
import DeckGLOverlay from "./deckgl-overlay";

import { tooltipStyle } from "../MapUtils/style";

const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v9";

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapStyle: MAPBOX_STYLE,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -0.350713,
        latitude: 51.444,
        zoom: 11,
        maxZoom: 18
      }
    };
    this._resize = this._resize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this._resize);

    let start = moment
      .utc()
      .startOf("day")
      .unix();
    let end = moment
      .utc()
      .endOf("day")
      .unix();

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/all?from=${start}&to=${end}&latLonOnly=1`
      )
      .then(res => {
        console.log(res.data);
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

  _onHover({ x, y, object }) {
    this.setState({ x, y, hoveredObject: object });
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
      <div
        style={{
          margin: "-30px"
        }}
      >
        {this.state.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${this.state.x + 5}px, ${this.state.y +
                5}px)`
            }}
          >
            <div>{JSON.stringify(this.state.hoveredObject)}</div>
          </div>
        )}
        <ReactMapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={
            "pk.eyJ1IjoiZW1hZnVtYSIsImEiOiJjamh1ZGVoZGowbGExM3duMDkwMnhtNDhiIn0.xgW6mtfaTEgFNw8jC6i_Yw"
          }
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={this.state.points}
            onHover={hover => this._onHover(hover)}
          />
        </ReactMapGL>
      </div>
    );
  }
}

export default Test;
