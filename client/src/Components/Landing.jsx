import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Button, Container, Flex, Grid, Heading, Text, Stack, 
  Icon, VStack, HStack, useColorModeValue, Image
} from '@chakra-ui/react';
import { FaRobot, FaSearch, FaFileAlt, FaUserFriends } from 'react-icons/fa';
import { ArrowForwardIcon } from '@chakra-ui/icons';
// import animeGirlsBackground from '../assets/animeGirlsBackground.png'; // Import the image

const Feature = ({ title, text, icon }) => {
  return (
    <VStack 
      align="center" 
      spacing={4} 
      bg="whiteAlpha.100" 
      p={6} 
      borderRadius="lg" 
      border="2px solid black"  // Add black border
      transition="all 0.3s"
      boxShadow="0 20px 20px rgba(0, 0, 0, 0.4)"  // Enhanced box shadow
      _hover={{ transform: 'translateY(-10px)', boxShadow: '0 50px 50px rgba(0, 0, 0, 0.5)', cursor:'pointer' }}  // Enhanced hover effect
    >
      <Icon as={icon} w={10} h={10} color="purple.400" />
      <Text fontWeight="bold" fontSize="xl" textAlign="center" color="blackAlpha.900">{title}</Text>
      <Text textAlign="center" color="blackAlpha.900">{text}</Text>
    </VStack>
  );
};

function Landing() {
  const accentColor = 'purple.400';

  return (
    <Box bg="white" color="blackAlpha.900"> {/* Main container background color set to white and text color to black */}
      <Box 
        // backgroundImage={`url(${animeGirlsBackground})`}
        // backgroundPosition="center"
        // backgroundRepeat="no-repeat"
        // backgroundSize="cover"
      >
        <Box bg="rgba(47, 51, 73, 0.85)" py={20} minHeight="80vh" display="flex" alignItems="center">
          <Container maxW="container.xl">
            <VStack spacing={8} align="center" textAlign="center" color="white">
              <Heading as="h1" size="3xl" lineHeight="shorter" color="white">
                Welcome to <Text as="span" color={accentColor}>StreamX</Text>
              </Heading>
              <Text fontSize="xl" maxW="2xl">
                Experience the future of communication with our AI-powered chat platform. 
                Connect, share, and discover with unprecedented ease and intelligence.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={4}>
                <Button 
                  as={Link} 
                  to="/register" 
                  size="lg" 
                  colorScheme="purple" 
                  rightIcon={<ArrowForwardIcon />}
                >
                  Register
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  size="lg" 
                  variant="outline" 
                  colorScheme="purple"
                >
                  Login
                </Button>
              </Stack>
            </VStack>
          </Container>
        </Box>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="white"> {/* Features section background color set to white */}
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading as="h2" size="xl" textAlign="center" color="blackAlpha.900">
              Why Choose StreamX?
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
              <Feature 
                icon={FaUserFriends}
                title="Real-time Chat"
                text="Connect instantly with friends and colleagues through our lightning-fast chat system."
              />
              <Feature 
                icon={FaFileAlt}
                title="File Sharing"
                text="Share files effortlessly during your conversations, enhancing collaboration."
              />
              <Feature 
                icon={FaRobot}
                title="AI Chatbot"
                text="Get instant answers and assistance from our intelligent AI chatbot companion."
              />
              <Feature 
                icon={FaSearch}
                title="Semantic Search"
                text="Find past conversations and information with our powerful semantic search feature."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box bg="white" py={20}> {/* Call to action section background color set to white */}
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading as="h2" size="xl" color="blackAlpha.900">
              Ready to Transform Your Communication?
            </Heading>
            <Text fontSize="lg" maxW="2xl" color="blackAlpha.900">
              Join 100+ users already experiencing the power of StreamX.
              Start your journey to smarter, more efficient communication today.
            </Text>
            <Button 
              as={Link} 
              to="/register" 
              size="lg" 
              colorScheme="purple" 
              rightIcon={<ArrowForwardIcon />}
            >
              Start Your Stream Today
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;
