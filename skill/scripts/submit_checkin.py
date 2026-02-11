#!/usr/bin/env python3
"""
Submit habit check-in onchain.

This script submits a verified habit check-in to the StreakBeastCore contract,
recording the user's progress and updating their streak.
"""

import argparse
import json
import sys
from utils.contract import get_web3, get_account, get_contract, send_transaction


def main():
    """Main entry point for submitting habit check-ins."""
    parser = argparse.ArgumentParser(description='Submit habit check-in onchain')
    parser.add_argument(
        '--habit-id',
        required=True,
        type=int,
        help='ID of the habit to check in'
    )
    parser.add_argument(
        '--proof',
        required=True,
        help='Proof hash from verification'
    )
    args = parser.parse_args()

    w3 = get_web3()
    account = get_account(w3)
    contract = get_contract(w3, 'StreakBeastCore')

    try:
        # Convert proof to bytes32
        proof_bytes = bytes.fromhex(args.proof[:64])
        tx = contract.functions.checkIn(args.habit_id, proof_bytes).build_transaction({
            'from': account.address,
            'chainId': w3.eth.chain_id
        })
        receipt = send_transaction(w3, account, tx)
        result = {
            'success': True,
            'txHash': receipt['transactionHash'].hex(),
            'blockNumber': receipt['blockNumber'],
            'habitId': args.habit_id
        }
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()