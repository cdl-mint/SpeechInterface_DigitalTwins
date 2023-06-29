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
  useCases,
  gettingStarted,
} from "../NLModel";
import { DigitalTwinContext } from "../DigitalTwinContext";
import { DigitalTwinStatusContext } from "../DigitalTwinStatusContext";
import "../App.css";
function Recognition() {
  const digitalTwinData = React.useContext(DigitalTwinContext);
  const { currentDTStatus, days, hours, minutes, lastRecord } =
    React.useContext(DigitalTwinStatusContext);

  const useCasesAvailable = [...useCases[0].capabilities];

  const smartRoomPlugDevice = [...smartPlugVentilatorModel[0].device];
  const smartRoomPlugAction = [
    ...smartPlugVentilatorModel[0].actions,
    ...smartPlugVentilatorModel[0].parameter,
  ];
  const smartRoomLightDevice = [...smartLightModel[0].device];
  const smartRoomLightAction = [
    ...smartLightModel[0].actions,
    ...smartLightModel[0].parameter,
  ];
  const airQualityDevice = [...airQualityModel[0].device];
  const airQualityActionParameter = [
    ...airQualityModel[0].actions,
    ...airQualityModel[0].parameter,
  ];
  const [matchedCommand, setMatchedCommand] = React.useState("");
  const [speechInput, setSpeechInput] = React.useState("");
  const [matchingRatio, setMatchingRatio] = React.useState(0);
  const [useCase, setUseCase] = React.useState("");
  const [speechLog, setSpeechLog] = React.useState([]);
  const commands = [
    {
      command: gettingStarted,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        setMatchedCommand(command);
        setSpeechInput(spokenPhrase);
        setMatchingRatio(similarityRatio);
        setUseCase("introduction");
        if (command) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Hello, I can provide information about the following use cases ${useCasesAvailable}`;
          window.speechSynthesis.speak(msg);
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry i dont understand, try commands related to ${useCasesAvailable}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: "(What are the) available digital twins",
      callback: ({ command, spokenPhrase, similarityRatio }) => {
        setMatchedCommand(command);
        setSpeechInput(spokenPhrase);
        setMatchingRatio(similarityRatio);
        setUseCase("digital twin availability");
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
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: "(Which) digital twins (are) active",

      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        setMatchedCommand(command);
        setSpeechInput(spokenPhrase);
        setMatchingRatio(similarityRatio);
        setUseCase("active twins");
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
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: airQualityDevice,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command) {
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("air quality device");
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the air quality digital twin, to get more information, use key words such as ${airQualityActionParameter}`;
          window.speechSynthesis.speak(msg);
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble devices for the air quality use case are ${airQualityDevice}`;
          window.speechSynthesis.speak(msg);
        }
      },
      // matchInterim: true,
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: airQualityActionParameter,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command) {
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("air quality action");
          let msg = new SpeechSynthesisUtterance();
          msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} keyword matches with the air quality information`;
          window.speechSynthesis.speak(msg);
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the available parameters for the air quality use case are ${airQualityActionParameter}`;
          window.speechSynthesis.speak(msg);
        }
        if (lastRecord) {
          let msg = new SpeechSynthesisUtterance();
          msg = new SpeechSynthesisUtterance();
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
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg = new SpeechSynthesisUtterance();
          msg.text = `There are no entry available for the air quality digital twins`;
          window.speechSynthesis.speak(msg);
        }
      },

      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: smartRoomLightDevice,
      callback: (command, spokenPhrase, similarityRatio) => {
        if (command) {
          console.log(command, spokenPhrase, similarityRatio);
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the smart room use case and device type light, to get more information, use key words such as ${smartRoomLightAction} `;
          window.speechSynthesis.speak(msg);
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("smart room light");
          // let selectedcolor = window.w3color(command);
          // let hexcolor = selectedcolor.toHexString();
          // console.log(typeof hexcolor);
          // ChangeColorOfLight(hexcolor);
          //handleReset();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble names indicating the device light are ${smartRoomLightDevice}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: smartRoomLightAction,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command) {
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("smart room light action");
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The color ${command} matches with the smart room light`;
          window.speechSynthesis.speak(msg);
          let selectedcolor = window.w3color(command);
          let hexcolor = selectedcolor.toHexString();
          console.log(typeof hexcolor);
          ChangeColorOfLight(hexcolor);
          //handleReset();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry i cannot identify the color, can you try colors like red, green`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: smartRoomPlugDevice,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command) {
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("smart room plug");
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with the smart room use case and device type smart plug ventilator, to get more information, use key words such as ${smartRoomPlugAction}`;
          window.speechSynthesis.speak(msg);
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the avaialble names indicating the device smart plug ventilator are ${smartRoomPlugDevice}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: smartRoomPlugAction,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command) {
          setMatchedCommand(command);
          setSpeechInput(spokenPhrase);
          setMatchingRatio(similarityRatio);
          setUseCase("smart room plug action");
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with toggling the smart room ventilator`;
          window.speechSynthesis.speak(msg);
          TogglePlug();
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry the  ${command} does not allow me to toggle the ventilator, try to use key words such as ${smartRoomPlugAction}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
    {
      command: ["reset", "clear"],
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        setMatchedCommand(command);
        setSpeechInput(spokenPhrase);
        setMatchingRatio(similarityRatio);
        handleReset();
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    },
  ];

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition({ commands });
  const [isListening, setIsListening] = React.useState(false);
  const microphoneRef = React.useRef(null);
  const [response, setResponse] = React.useState({});
  const [token, setToken] = React.useState();

  function Authenticate() {
    const data = {
      username: "SEPR_Team2",
      password: "HWexZ^X6a6X^X4*k",
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
  // if (!browserSupportsSpeechRecognition()) {
  //   return (
  //     <div className="mircophone-container">
  //       Browser does not Support Speech Recognition.
  //     </div>
  //   );
  // }
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
    SpeechRecognition.abortListening();
    resetTranscript();
  };
  const errorHandling = () => {
    let msg = new SpeechSynthesisUtterance();
    msg.text = `The command ${transcript} does not match with any of the commands, please try commands related to digital twin, air quality, smart room `;
    window.speechSynthesis.speak(msg);
  };
  const successHandling = () => {
    let msg = new SpeechSynthesisUtterance();
    msg.text = `The command ${transcript} is executed successfully `;
    window.speechSynthesis.speak(msg);
  };

  React.useEffect(() => {
    setSpeechLog({
      transcript: transcript,
      matchedCommand: matchedCommand,
      speechInput: speechInput,
      matchingRatio: matchingRatio,
      useCase: useCase,
    });
  }, [transcript, matchedCommand, speechInput, matchingRatio, useCase]);
  console.log(speechLog);

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
      {matchedCommand.length < 1 ? errorHandling() : ""}
      {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div>
          <button className="microphone-reset btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}

      <div className="container">
        <div className="left">
          <div className="row">
            <div className="col-sm-6">
              <em>transcript (interpreted text)</em>
            </div>
            <div className="col-sm-6">{transcript}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-sm-6">
              <em>interim (guessed text)</em>
            </div>
            <div className="col-sm-6">{interimTranscript}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-sm-6">
              <em>final text</em>
            </div>
            <div className="col-sm-6">{finalTranscript}</div>
          </div>
          <br />
        </div>
        <div className="right">
          <div className="row">
            <div className="col-sm-6">
              <em>Matched command</em>
            </div>
            <div className="col-sm-6">{matchedCommand}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-sm-6">
              <em>spoken Input</em>
            </div>
            <div className="col-sm-6"> {speechInput}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-sm-6">
              <em>similarity Ratio</em>
            </div>

            <div className="col-sm-6">{matchingRatio}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-sm-6">
              <em>use case</em>
            </div>

            <div className="col-sm-6"> {useCase}</div>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}
export default Recognition;
