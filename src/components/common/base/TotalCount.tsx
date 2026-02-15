interface TotalCountProps {
  count: number
}

export default function TotalCount({ count }: TotalCountProps) {
  return <span className="text-gray-600 text-xs sm:text-sm leading-none">총 {count}건</span>
}
