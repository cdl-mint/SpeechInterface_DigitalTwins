export let airQualityModel = [
  {
    device: ["raspi *", "sensor", "scd 30", "raspberry pi"],
    actions: ["get", "what", "fetch", "give", "provide", "tell"],
    parameters: [
      "carbondioxide",
      "co2",
      "temperature",
      "humidity",
      "air quality",
      "indoor",
      "air",
      "quality",
    ],
  },
];
export let smartPlugVentilatorModel = [
  {
    device: ["fan", "ventilator", "plug", "smartplug*", "zigbeeplug"],
    actions: [
      "toggle",
      "turn on",
      "switch on",
      "switch off",
      "turn off",
      "turn",
    ],
    parameter: ["on", "off", "start", "stop"],
  },
];
export let smartLightModel = [
  {
    device: [
      "light *",
      "smart light",
      "led",
      "lamp",
      "zigbee licht",
      "licht*",
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
    ],
    parameter: ["on", "off", "start", "stop", "color *"],
  },
];
