export let useCases = [
  {
    capabilities: [
      "digital twin avaialbility and status",
      "air quality information",
      "smart devices operations",
    ],
  },
];
export let airQualityModel = [
  {
    device: ["raspi *", "sensor", "scd 30", "raspberry pi"],
    actions: ["get", "what", "fetch", "give", "provide", "tell"],
    parameter: [
      "carbondioxide",
      "co2",
      "temperature",
      "humidity",
      "air quality",
      "indoor",
      "air",
      "quality",
      "(what is the current)",
    ],
  },
];
export let smartPlugVentilatorModel = [
  {
    device: ["fan", "ventilator", "plug", "smartplug*", "zigbeeplug"],
    actions: [
      "toggle fan",
      "toggle (the) ventilator",
      "turn on (fan)(ventilator)",
      "switch on",
      "switch off",
      "turn off",
      "turn (ventilator) (fan)",
    ],
    parameter: ["on", "off", "start", "stop"],
  },
];
export let smartLightModel = [
  {
    device: [
      "light",
      "smart light",
      "led",
      "lamp",
      "zigbee licht",
      "licht",
      "lampe",
    ],
    actions: [
      "turn on",
      "turn off",
      "switch on",
      "switch off",
      "on",
      "off",
      "change",
      "turn",
      "modify",
      "light *",
      "light (red) for example",
      "change the color of the light to *",
      "(change the color of the) light to (red) for example",
      "light to (red)",
      "(green) light",
    ],
    parameter: ["on", "off", "start", "stop", "color *"],
  },
];
export let gettingStarted = [
  "hi",
  "hello",
  "(what) can you do (for me) *",
  "what can i do with the application",
  "what to speak",
  "how to get started",
  "how to interact with you",
  "what can you do for me",
];
