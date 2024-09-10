import createHmac from "create-hmac";

const CONFIG = JSON.parse(
	Buffer.from(
		"eyJpbWdQcm94eUtleSI6IjFiMjQyYWIxOTAzODExZTUzNDk4NGFkOTEyYTNlNDY5ZjNmMWQyY2ZmNTNkZGE5MTNhZTdjMWRhMGU5MGQ2NmY3NTNhZjdlMzAzMWVjYTk3MTIzM2EyNDg1OTFiZDBlZTk5YTdjYzRjODVhZTRkMDE2NzY1NmQwZjY1NzI0NThmIiwiaW1nUHJveHlTYWx0IjoiYjUzYmQ4YjEwNTk0ZmVkZjI5ZTk0ODI2YTUxZmY5OTBhYmQxZGM4Y2VmNTE4YmQ1Y2VlNDY1ZDZkZGQzNzRkMThlN2U3ZjViZDIwMmE3ZTI2MDRkMDI0NzlmYTBkZTlmMmRmZDEyYzMyM2UyMWE2ZDNhNjRlNjM0MjAyNjA0NDUifQ==",
		"base64"
	).toString("ascii")
);

const urlSafeBase64 = (buffer: Buffer) =>
	buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const sign = (target: string) => {
	const { imgProxyKey, imgProxySalt } = CONFIG;
	const hexDecode = (hex: string) => Buffer.from(hex, "hex");
	const hmac = createHmac("sha256", hexDecode(imgProxyKey));
	hmac.update(hexDecode(imgProxySalt));
	hmac.update(target);
	return urlSafeBase64(hmac.digest());
};

export interface ImgConfig {
	crop?: string;
	format?: "png";
	gravity?: string;
	height?: number;
	resize?: string;
	size?: number;
	trim?: boolean | string;
	width?: number;
}

export const getImgUrl = (url: string, config?: ImgConfig) => {
	try {
		const encodedUrl = urlSafeBase64(Buffer.from(url));
		const options: string[] = [];

		if (config?.format) {
			options.push(`f:${config.format}`);
		}

		if (config?.crop) {
			options.push(`crop:${config.crop}`);
		}

		if (config?.gravity) {
			options.push(`gravity:${config.gravity}`);
		}

		if (config?.size) {
			options.push(`s:${config.size}:${config.size}`);
		} else {
			if (config?.height) {
				options.push(`h:${config.height}`);
			}
			if (config?.width) {
				options.push(`w:${config.width}`);
			}
		}

		if (config?.resize) {
			options.push(`resize:${config.resize}`);
		}

		if (config?.trim) {
			options.push(`t:0.3:${typeof config.trim === "boolean" ? "FF00FF" : config.trim}`);
		}

		const path = `/${options.join("/")}/${encodedUrl}`.replaceAll("//", "/");
		const signature = sign(path);

		return `https://img.metasoccer.com/${signature}${path}`;
	} catch (err) {
		console.error(err);
		return url;
	}
};
