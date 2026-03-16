package middleware

import (
	"strings"
)

// Basic profanity word list – extend as needed
var badWords = []string{
	"fuck", "shit", "asshole", "bastard", "bitch", "cunt", "damn", "dick",
	"piss", "cock", "whore", "slut", "fag", "nigger", "retard",
}

// FilterProfanity replaces bad words with asterisks
func FilterProfanity(text string) string {
	result := text
	lower := strings.ToLower(text)

	for _, word := range badWords {
		idx := strings.Index(lower, word)
		for idx != -1 {
			replacement := strings.Repeat("*", len(word))
			result = result[:idx] + replacement + result[idx+len(word):]
			lower = lower[:idx] + replacement + lower[idx+len(word):]
			idx = strings.Index(lower, word)
		}
	}
	return result
}

// ContainsProfanity returns true if the text has bad words
func ContainsProfanity(text string) bool {
	lower := strings.ToLower(text)
	for _, word := range badWords {
		if strings.Contains(lower, word) {
			return true
		}
	}
	return false
}
