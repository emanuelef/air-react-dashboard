import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  Collapse,
  Fade
} from "reactstrap";
import { AppSwitch } from "@coreui/react";

class FlighstList extends Component {
  constructor(props) {
    super(props);
    this.state = { flights: [] };
  }

  _fetchDataFlights(daysAgo = 0) {
    let start = moment
      .utc()
      .subtract(daysAgo, "days")
      .startOf("day")
      .unix();
    let end = moment
      .utc()
      .subtract(daysAgo, "days")
      .endOf("day")
      .unix();
    /*     let end = moment
    .utc()
    .startOf("day")
    .add(7, "hours")
    .unix(); */

    console.log(start, end);

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/flights?from=${start}&to=${end}`
      )
      .then(res => {
        console.log(res.data.length);
        this.setState({
          flights: res.data.sort((a, b) => b.minDTimestamp - a.minDTimestamp),
          status: "READY"
        });
      })
      .catch(error => {
        console.log("ERROR");
        console.log(error);
      });
  }

  componentDidMount() {
    this._fetchDataFlights();
  }

  componentWillUnmount() {}

  render() {
    return (
      <div>
        {this.state.flights.map(flight => (
          <Row key={flight.id}>
            <Col>
              <Card>
                <CardHeader>
                  {flight.icao}
                  <Badge pill color="danger" className="float-right">
                    {flight.minDAltitude}
                  </Badge>
                </CardHeader>
                <CardBody>
                  {moment(flight.minDTimestamp * 1000).format("D-M-YY H:mm:ss")}
                  <br />
                  {`From: ${flight.from}`}
                  <br />
                  {`To: ${flight.to}`}
                  <br />
                </CardBody>
              </Card>
            </Col>
          </Row>
        ))}
      </div>
    );
  }
}

export default FlighstList;
