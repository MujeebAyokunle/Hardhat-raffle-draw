import hre, { ethers, network } from "hardhat"
import { LocalChains, networkConfig } from "../deploymentChains"
import { verifyCotract } from "../utils/test"

const deployRaffle = async () => {
    try {        
        const { deploy } = hre.deployments
        const [deployer] = await hre.getUnnamedAccounts()

        console.log('deployer', deployer)
        
        let chainId = network.config.chainId!.toString()

        let chainname = network.name
        let vrfV2CoordinatorAddress, subscriptionId

        const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
        const gasLane = networkConfig[chainId].gasLane
        let interval = networkConfig[chainId].interval
        let entranceFee = networkConfig[chainId].entranceFee

        if (LocalChains.includes(chainname)) {
            console.log("---getting local---")
            // const mockTransaction = await ethers.getContract("VRFCoordinatorV2Mock")
            const mockTransaction = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
            
            subscriptionId = networkConfig[chainId]["subscriptionId"]

            vrfV2CoordinatorAddress = await mockTransaction.address
            console.log("just logged", vrfV2CoordinatorAddress)

        } else {
            const VRFCOORDINATORV2ADDRESS: string = networkConfig[chainId]["vrfCoordinator"]
            
            vrfV2CoordinatorAddress = VRFCOORDINATORV2ADDRESS
            subscriptionId = networkConfig[chainId]["subscriptionId"]
        }

        let args: any = [
            vrfV2CoordinatorAddress,
            callbackGasLimit,
            gasLane,
            subscriptionId,
            interval,
            entranceFee
        ]
        
        const raffleResponse = await deploy("Raffle", {
            from: deployer,
            args,
            log: true,
            waitConfirmations: 1
        })

        if (LocalChains.includes(chainname)) {
            const vrfContract: any = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
            // const vrfContract: any = await ethers.getContract("VRFCoordinatorV2Mock")
            await vrfContract.addConsumer(subscriptionId, raffleResponse.address)
        }

        if (!LocalChains.includes(chainname)) {
            console.log("verifying contract")
            await verifyCotract(raffleResponse.address, args)
        }

    } catch (error) {
        console.log("deploy raffle error", error)
    }
}

deployRaffle.tags = ["all", "raffle"]
export default deployRaffle