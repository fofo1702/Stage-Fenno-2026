sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Popover",
  "sap/m/List",
  "sap/m/StandardListItem"
], function (Controller, Popover, List, StandardListItem) {
  "use strict";

  return Controller.extend("competencycards.overdueCertificatesV3.controller.Main", {
    onInit: function () {
      this._onChartClickBound = this._onChartClick.bind(this);
    },

    onAfterRendering: function () {
      var oChartHtml = this.byId("chartHtml");

      if (!oChartHtml) {
        return;
      }

      oChartHtml.detachBrowserEvent("click", this._onChartClickBound);
      oChartHtml.attachBrowserEvent("click", this._onChartClickBound);
    },

    onExit: function () {
      var oChartHtml = this.byId("chartHtml");

      if (oChartHtml) {
        oChartHtml.detachBrowserEvent("click", this._onChartClickBound);
      }

      if (this._oPopover) {
        this._oPopover.destroy();
      }
    },

    onGroupChange: function (oEvent) {
      this.getOwnerComponent().onGroupChange(oEvent.getSource().getSelectedKey());
    },

    onLegendPress: function (oEvent) {
      var oListItem = oEvent.getParameter("listItem");
      var oContext = oListItem && oListItem.getBindingContext("view");
      var sBucketKey = oContext && oContext.getProperty("bucketKey");

      if (!sBucketKey) {
        return;
      }

      this._openStatusPopover(sBucketKey, oListItem);
    },

    _onChartClick: function (oEvent) {
      var oBucketNode = this._findBucketNode(oEvent.target);

      if (!oBucketNode) {
        return;
      }

      this._openStatusPopover(oBucketNode.getAttribute("data-cert-status"), this.byId("chartHtml"));
    },

    _findBucketNode: function (oTarget) {
      var oCurrentNode = oTarget && oTarget.nodeType === Node.TEXT_NODE ? oTarget.parentElement : oTarget;

      while (oCurrentNode) {
        if (oCurrentNode.getAttribute && oCurrentNode.getAttribute("data-cert-status")) {
          return oCurrentNode;
        }

        oCurrentNode = oCurrentNode.parentElement;
      }

      return null;
    },

    _getText: function (sKey, sDefaultText) {
      var oI18nModel = this.getView().getModel("i18n") || this.getOwnerComponent().getModel("i18n");
      var oResourceBundle = oI18nModel && oI18nModel.getResourceBundle && oI18nModel.getResourceBundle();

      return oResourceBundle ? oResourceBundle.getText(sKey) : sDefaultText;
    },

    _openStatusPopover: function (sBucketKey, oOpenControl) {
      var oView = this.getView();
      var oViewModel = oView.getModel("view");
      var aItems = oViewModel.getProperty("/bucketItems/" + sBucketKey) || [];

      if (!this._oPopover) {
        this._oList = new List({
          noDataText: this._getText("NO_ITEMS", "No certificates found")
        });
        this._oPopover = new Popover({
          contentWidth: "22rem",
          placement: "Auto",
          content: [this._oList]
        });
        oView.addDependent(this._oPopover);
      }

      this._oList.destroyItems();
      aItems.forEach(function (oItem) {
        this._oList.addItem(new StandardListItem({
          title: oItem.title,
          description: oItem.description,
          info: oItem.info,
          infoState: oItem.infoState
        }));
      }.bind(this));

      this._oPopover.setTitle(sBucketKey + " (" + aItems.length + ")");

      if (oOpenControl) {
        this._oPopover.openBy(oOpenControl);
      }
    }
  });
});