// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./MetaSoccerID.sol";

contract OxFutbolID is Ownable, EIP712 {
    // Address of the MetaSoccerID contract
    MetaSoccerID private metaSoccerID;

    // Mapping from username to address
    mapping(string => address) private usernames;

    // Event emitted when a new username is registered
    event UsernameRegistered(string indexed username, address indexed owner);

    // Event emitted when the signer address is updated
    event SignerUpdated(address indexed newSigner);

    bytes32 public constant USERNAME_TYPEHASH =
        keccak256("Username(string username,address owner,uint256 signatureExpiration)");

    constructor(address metaSoccerIDAddress) EIP712("OxFutbolID", "1") {
        metaSoccerID = MetaSoccerID(metaSoccerIDAddress);
    }

    // Modifier to ensure the username is available
    modifier withUsernameAvailable(string memory username) {
        require(metaSoccerID.isUsernameAvailable(username), "Username already taken");
        require(usernames[username] == address(0), "Username already taken");
        _;
    }

    /**
     * @dev Registers a new username with a valid signature.
     * @param username The username to register.
     * @param owner The address of the owner of the username.
     * @param signature The signature that validates the username.
     * @param signatureExpiration The timestamp after which the signature is no longer valid.
     */
    function registerUsername(
        string memory username,
        address owner,
        bytes memory signature,
        uint256 signatureExpiration
    ) external withUsernameAvailable(username) {
        require(block.timestamp <= signatureExpiration, "Signature has expired");
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
        return signer == owner;
    }

    /**
     * @dev Checks if a username is available.
     * @param username The username to check.
     * @return True if the username is available, false otherwise.
     */
    function isUsernameAvailable(
        string memory username
    ) external view returns (bool) {
        return metaSoccerID.isUsernameAvailable(username) && usernames[username] == address(0);
    }

    /**
     * @dev Returns the address associated with a given username.
     * @param username The username to query.
     * @return The address associated with the username.
     */
    function getAddressByUsername(
        string memory username
    ) external view returns (address) {
        address ownerInMetaSoccerID = metaSoccerID.getAddressByUsername(username);
        return ownerInMetaSoccerID != address(0) ? ownerInMetaSoccerID : usernames[username];
    }
}
