import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";

import "react-widgets/dist/css/react-widgets.css";
import DateTimePicker from "react-widgets/lib/DateTimePicker";

import ReactMapGL from "react-map-gl";
import DeckGLOverlay from "./deckgl-overlay";

import { tooltipStyle } from "../MapUtils/style";

const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v9";

class AllPassages extends Component {
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
      },
      loadingPointsState: "Initializing...",
      currentDate: moment().add(-1, 'days').toDate()
    };
    this._resize = this._resize.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);

    moment.locale("en");
    momentLocalizer();
  }

  componentDidMount() {
    window.addEventListener("resize", this._resize);
    this.updatePassages();
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
  }

  updatePassages(date) {

    date = date || this.state.currentDate;

    let start = moment(date)
      .utc()
      .endOf("day")
      .unix();
    let end = moment(date)
      .utc()
      .add(1, 'd')
      .endOf("day")
      .unix();

    this.setState({ currentDate: date });
    this.setState({ loadingPointsState: "Fetching data..." });

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/allZipped?from=${start}&to=${end}&latLonOnly=1`
      )
      .then(res => {
        //console.log(res.data);
        this._processDataFlights(res.data);
        this.setState({
          loadingPointsState: `Retrieved ${res.data.length} points ${new Date(
            start * 1000
          )} - ${new Date(end * 1000)}`
        });
      })
      .catch(error => {
        console.log("ERROR");
        console.log(error);
        this.setState({ loadingPointsState: "Error while fetching data" });
      });
  }

  handleDateChange(date) {
    this.updatePassages(date);
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
            <div>{`${this.state.hoveredObject.altitude}m`}</div>
          </div>
        )}
        <DateTimePicker
          format="D MMMM YYYY"
          defaultValue={new Date()}
          time={false}
          onCurrentDateChange={this.handleDateChange}
        />
        <div style={{ marginLeft: "12px" }}>{`${
          this.state.loadingPointsState
        }`}</div>
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

export default AllPassages;
