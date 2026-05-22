sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
    "use strict";

    var YEARS = [
        { key: "y2025_2026", title: "2025-2026" },
        { key: "y2024_2025", title: "2024-2025" },
        { key: "y2023_2024", title: "2023-2024" }
    ];

    return UIComponent.extend("ku-card.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(new ResourceModel({
                bundleUrl: this.getManifestObject().resolveUri("i18n/i18n.properties")
            }), "i18n");

            this.setModel(new JSONModel({
                years: YEARS,
                selectedYear: YEARS[0].key,
                results: [],
                busy: false
            }), "view");
        }
    });
});