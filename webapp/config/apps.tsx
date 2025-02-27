import { getImgUrl } from "@/utils/getImgUrl";

type AppConfig = {
  name: string;
  accentColor: string;
  background: string;
  description: string;
  favicon: string;
  logo: JSX.Element;
  pre: JSX.Element;
  redirectUri?: string;
  title: string;
};

export const APP_CONFIG: Record<string, AppConfig> = {
  ID: {
    name: "0xFútbol ID",
    accentColor: "#00ff00",
    background: getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol.png?v=100"),
    description: "The web3 hub for 4 billion fútbol fans.",
    favicon: "/0xfutbol.ico",
    logo: (
      <img
        alt="0xFútbol ID"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png")}
        style={{ height: "48px", width: "auto" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect to get your 0xFútbol ID.</p>
        <div className="flex items-start gap-2">
          <p className="text-sm text-foreground-500">
            0xFútbol ID is your unique identifier in the 0xFútbol
            Hub—think of it like your username for any 0xFútbol product.
          </p>
        </div>
        <p className="text-sm">
          Don't have one yet? No worries! Just connect your wallet, and you'll
          be able to claim yours instantly.
        </p>
      </>
    ),
    title: "0xFútbol ID",
  },
  LOCAL: {
    name: "0xFútbol ID",
    accentColor: "#00ff00",
    background: getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol.png"),
    description: "The web3 hub for 4 billion fútbol fans.",
    favicon: "/0xfutbol.ico",
    logo: (
      <img
        alt="0xFútbol ID"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png")}
        style={{ height: "48px", width: "auto" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect your 0xFútbol ID to start playing.</p>
        <div className="flex items-start gap-2">
          <p className="text-sm text-foreground-500">
            0xFútbol ID is your unique identifier in the 0xFútbol
            Hub—think of it like your username for any 0xFútbol product.
          </p>
        </div>
        <p className="text-sm">
          Don't have one yet? No worries! Just connect your wallet, and you'll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "http://localhost:8090",
    title: "0xFútbol ID",
  },

  // MetaSoccer
  DEVSOCCER: {
    name: "DevSoccer",
    accentColor: "rgb(0, 111, 238)",
    background: getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/metasoccer.png"),
    description: "MetaSoccer: Your next-gen fútbol club",
    favicon: "/metasoccer.ico",
    logo: (
      <img
        alt="DevSoccer"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/metasoccer-logo.svg")}
        style={{ height: "40px", width: "auto", filter: "invert(1)" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect your MetaSoccer ID to start playing.</p>
        <div className="flex items-start gap-2">
          <p className="text-sm text-foreground-500">
            MetaSoccer ID is your unique identifier in the MetaSoccer
            World—think of it like your username for any MetaSoccer game.
          </p>
        </div>
        <p className="text-sm">
          Don't have one yet? No worries! Just connect your wallet, and you'll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "https://manag3r.devsoccer.com",
    title: "DevSoccer",
  },
  METASOCCER: {
    name: "MetaSoccer",
    accentColor: "rgb(0, 111, 238)",
    background: getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/metasoccer.png"),
    description: "MetaSoccer: Your next-gen fútbol club",
    favicon: "/metasoccer.ico",
    logo: (
      <img
        alt="MetaSoccer"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/metasoccer-logo.svg")}
        style={{ height: "40px", width: "auto", filter: "invert(1)" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect your MetaSoccer ID to start playing.</p>
        <div className="flex items-start gap-2">
          <p className="text-sm text-foreground-500">
            MetaSoccer ID is your unique identifier in the MetaSoccer
            World—think of it like your username for any MetaSoccer game.
          </p>
        </div>
        <p className="text-sm">
          Don't have one yet? No worries! Just connect your wallet, and you'll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "https://manag3r.metasoccer.com",
    title: "MetaSoccer",
  }
};
