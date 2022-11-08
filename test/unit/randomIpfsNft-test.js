// We need test for the following:
// 1. Constructor
// 2. Request random number function (request random words)
// 3. Mint function (fulfill random words)
// 4. Withdraw function

const { network, getNamedAccounts, deployments } = require("hardhat")
const { networkConfig, developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

describe("RandomIpfsNft Unit tests", function () {
    let randomIpfsNft, deployer, mintFee
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
        mintFee = await randomIpfsNft.getMintFee()
    })

    describe("Constructor", function () {
        it("Initializes the constructor correctly", async () => {
            let name = await randomIpfsNft.name()
            let symbol = await randomIpfsNft.symbol()
            const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
            assert(name === "Random IPFS NFT", "Name is not correct")
            assert(symbol === "RIN", "Symbol is not correct")
            assert(dogTokenUriZero.includes("ipfs://"))
            assert.equal(mintFee.toString(), ethers.utils.parseEther("0.01").toString())
        })
    })

    describe("Request random number", function () {
        it("Reverts if you don't pay the mintFee", async () => {
            await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                "RandomIpfsNft__InsufficientFee"
            )
        })
        it("Reverts if you pay less than the required mintFee", async () => {
            await expect(
                randomIpfsNft.requestNft({ value: ethers.utils.parseEther("0.009") })
            ).to.be.revertedWith("RandomIpfsNft__InsufficientFee")
        })
    })
})
