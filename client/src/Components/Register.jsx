// Register.jsx
import React, { Component } from 'react';
import axios from 'axios';
import {
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  VStack,
  InputGroup,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import { EditIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaUserPlus } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';
import { getGlobalKeyPair } from '../kyber/keyUtils';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      message: '',
      isInvalid: false,
      endpoint: 'http://localhost:3000/api/register',
      redirect: false,
      redirectTo: '/chat?u=',
      showPassword: false,
    };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value, isInvalid: false });
  };

  onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        this.state.endpoint,
        {
          username: this.state.username,
          password: this.state.password,
        },
        { withCredentials: true }
      );
      if (res.status) {
        // Generate the global key pair (only created once).
        const keyPair = await getGlobalKeyPair(false);
        // Convert the public key to a Base64 string.
        const publicKeyBase64 = btoa(String.fromCharCode(...keyPair.publicKey));
        // Send the Base64 public key to the backend for registration.
        await axios.post(
          'http://localhost:3000/api/register-public-key',
          {
            username: this.state.username,
            public_key: publicKeyBase64,
          },
          { withCredentials: true }
        );
        console.log('Public key registered successfully');
  
        // Redirect to chat page after registration.
        const redirectTo = this.state.redirectTo + this.state.username;
        this.setState({ redirect: true, redirectTo });
      } else {
        this.setState({ message: res.data.message, isInvalid: true });
      }
    } catch (error) {
      console.log('Registration error:', error);
      this.setState({ message: 'Something went wrong', isInvalid: true });
    }
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirectTo} replace={true} />;
    }
    return (
      <Box bgGradient="linear(to-br, purple.700, blue.600)" minH="100vh" py={20}>
        <Container maxW="md">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="center">
              <Icon as={FaUserPlus} w={10} h={10} color="yellow.300" />
              <Heading color="white">Create Your Account</Heading>
              <Text color="whiteAlpha.900">Join StreamX and start chatting today!</Text>
            </VStack>
            <Text textAlign="center" color="whiteAlpha.900" fontSize="sm">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#FFD700', fontWeight: '600' }}>
                Sign In
              </Link>
            </Text>
            <Box bg="white" borderRadius="xl" p={8} boxShadow="2xl">
              <form onSubmit={this.onSubmit}>
                <Stack spacing={6}>
                  <FormControl isInvalid={this.state.isInvalid}>
                    <FormLabel color="gray.700">Username</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      name="username"
                      value={this.state.username}
                      onChange={this.onChange}
                      bg="gray.100"
                      color="gray.800"
                      border="none"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{
                        borderColor: 'purple.400',
                        boxShadow: '0 0 0 1px #9F7AEA',
                      }}
                    />
                    {this.state.isInvalid && (
                      <FormErrorMessage>{this.state.message}</FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.700">Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={this.state.showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        name="password"
                        value={this.state.password}
                        onChange={this.onChange}
                        bg="gray.100"
                        color="gray.800"
                        border="none"
                        _placeholder={{ color: 'gray.500' }}
                        _focus={{
                          borderColor: 'purple.400',
                          boxShadow: '0 0 0 1px #9F7AEA',
                        }}
                      />
                      <InputRightElement width="3rem">
                        <Button
                          h="1.5rem"
                          size="sm"
                          onClick={this.togglePasswordVisibility}
                          bg="transparent"
                        >
                          {this.state.showPassword ? (
                            <ViewOffIcon color="gray.700" />
                          ) : (
                            <ViewIcon color="gray.700" />
                          )}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <Button
                    leftIcon={<EditIcon />}
                    colorScheme="purple"
                    variant="solid"
                    type="submit"
                    size="lg"
                    _hover={{ transform: 'scale(1.02)' }}
                  >
                    Register
                  </Button>
                </Stack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }
}

export default Register;
