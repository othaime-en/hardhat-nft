// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__InsufficientFee();
error RandomIpfsNft__TransferFailed();

/**
 * @title RandomIpfs
 * @notice This implements a functionality to get random NFTs
 * @dev When we mint, we trigger a chainlink VRF call that gives us a random number
 * @dev We then use that random number to get a random NFT either a PUG, SHIBA, or St. Bernard
 * @notice The rarity decreases PUG > SHIBA > St. Bernard
 * @notice Users have to pay a fee to mint and only the owner can withdraw the funds
 */
contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type declarations
    enum Breed {
        PUB,
        SHIBA_INU,
        ST_BENARD
    }
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT variables
    uint256 internal immutable i_mintFee;
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;

    // Events
    event NftRequested(uint256 indexed requestId, address indexed requester);
    event NftMinted(Breed dogBreed, address Minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_mintFee = mintFee;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__InsufficientFee();
        }
        requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;

        emit NftRequested(requestId, msg.sender);
    }

    /**
     * @dev fulfillRandomWords is called by the VRF Coordinator when the request is fulfilled
     * @dev we need a mapping between the requestId and the sender since if we use msg.sender here
     * @dev it will be the VRF Coordinator and not the user
     * @notice moddedRng ensures that whatever random number we get is between 0-99
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        // This ensures that the number is between 0-99
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]); // Takes in tokenId and the dogBreed tokenURI

        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    /**
     * @dev Here we get the breed of the dog based on the random number
     */
    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    /**
     * @dev models the rarity of the tokens
     */
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    /// Getter functions
    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
