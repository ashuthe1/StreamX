// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Container, Flex, Box, ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import Header from './Components/Header';
import Landing from './Components/Landing';
import Register from './Components/Register';
import Login from './Components/Login';
import Chat from './Components/Chat/Chat';
import Footer from './Components/Footer';
import Settings from './Components/Settings'; // Create this component
import AuthenticatedLayout from './AuthenticatedLayout'

function MainLayout({ children }) {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Public routes without Header */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Authenticated routes with Header */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}


export default App;