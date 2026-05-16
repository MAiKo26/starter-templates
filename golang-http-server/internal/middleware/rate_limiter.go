package middleware

import (
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*client
	window   time.Duration
	maxReqs  int
}

type client struct {
	count    int
	resetAt  time.Time
}

func NewRateLimiter(window time.Duration, maxRequests int) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*client),
		window:  window,
		maxReqs: maxRequests,
	}

	go rl.cleanup()

	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, c := range rl.clients {
			if c.resetAt.Before(now) {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	c, exists := rl.clients[ip]

	if !exists || c.resetAt.Before(now) {
		rl.clients[ip] = &client{
			count:   1,
			resetAt: now.Add(rl.window),
		}
		return true
	}

	if c.count >= rl.maxReqs {
		return false
	}

	c.count++
	return true
}

func RateLimitMiddleware(rl *RateLimiter, skipPaths ...string) func(http.Handler) http.Handler {
	skip := make(map[string]bool)
	for _, p := range skipPaths {
		skip[p] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if skip[r.URL.Path] {
				next.ServeHTTP(w, r)
				return
			}

			ip := getClientIP(r)

			if !rl.Allow(ip) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error":"rate limit exceeded"}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func getClientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}
