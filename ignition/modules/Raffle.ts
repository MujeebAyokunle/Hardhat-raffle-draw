import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config"
// import { ethers, ignition, network } from "hardhat";
import { LocalChains, networkConfig } from "../../deploymentChains";
import hre from "hardhat"

// const VRFCOORDINATORV2ADDRESS = process.env.VRFCOORDINATORV2ADDRESS || ""


let VRF_SUB_AMOUNT = ethers.parseEther("2")

const RaffleModule = buildModule("LockModule", (m) => {

  let chainId: string = network.config.chainId!.toString()
  const VRFCOORDINATORV2ADDRESS: string = networkConfig[chainId]["vrfCoordinator"]
  const BASE_FEE = ethers.parseEther("0.25")
  const GAS_PRICE_LINK = 1e9
  let vrfCoordinatorMock: any

  const developmentChain = network.name
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]

  if (LocalChains.includes(developmentChain)) {
    vrfCoordinatorMock = m.contract("VRFCoordinatorV2Mock", [BASE_FEE, GAS_PRICE_LINK], {
      // from: ""
    })

    const temps = ethers.getContractFactory("VRFCoordinatorV2Mock")
    console.log("temp", temps)

    console.log("Mock deployed")
    console.log("---------------------")
    console.log("vrfCoordinatorMock", vrfCoordinatorMock)
  }

  let vrfCoordinatorV2Address, subscriptionId
  let entranceFee = networkConfig[chainId].entranceFee
  let gasLane = networkConfig[chainId].gasLane
  let interval = networkConfig[chainId].interval


  if (LocalChains.includes(developmentChain)) {

    vrfCoordinatorV2Address = vrfCoordinatorMock.address
    console.log("crf coordinator address", vrfCoordinatorV2Address)
    const transactionResponse = m.call(vrfCoordinatorMock, "createSubscription", [])
    // const transactionResponse = vrfCoordinatorMock.createSubscription()
    // console.log("transaction response", transactionResponse)
    // const transactionReceipt = transactionResponse.wait(1)
    // subscriptionId = transactionReceipt.events[0].args.subId

    vrfCoordinatorMock.fundSubscription(subscriptionId, VRF_SUB_AMOUNT)
  } else {
    vrfCoordinatorV2Address = VRFCOORDINATORV2ADDRESS
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }

  const raffle = m.contract("Raffle", [vrfCoordinatorV2Address, callbackGasLimit, gasLane, subscriptionId, interval, entranceFee,], {
    // value: lockedAmount,
  });

  return { raffle };
});

export default RaffleModule;
