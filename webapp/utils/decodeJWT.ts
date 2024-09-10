export function decodeJWT(token: string) {
	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new Error("The token is invalid");
	}

	const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
	const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

	return { header, payload };
}
