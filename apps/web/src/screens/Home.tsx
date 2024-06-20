import { Button, Heading } from '@ensdomains/thorin'

export function Home() {
  return (
    <>
      <Heading className="mb-4">ENS Delegation</Heading>

      <Button as="a" href="/strategy">
        Start
      </Button>
    </>
  )
}
