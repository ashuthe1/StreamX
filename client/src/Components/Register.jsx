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
import './styles.css';

// Import our singleton key utility.
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
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register the user with the backend.
      const res = await axios.post(
        this.state.endpoint,
        {
          username: this.state.username,
          password: this.state.password,
        },
        { withCredentials: true }
      );
      console.log('register response', res);
      if (res.status) {
        // Generate the global key pair (only created once).
        const keyPair = await getGlobalKeyPair();
        console.log('Global key pair:', keyPair);
        
        // Convert private key (assumed Uint8Array) to a Base64 string.
        const privateKeyBase64 = btoa(String.fromCharCode(...keyPair.privateKey));
        // Store the private key in localStorage for later decryption use.
        localStorage.setItem('privateKey', privateKeyBase64);
        
        // Convert the public key to a Base64 string.
        const publicKeyBase64 = btoa(String.fromCharCode(...keyPair.publicKey));
        // Also store the public key locally.
        localStorage.setItem('publicKey', publicKeyBase64);
        
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
      <Box bg="white" minH="100vh" py={20}>
        <Container maxW="md">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} align="center">
              <Icon as={FaUserPlus} w={10} h={10} color="purple.400" />
              <Heading color="black">Create Your Account</Heading>
              <Text color="black">Join StreamX and start chatting today!</Text>
            </VStack>
            <p className="text-center md:text-left text-sm">
              Already have an account?{" "}
              <Link to={"/login"} className="text-primary font-semibold">
                Sign In
              </Link>
            </p>
            <Box bg="white" borderRadius="xl" p={8} boxShadow="xl">
              <form onSubmit={this.onSubmit}>
                <Stack spacing={6}>
                  <FormControl isInvalid={this.state.isInvalid}>
                    <FormLabel color="black">Username</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter your username (no special char)"
                      name="username"
                      value={this.state.username}
                      onChange={this.onChange}
                      bg="gray.100"
                      color="black"
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
                    <FormLabel color="black">Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={this.state.showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        name="password"
                        value={this.state.password}
                        onChange={this.onChange}
                        bg="gray.100"
                        color="black"
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
                            <ViewOffIcon color="black" />
                          ) : (
                            <ViewIcon color="black" />
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
