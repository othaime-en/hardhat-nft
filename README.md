This is a simple NFT project that covers the various ways we can create and deploy NFT to a blockchain.

The Project covers three types of NFTs
1. BasicNft
2. RandomNft - Uses chainlink vrf to mint a random NFT
    - The tokenUris are stored on IPFS 
    - They need to be pinned. So we use a service like pinata

3. DynamicSvg - The NFT is gonna change based off of real world parameters like in this case, the price of ETH
    - Data is onchain so it is much more expensive
    - If the price of ETH is above X -> Happy face
    - If the price of ETH is below X -> Frowny face
