import * as React from "react";
import "../App.css";
import { AirQualityContext } from "../Context/DigitalTwinContext";
//interactions for AQ, SR
/* {
    "room_id": "0090",
    "device_id": "Raspi-4-1",
    "ventilator": "no",
    "co2": 1000.0,
    "co2measurementunit": "ppm",
    "temperature": 10.0,
    "temperaturemeasurementunit": "degree celcius",
    "humidity": 60.0,
    "humiditymeasurementunit": "rh",
    "time": "2023-04-15T10:35:23.600000+00:00"
  } */
function Interactions() {
  const [showDT, setShowDT] = React.useState(false);
  const [showDF, setShowDF] = React.useState(false);
  const [showDC, setShowDC] = React.useState(false);
  const [showOP, setShowOP] = React.useState(false);
  const [showAlerts, setShowAlerts] = React.useState(false);
  // const airQualityData = React.useContext(AirQualityContext);
  // console.log(airQualityData);
  function toggle(category) {
    if (category === "DT") {
      setShowDT(!showDT);
    } else if (category === "DF") {
      setShowDF(!showDF);
    } else if (category === "DC") {
      setShowDC(!showDC);
    } else if (category === "OP") {
      setShowOP(!showOP);
    } else {
      setShowAlerts(!showAlerts);
    }
  }
  return (
    <>
      <div>
        <h1>Speech Interactions for Digital Twins</h1>
        <div onClick={() => toggle("DT")} className="category">
          Digital Twin availability and status
        </div>
        {showDT && (
          <ul>
            <li>Which type of twins are available for interaction</li>
            <li>Which are the Active twins</li>
          </ul>
        )}
        <div onClick={() => toggle("DF")} className="category">
          Data filtration
        </div>
        {showDF && (
          <ul>
            Air Quality Use Case
            <li>Get the minimum and maximum range for specific property</li>
            <li>Filter the property above/below the specific range</li>
            <li>Get the value for the specific time period</li>
            Smart Room Use Case
            <li>
              Based on the state of the smart devices (on/off) we could get the
              information about when the devices were turned on/off over the
              date-time interval
            </li>
          </ul>
        )}
        <div onClick={() => toggle("DC")} className="category">
          Data comparison
        </div>
        {showDC && (
          <ul>
            Air Quality Use Case
            <li>
              What is the maximum value of co2 value among different twins and
              why is the co2 in room 0090 is higher (i.e people in room is more
              than intended)
            </li>
            Smart Room Use Case
            <li>
              How the co2 value has decreadsed/increased with &without the use
              of smart devices
            </li>
          </ul>
        )}
        <div onClick={() => toggle("OP")} className="category">
          Operations on the digital twins
        </div>
        {showOP && (
          <ul>
            Smart Room Use Case
            <li>Toggle ventilators on/off</li>
            <li>Change the color of the light</li>
          </ul>
        )}
        <div onClick={() => toggle("alerts")} className="category">
          Notification alerts and operations on digital twin based on alerts
          rule-set
        </div>
        {showAlerts && (
          <ul>
            <li>
              Desktop notifications when property value exceeds provided range
            </li>
            <li>
              Toggle ventilators when co2 value is above the specified range
            </li>
            <li>Change the light to red/green color based on the co2 value</li>
            <li>
              Change the background of the application according to the
              threshold range as an indicator
            </li>
          </ul>
        )}
      </div>
    </>
  );
}
export default Interactions;
