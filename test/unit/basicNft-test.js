const { network, getNamedAccounts, deployments } = require("hardhat")
const { assert } = require("chai")

describe("BasicNFT Unit tests", function () {
    let basicNft, deployer
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["BasicNft"])
        basicNft = await ethers.getContract("BasicNft", deployer)
    })

    describe("Constructor", function () {
        it("Initializes the constructor correctly", async () => {
            let name = await basicNft.name()
            let symbol = await basicNft.symbol()
            let tokenCounter = await basicNft.getTokenCounter()
            assert(name === "Doggie", "Name is not correct")
            assert(symbol === "DOG", "Symbol is not correct")
            assert.equal(tokenCounter, 0)
        })
    })

    describe("Mint function", function () {
        it("The mint function successfully mints token", async () => {
            await basicNft.mintNft()
            let tokenCounter = await basicNft.getTokenCounter()
            let tokenURI = await basicNft.tokenURI(0)
            let TOKEN_URI = await basicNft.TOKEN_URI()
            assert.equal(tokenCounter, 1)
            assert.equal(tokenURI, TOKEN_URI)
        })
    })
})
