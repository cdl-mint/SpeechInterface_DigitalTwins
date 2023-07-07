import * as React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import ClassProperties from "./UML_Models/smartroom_cd.json";
import ObjectProperties from "./UML_Models/smartroom_od.json";
import { DigitalTwinStatusContext } from "./Context/DigitalTwinStatusContext";
import "./App.css";

function SpeechModel() {
  const { currentDTStatus, days, hours, minutes, lastRecord } =
    React.useContext(DigitalTwinStatusContext);
  const [speechLog, setSpeechLog] = React.useState([]);
  let device_found = false;
  let operation_found = false;
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

  function speak(text_to_speak) {
    /* Say something out loud. Also log to the console. */
    console.log("speak:", text_to_speak);
    let msg = new SpeechSynthesisUtterance();
    msg.text = text_to_speak;
    window.speechSynthesis.speak(msg);
  };

  function get_type_by_name(classname) {
    return ClassProperties.find(c => c.name.toLowerCase() === classname.toLowerCase());
  };
 
  /*
    Semi smart logic to determine if a speechInput (first param, list of strings) 
    matches depending on second parameter's type.

    If second parameter (object) is a 
    - string: it checks if speech_input contains it
    - array: it checks if ONE of the words matches it
    - json with name: checks if ALL words in name are in speech_input.
    - json with alias: checks if ONE alias exists where ALL words match.
    */
  function speech_match(speechInput, object){
    let text_matches_all_words = (speechInput, words) => {
      let match = words.map(word => speechInput.includes(word.toLowerCase() )).every(v => v === true);
      return match;
    };

    if (typeof object === 'string' || object instanceof String)
    {
      return speechInput.find(word => word === object);
    }

    if (object.constructor === Array)  // text matches one word in array
    {
      return object.find(search_word => speech_match(speechInput, search_word) != undefined);
    }

    if(object.hasOwnProperty("name")) {
      let name_words = object.name.split("_").join(" ").split(" ");
      if(text_matches_all_words(speechInput, name_words)){
        return object;
      }
    } else {
      console.warn("Object does not have a name!");
    }

    if(object.hasOwnProperty("aliases")) {
      let alias = object.aliases.find(alias => {
        let alias_words = alias.split("_").join(" ").split(" ");
        return text_matches_all_words(speechInput, alias_words);
      });
      if(alias != undefined){
        return object;
      }
    }
    return undefined;
  };

  function handle_device_command(device, speechInput) {
    let cd_class = get_type_by_name(device.type);
    console.log("Got the class", cd_class?.name);

    if(cd_class == undefined) {  // This is a big problem!
      console.error("Identified device ", device.name, " but class ", device.type, "cannot be found");
      return;
    }

    // Check if we call an operation
    let operation = cd_class.operations?.find(op => speech_match(speechInput, op));
    let attribute = cd_class.attributes?.find(att => speech_match(speechInput, att));
    console.log("Matched operation", operation?.name);
    console.log("Matched attribute", attribute?.name);

    if(operation != undefined) {
      speak(`Triggering operation ${operation.name} of device ${device.name}`);
      let action = operation.action || "DefaultAction";
      let cmd = `${action}(device, operation, speechInput);`
      console.log("Going to eval the following: ", cmd);
      eval(cmd);
      return true;

    } else if (attribute != undefined) {
      speak(`Getting value of attribute ${attribute.name} of device ${device.name}`);
      // TODO: Needs to be implemented...
      

    } else { // Report something about the object.
      speak(`You mentioned the device ${device.name} but no action or attribute.`);
      if(cd_class.hasOwnProperty("operations")) {
        speak(`Repeat and say ${device.name} followed by one of the following actions.`);
        speak(cd_class.operations.map(el => el.name).join(", "));
      };
      if(cd_class.hasOwnProperty("attributes")) {
        speak(`You can also say ${device.name} followed by one of the following attributes.`);
        speak(cd_class.attributes.map(el => el.name).join(", "));
      };
      return true;
    }
  };

  /*function to parse the speech input*/
  function MappingModel(speechInput) {
    console.log("Received input:", speechInput);
    speechInput = speechInput.toLowerCase().split(" ");  // safety first...

    if (speechInput) {
      let device = ObjectProperties.find(el => speech_match(speechInput, el) != undefined);
      let cd_class = ClassProperties.find(c => speech_match(speechInput, c) != undefined);
      
      console.log("Matched device", device?.name);
      console.log("Matched class", cd_class?.name);

      if(device != undefined) { // do something with the device
        return handle_device_command(device, speechInput);
      } 
      else if(cd_class != undefined) { // do something with the class
        speak(`You mentioned the device type ${cd_class.name}. 
              The following devices of this type are available:
              ${ObjectProperties.filter(dev => dev.type === cd_class.name).map(dev => dev.name).join(", ")}
            `);
        return true;
      } else { // neither device nor class
        if (speech_match(speechInput, ["what", "which", "list"]) &&
            speech_match(speechInput, ["type", "class", "types", "classes"])) {
          speak(`You asked which device types are available. 
                 You can ask about the following device types:
                 ${ClassProperties.map(el => el.name).join(", ")}`);
        } else if (speech_match(speechInput, ["what", "which", "list"]) &&
                   speech_match(speechInput, ["device", "devices"])) {
          speak(`You asked which devices are available. 
                You can ask about the following devices:
                ${ObjectProperties.map(el => el.name).join(", ")}`);
        } else {
          speak("I could not match any device or device type. How about you start by asking which devices or types are available?");
        }
        return true;
      }
    } else {  //no speech input
      speak(`There is no speech input`);
    }
    return true;
    /*
      //create an array of speech input to check for the keywords
      const speech_input_array = speechInput.toLowerCase().split(" ");
      device_found = false;
      console.log(speechInput, "received input");

      //check for device type (classname)
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
          speak(`The ${transcript} matches with the device ${speechModelData[twin].device_type}`);
          stopHandle();
          break;
        }
      }
      //check for operations
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
          speak(`The ${transcript} matches with the operation ${speechModelData[action].actions}`);
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

      //check if device type and operations matches
      for (let i = 0; i < speechModelData.length; i++) {
        deviceType_Operation = false;
        if (
          speechModelData[i].actions === actionWord &&
          speechModelData[i].device_type === device_type
        ) {
          deviceType_Operation = true;
          eval(speechModelData[i].operation);
          speak(`The ${transcript} matches with the device type and the operation, the operation is executed `);
          stopHandle();
          break;
        }
      }

      if (!device_found) {
        speak(`The ${transcript} does not match with the device type ${ClassProperties.map(
          (d) => d.name
        )} twin`);
      }

      if (!operation_found) {
        speak(`The ${transcript} does not match with the operation ${ClassProperties.map(
          (o) => o.operations.map((op) => op.name)
        )}`);
      }

      // if (!device_id_found) {
      //   msg.text = `The ${transcript} does not match with any of device id ${speechModelData.map(
      //     (o) => o.device_id
      //   )}`;
      //   window.speechSynthesis.speak(msg);
      // }
      if (!deviceType_Operation) {
        speak(`The ${transcript} does not match with the correct device type ${ClassProperties.map(
          (d) => d.name
        )} and operations ${ClassProperties.map((o) =>
          o.operations.map((op) => op.name)
        )}`);
      }
    }
    //no speech input
    else {
      speak(`There is no speech input`);
    }
    return "ok";

    */
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

  function compose_url(device, activation){
    return new URL(activation, `https://airquality.se.jku.at/smartroomairquality/Rooms/0090/${device.type}s/${device.name}/`);
  };

  function send_request(url, data){
    console.log("Sending request to", url, "data: ", data);
    const result = axios
      .post(url, data, config)
      .then((response) => {
        setResponse(response.data);
      })
      .catch(() => {
        Authenticate();
      });

    console.log("Request result", result);
    return response;
  };

  function DefaultAction(device, operation, speech_input) {
    const data = operation.parameters || {};
    const activation = operation.activation || "Activation";
    return send_request(compose_url(device, activation), data);
  };

  function color2hex(colorname) {
    // TODO: w3schools color picker ?
    switch(colorname) {
      case "red":
        return "#FF0000";
      case "pink":
        return "#FF1493";
      case "orange":
        return "#FF4500";
      case "yellow":
        return "#FFFF00";
      case "purple":
        return "#800080";
      case "green":
        return "#008000";
      case "blue":
        return "#0000FF";
      case "white":
        return "#ffffff";
      default:
        return "#ffffff";
    }
  };

  function ChangeColorOfLight(device, operation, speech_input) {
    console.log("ChangeColorOfLight", device, operation, speech_input);
    const colors = ["red", "pink", "orange", "yellow", "purple", "green", "blue", "white"];
    let selected = colors.find(col => speech_match(speech_input, col));
    console.log("selected", selected);
    if(selected == undefined){  // exit if we didn't find a colour.
      speak("Could not identify a color. Please repeat and say one of the following colors:");
      speak(colors.join(", "));
      return;
    }
    console.log("Color name", selected);    
    let hex = color2hex(selected);

    console.log(`Setting color of ${device.name} to ${hex}`);

    let data = operation.parameters || {};
    data["hex"] = hex;
    console.log(compose_url(device, "SetColor").toString());
    console.log("data", data);

    return send_request(compose_url(device, "SetColor"), data);
  };

  function GetAirQuality(device, operation, speech_input) {
    console.log("GetAirQuality", device, operation, speech_input);
    console.log("lastRecord", lastRecord);
    if (lastRecord) {   // TODO: Somehow lastRecord is an empty list ... but we don't check for that.
      speak(`The air quality digital twin is currently ${currentDTStatus}, last recorded measurement was
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
      )} rh`);
    } else {
      speak(`There are no entry available for the air quality digital twins`);
    }
  };

  //listen to speech input
  const handleListening = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true,
    });
  };
  //stop listening
  const stopHandle = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();
  };
  //reset speech input
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
          onClick={handleListening}
        >
          <i class="fa-solid fa-microphone"></i>
        </div>
        <div className="microphone-status">
          {isListening ? "Listening........." : "Click to start listening"}
        </div>
        {isListening && (
          <button className="microphone-stop btn" onClick={() => {stopHandle(); MappingModel(transcript); handleReset() }}>
            Stop
          </button>
        )}
      </div>
      <br />
      {/* {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div> <br />
          <button className="microphone-reset btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
      <br />
      {transcript && (
        <div className="microphone-result-container">
          <button
            className="microphone-reset btn"
            onClick={() => {if(MappingModel(transcript)){ handleReset() } }}
          >
            Speech output
          </button>
        </div>
      )} */}
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
      </div>
    </div>
  );
}

export default SpeechModel;
