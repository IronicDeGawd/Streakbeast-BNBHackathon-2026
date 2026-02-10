// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StreakBadge
 * @dev ERC-721 NFT contract for StreakBeast achievement badges on opBNB
 * @notice Issues non-transferable achievement badges for reaching streak milestones
 */
contract StreakBadge is ERC721, ERC721URIStorage, Ownable {
    /// @dev Enum representing different badge achievement types
    enum BadgeType {
        FirstFlame,     // 1 day streak
        WeekWarrior,    // 7 day streak
        MonthlyMaster,  // 30 day streak
        CenturyClub,    // 100 day streak
        IronWill        // 365 day streak
    }

    /// @dev Struct representing a badge's metadata
    struct Badge {
        BadgeType badgeType;
        uint256 mintedAt;
        uint256 habitId;
        address recipient;
    }

    /// @dev Mapping from token ID to Badge struct
    mapping(uint256 => Badge) public badges;

    /// @dev Mapping from user address to array of their badge token IDs
    mapping(address => uint256[]) public userBadges;

    /// @dev Mapping from user address to badge type to boolean (prevents duplicate badges)
    mapping(address => mapping(uint8 => bool)) public hasBadge;

    /// @dev Counter for next token ID
    uint256 public nextTokenId;

    /// @dev Address authorized to mint badges
    address public agent;

    /// @dev Address of the StreakBeastCore contract
    address public core;

    /// @dev Array of streak thresholds for each badge type (in days)
    uint256[5] public thresholds = [1, 7, 30, 100, 365];

    /// @dev Emitted when a badge is minted
    event BadgeMinted(
        address indexed to,
        uint256 tokenId,
        uint8 badgeType,
        uint256 habitId
    );

    /**
     * @dev Constructor to initialize the StreakBadge contract
     * @param _agent Address of the authorized agent for minting badges
     */
    constructor(address _agent) ERC721("StreakBeast Badge", "SBB") Ownable(msg.sender) {
        require(_agent != address(0), "Invalid agent address");
        agent = _agent;
        nextTokenId = 1;
    }

    /**
     * @dev Set new agent address (owner only)
     * @param _agent Address of the new agent
     */
    function setAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        agent = _agent;
    }

    /**
     * @dev Set StreakBeastCore contract address (owner only)
     * @param _core Address of the StreakBeastCore contract
     */
    function setCore(address _core) external onlyOwner {
        require(_core != address(0), "Invalid core address");
        core = _core;
    }

    /**
     * @dev Mint a new achievement badge (agent only)
     * @param to Address to receive the badge
     * @param badgeType Type of badge to mint (0-4)
     * @param habitId Associated habit ID from StreakBeastCore
     * @param uri Metadata URI for the badge
     */
    function mintBadge(
        address to,
        uint8 badgeType,
        uint256 habitId,
        string calldata uri
    ) external {
        require(msg.sender == agent, "Only agent can mint badges");
        require(badgeType < 5, "Invalid badge type");
        require(to != address(0), "Cannot mint to zero address");
        require(!hasBadge[to][badgeType], "User already has this badge type");

        uint256 tokenId = nextTokenId++;

        // Mint the ERC721 token
        _safeMint(to, tokenId);

        // Set the token URI
        _setTokenURI(tokenId, uri);

        // Store badge metadata
        badges[tokenId] = Badge({
            badgeType: BadgeType(badgeType),
            mintedAt: block.timestamp,
            habitId: habitId,
            recipient: to
        });

        // Add to user's badge collection
        userBadges[to].push(tokenId);

        // Mark badge type as owned by user
        hasBadge[to][badgeType] = true;

        emit BadgeMinted(to, tokenId, badgeType, habitId);
    }

    /**
     * @dev Get all badge token IDs owned by a user
     * @param user Address of the user
     * @return Array of token IDs
     */
    function getBadgesByUser(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }

    /**
     * @dev Get badge metadata by token ID
     * @param tokenId ID of the badge token
     * @return Badge struct containing badge metadata
     */
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId];
    }

    /**
     * @dev Override tokenURI to use ERC721URIStorage implementation
     * @param tokenId ID of the token
     * @return Token URI string
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface for ERC721URIStorage compatibility
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}