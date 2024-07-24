import { mq } from '@ensdomains/thorin'
import styled, { css } from 'styled-components'

export const Layout = styled.div<{ pathname: string }>(
  ({ theme, pathname }) => css`
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: ${theme.breakpoints.lg}px;
    margin-right: auto;
    margin-left: auto;
    min-height: 100svh;
    gap: ${theme.space['8']};
    padding: ${theme.space['4']};

    ${pathname === '/' &&
    css`
      justify-content: space-between;
    `}

    ${mq.sm.min(css`
      padding: ${theme.space['8']};
    `)}
  `
)
