const { ethers } = require('ethers')
const multicallAbi = require('./abi/multicall2.json')
const erc20Abi = require('./abi/erc20.json')
const provider = new ethers.providers.InfuraProvider()

const usdcHolders = [
    "0xdcef968d416a41cdac0ed8702fac8128a64241a2",
    "0x467d543e5e4e41aeddf3b6d1997350dd9820a173",
    "0x1b7baa734c00298b9429b518d621753bb0f6eff2",
    "0x1a8c53147e7b61c015159723408762fc60a34d17",
    "0x813c661adf40806666dd0b01d527a3ab3e2a0633",
    "0xaae2c00a079bbff45e09083d72bc2be225936bc7",
    "0x47e6946e48a5ffaa0a361aa97e77774a25c4c150",
    "0x5127f639f29ddbafa96de964d611273a0705be96",
    "0xdcf0ed820fd6219a55c6d42251910864baac0da2",
    "0x56dbfadef270c7c95d9e84db7e921b544a7c4145",
    "0x22f6657450b80d9ba5fec998d8edcbdab149bd42",
]

const main = async () => {
    // Mainnet contracts
    const multicall2 = new ethers.Contract('0x9695FA23b27022c7DD752B7d64bB5900677ECC21', multicallAbi, provider)
    const usdc = new ethers.Contract('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', erc20Abi, provider)

    // Construct your calldata to multicall2
    const batchCalldata = usdcHolders.map(address => {
        return {
            target: usdc.address,
            callData: usdc.interface.encodeFunctionData("balanceOf", [address])
        }
    })

    // Important! Use .callStatic otherwise you'll be
    // sending a read transaction if its not read-only
    // Output encoded
    const outputE = await multicall2.callStatic.tryAggregate(false, batchCalldata)

    // Decode the data
    const outputs = outputE.map(({ success, returnData }, i) => {
        const address = usdcHolders[i]

        if (!success) {
            console.log(`Failed to retrieve usdc.balanceOf for ${address}`)
            return [address, ethers.constants.Zero]
        }

        const amount = usdc.interface.decodeFunctionResult("balanceOf", returnData)[0]
        console.log(`usdc.balanceOf(${address}) => ${ethers.utils.formatUnits(amount, 6)}`)
        return [address, amount]
    })
}

main()