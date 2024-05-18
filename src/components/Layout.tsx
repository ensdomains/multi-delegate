import { mq } from '@ensdomains/thorin'
import styled, { css } from 'styled-components'

export const Layout = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: ${theme.breakpoints.xl}px;
    margin-right: auto;
    margin-left: auto;
    min-height: 100svh;
    gap: ${theme.space['8']};
    padding: ${theme.space['4']};

    ${mq.sm.min(css`
      padding: ${theme.space['8']};
    `)}
  `
)
