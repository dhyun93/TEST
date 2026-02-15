import React from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

const modules = {
  toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], ["link", "image"], ["clean"]],
}

export default function WysiwygEditor({ value, onChange, className = "", placeholder }: Props) {
  return <ReactQuill theme="snow" value={value} onChange={onChange} className={className} placeholder={placeholder} modules={modules} />
}
