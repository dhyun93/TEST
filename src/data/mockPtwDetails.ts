// PTW 문서 상세 목업 데이터 - 모든 필드 포함

// 위험작업허가서 상세 데이터
export const getWorkPermitDetailData = (id: number) => {
  const sampleData: Record<number, any> = {
    1: {
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      applicationDate: "2026-01-18",
      workTypes: ["화기작업"],
      requestDept: "생산1팀",
      workerCount: 3,
      workDate: "2026-01-20T09:00",
      applicantName: "홍길동",
      applicantSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      workLocation: "슬래그공장 2층 용접작업장",
      workType: "철골 구조물 용접 및 보수작업",
      otherSafety: "화재감시자 배치, 소화기 비치, 용접 불꽃 비산 방지포 설치, 주변 가연물 제거",
      safetyChecks: {
        prework_ppe_extra: "용접용 보안면",
        prework_0_1: true,
        prework_0_2: true,
        prework_1_1: true,
        prework_1_2: true,
        prework_2_1: true,
        prework_2_2: false,
        fire_0_1: true,
        fire_0_2: true,
        fire_1_1: true,
        fire_1_2: true,
        fire_2_1: true,
        fire_2_2: true,
        fire_monitor_name: "김안전",
        other_check1: true,
        other_check2: true,
        final_check_1_y: true,
        final_check_1_n: false,
        final_check_2_y: true,
        final_check_2_n: false,
        final_check_3_y: false,
        final_check_3_n: true,
        final_check_4_y: false,
        final_check_4_n: true,
        final_comment: "작업 완료 후 현장 정리정돈 완료. 화재 위험 요소 없음.",
        work_end_time: "2026-01-20T17:00"
      },
      reviewers: {
        sig_review1: {
          user_id: 1,
          name: "김생산",
          position: "관리감독자",
          rank: "반장",
          phone: "010-1234-5678",
          subject: "생산1팀"
        },
        sig_review2: {
          user_id: 2,
          name: "박팀장",
          position: "관리감독자",
          rank: "팀장",
          phone: "010-2345-6789",
          subject: "생산부"
        },
        sig_agreement: {
          user_id: 3,
          name: "이안전",
          position: "안전관리자",
          rank: "대리",
          phone: "010-3456-7890",
          subject: "안전팀"
        },
        sig_approval: {
          user_id: 4,
          name: "최책임",
          position: "안전보건관리책임자",
          rank: "부장",
          phone: "010-4567-8901",
          subject: "안전부"
        }
      },
      supervisor: {
        user_id: 5,
        name: "정현장",
        position: "관리감독자",
        rank: "반장",
        phone: "010-5678-9012",
        subject: "생산1팀"
      }
    },
    2: {
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      applicationDate: "2026-01-17",
      workTypes: ["중장비"],
      requestDept: "정비팀",
      workerCount: 5,
      workDate: "2026-01-19T08:00",
      applicantName: "김철수",
      applicantSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      workLocation: "야적장 A구역",
      workType: "30톤 크레인을 이용한 철재 자재 인양 및 이동작업",
      otherSafety: "작업반경 통제, 신호수 2명 배치, 안전표지판 설치, 작업 전 크레인 점검",
      safetyChecks: {
        prework_ppe_extra: "추락방지대",
        prework_0_1: true,
        prework_0_2: true,
        prework_1_1: true,
        prework_1_2: true,
        prework_2_1: true,
        prework_2_2: true,
        heavy_0_1: true,
        heavy_0_2: true,
        heavy_1_1: true,
        heavy_1_2: true,
        heavy_2_1: true,
        heavy_2_2: true,
        other_check1: true,
        other_check2: true,
        final_check_1_y: true,
        final_check_1_n: false,
        final_check_2_y: true,
        final_check_2_n: false,
        final_check_3_y: false,
        final_check_3_n: true,
        final_check_4_y: false,
        final_check_4_n: true,
        final_comment: "크레인 작업 완료. 하중물 안전하게 적재 완료.",
        work_end_time: "2026-01-19T16:30"
      },
      reviewers: {
        sig_review1: {
          user_id: 6,
          name: "이정비",
          position: "관리감독자",
          rank: "반장",
          phone: "010-3456-7890",
          subject: "정비팀"
        },
        sig_review2: {
          user_id: 7,
          name: "박정비",
          position: "관리감독자",
          rank: "팀장",
          phone: "010-4567-8901",
          subject: "정비부"
        },
        sig_agreement: {
          user_id: 8,
          name: "최안전",
          position: "안전관리자",
          rank: "과장",
          phone: "010-5678-9012",
          subject: "안전팀"
        },
        sig_approval: {
          user_id: 9,
          name: "강관리",
          position: "경영책임자",
          rank: "이사",
          phone: "010-6789-0123",
          subject: "경영"
        }
      },
      supervisor: {
        user_id: 10,
        name: "조현장",
        position: "관리감독자",
        rank: "주임",
        phone: "010-7890-1234",
        subject: "정비팀"
      }
    },
    3: {
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      applicationDate: "2026-01-16",
      workTypes: ["LOTOTO"],
      requestDept: "설비팀",
      workerCount: 4,
      workDate: "2026-01-18T10:00",
      applicantName: "박민수",
      applicantSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      workLocation: "보일러실 배관 라인",
      workType: "증기 배관 교체 및 용접 보수작업",
      otherSafety: "LOTO 절차 준수, 잔류 압력 완전 제거 확인, 가스 측정, 환기 실시",
      safetyChecks: {
        prework_ppe_extra: "내열장갑",
        prework_0_1: true,
        prework_0_2: true,
        prework_1_1: true,
        prework_1_2: true,
        prework_2_1: true,
        prework_2_2: false,
        lototo_0_1: true,
        lototo_0_2: true,
        lototo_1_1: true,
        lototo_1_2: true,
        other_check1: true,
        other_check2: true,
        final_check_1_y: true,
        final_check_1_n: false,
        final_check_2_y: true,
        final_check_2_n: false,
        final_check_3_y: false,
        final_check_3_n: true,
        final_check_4_y: false,
        final_check_4_n: true,
        final_comment: "배관 교체 완료. LOTO 해제 후 설비 정상 가동 확인.",
        work_end_time: "2026-01-18T18:00"
      },
      reviewers: {
        sig_review1: {
          user_id: 11,
          name: "윤설비",
          position: "관리감독자",
          rank: "반장",
          phone: "010-8901-2345",
          subject: "설비팀"
        },
        sig_review2: {
          user_id: 12,
          name: "장설비",
          position: "관리감독자",
          rank: "팀장",
          phone: "010-9012-3456",
          subject: "설비부"
        },
        sig_agreement: {
          user_id: 13,
          name: "임안전",
          position: "안전관리자",
          rank: "차장",
          phone: "010-0123-4567",
          subject: "안전팀"
        },
        sig_approval: {
          user_id: 14,
          name: "한책임",
          position: "안전보건관리책임자",
          rank: "상무",
          phone: "010-1234-5678",
          subject: "안전부"
        }
      },
      supervisor: {
        user_id: 15,
        name: "서현장",
        position: "관리감독자",
        rank: "대리",
        phone: "010-2345-6789",
        subject: "설비팀"
      }
    }
  }

  return sampleData[id] || {}
}

// JSA 상세 데이터
export const getJSADetailData = (id: number) => {
  const sampleData: Record<number, any> = {
    1: {
      jsaNo: "JSA-2026-001",
      workName: "고소 용접작업",
      workDate: "2026-01-20",
      team: "정비1팀",
      riskRows: [
        {
          id: 1,
          task: "작업장 이동",
          hazard: "보행 중 전도, 장애물 충돌",
          currentRisk: "하",
          measure: "안전화 착용, 정리정돈, 통로 확보",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "사다리 설치 및 이동",
          hazard: "사다리 전도, 추락",
          currentRisk: "상",
          measure: "안전대 착용, 발판 고정, 사다리 각도 확인",
          improvedRisk: "중",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "고소 작업대 설치",
          hazard: "작업대 붕괴, 추락",
          currentRisk: "상",
          measure: "작업대 고정, 안전난간 설치, 안전대 체결",
          improvedRisk: "중",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 4,
          task: "용접기 전원 연결",
          hazard: "감전, 화재",
          currentRisk: "중",
          measure: "절연장갑 착용, 접지 확인, 케이블 점검",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 5,
          task: "용접 작업",
          hazard: "화재, 화상, 아크광",
          currentRisk: "상",
          measure: "화재감시자 배치, 소화기 비치, 용접보안면 착용, 방화포 설치",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 6,
          task: "용접 후 냉각",
          hazard: "화상, 잔류 불씨",
          currentRisk: "중",
          measure: "냉각 시간 확보, 주변 확인",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ]
    },
    2: {
      jsaNo: "JSA-2026-002",
      workName: "밀폐공간 청소작업",
      workDate: "2026-01-19",
      team: "설비팀",
      riskRows: [
        {
          id: 1,
          task: "작업 전 환기",
          hazard: "산소결핍, 유해가스",
          currentRisk: "상",
          measure: "강제환기 30분 이상 실시",
          improvedRisk: "중",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "가스 농도 측정",
          hazard: "산소결핍, 폭발 위험",
          currentRisk: "상",
          measure: "산소농도계로 산소/가연성가스/유해가스 측정",
          improvedRisk: "중",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "밀폐공간 진입",
          hazard: "산소결핍, 질식",
          currentRisk: "상",
          measure: "산소농도 18% 이상 확인, 송기마스크 착용",
          improvedRisk: "중",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 4,
          task: "청소 작업",
          hazard: "유해가스 노출, 질식",
          currentRisk: "중",
          measure: "방독마스크 착용, 연속 환기, 외부 감시자 배치",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 5,
          task: "작업 중 휴식",
          hazard: "산소농도 변화",
          currentRisk: "중",
          measure: "외부에서 휴식, 재진입 시 가스 재측정",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ]
    },
    3: {
      jsaNo: "JSA-2026-003",
      workName: "전기배선 교체",
      workDate: "2026-01-18",
      team: "전기팀",
      riskRows: [
        {
          id: 1,
          task: "작업 전 전원 차단",
          hazard: "감전",
          currentRisk: "상",
          measure: "LOTO 실시, 잠금/꼬리표 부착",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "잔류전압 확인",
          hazard: "감전",
          currentRisk: "상",
          measure: "검전기로 무전압 확인",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "기존 배선 철거",
          hazard: "감전, 추락",
          currentRisk: "중",
          measure: "절연장갑 착용, 안전대 체결",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 4,
          task: "신규 배선 설치",
          hazard: "감전, 화재",
          currentRisk: "중",
          measure: "절연공구 사용, 단락 방지",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 5,
          task: "배선 연결 및 테스트",
          hazard: "감전, 단락 화재",
          currentRisk: "중",
          measure: "절연저항 측정, 접지 확인",
          improvedRisk: "하",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ]
    }
  }

  return sampleData[id] || {}
}

// 현장 위험성평가 상세 데이터
export const getSiteEvaluationDetailData = (id: number) => {
  const sampleData: Record<number, any> = {
    1: {
      teamName: "정비1팀 (대한건설)",
      safetyChecks: {
        sign_date: "2026-01-20",
        first_worker_yes: true,
        first_worker_no: false,
        first_worker_action: "신규 작업자 2명 안전교육 2시간 실시",
        first_equipment_yes: false,
        first_equipment_no: true,
        first_equipment_action: ""
      },
      teamMember: {
        user_id: 1,
        name: "홍길동",
        position: "관리감독자",
        rank: "반장",
        phone: "010-1111-2222",
        subject: "정비1팀"
      },
      riskRows: [
        {
          id: 1,
          task: "작업 준비 및 공구 반입",
          hazard: "공구 낙하, 운반 중 부상",
          currentRisk: "중",
          measure: "공구 끈 사용, 2인 1조 운반",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "고소 작업대 설치",
          hazard: "추락, 작업대 붕괴",
          currentRisk: "상",
          measure: "안전난간 설치, 안전대 착용, 지반 확인",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "용접 작업",
          hazard: "화재, 화상, 아크광",
          currentRisk: "상",
          measure: "소화기 비치, 화재감시자 배치, 용접보안면 착용",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 4,
          task: "그라인더 작업",
          hazard: "비산물 부상, 소음",
          currentRisk: "중",
          measure: "보안경 착용, 귀마개 착용, 차단막 설치",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ],
      inspectionRows: [
        {
          id: 1,
          time: "09:00",
          person: "정비1팀 / 홍길동",
          note: "작업 시작 전 TBM 실시 및 안전조치 확인 완료"
        },
        {
          id: 2,
          time: "12:00",
          person: "안전팀 / 김안전",
          note: "중간 점검 - 고소작업대 안전난간 정상, 소화기 배치 확인"
        },
        {
          id: 3,
          time: "15:00",
          person: "안전팀 / 김안전",
          note: "오후 점검 - 용접 불꽃 비산 방지 정상, 화재감시자 배치 확인"
        }
      ]
    },
    2: {
      teamName: "설비팀 (세진기계)",
      safetyChecks: {
        sign_date: "2026-01-19",
        first_worker_yes: false,
        first_worker_no: true,
        first_worker_action: "",
        first_equipment_yes: true,
        first_equipment_no: false,
        first_equipment_action: "신규 송기마스크 사용법 교육 1시간 실시"
      },
      teamMember: {
        user_id: 2,
        name: "김철수",
        position: "관리감독자",
        rank: "대리",
        phone: "010-2222-3333",
        subject: "설비팀"
      },
      riskRows: [
        {
          id: 1,
          task: "밀폐공간 환기",
          hazard: "산소결핍, 유해가스",
          currentRisk: "상",
          measure: "강제환기 30분, 산소농도계 측정",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "밀폐공간 진입",
          hazard: "산소결핍, 질식",
          currentRisk: "상",
          measure: "산소농도 18% 이상 확인, 송기마스크 착용, 생명줄 연결",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "내부 청소 작업",
          hazard: "유해가스 노출, 질식",
          currentRisk: "중",
          measure: "연속 환기, 외부 감시자 2명 배치",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ],
      inspectionRows: [
        {
          id: 1,
          time: "08:00",
          person: "설비팀 / 김철수",
          note: "밀폐공간 진입 전 가스 측정 - 산소 20.8%, 가연성가스 0%, 황화수소 0ppm"
        },
        {
          id: 2,
          time: "10:00",
          person: "안전팀 / 박안전",
          note: "진입 중 가스 재측정 - 이상 없음, 외부 감시자 배치 확인"
        }
      ]
    },
    3: {
      teamName: "전기팀 (한국전기)",
      safetyChecks: {
        sign_date: "2026-01-18",
        first_worker_yes: false,
        first_worker_no: true,
        first_worker_action: "",
        first_equipment_yes: false,
        first_equipment_no: true,
        first_equipment_action: ""
      },
      teamMember: {
        user_id: 3,
        name: "박민수",
        position: "관리감독자",
        rank: "과장",
        phone: "010-3333-4444",
        subject: "전기팀"
      },
      riskRows: [
        {
          id: 1,
          task: "전원 차단 및 LOTO",
          hazard: "감전",
          currentRisk: "상",
          measure: "LOTO 절차 준수, 잠금장치 및 꼬리표 부착",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 2,
          task: "잔류전압 확인",
          hazard: "감전",
          currentRisk: "상",
          measure: "검전기로 무전압 3회 확인",
          checked: true,
          beforeImages: [],
          afterImages: []
        },
        {
          id: 3,
          task: "배선 교체 작업",
          hazard: "감전, 단락 화재",
          currentRisk: "중",
          measure: "절연장갑 착용, 절연공구 사용",
          checked: true,
          beforeImages: [],
          afterImages: []
        }
      ],
      inspectionRows: [
        {
          id: 1,
          time: "10:00",
          person: "전기팀 / 박민수",
          note: "전원 차단 상태 확인, LOTO 정상"
        },
        {
          id: 2,
          time: "14:00",
          person: "안전팀 / 이안전",
          note: "작업 진행 상황 점검 - 절연장갑 착용 확인"
        }
      ]
    }
  }

  return sampleData[id] || {}
}

// TBM 상세 데이터
export const getTBMDetailData = (id: number) => {
  const sampleData: Record<number, any> = {
    1: {
      companyName: "대한건설",
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      date: "2026-01-20",
      time: "08:00",
      processName: "슬래그 파쇄공정 정비작업",
      manager: "김안전",
      attendeeRows: [
        {
          id: 1,
          name: "홍길동",
          phone: "010-1111-2222",
          health: "양호",
          isNew: false
        },
        {
          id: 2,
          name: "김철수",
          phone: "010-2222-3333",
          health: "양호",
          isNew: false
        },
        {
          id: 3,
          name: "박영희",
          phone: "010-3333-4444",
          health: "양호",
          isNew: true
        },
        {
          id: 4,
          name: "이민수",
          phone: "010-4444-5555",
          health: "피로",
          isNew: false
        },
        {
          id: 5,
          name: "최정수",
          phone: "010-5555-6666",
          health: "양호",
          isNew: false
        },
        {
          id: 6,
          name: "정대한",
          phone: "010-6666-7777",
          health: "양호",
          isNew: false
        }
      ],
      riskRows: [
        {
          id: 1,
          hazard: "작업중 설비 가동 위험 - 회전체 말림",
          currentRisk: "상",
          measure: "LOTOTO 실시 및 확인, 위험표지판 부착",
          checked: true
        },
        {
          id: 2,
          hazard: "조도불량에 따른 시야확보 불가",
          currentRisk: "중",
          measure: "내부 조명 설치, 랜턴 지급",
          checked: true
        },
        {
          id: 3,
          hazard: "분진에 의한 호흡기 질환",
          currentRisk: "중",
          measure: "방진마스크 착용 의무화",
          checked: true
        },
        {
          id: 4,
          hazard: "중량물 취급 중 근골격계 질환",
          currentRisk: "중",
          measure: "2인 1조 작업, 보조공구 사용",
          checked: true
        },
        {
          id: 5,
          hazard: "함마드릴 사용에 의한 타박상 위험",
          currentRisk: "중",
          measure: "올바른 자세로 안전하게 작업, 보안경 착용",
          checked: true
        }
      ],
      proposalRows: [
        {
          id: 1,
          hazard: "작업통로 협소 및 정리정돈 불량",
          solution: "작업 전 통로 확보 및 정리정돈",
          proposer: "홍길동"
        },
        {
          id: 2,
          hazard: "비상등 배터리 방전",
          solution: "비상등 사전 점검 및 예비 배터리 준비",
          proposer: "김철수"
        }
      ],
      nearMissRows: [
        {
          id: 1,
          content: "보행 중 바닥 케이블에 걸려 넘어질 뻔함",
          prevention: "케이블 정리 및 고정, 통로 표시",
          proposer: "이민수"
        },
        {
          id: 2,
          content: "공구 운반 중 미끄러짐",
          prevention: "바닥 물기 제거, 안전화 점검",
          proposer: "최정수"
        }
      ]
    },
    2: {
      companyName: "세진기계",
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      date: "2026-01-19",
      time: "07:30",
      processName: "보일러 정비공정",
      manager: "박관리",
      attendeeRows: [
        {
          id: 1,
          name: "강감찬",
          phone: "010-6666-7777",
          health: "양호",
          isNew: false
        },
        {
          id: 2,
          name: "윤봉길",
          phone: "010-7777-8888",
          health: "양호",
          isNew: false
        },
        {
          id: 3,
          name: "안중근",
          phone: "010-8888-9999",
          health: "양호",
          isNew: true
        },
        {
          id: 4,
          name: "유관순",
          phone: "010-9999-0000",
          health: "양호",
          isNew: false
        },
        {
          id: 5,
          name: "김구",
          phone: "010-0000-1111",
          health: "양호",
          isNew: false
        },
        {
          id: 6,
          name: "신채호",
          phone: "010-1111-2222",
          health: "양호",
          isNew: false
        },
        {
          id: 7,
          name: "백범김",
          phone: "010-2222-3333",
          health: "피로",
          isNew: false
        },
        {
          id: 8,
          name: "이순신",
          phone: "010-3333-4444",
          health: "양호",
          isNew: false
        }
      ],
      riskRows: [
        {
          id: 1,
          hazard: "고온 증기 누출에 의한 화상",
          currentRisk: "상",
          measure: "압력 완전 제거 후 작업, 내열장갑 착용",
          checked: true
        },
        {
          id: 2,
          hazard: "밀폐공간 질식 위험",
          currentRisk: "상",
          measure: "환기 및 산소농도 측정, 송기마스크 착용",
          checked: true
        },
        {
          id: 3,
          hazard: "배관 내 잔류 압력",
          currentRisk: "중",
          measure: "압력계 확인, 서서히 개방",
          checked: true
        },
        {
          id: 4,
          hazard: "작업 중 추락 위험",
          currentRisk: "중",
          measure: "안전난간 설치, 안전대 착용",
          checked: true
        }
      ],
      proposalRows: [
        {
          id: 1,
          hazard: "안전통로 부족",
          solution: "임시 안전통로 설치 및 안전표지판 부착",
          proposer: "강감찬"
        },
        {
          id: 2,
          hazard: "조명 부족",
          solution: "투광기 2대 추가 설치",
          proposer: "윤봉길"
        }
      ],
      nearMissRows: [
        {
          id: 1,
          content: "사다리 미끄러져 넘어질 뻔함",
          prevention: "사다리 고정 장치 설치, 바닥 물기 제거",
          proposer: "안중근"
        },
        {
          id: 2,
          content: "밸브 조작 중 잔류 증기 분출",
          prevention: "밸브 천천히 개방, 대기 시간 충분히 확보",
          proposer: "유관순"
        }
      ]
    },
    3: {
      companyName: "한국전기",
      workplace: "(주)에스피에스앤아이 당진 슬래그공장",
      date: "2026-01-18",
      time: "08:30",
      processName: "전기실 점검 및 배선 교체",
      manager: "이점검",
      attendeeRows: [
        {
          id: 1,
          name: "전기수",
          phone: "010-4444-5555",
          health: "양호",
          isNew: false
        },
        {
          id: 2,
          name: "배선길",
          phone: "010-5555-6666",
          health: "양호",
          isNew: false
        },
        {
          id: 3,
          name: "차단기",
          phone: "010-6666-7777",
          health: "양호",
          isNew: false
        },
        {
          id: 4,
          name: "접지봉",
          phone: "010-7777-8888",
          health: "양호",
          isNew: true
        }
      ],
      riskRows: [
        {
          id: 1,
          hazard: "활선 작업 중 감전",
          currentRisk: "상",
          measure: "전원 차단 후 작업, LOTO 실시, 검전 확인",
          checked: true
        },
        {
          id: 2,
          hazard: "전기 아크 화재",
          currentRisk: "중",
          measure: "소화기 비치, 절연공구 사용",
          checked: true
        },
        {
          id: 3,
          hazard: "잔류전압으로 인한 감전",
          currentRisk: "중",
          measure: "검전기로 3회 확인, 방전 조치",
          checked: true
        },
        {
          id: 4,
          hazard: "배전반 내부 분진 흡입",
          currentRisk: "하",
          measure: "방진마스크 착용",
          checked: true
        }
      ],
      proposalRows: [
        {
          id: 1,
          hazard: "절연장갑 노후화",
          solution: "절연장갑 신규 구매 및 정기 점검",
          proposer: "전기수"
        },
        {
          id: 2,
          hazard: "작업 공간 협소",
          solution: "주변 자재 정리 및 작업 공간 확보",
          proposer: "배선길"
        }
      ],
      nearMissRows: [
        {
          id: 1,
          content: "잔류전압 미확인으로 감전될 뻔함",
          prevention: "검전 절차 재교육, 3회 확인 철저히 준수",
          proposer: "배선길"
        },
        {
          id: 2,
          content: "공구 낙하로 다칠 뻔함",
          prevention: "공구 끈 사용, 주머니에 보관",
          proposer: "차단기"
        }
      ]
    }
  }

  return sampleData[id] || {}
}
