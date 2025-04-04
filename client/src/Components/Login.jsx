// Login.jsx
import React, { Component } from 'react';
import axios from 'axios';
import {
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Box,
  Input,
  Stack,
  Button,
  Heading,
} from '@chakra-ui/react';
import { Link, Navigate } from 'react-router-dom';
import { EditIcon } from '@chakra-ui/icons';
import { getGlobalKeyPair } from '../kyber/keyUtils';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      message: '',
      isInvalid: false,
      endpoint: process.env.REACT_APP_API_URL,
      redirect: false,
      redirectTo: '/chat?u=',
    };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value, isInvalid: false });
  };

  onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${this.state.endpoint}/login`,
        {
          username: this.state.username,
          password: this.state.password,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        // Generate the global key pair (only created once).
        const keyPair = await getGlobalKeyPair(false);
        // Convert the public key to a Base64 string.
        const publicKeyBase64 = btoa(String.fromCharCode(...keyPair.publicKey));
        // Send the Base64 public key to the backend for registration.
        await axios.post(
          `${this.state.endpoint}/register-public-key`,
          {
            username: this.state.username,
            public_key: publicKeyBase64,
          },
          { withCredentials: true }
        );
        console.log('Public key registered successfully');
  
        // Redirect to chat page after login.
        const redirectTo = this.state.redirectTo + this.state.username;
        this.setState({ redirect: true, redirectTo });
      } else {
        this.setState({ message: res.data.message, isInvalid: true });
      }
    } catch (error) {
      console.log('Login error:', error);
      this.setState({ message: 'Something went wrong', isInvalid: true });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirectTo} replace={true} />;
    }
    return (
      <Box bgGradient="linear(to-br, purple.700, blue.600)" minH="100vh" py={20}>
        <Container maxW="md" centerContent>
          <Text mb={4} color="whiteAlpha.900" fontSize="sm">
            New to StreamX?{' '}
            <Link to="/register" style={{ color: '#FFD700', fontWeight: '600' }}>
              Create an account
            </Link>
          </Text>
          <Box
            borderRadius="lg"
            p={{ base: 6, md: 10 }}
            borderWidth="1px"
            bg="white"
            color="gray.800"
            boxShadow="2xl"
            w="100%"
          >
            <Heading mb={6} color="gray.700">
              Login to StreamX
            </Heading>
            <form onSubmit={this.onSubmit}>
              <Stack spacing={5}>
                <FormControl isInvalid={this.state.isInvalid}>
                  <FormLabel color="gray.700">Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={this.state.username}
                    onChange={this.onChange}
                    bg="gray.100"
                    color="gray.800"
                    border="none"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </FormControl>
                <FormControl isInvalid={this.state.isInvalid}>
                  <FormLabel color="gray.700">Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChange}
                    bg="gray.100"
                    color="gray.800"
                    border="none"
                    _placeholder={{ color: 'gray.500' }}
                  />
                  {this.state.isInvalid && (
                    <FormErrorMessage color="red.500">
                      Invalid username or password
                    </FormErrorMessage>
                  )}
                </FormControl>
                <Button
                  size="lg"
                  leftIcon={<EditIcon />}
                  colorScheme="purple"
                  variant="solid"
                  type="submit"
                  boxShadow="md"
                  _hover={{ boxShadow: 'xl', transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                >
                  Login
                </Button>
              </Stack>
            </form>
            <Box pt={3}>
              <Text as="i" fontSize="lg" color="red.500">
                {this.state.message}
              </Text>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default Login;
