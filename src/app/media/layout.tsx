export default function Layout({
  children,
  mediaList,
}: {
  children: React.ReactNode
  mediaList: React.ReactNode
}) {
  return (
    <div>
      {children}
      {mediaList}
    </div>
  )
}
