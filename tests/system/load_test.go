// go run load_test.go -base http://localhost:3000/api -clients 100 -n 200

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"sync"
	"time"
)

var (
	baseURL    = flag.String("base", "http://localhost:3000/api", "base API URL")
	clients    = flag.Int("clients", 50, "number of concurrent clients")
	iterations = flag.Int("n", 100, "requests per client")
)

func main() {
	flag.Parse()
	var wg sync.WaitGroup
	client := &http.Client{Timeout: 5 * time.Second}

	endpoints := []struct {
		route string
		body  interface{}
	}{
		{"/register", map[string]string{"username": "loaduser", "password": "pw"}},
		{"/login", map[string]string{"username": "loaduser", "password": "pw"}},
		{"/hook", map[string]string{"msg": "hello load"}},
	}

	log.Printf("Starting load test: %d clients × %d iterations", *clients, *iterations)
	start := time.Now()

	for i := 0; i < *clients; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for j := 0; j < *iterations; j++ {
				for _, ep := range endpoints {
					callEndpoint(client, ep.route, ep.body)
				}
			}
		}(i)
	}

	wg.Wait()
	elapsed := time.Since(start)
	log.Printf("Load test completed in %s", elapsed)
}

func callEndpoint(client *http.Client, route string, body interface{}) {
	url := *baseURL + route
	b, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", url, bytes.NewReader(b))
	if err != nil {
		log.Printf("request error: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("error %s: %v", route, err)
		return
	}
	resp.Body.Close()
}
