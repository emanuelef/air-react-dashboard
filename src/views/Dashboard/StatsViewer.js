import React, { Component } from "react";

class StatsViewer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>{this.props.location.lat}</h1>
      </div>
    );
  }
}

export default StatsViewer;