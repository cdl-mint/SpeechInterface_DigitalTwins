import * as React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import ClassProperties from "./UML_Models/smartroom_cd.json";
import ObjectProperties from "./UML_Models/smartroom_od.json";
import { useCases, gettingStarted } from "./NLModel";
import { DigitalTwinStatusContext } from "./Context/DigitalTwinStatusContext";
import "./App.css";

function SpeechModel() {
  const { currentDTStatus, days, hours, minutes, lastRecord } =
    React.useContext(DigitalTwinStatusContext);
  const useCasesAvailable = [...useCases[0].capabilities];
  const [speechLog, setSpeechLog] = React.useState([]);
  let device_found = false;
  let device_type = "";
  let operation_found = false;
  let actionWord = "";
  let operation_attribute_found = false;
  let device_id_found = false;
  let deviceType_Operation = false;
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition();
  const [isListening, setIsListening] = React.useState(false);
  const microphoneRef = React.useRef(null);
  const [response, setResponse] = React.useState({});
  const [token, setToken] = React.useState();

  //compose a list of operations for device
  let speechModelData = [];
  for (let i = 0; i < ClassProperties.length; i++) {
    for (let j = 0; j < ClassProperties[i].operations.length; j++) {
      for (let k = 0; k < ObjectProperties.length; k++) {
        if (ClassProperties[i].name === ObjectProperties[k].type) {
          speechModelData.push({
            device_type: ClassProperties[i].name,
            actions: ClassProperties[i].operations[j].name,
            device_id: ObjectProperties[k].name,
            operation: ClassProperties[i].operations[j].action,
          });
        }
      }
    }
  }
  console.log(speechModelData);

  /*function to parse the speech input*/
  function MappingModel(speechInput) {
    let msg = new SpeechSynthesisUtterance();
    if (speechInput) {
      //create an array of speech input
      const speech_input_array = speechInput.toLowerCase().split(" ");
      device_found = false;
      console.log(speechInput, "received input");

      //check for twin (classname)
      for (let twin = 0; twin < speechModelData.length; twin++) {
        console.log(
          "speech input index",
          speech_input_array.indexOf(
            speechModelData[twin].device_type.toLowerCase()
          )
        );
        if (
          speech_input_array.indexOf(
            speechModelData[twin].device_type.toLowerCase()
          ) !== -1
        ) {
          device_type = speechModelData[twin].device_type;
          console.log(
            "class matched " +
              speech_input_array[
                speech_input_array.indexOf(
                  speechModelData[twin].device_type.toLowerCase()
                )
              ]
          );
          device_found = true;
          msg.text = `The ${transcript} matches with the device ${speechModelData[twin].device_type}`;
          window.speechSynthesis.speak(msg);
          stopHandle();
          break;
        }
      }
      //check for action words
      for (let action = 0; action < speechModelData.length; action++) {
        if (
          speech_input_array.indexOf(speechModelData[action].actions) !== -1
        ) {
          actionWord = speechModelData[action].actions;
          console.log(actionWord);
          console.log(
            speech_input_array,
            speech_input_array.indexOf(speechModelData[action].actions),
            speechModelData[action].actions
          );
          msg.text = `The ${transcript} matches with the operation ${speechModelData[action].actions}`;
          window.speechSynthesis.speak(msg);
          operation_found = true;
          stopHandle();
          break;
        }
      }
      //   check for device id
      // for (let deviceId = 0; deviceId < speechModelData.length; deviceId++) {
      //   if (speech_input_array.indexOf(speechModelData[deviceId].id) !== -1) {
      //     device_id_found = true;
      //     msg.text = `The ${transcript} contains the device id ${speechModelData[deviceId]}`;
      //     window.speechSynthesis.speak(msg);
      //     stopHandle();
      //     break;
      //   }
      // }
      //device type and operations check
      for (let i = 0; i < speechModelData.length; i++) {
        deviceType_Operation = false;
        if (
          speechModelData[i].actions === actionWord &&
          speechModelData[i].device_type === device_type
        ) {
          deviceType_Operation = true;
          eval(speechModelData[i].operation);
          msg.text = `The ${transcript} matches with the device type and the operation, the operation is executed `;
          window.speechSynthesis.speak(msg);
          stopHandle();
          break;
        }
      }

      if (!device_found) {
        msg.text = `The ${transcript} does not match with the device type ${ClassProperties.map(
          (d) => d.name
        )} twin`;
        window.speechSynthesis.speak(msg);
      }

      if (!operation_found) {
        msg.text = `The ${transcript} does not match with the operation ${ClassProperties.map(
          (o) => o.operations.map((op) => op.name)
        )}`;
        window.speechSynthesis.speak(msg);
      }

      // if (!device_id_found) {
      //   msg.text = `The ${transcript} does not match with any of device id ${speechModelData.map(
      //     (o) => o.device_id
      //   )}`;
      //   window.speechSynthesis.speak(msg);
      // }
      if (!deviceType_Operation) {
        msg.text = `The ${transcript} does not match with the correct device type ${ClassProperties.map(
          (d) => d.name
        )} and operations ${ClassProperties.map((o) =>
          o.operations.map((op) => op.name)
        )}`;
        window.speechSynthesis.speak(msg);
      }
    }
    //no speech input
    else {
      msg.text = `There is no speech input`;
      window.speechSynthesis.speak(msg);
    }
    return "ok";
  }

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
  function GetAirQuality() {
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
    }
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
    SpeechRecognition.abortListening();
    resetTranscript();
  };
  React.useEffect(() => {
    setSpeechLog({
      transcript: transcript,
    });
  }, [transcript, device_found, operation_found]);
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
      {/* {!device_found?} */}
      {/* {matchedCommand.length < 1 ? errorHandling() : ""} */}
      {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div>
          <button className="microphone-reset btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
      {transcript && (
        <div className="microphone-result-container">
          <button
            className="microphone-reset btn"
            onClick={() => MappingModel(transcript)}
          >
            Speech output
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
        {/* <div className="right">
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
        </div> */}
      </div>
    </div>
  );
}

export default SpeechModel;
