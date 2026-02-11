#!/usr/bin/env python3
"""
Distribute rewards for ended pools.

This script calculates and distributes proportional rewards to participants
in a StreakBeast pool that has ended. Rewards are distributed based on
each user's streak length relative to the total streaks, with bonuses
for consistent performers.
"""

import argparse
import json
import sys
from utils.contract import get_web3, get_account, get_contract, send_transaction


def main():
    """Main entry point for reward distribution."""
    parser = argparse.ArgumentParser(description='Distribute rewards for ended pools')
    parser.add_argument(
        '--pool-id',
        required=True,
        type=int,
        help='ID of the pool to distribute rewards for'
    )
    
    args = parser.parse_args()
    
    w3 = get_web3()
    account = get_account(w3)
    contract = get_contract(w3, 'StreakBeastCore')
    
    try:
        # Check pool status first
        pool = contract.functions.getPool(args.pool_id).call()
        print(f'Pool {args.pool_id}: totalStaked={w3.from_wei(pool[1], "ether")} BNB, participants={pool[4]}')
        
        tx = contract.functions.distribute(args.pool_id).build_transaction({
            'from': account.address,
            'chainId': w3.eth.chain_id
        })
        receipt = send_transaction(w3, account, tx)
        
        result = {
            'success': True,
            'txHash': receipt['transactionHash'].hex(),
            'blockNumber': receipt['blockNumber'],
            'poolId': args.pool_id
        }
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()