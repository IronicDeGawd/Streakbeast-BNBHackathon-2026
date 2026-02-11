#!/usr/bin/env python3
"""
Verify habit completion by checking external APIs.

This script checks if a user completed their habit today using various
verification methods (GitHub, Strava, Duolingo, or self-reported).
"""

import argparse
import json
import os
import sys
import hashlib
import datetime
import requests


def verify_github(user_id: str) -> dict:
    """
    Verify coding habit by checking GitHub activity.
    
    Args:
        user_id: GitHub username
        
    Returns:
        Dictionary with verification result, proof hash, and details
    """
    token = os.environ.get('GITHUB_TOKEN', '')
    headers = {'Authorization': f'token {token}'} if token else {}
    
    try:
        url = f'https://api.github.com/users/{user_id}/events'
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        events = resp.json()
        
        today = datetime.date.today().isoformat()
        today_events = [e for e in events if e.get('created_at', '').startswith(today)]
        
        if today_events:
            proof = today_events[0].get('id', '')
            return {
                'verified': True,
                'proof': hashlib.sha256(str(proof).encode()).hexdigest(),
                'details': f'Found {len(today_events)} events today'
            }
        
        return {
            'verified': False,
            'proof': '',
            'details': 'No GitHub events found today'
        }
    except Exception as e:
        return {
            'verified': False,
            'proof': '',
            'details': f'Error: {str(e)}'
        }


def verify_strava(user_id: str) -> dict:
    """
    Verify exercise habit by checking Strava activity.
    
    Args:
        user_id: Strava user identifier
        
    Returns:
        Dictionary with verification result, proof hash, and details
    """
    client_id = os.environ.get('STRAVA_CLIENT_ID', '')
    client_secret = os.environ.get('STRAVA_CLIENT_SECRET', '')
    refresh_token = os.environ.get('STRAVA_REFRESH_TOKEN', '')
    
    try:
        # Refresh access token
        token_resp = requests.post('https://www.strava.com/oauth/token', data={
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }, timeout=10)
        access_token = token_resp.json().get('access_token', '')
        
        # Get activities
        headers = {'Authorization': f'Bearer {access_token}'}
        today_epoch = int(datetime.datetime.combine(datetime.date.today(), datetime.time.min).timestamp())
        resp = requests.get(
            f'https://www.strava.com/api/v3/athlete/activities?after={today_epoch}',
            headers=headers,
            timeout=10
        )
        activities = resp.json()
        
        if activities and len(activities) > 0:
            proof = str(activities[0].get('id', ''))
            return {
                'verified': True,
                'proof': hashlib.sha256(proof.encode()).hexdigest(),
                'details': f'Found {len(activities)} activities today'
            }
        
        return {
            'verified': False,
            'proof': '',
            'details': 'No Strava activities found today'
        }
    except Exception as e:
        return {
            'verified': False,
            'proof': '',
            'details': f'Error: {str(e)}'
        }


def verify_duolingo(user_id: str) -> dict:
    """
    Verify reading/language habit by checking Duolingo activity.
    
    Args:
        user_id: Duolingo username
        
    Returns:
        Dictionary with verification result, proof hash, and details
    """
    try:
        resp = requests.get(
            f'https://www.duolingo.com/2017-06-30/users?username={user_id}',
            timeout=10
        )
        data = resp.json()
        users = data.get('users', [])
        
        if users:
            streak = users[0].get('streak', 0)
            if streak > 0:
                proof = hashlib.sha256(
                    f'{user_id}-{datetime.date.today().isoformat()}'.encode()
                ).hexdigest()
                return {
                    'verified': True,
                    'proof': proof,
                    'details': f'Active streak: {streak} days'
                }
        
        return {
            'verified': False,
            'proof': '',
            'details': 'No active Duolingo streak'
        }
    except Exception as e:
        return {
            'verified': False,
            'proof': '',
            'details': f'Error: {str(e)}'
        }


def verify_self_reported(user_id: str) -> dict:
    """
    Verify habit using self-reported completion.
    
    Args:
        user_id: User identifier
        
    Returns:
        Dictionary with verification result, proof hash, and details
    """
    proof = hashlib.sha256(
        f'{user_id}-self-{datetime.datetime.now().isoformat()}'.encode()
    ).hexdigest()
    return {
        'verified': True,
        'proof': proof,
        'details': 'Self-reported verification accepted'
    }


VERIFIERS = {
    'coding': verify_github,
    'exercise': verify_strava,
    'reading': verify_duolingo,
    'meditation': verify_self_reported,
    'language': verify_self_reported,
    'custom': verify_self_reported
}


def main():
    """Main entry point for habit verification."""
    parser = argparse.ArgumentParser(description='Verify habit completion')
    parser.add_argument(
        '--habit-type',
        required=True,
        choices=list(VERIFIERS.keys()),
        help='Type of habit to verify'
    )
    parser.add_argument(
        '--user-id',
        required=True,
        help='User identifier for the habit verification'
    )
    
    args = parser.parse_args()
    
    verifier = VERIFIERS[args.habit_type]
    result = verifier(args.user_id)
    
    print(json.dumps(result, indent=2))
    sys.exit(0 if result['verified'] else 1)


if __name__ == '__main__':
    main()