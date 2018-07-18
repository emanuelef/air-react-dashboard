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

    let scale = chroma.scale(["white", "red"]);
    const colourPoint = altitude => {
      let normAltitude = altitude > 500 ? 1000 : altitude;
      normAltitude = normAltitude < 100 ? 100 : normAltitude;
      return scale((normAltitude - 100) / 400).rgb();
    };

    const layers = [
      new ScatterplotLayer({
        id: "scatterplot",
        getPosition: d => d.position,
        getColor: d => colourPoint(d.altitude),
        getRadius: d => 3,
        opacity: 0.5,
        pickable: false,
        radiusScale: 5,
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
