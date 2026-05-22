sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  var TRAINING_APP_URL_PREFIX = "https://flexso-consumer-dev.launchpad.cfapps.eu10.hana.ondemand.com/site?siteId=c527b1f3-011c-44f0-9e42-0374d6614bdf#training-proficiency?sap-app-origin-hint=c107c03c-5919-4e30-be0b-e218a3b69760&/";
  var TRAINING_APP_URL_SUFFIX = "/40021/0038/?";
  var EXPIRING_WINDOW_DAYS = 30;

  function createViewData(mOptions) {
    var oOptions = mOptions || {};

    return {
      busy: oOptions.busy !== false,
      fullName: oOptions.fullName || "",
      summaryText: oOptions.summaryText || "",
      overdueCount: oOptions.overdueCount || 0,
      trainingHtmlText: oOptions.trainingHtmlText || "",
      trainingUrl: oOptions.trainingUrl || "",
      trainingMessage: oOptions.trainingMessage || "",
      items: oOptions.items || [],
      error: oOptions.error || ""
    };
  }

  function getDayDiff(sDateValue, oReferenceDate) {
    var oTargetDate;

    if (!sDateValue) {
      return null;
    }

    oTargetDate = new Date(sDateValue);

    if (isNaN(oTargetDate.getTime())) {
      return null;
    }

    oTargetDate.setHours(0, 0, 0, 0);

    return Math.round((oTargetDate - oReferenceDate) / (1000 * 60 * 60 * 24));
  }

  function isOverdueAssessment(oItem, iDayDiff) {
    return !!(oItem && oItem.status && oItem.status.statusId === "O") || iDayDiff !== null && iDayDiff < 0;
  }

  function isExpiringSoonAssessment(oItem, iDayDiff) {
    return !!(oItem && oItem.almostExpired === true) || iDayDiff !== null && iDayDiff >= 0 && iDayDiff <= EXPIRING_WINDOW_DAYS;
  }

  function createAttentionInfo(oItem, oToday) {
    var iDayDiff = getDayDiff(oItem && oItem.validUntil, oToday);
    var bOverdue = isOverdueAssessment(oItem, iDayDiff);

    if (bOverdue) {
      if (iDayDiff === null || iDayDiff >= 0) {
        return {
          subtitle: "Expired on " + formatDateValue(oItem && oItem.validUntil),
          infoText: "Overdue",
          infoState: "Error",
          sortDate: oItem && oItem.validUntil || "0000-01-01T00:00:00.000Z",
          isOverdue: true
        };
      }

      return {
        subtitle: "Expired on " + formatDateValue(oItem && oItem.validUntil),
        infoText: Math.abs(iDayDiff) + " day(s) overdue",
        infoState: "Error",
        sortDate: oItem && oItem.validUntil || "0000-01-01T00:00:00.000Z",
        isOverdue: true
      };
    }

    return {
      subtitle: "Expires on " + formatDateValue(oItem && oItem.validUntil),
      infoText: iDayDiff === null ? "Expiring soon" : "Expires in " + iDayDiff + " day(s)",
      infoState: "Warning",
      sortDate: oItem && oItem.validUntil || "9999-12-31T00:00:00.000Z",
      isOverdue: false
    };
  }

  function createSummaryText(iOverdueCount, iExpiringSoonCount) {
    if (!iOverdueCount && !iExpiringSoonCount) {
      return "No overdue or soon-to-expire certificates";
    }

    if (iOverdueCount && iExpiringSoonCount) {
      return iOverdueCount + " overdue and " + iExpiringSoonCount + " expiring within " + EXPIRING_WINDOW_DAYS + " days";
    }

    if (iOverdueCount) {
      return iOverdueCount + " overdue certificate(s)";
    }

    return iExpiringSoonCount + " certificate(s) expiring within " + EXPIRING_WINDOW_DAYS + " days";
  }

  function escapeHtml(sValue) {
    return String(sValue || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeTrainingUserId(vCandidate) {
    var sCandidate = vCandidate === null || vCandidate === undefined ? "" : String(vCandidate).trim();

    if (!sCandidate || /\s|@/.test(sCandidate)) {
      return "";
    }

    return /^[A-Za-z0-9._-]+$/.test(sCandidate) ? sCandidate : "";
  }

  function extractTrainingUserId(oData, aAssessments) {
    var aCandidates = [
      oData && oData.userId,
      oData && oData.username,
      oData && oData.personIdExternal,
      oData && oData.employeeId,
      oData && oData.user && oData.user.userId,
      oData && oData.user && oData.user.username
    ];
    var sCandidate;
    var iIndex;

    (aAssessments || []).some(function (oItem) {
      aCandidates.push(
        oItem && oItem.userId,
        oItem && oItem.user && oItem.user.userId,
        oItem && oItem.user && oItem.user.username
      );

      return aCandidates.length >= 12;
    });

    for (iIndex = 0; iIndex < aCandidates.length; iIndex += 1) {
      sCandidate = normalizeTrainingUserId(aCandidates[iIndex]);

      if (sCandidate) {
        return sCandidate;
      }
    }

    return "";
  }

  function createTrainingUrl(sUserId) {
    if (!sUserId) {
      return "";
    }

    return TRAINING_APP_URL_PREFIX + encodeURIComponent(sUserId) + TRAINING_APP_URL_SUFFIX;
  }

  function createTrainingHtmlText(sTrainingUrl, sTrainingMessage) {
    if (sTrainingUrl) {
      return "Open training app: <a href=\"" + escapeHtml(sTrainingUrl) + "\" target=\"_blank\">View training profile</a>";
    }

    if (sTrainingMessage) {
      return "Open training app: " + escapeHtml(sTrainingMessage);
    }

    return "";
  }

  function formatDateValue(sDateValue) {
    if (!sDateValue) {
      return "No expiry date";
    }

    return new Date(sDateValue).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  return UIComponent.extend("competencycards.overdueCertificatesV2.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel(createViewData()), "view");
    },

    onCardReady: function (oCard) {
      this._oCard = oCard;
      this._loadData();
    },

    _loadData: function () {
      var oViewModel = this.getModel("view");

      oViewModel.setData(createViewData({
        busy: true
      }));

      return this._oCard.resolveDestination("comp_mat_card")
        .then(function (sBaseUrl) {
          return fetch(sBaseUrl.replace(/\/$/, "") + "/icv/employees/me", {
            headers: {
              "Accept": "application/json"
            }
          });
        })
        .then(function (oResponse) {
          if (!oResponse.ok) {
            throw new Error("Request failed: " + oResponse.status);
          }

          return oResponse.json();
        })
        .then(function (oData) {
          var oToday = new Date();
          var aAssessments = Array.isArray(oData.assessments) ? oData.assessments : [];
          var sTrainingUserId = extractTrainingUserId(oData, aAssessments);
          var sTrainingUrl = createTrainingUrl(sTrainingUserId);
          var aItems;
          var iOverdueCount = 0;
          var iExpiringSoonCount = 0;

          oToday.setHours(0, 0, 0, 0);

          aItems = aAssessments
            .filter(function (oItem) {
              var iDayDiff;

              if (!oItem || !oItem.status || oItem.status.type !== "Certification") {
                return false;
              }

              iDayDiff = getDayDiff(oItem.validUntil, oToday);

              return isOverdueAssessment(oItem, iDayDiff) || isExpiringSoonAssessment(oItem, iDayDiff);
            })
            .map(function (oItem) {
              var oAttentionInfo = createAttentionInfo(oItem, oToday);

              if (oAttentionInfo.isOverdue) {
                iOverdueCount += 1;
              } else {
                iExpiringSoonCount += 1;
              }

              return {
                title: oItem.competence && oItem.competence.externalName || oItem.competenceId || "Unknown certificate",
                subtitle: oAttentionInfo.subtitle,
                infoText: oAttentionInfo.infoText,
                infoState: oAttentionInfo.infoState,
                sortDate: oAttentionInfo.sortDate
              };
            })
            .sort(function (oItemA, oItemB) {
              if (oItemA.sortDate !== oItemB.sortDate) {
                return oItemA.sortDate.localeCompare(oItemB.sortDate);
              }

              return oItemA.title.localeCompare(oItemB.title);
            });

          oViewModel.setData(createViewData({
            busy: false,
            fullName: oData.defaultFullName || "",
            summaryText: createSummaryText(iOverdueCount, iExpiringSoonCount),
            overdueCount: iOverdueCount,
            trainingHtmlText: createTrainingHtmlText(sTrainingUrl, sTrainingUrl ? "" : "Training profile unavailable"),
            trainingUrl: sTrainingUrl,
            trainingMessage: sTrainingUrl ? "" : "Training profile unavailable",
            items: aItems
          }));
        })
        .catch(function () {
          oViewModel.setData(createViewData({
            busy: false,
            error: "Failed to load overdue certificates"
          }));
        });
    }
  });
});