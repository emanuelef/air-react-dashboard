import { withSize } from 'react-sizeme';
import Plot from "react-plotly.js";
import React, { Component } from "react";

const PlotContainer = props => {
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: "scatter",
          mode: "lines+points",
          marker: { color: "red" }
        },
        { type: "bar", x: [1, 2, 3], y: [7, 5, 3] }
      ]}
      layout={{
        autosize: false,
        width: '100%'
      }}
    />
  );
};

export default withSize()(PlotContainer);
