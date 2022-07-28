import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useIsMounted } from "../hooks";
import img1 from "../asset/mm.png";
import img2 from "../asset/cbw.png";
import img3 from "../asset/wc.png";
import { Avatar, Button, Stack, Tag, TagLabel } from "@chakra-ui/react";
const images = [img1, img2, img3];
export function Connect() {
  const isMounted = useIsMounted();
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <div>
        {isConnected && (
          <Button onClick={() => disconnect()}>
            Disconnect from {connector?.name}
          </Button>
        )}

        {!isConnected && (
          <Stack>
            {connectors
              .filter((x) => isMounted && x.ready && x.id !== connector?.id)
              .map((x, index) => (
                <Tag
                  size="lg"
                  borderRadius="full"
                  key={x.id}
                  sx={{
                    cursor: "pointer",
                    px: 4,
                    py: 2,
                  }}
                  onClick={() => connect({ connector: x })}
                >
                  {x.name}
                  {/* <Avatar src={images[index]} size="lg" /> */}
                  <TagLabel
                    sx={{
                      ml: 4,
                    }}
                  >
                    {isLoading &&
                      x.id === pendingConnector?.id &&
                      " (Connecting)"}
                  </TagLabel>
                </Tag>
              ))}
          </Stack>
        )}
      </div>

      {error && <div>{error.message}</div>}
    </div>
  );
}
