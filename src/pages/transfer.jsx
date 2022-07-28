import { Button, Heading, Input, Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import {
  tokenContract,
  tokenContractAbi,
  tokenContractAddress,
} from "../components/tokenContract";

function transfer() {
  const { address } = useAccount();
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [balance, setBalance] = useState("");
  const [transactionHash, setTransactionHash] = useState(null);

  const getBalance = async () => {
    const balance = await tokenContract.balanceOf(address);
    const amount = Number(balance);
    const ether = 1000000000000000000;
    setBalance(amount / ether);
  };

  useEffect(() => {
    getBalance();
  }, []);
  const { write: Transfer } = useContractWrite({
    addressOrName: tokenContractAddress,
    contractInterface: tokenContractAbi,
    functionName: "transfer",
    args: [transferAddress, transferAmount],
    overrides: {
      gasLimit: "1000000",
    },
    onSuccess(data) {
      console.log(data);
      setTransactionHash(data.hash);
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <Stack>
      <Heading>{balance}</Heading>
      <Input
        placeholder="Address"
        value={transferAddress}
        onChange={(e) => setTransferAddress(e.target.value)}
      />
      <Input
        placeholder="Amount"
        value={transferAmount}
        onChange={(e) => setTransferAmount(e.target.value)}
      />
      <Button onClick={() => Transfer()}>Transfer</Button>
    </Stack>
  );
}

export default transfer;
