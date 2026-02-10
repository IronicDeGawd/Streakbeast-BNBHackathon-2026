// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StreakBeastCore
 * @dev Main staking contract for StreakBeast habit tracker on opBNB
 * @notice Handles habit staking, daily check-ins, reward distribution, and leaderboard
 */
contract StreakBeastCore is ReentrancyGuard {
    /// @dev Struct representing a user's habit commitment
    struct Habit {
        address user;
        uint8 habitType;
        uint256 stakeAmount;
        uint256 startTime;
        uint256 duration;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastCheckIn;
        bool active;
        bool claimed;
    }

    /// @dev Struct representing a staking pool for a specific habit type
    struct Pool {
        uint8 habitType;
        uint256 totalStaked;
        uint256 startTime;
        uint256 duration;
        uint256 totalSuccessfulStreaks;
        bool distributed;
        address[] participants;
    }

    /// @dev Owner of the contract
    address public owner;

    /// @dev Agent address authorized to perform check-ins
    address public agent;

    /// @dev Mapping from habit ID to Habit struct
    mapping(uint256 => Habit) public habits;

    /// @dev Mapping from pool ID to Pool struct
    mapping(uint256 => Pool) public pools;

    /// @dev Mapping from user address to array of their habit IDs
    mapping(address => uint256[]) public userHabits;

    /// @dev Mapping from pool ID to array of habit IDs in that pool
    mapping(uint256 => uint256[]) public poolHabits;

    /// @dev Mapping from pool ID to user address to their reward balance
    mapping(uint256 => mapping(address => uint256)) public rewardBalances;

    /// @dev Counter for next habit ID
    uint256 public nextHabitId;

    /// @dev Counter for next pool ID
    uint256 public nextPoolId;

    /// @dev Emitted when a user stakes on a habit
    event Staked(
        address indexed user,
        uint256 habitId,
        uint8 habitType,
        uint256 amount,
        uint256 duration
    );

    /// @dev Emitted when a user successfully checks in
    event CheckedIn(uint256 indexed habitId, uint256 streak);

    /// @dev Emitted when a user's streak is broken
    event StreakBroken(uint256 indexed habitId, uint256 finalStreak);

    /// @dev Emitted when rewards are distributed for a pool
    event Distributed(uint256 indexed poolId, uint256 totalRewards);

    /// @dev Emitted when a user claims their reward
    event RewardClaimed(address indexed user, uint256 poolId, uint256 amount);

    /// @dev Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @dev Modifier to restrict access to agent only
    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent can call this function");
        _;
    }

    /**
     * @dev Constructor to initialize the contract
     * @param _agent Address of the authorized agent
     */
    constructor(address _agent) {
        require(_agent != address(0), "Invalid agent address");
        owner = msg.sender;
        agent = _agent;
        nextHabitId = 1;
        nextPoolId = 1;
    }

    /**
     * @dev Stake on a habit commitment
     * @param habitType Type of habit (enum value)
     * @param durationDays Duration of the commitment in days
     */
    function stake(uint8 habitType, uint256 durationDays) external payable {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(durationDays >= 7, "Duration must be at least 7 days");

        uint256 habitId = nextHabitId++;
        uint256 duration = durationDays * 1 days;

        // Create new habit
        habits[habitId] = Habit({
            user: msg.sender,
            habitType: habitType,
            stakeAmount: msg.value,
            startTime: block.timestamp,
            duration: duration,
            currentStreak: 0,
            longestStreak: 0,
            lastCheckIn: 0,
            active: true,
            claimed: false
        });

        // Add to user's habits
        userHabits[msg.sender].push(habitId);

        // Find or create matching pool
        uint256 poolId = _findOrCreatePool(habitType, duration);

        // Add user to pool participants if not already present
        Pool storage pool = pools[poolId];
        bool isParticipant = false;
        for (uint256 i = 0; i < pool.participants.length; i++) {
            if (pool.participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        if (!isParticipant) {
            pool.participants.push(msg.sender);
        }

        // Add habit to pool
        poolHabits[poolId].push(habitId);
        pool.totalStaked += msg.value;

        emit Staked(msg.sender, habitId, habitType, msg.value, durationDays);
    }

    /**
     * @dev Check in for a habit (agent only)
     * @param habitId ID of the habit to check in
     * @param proof Verification proof (reserved for future use)
     */
    function checkIn(uint256 habitId, bytes calldata proof) external onlyAgent {
        Habit storage habit = habits[habitId];
        require(habit.active, "Habit is not active");
        require(habit.user != address(0), "Habit does not exist");

        // Prevent double check-in on same day (at least 20 hours between check-ins)
        if (habit.lastCheckIn > 0) {
            require(
                block.timestamp >= habit.lastCheckIn + 20 hours,
                "Already checked in today"
            );
        }

        // Check if streak is broken (more than 48 hours since last check-in)
        if (habit.lastCheckIn > 0 && block.timestamp > habit.lastCheckIn + 48 hours) {
            habit.active = false;
            emit StreakBroken(habitId, habit.currentStreak);
            return;
        }

        // Increment streak
        habit.currentStreak++;
        if (habit.currentStreak > habit.longestStreak) {
            habit.longestStreak = habit.currentStreak;
        }
        habit.lastCheckIn = block.timestamp;

        emit CheckedIn(habitId, habit.currentStreak);
    }

    /**
     * @dev Distribute rewards for a completed pool (agent only)
     * @param poolId ID of the pool to distribute rewards for
     */
    function distribute(uint256 poolId) external onlyAgent nonReentrant {
        Pool storage pool = pools[poolId];
        require(!pool.distributed, "Pool already distributed");
        require(
            block.timestamp >= pool.startTime + pool.duration,
            "Pool period not ended"
        );

        uint256 poolBalance = pool.totalStaked;
        uint256 totalSuccessfulStreaks = 0;

        // Calculate total successful streaks
        uint256[] memory habitIds = poolHabits[poolId];
        for (uint256 i = 0; i < habitIds.length; i++) {
            Habit storage habit = habits[habitIds[i]];
            if (habit.active || habit.currentStreak > 0) {
                totalSuccessfulStreaks += habit.currentStreak;
            }
        }

        pool.totalSuccessfulStreaks = totalSuccessfulStreaks;

        // Distribute rewards to participants
        if (totalSuccessfulStreaks > 0) {
            for (uint256 i = 0; i < pool.participants.length; i++) {
                address participant = pool.participants[i];
                uint256 userTotalStreak = 0;

                // Calculate user's total streak across all habits in this pool
                for (uint256 j = 0; j < habitIds.length; j++) {
                    Habit storage habit = habits[habitIds[j]];
                    if (habit.user == participant) {
                        userTotalStreak += habit.currentStreak;
                    }
                }

                if (userTotalStreak > 0) {
                    // Calculate base share
                    uint256 userShare = (userTotalStreak * poolBalance) / totalSuccessfulStreaks;

                    // Calculate week bonus (10% per week completed)
                    uint256 weekBonus = (userTotalStreak / 7) * 10;

                    // Calculate final reward with bonus
                    uint256 finalReward = userShare + (userShare * weekBonus) / 100;

                    rewardBalances[poolId][participant] = finalReward;
                }
            }
        }

        pool.distributed = true;
        emit Distributed(poolId, poolBalance);
    }

    /**
     * @dev Claim reward for a specific pool
     * @param poolId ID of the pool to claim rewards from
     */
    function claimReward(uint256 poolId) external nonReentrant {
        uint256 reward = rewardBalances[poolId][msg.sender];
        require(reward > 0, "No reward to claim");

        rewardBalances[poolId][msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");

        emit RewardClaimed(msg.sender, poolId, reward);
    }

    /**
     * @dev Set new agent address (owner only)
     * @param newAgent Address of the new agent
     */
    function setAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "Invalid agent address");
        agent = newAgent;
    }

    /**
     * @dev Get current streak for a habit
     * @param habitId ID of the habit
     * @return Current streak count
     */
    function getStreak(uint256 habitId) external view returns (uint256) {
        return habits[habitId].currentStreak;
    }

    /**
     * @dev Get habit details
     * @param habitId ID of the habit
     * @return Habit struct
     */
    function getHabit(uint256 habitId) external view returns (Habit memory) {
        return habits[habitId];
    }

    /**
     * @dev Get all habit IDs for a user
     * @param user Address of the user
     * @return Array of habit IDs
     */
    function getUserHabits(address user) external view returns (uint256[] memory) {
        return userHabits[user];
    }

    /**
     * @dev Get pool details
     * @param poolId ID of the pool
     * @return Pool struct
     */
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }

    /**
     * @dev Get reward balance for a user in a pool
     * @param poolId ID of the pool
     * @param user Address of the user
     * @return Reward balance
     */
    function getRewardBalance(uint256 poolId, address user) external view returns (uint256) {
        return rewardBalances[poolId][user];
    }

    /**
     * @dev Get leaderboard for a pool
     * @param poolId ID of the pool
     * @return Array of participant addresses sorted by streak (descending)
     */
    function getLeaderboard(uint256 poolId) external view returns (address[] memory) {
        Pool storage pool = pools[poolId];
        uint256[] memory habitIds = poolHabits[poolId];
        
        // Create array to store participant streaks
        address[] memory participants = pool.participants;
        uint256[] memory streaks = new uint256[](participants.length);

        // Calculate total streak for each participant
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 totalStreak = 0;
            for (uint256 j = 0; j < habitIds.length; j++) {
                Habit storage habit = habits[habitIds[j]];
                if (habit.user == participants[i]) {
                    totalStreak += habit.currentStreak;
                }
            }
            streaks[i] = totalStreak;
        }

        // Sort participants by streak (bubble sort for simplicity)
        for (uint256 i = 0; i < participants.length; i++) {
            for (uint256 j = i + 1; j < participants.length; j++) {
                if (streaks[j] > streaks[i]) {
                    // Swap streaks
                    uint256 tempStreak = streaks[i];
                    streaks[i] = streaks[j];
                    streaks[j] = tempStreak;

                    // Swap participants
                    address tempAddr = participants[i];
                    participants[i] = participants[j];
                    participants[j] = tempAddr;
                }
            }
        }

        return participants;
    }

    /**
     * @dev Find or create a pool for the given habit type and duration
     * @param habitType Type of habit
     * @param duration Duration in seconds
     * @return Pool ID
     */
    function _findOrCreatePool(uint8 habitType, uint256 duration) private returns (uint256) {
        // Calculate week start (Monday 00:00 UTC)
        uint256 weekStart = _getWeekStart(block.timestamp);

        // Try to find existing pool
        for (uint256 i = 1; i < nextPoolId; i++) {
            Pool storage pool = pools[i];
            if (
                pool.habitType == habitType &&
                pool.duration == duration &&
                pool.startTime == weekStart &&
                !pool.distributed
            ) {
                return i;
            }
        }

        // Create new pool
        uint256 poolId = nextPoolId++;
        pools[poolId] = Pool({
            habitType: habitType,
            totalStaked: 0,
            startTime: weekStart,
            duration: duration,
            totalSuccessfulStreaks: 0,
            distributed: false,
            participants: new address[](0)
        });

        return poolId;
    }

    /**
     * @dev Get the start of the week (Monday 00:00 UTC) for a given timestamp
     * @param timestamp Timestamp to calculate week start from
     * @return Week start timestamp
     */
    function _getWeekStart(uint256 timestamp) private pure returns (uint256) {
        // January 1, 1970 was a Thursday (day 4)
        // Days since epoch
        uint256 daysSinceEpoch = timestamp / 1 days;
        // Thursday is day 4, so we need to subtract 3 to get to Monday
        uint256 daysSinceMonday = (daysSinceEpoch + 3) % 7;
        return timestamp - (daysSinceMonday * 1 days) - (timestamp % 1 days);
    }
}