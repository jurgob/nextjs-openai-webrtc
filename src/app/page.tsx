import { WebRtc } from "./components/WebRtc";
import { Record } from "./components/Record";
export default function Home() {
  return (
    <div className="">
      <h1 className="text-4xl font-bold">Openai Assistant</h1>
      <Record />
      <WebRtc />
    </div>
  );
}

