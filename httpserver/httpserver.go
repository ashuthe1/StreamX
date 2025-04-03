package httpserver

import (
	"log"

	"github.com/ansrivas/fiberprometheus/v2"
	"github.com/ashuthe1/streamx/chatbot"
	"github.com/ashuthe1/streamx/handler"
	"github.com/ashuthe1/streamx/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func setupRoutes(app *fiber.App) {
	public := app.Group("/api")
	public.Post("/register", handler.SignupHandler)
	public.Post("/login", handler.LoginHandler)
	public.Post("/logout", handler.LogoutHandler)
	public.Post("/verify-contact", handler.VerifyContactHandler)
	// public.Post("/wv", handler.GetQueryDataFromWeaviate)
	public.Post("/hook", chatbot.WebhookHandler)
	// public.Post("/chatbot", chatbot.ChatbotHandler)

	protected := app.Group("/api", middleware.IsAuthenticate)
	protected.Get("/chat-history", handler.ChatHistoryHandler)
	protected.Get("/contact-list", handler.ContactHandler)
	protected.Get("/activities", handler.ActivityHandler)
	protected.Post("upload", handler.FileUploadHandler)

	// Public key endpoints
	protected.Post("/register-public-key", handler.RegisterPublicKeyHandler)
	protected.Get("/public-key", handler.GetPublicKeyHandler)

	protected.Get("/my-chat-history", handler.GetAllChatSentByMeWithMyKeyEncryptionHandler)
	protected.Post("/store-my-messages", handler.StoreMyMessagesHandler)
}

func StartHttpServer() {
	app := fiber.New()

	// Setup Prometheus for metrics collection
	prometheus := fiberprometheus.New("streamx-service")
	prometheus.RegisterAt(app, "/metrics")
	app.Use(prometheus.Middleware)

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://frontend:4000, http://localhost:4000, http://host.docker.internal:4000, http://34.93.63.218:4000, http://10.160.0.2:4000 ",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	port := "3000"
	setupRoutes(app)
	log.Println("Starting HTTP Server on port", port)
	app.Listen(":" + port)
}
