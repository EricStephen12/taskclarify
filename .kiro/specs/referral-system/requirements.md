# Requirements Document

## Introduction

A hybrid referral system for TaskClarify that rewards users for bringing new customers. Free users earn bonus credits, while Pro users earn revenue share from referred subscriptions.

## Glossary

- **Referrer**: User who shares their referral code/link
- **Referred User**: New user who signs up using a referral code
- **Referral Code**: Unique 8-character code assigned to each user
- **Bonus Credits**: Extra free formats added to a user's monthly limit
- **Revenue Share**: Percentage of subscription revenue paid to referrer

## Requirements

### Requirement 1

**User Story:** As a user, I want a unique referral code so that I can share it with others and earn rewards.

#### Acceptance Criteria

1. WHEN a user signs up THEN the system SHALL generate a unique 8-character referral code
2. WHEN a user views their dashboard THEN the system SHALL display their referral code and shareable link
3. WHEN a user clicks copy THEN the system SHALL copy the referral link to clipboard

### Requirement 2

**User Story:** As a new user, I want to use a referral code when signing up so that I get bonus credits.

#### Acceptance Criteria

1. WHEN a user signs up with a valid referral code THEN the system SHALL credit the new user with 5 bonus formats
2. WHEN a user signs up with an invalid referral code THEN the system SHALL show an error but allow signup to continue
3. WHEN a referral is successful THEN the system SHALL record the referral relationship

### Requirement 3

**User Story:** As a free user referrer, I want to earn bonus credits when someone signs up with my code.

#### Acceptance Criteria

1. WHEN a referred user completes signup THEN the system SHALL credit the referrer with 5 bonus formats
2. WHEN bonus credits are added THEN the system SHALL notify the referrer via toast/notification
3. WHEN viewing referral stats THEN the system SHALL show total referrals and credits earned

### Requirement 4

**User Story:** As a Pro user referrer, I want to earn revenue share when my referrals subscribe to Pro.

#### Acceptance Criteria

1. WHEN a referred user subscribes to Pro THEN the system SHALL record 20% of subscription value as pending earnings
2. WHEN tracking earnings THEN the system SHALL track earnings for 12 months per referred subscription
3. WHEN viewing referral dashboard THEN the system SHALL show pending earnings, paid earnings, and referral history

### Requirement 5

**User Story:** As a referrer, I want to see my referral performance so that I can track my rewards.

#### Acceptance Criteria

1. WHEN viewing referral dashboard THEN the system SHALL display total referrals count
2. WHEN viewing referral dashboard THEN the system SHALL display bonus credits earned (free users)
3. WHEN viewing referral dashboard THEN the system SHALL display revenue share earned (Pro users)
4. WHEN viewing referral dashboard THEN the system SHALL display list of referred users with status
