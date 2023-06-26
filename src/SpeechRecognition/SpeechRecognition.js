import * as React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import "../w3schools.com_lib_w3color";
import {
  smartPlugVentilatorModel,
  smartLightModel,
  airQualityModel,
} from "../NLModel";
import { DigitalTwinContext } from "../DigitalTwinContext";
import { DigitalTwinStatusContext } from "../DigitalTwinStatusContext";

function Recognition() {
  const digitalTwinData = React.useContext(DigitalTwinContext);
  const { currentDTStatus, days, hours, minutes, lastRecord } =
    React.useContext(DigitalTwinStatusContext);

  const smartRoomPlugDevice = [...smartPlugVentilatorModel[0].device];
  const smartRoomLightDevice = [...smartLightModel[0].device];
  const airQualityDevice = [...airQualityModel[0].device];
  const airQualityAction = [...airQualityModel[0].actions];
  const airQualityActionParameter = [
    ...airQualityModel[0].actions,
    ...airQualityModel[0].parameters,
  ];

  const commands = [
    {
      command: "What are the available digital twins",
      callback: () => {
        let msg = new SpeechSynthesisUtterance();
        if (digitalTwinData) {
          digitalTwinData.map((d) => {
            msg.text = `The available digital twins are ${d.dt_type} and it's capability is ${d.dt_capability}`;
            window.speechSynthesis.speak(msg);
          });
        } else {
          msg = new SpeechSynthesisUtterance();
          msg.text = `There are no digital twins available`;
          window.speechSynthesis.speak(msg);
        }
      },
    },
    {
      command: "Which digital twins are active",
      callback: () => {
        let msg = new SpeechSynthesisUtterance();
        if (lastRecord) {
          if (days) {
            msg.text = `There are no active twins, The digital twin is currently ${currentDTStatus}, last recorded measurement was 
             ${
               days
                 ? days.toLocaleString("en") + "days"
                 : hours
                 ? hours.toLocaleString("en") + "hours"
                 : minutes
                 ? minutes.toLocaleString("en") + "minutes"
                 : "not found"
             } ago ,
            The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
              "en"
            )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
              "en"
            )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
              "en"
            )} rh`;
            window.speechSynthesis.speak(msg);
            handleReset();
          } else {
            msg.text = `The digital twin is currently ${currentDTStatus}, last recorded measurement was 
          ${
            days
              ? days.toLocaleString("en") + "days"
              : hours
              ? hours.toLocaleString("en") + "hours"
              : minutes
              ? minutes.toLocaleString("en") + "minutes"
              : "not found"
          } ago ,
         The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
           "en"
         )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
              "en"
            )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
              "en"
            )} rh`;
            window.speechSynthesis.speak(msg);
            handleReset();
          }
        } else {
          msg.text = `The digital twins entry is not available`;
          window.speechSynthesis.speak(msg);
        }
      },
    },
    {
      command: airQualityDevice,
      callback: (command) => {
        if (command) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the air quality digital twin`;
          window.speechSynthesis.speak(msg);
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble devices for the air quality use case are ${airQualityDevice}`;
          window.speechSynthesis.speak(msg);
        }
        // if (lastRecord) {
        //   let msg = new SpeechSynthesisUtterance();
        //   msg.text = `The air quality digital twin is currently ${currentDTStatus}, last recorded measurement was
        //          ${
        //            days
        //              ? days.toLocaleString("en") + "days"
        //              : hours
        //              ? hours.toLocaleString("en") + "hours"
        //              : minutes
        //              ? minutes.toLocaleString("en") + "minutes"
        //              : "not found"
        //          } ago ,
        //    The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
        //      "en"
        //    )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
        //     "en"
        //   )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
        //     "en"
        //   )} rh`;
        //   window.speechSynthesis.speak(msg);
        // } else {
        //   let msg = new SpeechSynthesisUtterance();
        //   msg.text = `There are no entry available for the air quality digital twins`;
        //   window.speechSynthesis.speak(msg);
        // }
      },
      // matchInterim: true,
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.2,
    },
    {
      command: [...airQualityModel[0].parameters],
      callback: (command) => {
        let msg = new SpeechSynthesisUtterance();
        console.log(command, typeof command);
        if (command) {
          msg.text = `The ${command} keyword matches with the air quality information`;
          window.speechSynthesis.speak(msg);
          handleReset();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the available parameters for the air quality use case are ${airQualityActionParameter}`;
          window.speechSynthesis.speak(msg);
        }
        let actionFound;

        // if (airQualityAction.indexOf(command)) {
        //   actionFound = command;
        // let msg = new SpeechSynthesisUtterance();
        // msg.text = `The action that is performed is ${command} with air quality twin`;
        // window.speechSynthesis.speak(msg);
        if (lastRecord) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The air quality digital twin is currently ${currentDTStatus}, last recorded measurement was
                       ${
                         days
                           ? days.toLocaleString("en") + "days"
                           : hours
                           ? hours.toLocaleString("en") + "hours"
                           : minutes
                           ? minutes.toLocaleString("en") + "minutes"
                           : "not found"
                       } ago ,
                 The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
                   "en"
                 )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
            "en"
          )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
            "en"
          )} rh`;
          window.speechSynthesis.speak(msg);
          handleReset();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `There are no entry available for the air quality digital twins`;
          window.speechSynthesis.speak(msg);
        }

        // } else {
        //   let msg = new SpeechSynthesisUtterance();
        //   msg.text = `There are no action keyword that matches ${airQualityAction}`;
        //   window.speechSynthesis.speak(msg);
        // }
      },

      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.2,
    },
    {
      command: smartRoomLightDevice,
      callback: (command) => {
        if (command) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the smart room use case and device type light`;
          window.speechSynthesis.speak(msg);
          handleReset();
          // let selectedcolor = window.w3color(command);
          // let hexcolor = selectedcolor.toHexString();
          // console.log(typeof hexcolor);
          // if (smartPlugVentilatorModel.indexOf(command)) {
          //   ChangeColorOfLight(hexcolor);
          // }
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble names indicating the device light are ${smartRoomLightDevice}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.2,
    },
    {
      command: smartRoomPlugDevice,
      callback: (command) => {
        if (command) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the smart room use case and device type smart plug ventilator`;
          window.speechSynthesis.speak(msg);
          handleReset();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble names indicating the device smart plug ventilator are ${smartRoomPlugDevice}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.2,
    },
    {
      command: "quality",
      callback: () => {
        play();
      },
    },
    {
      command: "reset",
      callback: () => {
        handleReset();
      },
    },
  ];
  const { transcript, resetTranscript } = useSpeechRecognition({ commands });
  const [isListening, setIsListening] = React.useState(false);
  const microphoneRef = React.useRef(null);
  const [response, setResponse] = React.useState({});
  const [token, setToken] = React.useState();
  const play = () => {
    //let result = filteredData.map((i) => i[selectedProperty]);
    //console.log("result", result);

    let msg = new SpeechSynthesisUtterance();
    msg.text = `The digital twin is currently ${currentDTStatus}, last recorded measurement was ${days.toLocaleString(
      "en"
    )} ago,
      The last record observed is carbondioxide ${lastRecord.co2.toLocaleString(
        "en"
      )} ppm, temperature is ${lastRecord.temperature.toLocaleString(
      "en"
    )} degree celcius, and humidity is ${lastRecord.humidity.toLocaleString(
      "en"
    )}`;

    window.speechSynthesis.speak(msg);
  };
  function Authenticate() {
    const data = {
      username: "SEPR_Team1",
      password: "kn*tvQkWKen3kgXt",
    };
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/users/authenticate",
        data
      )
      .then((response) => {
        console.log("response", response);
        if (response.status === 200) {
          setToken(response.data["access_token"]);
        }
      });
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  function TogglePlug() {
    const data = {};
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Ventilators/SmartPlug1/Activation",
        data,
        config
      )
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      });

    console.log(result);
    return response;
  }
  function ChangeColorOfLight(color) {
    console.log(color);
    const data = {
      turnon: true,
      brightness: 0,
      hex: color,
    };

    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Lights/Licht/SetColor",
        data,
        config
      )
      .then((response) => setResponse(response.data))
      .catch(() => {
        Authenticate();
      });
    console.log(result);
    return response;
  }
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser does not Support Speech Recognition.
      </div>
    );
  }
  const handleListing = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true,
    });
  };
  const stopHandle = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();
  };
  const handleReset = () => {
    stopHandle();
    resetTranscript();
  };
  return (
    <div className="microphone-wrapper">
      <h2>Speech Recognition</h2>
      <div className="mircophone-container">
        <div
          className="microphone-icon-container"
          ref={microphoneRef}
          onClick={handleListing}
        >
          <i class="fa-solid fa-microphone"></i>
        </div>
        <div className="microphone-status">
          {isListening ? "Listening........." : "Click to start listening"}
        </div>
        {isListening && (
          <button className="microphone-stop btn" onClick={stopHandle}>
            Stop
          </button>
        )}
      </div>
      {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div>
          <button className="microphone-reset btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
export default Recognition;
