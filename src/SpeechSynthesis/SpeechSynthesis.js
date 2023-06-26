import * as React from "react";
import axios from "axios";
import RangeSlider from "react-bootstrap-range-slider";
import NotificationComponent from "../Notification/Notification";
import styled from "styled-components";
import Rules from "../RuleSet.js";
import CDL_logo from "../assets/CDL_logo.png";
import { AirQualityContext } from "../AirQualityContext";
import { DigitalTwinStatusContext } from "../DigitalTwinStatusContext";
import { airQualityModel } from "../NLModel";

export default function SpeechSynthesis() {
  const [filteredData, setFilteredData] = React.useState([]);
  const [selectedProperty, setSelectedProperty] = React.useState("co2");
  const [currentRangeValue, setCurrentRangeValue] = React.useState(0);
  const [selectedRange, setSelectedRange] = React.useState("above");
  const [minValue, setMinValue] = React.useState(0);
  const [maxValue, setMaxValue] = React.useState(0);
  let msg = new SpeechSynthesisUtterance();
  const { currentDTStatus, days, lastRecord } = React.useContext(
    DigitalTwinStatusContext
  );
  const airQualityData = React.useContext(AirQualityContext);

  //filter data based on property and selected range value
  // function GetFilteredData(property, value, selectedRange) {
  //   if (selectedRange === "above") {
  //     airQualityData
  //       ? setFilteredData(
  //           airQualityData.filter((i) =>
  //             i[property] > value ? i[property] : 0
  //           )
  //         )
  //       : "";
  //   } else if (selectedRange === "below") {
  //     airQualityData
  //       ? setFilteredData(
  //           airQualityData.filter((i) =>
  //             i[property] < value ? i[property] : 0
  //           )
  //         )
  //       : "";
  //   }
  //   return filteredData;
  // }
  //store the selected property
  function handleChange(e) {
    setSelectedProperty(e.target.value);
  }
  //choose range level for range
  function handleRange(e) {
    setSelectedRange(e.target.value);
  }
  //set range for selected property
  function SetRange(selectedProperty) {
    let property = airQualityData
      ? airQualityData.map((m) => m[selectedProperty])
      : "";

    setMaxValue(Math.max(...property));
    setMinValue(Math.min(...property));
    return property;
  }
  function Properties() {
    return (
      <>
        <h2>Speech Synthesis</h2>
        <h3 className="filter">Apply filters on the air quality data</h3>
        <div className="slider">
          <label for="dataProperties">Choose property</label>
          <select
            id="dataProperties"
            onChange={handleChange}
            value={selectedProperty}
          >
            <option id="co2" value="co2">
              CarbonDioxide
            </option>
            <option id="temperature" value="temperature">
              Temperature
            </option>
            <option id="humidity" value="humidity">
              Humidity
            </option>
          </select>
        </div>
      </>
    );
  }
  function Slider() {
    return (
      <div class="row" className="slider">
        <div class="col-sm-4">
          <label>Select range:</label>
        </div>
        <div class="col-sm-4">
          <select id="dataRange" onChange={handleRange} value={selectedRange}>
            <option id="above" value="above">
              Above
            </option>
            <option id="below" value="below">
              Below
            </option>
          </select>
        </div>
        <div class="col-sm-4">
          <RangeSlider
            value={currentRangeValue}
            min={minValue}
            max={maxValue}
            onChange={(changeEvent) =>
              setCurrentRangeValue(changeEvent.target.value)
            }
            tooltipPlacement="top"
          />
        </div>
      </div>
    );
  }
  function SpeechControls() {
    const play = () => {
      let result = filteredData.map((i) => i[selectedProperty]);
      const speechOutput = result.map((i) => {
        let msg = new SpeechSynthesisUtterance();
        msg.text = `The ${selectedProperty} in room 0090 is ${i.toLocaleString(
          "en"
        )}`;
      });
      return speechOutput;
    };
    const play1 = () => {
      console.log("btn clicked");
      let msg = new SpeechSynthesisUtterance();
      msg.text = `The digital twin is currently ${currentDTStatus}, last recorded measurement was ${days.toLocaleString(
        "en"
      )} days ago,
        The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
          "en"
        )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
        "en"
      )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
        "en"
      )}`;
      window.speechSynthesis.speak(msg);
      return msg;
    };
    const pause = () => {
      window.speechSynthesis.pause();
    };
    const resume = () => {
      window.speechSynthesis.resume();
    };
    return (
      <div className="spacing">
        <Button onClick={play1}>
          <i class="fa-solid fa-play"></i> Play
        </Button>
        <Button onClick={pause}>
          <i class="fa-solid fa-pause"></i> Pause
        </Button>
        <Button onClick={resume}>Resume</Button>
        <Button
          onClick={() => showNotification(selectedProperty, filteredData)}
        >
          <i class="fa-solid fa-bell"></i> Notify
        </Button>
        {/* <NotificationComponent
          property={selectedProperty}
          filteredValues={filteredData}
        /> */}
      </div>
    );
  }
  function showNotification(selectedProperty, filteredData) {
    filteredData.map((m) => {
      let options = {
        body: `The ${selectedProperty} value is ${m[selectedProperty]}`,
        icon: CDL_logo,
        dir: "ltr",
      };
      new Notification("Air Quality Info", options);
    });
  }
  React.useEffect(() => {
    let msg = new SpeechSynthesisUtterance();
    SetRange(selectedProperty);
    //GetFilteredData(selectedProperty, currentRangeValue, selectedRange);
  }, [selectedProperty, currentRangeValue, selectedRange]);
  //visual notification
  // React.useEffect(() => {
  //   console.log("useeffect", filteredData);
  //   filteredData.map((m) => {
  //     if (
  //       selectedProperty === Rules.property &&
  //       m[selectedProperty] > Rules.value
  //     ) {
  //       document.body.style.background = "#FFA38F ";
  //     } else if (
  //       selectedProperty === Rules.property &&
  //       m[selectedProperty] < Rules.value
  //     ) {
  //       document.body.style.background = "#C4FF8F";
  //     } else {
  //       document.body.style.background = "#FFFFFF";
  //     }
  //     // TogglePlug();
  //   });
  // }, [selectedProperty, filteredData]);
  //manual notification alert
  React.useEffect(() => {
    if ("Notification" in window) {
      console.log("chrome supports notification!");
      Notification.requestPermission();
    } else {
      console.log("chrome doesn't support notification!");
    }
  }, []);

  return (
    <>
      <Properties />
      <Slider />
      <SpeechControls />
    </>
  );
}
const Button = styled.button`
  width: 80px;
  height: 25px;
  background-color: #61dafb;
  border-radius: 5px;
  border: 1px solid white;
  &:hover {
    background-color: white;
    border: 1px solid dodgerblue;
  }
`;
