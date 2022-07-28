import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useEnsName, useSendTransaction } from "wagmi";
import { useContractWrite } from "wagmi";
import { stakingContract, StakingcontractAddress } from "./stakingContract";
import {
  MintContract,
  mintContractAbi,
  mintContractAddress,
} from "./mintContract";
import Link from "next/link";
import axios from "axios";

import useStore from "../zustand";
import { Slider } from "@fluentui/react";
import { BigNumber } from "ethers";

export function Account() {
  const toast = useToast();
  const { address } = useAccount();
  const { data: ensNameData } = useEnsName({ address });
  const [transactionHash, setTransactionHash] = useState(null);
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [NFTImageUrl, setNFTImageUrl] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Map());
  console.log(JSON.stringify(Object.fromEntries(selectedImages)));

  const {
    data,
    isError,
    isLoading,
    write: setApproval,
  } = useContractWrite({
    addressOrName: mintContractAddress,
    contractInterface: mintContractAbi,
    functionName: "setApprovalForAll",
    args: [StakingcontractAddress, true],
    overrides: {
      gasLimit: "1000000",
    },

    onSuccess(data) {
      console.log(data);
      setTransactionHash(data.hash);
    },
  });

  const getNftDetailsAndApproval = async () => {
    const numberOfNFTs = await stakingContract.NFTOwnedList(address); //[ nig number ]
    const isApproved = await MintContract.isApprovedForAll(
      address,
      StakingcontractAddress
    );
    setIsApprovedForAll(isApproved);
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

  useEffect(() => {
    getNftDetailsAndApproval();
  }, []);

  return (
    <Stack>
      <Stack>
        <Heading>Unstaked</Heading>
        {NFTImageUrl.length === 0 && <Text>No NFTs</Text>}
        {NFTImageUrl.map((image, index) => {
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
      </Stack>
      {isApprovedForAll ? (
        <Stack>
          <Link
            href={{
              pathname: "/staking",
              query: {
                data: JSON.stringify(Object.fromEntries(selectedImages)),
              },
            }}
          >
            <Button>Stake</Button>
          </Link>
        </Stack>
      ) : (
        <Stack>
          <Button onClick={() => setApproval()}>Approve</Button>
        </Stack>
      )}
    </Stack>
  );
}
