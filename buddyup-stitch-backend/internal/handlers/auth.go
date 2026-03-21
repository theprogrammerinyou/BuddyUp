package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"buddyup-stitch-backend/internal/db"
	"buddyup-stitch-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// jwtSecret is set at startup via InitJWTSecret. It must be non-empty before
// any auth handler is called.
var jwtSecret []byte

// InitJWTSecret reads JWT_SECRET from the environment and stores it for use by
// auth handlers. It returns an error if the variable is unset or empty so that
// callers (main) can abort startup rather than silently use a weak default.
func InitJWTSecret() error {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		return fmt.Errorf("JWT_SECRET environment variable must be set")
	}
	jwtSecret = []byte(s)
	return nil
}

func generateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		// JWT spec requires sub to be a string; storing as uint causes
		// MapClaims.GetSubject() to fail on validation (expects string type).
		"sub": fmt.Sprintf("%d", userID),
		"exp": time.Now().Add(30 * 24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates a JWT string and returns the user ID.
func ValidateToken(tokenStr string) (uint, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid claims")
	}
	sub, err := claims.GetSubject()
	if err != nil {
		return 0, err
	}
	var id uint
	fmt.Sscanf(sub, "%d", &id)
	return id, nil
}

// POST /auth/register
func Register(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existing models.User
	if err := db.DB.Where("email = ?", strings.ToLower(input.Email)).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Name:         input.Name,
		Email:        strings.ToLower(input.Email),
		PasswordHash: string(hash),
		Provider:     "local",
		IsOnline:     true,
		AvatarURL:    fmt.Sprintf("https://i.pravatar.cc/150?u=%s", input.Email),
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, _ := generateToken(user.ID)
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

// POST /auth/login
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := db.DB.Where("email = ? AND provider = 'local'", strings.ToLower(input.Email)).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Mark online
	db.DB.Model(&user).Update("is_online", true)

	token, _ := generateToken(user.ID)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

// POST /auth/google  — accepts a Google ID token from the app
func GoogleAuth(c *gin.Context) {
	var input struct {
		IDToken string `json:"id_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify with Google tokeninfo endpoint
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + input.IDToken)
	if err != nil || resp.StatusCode != 200 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var info struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
		EmailVerified string `json:"email_verified"`
	}
	if err := json.Unmarshal(body, &info); err != nil || info.Sub == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token payload"})
		return
	}

	// Upsert user
	var user models.User
	result := db.DB.Where("provider = 'google' AND provider_id = ?", info.Sub).First(&user)
	if result.Error != nil {
		// Try by email
		if db.DB.Where("email = ?", info.Email).First(&user).Error != nil {
			user = models.User{
				Name:       info.Name,
				Email:      info.Email,
				AvatarURL:  info.Picture,
				Provider:   "google",
				ProviderID: info.Sub,
				IsOnline:   true,
			}
			db.DB.Create(&user)
		} else {
			db.DB.Model(&user).Updates(map[string]interface{}{"provider": "google", "provider_id": info.Sub, "is_online": true})
		}
	} else {
		db.DB.Model(&user).Update("is_online", true)
	}

	token, _ := generateToken(user.ID)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

// POST /auth/apple — accepts an Apple identity token
func AppleAuth(c *gin.Context) {
	var input struct {
		IDToken string `json:"id_token" binding:"required"`
		Name    string `json:"name"`
		Email   string `json:"email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse the JWT (Apple uses RS256 — for full verification you'd fetch Apple's public keys.
	// For now we parse claims without signature verification for the prototype.)
	parts := strings.Split(input.IDToken, ".")
	if len(parts) != 3 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Apple token format"})
		return
	}
	payload, err := jwt.NewParser().ParseWithClaims(input.IDToken, &jwt.MapClaims{}, func(t *jwt.Token) (interface{}, error) {
		// Return a dummy key — we skip full RS256 validation in prototype
		return []byte(""), nil
	})
	_ = payload
	_ = err

	// We trust the email/name from the client for MVP (Apple sends them only on first sign-in)
	if input.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email required for Apple sign in"})
		return
	}

	var user models.User
	if db.DB.Where("email = ?", input.Email).First(&user).Error != nil {
		user = models.User{
			Name:      input.Name,
			Email:     input.Email,
			AvatarURL: fmt.Sprintf("https://i.pravatar.cc/150?u=%s", input.Email),
			Provider:  "apple",
			IsOnline:  true,
		}
		db.DB.Create(&user)
	} else {
		db.DB.Model(&user).Update("is_online", true)
	}

	token, _ := generateToken(user.ID)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

// GET /auth/me  — requires valid JWT in Authorization header
func GetMe(c *gin.Context) {
	userID := c.GetUint("userID")
	var user models.User
	if err := db.DB.Preload("Interests").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}
