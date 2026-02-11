#!/usr/bin/env python3
"""
Mint achievement badge NFT for users who reach milestones.

This script mints achievement badges as NFTs when users reach specific
streak milestones (1, 7, 30, 100, or 365 days).
"""

import argparse
import json
import sys
from utils.contract import get_web3, get_account, get_contract, send_transaction


BADGE_TYPES = {
    'FirstFlame': 0,
    'WeekWarrior': 1,
    'MonthlyMaster': 2,
    'CenturyClub': 3,
    'IronWill': 4
}

BADGE_URIS = {
    0: 'ipfs://QmFirstFlame/metadata.json',
    1: 'ipfs://QmWeekWarrior/metadata.json',
    2: 'ipfs://QmMonthlyMaster/metadata.json',
    3: 'ipfs://QmCenturyClub/metadata.json',
    4: 'ipfs://QmIronWill/metadata.json'
}


def main():
    """Main entry point for badge minting."""
    parser = argparse.ArgumentParser(description='Mint achievement badge NFT')
    parser.add_argument('--user', required=True, help='User wallet address')
    parser.add_argument('--badge-type', required=True, choices=list(BADGE_TYPES.keys()))
    parser.add_argument('--habit-id', required=True, type=int)
    args = parser.parse_args()

    w3 = get_web3()
    account = get_account(w3)
    contract = get_contract(w3, 'StreakBadge')

    badge_type_id = BADGE_TYPES[args.badge_type]
    uri = BADGE_URIS[badge_type_id]
    user_address = w3.to_checksum_address(args.user)

    try:
        # Check if user already has this badge
        has_badge = contract.functions.hasBadge(user_address, badge_type_id).call()
        if has_badge:
            print(json.dumps({'success': False, 'error': 'User already has this badge'}, indent=2))
            sys.exit(0)

        tx = contract.functions.mintBadge(user_address, badge_type_id, args.habit_id, uri).build_transaction({
            'from': account.address,
            'chainId': w3.eth.chain_id
        })
        receipt = send_transaction(w3, account, tx)
        result = {
            'success': True,
            'txHash': receipt['transactionHash'].hex(),
            'blockNumber': receipt['blockNumber'],
            'badgeType': args.badge_type,
            'user': args.user
        }
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()