interface TestPageProps {
  params: Promise<{
    id: string
  }>
}

export default function TestPage({ params }: TestPageProps) {
  const unwrappedParams = React.use(params)

  return (
    <div>
      <h1>Test Dynamic Route</h1>
      <p>ID: {unwrappedParams.id}</p>
    </div>
  )
}