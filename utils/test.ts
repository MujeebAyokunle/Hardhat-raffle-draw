import { run } from "hardhat"

export const verifyCotract = async (contractAddress: string, args: any) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (error) {
        console.log("verify contract error", error)
    }
}
