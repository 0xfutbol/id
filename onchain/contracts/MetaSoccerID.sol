// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaSoccerID is Ownable, EIP712 {
    // Mapping from username to address
    mapping(string => address) private usernames;

    // Event emitted when a new username is registered
    event UsernameRegistered(string indexed username, address indexed owner);

    // Event emitted when the signer address is updated
    event SignerUpdated(address indexed newSigner);

    bytes32 public constant USERNAME_TYPEHASH =
        keccak256("Username(string username,address owner,uint256 signatureExpiration)");

    // Address of the signer authorized to sign username registration requests
    address public authorizedSigner;

    constructor() EIP712("MetaSoccerID", "1") {
        authorizedSigner = msg.sender; // Set the contract deployer as the initial signer
    }

    // Modifier to ensure the username is available
    modifier withUsernameAvailable(string memory username) {
        require(usernames[username] == address(0), "Username already taken");
        _;
    }

    /**
     * @dev Registers a new username with a valid signature.
     * @param username The username to register.
     * @param signature The signature that validates the username.
     * @param signatureExpiration The timestamp after which the signature is no longer valid.
     */
    function registerUsername(
        string memory username,
        bytes memory signature,
        uint256 signatureExpiration
    ) external withUsernameAvailable(username) {
        require(block.timestamp <= signatureExpiration, "Signature has expired");
        address owner = msg.sender;
        require(
            _verifyUsernameSignature(
                username,
                owner,
                signature,
                signatureExpiration
            ),
            "Invalid signature"
        );

        // Store the username and associate it with the owner's address
        usernames[username] = owner;

        emit UsernameRegistered(username, owner);
    }

    /**
     * @dev Verifies the username signature.
     * @param username The username being registered.
     * @param owner The address of the user registering the username.
     * @param signature The signature to validate.
     * @param signatureExpiration The timestamp after which the signature is no longer valid.
     * @return True if the signature is valid, false otherwise.
     */
    function _verifyUsernameSignature(
        string memory username,
        address owner,
        bytes memory signature,
        uint256 signatureExpiration
    ) internal view returns (bool) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    USERNAME_TYPEHASH,
                    keccak256(bytes(username)),
                    owner,
                    signatureExpiration
                )
            )
        );
        address signer = ECDSA.recover(digest, signature);
        return signer == authorizedSigner;
    }

    /**
     * @dev Checks if a username is available.
     * @param username The username to check.
     * @return True if the username is available, false otherwise.
     */
    function isUsernameAvailable(
        string memory username
    ) external view returns (bool) {
        return usernames[username] == address(0);
    }

    /**
     * @dev Returns the address associated with a given username.
     * @param username The username to query.
     * @return The address associated with the username.
     */
    function getAddressByUsername(
        string memory username
    ) external view returns (address) {
        return usernames[username];
    }

    /**
     * @dev Updates the authorized signer address. Only callable by the contract owner.
     * @param newSigner The new address authorized to sign username registration requests.
     */
    function updateAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        authorizedSigner = newSigner;
        emit SignerUpdated(newSigner);
    }
}