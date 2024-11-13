import { getImgUrl } from "@/utils/getImgUrl";

type AppConfig = {
  name: string;
  logo: JSX.Element;
  pre: JSX.Element;
  redirectUri?: string;
};

export const APP_CONFIG: Record<string, AppConfig> = {
  ID: {
    name: "MetaSoccer ID",
    logo: (
      <img
        alt="MetaSoccer ID"
        src={getImgUrl("https://assets.metasoccer.com/msid-logo.png")}
        style={{ height: "40px", width: "auto" }}
      />
    ),
    pre: (
      <>
        <p className="text-sm">Connect to get your MetaSoccer ID.</p>
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
  },
  METASOCCER: {
    name: "MetaSoccer",
    logo: (
      <img
        alt="MetaSoccer"
        className="filter invert"
        src={getImgUrl("https://assets.metasoccer.com/metasoccer-logo.svg")}
        style={{ height: "40px", width: "auto" }}
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
};
