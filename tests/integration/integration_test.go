package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/ashuthe1/streamx/chatbot"
	"github.com/ashuthe1/streamx/handler"
	"github.com/ashuthe1/streamx/middleware"
	"github.com/gofiber/fiber/v2"
)

const baseAPI = "/api"

func postJSON(app *fiber.App, route string, body interface{}) (*http.Response, error) {
	b, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	httpReq, _ := http.NewRequest("POST", baseAPI+route, bytes.NewReader(b))
	httpReq.Header.Set("Content-Type", "application/json")
	return app.Test(httpReq)
}

func setupApp() *fiber.App {
	app := fiber.New()
	public := app.Group("/api")
	public.Post("/register", handler.SignupHandler)
	public.Post("/login", handler.LoginHandler)
	public.Post("/logout", handler.LogoutHandler)
	public.Post("/verify-contact", handler.VerifyContactHandler)
	protected := app.Group("/api", middleware.IsAuthenticate)
	protected.Get("/chat-history", handler.ChatHistoryHandler)
	protected.Get("/contact-list", handler.ContactHandler)
	protected.Get("/activities", handler.ActivityHandler)
	protected.Post("/upload", handler.FileUploadHandler)
	protected.Post("/register-public-key", handler.RegisterPublicKeyHandler)
	protected.Get("/public-key", handler.GetPublicKeyHandler)
	protected.Get("/my-chat-history", handler.GetAllChatSentByMeWithMyKeyEncryptionHandler)
	protected.Post("/store-my-messages", handler.StoreMyMessagesHandler)
	app2 := fiber.New()
	app2.Use(middleware.IsAuthenticate)
	app2.Post(baseAPI+"/hook", chatbot.WebhookHandler)
	return app
}

func TestValidRegistration(t *testing.T) {
	app := setupApp()
	resp, err := postJSON(app, "/register", map[string]string{"username": "u1", "password": "p1"})
	if err != nil || resp.StatusCode != 201 {
		t.Errorf("got %v %d", err, resp.StatusCode)
	}
}

func TestMissingUsernameOnRegister(t *testing.T) {
	app := setupApp()
	resp, err := postJSON(app, "/register", map[string]string{"password": "p1"})
	if err != nil || resp.StatusCode == 201 {
		t.Errorf("unexpected %v %d", err, resp.StatusCode)
	}
}

func TestMissingPasswordOnRegister(t *testing.T) {
	app := setupApp()
	resp, err := postJSON(app, "/register", map[string]string{"username": "u1"})
	if err != nil || resp.StatusCode == 201 {
		t.Errorf("unexpected %v %d", err, resp.StatusCode)
	}
}

func TestEmptyBodyOnRegister(t *testing.T) {
	app := setupApp()
	req, _ := http.NewRequest("POST", baseAPI+"/register", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req)
	if resp.StatusCode == 201 {
		t.Errorf("unexpected %d", resp.StatusCode)
	}
}

func TestValidLogin(t *testing.T) {
	app := setupApp()
	postJSON(app, "/register", map[string]string{"username": "u2", "password": "p2"})
	resp, err := postJSON(app, "/login", map[string]string{"username": "u2", "password": "p2"})
	if err != nil || resp.StatusCode != 200 {
		t.Errorf("got %v %d", err, resp.StatusCode)
	}
}

func TestMissingUsernameOnLogin(t *testing.T) {
	app := setupApp()
	resp, err := postJSON(app, "/login", map[string]string{"password": "p2"})
	if err != nil || resp.StatusCode == 200 {
		t.Errorf("unexpected %v %d", err, resp.StatusCode)
	}
}

func TestMissingPasswordOnLogin(t *testing.T) {
	app := setupApp()
	resp, err := postJSON(app, "/login", map[string]string{"username": "u2"})
	if err != nil || resp.StatusCode == 200 {
		t.Errorf("unexpected %v %d", err, resp.StatusCode)
	}
}

func TestInvalidJSONOnLogin(t *testing.T) {
	app := setupApp()
	req, _ := http.NewRequest("POST", baseAPI+"/login", bytes.NewReader([]byte(`}{`)))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req)
	if resp.StatusCode == 200 {
		t.Errorf("unexpected %d", resp.StatusCode)
	}
}

func TestUnauthorizedChatHistory(t *testing.T) {
	app := setupApp()
	req, _ := http.NewRequest("GET", baseAPI+"/chat-history", nil)
	resp, _ := app.Test(req)
	if resp.StatusCode != 401 {
		t.Errorf("got %d", resp.StatusCode)
	}
}

func TestUnauthorizedHook(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.IsAuthenticate)
	app.Post(baseAPI+"/hook", chatbot.WebhookHandler)
	req, _ := http.NewRequest("POST", baseAPI+"/hook", bytes.NewReader([]byte(`{"msg":"hi"}`)))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req)
	if resp.StatusCode != 401 {
		t.Errorf("got %d", resp.StatusCode)
	}
}

func TestRegisterLoginHistoryFlow(t *testing.T) {
	app := setupApp()
	postJSON(app, "/register", map[string]string{"username": "u3", "password": "p3"})
	loginResp, _ := postJSON(app, "/login", map[string]string{"username": "u3", "password": "p3"})
	if loginResp.StatusCode != 200 {
		t.Fatalf("login failed %d", loginResp.StatusCode)
	}
	req, _ := http.NewRequest("GET", baseAPI+"/chat-history", nil)
	req.Header.Set("Authorization", loginResp.Header.Get("Authorization"))
	resp, _ := app.Test(req)
	if resp.StatusCode != 200 {
		t.Errorf("history %d", resp.StatusCode)
	}
}
