package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shivansh/buddyup-backend/internal/models"
)

type AdminHandler struct {
	db *pgxpool.Pool
}

func NewAdminHandler(db *pgxpool.Pool) *AdminHandler {
	return &AdminHandler{db: db}
}

// AdminAuth middleware: checks X-Admin-Secret header
func AdminAuth() gin.HandlerFunc {
	secret := os.Getenv("ADMIN_SECRET")
	if secret == "" {
		if os.Getenv("GIN_MODE") == "release" {
			// In production, refuse to serve admin routes without an explicit secret.
			return func(c *gin.Context) {
				c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "admin endpoints disabled: ADMIN_SECRET not configured"})
			}
		}
		secret = "buddyup-admin-secret" // default dev-only secret
	}
	return func(c *gin.Context) {
		if c.GetHeader("X-Admin-Secret") != secret {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}

// POST /api/v1/admin/sponsored-groups
func (h *AdminHandler) CreateSponsoredGroup(c *gin.Context) {
	var req models.CreateSponsoredGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	days := req.ActiveDays
	if days <= 0 {
		days = 30
	}
	_, err := h.db.Exec(c.Request.Context(), `
		INSERT INTO sponsored_groups (group_id, sponsor_name, sponsor_logo_url, active_until)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (group_id) DO UPDATE SET sponsor_name=$2, sponsor_logo_url=$3, active_until=$4
	`, req.GroupID, req.SponsorName, req.SponsorLogoURL, time.Now().AddDate(0, 0, days))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "sponsored group created"})
}

// GET /api/v1/admin/reports
func (h *AdminHandler) ListReports(c *gin.Context) {
	rows, err := h.db.Query(c.Request.Context(), `
		SELECT r.id, r.reporter_id, r.reported_id, r.reason, COALESCE(r.details,''), r.created_at,
		       u.display_name
		FROM reports r
		JOIN users u ON u.id = r.reported_id
		ORDER BY r.created_at DESC
		LIMIT 100
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	type ReportRow struct {
		ID          string `json:"id"`
		ReporterID  string `json:"reporter_id"`
		ReportedID  string `json:"reported_id"`
		Reason      string `json:"reason"`
		Details     string `json:"details"`
		CreatedAt   string `json:"created_at"`
		DisplayName string `json:"display_name"`
	}
	var reports []ReportRow
	for rows.Next() {
		var rr ReportRow
		var createdAt interface{}
		if err := rows.Scan(&rr.ID, &rr.ReporterID, &rr.ReportedID, &rr.Reason, &rr.Details, &createdAt, &rr.DisplayName); err != nil {
			continue
		}
		if t, ok := createdAt.(interface{ String() string }); ok {
			rr.CreatedAt = t.String()
		}
		reports = append(reports, rr)
	}
	if reports == nil {
		reports = []ReportRow{}
	}
	c.JSON(http.StatusOK, gin.H{"reports": reports})
}
