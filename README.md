# Multi-Delegate

App to distribute ENS token voting power to multiple delegates.

## Overview

There are three functional screens:

- `/strategy`: View the delegation strategy for the connected account.
  - Handles the case when the connected account has no tokens, or has undelegated tokens.
- `/strategy/:addressOrName`: View somebody else's delegation strategy by ETH address or ENS name.
  - Should perform almost identically to the `/strategy` page.
- `/manage`: Manage the delegation strategy for the connected account.
  - Search modal to add a new delegate. Fetches results from the subgraph if the input is an incomplete name.
  - Visualization of current delegation strategy + highlights of the in-progress changes.
  - There is currently no way to change the delegate on the token contract from this app. The only onchain interaction is with the Multi-Delegate contract.
  - To reclaim all tokens, set all delegations to 0.

Note: The frontend can run without the indexer, but may have slower performance because it's processing event logs instead of reading from an already indexed database. You can see the graceful fallback in [`useDelegationInfo`](./apps/web/src/hooks/useDelegationInfo.ts).

## Development

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Create a `.env.local` file for each app based on the respective `.env.example` file
4. Start each app in its own terminal with `pnpm indexer:dev` and `pnpm web:dev`
5. Open the web app in your browser at http://localhost:5173
