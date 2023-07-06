import * as React from "react";
import "./App.css";
import SpeechSynthesis from "./SpeechSynthesis/SpeechSynthesis";
import Interactions from "./Interactions/Interactions";
import SpeechRecognition from "./SpeechRecognition/SpeechRecognition";
import NotificationComponent from "./Notification/Notification";
import Rules from "./RuleSet";
import axios from "axios";
import { DigitalTwinContext } from "../src/Context/DigitalTwinContext";
import { DigitalTwinStatusContext } from "../src/Context/DigitalTwinStatusContext";
import { AirQualityContext } from "../src/Context/AirQualityContext";
import SpeechModel from "./SpeechModel";

function App() {
  const [digitalTwinData, setDigitalTwinData] = React.useState([]);
  const [airQualityData, setAirQualityData] = React.useState([]);
  const [pages, setPages] = React.useState(1);
  const [lastRecord, setLastRecord] = React.useState([]);
  const [currentDTStatus, setCurrentDTStatus] = React.useState();
  const [days, setDays] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(0);

  function GetDigitalTwins() {
    let Results = axios
      .get(`https://airquality.se.jku.at/smartroomairquality-test/DigitalTwins`)
      .then((response) => {
        setDigitalTwinData(response.data);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        console.log("digital twin data is obtained from source");
      });

    return Results;
  }
  function CheckDigitalTwinsCapability(dtData, pageno) {
    if (dtData.map((i) => i === "AirQuality")) {
      let Results = axios
        .get(
          `https://airquality.se.jku.at/smartroomairquality-test/Room/0090/AirQuality/?page=${pageno}&size=100`
        )
        .then((response) => {
          setAirQualityData(response.data.items);
          setLastRecord(response.data.items[response.data.items.length - 1]);
          setPages(response.data.pages);
        })
        .catch((error) => console.error(error))
        .finally(() => {
          console.log("air quality data is obtained from source");
        });
      return Results;
    } else {
      console.log("there are no use-cases set up");
    }
  }
  function checkDTActiveStatus(lastRecord) {
    let currentDate = new Date();
    let lastRecordDateTime = lastRecord ? new Date(lastRecord.time) : 0;
    let timeDifferenceDays = parseInt(
      (currentDate - lastRecordDateTime) / (1000 * 60 * 60 * 24),
      10
    );

    let timeDifferenceMinutes = parseInt(
      (currentDate - lastRecordDateTime) / (1000 * 60),
      10
    );
    let timeDifferenceHours = parseInt(
      (currentDate - lastRecordDateTime) / (1000 * 60 * 60),
      10
    );

    // console.log(
    //   lastRecord,
    //   "pages",
    //   pages,
    //   "td",
    //   timeDifferenceDays,
    //   days,
    //   "th",
    //   hours,
    //   "tm",
    //   timeDifferenceMinutes,
    //   minutes,
    //   currentDTStatus
    // );
    if (timeDifferenceDays > 1) {
      setCurrentDTStatus("inactive");
      setDays(timeDifferenceDays);
    } else if (timeDifferenceHours >= 1) {
      setCurrentDTStatus("inactive");
      setHours(timeDifferenceHours);
    } else if (timeDifferenceMinutes >= 60) {
      setCurrentDTStatus("inactive");
      setHours(timeDifferenceMinutes / 60);
    } else if (timeDifferenceMinutes < 60) {
      setCurrentDTStatus("active");
      setMinutes(timeDifferenceMinutes);
    } else {
      // setCurrentDTStatus("active");
      setMinutes(timeDifferenceMinutes);
    }
  }
  React.useEffect(() => {
    GetDigitalTwins();
  }, []);

  React.useEffect(() => {
    if (digitalTwinData.length) {
      CheckDigitalTwinsCapability(digitalTwinData, pages);
    }
  }, [digitalTwinData, pages]);

  React.useEffect(() => {
    checkDTActiveStatus(lastRecord);
  }, [lastRecord]);

  return (
    <div className="App">
      <DigitalTwinContext.Provider value={digitalTwinData}>
        <Interactions />
        <DigitalTwinStatusContext.Provider
          value={{ currentDTStatus, days, hours, minutes, lastRecord }}
        >
          <AirQualityContext.Provider value={airQualityData}>
            <SpeechModel />
          </AirQualityContext.Provider>
        </DigitalTwinStatusContext.Provider>
      </DigitalTwinContext.Provider>
    </div>
  );
}

export default App;
