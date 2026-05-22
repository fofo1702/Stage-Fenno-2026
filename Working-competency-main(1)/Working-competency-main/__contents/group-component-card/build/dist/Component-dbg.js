sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  var CERTIFICATE_STATUS_BUCKETS = [{
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

  function createViewData(mOptions) {
    var oOptions = mOptions || {};

    return {
      busy: oOptions.busy !== false,
      groups: oOptions.groups || [],
      selectedGroupKey: oOptions.selectedGroupKey || "",
      selectedGroup: oOptions.selectedGroup || null,
      roles: oOptions.roles || [],
      selectedRoleKey: oOptions.selectedRoleKey || "",
      memberCount: Number(oOptions.memberCount) || 0,
      originalTeamSize: Number(oOptions.originalTeamSize) || 0,
      averageReadiness: Number(oOptions.averageReadiness) || 0,
      averageReadinessText: oOptions.averageReadinessText || "0%",
      averageReadinessState: oOptions.averageReadinessState || "None",
      readyCount: Number(oOptions.readyCount) || 0,
      attentionCount: Number(oOptions.attentionCount) || 0,
      riskCount: Number(oOptions.riskCount) || 0,
      totalCertifications: Number(oOptions.totalCertifications) || 0,
      overdueCertificates: Number(oOptions.overdueCertificates) || 0,
      expiringCertificates: Number(oOptions.expiringCertificates) || 0,
      legendItems: oOptions.legendItems || createLegendItems(oOptions),
      bucketItems: oOptions.bucketItems || createBucketItems(),
      chartMarkup: oOptions.chartMarkup || createChartMarkup(oOptions),
      certificateLegendItems: oOptions.certificateLegendItems || createCertificateLegendItems(oOptions.certificateStatusCounts),
      certificateBucketItems: oOptions.certificateBucketItems || createCertificateBucketItems(),
      certificateChartMarkup: oOptions.certificateChartMarkup || createCertificateChartMarkup(oOptions.certificateStatusCounts),
      certificateStatusCounts: oOptions.certificateStatusCounts || createCertificateStatusCounts(),
      selectedCategoryKey: oOptions.selectedCategoryKey || "",
      selectedCategoryTitle: oOptions.selectedCategoryTitle || "",
      donutSegments: oOptions.donutSegments || [],
      displayedTeamMembers: oOptions.displayedTeamMembers || oOptions.teamMembers || [],
      allTeamMembers: oOptions.allTeamMembers || [],
      teamMembers: oOptions.teamMembers || [],
      allCertificateAssessments: oOptions.allCertificateAssessments || [],
      error: oOptions.error || ""
    };
  }

  function createBucketItems() {
    return {
      Success: [],
      Warning: [],
      Error: []
    };
  }

  function createCertificateStatusCounts() {
    return CERTIFICATE_STATUS_BUCKETS.reduce(function (oCounts, oBucket) {
      oCounts[oBucket.key] = 0;
      return oCounts;
    }, {});
  }

  function createCertificateBucketItems() {
    return CERTIFICATE_STATUS_BUCKETS.reduce(function (oBuckets, oBucket) {
      oBuckets[oBucket.key] = [];
      return oBuckets;
    }, {});
  }

  function createRoleItems(aTeamMembers) {
    var mSeenRoles = Object.create(null);
    var aRoleItems = [{
      key: "",
      title: "All roles"
    }];

    (aTeamMembers || []).forEach(function (oTeamMember) {
      (oTeamMember.roles || []).forEach(function (sRoleId) {
        if (!sRoleId || mSeenRoles[sRoleId]) {
          return;
        }

        mSeenRoles[sRoleId] = true;
        aRoleItems.push({
          key: sRoleId,
          title: oTeamMember.roleTitles && oTeamMember.roleTitles[sRoleId] || sRoleId
        });
      });
    });

    return [aRoleItems[0]].concat(aRoleItems.slice(1).sort(function (oLeft, oRight) {
      return oLeft.title.localeCompare(oRight.title);
    }));
  }

  function resolveSelectedRoleKey(aRoles, sSelectedRoleKey) {
    return (aRoles || []).some(function (oRole) {
      return oRole.key === sSelectedRoleKey;
    }) ? sSelectedRoleKey : "";
  }

  function getRoleId(oRole) {
    return oRole && (oRole.externalCode || oRole.roleId || oRole.id || oRole.key) || "";
  }

  function getRoleTitle(oRole, sRoleId) {
    return oRole && (oRole.externalName || oRole.roleName || oRole.roleDescription || oRole.description || oRole.name) || sRoleId;
  }

  function createLegendItems(oSummary) {
    return [{
      bucketKey: "Error",
      label: "At risk",
      color: "#BB0000",
      count: Number(oSummary && oSummary.riskCount) || 0
    }, {
      bucketKey: "Warning",
      label: "Attention",
      color: "#E9730C",
      count: Number(oSummary && oSummary.attentionCount) || 0
    }, {
      bucketKey: "Success",
      label: "Strong",
      color: "#107E3E",
      count: Number(oSummary && oSummary.readyCount) || 0
    }];
  }

  function createChartMarkup(oSummary) {
    var iRiskCount = Number(oSummary && oSummary.riskCount) || 0;
    var iAttentionCount = Number(oSummary && oSummary.attentionCount) || 0;
    var iReadyCount = Number(oSummary && oSummary.readyCount) || 0;
    var iTotal = iRiskCount + iAttentionCount + iReadyCount;
    var iSize = 176;
    var iCenter = 88;
    var iRadius = 50;
    var iStrokeWidth = 18;
    var fCircumference = 2 * Math.PI * iRadius;
    var fOffset = 0;
    var sCenterText = oSummary && oSummary.averageReadinessText || "0%";
    var aSegments = [{
      key: "Error",
      value: iRiskCount,
      color: "#BB0000"
    }, {
      key: "Warning",
      value: iAttentionCount,
      color: "#E9730C"
    }, {
      key: "Success",
      value: iReadyCount,
      color: "#107E3E"
    }];
    var aMarkup = [
      '<div style="display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;padding:0.25rem;">',
      '<div style="display:flex;align-items:center;justify-content:center;width:' + iSize + 'px;height:' + iSize + 'px;border-radius:999px;background:radial-gradient(circle at 50% 45%, #ffffff 0%, #ffffff 48%, #f4f8fb 100%);box-shadow:0 10px 24px rgba(15,23,42,0.10);">',
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + iSize + '" height="' + iSize + '" viewBox="0 0 ' + iSize + ' ' + iSize + '">',
      '<circle cx="' + iCenter + '" cy="' + iCenter + '" r="' + iRadius + '" fill="none" stroke="#D5DADD" stroke-width="' + iStrokeWidth + '"/>',
      '<g transform="rotate(-90 ' + iCenter + ' ' + iCenter + ')">'
    ];

    if (iTotal > 0) {
      aSegments.forEach(function (oSegment) {
        var fLength;

        if (!oSegment.value) {
          return;
        }

        fLength = oSegment.value / iTotal * fCircumference;
        aMarkup.push(
          '<circle data-team-bucket="' + oSegment.key + '" cx="' + iCenter + '" cy="' + iCenter + '" r="' + iRadius + '" fill="none" stroke="' + oSegment.color + '" stroke-width="' + iStrokeWidth + '" style="cursor:pointer;"',
          ' stroke-linecap="butt" stroke-dasharray="' + fLength.toFixed(3) + ' ' + (fCircumference - fLength).toFixed(3) + '"',
          ' stroke-dashoffset="' + (-fOffset).toFixed(3) + '"/>',
          ''
        );
        fOffset += fLength;
      });
    }

    aMarkup.push('</g>');
    aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter - 6) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="28" font-weight="700" fill="#223548">' + sCenterText + '</text>');
    aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter + 16) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="12" fill="#5B738B">Readiness</text>');
    aMarkup.push('</svg>');
    aMarkup.push('</div>');
    aMarkup.push('</div>');

    return aMarkup.join('');
  }

  function createCertificateLegendItems(oStatusCounts) {
    var oCounts = oStatusCounts || createCertificateStatusCounts();

    return CERTIFICATE_STATUS_BUCKETS.map(function (oBucket) {
      return {
        bucketKey: oBucket.key,
        label: oBucket.label,
        color: oBucket.color,
        count: Number(oCounts[oBucket.key]) || 0
      };
    });
  }

  function createCertificateChartMarkup(oStatusCounts) {
    var oCounts = oStatusCounts || createCertificateStatusCounts();
    var iTotal = CERTIFICATE_STATUS_BUCKETS.reduce(function (iSum, oBucket) {
      return iSum + (Number(oCounts[oBucket.key]) || 0);
    }, 0);
    var iSize = 176;
    var iCenter = 88;
    var iRadius = 50;
    var iStrokeWidth = 18;
    var fCircumference = 2 * Math.PI * iRadius;
    var fOffset = 0;
    var sCenterText = iTotal ? Math.round((Number(oCounts.Compliant) || 0) / iTotal * 100) + "%" : "0%";
    var aMarkup = [
      '<div style="display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;padding:0.25rem;">',
      '<div style="display:flex;align-items:center;justify-content:center;width:' + iSize + 'px;height:' + iSize + 'px;border-radius:999px;background:radial-gradient(circle at 50% 45%, #ffffff 0%, #ffffff 48%, #f4f8fb 100%);box-shadow:0 10px 24px rgba(15,23,42,0.10);">',
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + iSize + '" height="' + iSize + '" viewBox="0 0 ' + iSize + ' ' + iSize + '">',
      '<circle cx="' + iCenter + '" cy="' + iCenter + '" r="' + iRadius + '" fill="none" stroke="#D5DADD" stroke-width="' + iStrokeWidth + '"/>',
      '<g transform="rotate(-90 ' + iCenter + ' ' + iCenter + ')">'
    ];

    if (iTotal > 0) {
      CERTIFICATE_STATUS_BUCKETS.forEach(function (oBucket) {
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
  aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter - 6) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="28" font-weight="700" fill="#223548">' + sCenterText + '</text>');
  aMarkup.push('<text x="' + iCenter + '" y="' + (iCenter + 16) + '" text-anchor="middle" font-family="72, Arial, sans-serif" font-size="12" fill="#5B738B">Healthy</text>');
    aMarkup.push('</svg>');
    aMarkup.push('</div>');
    aMarkup.push('</div>');

    return aMarkup.join('');
  }

  function resolveCategoryTitle(sCategoryKey) {
    if (sCategoryKey === "Success") {
      return "Strong";
    }

    if (sCategoryKey === "Warning") {
      return "Attention";
    }

    if (sCategoryKey === "Error") {
      return "At risk";
    }

    return "";
  }

  function createDonutSegments(oSummary, sSelectedCategoryKey) {
    return [{
      key: "Success",
      label: "Strong",
      value: Number(oSummary.readyCount) || 0,
      displayedValue: String(Number(oSummary.readyCount) || 0),
      color: "Good",
      selected: sSelectedCategoryKey === "Success"
    }, {
      key: "Warning",
      label: "Attention",
      value: Number(oSummary.attentionCount) || 0,
      displayedValue: String(Number(oSummary.attentionCount) || 0),
      color: "Critical",
      selected: sSelectedCategoryKey === "Warning"
    }, {
      key: "Error",
      label: "At risk",
      value: Number(oSummary.riskCount) || 0,
      displayedValue: String(Number(oSummary.riskCount) || 0),
      color: "Error",
      selected: sSelectedCategoryKey === "Error"
    }];
  }

  function createDisplayedTeamMembers(aTeamMembers, sSelectedCategoryKey) {
    if (!sSelectedCategoryKey) {
      return aTeamMembers || [];
    }

    return (aTeamMembers || []).filter(function (oMember) {
      return oMember.readinessState === sSelectedCategoryKey;
    });
  }

  function createPopoverBucketItems(aTeamMembers) {
    return (aTeamMembers || []).reduce(function (oBuckets, oMember) {
      if (!oBuckets[oMember.readinessState]) {
        return oBuckets;
      }

      oBuckets[oMember.readinessState].push({
        title: oMember.title,
        description: oMember.description + ' | ' + oMember.readinessDisplay + ' | ' + oMember.metricsText
      });

      return oBuckets;
    }, createBucketItems());
  }

  function filterTeamMembersByRole(aTeamMembers, sRoleKey) {
    var aScopedMembers = !sRoleKey ? (aTeamMembers || []) : (aTeamMembers || []).filter(function (oTeamMember) {
      return (oTeamMember.roles || []).indexOf(sRoleKey) !== -1;
    });

    return aScopedMembers.map(function (oTeamMember) {
      return createTeamMemberItem(oTeamMember, sRoleKey);
    }).sort(sortTeamMembers);
  }

  function filterCertificateAssessmentsByRole(aAssessments, sRoleKey) {
    if (!sRoleKey) {
      return aAssessments || [];
    }

    return (aAssessments || []).filter(function (oAssessment) {
      return oAssessment && oAssessment.targetRoleId === sRoleKey;
    });
  }

  function resolveCertificateStatusKey(oAssessment) {
    var oStatus = oAssessment && oAssessment.status || {};
    var sStatusId = oStatus.statusId || "";
    var sStatusName = oStatus.statusName || "";

    if (oAssessment && oAssessment.targetDisabled === true || /not applicable/i.test(sStatusName)) {
      return "Not Applicable";
    }

    if (sStatusId === "O" || /overdue/i.test(sStatusName)) {
      return "Overdue";
    }

    if (sStatusId === "GP" || /planned/i.test(sStatusName)) {
      return "Planned";
    }

    if (sStatusId === "DEFAULT_TARGET" || sStatusId === "NA" || /target/i.test(sStatusName)) {
      return "Target Certificate";
    }

    if (oAssessment && oAssessment.almostExpired === true) {
      return "Expiring";
    }

    if (sStatusId === "C" || /compliant/i.test(sStatusName)) {
      return "Compliant";
    }

    return "Not Applicable";
  }

  function resolveCertificateStatusState(sStatusKey) {
    var oBucket = CERTIFICATE_STATUS_BUCKETS.find(function (oStatusBucket) {
      return oStatusBucket.key === sStatusKey;
    });

    return oBucket ? oBucket.state : "None";
  }

  function formatCertificateDate(sDateValue) {
    if (!sDateValue) {
      return "No expiry date";
    }

    return new Date(sDateValue).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function createCertificateTimingText(oAssessment, sStatusKey) {
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

    return "Valid until " + formatCertificateDate(sDateValue);
  }

  function collectCertificationAssessments(oNode, aAssessments, mSeenAssessmentIds) {
    var oAssessments;

    if (!oNode || typeof oNode !== "object") {
      return;
    }

    oAssessments = oNode.assessments;
    if (oAssessments && typeof oAssessments === "object" && !Array.isArray(oAssessments)) {
      Object.keys(oAssessments).forEach(function (sKey) {
        var oAssessment = oAssessments[sKey];
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

  function createCertificateAssessments(oData) {
    var aAssessments = [];
    var mSeenAssessmentIds = Object.create(null);
    var vSource = Array.isArray(oData && oData.matrix) ? oData.matrix : oData && oData.matrix ? oData.matrix : oData;

    collectCertificationAssessments(vSource, aAssessments, mSeenAssessmentIds);

    return aAssessments;
  }

  function createCertificateSummaryFromAssessments(aAssessments) {
    var oStatusCounts = createCertificateStatusCounts();
    var oBucketItems = createCertificateBucketItems();
    var mGroupedBuckets = Object.create(null);

    (aAssessments || []).forEach(function (oAssessment) {
      var sStatusKey = resolveCertificateStatusKey(oAssessment);
      var sUserName = oAssessment.user && (oAssessment.user.userName || oAssessment.user.defaultFullName) || oAssessment.userName || oAssessment.userId || "Unknown user";
      var sCertificateName = oAssessment.competence && oAssessment.competence.externalName || oAssessment.competenceId || "Unknown certificate";
      var sGroupKey = sStatusKey + "::" + sCertificateName;
      var oGroupedItem;

      oStatusCounts[sStatusKey] += 1;

      if (!mGroupedBuckets[sGroupKey]) {
        mGroupedBuckets[sGroupKey] = {
          title: sCertificateName,
          lines: [],
          infoState: resolveCertificateStatusState(sStatusKey),
          sortDate: oAssessment.validUntil || "9999-12-31T00:00:00.000Z"
        };
        oBucketItems[sStatusKey].push(mGroupedBuckets[sGroupKey]);
      }

      oGroupedItem = mGroupedBuckets[sGroupKey];
      if ((oAssessment.validUntil || "9999-12-31T00:00:00.000Z") < oGroupedItem.sortDate) {
        oGroupedItem.sortDate = oAssessment.validUntil || "9999-12-31T00:00:00.000Z";
      }

      oGroupedItem.lines.push({
        text: sUserName + " - " + formatCertificateDate(oAssessment.validUntil),
        sortDate: oAssessment.validUntil || "9999-12-31T00:00:00.000Z",
        userName: sUserName,
        userId: oAssessment.userId || ""
      });
    });

    Object.keys(oBucketItems).forEach(function (sBucketKey) {
      oBucketItems[sBucketKey].sort(function (oLeft, oRight) {
        if (oLeft.sortDate !== oRight.sortDate) {
          return oLeft.sortDate.localeCompare(oRight.sortDate);
        }

        if (oLeft.title !== oRight.title) {
          return oLeft.title.localeCompare(oRight.title);
        }

        return oLeft.lines.length - oRight.lines.length;
      });

      oBucketItems[sBucketKey].forEach(function (oItem) {
        oItem.lines.sort(function (oLeft, oRight) {
          if (oLeft.sortDate !== oRight.sortDate) {
            return oLeft.sortDate.localeCompare(oRight.sortDate);
          }

          if (oLeft.userName !== oRight.userName) {
            return oLeft.userName.localeCompare(oRight.userName);
          }

          return oLeft.userId.localeCompare(oRight.userId);
        });
      });
    });

    return {
      totalCertifications: (aAssessments || []).length,
      overdueCertificates: Number(oStatusCounts.Overdue) || 0,
      expiringCertificates: Number(oStatusCounts.Expiring) || 0,
      certificateStatusCounts: oStatusCounts,
      certificateBucketItems: oBucketItems,
      certificateLegendItems: createCertificateLegendItems(oStatusCounts),
      certificateChartMarkup: createCertificateChartMarkup(oStatusCounts)
    };
  }

  function applyRoleFilterToViewData(oViewData, sRoleKey) {
    var oNextViewData = Object.assign({}, oViewData);
    var aFilteredTeamMembers = filterTeamMembersByRole(oNextViewData.allTeamMembers, sRoleKey);
    var aFilteredCertificateAssessments = filterCertificateAssessmentsByRole(oNextViewData.allCertificateAssessments, sRoleKey);
    var oTeamSummary = createTeamSummary(aFilteredTeamMembers);
    var oCertificateSummary = createCertificateSummaryFromAssessments(aFilteredCertificateAssessments);

    oNextViewData.selectedRoleKey = sRoleKey || "";
    oNextViewData.memberCount = aFilteredTeamMembers.length;
    oNextViewData.averageReadiness = oTeamSummary.averageReadiness;
    oNextViewData.averageReadinessText = oTeamSummary.averageReadinessText;
    oNextViewData.averageReadinessState = oTeamSummary.averageReadinessState;
    oNextViewData.readyCount = oTeamSummary.readyCount;
    oNextViewData.attentionCount = oTeamSummary.attentionCount;
    oNextViewData.riskCount = oTeamSummary.riskCount;
    oNextViewData.legendItems = createLegendItems(oTeamSummary);
    oNextViewData.bucketItems = createPopoverBucketItems(aFilteredTeamMembers);
    oNextViewData.chartMarkup = createChartMarkup(oTeamSummary);
    oNextViewData.totalCertifications = oCertificateSummary.totalCertifications;
    oNextViewData.overdueCertificates = oCertificateSummary.overdueCertificates;
    oNextViewData.expiringCertificates = oCertificateSummary.expiringCertificates;
    oNextViewData.certificateLegendItems = oCertificateSummary.certificateLegendItems;
    oNextViewData.certificateBucketItems = oCertificateSummary.certificateBucketItems;
    oNextViewData.certificateChartMarkup = oCertificateSummary.certificateChartMarkup;
    oNextViewData.certificateStatusCounts = oCertificateSummary.certificateStatusCounts;
    oNextViewData.teamMembers = aFilteredTeamMembers;

    return applyCategorySelectionToViewData(oNextViewData, oNextViewData.selectedCategoryKey);
  }

  function applyCategorySelectionToViewData(oViewData, sSelectedCategoryKey) {
    var oNextViewData = Object.assign({}, oViewData);

    oNextViewData.selectedCategoryKey = sSelectedCategoryKey || "";
    oNextViewData.selectedCategoryTitle = resolveCategoryTitle(sSelectedCategoryKey);
    oNextViewData.displayedTeamMembers = createDisplayedTeamMembers(oNextViewData.teamMembers, sSelectedCategoryKey);
    oNextViewData.donutSegments = createDonutSegments(oNextViewData, sSelectedCategoryKey);

    return oNextViewData;
  }

  function resolveReadinessState(fReadiness, iTrackedAssessmentCount) {
    if (!iTrackedAssessmentCount) {
      return "None";
    }

    if (fReadiness >= 70) {
      return "Success";
    }

    if (fReadiness >= 40) {
      return "Warning";
    }

    return "Error";
  }

  function resolveReadinessLabel(sState, iTrackedAssessmentCount) {
    if (!iTrackedAssessmentCount) {
      return "No role data";
    }

    if (sState === "Success") {
      return "Strong";
    }

    if (sState === "Warning") {
      return "Needs attention";
    }

    return "At risk";
  }

  function isAchievedAssessment(oAssessment) {
    var fGap = Number(oAssessment && oAssessment.gap);
    var sStatusId = oAssessment && (oAssessment.statusId || oAssessment.status && oAssessment.status.statusId);

    if (!isNaN(fGap)) {
      return fGap >= 0;
    }

    return sStatusId === "C";
  }

  function normalizeGroups(oData) {
    var mSeenGroupKeys = Object.create(null);
    var aSource = Array.isArray(oData) ? oData : Array.isArray(oData && oData.results) ? oData.results : Array.isArray(oData && oData.value) ? oData.value : [];

    return aSource.reduce(function (aGroups, oGroup) {
      var sGroupKey = oGroup && (oGroup.key || oGroup.externalCode);
      var bTargetFeatureEnabled;

      if (!sGroupKey || mSeenGroupKeys[sGroupKey]) {
        return aGroups;
      }

      bTargetFeatureEnabled = !!(oGroup && (oGroup.targetFeatureEnabled || oGroup.cust_target === "ON"));
      mSeenGroupKeys[sGroupKey] = true;
      aGroups.push({
        key: sGroupKey,
        description: oGroup && (oGroup.description || oGroup.externalName) || sGroupKey,
        targetFeatureEnabled: bTargetFeatureEnabled,
        targetFeatureText: bTargetFeatureEnabled ? "Enabled" : "Disabled",
        targetFeatureState: bTargetFeatureEnabled ? "Success" : "Warning"
      });

      return aGroups;
    }, []);
  }

  function resolveSelectedGroup(aGroups, sSelectedGroupKey) {
    return aGroups.find(function (oGroup) {
      return oGroup && oGroup.key === sSelectedGroupKey;
    }) || aGroups[0] || null;
  }

  function collectTeamMembers(oNode, mMembersById, mRoleTitleById) {
    var oAssessments;

    if (!oNode || typeof oNode !== "object") {
      return;
    }

    oAssessments = oNode.assessments;
    if (oAssessments && typeof oAssessments === "object" && !Array.isArray(oAssessments)) {
      Object.keys(oAssessments).forEach(function (sKey) {
        var oAssessment = oAssessments[sKey];
        var sUserId = oAssessment && (oAssessment.userId || oAssessment.user && oAssessment.user.userId);
        var sUserName = oAssessment && (oAssessment.user && oAssessment.user.userName || oAssessment.userName);
        var sTargetRoleId = oAssessment && oAssessment.targetRoleId;
        var oMember;

        if (!sUserId || oAssessment && oAssessment.isRoleAssessment || /^role_/i.test(sUserId)) {
          return;
        }

        oMember = mMembersById[sUserId];
        if (!oMember) {
          oMember = mMembersById[sUserId] = {
            key: sUserId,
            userId: sUserId,
            title: sUserName || sUserId,
            roles: [],
            roleTitles: Object.create(null),
            assessments: [],
            assessmentCount: 0,
            trackedAssessmentCount: 0,
            achievedCount: 0,
            overdueCount: 0,
            plannedCount: 0,
            _seenAssessmentIds: Object.create(null)
          };
        }

        if (sUserName && oMember.title === sUserId) {
          oMember.title = sUserName;
        }

        if (sTargetRoleId && oMember.roles.indexOf(sTargetRoleId) === -1) {
          oMember.roles.push(sTargetRoleId);
        }

        if (sTargetRoleId) {
          oMember.roleTitles[sTargetRoleId] = mRoleTitleById && mRoleTitleById[sTargetRoleId] || sTargetRoleId;
        }

        if (oMember._seenAssessmentIds[oAssessment.assessmentId || sKey]) {
          return;
        }

        oMember._seenAssessmentIds[oAssessment.assessmentId || sKey] = true;

        oMember.assessmentCount += 1;
        oMember.assessments.push({
          targetRoleId: sTargetRoleId || "",
          isRoleRelevant: oAssessment.isRoleRelevant,
          statusId: oAssessment.status && oAssessment.status.statusId || "",
          gap: oAssessment.gap
        });

        if (oAssessment.isRoleRelevant !== false) {
          oMember.trackedAssessmentCount += 1;

          if (isAchievedAssessment(oAssessment)) {
            oMember.achievedCount += 1;
          }
        }

        if (oAssessment.status && oAssessment.status.statusId === "O") {
          oMember.overdueCount += 1;
        }

        if (oAssessment.status && oAssessment.status.statusId === "GP") {
          oMember.plannedCount += 1;
        }
      });
    }

    Object.keys(oNode).forEach(function (sKey) {
      var vValue = oNode[sKey];

      if (!vValue || typeof vValue !== "object" || sKey === "assessments") {
        return;
      }

      if (Array.isArray(vValue)) {
        vValue.forEach(function (oChildNode) {
          collectTeamMembers(oChildNode, mMembersById, mRoleTitleById);
        });
        return;
      }

      collectTeamMembers(vValue, mMembersById, mRoleTitleById);
    });
  }

  function sortTeamMembers(oLeft, oRight) {
    var mStateOrder = {
      Error: 0,
      Warning: 1,
      Success: 2,
      None: 3
    };

    if (mStateOrder[oLeft.readinessState] !== mStateOrder[oRight.readinessState]) {
      return mStateOrder[oLeft.readinessState] - mStateOrder[oRight.readinessState];
    }

    if (oLeft.readinessValue !== oRight.readinessValue) {
      return oLeft.readinessValue - oRight.readinessValue;
    }

    return oLeft.title.localeCompare(oRight.title);
  }

  function createTeamMemberItem(oMember, sRoleKey) {
    var aAssessments = !sRoleKey ? (oMember.assessments || []) : (oMember.assessments || []).filter(function (oAssessment) {
      return oAssessment.targetRoleId === sRoleKey;
    });
    var iAssessmentCount = aAssessments.length;
    var iTrackedAssessmentCount = aAssessments.reduce(function (iCount, oAssessment) {
      return oAssessment.isRoleRelevant !== false ? iCount + 1 : iCount;
    }, 0) || iAssessmentCount;
    var iAchievedCount = aAssessments.reduce(function (iCount, oAssessment) {
      if (oAssessment.isRoleRelevant === false) {
        return iCount;
      }

      return isAchievedAssessment(oAssessment) ? iCount + 1 : iCount;
    }, 0);
    var iOverdueCount = aAssessments.reduce(function (iCount, oAssessment) {
      return oAssessment.statusId === "O" ? iCount + 1 : iCount;
    }, 0);
    var iPlannedCount = aAssessments.reduce(function (iCount, oAssessment) {
      return oAssessment.statusId === "GP" ? iCount + 1 : iCount;
    }, 0);
    var fReadiness = iTrackedAssessmentCount ? iAchievedCount / iTrackedAssessmentCount * 100 : 0;
    var sState = resolveReadinessState(fReadiness, iTrackedAssessmentCount);
    var aMetricParts = [
      "Achieved " + iAchievedCount + "/" + iTrackedAssessmentCount
    ];
    var sRolesText = sRoleKey ? oMember.roleTitles && oMember.roleTitles[sRoleKey] || sRoleKey : (oMember.roles.length ? oMember.roles.map(function (sCurrentRoleId) {
      return oMember.roleTitles && oMember.roleTitles[sCurrentRoleId] || sCurrentRoleId;
    }).join(", ") : "-");

    if (iOverdueCount) {
      aMetricParts.push("Overdue " + iOverdueCount);
    }

    if (iPlannedCount) {
      aMetricParts.push("Planned " + iPlannedCount);
    }

    return {
      key: oMember.key,
      userId: oMember.userId,
      title: oMember.title,
      description: "User ID: " + oMember.userId + " | Roles: " + sRolesText,
      info: iTrackedAssessmentCount ? fReadiness.toFixed(0) + "%" : "-",
      infoState: sState,
      readinessValue: Math.round(fReadiness),
      readinessDisplay: iTrackedAssessmentCount ? fReadiness.toFixed(0) + "%" : "-",
      readinessState: sState,
      readinessLabel: resolveReadinessLabel(sState, iTrackedAssessmentCount),
      metricsText: aMetricParts.join(" | "),
      trackedAssessmentCount: iTrackedAssessmentCount,
      achievedCount: iAchievedCount,
      overdueCount: iOverdueCount,
      plannedCount: iPlannedCount,
      assessmentCount: iAssessmentCount,
      roles: oMember.roles || [],
      roleTitles: oMember.roleTitles || {},
      assessments: oMember.assessments || []
    };
  }

  function createTeamMembers(oData, mRoleTitleById) {
    var mMembersById = Object.create(null);
    var vSource = Array.isArray(oData && oData.matrix) ? oData.matrix : oData && oData.matrix ? oData.matrix : oData;

    collectTeamMembers(vSource, mMembersById, mRoleTitleById);

    return Object.keys(mMembersById).map(function (sUserId) {
      return createTeamMemberItem(mMembersById[sUserId], "");
    }).sort(sortTeamMembers);
  }

  function createTeamSummary(aTeamMembers) {
    var iTrackedMembers = 0;
    var fTotalReadiness = 0;

    return (aTeamMembers || []).reduce(function (oSummary, oMember) {
      if (oMember.trackedAssessmentCount) {
        iTrackedMembers += 1;
        fTotalReadiness += oMember.readinessValue;
      }

      if (oMember.readinessState === "Success") {
        oSummary.readyCount += 1;
      } else if (oMember.readinessState === "Warning") {
        oSummary.attentionCount += 1;
      } else if (oMember.readinessState === "Error") {
        oSummary.riskCount += 1;
      }

      oSummary.averageReadiness = iTrackedMembers ? Math.round(fTotalReadiness / iTrackedMembers) : 0;
      oSummary.averageReadinessText = oSummary.averageReadiness + "%";
      oSummary.averageReadinessState = resolveReadinessState(oSummary.averageReadiness, iTrackedMembers);

      return oSummary;
    }, {
      averageReadiness: 0,
      averageReadinessText: "0%",
      averageReadinessState: "None",
      readyCount: 0,
      attentionCount: 0,
      riskCount: 0
    });
  }

  return UIComponent.extend("competencycards.groupComponent.Component", {
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
        roles: [],
        selectedRoleKey: "",
        memberCount: 0,
        originalTeamSize: 0,
        averageReadiness: 0,
        averageReadinessText: "0%",
        averageReadinessState: "None",
        readyCount: 0,
        attentionCount: 0,
        riskCount: 0,
        totalCertifications: 0,
        overdueCertificates: 0,
        expiringCertificates: 0,
        legendItems: createLegendItems(),
        bucketItems: createBucketItems(),
        chartMarkup: createChartMarkup(),
        certificateLegendItems: createCertificateLegendItems(),
        certificateBucketItems: createCertificateBucketItems(),
        certificateChartMarkup: createCertificateChartMarkup(),
        certificateStatusCounts: createCertificateStatusCounts(),
        selectedCategoryKey: "",
        selectedCategoryTitle: "",
        donutSegments: [],
        displayedTeamMembers: [],
        allTeamMembers: [],
        teamMembers: [],
        allCertificateAssessments: [],
        error: ""
      }));

      return this._loadGroupTree(oSelectedGroup && oSelectedGroup.key || "");
    },

    onRoleChange: function (sRoleKey) {
      var oViewModel = this.getModel("view");
      var oViewData = oViewModel.getData() || {};

      oViewModel.setData(createViewData(applyRoleFilterToViewData(oViewData, sRoleKey || "")));
    },

    onCategorySelect: function (sCategoryKey, bSelected) {
      var oViewModel = this.getModel("view");
      var oViewData = oViewModel.getData() || {};
      var sNextCategoryKey = bSelected ? sCategoryKey : "";

      oViewModel.setData(createViewData(applyCategorySelectionToViewData(oViewData, sNextCategoryKey)));
    },

    _buildRequestUrl: function (sBaseUrl) {
      return sBaseUrl.replace(/\/$/, "") + "/help/groups";
    },

    _buildEmployeeContextUrl: function (sBaseUrl) {
      return sBaseUrl.replace(/\/$/, "") + "/icv/employees/me";
    },

    _buildLegacyGroupTreeUrl: function (sBaseUrl, sGroupKey, sCacheKey) {
      return sBaseUrl.replace(/\/$/, "") + "/cmtrx/tree/" + encodeURIComponent(sGroupKey) + "?__request=" + encodeURIComponent(String(sCacheKey || Date.now()));
    },

    _buildGroupTreeUrl: function (sBaseUrl, sGroupKey, oEmployeeScope, sCacheKey) {
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
          var mRoleTitleById = Object.create(null);

          (oData && oData.roles || []).forEach(function (oRole) {
            var sRoleId = getRoleId(oRole);

            if (!sRoleId) {
              return;
            }

            mRoleTitleById[sRoleId] = getRoleTitle(oRole, sRoleId);
          });

          return {
            businessUnit: oData && oData.businessUnit || "",
            department: oData && oData.department || "",
            roleTitleById: mRoleTitleById
          };
        })
        .catch(function () {
          return {
            businessUnit: "",
            department: "",
            roleTitleById: {}
          };
        });

      return this._oEmployeeScopePromise;
    },

    _loadGroupTree: function (sGroupKey) {
      var oViewModel = this.getModel("view");
      var oCurrentData = oViewModel.getData() || {};
      var iRequestId = ++this._iActiveTreeRequest;
      var oAbortController = typeof AbortController !== "undefined" ? new AbortController() : null;
      var oResolvedEmployeeScope;

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
          roles: [],
          selectedRoleKey: "",
          memberCount: 0,
          originalTeamSize: 0,
          averageReadiness: 0,
          averageReadinessText: "0%",
          averageReadinessState: "None",
          readyCount: 0,
          attentionCount: 0,
          riskCount: 0,
          totalCertifications: 0,
          overdueCertificates: 0,
          expiringCertificates: 0,
          legendItems: createLegendItems(),
          bucketItems: createBucketItems(),
          chartMarkup: createChartMarkup(),
          certificateLegendItems: createCertificateLegendItems(),
          certificateBucketItems: createCertificateBucketItems(),
          certificateChartMarkup: createCertificateChartMarkup(),
          certificateStatusCounts: createCertificateStatusCounts(),
          selectedCategoryKey: "",
          selectedCategoryTitle: "",
          donutSegments: [],
          displayedTeamMembers: [],
          allTeamMembers: [],
          teamMembers: [],
          allCertificateAssessments: []
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
              oResolvedEmployeeScope = oEmployeeScope;

              return fetch(this._buildGroupTreeUrl(sBaseUrl, sGroupKey, oEmployeeScope, sCacheKey), mOptions)
                .then(function (oResponse) {
                  if (oResponse.ok || !oEmployeeScope.businessUnit && !oEmployeeScope.department) {
                    return oResponse;
                  }

                  return fetch(this._buildLegacyGroupTreeUrl(sBaseUrl, sGroupKey, sCacheKey), mOptions);
                }.bind(this));
            }.bind(this));
        }.bind(this))
        .then(function (oResponse) {
          if (!oResponse.ok) {
            throw new Error("Request failed: " + oResponse.status);
          }

          return oResponse.json();
        })
        .then(function (oData) {
          var aTeamMembers = createTeamMembers(oData, oResolvedEmployeeScope && oResolvedEmployeeScope.roleTitleById);
          var aCertificateAssessments = createCertificateAssessments(oData);
          var aRoles = createRoleItems(aTeamMembers);
          var oLatestData = oViewModel.getData() || {};
          var sSelectedRoleKey = resolveSelectedRoleKey(aRoles, oLatestData.selectedRoleKey);

          if (iRequestId !== this._iActiveTreeRequest || oLatestData.selectedGroupKey !== sGroupKey) {
            return;
          }

          this._oTreeRequestAbortController = null;

          oViewModel.setData(createViewData(applyRoleFilterToViewData({
            busy: false,
            groups: oLatestData.groups,
            selectedGroupKey: oLatestData.selectedGroupKey,
            selectedGroup: oLatestData.selectedGroup,
            roles: aRoles,
            selectedRoleKey: sSelectedRoleKey,
            memberCount: aTeamMembers.length,
            originalTeamSize: Number(oData && oData.originalTeamSize) || aTeamMembers.length,
            averageReadiness: 0,
            averageReadinessText: "0%",
            averageReadinessState: "None",
            readyCount: 0,
            attentionCount: 0,
            riskCount: 0,
            totalCertifications: 0,
            overdueCertificates: 0,
            expiringCertificates: 0,
            legendItems: createLegendItems(),
            bucketItems: createBucketItems(),
            chartMarkup: createChartMarkup(),
            certificateLegendItems: createCertificateLegendItems(),
            certificateBucketItems: createCertificateBucketItems(),
            certificateChartMarkup: createCertificateChartMarkup(),
            certificateStatusCounts: createCertificateStatusCounts(),
            selectedCategoryKey: "",
            selectedCategoryTitle: "",
            allTeamMembers: aTeamMembers,
            allCertificateAssessments: aCertificateAssessments,
            teamMembers: aTeamMembers
          }, sSelectedRoleKey)));
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
            roles: oFailedData.roles,
            selectedRoleKey: oFailedData.selectedRoleKey,
            memberCount: oFailedData.memberCount,
            originalTeamSize: oFailedData.originalTeamSize,
            averageReadiness: oFailedData.averageReadiness,
            averageReadinessText: oFailedData.averageReadinessText,
            averageReadinessState: oFailedData.averageReadinessState,
            readyCount: oFailedData.readyCount,
            attentionCount: oFailedData.attentionCount,
            riskCount: oFailedData.riskCount,
            totalCertifications: oFailedData.totalCertifications,
            overdueCertificates: oFailedData.overdueCertificates,
            expiringCertificates: oFailedData.expiringCertificates,
            legendItems: oFailedData.legendItems,
            bucketItems: oFailedData.bucketItems,
            chartMarkup: oFailedData.chartMarkup,
            certificateLegendItems: oFailedData.certificateLegendItems,
            certificateBucketItems: oFailedData.certificateBucketItems,
            certificateChartMarkup: oFailedData.certificateChartMarkup,
            certificateStatusCounts: oFailedData.certificateStatusCounts,
            selectedCategoryKey: oFailedData.selectedCategoryKey,
            selectedCategoryTitle: oFailedData.selectedCategoryTitle,
            donutSegments: oFailedData.donutSegments,
            displayedTeamMembers: oFailedData.displayedTeamMembers,
            allTeamMembers: oFailedData.allTeamMembers,
            teamMembers: oFailedData.teamMembers,
            allCertificateAssessments: oFailedData.allCertificateAssessments,
            error: "Failed to load group members"
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
        roles: oCurrentData.roles,
        selectedRoleKey: oCurrentData.selectedRoleKey,
        memberCount: oCurrentData.memberCount,
        originalTeamSize: oCurrentData.originalTeamSize,
        averageReadiness: oCurrentData.averageReadiness,
        averageReadinessText: oCurrentData.averageReadinessText,
        averageReadinessState: oCurrentData.averageReadinessState,
        readyCount: oCurrentData.readyCount,
        attentionCount: oCurrentData.attentionCount,
        riskCount: oCurrentData.riskCount,
        totalCertifications: oCurrentData.totalCertifications,
        overdueCertificates: oCurrentData.overdueCertificates,
        expiringCertificates: oCurrentData.expiringCertificates,
        legendItems: oCurrentData.legendItems,
        bucketItems: oCurrentData.bucketItems,
        chartMarkup: oCurrentData.chartMarkup,
        certificateLegendItems: oCurrentData.certificateLegendItems,
        certificateBucketItems: oCurrentData.certificateBucketItems,
        certificateChartMarkup: oCurrentData.certificateChartMarkup,
        certificateStatusCounts: oCurrentData.certificateStatusCounts,
        selectedCategoryKey: oCurrentData.selectedCategoryKey,
        selectedCategoryTitle: oCurrentData.selectedCategoryTitle,
        donutSegments: oCurrentData.donutSegments,
        displayedTeamMembers: oCurrentData.displayedTeamMembers,
        allTeamMembers: oCurrentData.allTeamMembers,
        teamMembers: oCurrentData.teamMembers,
        allCertificateAssessments: oCurrentData.allCertificateAssessments
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
            roles: [],
            selectedRoleKey: "",
            memberCount: 0,
            originalTeamSize: 0,
            averageReadiness: 0,
            averageReadinessText: "0%",
            averageReadinessState: "None",
            readyCount: 0,
            attentionCount: 0,
            riskCount: 0,
            totalCertifications: 0,
            overdueCertificates: 0,
            expiringCertificates: 0,
            legendItems: createLegendItems(),
            bucketItems: createBucketItems(),
            chartMarkup: createChartMarkup(),
            certificateLegendItems: createCertificateLegendItems(),
            certificateBucketItems: createCertificateBucketItems(),
            certificateChartMarkup: createCertificateChartMarkup(),
            certificateStatusCounts: createCertificateStatusCounts(),
            selectedCategoryKey: "",
            selectedCategoryTitle: "",
            donutSegments: [],
            displayedTeamMembers: [],
            allTeamMembers: [],
            teamMembers: [],
            allCertificateAssessments: []
          }));

          return this._loadGroupTree(oSelectedGroup && oSelectedGroup.key || "");
        }.bind(this))
        .catch(function () {
          oViewModel.setData(createViewData({
            busy: false,
            groups: oCurrentData.groups,
            selectedGroupKey: oCurrentData.selectedGroupKey,
            selectedGroup: oCurrentData.selectedGroup,
            roles: oCurrentData.roles,
            selectedRoleKey: oCurrentData.selectedRoleKey,
            memberCount: oCurrentData.memberCount,
            originalTeamSize: oCurrentData.originalTeamSize,
            averageReadiness: oCurrentData.averageReadiness,
            averageReadinessText: oCurrentData.averageReadinessText,
            averageReadinessState: oCurrentData.averageReadinessState,
            readyCount: oCurrentData.readyCount,
            attentionCount: oCurrentData.attentionCount,
            riskCount: oCurrentData.riskCount,
            totalCertifications: oCurrentData.totalCertifications,
            overdueCertificates: oCurrentData.overdueCertificates,
            expiringCertificates: oCurrentData.expiringCertificates,
            legendItems: oCurrentData.legendItems,
            bucketItems: oCurrentData.bucketItems,
            chartMarkup: oCurrentData.chartMarkup,
            certificateLegendItems: oCurrentData.certificateLegendItems,
            certificateBucketItems: oCurrentData.certificateBucketItems,
            certificateChartMarkup: oCurrentData.certificateChartMarkup,
            certificateStatusCounts: oCurrentData.certificateStatusCounts,
            selectedCategoryKey: oCurrentData.selectedCategoryKey,
            selectedCategoryTitle: oCurrentData.selectedCategoryTitle,
            donutSegments: oCurrentData.donutSegments,
            displayedTeamMembers: oCurrentData.displayedTeamMembers,
            allTeamMembers: oCurrentData.allTeamMembers,
            teamMembers: oCurrentData.teamMembers,
            allCertificateAssessments: oCurrentData.allCertificateAssessments,
            error: "Failed to load groups"
          }));
        })
        ;
    }
  });
});