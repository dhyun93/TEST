/**
 * API 서비스 통합 Export
 *
 * 사용 예시:
 * import { riskAssessmentApi, tbmApi } from '@/api';
 * await riskAssessmentApi.create({ ... });
 */

import * as authApi from "./00_Auth/auth.api"
import * as findApi from "./00_Auth/find.api"
import * as dashboardApi from "./01_Dashboard/dashboard.api"
import * as riskAssessmentApi from "./02_RiskAssessment/riskAssessment.api"
import * as educationApi from "./03_SafetyEducation/education.api"
import * as inspectionApi from "./04_Inspection/inspection.api"
import * as inspectionChecklistApi from "./04_Inspection/inspectionChecklist.api"
import * as machineApi from "./05_AssetManagement/machine.api"
import * as hazardApi from "./05_AssetManagement/hazard.api"
import * as safetyWorkPermitApi from "./06_SafetyWorkPermit/safetyWorkPermit.api"
import * as nearMissApi from "./07_NearMiss/nearMiss.api"
import * as safeVoiceApi from "./07_NearMiss/safeVoice.api"
import * as noticeListApi from "./08_NoticeBoard/noticeList.api"
import * as partnersApi from "./09_SupplyChainManagement/partners.api"
import * as evaluationApi from "./09_SupplyChainManagement/evaluation.api"
import * as committeeApi from "./09_SupplyChainManagement/committee.api"
import * as siteAuditApi from "./09_SupplyChainManagement/siteAudit.api"
import * as trainingApi from "./09_SupplyChainManagement/training.api"
import * as basicApi from "./10_BusinessManagement/01_Basic"
import * as policyApi from "./10_BusinessManagement/02_Policy"
import * as budgetApi from "./10_BusinessManagement/03_Budget"
import * as organizationApi from "./10_BusinessManagement/04_Organization"
import * as responseManualApi from "./11_ResponseManual/responseManual.api"
import * as supportApi from "./12_Support/support.api"
import * as approvalApi from "./13_ApprovalBox/approval"
import * as qrManagementApi from "./14_QRManagement/qrManagement.api"
import * as tbmApi from "./15_TBM/tbm.api"

export {
  authApi,
  findApi,
  dashboardApi,
  riskAssessmentApi,
  educationApi,
  inspectionApi,
  inspectionChecklistApi,
  machineApi,
  hazardApi,
  safetyWorkPermitApi,
  nearMissApi,
  safeVoiceApi,
  noticeListApi,
  partnersApi,
  evaluationApi,
  committeeApi,
  siteAuditApi,
  trainingApi,
  basicApi,
  policyApi,
  budgetApi,
  organizationApi,
  responseManualApi,
  supportApi,
  approvalApi,
  qrManagementApi,
  tbmApi,
}
