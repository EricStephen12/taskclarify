# Design Document

## Overview

The referral system enables TaskClarify users to earn rewards by inviting others. It implements a hybrid model where free users earn bonus credits and Pro users earn revenue share from referred subscriptions.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Signup Page   │────▶│  Referral API   │────▶│    Supabase     │
│  (with code)    │     │  /api/referral  │     │   (referrals    │
└─────────────────┘     └─────────────────┘     │    table)       │
                                                └─────────────────┘
┌─────────────────┐     ┌─────────────────┐            │
│   Dashboard     │────▶│  Referral Stats │◀───────────┘
│  Referral Tab   │     │     API         │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Paddle Webhook  │────▶│  Earnings API   │────▶│ referral_earnings│
│ (subscription)  │     │                 │     │     table        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Components and Interfaces

### Database Tables

**profiles table (update)**
- Add `referral_code` (text, unique)
- Add `referred_by` (uuid, references profiles.id)
- Add `bonus_credits` (integer, default 0)

**referrals table (new)**
- `id` (uuid, primary key)
- `referrer_id` (uuid, references profiles.id)
- `referred_id` (uuid, references profiles.id)
- `status` (text: 'pending', 'completed', 'subscribed')
- `created_at` (timestamp)

**referral_earnings table (new)**
- `id` (uuid, primary key)
- `referral_id` (uuid, references referrals.id)
- `referrer_id` (uuid, references profiles.id)
- `amount` (decimal)
- `currency` (text)
- `subscription_id` (text)
- `status` (text: 'pending', 'paid')
- `expires_at` (timestamp, 12 months from creation)
- `created_at` (timestamp)

### API Endpoints

1. `GET /api/referral` - Get user's referral code and stats
2. `POST /api/referral/apply` - Apply referral code during signup
3. `GET /api/referral/stats` - Get detailed referral statistics
4. `POST /api/webhooks/paddle` - Handle subscription events for revenue share

### Referral Code Generation

- 8 characters: uppercase letters + numbers (excluding confusing chars: 0, O, I, L)
- Format: `XXXX-XXXX` for readability
- Generated on first profile creation

## Data Models

```typescript
interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  completedReferrals: number;
  subscribedReferrals: number;
  bonusCreditsEarned: number;
  pendingEarnings: number;
  paidEarnings: number;
  referrals: ReferralRecord[];
}

interface ReferralRecord {
  id: string;
  referredEmail: string;
  status: 'pending' | 'completed' | 'subscribed';
  creditsEarned: number;
  revenueEarned: number;
  createdAt: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Referral code uniqueness
*For any* two users in the system, their referral codes SHALL be different.
**Validates: Requirements 1.1**

### Property 2: Referral code format
*For any* generated referral code, it SHALL be exactly 8 characters and contain only valid characters (A-Z, 2-9).
**Validates: Requirements 1.1**

### Property 3: Bonus credits for referred user
*For any* successful signup with a valid referral code, the new user's bonus_credits SHALL increase by 5.
**Validates: Requirements 2.1**

### Property 4: Referral relationship recording
*For any* successful referral, a referral record SHALL exist linking referrer and referred user.
**Validates: Requirements 2.3**

### Property 5: Bonus credits for referrer
*For any* completed referral, the referrer's bonus_credits SHALL increase by 5.
**Validates: Requirements 3.1**

### Property 6: Revenue share calculation
*For any* referred user subscription, the recorded earnings SHALL equal exactly 20% of the subscription amount.
**Validates: Requirements 4.1**

### Property 7: Earnings expiration
*For any* referral earning record, the expires_at date SHALL be exactly 12 months after created_at.
**Validates: Requirements 4.2**

## Error Handling

- Invalid referral code: Show warning but allow signup to continue
- Duplicate referral attempt: Ignore silently (user already referred)
- Self-referral: Reject with error message
- Expired referral earnings: Exclude from pending totals

## Testing Strategy

### Unit Tests
- Referral code generation uniqueness
- Bonus credit calculation
- Revenue share calculation (20%)
- Earnings expiration logic

### Property-Based Tests
- Use fast-check library for TypeScript
- Test referral code format across many generations
- Test bonus credit invariants
- Test revenue share calculations

### Integration Tests
- Full signup flow with referral code
- Paddle webhook handling for subscriptions
- Referral stats aggregation
