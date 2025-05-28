import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/token-expires')({
  component: () => <div>Hello /token-expires!</div>
})