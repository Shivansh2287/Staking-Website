import {
  Box,
  Button,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import {
  stakingContract,
  StakingcontractAddress,
  StakeContractAbi,
} from "../components/stakingContract";
import { MintContract, MintContractAbi } from "../components/mintContract";
import axios from "axios";
import { tokenContract } from "../components/tokenContract";

function staking() {
  const router = useRouter();
  const { address } = useAccount();
  const toast = useToast();
  const [transactionHash, setTransactionHash] = useState(null);
  const [NFTdataArray, setnFTdataArray] = useState(null);
  const [NFTImageUrl, setNFTImageUrl] = useState([]);
  const [unStakedNft, setUnStakedNft] = useState([]);
  const [balance, setBalance] = useState("");
  const [unStakeArray, setUnStakeArray] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Map());

  useEffect(() => {
    const data = Object.fromEntries(selectedImages);
    console.log(data);
    const temp = [];
    for (let key in data) {
      temp.push(data[key]);
    }
    setUnStakeArray(temp);
  }, [selectedImages]);

  useEffect(() => {
    const { data } = router.query;
    if (data) {
      const queryData = JSON.parse(data);
      const temp = [];
      for (let key in queryData) {
        temp.push(queryData[key]);
      }
      setnFTdataArray(temp);
    }
  }, [router]);

  useEffect(() => {
    getBalance();
  }, []);

  useEffect(() => {
    StakedNft();
    UnstakedNft();
  }, []);

  const getBalance = async () => {
    const balance = await tokenContract.balanceOf(address);
    const amount = Number(balance);
    const ether = 1000000000000000000;
    setBalance(amount / ether);
  };

  const StakedNft = async () => {
    console.log("fdsf");
    const numberOfNFTs = await stakingContract.NFTOwnedList(address); //[ nig number ]
    if (numberOfNFTs.length === 0) return; // set state for empty nft list
    const nftIdsInNum = numberOfNFTs.map((nft) => {
      return Number(nft);
    });
    console.log({ nftIdsInNum });
    const addresses = nftIdsInNum.map(async (id) => {
      let addr = await MintContract.tokenURI(id);
      const ipfsAddress = addr.substring(addr.indexOf("ipfs://") + 7);
      const url = "https://ipfs.io/ipfs/" + ipfsAddress;
      return url;
    });
    const ipfs = await Promise.all(addresses).then((data) => {
      //  console.log(data);
      return data;
    });
    const imagesPromise = ipfs.map(async (addr) => {
      const { data } = await axios.get(addr);
      return data.image;
    });
    const images = await Promise.all(imagesPromise).then((data) => data);
    setNFTImageUrl(images);
  };

  const UnstakedNft = async () => {
    console.log("fdsf");
    const numberOfNFTs = await stakingContract.NFTStakedList(address); //[ nig number ]
    if (numberOfNFTs.length === 0) return; // set state for empty nft list
    const nftIdsInNum = numberOfNFTs.map((nft) => {
      return Number(nft);
    });
    console.log({ nftIdsInNum });
    const addresses = nftIdsInNum.map(async (id) => {
      let addr = await MintContract.tokenURI(id);
      const ipfsAddress = addr.substring(addr.indexOf("ipfs://") + 7);
      const url = "https://ipfs.io/ipfs/" + ipfsAddress;
      return url;
    });
    const ipfs = await Promise.all(addresses).then((data) => {
      //  console.log(data);
      return data;
    });
    const imagesPromise = ipfs.map(async (addr) => {
      const { data } = await axios.get(addr);
      return data.image;
    });
    const images = await Promise.all(imagesPromise).then((data) => data);
    setUnStakedNft(images);
  };

  const { write: Stake } = useContractWrite({
    addressOrName: StakingcontractAddress,
    contractInterface: StakeContractAbi,
    functionName: "stake",
    args: [NFTdataArray],
    overrides: {
      gasLimit: "1000000",
    },
    onSuccess(data) {
      console.log(data);
      toast({
        title: "Stake Success",
        description: "Stake Success",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      setTransactionHash(data.hash);
    },
    onError(error) {
      console.log(error);
    },
  });

  const { write: Claim } = useContractWrite({
    addressOrName: StakingcontractAddress,
    contractInterface: StakeContractAbi,
    functionName: "claim",
    args: [NFTdataArray],
    overrides: {
      gasLimit: "1000000",
    },
    onSuccess(data) {
      toast({
        title: "Claim Success",
        description: "Claim Success",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      console.log(data);
      setTransactionHash(data.hash);
    },
    onError(error) {
      console.log(error);
    },
  });

  const { write: unStake } = useContractWrite({
    addressOrName: StakingcontractAddress,
    contractInterface: StakeContractAbi,
    functionName: "unstake",
    args: [unStakeArray],
    overrides: {
      gasLimit: "1000000",
    },
    onSuccess(data) {
      toast({
        title: "Unstake Success",
        description: "Unstake Success",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      console.log(data);
      setTransactionHash(data.hash);
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <Stack>
      <Stack>
        <Heading>Unstaked NFT</Heading>

        {NFTImageUrl &&
          NFTImageUrl.map((image, index) => {
            return (
              <Image
                key={index}
                src={image}
                alt="nft"
                width="200px"
                height="200px"
              />
            );
          })}

        <Text>{NFTdataArray}</Text>
        <Button onClick={() => Stake()}>Stake NFT</Button>

        <Heading>Staked NFT</Heading>
        {unStakedNft &&
          unStakedNft.map((image, index) => {
            return (
              <Box
                as="button"
                key={image}
                onClick={() => {
                  if (selectedImages.has(index)) {
                    const map = selectedImages.delete(index);

                    setSelectedImages(new Map(selectedImages));
                  } else {
                    const url = image.substring(image.lastIndexOf("/") + 1);
                    const imageUrl = url.substring(0, url.length - 4);
                    setSelectedImages(
                      (prev) => new Map(prev.set(index, imageUrl))
                    );
                  }
                }}
                border="2px"
                bg={selectedImages.has(index) ? "green.500" : "gray.500"}
              >
                <Image
                  src={image}
                  alt="NFT"
                  style={{ width: "100px", height: "100px" }}
                />
              </Box>
            );
          })}

        <Text>{unStakeArray}</Text>
        <Button onClick={() => unStake()}>Unstake NFT</Button>
      </Stack>
      <Stack>
        <Heading>Current WWT balance = {balance}</Heading>
        <Button onClick={() => Claim()}>Claim WWT</Button>
      </Stack>
      <Heading>Balance of WWT</Heading>
      <Link href="/transfer">
        <Button>Transfer</Button>
      </Link>
      <Stack>
        <Heading>Unstake NFT</Heading>
      </Stack>
    </Stack>
  );
}

export default staking;
