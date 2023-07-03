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
import { DigitalTwinContext } from "../Context/DigitalTwinContext";
import { DigitalTwinStatusContext } from "../Context/DigitalTwinStatusContext";
import "../App.css";
import ClassProperties from "../UML_Models/smartroom_cd.json";
import ObjectProperties from "../UML_Models/smartroom_od.json";

function Recognition() {
  const digitalTwinData = React.useContext(DigitalTwinContext);
  const { currentDTStatus, days, hours, minutes, lastRecord } =
    React.useContext(DigitalTwinStatusContext);

  const useCasesAvailable = [...useCases[0].capabilities];

  const [matchedCommand, setMatchedCommand] = React.useState("");
  const [speechInput, setSpeechInput] = React.useState("");
  const [matchingRatio, setMatchingRatio] = React.useState(0);
  const [useCase, setUseCase] = React.useState("");
  const [speechLog, setSpeechLog] = React.useState([]);

  const commands1 = ClassProperties.map((c) => {
    return {
      command: c.name,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command);
        for (let i = 0; i < ObjectProperties.length; i++) {
          console.log(ObjectProperties[i].type.toLowerCase());
          if (
            command.toLowerCase() === ObjectProperties[i].type.toLowerCase()
          ) {
            console.log(
              c.operations.map((operations) =>
                operations.name.split("_").join(" ")
              )
            );
            let msg = new SpeechSynthesisUtterance();
            msg.text = `The ${spokenPhrase} matches with the ${command} twin, device named ${
              ObjectProperties[i].name
            } of type ${
              ObjectProperties[i].type
            } is available, to get more information, use key words such as ${c.operations.map(
              (operations) => operations.name.split("_").join(" ")
            )}`;
            window.speechSynthesis.speak(msg);
            console.log(command, spokenPhrase, similarityRatio);
            setMatchedCommand(command);
            setSpeechInput(spokenPhrase);
            setMatchingRatio(similarityRatio);
            setUseCase(ObjectProperties[i].type);
            break;
          }
          //  else {
          //   let msg = new SpeechSynthesisUtterance();
          //   msg.text = `Sorry, The ${command} does not match with any of the commands, try commands related to ${useCasesAvailable}`;
          //   window.speechSynthesis.speak(msg);
          // }
        }
        if (!command) {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry, The ${command} does not match with any of the commands, try commands related to ${useCasesAvailable}`;
          window.speechSynthesis.speak(msg);
        }
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.8,
    };
  });

  let array = [];
  const test = ClassProperties.map((c) => {
    for (let i = 0; i < c.operations.length; i++) {
      array.push({
        command: c.operations[i].name.split("_").join(" "),
        useCase: c.name,
      });
    }
  });
  console.log(array);
  const commands2 = array.map((c) => {
    return {
      command: c.command,
      callback: (command, spokenPhrase, similarityRatio) => {
        console.log(command, spokenPhrase, similarityRatio);
        if (command === "toggle ventilator") {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with toggling the smart room ventilator`;
          window.speechSynthesis.speak(msg);
          TogglePlug();
        }
        // else if (command === "turn on ventilator") {
        //   let msg = new SpeechSynthesisUtterance();
        //   msg.text = `The ${command} matches with turning on the smart room ventilator`;
        //   window.speechSynthesis.speak(msg);
        //   TurnOnPlug();
        // } else if (command === "turn off ventilator") {
        //   let msg = new SpeechSynthesisUtterance();
        //   msg.text = `The ${command} matches with turning off the smart room ventilator`;
        //   window.speechSynthesis.speak(msg);
        //   TurnOFFPlug();
        // }
        else if (command === "turn on light") {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with turning on the smart room light`;
          window.speechSynthesis.speak(msg);
          TurnOnLight();
        } else if (command === "turn off light") {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with turning off the smart room light`;
          window.speechSynthesis.speak(msg);
          TurnOFFLight();
        } else if (command.includes("color")) {
          console.log("color", command);
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with changing color of the smart room light`;
          window.speechSynthesis.speak(msg);
          let selectedcolor = window.w3color(command);
          let hexcolor = selectedcolor.toHexString();
          console.log(typeof hexcolor);
          ChangeColorOfLight(hexcolor);
        } else if (command === "get air quality") {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `The ${command} matches with getting the air quality information`;
          window.speechSynthesis.speak(msg);
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
        } else {
          let msg = new SpeechSynthesisUtterance();
          msg.text = `Sorry, The ${command} does not match with any of the commands, try commands related to ${useCasesAvailable}`;
          window.speechSynthesis.speak(msg);
        }
        setMatchedCommand(command);
        setSpeechInput(spokenPhrase);
        setMatchingRatio(similarityRatio);
        setUseCase(c.useCase);
      },
      bestMatchOnly: true,
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.9,
    };
  });

  const commands = [...commands1, ...commands2];
  console.log(commands);

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
  function TurnOnPlug() {
    const data = { turnon: true };
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Ventilators/SmartPlug1/Operations",
        data,
        config
      )
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      })
      .finally(() => console.log(result, "ventilator turned on"));
  }
  function TurnOFFPlug() {
    const data = { turnon: false };
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Ventilators/SmartPlug1/Operations",
        data,
        config
      )
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      })
      .finally(() => console.log(result, "ventilator turned off"));
  }
  function TurnOnLight() {
    const data = { turnon: true };
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Lights/Licht/Activation",
        data,
        config
      )
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      })
      .finally(() => console.log(result, "light turned on"));
  }
  function TurnOFFLight() {
    const data = { turnon: false };
    const result = axios
      .post(
        "https://airquality.se.jku.at/smartroomairquality/Rooms/0090/Lights/Licht/Activation",
        data,
        config
      )
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      })
      .finally(() => console.log(result, "light turned off"));
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
      {/* {matchedCommand.length < 1 ? errorHandling() : ""} */}
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
