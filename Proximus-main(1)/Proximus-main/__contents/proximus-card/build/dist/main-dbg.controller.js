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
                welcomeText: (oParams.welcomeText && oParams.welcomeText.value) || "Welcome back 👋",
                welcomeSubtitle: (oParams.welcomeSubtitle && oParams.welcomeSubtitle.value) || "Check your HR services below"
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

            // Hide the entire card (including its Work Zone tile shell) after 10 seconds
            setTimeout(function () {
                var oViewDom = oView.getDomRef();
                if (!oViewDom) { return; }

                // Find the card element, then walk up to the outermost shell/tile wrapper
                var oCardEl = oViewDom.closest(".sapUiIntegrationCard") || oViewDom.closest(".sapFCard") || oViewDom;
                // Work Zone wraps cards in a shell tile — climb up until we hit it
                var oShell = oCardEl.closest(".sapCPaGridContainerItemWrapper")
                    || oCardEl.closest(".sapWZPageTile")
                    || oCardEl.closest(".sapUshellTile")
                    || oCardEl;

                oShell.style.transition = "opacity 0.5s";
                oShell.style.opacity = "0";
                setTimeout(function () {
                    oShell.style.display = "none";
                    oShell.style.width = "0";
                    oShell.style.height = "0";
                    oShell.style.overflow = "hidden";
                    oShell.style.margin = "0";
                    oShell.style.padding = "0";
                }, 500);
            }, 10000);
        }
    });
});