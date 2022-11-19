const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeed

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeed = EthUsdAggregator.address
    } else {
        ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })

    log("--------------------------------------------------------------")
    const args = [ethUsdPriceFeed, lowSvg, highSvg]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("-----------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicSvg", "main"]
