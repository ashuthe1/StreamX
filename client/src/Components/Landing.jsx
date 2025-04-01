import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  Stack,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaRobot, FaLock, FaFileAlt, FaComments } from 'react-icons/fa';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const FeatureCard = ({ title, text, icon }) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={8}
      shadow="lg"
      border="1px solid"
      borderColor="gray.200"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}
    >
      <VStack spacing={4} align="center">
        <Icon as={icon} boxSize={12} color="purple.500" />
        <Heading as="h3" size="md" textAlign="center" color="gray.800">
          {title}
        </Heading>
        <Text textAlign="center" color="gray.600">
          {text}
        </Text>
      </VStack>
    </Box>
  );
};

function Landing() {
  // Responsive grid columns: 1 column on small screens, 2 on larger screens.
  const gridColumns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Box bgGradient="linear(to-br, gray.900, purple.800)" minH="100vh">
      {/* Hero Section */}
      <Box py={20} textAlign="center">
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <Heading
              as="h1"
              size="2xl"
              fontWeight="extrabold"
              color="white"
              textShadow="2px 2px 4px rgba(0, 0, 0, 0.4)"
            >
              Welcome to <Text as="span" color="yellow.300">StreamX</Text>
            </Heading>
            <Text fontSize="xl" color="gray.200" maxW="2xl">
              Experience the next generation of communication with AI-powered chat, post-quantum security, and
              scalable real-time interactions.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Button
                as={Link}
                to="/register"
                size="lg"
                colorScheme="yellow"
                variant="solid"
                rightIcon={<ArrowForwardIcon />}
                _hover={{ transform: 'scale(1.05)' }}
              >
                Register
              </Button>
              <Button
                as={Link}
                to="/login"
                size="lg"
                variant="outline"
                colorScheme="yellow"
                _hover={{ transform: 'scale(1.05)' }}
              >
                Login
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={10}>
            <Heading as="h2" size="xl" textAlign="center" color="gray.800">
              Why Choose StreamX?
            </Heading>
            <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={10}>
              <FeatureCard
                icon={FaComments}
                title="Real-Time Chat"
                text="Experience lightning-fast conversations powered by a scalable architecture using Kafka and RabbitMQ."
              />
              <FeatureCard
                icon={FaLock}
                title="Post-Quantum Security"
                text="Leverage Kyber-Post Quantum Cryptography to secure your communications against future threats."
              />
              <FeatureCard
                icon={FaRobot}
                title="AI Chatbot & Semantic Search"
                text="Interact with our intelligent AI assistant that uses Dialogflow for intent detection, delivers LLM responses, supports weather queries and standard API calls, and features semantic search."
              />
              <FeatureCard
                icon={FaFileAlt}
                title="Secure File Sharing"
                text="Share your files seamlessly while ensuring data integrity with advanced encryption protocols."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box py={20} textAlign="center">
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <Heading as="h2" size="xl" color="white">
              Ready to Transform Your Communication?
            </Heading>
            <Text fontSize="lg" color="gray.200" maxW="2xl">
              Join hundreds of users who trust StreamX for secure, scalable, and intelligent communication solutions.
            </Text>
            <Button
              as={Link}
              to="/register"
              size="lg"
              colorScheme="yellow"
              variant="solid"
              rightIcon={<ArrowForwardIcon />}
              _hover={{ transform: 'scale(1.05)' }}
            >
              Get Started Today
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;
