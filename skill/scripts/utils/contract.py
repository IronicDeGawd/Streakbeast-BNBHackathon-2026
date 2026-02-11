"""Web3.py utility module for contract interactions."""

import os
import json
from typing import Dict, Any
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


def get_web3() -> Web3:
    """
    Create and return a Web3 instance connected to opBNB.
    
    Returns:
        Web3: Connected Web3 instance
    """
    rpc_url = os.environ.get('OPBNB_RPC_URL', 'https://opbnb-testnet-rpc.bnbchain.org')
    return Web3(Web3.HTTPProvider(rpc_url))


def get_account(w3: Web3):
    """
    Load the agent's account from private key.
    
    Args:
        w3: Web3 instance
        
    Returns:
        Account object with signing capabilities
    """
    private_key = os.environ['WALLET_PRIVATE_KEY']
    return w3.eth.account.from_key(private_key)


def load_abi(contract_name: str) -> Dict[str, Any]:
    """
    Load contract ABI from references directory.
    
    Args:
        contract_name: Name of the contract (e.g., 'StreakBeast')
        
    Returns:
        Contract ABI as dictionary
    """
    abi_path = os.path.join(os.path.dirname(__file__), '..', '..', 'references', f'{contract_name}.json')
    with open(abi_path, 'r') as f:
        return json.load(f)


def load_addresses() -> Dict[str, Dict[str, str]]:
    """
    Load contract addresses from references/addresses.json.
    
    Returns:
        Dictionary mapping chain IDs to contract addresses
    """
    addr_path = os.path.join(os.path.dirname(__file__), '..', '..', 'references', 'addresses.json')
    with open(addr_path, 'r') as f:
        return json.load(f)


def get_contract(w3: Web3, contract_name: str):
    """
    Get a contract instance for the given contract name.
    
    Args:
        w3: Web3 instance
        contract_name: Name of the contract
        
    Returns:
        Web3 contract instance
        
    Raises:
        ValueError: If no address found for contract on current chain
    """
    abi = load_abi(contract_name)
    addresses = load_addresses()
    chain_id = str(w3.eth.chain_id)
    address = addresses.get(chain_id, {}).get(contract_name)
    if not address:
        raise ValueError(f'No address for {contract_name} on chain {chain_id}')
    return w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi)


def send_transaction(w3: Web3, account, tx: Dict[str, Any]):
    """
    Sign and send a transaction, waiting for receipt.
    
    Args:
        w3: Web3 instance
        account: Account to sign with
        tx: Transaction dictionary
        
    Returns:
        Transaction receipt
    """
    tx['nonce'] = w3.eth.get_transaction_count(account.address)
    tx['gasPrice'] = w3.eth.gas_price
    if 'gas' not in tx:
        tx['gas'] = w3.eth.estimate_gas(tx)
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt