import { Button, Typography, mq } from '@ensdomains/thorin'
import { css, styled } from 'styled-components'

// Taken from ensdomains/ens-app-v3
const GradientTitle = styled.h1(
  ({ theme }) => css`
    font-size: ${theme.fontSizes.headingTwo};
    font-weight: 800;
    background-image: ${theme.colors.gradients.accent};
    background-repeat: no-repeat;
    background-size: 110%;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;

    ${mq.sm.min(css`
      font-size: ${theme.fontSizes.headingOne};
    `)}
  `
)

export function Home() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
      <GradientTitle>ENS Delegation Manager</GradientTitle>

      <Typography fontVariant="headingFour">
        Participate in the ENS DAO by delegating your $ENS.
      </Typography>

      <Typography>
        With this platform you can easily split your votes, transfer votes
        between delegates, and reclaim or delegate new tokens. All this can be
        done in a single transaction, regardless of the number of delegates.
      </Typography>

      <Button as="a" href="/strategy" width="36">
        Start
      </Button>
    </div>
  )
}
