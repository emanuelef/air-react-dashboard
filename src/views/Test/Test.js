import React, { Component } from "react";
import { Card, CardBody, CardColumns, CardHeader } from "reactstrap";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import {defaultMapStyle, pointLayer} from './map-style.js';

import ReactMapGL from "react-map-gl";

class Test extends Component {
  state = {
    mapStyle: defaultMapStyle,
    viewport: {
      width: 400,
      height: 400,
      latitude: 51.444,
      longitude: -0.350713,
      zoom: 11
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
  }

  _onViewportChange = viewport =>
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });

  _resize = () =>
    this._onViewportChange({
      width: this.props.width || window.innerWidth,
      height: this.props.height || window.innerHeight
    });

  render() {
    return (
      <ReactMapGL
        {...this.state.viewport}
        mapboxApiAccessToken={
          "pk.eyJ1IjoiZW1hZnVtYSIsImEiOiJjamh1ZGVoZGowbGExM3duMDkwMnhtNDhiIn0.xgW6mtfaTEgFNw8jC6i_Yw"
        }
        onViewportChange={viewport => this.setState({ viewport })}
      />
    );
  }
}

export default Test;
