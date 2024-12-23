import { getImgUrl } from "@/utils/getImgUrl";

type AppConfig = {
  name: string;
  logo: JSX.Element;
  pre: JSX.Element;
  redirectUri?: string;
};

export const APP_CONFIG: Record<string, AppConfig> = {
  ID: {
    name: "0xFútbol ID",
    logo: (
      <img
        alt="0xFútbol ID"
        src={getImgUrl("https://assets.metasoccer.com/msid-logo.png")}
        style={{ height: "40px", width: "auto" }}
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
          Don’t have one yet? No worries! Just connect your wallet, and you’ll
          be able to claim yours instantly.
        </p>
      </>
    ),
  },
  LOCAL: {
    name: "0xFútbol ID",
    logo: (
      <img
        alt="0xFútbol ID"
        src={getImgUrl("https://assets.metasoccer.com/metasoccer-logo.svg")}
        style={{ height: "40px", width: "auto", filter: "invert(1)" }}
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
          Don’t have one yet? No worries! Just connect your wallet, and you’ll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "http://localhost:8090",
  },

  // MetaSoccer
  DEVSOCCER: {
    name: "DevSoccer",
    logo: (
      <img
        alt="DevSoccer"
        src={getImgUrl("https://assets.metasoccer.com/metasoccer-logo.svg")}
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
          Don’t have one yet? No worries! Just connect your wallet, and you’ll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "https://manag3r.devsoccer.com",
  },
  METASOCCER: {
    name: "MetaSoccer",
    logo: (
      <img
        alt="MetaSoccer"
        src={getImgUrl("https://assets.metasoccer.com/metasoccer-logo.svg")}
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
          Don’t have one yet? No worries! Just connect your wallet, and you’ll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "https://manag3r.metasoccer.com",
  },

  // Wonderkid
  WONDERKID: {
    name: "Wonderkid",
    logo: (
      <img
        alt="Wonderkid"
        src={getImgUrl("https://assets.metasoccer.com/metasoccer-logo.svg")}
        style={{ height: "40px", width: "auto", filter: "invert(1)" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect your 0xFútbol ID to start playing.</p>
        <div className="flex items-start gap-2">
          <p className="text-sm text-foreground-500">
            0xFútbol ID is your unique identifier in the 0xFútbol
            World—think of it like your username for any 0xFútbol product.
          </p>
        </div>
        <p className="text-sm">
          Don’t have one yet? No worries! Just connect your wallet, and you’ll
          be able to claim yours instantly.
        </p>
      </>
    ),
    redirectUri: "https://wonderkid.0xfutbol.com/game",
  }
};
