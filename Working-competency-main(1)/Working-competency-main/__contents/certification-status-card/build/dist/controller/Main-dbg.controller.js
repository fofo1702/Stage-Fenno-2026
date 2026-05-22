sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("competencycards.certificationStatus.controller.Main", {
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

      this.getOwnerComponent().onCategorySelect(sBucketKey);
    },

    _onChartClick: function (oEvent) {
      var oBucketNode = this._findBucketNode(oEvent.target);

      if (!oBucketNode) {
        return;
      }

      this.getOwnerComponent().onCategorySelect(oBucketNode.getAttribute("data-cert-status"));
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
    }
  });
});