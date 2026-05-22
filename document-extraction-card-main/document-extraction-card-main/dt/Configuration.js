sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {
  "use strict";
  return function () {
    return new Designtime({
      form: {
        items: {
          /* ===== Header ===== */
          headerGroup: {
            type: "group",
            label: "Card Header"
          },
          cardTitle: {
            manifestpath: "/sap.card/header/title",
            type: "string",
            translatable: true,
            label: "Card Title"
          },
          cardSubTitle: {
            manifestpath: "/sap.card/header/subTitle",
            type: "string",
            translatable: true,
            label: "Card Subtitle"
          },

          /* ===== Chart ===== */
          chartGroup: {
            type: "group",
            label: "Chart Settings"
          },
          chartTitle: {
            manifestpath: "/sap.card/content/chartProperties/title/text",
            type: "string",
            translatable: true,
            label: "Chart Title"
          },
          xAxisTitle: {
            manifestpath: "/sap.card/content/chartProperties/categoryAxis/title/text",
            type: "string",
            translatable: true,
            label: "X-Axis Title"
          },
          yAxisTitle: {
            manifestpath: "/sap.card/content/chartProperties/valueAxis/title/text",
            type: "string",
            translatable: true,
            label: "Y-Axis Title"
          },
          showLegend: {
            manifestpath: "/sap.card/content/chartProperties/legend/visible",
            type: "boolean",
            label: "Show Legend",
            visualization: {
              type: "Switch",
              settings: {
                state: "{currentSettings>value}",
                customTextOn: "Yes",
                customTextOff: "No",
                enabled: "{currentSettings>editable}"
              }
            }
          },
          showDataLabels: {
            manifestpath: "/sap.card/content/chartProperties/plotArea/dataLabel/visible",
            type: "boolean",
            label: "Show Data Labels",
            visualization: {
              type: "Switch",
              settings: {
                state: "{currentSettings>value}",
                customTextOn: "Yes",
                customTextOff: "No",
                enabled: "{currentSettings>editable}"
              }
            }
          }
        }
      },
      preview: {
        modes: "AbstractToLive"
      }
    });
  };
});
