import { useState, FormEvent, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Checkbox from "../components/common/base/Checkbox"
import useForm from "../hooks/useForm"
import { loginValidationRules, useFindId, useFindPw } from "../hooks/useLogin"
import { login } from "../api/00_Auth/auth.api"
import { SAVED_LOGIN_ID_KEY } from "@/constants/auth"

type FormState = { id: string; pw: string; remember: boolean }
type ModalType = "none" | "forgotId" | "forgotPw"

const MAX_ATTEMPTS = 10

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({ id: "", pw: "", remember: false })
  const [modal, setModal] = useState<ModalType>("none")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const {
    validateForm: validateLoginForm,
    setFieldTouched: setLoginFieldTouched,
    getFieldError: getLoginFieldError,
    setFieldError: setLoginFieldError,
    clearFieldError: clearLoginFieldError,
  } = useForm(loginValidationRules, { id: form.id, pw: form.pw })
  const findId = useFindId()
  const findPw = useFindPw()

  useEffect(() => {
    const savedId = localStorage.getItem(SAVED_LOGIN_ID_KEY)
    if (savedId) {
      setForm(s => ({ ...s, id: savedId, remember: true }))
    }
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearLoginFieldError("id")
    clearLoginFieldError("pw")

    if (!validateLoginForm({ id: form.id, pw: form.pw })) return

    setIsLoading(true)
    try {
      const result = await login({ username: form.id, password: form.pw })
      if (result.code === 200) {
        setFailedAttempts(0)
        alert(result.msg || "로그인 되었습니다")
        if (form.remember && form.id.trim()) {
          localStorage.setItem(SAVED_LOGIN_ID_KEY, form.id.trim())
        } else {
          localStorage.removeItem(SAVED_LOGIN_ID_KEY)
        }
        navigate("/dashboard")
      } else {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        if (newAttempts >= MAX_ATTEMPTS) {
          alert("로그인 실패 횟수 초과로 접속이 제한됩니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요")
          setFailedAttempts(0)
        }
        setLoginFieldError("id", result.msg || "로그인에 실패했습니다")
      }
    } catch {
      setLoginFieldError("id", "서버 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const close = () => {
    setModal("none")
    findId.reset()
    findPw.reset()
  }

  const inputBase =
    "w-full rounded-md px-3 sm:px-4 py-3 sm:py-4 bg-white/90 focus:bg-white border border-transparent focus:border-[var(--primary)] outline-none text-gray-900 text-sm sm:text-base placeholder:text-gray-400"
  const inputError = "focus:border-red-500 border-red-500"
  const inputNormal = "focus:border-[var(--primary)]"
  const modalInputBase =
    "w-full rounded-md px-3 py-2.5 sm:py-3 bg-white/90 text-gray-900 border border-transparent focus:border-[var(--primary)] outline-none text-sm sm:text-base placeholder:text-gray-400"
  const btnPrimary = "bg-[var(--primary)] hover:brightness-125 text-white font-semibold rounded-md transition-all"

  const toggleRemember = () => {
    setForm(s => {
      const next = !s.remember
      if (!next) {
        localStorage.removeItem(SAVED_LOGIN_ID_KEY)
      }
      return { ...s, remember: next }
    })
  }

  return (
    <div
      className="relative min-h-screen flex flex-col bg-[url('/images/bg-industrial-navy.jpg')] bg-no-repeat bg-[length:auto_100%] bg-center md:bg-cover md:bg-center"
      style={{ "--primary": "#03386D" } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex justify-center pt-16 sm:pt-20">
        <img src="/logo.svg" alt="Company Logo" className="h-8 sm:h-12 md:h-14 object-contain" />
      </div>

      <div className="relative flex flex-grow items-center justify-center px-4 py-6">
        <div className="w-full max-w-[340px] sm:max-w-md bg-white/10 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-5 sm:p-8 md:p-10 flex flex-col">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white tracking-wide mb-5 sm:mb-6 md:mb-8">로그인</h2>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <input
                type="text"
                value={form.id}
                onChange={e => {
                  setForm(s => ({ ...s, id: e.target.value }))
                  clearLoginFieldError("id")
                }}
                onBlur={() => setLoginFieldTouched("id")}
                placeholder="아이디"
                className={`${inputBase} ${getLoginFieldError("id") ? inputError : inputNormal}`}
              />
              {getLoginFieldError("id") && <p className="mt-1.5 text-xs text-red-400">{getLoginFieldError("id")}</p>}
            </div>

            <div>
              <input
                type="password"
                value={form.pw}
                onChange={e => {
                  setForm(s => ({ ...s, pw: e.target.value }))
                  clearLoginFieldError("pw")
                }}
                onBlur={() => setLoginFieldTouched("pw")}
                placeholder="비밀번호"
                className={`${inputBase} ${getLoginFieldError("pw") ? inputError : inputNormal}`}
              />
              {getLoginFieldError("pw") && <p className="mt-1.5 text-xs text-red-400">{getLoginFieldError("pw")}</p>}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <button type="button" onClick={toggleRemember} className="flex items-center gap-2 text-gray-200 text-xs sm:text-sm select-none">
                <Checkbox checked={form.remember} onChange={toggleRemember} />
                아이디 저장
              </button>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm font-normal">
                <button type="button" onClick={() => setModal("forgotId")} className="text-gray-400 hover:text-gray-200 transition-colors">
                  아이디 찾기
                </button>
                <span className="text-gray-500">|</span>
                <button type="button" onClick={() => setModal("forgotPw")} className="text-gray-400 hover:text-gray-200 transition-colors">
                  비밀번호 찾기
                </button>
              </div>
            </div>

            <button type="submit" className={`w-full ${btnPrimary} py-3 sm:py-4 tracking-wide text-sm sm:text-base`}>
              로그인
            </button>
          </form>
        </div>
      </div>

      <footer className="relative z-10 text-center py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 tracking-wide">© Pulsewave Corp. All Rights Reserved.</footer>

      {modal === "forgotId" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl p-5 sm:p-6 md:p-8 text-white">
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-lg sm:text-xl font-semibold text-center">아이디 찾기</h3>
              <div>
                <input
                  type="text"
                  value={findId.form.name}
                  onChange={e => findId.setName(e.target.value)}
                  placeholder="이름"
                  className={`${modalInputBase} ${findId.errors.name ? inputError : inputNormal}`}
                />
                {findId.errors.name && <p className="mt-1.5 text-xs text-red-400">{findId.errors.name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={findId.form.phone}
                  onChange={e => findId.setPhone(e.target.value)}
                  placeholder="휴대전화번호"
                  maxLength={13}
                  className={`${modalInputBase} ${findId.errors.phone ? inputError : inputNormal}`}
                />
                {findId.errors.phone && <p className="mt-1.5 text-xs text-red-400">{findId.errors.phone}</p>}
              </div>
              {findId.result && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-md px-3 py-2.5">
                  <p className="text-xs sm:text-sm text-green-300 text-center">{findId.result}</p>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <button type="button" onClick={close} className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-md py-2.5 sm:py-3 text-sm sm:text-base font-medium">
                  닫기
                </button>
                <button type="button" onClick={findId.submit} className={`flex-1 ${btnPrimary} py-2.5 sm:py-3 text-sm sm:text-base`}>
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "forgotPw" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl p-5 sm:p-6 md:p-8 text-white">
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-lg sm:text-xl font-semibold text-center">비밀번호 찾기</h3>
              <div>
                <input
                  type="text"
                  value={findPw.form.id}
                  onChange={e => findPw.setId(e.target.value)}
                  placeholder="아이디"
                  className={`${modalInputBase} ${findPw.errors.id ? inputError : inputNormal}`}
                />
                {findPw.errors.id && <p className="mt-1.5 text-xs text-red-400">{findPw.errors.id}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={findPw.form.phone}
                  onChange={e => findPw.setPhone(e.target.value)}
                  placeholder="휴대전화번호"
                  maxLength={13}
                  className={`${modalInputBase} ${findPw.errors.phone ? inputError : inputNormal}`}
                />
                {findPw.errors.phone && <p className="mt-1.5 text-xs text-red-400">{findPw.errors.phone}</p>}
              </div>
              {findPw.result && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-md px-3 py-2.5">
                  <p className="text-xs sm:text-sm text-green-300 text-center">{findPw.result}</p>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <button type="button" onClick={close} className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-md py-2.5 sm:py-3 text-sm sm:text-base font-medium">
                  닫기
                </button>
                <button type="button" onClick={findPw.submit} className={`flex-1 ${btnPrimary} py-2.5 sm:py-3 text-sm sm:text-base`}>
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
