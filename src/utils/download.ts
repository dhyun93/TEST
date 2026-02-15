import JSZip from "jszip"
import { saveAs } from "file-saver"
import { env } from "@/config/env"
import { getFileNameFromUrl } from "@/utils/file"

type DownloadableFile = { url: string; name?: string }

const normalizeAssetPath = (path: string): string => path.replace(/^\/+/, "").replace(/^public\//, "")

export const buildAssetUrl = (path: string): string => {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path

  const normalized = normalizeAssetPath(path)
  const base = env.assetBaseUrl?.replace(/\/+$/, "") || ""
  if (!base) return `/${normalized}`
  return `${base}/${normalized}`
}

export const downloadFromUrl = async (url: string, fileName?: string): Promise<void> => {
  if (!url) return
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("파일을 찾을 수 없습니다")
    }
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName || getFileNameFromUrl(url) || "file"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error("파일 다운로드 실패:", error)
    alert("파일 내려받기에 실패했습니다.")
  }
}

export const downloadAssetFile = async (path: string, fileName?: string): Promise<void> => {
  const url = buildAssetUrl(path)
  await downloadFromUrl(url, fileName)
}

const ensureUniqueFileName = (name: string, used: Set<string>): string => {
  let uniqueName = name
  let suffix = 1
  while (used.has(uniqueName)) {
    const dotIndex = name.lastIndexOf(".")
    uniqueName = dotIndex > 0 ? `${name.slice(0, dotIndex)}_${suffix}${name.slice(dotIndex)}` : `${name}_${suffix}`
    suffix += 1
  }
  used.add(uniqueName)
  return uniqueName
}

export const downloadFiles = async (files: DownloadableFile[], options?: { zipName?: string }): Promise<void> => {
  if (!files.length) return
  if (files.length === 1) {
    const file = files[0]
    await downloadFromUrl(file.url, file.name)
    return
  }

  try {
    const zip = new JSZip()
    const usedNames = new Set<string>()

    for (let i = 0; i < files.length; i++) {
      const { url, name } = files[i]
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("파일을 찾을 수 없습니다")
      }
      const blob = await response.blob()
      const fallbackName = getFileNameFromUrl(url) || `file_${i + 1}`
      const fileName = ensureUniqueFileName(name || fallbackName, usedNames)
      zip.file(fileName, blob)
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const zipName = options?.zipName || `files_${today}.zip`
    saveAs(zipBlob, zipName)
  } catch (error) {
    console.error("파일 다운로드 실패:", error)
    alert("파일 내려받기에 실패했습니다.")
  }
}
