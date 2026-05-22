sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("proximus.main", {
        onInit: function () {
            var oView = this.getView();

            // Read configuration parameters (Work Zone overrides these at runtime)
            var oParams = this.getOwnerComponent().getManifestObject().getEntry("/sap.card/configuration/parameters") || {};
            var oModel = new JSONModel({
                welcomeText: (oParams.welcomeText && oParams.welcomeText.value) || "Welcoack 👋",
                welcomeSubtitle: (oParams.welcomeSubtitle && oParams.welcomeSubtitle.value) || "Check below"
            });
            oView.setModel(oModel, "card");

            var sImgSrc = sap.ui.require.toUrl("proximus/images/myHR.png");

            // Set background image on the wrapper after it renders
            var oWrapper = oView.byId("cardWrapper");
            oWrapper.addEventDelegate({
                onAfterRendering: function () {
                    var oDom = oWrapper.getDomRef();
                    if (oDom) {
                        oDom.style.backgroundImage = "url('" + sImgSrc + "')";
                    }
                }
            });

            // Hide the card and its Work Zone widget wrapper after 10 seconds
            setTimeout(function () {
                var oViewDom = oView.getDomRef();
                if (!oViewDom) { return; }

                // Walk up to the Work Zone widget container (data-dws-type="dws-layout-widget")
                // This is the outermost box Work Zone renders for a single card slot
                var target = oViewDom.closest('[data-dws-type="dws-layout-widget"]')
                    || oViewDom.closest('[data-type="page-widget"]')
                    || oViewDom.closest(".layout-page-widget-container")
                    || oViewDom.closest(".jam-widget")
                    || oViewDom.closest(".sapUiIntegrationCard")
                    || oViewDom.closest(".sapFCard")
                    || oViewDom;

                target.style.transition = "opacity 0.5s";
                target.style.opacity = "0";
                setTimeout(function () {
                    target.style.display = "none";
                }, 500);
            }, 10000);
        }
    });
});