import React, { Component } from "react";
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

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

import * as ss from "simple-statistics";

import DateTimePicker from "react-widgets/lib/DateTimePicker";

import {
  DateRangePicker,
  SingleDatePicker,
  DayPickerRangeController
} from "react-dates";

const Papa = require("papaparse/papaparse.min.js");

const options = {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false
  },
  title: {
    text: "Browser<br>shares<br>2017",
    align: "center",
    verticalAlign: "middle",
    style: {
      fontSize: "12px"
    },
    y: 40
  },
  tooltip: {
    pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: true,
        format: "<b>{point.name}</b><br>{point.percentage:.1f} %",
        distance: -50,
        style: {
          fontWeight: "bold",
          color: "white"
        }
      },
      startAngle: -90,
      endAngle: 90,
      center: ["50%", "75%"]
    }
  },
  series: [
    {
      type: "pie",
      name: "Browser share",
      innerSize: "50%",
      data: [
        ["Chrome", 58.9],
        ["Firefox", 13.29],
        ["Internet Explorer", 13],
        ["Edge", 3.78],
        ["Safari", 3.42],
        {
          name: "Other",
          y: 7.61,
          dataLabels: {
            enabled: false
          }
        }
      ]
    }
  ]
};

class OperationsStats extends Component {
  constructor(props) {
    super(props);

    moment.locale("en");
    momentLocalizer();

    this.state = {
      flights: [],
      startDate: moment("2018-1-1"),
      endDate: moment("2018-3-1"),
      options,
      west: []
    };

    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this._recalculatePercentage = this._recalculatePercentage.bind(this);
  }

  _recalculatePercentage(start, end) {
    const startDataDate = moment("2015-1-1");

    const startIndex = Math.abs(startDataDate.diff(start, "days"));
    const endIndex = Math.abs(startDataDate.diff(end, "days"));

    console.log(startIndex, endIndex);

    const rangedWest = this.state.west.slice(startIndex + 1, endIndex + 2);

    if (rangedWest.length === 0) {
      return;
    }

    console.log("arr size:", rangedWest.length);
    console.log(rangedWest);

    const westOpsPerc = ss.mean(rangedWest) * 100;
    const eastOpsPerc = 100 - westOpsPerc;

    const optionsData = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
      },
      title: {
        text: "LHR Operations",
        align: "center",
        verticalAlign: "middle",
        y: 40
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            distance: -50,
            style: {
              fontWeight: "bold",
              color: "white"
            }
          },
          startAngle: -90,
          endAngle: 90,
          center: ["50%", "75%"]
        }
      },
      series: [
        {
          type: "pie",
          name: "Operations",
          innerSize: "50%",
          data: [["Westerly", westOpsPerc], ["Easterly", eastOpsPerc]]
        }
      ]
    };

    //this.setState({ startDate: moment(date) });

    this.setState({ options: optionsData, startDate: start, endDate: end });
  }

  _fetchOpsData() {
    Papa.parse(
      "https://s3.eu-west-2.amazonaws.com/operations-lhr-csv/rows.csv",
      {
        download: true,
        complete: results => {
          const west = results.data.map(el => {
            return Number(el[1]);
          });

          this.setState({ west });
          this._recalculatePercentage(this.state.startDate, this.state.endDate);
        }
      }
    );
  }

  componentDidMount() {
    this._fetchOpsData();
  }

  componentWillUnmount() {}

  _dateRangeChanged({ startDate, endDate }) {
    console.log(endDate);
    this.setState({ startDate, endDate });
  }

  handleStartDateChange(date) {
    console.log(date);
    //this.setState({ startDate: moment(date) });
    this._recalculatePercentage(moment(date), this.state.endDate);
  }

  handleEndDateChange(date) {
    console.log(date);
    //this.setState({ endDate: moment(date) });
    this._recalculatePercentage(this.state.startDate, moment(date));
  }

  render() {
    return (
      <div>
        <Col>
          <Card>
            <DateTimePicker
              format="D MMMM YY"
              defaultValue={this.state.startDate.toDate()}
              time={false}
              onCurrentDateChange={this.handleStartDateChange}
              min={new Date(2015, 0, 1)}
              max={new Date(2018, 6, 21)}
            />
            <DateTimePicker
              format="D MMMM YY"
              defaultValue={this.state.endDate.toDate()}
              time={false}
              onCurrentDateChange={this.handleEndDateChange}
              min={new Date(2015, 0, 1)}
              max={new Date(2018, 6, 21)}
            />
            <HighchartsReact
              highcharts={Highcharts}
              options={this.state.options}
            />
          </Card>
        </Col>
        <Col>
          <Card>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </Card>
        </Col>
      </div>
    );
  }
}

export default OperationsStats;
