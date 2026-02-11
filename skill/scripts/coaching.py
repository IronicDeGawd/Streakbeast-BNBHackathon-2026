#!/usr/bin/env python3
"""
Generate personalized coaching advice for StreakBeast users.

This script analyzes a user's habit streaks and provides motivational
coaching tips and personalized encouragement based on their progress.
"""

import argparse
import json
import sys
import random
from utils.contract import get_web3, get_contract


TIPS = [
    'Consistency is key! Try to complete your habits at the same time each day.',
    'You\'re building neural pathways. Each day strengthens the connection.',
    'Consider pairing your habit with something you already do daily (habit stacking).',
    'Track your energy levels - some habits are better in the morning, others at night.',
    'Celebrate small wins! Each check-in is a victory worth acknowledging.',
    'If you miss a day, don\'t break the chain mentality - just start again immediately.',
    'Your streak competitors are watching! Stay ahead by being consistent.',
    'Consider increasing your stake amount to boost your motivation.',
    'Share your progress with friends - social accountability increases success rates by 65%.',
    'Remember why you started. Your future self will thank you for every day you show up.'
]


def main():
    """Main entry point for coaching advice generation."""
    parser = argparse.ArgumentParser(description='Generate coaching advice')
    parser.add_argument('--user', required=True, help='User wallet address')
    args = parser.parse_args()

    w3 = get_web3()
    core_contract = get_contract(w3, 'StreakBeastCore')
    user_address = w3.to_checksum_address(args.user)

    try:
        # Get user habits
        habit_ids = core_contract.functions.getUserHabits(user_address).call()
        habits_data = []
        total_streak = 0
        for hid in habit_ids:
            streak = core_contract.functions.getStreak(hid).call()
            total_streak += streak
            habits_data.append({'habitId': hid, 'streak': streak})

        # Generate coaching advice
        selected_tips = random.sample(TIPS, min(3, len(TIPS)))

        # Personalize based on streak
        if total_streak >= 30:
            motivation = 'You\'re on fire! Your dedication is truly impressive.'
        elif total_streak >= 7:
            motivation = 'Great momentum! You\'re building strong habits.'
        elif total_streak >= 1:
            motivation = 'Good start! Keep pushing through the first week - it gets easier.'
        else:
            motivation = 'Every journey starts with a single step. Begin your streak today!'

        result = {
            'user': args.user,
            'totalStreak': total_streak,
            'habits': habits_data,
            'motivation': motivation,
            'tips': selected_tips
        }
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'error': str(e), 'tips': random.sample(TIPS, 3)}, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()