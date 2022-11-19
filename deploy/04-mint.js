const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    // Minting for the basicNFT
    const basicNFT = await ethers.getContract("BasicNft", deployer)
    const basicNftMintTx = await basicNFT.mintNft()
    await basicNftMintTx.wait(1)
    console.log(`Basic NFT index 0 minted with tokenURI: ${await basicNFT.tokenURI(0)}`)

    // Minting for the randomNFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) // Times-out in five minutes
        randomIpfsNft.once("NftMinted", async function () {
            resolve
        })
        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        const randomIpfsNftMintReceipt = await randomIpfsNftMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFT index 0 minted with tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    // Minting for DynamicSvgNft
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 minted with tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}
