sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {
	"use strict";

	return function () {
		return new Designtime({
			form: {
				items: {
					welcomeGroup: {
						type: "group",
						label: "Welcome Banner"
					},
					welcomeText: {
						manifestpath: "/sap.card/configuration/parameters/welcomeText/value",
						type: "string",
						label: "Welcome Text",
						translatable: true,
						required: true
					},
					welcomeSubtitle: {
						manifestpath: "/sap.card/configuration/parameters/welcomeSubtitle/value",
						type: "string",
						label: "Subtitle Text",
						translatable: true,
						required: true
					}
				}
			},
			preview: {
				modes: "None"
			}
		});
	};
});
