// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Raffle_NotEnoughETHEntered();
error Raffle_FAILEDTRANSFER();
error Raffle_NotOpen();
error Raffle_UpkeepNotNeeded(uint256 balance, uint256 players, uint256 state);

/**
 * @title Raffle smart contract
 * @author Alabi Mujeeb
 * @notice This contract is for an untamperable raffle smart contract
 * @dev Makes use of chainlink VRF and chainlink keepers
 */

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    enum RaffleState {
        Close,
        Open
    }

    uint256 private immutable i_entranceFee;
    address[] private s_players;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    RaffleState private s_raffleState;
    uint256 private s_lastBlockTime;
    uint256 immutable i_interval;

    // Events
    event RaffleEntered(address indexed player);
    event RequestedRanomNumber(uint256 indexed requestId);
    event WinnderPicked(address indexed winnderAddress);

    constructor(
        address vrfCoordinatorV2,
        uint32 callbackGasLimit,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint256 interval,
        uint256 entranceFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_callbackGasLimit = callbackGasLimit;
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        s_raffleState = RaffleState.Open;
        s_lastBlockTime = block.timestamp;
        i_keyHash = gasLane;
        i_interval = interval;
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isAboveInterval = (block.timestamp - s_lastBlockTime) > i_interval;
        bool isOpen = s_raffleState == RaffleState.Open;
        bool players_present = s_players.length > 0;
        bool has_balance = address(this).balance > 0;
        upkeepNeeded =
            isOpen &&
            isAboveInterval &&
            players_present &&
            has_balance;

        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes memory /* performData */) public override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle_UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        // Will revert if subscription is not set and funded.
        s_raffleState = RaffleState.Close;

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedRanomNumber(requestId);
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle_NotEnoughETHEntered();
        }

        if (s_raffleState != RaffleState.Open) {
            revert Raffle_NotOpen();
        }

        s_players.push(msg.sender);
        emit RaffleEntered(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 winnderIndex = randomWords[0] % s_players.length;
        address winnderAddress = s_players[winnderIndex];

        s_raffleState = RaffleState.Open;
        s_players = new address[](0);
        s_lastBlockTime = block.timestamp;
        (bool success, ) = payable(winnderAddress).call{
            value: address(this).balance
        }("");

        if (!success) {
            revert Raffle_FAILEDTRANSFER();
        }

        emit WinnderPicked(winnderAddress);
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastBlockTime;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATION;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
