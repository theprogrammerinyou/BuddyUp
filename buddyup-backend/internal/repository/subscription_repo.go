package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type SubscriptionRepo struct {
	db *pgxpool.Pool
}

func NewSubscriptionRepo(db *pgxpool.Pool) *SubscriptionRepo {
	return &SubscriptionRepo{db: db}
}

func (r *SubscriptionRepo) GetSubscription(ctx context.Context, userID string) (*models.Subscription, error) {
	var s models.Subscription
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, plan, status, expires_at, COALESCE(provider,''), COALESCE(provider_subscription_id,''), created_at
		FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
	`, userID).Scan(&s.ID, &s.UserID, &s.Plan, &s.Status, &s.ExpiresAt, &s.Provider, &s.ProviderSubscriptionID, &s.CreatedAt)
	if err != nil {
		// Return a free plan stub if no subscription found
		return &models.Subscription{UserID: userID, Plan: "free", Status: "active"}, nil
	}
	return &s, nil
}

func (r *SubscriptionRepo) UpsertSubscription(ctx context.Context, userID, plan, status, provider, providerSubID string, expiresAt *time.Time) (*models.Subscription, error) {
	var s models.Subscription
	// Always insert a new record; GetSubscription fetches the most-recent row via ORDER BY created_at DESC.
	err := r.db.QueryRow(ctx, `
		INSERT INTO subscriptions (user_id, plan, status, provider, provider_subscription_id, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, plan, status, expires_at, COALESCE(provider,''), COALESCE(provider_subscription_id,''), created_at
	`, userID, plan, status, provider, providerSubID, expiresAt).Scan(
		&s.ID, &s.UserID, &s.Plan, &s.Status, &s.ExpiresAt, &s.Provider, &s.ProviderSubscriptionID, &s.CreatedAt,
	)
	return &s, err
}

func (r *SubscriptionRepo) IsPremium(ctx context.Context, userID string) (bool, error) {
	var plan, status string
	var expiresAt *time.Time
	err := r.db.QueryRow(ctx, `
		SELECT plan, status, expires_at FROM subscriptions
		WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
	`, userID).Scan(&plan, &status, &expiresAt)
	if err != nil {
		return false, nil
	}
	if plan == "free" || status != "active" {
		return false, nil
	}
	if expiresAt != nil && expiresAt.Before(time.Now()) {
		return false, nil
	}
	return true, nil
}

func (r *SubscriptionRepo) GetActiveBoost(ctx context.Context, userID string) (*models.Boost, error) {
	var b models.Boost
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, activated_at, expires_at, boost_type FROM boosts
		WHERE user_id = $1 AND expires_at > NOW()
		ORDER BY expires_at DESC LIMIT 1
	`, userID).Scan(&b.ID, &b.UserID, &b.ActivatedAt, &b.ExpiresAt, &b.BoostType)
	if err != nil {
		return nil, nil // no active boost
	}
	b.IsActive = true
	return &b, nil
}

func (r *SubscriptionRepo) ActivateBoost(ctx context.Context, userID string) (*models.Boost, error) {
	var b models.Boost
	err := r.db.QueryRow(ctx, `
		INSERT INTO boosts (user_id, expires_at, boost_type)
		VALUES ($1, NOW() + INTERVAL '30 minutes', 'standard')
		RETURNING id, user_id, activated_at, expires_at, boost_type
	`, userID).Scan(&b.ID, &b.UserID, &b.ActivatedAt, &b.ExpiresAt, &b.BoostType)
	if err != nil {
		return nil, err
	}
	b.IsActive = true
	return &b, nil
}

func (r *SubscriptionRepo) AddSuperLikePack(ctx context.Context, userID, provider, transactionID string, quantity int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck
	_, err = tx.Exec(ctx, `
		INSERT INTO super_like_packs (user_id, quantity, provider_transaction_id) VALUES ($1, $2, $3)
	`, userID, quantity, transactionID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE users SET super_likes_available = super_likes_available + $2 WHERE id = $1`, userID, quantity)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *SubscriptionRepo) GetSuperLikesAvailable(ctx context.Context, userID string) (int, error) {
	var available int
	err := r.db.QueryRow(ctx, `SELECT super_likes_available FROM users WHERE id = $1`, userID).Scan(&available)
	return available, err
}
