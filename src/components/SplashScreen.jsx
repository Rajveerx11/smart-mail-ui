import logo from "../assets/Axon.png";
import AnimatedButton from "./AnimatedButton";

export default function SplashScreen({ onContinue }) {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">

        <img
          src={logo}
          alt="Axon"
          className="h-40 w-40 mb-6 animate-logoPop scale-[1.3]"
        />

        <h1 className="text-4xl font-semibold mb-2 animate-fadeUp">
          Axon
        </h1>

        <p className="text-gray-500 mb-10 animate-fadeUp delay-200">
          Smart • Secure • AI Powered
        </p>

        <AnimatedButton
          text="Continue to Axon"
          onClick={onContinue}
        />
      </div>
    </div>
  );
}
