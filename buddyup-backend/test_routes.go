package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	baseURL := "http://localhost:8080/api/v1"

	loginPayload := map[string]interface{}{
		"email":    "testuser@buddyup.local",
		"password": "password123",
	}
	loginBytes, _ := json.Marshal(loginPayload)
	resp2, _ := http.Post(baseURL+"/auth/login", "application/json", bytes.NewBuffer(loginBytes))
	defer resp2.Body.Close()
	body2, _ := io.ReadAll(resp2.Body)

	var loginResp map[string]interface{}
	json.Unmarshal(body2, &loginResp)
	token, ok := loginResp["token"].(string)
	if !ok {
		fmt.Println("No token in response, stopping.")
		return
	}

	endpoints := []string{
		"/me",
		"/matches",
		"/discover",
		"/likes/me",
		"/groups",
		"/me/groups",
		"/posts",
		"/me/posts",
		"/events",
		"/me/events",
		"/me/blocked",
		"/me/super-connects",
		"/me/xp",
		"/leaderboard",
		"/challenges",
		"/me/personas",
		"/me/subscription",
		"/me/boost",
	}

	for _, ep := range endpoints {
		req, _ := http.NewRequest("GET", baseURL+ep, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Printf("%s: ERROR %v\n", ep, err)
			continue
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		fmt.Printf("%s: %d\n", ep, resp.StatusCode)
		if resp.StatusCode == 500 {
			fmt.Printf("   -> %s\n", string(body))
		}
	}
}
