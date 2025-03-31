# StreamX

This is scalable chat website built using Golang, designed to provide real-time messaging, file sharing, semantic search, and AI chatbot functionalities.


## Architecture

## Chat Interface


## Features

- **Real-time Messaging**: Powered by Golang on the backend, with Redis and RabbitMQ as the messaging queue, ensuring efficient pub/sub messaging.
- **Frontend**: Built with React, providing a responsive and interactive user interface.
- **Database**: PostgreSQL is used as the primary database for storing chat messages and user data.
- **Message Persistence**: Kafka is used for writing messages to the database, ensuring reliable and scalable message persistence.
- **Semantic Search**: Weaviate is integrated to enable semantic search in chat history, enhancing user experience.
- **File Sharing**: AWS Go SDK is used to enable file sharing between users using S3 buckets.
- **AI Chatbot**: Integrated with Dialogflow and Gemini to provide AI-driven chat functionalities.
- **Monitoring**: Prometheus and Grafana are used for monitoring and visualizing metrics.
- **Reverse Proxy**: Caddy is used as a reverse proxy to forward incoming requests to different services.

## Technologies Used

- **Backend**: Golang, Fiber framework
- **Frontend**: React, Chakra UI
- **Database**: PostgreSQL, Redis (will add caching later)
- **Message Queue**: RabbitMQ
- **Message Persistence**: Kafka
- **Semantic Search**: Weaviate
- **File Storage**: AWS S3 (using their Go SDK)
- **AI Chatbot**: Dialogflow ((using their Go SDK), Gemini
- **Containerization**: Docker Compose
- **Deployment**: Google Cloud Platform (GCP)
- **Monitoring**: Prometheus, Grafana
- **Reverse Proxy**: Caddy

## Grafana dashboard


#### More features will be added soon. All contributions are welcome :)

rm -rf ~/data/postgresdata
docker-compose down
docker-compose up --build