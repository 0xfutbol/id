import { OxFUTBOL_LOCAL_STORAGE_KEY } from "@0xfutbol/id-sign";

export function decodeJWT(token: string) {
	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new Error("The token is invalid");
	}

	const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
	const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

	return { header, payload };
}

export const getSavedJWT = (): string | undefined => {
  return localStorage?.getItem(OxFUTBOL_LOCAL_STORAGE_KEY)?.replaceAll("\"", "") || undefined;
};

export const setSavedJWT = (jwt: string | undefined) => {
  if (jwt) {
    console.debug("[0xFútbol ID] Setting JWT in localStorage:", jwt);
    localStorage?.setItem(OxFUTBOL_LOCAL_STORAGE_KEY, jwt);
  } else {
    console.debug("[0xFútbol ID] Removing JWT from localStorage");
    localStorage?.removeItem(OxFUTBOL_LOCAL_STORAGE_KEY);
  }
};
