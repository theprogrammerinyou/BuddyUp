package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// windowEntry tracks request timestamps for a single key within a sliding window.
type windowEntry struct {
	mu         sync.Mutex
	timestamps []time.Time
}

// allow checks whether a new request is within the allowed limit for the given window duration.
func (e *windowEntry) allow(limit int, window time.Duration) bool {
	now := time.Now()
	cutoff := now.Add(-window)

	e.mu.Lock()
	defer e.mu.Unlock()

	// Remove timestamps outside the window
	valid := e.timestamps[:0]
	for _, t := range e.timestamps {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	e.timestamps = valid

	if len(e.timestamps) >= limit {
		return false
	}
	e.timestamps = append(e.timestamps, now)
	return true
}

type rateLimiter struct {
	entries sync.Map
	limit   int
	window  time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{limit: limit, window: window}
	// Periodically clean up stale entries to prevent memory leaks.
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			cutoff := time.Now().Add(-window)
			rl.entries.Range(func(key, value any) bool {
				entry := value.(*windowEntry)
				entry.mu.Lock()
				allStale := len(entry.timestamps) == 0 || entry.timestamps[len(entry.timestamps)-1].Before(cutoff)
				entry.mu.Unlock()
				if allStale {
					rl.entries.Delete(key)
				}
				return true
			})
		}
	}()
	return rl
}

func (rl *rateLimiter) handler() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		val, _ := rl.entries.LoadOrStore(ip, &windowEntry{})
		entry := val.(*windowEntry)
		if !entry.allow(rl.limit, rl.window) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded, please slow down",
				"code":  "RATE_LIMIT_EXCEEDED",
			})
			return
		}
		c.Next()
	}
}

var (
	generalLimiter = newRateLimiter(60, time.Minute)
	authLimiter    = newRateLimiter(10, time.Minute)
)

// RateLimit returns a middleware that allows up to 60 requests per minute per IP.
func RateLimit() gin.HandlerFunc {
	return generalLimiter.handler()
}

// RateLimitStrict returns a middleware that allows up to 10 requests per minute per IP (for auth endpoints).
func RateLimitStrict() gin.HandlerFunc {
	return authLimiter.handler()
}
