const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey)

// Storing images in IPFS through Pinata
async function storeImages(imagesFilePath) {
    const fullImagesFilePath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesFilePath)
    let responses = []
    console.log("Uploading images to Pinata...")

    for (fileIndex in files) {
        console.log(`Uploading ${files[fileIndex]} to Pinata...`)
        // creating a stream to stream all the data in the image files
        // This is a requirement to using the pinata SDK
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesFilePath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (err) {
            console.log(err)
        }
    }
    return { responses, files }
}

// Storing metadata in IPFS through Pinata
async function storeTokenUriMetadata(tokenUriMetadata) {
    try {
        const response = await pinata.pinJSONToIPFS(tokenUriMetadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
