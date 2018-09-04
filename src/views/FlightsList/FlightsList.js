import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
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

import * as ss from "simple-statistics";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import DateTimePicker from "react-widgets/lib/DateTimePicker";

const Papa = require("papaparse/papaparse.min.js");

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};

const hoursLabels = [...Array(24).keys()].map(val => (val + 1).pad(2) + ":00");

class FlighstList extends Component {
  constructor(props) {
    super(props);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.state = {
      flights: [],
      options: {},
      currentDate: moment()
        .add(-1, "days")
        .toDate()
    };
    moment.locale("en");
    momentLocalizer();
  }

  handleDateChange(date) {
    this._fetchDataFlights(date);
  }

  _fetchDataFlights(date) {
    date = date || this.state.currentDate;

    let start = moment(date)
      .utc()
      .endOf("day")
      .unix();
    let end = moment(date)
      .utc()
      .add(1, "d")
      .endOf("day")
      .unix();

    this.setState({ currentDate: date });

    Papa.parse(
      "https://s3.eu-west-2.amazonaws.com/operations-lhr-csv/rows.csv",
      {
        download: true,
        complete: function(results) {
          console.log(results);
        }
      }
    );

    console.log(start, end);

    axios
      .get(
        `https://q4yitwm037.execute-api.eu-west-2.amazonaws.com/dev/flights?from=${start}&to=${end}`
      )
      .then(res => {
        let flightsBelowDistance = res.data
          .filter(fl => fl.minDistance < 1200)
          .sort((a, b) => a.minDTimestamp - b.minDTimestamp);

        const bins = [...Array(24).keys()].map(val => []);
        for (let fl of flightsBelowDistance) {
          let binIndex = Math.floor((fl.minDTimestamp - start) / 60 / 60);
          bins[binIndex].push(fl);
        }

        let numFlights = [];
        let medianDistances = [];
        let minDistances = [];

        for (let bin of bins) {
          numFlights.push(bin.length);
          const distances = bin.map(fl => fl.minDistance);
          medianDistances.push(bin.length ? ss.median(distances) : 0);
          minDistances.push(bin.length ? ss.min(distances) : 0);
        }

        const optionsData = {
          chart: {
            zoomType: "xy"
          },
          title: {
            text: "Daily Flights and Median distance"
          },
          subtitle: {
            text: "Counted flights less than 1200m"
          },
          xAxis: [
            {
              categories: hoursLabels,
              crosshair: true
            }
          ],
          yAxis: [
            {
              // Primary yAxis
              labels: {
                format: "{value}m",
                style: {
                  color: Highcharts.getOptions().colors[1]
                }
              },
              title: {
                text: "Median distance",
                style: {
                  color: Highcharts.getOptions().colors[1]
                }
              }
            },
            {
              // Secondary yAxis
              title: {
                text: "Flights below 1200m",
                style: {
                  color: Highcharts.getOptions().colors[0]
                }
              },
              labels: {
                format: "{value}",
                style: {
                  color: Highcharts.getOptions().colors[0]
                }
              },
              opposite: true
            }
          ],
          tooltip: {
            shared: true
          },
          legend: {
            layout: "vertical",
            align: "left",
            x: 60,
            verticalAlign: "top",
            y: 10,
            floating: true,
            backgroundColor:
              (Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
              "#FFFFFF"
          },
          series: [
            {
              name: "Flights",
              type: "column",
              yAxis: 1,
              pointWidth: 25,
              animation: false,
              data: numFlights,
              tooltip: {
                valueSuffix: ""
              }
            },
            {
              name: "Median distance",
              type: "spline",
              animation: false,
              data: medianDistances,
              tooltip: {
                valueSuffix: "m"
              }
            },
            {
              name: "Min distance",
              type: "spline",
              animation: false,
              data: minDistances,
              tooltip: {
                valueSuffix: "m"
              }
            }
          ]
        };

        this.setState({
          flights: res.data.sort((a, b) => b.minDTimestamp - a.minDTimestamp),
          options: optionsData,
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
        <Col>
          <Card>
            <div>
              <DateTimePicker
                format="D MMMM YYYY"
                defaultValue={new Date()}
                time={false}
                onCurrentDateChange={this.handleDateChange}
              />
              <HighchartsReact
                highcharts={Highcharts}
                options={this.state.options}
              />
            </div>
          </Card>
        </Col>

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
