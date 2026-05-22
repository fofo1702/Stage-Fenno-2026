sap.ui.define([
    "sap/ui/integration/Extension",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Text",
    "sap/ui/core/Element"
], function (Extension, List, StandardListItem, Text, Element) {
    "use strict";

    return Extension.extend("graphcard.extension.Extension", {

        onCardReady: function () {
            var that = this;
            this._aCardData  = [];
            this._sCachedKey = "__all__";
            this._oVizFrame  = null;

            fetch("./filedata/__all__.json")
                .then(function (r) { return r.json(); })
                .then(function (aRows) { that._aCardData = aRows; });

            // Continuously monitor for a new VizFrame (created fresh on each filter change)
            this._startVizMonitor();
        },

        _startVizMonitor: function () {
            var that = this;
            var fnCheck = function () {
                var oFound = null;
                Element.registry.forEach(function (oEl) {
                    if (!oFound && oEl.isA && oEl.isA("sap.viz.ui5.controls.VizFrame")) {
                        oFound = oEl;
                    }
                });
                if (oFound && oFound !== that._oVizFrame) {
                    if (that._oVizFrame) {
                        try { that._oVizFrame.detachSelectData(that._onSelectData, that); } catch (e) {}
                    }
                    that._oVizFrame = oFound;
                    oFound.attachSelectData(that._onSelectData, that);
                }
                setTimeout(fnCheck, 500);
            };
            setTimeout(fnCheck, 0);
        },

        _getCurrentFilterKey: function () {
            try {
                var oFiltersModel = this.getCard().getModel("filters");
                if (oFiltersModel) {
                    var sVal = oFiltersModel.getProperty("/selectedFile/value");
                    if (sVal) { return sVal; }
                }
            } catch (e) {}
            return "__all__";
        },

        _onSelectData: function (oEvent) {
            var that = this;
            var sKey = this._getCurrentFilterKey();
            var aSelected = oEvent.getParameter("data") || [];
            if (!aSelected.length) { return; }

            var oRaw   = aSelected[0];
            var oPoint = Array.isArray(oRaw.data)                     ? oRaw.data[0]
                       : (oRaw.data && typeof oRaw.data === "object") ? oRaw.data
                       : oRaw;
            var sCategory = oPoint && (oPoint["Category"] || oPoint["category"]);

            var fnProceed = function (aData) {
                var oRow = null;
                aData.forEach(function (r) { if (r.category === sCategory) { oRow = r; } });
                if (!oRow) { return; }

                var iRetries = 0;
                var fnInject = function () {
                    var oPopover = null;
                    Element.registry.forEach(function (oEl) {
                        if (!oPopover && oEl.isA && oEl.isA("sap.m.ResponsivePopover") && oEl.isOpen()) {
                            oPopover = oEl;
                        }
                    });
                    if (oPopover) {
                        // Always clean previous injection first
                        that._cleanPopover(oPopover);

                        if (sKey === "__all__") {
                            // All-files mode: show missing files list
                            var aFiles = oRow.missingFiles || [];
                            if (aFiles.length) {
                                var oList = new List({
                                    headerText: "Missing Files",
                                    items: aFiles.map(function (sFile) {
                                        return new StandardListItem({ title: sFile });
                                    })
                                });
                                oList._cardInjected = true;
                                oPopover.addContent(oList);
                            }
                        } else {
                            // Single-file mode: show Present / Missing
                            var bPresent = oRow.percentage >= 0.9999;
                            var oText = new Text({ text: bPresent ? "✅ Present" : "❌ Missing" });
                            oText._cardInjected = true;
                            oPopover.addContent(oText);
                        }
                    } else if (++iRetries < 10) {
                        setTimeout(fnInject, 50);
                    }
                };
                setTimeout(fnInject, 0);
            };

            // Sync _aCardData with current filter
            if (this._sCachedKey !== sKey) {
                this._sCachedKey = sKey;
                fetch("./filedata/" + sKey + ".json")
                    .then(function (r) { return r.json(); })
                    .then(function (aData) {
                        that._aCardData = aData;
                        fnProceed(aData);
                    });
            } else {
                fnProceed(this._aCardData);
            }
        },

        _cleanPopover: function (oPopover) {
            oPopover.getContent().slice().forEach(function (oItem) {
                if (oItem._cardInjected) {
                    oPopover.removeContent(oItem);
                    oItem.destroy();
                }
            });
        },

        exit: function () {
            this._aCardData = [];
            this._oVizFrame = null;
        }
    });
});
