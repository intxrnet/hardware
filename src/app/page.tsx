import CenterCloud from "./components/center-cloud";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div className="h-[4vh]"></div>
      <CenterCloud
        items={[
          {
            text: "display gamuts",
            description: "compare monitor color spaces",
          },
          {
            text: "screen stats",
            description: "measure screen dimensions",
          },
          {
            text: "browser data",
            description: "check browser leak",
          },
          {
            text: "keyboard",
            description: "check key rollover",
          },
          {
            text: "mouse",
            description: "test mouse accuracy and calibration",
          },
          {
            text: "speaker",
            description: "check audio quality",
          },
          {
            text: "webcam",
            description: "check video quality",
          },
          {
            text: "ram test",
            description: "simulate memory stress locally",
          },
          {
            text: "browser sensor data",
            description: "show accelerometer & gyroscope data",
          },
        ]}
      ></CenterCloud>
    </div>
  );
}
