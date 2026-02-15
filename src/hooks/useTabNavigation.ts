import { useLocation, useNavigate } from "react-router-dom"

export default function useTabNavigation(paths: string[]) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentIndex = paths.indexOf(location.pathname)

  const handleTabClick = (idx: number) => {
    if (location.pathname !== paths[idx]) navigate(paths[idx])
  }

  return { currentIndex, handleTabClick }
}
