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
} from '@chakra-ui/react';
import { Link, Navigate } from 'react-router-dom';
import { EditIcon } from '@chakra-ui/icons';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      message: '',
      isInvalid: false,
      endpoint: 'http://localhost:3000/api/login',
      redirect: false,
      redirectTo: '/chat?u=',
    };
  }

  // On change of input, set the value to the message state
  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
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

      console.log('login response ', res);
      if (res.status === 200) {
        const redirectTo = this.state.redirectTo + this.state.username;
        this.setState({ redirect: true, redirectTo });
      } else {
        // on failed
        this.setState({ message: res.data.message, isInvalid: true });
      }
    } catch (error) {
      console.log(error);
      this.setState({ message: 'something went wrong', isInvalid: true });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirectTo} replace={true} />;
    }

    return (
      <Container
        marginBlockStart={{ base: 5, md: 10 }}
        textAlign="center"
        maxW={{ base: '90%', sm: 'sm' }}
        padding={4}
      >
        <p className="text-center md:text-left text-sm">
          New to StreamX?{' '}
          <Link to={'/register'} className="text-primary font-semibold">
            Create an account
          </Link>
        </p>
        <Box
          borderRadius="lg"
          p={{ base: 6, md: 10 }}
          borderWidth="2px"
          bg="white" // Background color set to white
          color="black" // Text color set to black
          boxShadow="lg"
        >
          <form onSubmit={this.onSubmit}>
            <Stack spacing={5}>
              <FormControl isInvalid={this.state.isInvalid}>
                <FormLabel color="black">Username</FormLabel> {/* Text color set to black */}
                <Input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={this.state.username}
                  onChange={this.onChange}
                  bg="gray.100" // Input background color set to light gray
                  color="black" // Text color set to black
                  border="none"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
              <FormControl isInvalid={this.state.isInvalid}>
                <FormLabel color="black">Password</FormLabel> {/* Text color set to black */}
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  bg="gray.100" // Input background color set to light gray
                  color="black" // Text color set to black
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
                _hover={{ boxShadow: 'xl' }}
                transition="box-shadow 0.2s"
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
    );
  }
}

export default Login;
