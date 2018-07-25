import React, { Component } from "react";
import { defaultMapStyle, pointLayer } from "../MapUtils/map-style.js";
import axios from "axios";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";

import "react-widgets/dist/css/react-widgets.css";
import DateTimePicker from "react-widgets/lib/DateTimePicker";

import ReactMapGL from "react-map-gl";
import DeckGLOverlay from "./deckgl-overlay";

import { tooltipStyle } from "../MapUtils/style";
import {
  LayerControls,
  SCATTERPLOT_CONTROLS
} from "../MapUtils/layer-controls";

class HexagonTrafficMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: Object.keys(SCATTERPLOT_CONTROLS).reduce(
        (accu, key) => ({
          ...accu,
          [key]: SCATTERPLOT_CONTROLS[key].value
        }),
        {}
      ),
      mapStyle: defaultMapStyle,
      viewport: {
        width: 0,
        height: 0,
        longitude: -0.342588,
        latitude: 51.443874,
        zoom: 12,
        maxZoom: 18
      },
      currentDate: Date()
    };
    this._resize = this._resize.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);

    moment.locale("en");
    momentLocalizer();
  }

  _fetchDataFlights() {
    let start = moment(this.state.currentDate)
      .utc()
      .startOf("day")
      .unix();
    let end = moment(this.state.currentDate)
      .utc()
      .endOf("day")
      .unix();

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/allZipped?from=${start}&to=${end}&latLonOnly=1`
      )
      .then(res => {
        console.log(res.data.length);
        this._processDataFlights(res.data);
      })
      .catch(error => {
        console.log("ERROR");
        console.log(error);
      });
  }

  handleDateChange(date) {
    this.setState({ currentDate: date });
    this._fetchDataFlights();
  }

  componentDidMount() {
    window.addEventListener("resize", this._resize);
    window.addEventListener("orientationchange", this._resize);
    this._fetchDataFlights();
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
    window.removeEventListener("orientationchange", this._resize);
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

  _updateLayerSettings(settings) {
    console.log(settings);
    this.setState({ settings });
    //this._fetchDataFlights(settings.radiusScale);
  }

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
            <div>{`num: ${this.state.hoveredObject.points.length}`}</div>
          </div>
        )}
        <DateTimePicker
          format='dddd, MMMM Do YYYY'
          defaultValue={new Date()}
          time={false}
          onCurrentDateChange={this.handleDateChange}
        />
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
            onHover={hover => this._onHover(hover)}
            {...this.state.settings}
          />
        </ReactMapGL>
      </div>
    );
  }
}

export default HexagonTrafficMap;
