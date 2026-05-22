sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Popover",
  "sap/m/List",
  "sap/m/CustomListItem",
  "sap/m/HBox",
  "sap/m/VBox",
  "sap/m/ObjectStatus",
  "sap/m/Text"
], function (Controller, Popover, List, CustomListItem, HBox, VBox, ObjectStatus, Text) {
  "use strict";

  return Controller.extend("competencycards.groupComponent.controller.Main", {
    onInit: function () {
      this._onChartClickBound = this._onChartClick.bind(this);
      this._onCertificateChartClickBound = this._onCertificateChartClick.bind(this);
    },

    onAfterRendering: function () {
      var oChartHtml = this.byId("chartHtml");
      var oCertificateChartHtml = this.byId("certificateChartHtml");

      if (oChartHtml) {
        oChartHtml.detachBrowserEvent("click", this._onChartClickBound);
        oChartHtml.attachBrowserEvent("click", this._onChartClickBound);
      }

      if (oCertificateChartHtml) {
        oCertificateChartHtml.detachBrowserEvent("click", this._onCertificateChartClickBound);
        oCertificateChartHtml.attachBrowserEvent("click", this._onCertificateChartClickBound);
      }
    },

    onExit: function () {
      var oChartHtml = this.byId("chartHtml");
      var oCertificateChartHtml = this.byId("certificateChartHtml");

      if (oChartHtml) {
        oChartHtml.detachBrowserEvent("click", this._onChartClickBound);
      }

      if (oCertificateChartHtml) {
        oCertificateChartHtml.detachBrowserEvent("click", this._onCertificateChartClickBound);
      }

      if (this._oPopover) {
        this._oPopover.destroy();
      }
    },

    onGroupChange: function (oEvent) {
      this.getOwnerComponent().onGroupChange(oEvent.getSource().getSelectedKey());
    },

    onRoleChange: function (oEvent) {
      this.getOwnerComponent().onRoleChange(oEvent.getSource().getSelectedKey());
    },

    onLegendPress: function (oEvent) {
      var oListItem = oEvent.getParameter("listItem");
      var oContext = oListItem && oListItem.getBindingContext("view");
      var sBucketKey = oContext && oContext.getProperty("bucketKey");

      if (!sBucketKey) {
        return;
      }

      this._openPopover(sBucketKey, oListItem, {
        path: "/bucketItems/",
        width: "16rem",
        labels: {
          Error: this._getText("AT_RISK_USERS", "At risk"),
          Warning: this._getText("ATTENTION_USERS", "Attention"),
          Success: this._getText("READY_USERS", "Strong")
        }
      });
    },

    _onChartClick: function (oEvent) {
      var oBucketNode = this._findBucketNode(oEvent.target, "data-team-bucket");

      if (!oBucketNode) {
        return;
      }

      this._openPopover(oBucketNode.getAttribute("data-team-bucket"), this.byId("chartHtml"), {
        path: "/bucketItems/",
        width: "16rem",
        labels: {
          Error: this._getText("AT_RISK_USERS", "At risk"),
          Warning: this._getText("ATTENTION_USERS", "Attention"),
          Success: this._getText("READY_USERS", "Strong")
        }
      });
    },

    onCertificateLegendPress: function (oEvent) {
      var oListItem = oEvent.getParameter("listItem");
      var oContext = oListItem && oListItem.getBindingContext("view");
      var sBucketKey = oContext && oContext.getProperty("bucketKey");

      if (!sBucketKey) {
        return;
      }

      this._openPopover(sBucketKey, oListItem, {
        path: "/certificateBucketItems/",
        width: "19rem",
        grouped: true,
        labels: {
          Planned: this._getText("CERTIFICATE_PLANNED", "Planned"),
          "Target Certificate": this._getText("CERTIFICATE_TARGET", "Target Certificate"),
          Overdue: this._getText("CERTIFICATE_OVERDUE", "Overdue"),
          Expiring: this._getText("CERTIFICATE_EXPIRING", "Expiring"),
          Compliant: this._getText("CERTIFICATE_COMPLIANT", "Compliant"),
          "Not Applicable": this._getText("CERTIFICATE_NOT_APPLICABLE", "Not Applicable")
        }
      });
    },

    _onCertificateChartClick: function (oEvent) {
      var oBucketNode = this._findBucketNode(oEvent.target, "data-cert-status");

      if (!oBucketNode) {
        return;
      }

      this._openPopover(oBucketNode.getAttribute("data-cert-status"), this.byId("certificateChartHtml"), {
        path: "/certificateBucketItems/",
        width: "19rem",
        grouped: true,
        labels: {
          Planned: this._getText("CERTIFICATE_PLANNED", "Planned"),
          "Target Certificate": this._getText("CERTIFICATE_TARGET", "Target Certificate"),
          Overdue: this._getText("CERTIFICATE_OVERDUE", "Overdue"),
          Expiring: this._getText("CERTIFICATE_EXPIRING", "Expiring"),
          Compliant: this._getText("CERTIFICATE_COMPLIANT", "Compliant"),
          "Not Applicable": this._getText("CERTIFICATE_NOT_APPLICABLE", "Not Applicable")
        }
      });
    },

    _findBucketNode: function (oTarget, sAttributeName) {
      var oCurrentNode = oTarget && oTarget.nodeType === Node.TEXT_NODE ? oTarget.parentElement : oTarget;

      while (oCurrentNode) {
        if (oCurrentNode.getAttribute && oCurrentNode.getAttribute(sAttributeName)) {
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

    _openPopover: function (sBucketKey, oOpenControl, mOptions) {
      var oView = this.getView();
      var oViewModel = oView.getModel("view");
      var aItems = oViewModel.getProperty((mOptions.path || "/bucketItems/") + sBucketKey) || [];
      var mLabelByBucket = mOptions.labels || {};
      var bGrouped = !!mOptions.grouped;
      var sContentHeight = this._calculatePopoverHeight(aItems, bGrouped);

      if (!this._oPopover) {
        this._oList = new List({
          noDataText: this._getText("NO_DATA", "No data available"),
          showSeparators: "Inner"
        });
        this._oPopover = new Popover({
          contentWidth: "18rem",
          contentHeight: "12rem",
          placement: "Auto",
          verticalScrolling: true,
          horizontalScrolling: false,
          content: [this._oList]
        });
        oView.addDependent(this._oPopover);
      }

      this._oPopover.setContentWidth(mOptions.width || "18rem");
      this._oPopover.setContentHeight(sContentHeight);

      this._oList.destroyItems();
      aItems.forEach(function (oItem) {
        var oContainer;
        var aContent;

        if (bGrouped && Array.isArray(oItem.lines)) {
          oContainer = new VBox({
            items: [
              new Text({
                text: oItem.title
              }).addStyleClass("sapMTitleStyleH6 sapUiTinyMarginBottom")
            ]
          }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBottom sapUiSmallMarginBegin sapUiSmallMarginEnd");

          oItem.lines.forEach(function (oLine) {
            oContainer.addItem(new Text({
              text: oLine.text,
              wrapping: true
            }).addStyleClass("sapUiSmallMarginBegin sapUiTinyMarginBottom"));
          });

          this._oList.addItem(new CustomListItem({
            content: [oContainer]
          }));
          return;
        }

        if (!oItem.description && !oItem.info) {
          this._oList.addItem(new CustomListItem({
            content: [new Text({
              text: oItem.title,
              wrapping: true
            }).addStyleClass("sapMTitleStyleH6 sapUiTinyMarginTop sapUiTinyMarginBottom")]
          }));
          return;
        }

        aContent = [
          new HBox({
            justifyContent: "SpaceBetween",
            alignItems: "Start",
            wrap: "Wrap",
            items: [
              new Text({
                text: oItem.title
              }).addStyleClass("sapMTitleStyleH6 sapUiTinyMarginEnd sapUiTinyMarginBottom"),
              new ObjectStatus({
                text: oItem.info,
                state: oItem.infoState,
                visible: !!oItem.info
              }).addStyleClass("sapUiTinyMarginBottom")
            ]
          })
        ];

        if (oItem.description) {
          aContent.push(new Text({
            text: oItem.description,
            wrapping: true
          }));
        }

        this._oList.addItem(new CustomListItem({
          content: [new VBox({
            items: aContent
          }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBottom sapUiSmallMarginBegin sapUiSmallMarginEnd")]
        }));
      }.bind(this));

      this._oPopover.setTitle((mLabelByBucket[sBucketKey] || sBucketKey) + " (" + aItems.length + ")");

      if (oOpenControl) {
        this._oPopover.openBy(oOpenControl);
      }
    },

    _calculatePopoverHeight: function (aItems, bGrouped) {
      var iVisibleRows;
      var fEstimatedHeight;

      if (bGrouped) {
        iVisibleRows = (aItems || []).reduce(function (iTotal, oItem) {
          return iTotal + 1 + Math.min((oItem.lines || []).length, 4);
        }, 0);
      } else {
        iVisibleRows = (aItems || []).length;
      }

      fEstimatedHeight = 4 + Math.min(Math.max(iVisibleRows, 3), 15) * 1.2;

      return Math.min(fEstimatedHeight, 22) + "rem";
    }
  });
});