import hre, { deployments, ethers, network } from "hardhat";
import { LocalChains, networkConfig } from "../../deploymentChains";
import { assert } from "chai";
import { getContractAddress } from "ethers/lib/utils";
// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { Signer } from "ethers";

!LocalChains.includes(network.name) ? describe.skip : describe("Raffle Unit test", async () => {
    let vrfCoordinatorMockV2
    let raffle: any
    let chainId: string
    let user: any
    let entranceFee: any

    console.log("running here")

    beforeEach(async () => {

        const [deployer]: any = await hre.getUnnamedAccounts()
        // const contractAddress = await   

        let [temp] = await ethers.getSigners()
        user = temp        

        entranceFee = hre.ethers.utils.parseEther("0.1")

        chainId = network.config.chainId!.toString()

        await deployments.fixture(["all"])
        raffle = await ethers.getContractAt("Raffle", "0x0fad073Bd8dB21650Cc6E438cdE70b3724e2EAeb")

        vrfCoordinatorMockV2 = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
    })

    describe("test constructor", async () => {
        it("initializes the raffle correctly", async () => {

            const raffleState = await raffle.getRaffleState()
            
            const interval = await raffle.getInterval()
            // const lastBlockTime = await raffle.getLatestTimeStamp()
            const entranceFee = await raffle.getEntranceFee()

            assert.equal(raffleState.toString(), "1")
            assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
        })

        it("should return player after joining raffle", async () => {
            await raffle.connect(user).enterRaffle({ value: entranceFee })

            const player = await raffle.getPlayer(0)

            assert.equal(player, user.address)
        })

        it("should return number of players", async () => {
            const num_of_players = await raffle.getNumOfPlayers()
            console.log("num of players", num_of_players)
            assert.exists(num_of_players)
        })

        it("should return request confirmation", async () => {
            const requestConfirmation =  await raffle.getRequestConfirmations()

            assert.exists(requestConfirmation)
        })

        it("should return interval", async () => {
            const interval =  await raffle.getInterval()
            console.log('interval', interval)
            assert.equal(interval, 30)
        })
    })
})