import { deployments, ethers, getUnnamedAccounts, network } from "hardhat"
import { LocalChains } from "../deploymentChains"

const deployV2Mock = async () => {
    const { deploy } = deployments
    const [deployer] = await getUnnamedAccounts()
    let chainname = network.name

    if (LocalChains.includes(chainname)) {

        // _baseFee, uint96 _gasPriceLink
        const BASE_FEE = ethers.utils.parseEther("0.25")
        const GAS_PRICE_LINK = 1e9
        console.log("deployer", deployer)
        console.log("deploying mock")
        const vrfResponse = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true,
            waitConfirmations: 1
        })
    }
    // console.log("vrfResponse", vrfResponse.address)
    // console.log("vrfResponse", vrfResponse.receipt?.contractAddress)
}

deployV2Mock.tags = ["all", "vrfV2Mock"]
export default deployV2Mock
