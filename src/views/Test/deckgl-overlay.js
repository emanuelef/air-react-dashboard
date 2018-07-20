import React, { Component } from "react";
import DeckGL, { ScatterplotLayer } from "deck.gl";

import chroma from "chroma-js";

const PICKUP_COLOR = [0, 128, 255];
const DROPOFF_COLOR = [255, 0, 128];

export default class DeckGLOverlay extends Component {
  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    if (!this.props.data) {
      return null;
    }

    let scale = chroma.scale(['red', 'white']);

    const colourPoint = (altitude, min = 100, max = 500) => {
      let normAltitude = altitude > max ? max : altitude;
      normAltitude = normAltitude < min ? min : normAltitude;
      return scale((normAltitude - min) / (max - min)).rgb();
    };

    const layers = [
      new ScatterplotLayer({
        id: "scatterplot",
        getPosition: d => d.position,
        getColor: d => colourPoint(d.altitude, 350, 1100),
        getRadius: d => 8,
        opacity: 0.2,
        pickable: false,
        radiusScale: 10,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        ...this.props
      })
    ];

    return (
      <DeckGL
        {...this.props.viewport}
        layers={layers}
        onWebGLInitialized={this._initialize}
      />
    );
  }
}
