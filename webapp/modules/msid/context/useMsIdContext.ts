import React from "react";
import { MsIdContext } from "./MsIdProvider";

const useMsIdContext = () => {
	const context = React.useContext(MsIdContext);
	if (context === undefined) {
		throw new Error("useMsIdContext must be used within a IdContextProvider");
	}
	return context;
};

export { useMsIdContext };
