sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  var STATUS_BUCKETS = [{
    key: "Planned",
    label: "Planned",
    color: "#7DB2E8",
    state: "Indication03"
  }, {
    key: "Target Certificate",
    label: "Target Certificate",
    color: "#FF8A8A",
    state: "Error"
  }, {
    key: "Overdue",
    label: "Overdue",
    color: "#F9BE62",
    state: "Warning"
  }, {
    key: "Expiring",
    label: "Expiring",
    color: "#D666C4",
    state: "Indication04"
  }, {
    key: "Compliant",
    label: "Compliant",
    color: "#A8DDA0",
    state: "Success"
  }, {
    key: "Not Applicable",
    label: "Not Applicable",
    color: "#7EC0C3",
    state: "None"
  }];

  function createStatusCounts() {
    return STATUS_BUCKETS.reduce(function (oCounts, oBucket) {
      oCounts[oBucket.key] = 0;
      return oCounts;
    }, {});
  }

  function createBucketItems() {
    return STATUS_BUCKETS.reduce(function (oBuckets, oBucket) {
      oBuckets[oBucket.key] = [];
      return oBuckets;
    }, {});
  }

  function createLegendItems(oStatusCounts) {
    var oCounts = oStatusCounts || createStatusCounts();

    return STATUS_BUCKETS.map(function (oBucket) {
      return {
        bucketKey: oBucket.key,
        label: oBucket.label,
        color: oBucket.color,
        count: Number(oCounts[oBucket.key]) || 0
      };
    });
  }

  function createChartMarkup(oStatusCounts) {
    var oCounts = oStatusCounts || createStatusCounts();
    var iTotal = STATUS_BUCKETS.reduce(function (iSum, oBucket) {
      return iSum + (Number(oCounts[oBucket.key]) || 0);
    }, 0);
    var iSize = 176;
    var iCenter = 88;
    var iRadius = 50;
    var iStrokeWidth = 18;
    var fCircumference = 2 * Math.PI * iRadius;
    var fOffset = 0;
    var aMarkup = [
      '<div style="display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;padding:0.25rem;">',
      '<div style="display:flex;align-items:center;justify-content:center;width:' + iSize + 'px;height:' + iSize + 'px;border-radius:999px;background:radial-gradient(circle at 50% 45%, #ffffff 0%, #ffffff 48%, #f4f8fb 100%);box-shadow:0 10px 24px rgba(15,23,42,0.10);">',
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + iSize + '" height="' + iSize + '" viewBox="0 0 ' + iSize + ' ' + iSize + '">',
      '<circle cx="' + iCenter + '" cy="' + iCenter + '" r="' + iRadius + '" fill="none" stroke="#D5DADD" stroke-width="' + iStrokeWidth + '"/>',
      '<g transform="rotate(-90 ' + iCenter + ' ' + iCenter + ')">'
    ];

    if (iTotal > 0) {
      STATUS_BUCKETS.forEach(function (oBucket) {
        var iValue = Number(oCounts[oBucket.key]) || 0;
        var fLength;

        if (!iValue) {
          return;
        }

        fLength = iValue / iTotal * fCircumference;
        aMarkup.push(
          '<circle data-cert-status="' + oBucket.key + '" cx="' + iCenter + '" cy="' + iCenter + '" r="' + iRadius + '" fill="none" stroke="' + oBucket.color + '" stroke-width="' + iStrokeWidth + '" style="cursor:pointer;"',
          ' stroke-linecap="butt" stroke-dasharray="' + fLength.toFixed(3) + ' ' + (fCircumference - fLength).toFixed(3) + '"',
          ' stroke-dashoffset="' + (-fOffset).toFixed(3) + '"/>',
          ''
        );
        fOffset += fLength;
      });
    }

    aMarkup.push('</g>');
    aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter - 6) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="28" font-weight="700" fill="#223548">' + iTotal + '</text>');
    aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter + 16) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="12" fill="#5B738B">Certs</text>');
    aMarkup.push('</svg>');
    aMarkup.push('</div>');
    aMarkup.push('</div>');

    return aMarkup.join('');
  }

  function createViewData(mOptions) {
    var oOptions = mOptions || {};

    return {
      busy: oOptions.busy !== false,
      groups: oOptions.groups || [],
      selectedGroupKey: oOptions.selectedGroupKey || "",
      selectedGroup: oOptions.selectedGroup || null,
      totalCertifications: Number(oOptions.totalCertifications) || 0,
      memberCount: Number(oOptions.memberCount) || 0,
      overdueCount: Number(oOptions.overdueCount) || 0,
      expiringCount: Number(oOptions.expiringCount) || 0,
      statusCounts: oOptions.statusCounts || createStatusCounts(),
      legendItems: oOptions.legendItems || createLegendItems(oOptions.statusCounts),
      chartMarkup: oOptions.chartMarkup || createChartMarkup(oOptions.statusCounts),
      bucketItems: oOptions.bucketItems || createBucketItems(),
      error: oOptions.error || ""
    };
  }

  function normalizeGroups(oData) {
    var mSeenGroupKeys = Object.create(null);
    var aSource = Array.isArray(oData) ? oData : Array.isArray(oData && oData.results) ? oData.results : Array.isArray(oData && oData.value) ? oData.value : [];

    return aSource.reduce(function (aGroups, oGroup) {
      var sGroupKey = oGroup && (oGroup.key || oGroup.externalCode);

      if (!sGroupKey || mSeenGroupKeys[sGroupKey]) {
        return aGroups;
      }

      mSeenGroupKeys[sGroupKey] = true;
      aGroups.push({
        key: sGroupKey,
        description: oGroup && (oGroup.description || oGroup.externalName) || sGroupKey
      });

      return aGroups;
    }, []);
  }

  function resolveSelectedGroup(aGroups, sSelectedGroupKey) {
    return aGroups.find(function (oGroup) {
      return oGroup && oGroup.key === sSelectedGroupKey;
    }) || aGroups[0] || null;
  }

  function buildLegacyGroupTreeUrl(sBaseUrl, sGroupKey, sCacheKey) {
    return sBaseUrl.replace(/\/$/, "") + "/cmtrx/tree/" + encodeURIComponent(sGroupKey) + "?__request=" + encodeURIComponent(String(sCacheKey || Date.now()));
  }

  function buildGroupTreeUrl(sBaseUrl, sGroupKey, oEmployeeScope, sCacheKey) {
    var aQueryParameters = [
      "competenceGroups=" + encodeURIComponent(sGroupKey),
      "__request=" + encodeURIComponent(String(sCacheKey || Date.now()))
    ];

    if (oEmployeeScope && oEmployeeScope.businessUnit) {
      aQueryParameters.push("businessUnits[0]=" + encodeURIComponent(oEmployeeScope.businessUnit));
    }

    if (oEmployeeScope && oEmployeeScope.department) {
      aQueryParameters.push("departments[0]=" + encodeURIComponent(oEmployeeScope.department));
    }

    return sBaseUrl.replace(/\/$/, "") + "/cmtrxsrv/cmtrx/tree/" + encodeURIComponent(sGroupKey) + "?" + aQueryParameters.join("&");
  }

  function resolveStatusKey(oAssessment) {
    var oStatus = oAssessment && oAssessment.status || {};
    var sStatusId = oStatus.statusId || "";
    var sStatusName = oStatus.statusName || "";

    if (oAssessment && oAssessment.targetDisabled === true || /not applicable/i.test(sStatusName)) {
      return "Not Applicable";
    }

    if (sStatusId === "O" || /overdue/i.test(sStatusName)) {
      return "Overdue";
    }

    if (oAssessment && oAssessment.almostExpired === true) {
      return "Expiring";
    }

    if (sStatusId === "GP" || /planned/i.test(sStatusName)) {
      return "Planned";
    }

    if (sStatusId === "DEFAULT_TARGET" || /target/i.test(sStatusName)) {
      return "Target Certificate";
    }

    if (sStatusId === "C" || /compliant/i.test(sStatusName)) {
      return "Compliant";
    }

    return "Not Applicable";
  }

  function resolveStatusState(sStatusKey) {
    var oBucket = STATUS_BUCKETS.find(function (oStatusBucket) {
      return oStatusBucket.key === sStatusKey;
    });

    return oBucket ? oBucket.state : "None";
  }

  function resolveStatusLabel(sStatusKey) {
    var oBucket = STATUS_BUCKETS.find(function (oStatusBucket) {
      return oStatusBucket.key === sStatusKey;
    });

    return oBucket ? oBucket.label : sStatusKey;
  }

  function formatDate(sDateValue) {
    if (!sDateValue) {
      return "No expiry date";
    }

    return new Date(sDateValue).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function createTimingText(oAssessment, sStatusKey) {
    var sDateValue = oAssessment && oAssessment.validUntil;
    var oToday;
    var oTargetDate;
    var iDiff;

    if (!sDateValue) {
      return "Expiry date missing";
    }

    oToday = new Date();
    oToday.setHours(0, 0, 0, 0);
    oTargetDate = new Date(sDateValue);
    oTargetDate.setHours(0, 0, 0, 0);
    iDiff = Math.round((oTargetDate - oToday) / (1000 * 60 * 60 * 24));

    if (sStatusKey === "Overdue") {
      return iDiff >= 0 ? "Overdue now" : Math.abs(iDiff) + " day(s) overdue";
    }

    if (sStatusKey === "Expiring") {
      return iDiff < 0 ? "Already expired" : "Expires in " + iDiff + " day(s)";
    }

    return "Valid until " + formatDate(sDateValue);
  }

  function collectCertificationAssessments(oNode, aAssessments, mSeenAssessmentIds) {
    var oNodeAssessments;

    if (!oNode || typeof oNode !== "object") {
      return;
    }

    oNodeAssessments = oNode.assessments;
    if (oNodeAssessments && typeof oNodeAssessments === "object" && !Array.isArray(oNodeAssessments)) {
      Object.keys(oNodeAssessments).forEach(function (sKey) {
        var oAssessment = oNodeAssessments[sKey];
        var sAssessmentKey;

        if (!oAssessment || !oAssessment.status || oAssessment.status.type !== "Certification") {
          return;
        }

        if (!oAssessment.userId || oAssessment.isRoleAssessment || /^role_/i.test(oAssessment.userId)) {
          return;
        }

        sAssessmentKey = oAssessment.assessmentId || [oAssessment.userId, oAssessment.competenceId, sKey].join("-");
        if (mSeenAssessmentIds[sAssessmentKey]) {
          return;
        }

        mSeenAssessmentIds[sAssessmentKey] = true;
        aAssessments.push(oAssessment);
      });
    }

    Object.keys(oNode).forEach(function (sKey) {
      var vValue = oNode[sKey];

      if (!vValue || typeof vValue !== "object" || sKey === "assessments") {
        return;
      }

      if (Array.isArray(vValue)) {
        vValue.forEach(function (oChildNode) {
          collectCertificationAssessments(oChildNode, aAssessments, mSeenAssessmentIds);
        });
        return;
      }

      collectCertificationAssessments(vValue, aAssessments, mSeenAssessmentIds);
    });
  }

  function sortBucketItems(aItems) {
    return aItems.sort(function (oLeft, oRight) {
      if (oLeft.sortDate !== oRight.sortDate) {
        return oLeft.sortDate.localeCompare(oRight.sortDate);
      }

      if (oLeft.title !== oRight.title) {
        return oLeft.title.localeCompare(oRight.title);
      }

      return oLeft.description.localeCompare(oRight.description);
    });
  }

  function createOverviewData(oData) {
    var aAssessments = [];
    var mSeenAssessmentIds = Object.create(null);
    var mMemberIds = Object.create(null);
    var oStatusCounts = createStatusCounts();
    var oBucketItems = createBucketItems();
    var aSource = Array.isArray(oData && oData.matrix) ? oData.matrix : oData && oData.matrix ? oData.matrix : oData;

    collectCertificationAssessments(aSource, aAssessments, mSeenAssessmentIds);

    aAssessments.forEach(function (oAssessment) {
      var sStatusKey = resolveStatusKey(oAssessment);
      var sUserName = oAssessment.user && (oAssessment.user.userName || oAssessment.user.defaultFullName) || oAssessment.userName || oAssessment.userId || "Unknown user";
      var sCertificateName = oAssessment.competence && oAssessment.competence.externalName || oAssessment.competenceId || "Unknown certificate";

      oStatusCounts[sStatusKey] += 1;
      mMemberIds[oAssessment.userId] = true;
      oBucketItems[sStatusKey].push({
        title: sCertificateName,
        description: sUserName + " | " + (oAssessment.userId || "-") + " | Expires: " + formatDate(oAssessment.validUntil),
        info: createTimingText(oAssessment, sStatusKey),
        infoState: resolveStatusState(sStatusKey),
        sortDate: oAssessment.validUntil || "9999-12-31T00:00:00.000Z"
      });
    });

    Object.keys(oBucketItems).forEach(function (sBucketKey) {
      sortBucketItems(oBucketItems[sBucketKey]);
    });

    return {
      totalCertifications: aAssessments.length,
      memberCount: Object.keys(mMemberIds).length,
      overdueCount: Number(oStatusCounts.Overdue) || 0,
      expiringCount: Number(oStatusCounts.Expiring) || 0,
      statusCounts: oStatusCounts,
      bucketItems: oBucketItems
    };
  }

  return UIComponent.extend("competencycards.overdueCertificatesV3.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel(createViewData()), "view");
      this._iActiveTreeRequest = 0;
      this._oTreeRequestAbortController = null;
      this._oEmployeeScopePromise = null;
    },

    exit: function () {
      if (this._oTreeRequestAbortController) {
        this._oTreeRequestAbortController.abort();
        this._oTreeRequestAbortController = null;
      }

      this._iActiveTreeRequest += 1;
    },

    onCardReady: function (oCard) {
      this._oCard = oCard;
      this._loadGroups();
    },

    onGroupChange: function (sGroupKey) {
      var oViewModel = this.getModel("view");
      var oViewData = oViewModel.getData() || {};
      var oSelectedGroup = resolveSelectedGroup(oViewData.groups, sGroupKey);

      oViewModel.setData(createViewData({
        busy: true,
        groups: oViewData.groups,
        selectedGroupKey: oSelectedGroup && oSelectedGroup.key || "",
        selectedGroup: oSelectedGroup,
        totalCertifications: 0,
        memberCount: 0,
        overdueCount: 0,
        expiringCount: 0,
        statusCounts: createStatusCounts(),
        legendItems: createLegendItems(),
        chartMarkup: createChartMarkup(),
        bucketItems: createBucketItems(),
        error: ""
      }));

      return this._loadGroupTree(oSelectedGroup && oSelectedGroup.key || "");
    },

    _buildRequestUrl: function (sBaseUrl) {
      return sBaseUrl.replace(/\/$/, "") + "/help/groups";
    },

    _buildEmployeeContextUrl: function (sBaseUrl) {
      return sBaseUrl.replace(/\/$/, "") + "/icv/employees/me";
    },

    _loadEmployeeScope: function (sBaseUrl) {
      if (this._oEmployeeScopePromise) {
        return this._oEmployeeScopePromise;
      }

      this._oEmployeeScopePromise = fetch(this._buildEmployeeContextUrl(sBaseUrl), {
        cache: "no-store",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      })
        .then(function (oResponse) {
          if (!oResponse.ok) {
            throw new Error("Request failed: " + oResponse.status);
          }

          return oResponse.json();
        })
        .then(function (oData) {
          return {
            businessUnit: oData && oData.businessUnit || "",
            department: oData && oData.department || ""
          };
        })
        .catch(function () {
          return {
            businessUnit: "",
            department: ""
          };
        });

      return this._oEmployeeScopePromise;
    },

    _loadGroupTree: function (sGroupKey) {
      var oViewModel = this.getModel("view");
      var oCurrentData = oViewModel.getData() || {};
      var iRequestId = ++this._iActiveTreeRequest;
      var oAbortController = typeof AbortController !== "undefined" ? new AbortController() : null;

      if (!sGroupKey) {
        if (this._oTreeRequestAbortController) {
          this._oTreeRequestAbortController.abort();
          this._oTreeRequestAbortController = null;
        }

        oViewModel.setData(createViewData({
          busy: false,
          groups: oCurrentData.groups,
          selectedGroupKey: "",
          selectedGroup: null,
          totalCertifications: 0,
          memberCount: 0,
          overdueCount: 0,
          expiringCount: 0,
          statusCounts: createStatusCounts(),
          legendItems: createLegendItems(),
          chartMarkup: createChartMarkup(),
          bucketItems: createBucketItems(),
          error: ""
        }));
        return Promise.resolve();
      }

      if (this._oTreeRequestAbortController) {
        this._oTreeRequestAbortController.abort();
      }

      this._oTreeRequestAbortController = oAbortController;

      return this._oCard.resolveDestination("comp_mat_card")
        .then(function (sBaseUrl) {
          var sCacheKey = sGroupKey + "-" + iRequestId + "-" + Date.now();
          var mOptions = {
            cache: "no-store",
            headers: {
              "Accept": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            }
          };

          if (oAbortController) {
            mOptions.signal = oAbortController.signal;
          }

          return this._loadEmployeeScope(sBaseUrl)
            .then(function (oEmployeeScope) {
              return fetch(buildGroupTreeUrl(sBaseUrl, sGroupKey, oEmployeeScope, sCacheKey), mOptions)
                .then(function (oResponse) {
                  if (oResponse.ok || !oEmployeeScope.businessUnit && !oEmployeeScope.department) {
                    return oResponse;
                  }

                  return fetch(buildLegacyGroupTreeUrl(sBaseUrl, sGroupKey, sCacheKey), mOptions);
                });
            });
        }.bind(this))
        .then(function (oResponse) {
          if (!oResponse.ok) {
            throw new Error("Request failed: " + oResponse.status);
          }

          return oResponse.json();
        })
        .then(function (oData) {
          var oOverviewData = createOverviewData(oData);
          var oLatestData = oViewModel.getData() || {};

          if (iRequestId !== this._iActiveTreeRequest || oLatestData.selectedGroupKey !== sGroupKey) {
            return;
          }

          this._oTreeRequestAbortController = null;

          oViewModel.setData(createViewData({
            busy: false,
            groups: oLatestData.groups,
            selectedGroupKey: oLatestData.selectedGroupKey,
            selectedGroup: oLatestData.selectedGroup,
            totalCertifications: oOverviewData.totalCertifications,
            memberCount: oOverviewData.memberCount,
            overdueCount: oOverviewData.overdueCount,
            expiringCount: oOverviewData.expiringCount,
            statusCounts: oOverviewData.statusCounts,
            legendItems: createLegendItems(oOverviewData.statusCounts),
            chartMarkup: createChartMarkup(oOverviewData.statusCounts),
            bucketItems: oOverviewData.bucketItems,
            error: ""
          }));
        }.bind(this))
        .catch(function (oError) {
          var oFailedData = oViewModel.getData() || {};

          if (oError && oError.name === "AbortError") {
            return;
          }

          if (iRequestId !== this._iActiveTreeRequest || oFailedData.selectedGroupKey !== sGroupKey) {
            return;
          }

          this._oTreeRequestAbortController = null;

          oViewModel.setData(createViewData({
            busy: false,
            groups: oFailedData.groups,
            selectedGroupKey: oFailedData.selectedGroupKey,
            selectedGroup: oFailedData.selectedGroup,
            totalCertifications: oFailedData.totalCertifications,
            memberCount: oFailedData.memberCount,
            overdueCount: oFailedData.overdueCount,
            expiringCount: oFailedData.expiringCount,
            statusCounts: oFailedData.statusCounts,
            legendItems: oFailedData.legendItems,
            chartMarkup: oFailedData.chartMarkup,
            bucketItems: oFailedData.bucketItems,
            error: "Failed to load team certificate overview"
          }));
        }.bind(this));
    },

    _loadGroups: function () {
      var oViewModel = this.getModel("view");
      var oCurrentData = oViewModel.getData() || {};

      oViewModel.setData(createViewData({
        busy: true,
        groups: oCurrentData.groups,
        selectedGroupKey: oCurrentData.selectedGroupKey,
        selectedGroup: oCurrentData.selectedGroup,
        totalCertifications: oCurrentData.totalCertifications,
        memberCount: oCurrentData.memberCount,
        overdueCount: oCurrentData.overdueCount,
        expiringCount: oCurrentData.expiringCount,
        statusCounts: oCurrentData.statusCounts,
        legendItems: oCurrentData.legendItems,
        chartMarkup: oCurrentData.chartMarkup,
        bucketItems: oCurrentData.bucketItems,
        error: ""
      }));

      return this._oCard.resolveDestination("comp_mat_card")
        .then(function (sBaseUrl) {
          return fetch(this._buildRequestUrl(sBaseUrl), {
            headers: {
              "Accept": "application/json"
            }
          });
        }.bind(this))
        .then(function (oResponse) {
          if (!oResponse.ok) {
            throw new Error("Request failed: " + oResponse.status);
          }

          return oResponse.json();
        })
        .then(function (oData) {
          var aGroups = normalizeGroups(oData);
          var oSelectedGroup = resolveSelectedGroup(aGroups, oCurrentData.selectedGroupKey);

          oViewModel.setData(createViewData({
            busy: true,
            groups: aGroups,
            selectedGroupKey: oSelectedGroup && oSelectedGroup.key || "",
            selectedGroup: oSelectedGroup,
            totalCertifications: 0,
            memberCount: 0,
            overdueCount: 0,
            expiringCount: 0,
            statusCounts: createStatusCounts(),
            legendItems: createLegendItems(),
            chartMarkup: createChartMarkup(),
            bucketItems: createBucketItems(),
            error: ""
          }));

          return this._loadGroupTree(oSelectedGroup && oSelectedGroup.key || "");
        }.bind(this))
        .catch(function () {
          oViewModel.setData(createViewData({
            busy: false,
            groups: oCurrentData.groups,
            selectedGroupKey: oCurrentData.selectedGroupKey,
            selectedGroup: oCurrentData.selectedGroup,
            totalCertifications: oCurrentData.totalCertifications,
            memberCount: oCurrentData.memberCount,
            overdueCount: oCurrentData.overdueCount,
            expiringCount: oCurrentData.expiringCount,
            statusCounts: oCurrentData.statusCounts,
            legendItems: oCurrentData.legendItems,
            chartMarkup: oCurrentData.chartMarkup,
            bucketItems: oCurrentData.bucketItems,
            error: "Failed to load groups"
          }));
        });
    }
  });
});