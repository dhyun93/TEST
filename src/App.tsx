import React, { useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useLoadingStore } from "./stores/loadingStore"
import { useAuthStore } from "./stores/authUserStore"
import { useApprovalStore } from "./stores/approvalStore"
import { AUTO_LOGIN_TOAST_KEY, LOGOUT_ALERT_KEY } from "@/constants/auth"
import { getUserLevelLabel } from "@/constants/user"
import Spinner from "./components/common/base/Spinner"
import ToastProvider from "./components/common/base/Toast"

import MainLayout from "./components/layout/MainLayout"
import RiskAssessmentLayout from "./components/layout/RiskAssessmentLayout"
import BusinessManagementLayout from "./components/layout/BusinessManagementLayout"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard/Dashboard"

import Inspection from "./pages/Inspection/Inspection"
import InspectionChecklist from "./pages/Inspection/InspectionChecklist"

import TBM from "./pages/TBM/TBM"
import TBMRegister from "./pages/TBM/TBMRegister"

import BasicManagement from "./pages/BusinessManagement/BasicManagement"
import PolicyGoal from "./pages/BusinessManagement/PolicyGoal"
import Budget from "./pages/BusinessManagement/Budget"
import Organization from "./pages/BusinessManagement/Organization"
import ApprovalLine from "./pages/BusinessManagement/ApprovalLine"
import Attendee from "./pages/BusinessManagement/Attendee"

import EvaluationList from "./pages/RiskAssessment/EvaluationList"

import FrequencyStep1 from "./pages/RiskAssessment/methods/Frequency/FrequencyStep1"
import FrequencyStep2 from "./pages/RiskAssessment/methods/Frequency/FrequencyStep2"
import FrequencyStep3 from "./pages/RiskAssessment/methods/Frequency/FrequencyStep3"

import Checklist from "./pages/RiskAssessment/methods/Checklist/Checklist"

import ThreeStep1 from "./pages/RiskAssessment/methods/ThreeStep/ThreeStep1"
import ThreeStep2 from "./pages/RiskAssessment/methods/ThreeStep/ThreeStep2"
import ThreeStep3 from "./pages/RiskAssessment/methods/ThreeStep/ThreeStep3"

import Chemical from "./pages/RiskAssessment/methods/Chemical/Chemical"

import NearMiss from "./pages/NearMiss/NearMiss"
import SafeVoice from "./pages/NearMiss/SafeVoice"

import EducationList from "./pages/SafetyEducation/Education"
import EducationRegister from "./pages/SafetyEducation/EducationRegister"

import AssetMachine from "./pages/AssetManagement/AssetMachine"
import AssetHazard from "./pages/AssetManagement/AssetHazard"

import Partners from "./pages/SupplyChainManagement/Partners"
import Evaluation from "./pages/SupplyChainManagement/Evaluation"
import Committee from "./pages/SupplyChainManagement/Committee"
import SiteAudit from "./pages/SupplyChainManagement/SiteAudit"
import Training from "./pages/SupplyChainManagement/Training"

import SafetyWorkPermit from "./pages/SafetyWorkPermit/SafetyWorkPermit"
import ResponseManual from "./pages/ResponseManual/ResponseManual"
import NoticeList from "./pages/NoticeBoard/NoticeList"
import ResourcesList from "./pages/NoticeBoard/ResourcesList"
import LawBoard from "./pages/NoticeBoard/LawBoard"

import ReceivedApproval from "./pages/ApprovalBox/ReceivedApproval"
import SentApproval from "./pages/ApprovalBox/SentApproval"

import PTWList from "./pages/PTW/list/PTWList"
import PTWWorkPermitList from "./pages/PTW/list/PTWWorkPermitList"
import PTWJSAList from "./pages/PTW/list/PTWJSAList"
import PTWSiteEvaluationList from "./pages/PTW/list/PTWSiteEvaluationList"
import PTWTBMList from "./pages/PTW/list/PTWTBMList"
import PTWRegister from "./pages/PTW/PTWRegister"
import PTWManage from "./pages/PTW/PTWManage"

import QRManagement from "./pages/QRManagement/QR"
import MyPage from "./pages/MyPage/MyPage"
import Support from "./pages/Support/Support"
import UserGuide from "./pages/UserGuide/UserGuide"

import QRInspection from "./components/QR/QRInspection"
import QRTBM from "./components/QR/QRTBM"
import QRNearMiss from "./components/QR/QRNearMiss"
import QREducation from "./components/QR/QREducation"

import useSecurityBlock from "./hooks/useSecurityBlock"

type RequireAuthProps = {
  children: React.ReactElement
}

const DEV_BYPASS_AUTH = import.meta.env.DEV // 인증 우회

// Vercel 데모용
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  return children
}

const AppRoutes: React.FC = () => {
  useSecurityBlock()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/public/inspection" element={<QRInspection />} />
      <Route path="/public/tbm" element={<QRTBM />} />
      <Route path="/public/nearmiss" element={<QRNearMiss type="nearmiss" />} />
      <Route path="/public/safevoice" element={<QRNearMiss type="safevoice" />} />
      <Route path="/public/education" element={<QREducation />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/inspection" element={<Inspection />} />
        <Route path="/inspection/results" element={<Inspection />} />
        <Route path="/inspection/checklist" element={<InspectionChecklist />} />

        <Route path="/tbm" element={<TBM />} />
        <Route path="/tbm/register" element={<TBMRegister />} />

        <Route path="/nearmiss" element={<Navigate to="/nearmiss/incident" replace />} />
        <Route path="/nearmiss/incident" element={<NearMiss />} />
        <Route path="/nearmiss/safevoice" element={<SafeVoice />} />

        <Route path="/safety-education" element={<Navigate to="/safety-education/education" replace />} />
        <Route path="/safety-education/education" element={<EducationList />} />
        <Route path="/safety-education/register" element={<EducationRegister />} />

        <Route path="/asset-management" element={<Navigate to="/asset-management/machine" replace />} />
        <Route path="/asset-management/machine" element={<AssetMachine />} />
        <Route path="/asset-management/hazard" element={<AssetHazard />} />

        <Route path="/supply-chain-management" element={<Navigate to="/supply-chain-management/partners" replace />} />
        <Route path="/supply-chain-management/partners" element={<Partners />} />
        <Route path="/supply-chain-management/evaluation" element={<Evaluation />} />
        <Route path="/supply-chain-management/committee" element={<Committee />} />
        <Route path="/supply-chain-management/siteaudit" element={<SiteAudit />} />
        <Route path="/supply-chain-management/training" element={<Training />} />

        <Route path="/notice-board" element={<Navigate to="/notice-board/notice" replace />} />
        <Route path="/notice-board/notice" element={<NoticeList />} />
        <Route path="/notice-board/resources" element={<ResourcesList />} />
        <Route path="/notice-board/law" element={<LawBoard />} />

        <Route path="/ptw" element={<Navigate to="/ptw/list" replace />} />
        <Route path="/ptw/list" element={<PTWList />} />
        <Route path="/ptw/work-permit" element={<PTWWorkPermitList />} />
        <Route path="/ptw/jsa" element={<PTWJSAList />} />
        <Route path="/ptw/site-evaluation" element={<PTWSiteEvaluationList />} />
        <Route path="/ptw/tbm" element={<PTWTBMList />} />
        <Route path="/ptw/register" element={<PTWRegister />} />
        <Route path="/ptw/manage" element={<PTWManage />} />

        <Route path="/safety-work-permit" element={<SafetyWorkPermit />} />
        <Route path="/response-manual" element={<ResponseManual />} />

        <Route path="/approval-box" element={<Navigate to="/approval-box/received" replace />} />
        <Route path="/approval-box/received" element={<ReceivedApproval />} />
        <Route path="/approval-box/sent" element={<SentApproval />} />

        <Route path="/qr-management" element={<QRManagement />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/user-guide" element={<UserGuide />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <BusinessManagementLayout />
          </RequireAuth>
        }
      >
        <Route path="/business-management" element={<Navigate to="/business-management/basic" replace />} />
        <Route path="/business-management/basic" element={<BasicManagement />} />
        <Route path="/business-management/policy-goal" element={<PolicyGoal />} />
        <Route path="/business-management/budget" element={<Budget />} />
        <Route path="/business-management/organization" element={<Organization />} />
        <Route path="/business-management/approval-line" element={<ApprovalLine />} />
        <Route path="/business-management/attendee" element={<Attendee />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <RiskAssessmentLayout />
          </RequireAuth>
        }
      >
        <Route path="/risk-assessment" element={<Navigate to="/risk-assessment/list" replace />} />
        <Route path="/risk-assessment/list" element={<EvaluationList />} />
        <Route path="/risk-assessment/methods/frequency/step1" element={<FrequencyStep1 />} />
        <Route path="/risk-assessment/methods/frequency/step2" element={<FrequencyStep2 />} />
        <Route path="/risk-assessment/methods/frequency/step3" element={<FrequencyStep3 />} />
        <Route path="/risk-assessment/methods/checklist" element={<Checklist />} />
        <Route path="/risk-assessment/methods/threestep/step1" element={<ThreeStep1 />} />
        <Route path="/risk-assessment/methods/threestep/step2" element={<ThreeStep2 />} />
        <Route path="/risk-assessment/methods/threestep/step3" element={<ThreeStep3 />} />
        <Route path="/risk-assessment/methods/chemical" element={<Chemical />} />
      </Route>
    </Routes>
  )
}

const App: React.FC = () => {
  const { isLoading } = useLoadingStore()
  const { isAuthenticated } = useAuthStore()
  const [showAutoLoginToast, setShowAutoLoginToast] = useState(false)

  useEffect(() => {
    const flag = sessionStorage.getItem(AUTO_LOGIN_TOAST_KEY)
    const isPublicPage = window.location.pathname.startsWith("/public/")
    if (flag && isAuthenticated && !isPublicPage) {
      sessionStorage.removeItem(AUTO_LOGIN_TOAST_KEY)
      setShowAutoLoginToast(true)
      const timer = window.setTimeout(() => setShowAutoLoginToast(false), 2600)
      return () => window.clearTimeout(timer)
    }
  }, [isAuthenticated])

  return (
    <>
      <ToastProvider />
      {isLoading && <Spinner fullscreen />}
      {showAutoLoginToast && (
        <>
          <style>
            {`
              @keyframes auto-login-toast {
                0% { opacity: 0; transform: translate(-50%, -12px); }
                12% { opacity: 1; transform: translate(-50%, 0); }
                80% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -12px); }
              }
            `}
          </style>
          <div
            style={{
              position: "fixed",
              top: 16,
              left: "50%",
              transform: "translate(-50%, -12px)",
              background: "#0B2D5C",
              color: "#FFFFFF",
              padding: "10px 18px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
              zIndex: 2000,
              animation: "auto-login-toast 2.6s ease-in-out forwards",
            }}
          >
            자동 로그인되었습니다.
          </div>
        </>
      )}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  )
}

export default App