import { Stack } from "@chakra-ui/react";
import * as React from "react";
import { useAccount } from "wagmi";

import { Account, Connect, NetworkSwitcher } from "../components";
import { useIsMounted } from "../hooks";

function Page() {
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();

  return (
    <Stack>
      <Connect />
      {isMounted && isConnected && <Account />}
    </Stack>
  );
}

export default Page;
