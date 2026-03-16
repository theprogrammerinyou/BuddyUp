package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorHandler recovers from panics and returns a structured JSON error response.
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("panic recovered: %v", r)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "an unexpected error occurred",
					"code":  "INTERNAL_ERROR",
				})
			}
		}()
		c.Next()
	}
}
