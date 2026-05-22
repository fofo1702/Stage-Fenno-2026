sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ku-card.controller.Main", {
        onInit: function () {
            this._oViewModel = this.getOwnerComponent().getModel("view");
            this._loadResults(this._oViewModel.getProperty("/selectedYear"));
        },

        onYearChange: function (oEvent) {
            this._loadResults(oEvent.getSource().getSelectedKey());
        },

        _loadResults: function (sYearKey) {
            var oManifest = this.getOwnerComponent().getManifestObject();
            var oResultsModel = new JSONModel();
            var sDataUrl = oManifest.resolveUri("data/" + sYearKey + ".json");

            this._oViewModel.setProperty("/busy", true);
            this._oViewModel.setProperty("/selectedYear", sYearKey);

            oResultsModel.attachRequestCompleted(function () {
                var aResults = oResultsModel.getData();

                this._oViewModel.setProperty("/results", Array.isArray(aResults) ? aResults.map(this._mapResult, this) : []);
                this._oViewModel.setProperty("/busy", false);
            }.bind(this));

            oResultsModel.attachRequestFailed(function () {
                this._oViewModel.setProperty("/results", []);
                this._oViewModel.setProperty("/busy", false);
            }.bind(this));

            oResultsModel.loadData(sDataUrl);
        },

        _mapResult: function (oResult) {
            return Object.assign({}, oResult, {
                resultState: this._getResultState(oResult.result)
            });
        },

        _getResultState: function (sResult) {
            var iScore;

            if (!sResult) {
                return "None";
            }

            iScore = parseInt(sResult, 10);

            if (iScore >= 12) {
                return "Success";
            }

            if (iScore >= 10) {
                return "Warning";
            }

            return "Error";
        }
    });
});