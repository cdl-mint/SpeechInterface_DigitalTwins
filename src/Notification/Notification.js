import * as React from "react";
import styled from "styled-components";
import CDL_logo from "../assets/CDL_logo.png";
import Rules from "../RuleSet";

function NotificationComponent(props) {
  console.log(props.rules.property, props.rules.value, props.rules.range);
  //const [airQualityData, setAirQualityData] = React.useState(props.data);
  const [filteredData, setFilteredData] = React.useState([]);
  function showNotification() {
    filteredData.map((m) => {
      let options = {
        body: `The ${props.rules.property} value is ${m[props.rules.property]}`,
        icon: CDL_logo,
        dir: "ltr",
      };
      //  console.log(options);
      new Notification("Air Quality Info", options);
    });
  }
  const play = () => {
    let result = filteredData.map((i) => i[props.rules.property]);
    console.log("result", result);

    const speechOutput = result.map((i) => {
      let msg = new SpeechSynthesisUtterance();
      msg.text = `The ${
        props.Rules.property
      } in room 0090 is ${i.toLocaleString("en")}`;
      window.speechSynthesis.speak(msg);
    });
    return speechOutput;
  };
  function GetFilteredData(property, value, selectedRange) {
    //const airQualityData = React.useContext(AirQualityContext);
    console.log(property, value, selectedRange);
    if (selectedRange === "above") {
      setFilteredData();
      //airQualityData.filter((i) => (i[property] > value ? i[property] : 0))
    } else if (selectedRange === "below") {
      setFilteredData();
      //airQualityData.filter((i) => (i[property] < value ? i[property] : 0))
    }

    console.log(filteredData);
    return filteredData;
  }
  React.useEffect(() => {
    if ("Notification" in window) {
      //console.log("chrome supports notification!");
      //console.log(window);
      Notification.requestPermission();
    } else {
      console.log("chrome doesn't support notification!");
    }
    // GetFilteredData(props.rules.property, props.rules.value, props.rules.range);
    showNotification();
    play();
  }, []);

  return (
    <div>
      {/* <Button onClick={showNotification}>
        <i class="fa-solid fa-bell"></i> Notify
      </Button> */}
    </div>
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
export default NotificationComponent;
