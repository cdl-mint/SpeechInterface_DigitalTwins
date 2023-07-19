import * as React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import SmartroomClassProperties from "./UML_Models/smartroom_cd.json";
import SmartroomObjectProperties from "./UML_Models/smartroom_od.json";
import RobotClassProperties from "./UML_Models/ned_cd.json";
import RobotObjectProperties from "./UML_Models/ned_od.json";

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
  const SMARTROOM_BASE_URL = "https://airquality.se.jku.at/smartroomairquality-test";
  const ROBOT_BASE_URL = "https://localhost:8000";

  const ClassProperties = [...SmartroomClassProperties, ...RobotClassProperties];
  const ObjectProperties = [...SmartroomObjectProperties, ...RobotObjectProperties];

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

  function handle_attribute_command(device, attribute, speechInput) {
    function _matchDate(someDate, otherDate) {
      return someDate.getDate() == otherDate.getDate() &&
        someDate.getMonth() == otherDate.getMonth() &&
        someDate.getFullYear() == otherDate.getFullYear()
    }

    const records = get_attribute_values(device, attribute, speechInput);
    let filtered_records = records;
    let filter_string = "";
    
    if(speech_match(speechInput, ["today"])) { 
      filter_string = "today's";
      const today = new Date();
      filtered_records = records.filter(r => _matchDate(new Date(r.time), today));
    } else if(speech_match(speechInput, ["yesterday"])) { 
      filter_string = "yesterday's";
      let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
      filtered_records = records.filter(r => _matchDate
        (new Date(r.time), yesterday));
    } else if(speech_match(speechInput, "this week")) {
      filter_string = "this week's";
      filtered_records = records.filter(r => new Date(r.time).getWeekNumber() == new Date().getWeekNumber());
    }
    if(filtered_records.length == 0) {
      speak(`I'm sorry, there seem to be no records for attribute ${attribute.name} of device ${device.name} matching your query.`);
      return;
    }
    
    if(speech_match(speechInput, [
      "average", "mean", 
      "max", "maximum", "highest", 
      "min", "minimum", "lowest",
      "last"])){  // if any aggregator values !

      const vals_only = filtered_records.map(r => r[attribute.name]);
      let aggregator = "";
      let val = null;

      if(speech_match(speechInput, ["average", "mean"])) {
        aggregator = "average";
        val = vals_only.reduce((a, b) => a+b) / vals_only.length;
      } else if(speech_match(speechInput, ["max", "maximum", "highest"])) {
        aggregator = "maximum";
        val = Math.max(...vals_only);
      } else if(speech_match(speechInput, ["min", "minimum", "lowest"])) {
        aggregator = "minimum";
        val = Math.min(...vals_only);
      } else if(speech_match(speechInput, ["current", "last"])) {
        aggregator = "last";
        val = filtered_records.at(-1)[attribute.name];
      }
      speak(`Getting ${filter_string} ${aggregator} value of attribute ${attribute.name} of device ${device.name}`); 
      speak(`The ${aggregator} value of the attribute ${attribute.name} of device ${device.name} is ${val}`);
    } else {  // Default, get last value!
      speak(`Getting last value of attribute ${attribute.name} of device ${device.name}`);     
      const last = records.at(-1);
      console.log("last", last);
      speak(`The last value of the attribute ${attribute.name} of device ${device.name} is ${last[attribute.name]}`);
    }
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
      // check if it's robot attributes
      if(device.type == "NiryoNed1" || device.type == "Conveyor") {
        let action = attribute.action || "RobotAttribute";
        let cmd = `${action}(device, attribute);`
        console.log("Going to eval the following: ", cmd);
        eval(cmd);
        return true;
      }


      // get all attribute values !
      return handle_attribute_command(device, attribute, speechInput);
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
    resetTranscript();

    if(speechInput == ""){
      return;
    }

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
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    },
  };

  function get_attribute_values(device, attribute) {
    console.log("Fetching all attribute values for", device.name, "-> ", attribute.name);
    let url = `${SMARTROOM_BASE_URL}/Room/0090/AirQuality/${attribute.name}/`;
    // console.log("GET request url", url);
    let res = fetch_all_records(url);
    return res;
  };

function compose_url(device, activation){
    return new URL(activation, `${SMARTROOM_BASE_URL}/Rooms/0090/${device.type}s/${device.name}/`)
  };

  function get_request(url, page=1, size=100) {
    let full_url = `${url}?page=${page}&size=${size}`;
    console.log("GET this URL", full_url);
    let result = axios
      .get(full_url, config)
      .then((response) => {
        setResponse(response.data);
      })
      .catch((error) => {console.error(error); setResponse(null); } );
      console.log("GET Request result", result);
      return response;
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
  return result;
};


  function fetch_all_records(url) {
    const firstpage = get_request(url);
    // console.log("firstpage", firstpage);

    const max_pages = firstpage.pages;
    const size = firstpage.size;

    let pages = [];

    for(let page_idx = 1; page_idx <= max_pages; page_idx++){
      const page = get_request(url, page_idx, size);
      console.log("Result #", page_idx, page);
      pages.push(page);
    }

    console.log("All pages", pages);

    let all_records = [];
    pages.forEach(p => p?.items.forEach(e => all_records.push(e)));

    let sorted_records = all_records.sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });

    return sorted_records;
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
  return result;
};

const RobotAxios = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true
})

function robot_request(url, data){
  console.log("Sending request to", url, "data: ", data);
  const result = RobotAxios
    .post(url, data, config)
    .then((response) => {
      setResponse(response.data);
    })
    .catch(() => {
    });

  console.log("Request result", result);
  return response;
};

function robot_get(url){
  console.log("Sending GET request to", url);
  const result = RobotAxios
    .get(url, config)
    .then((response) => {
      setResponse(response.data);
    })
    .catch(() => {
    });

  console.log("GET result", result);
  return response;
};

function RobotAction(device, operation, speech_input) {
  const data = operation.data || {};
  const url = new URL(operation.endpoint, `http://127.0.0.1:8000/`);
  console.log("RobotAction! POST to ", url, "payload", data);
  let response = robot_request(url, data);
  console.log("RESPONSE result", response);
  if(response == false){
    speak("The response is: I'm sorry Dave, I'm afraid I can't do that");
  }
};

function RobotAttribute(device, attribute) {
  const url = new URL(attribute.endpoint, `http://127.0.0.1:8000/`);
  const response = robot_get(url);
  console.log("RobotAttribute Response", response);
  speak(`The value of attribute ${attribute.name} of device ${device.name} is: ${response[attribute.name]}`);
};

function ConveyorOnAttribute(device, attribute) {
  const url = new URL(attribute.endpoint, `http://127.0.0.1:8000/`);
  const response = robot_get(url);
  console.log("RobotAttribute Response", response);
  let on = response['on'] ? "on" : "off";
  speak(`Right now, the conveyor is: ${on}`);
};

function ConveyorDirectionAttribute(device, attribute) {
  const url = new URL(attribute.endpoint, `http://127.0.0.1:8000/`);
  const response = robot_get(url);
  console.log("RobotAttribute Response", response);
  if(response["on"]) {
    let dir = response['forward'] ? "forward" : "backward";
    speak(`The moving direction of the conveyor is: ${dir}`);
  } else {
    speak(`The conveyor is stopped`);
  }
};

function DefaultAction(device, operation, speech_input) {
    const data = operation.data || {};
    const activation = operation.activation || "Activation";
    return send_request(compose_url(device, activation), data);
};

function GetAirQuality(device, operation, speech_input) {
    console.log("GetAirQuality", device, operation, speech_input);
    
    const url = `${SMARTROOM_BASE_URL}/Room/${device.name}/AirQuality/`;
    const records = fetch_all_records(url);

    let lastRecord = records.at(-1);
    console.log("Last record", lastRecord);
    console.log("Last time", new Date(lastRecord.time));
    // TODO: The data is always the same ???
    if (lastRecord) {
      speak(`The air quality digital twin is currently ${currentDTStatus}, last recorded measurement was
              ${
                days
                  ? days.toLocaleString("en") + "days"
                  : hours
                  ? hours.toLocaleString("en") + "hours"
                  : minutes
                  ? minutes.toLocaleString("en") + "minutes"
                  : "not found"
              } ago.
              The last record observed is carbondioxide ${lastRecord.co2.toLocaleString("en")} ppm, 
              temperature is ${lastRecord.temperature.toLocaleString("en")} degree celcius, 
              and humidity is ${lastRecord.humidity.toLocaleString("en")} rh`);
    } else {
      speak(`There are no entry available for the air quality digital twins`);
    }
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
  // console.log(speechLog);

  return (
    <div className="microphone-wrapper">
      <h2>Speech Recognition</h2>
      <div className="mircophone-container">
        <div
          className="microphone-icon-container"
          ref={microphoneRef}
          onMouseDown={() => {window.speechSynthesis.cancel(); resetTranscript(); handleListening();}}
          onMouseUp={() => {stopHandle(); MappingModel(transcript); handleReset() }}
          // onClick={handleListening}
        >
          <i className="fa-solid fa-microphone fa-2xl"></i>
        </div>
        <div className="microphone-status">
          {isListening ? "Listening........." : "Click to start listening"}
        </div>
        {/* {isListening && (
          <button className="microphone-stop btn" onClick={() => {stopHandle(); MappingModel(transcript); handleReset() }}>
            Stop
          </button>
        )} */}
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
          <input id="debuginput" placeholder="Write Text to debug" />
          <button onClick={() => {MappingModel(document.getElementById('debuginput').value);}}>TEST</button>
        </div>
      </div>
    </div>
  ); 
}

export default SpeechModel;
