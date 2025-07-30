// Header.jsx
import React, { useState } from 'react';
import { ChatIcon, SettingsIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
// Add missing Text import:
import { Box, Heading, Center, Flex, Avatar, Menu, MenuButton, MenuList, MenuItem, IconButton, Text } from '@chakra-ui/react';

function Header() {
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com" });
  const navigate = useNavigate();

  return (
    <Box paddingBottom={5} bg="gray.800" px={6} py={3} boxShadow="md">
      <Flex justify="space-between" align="center">
        <Center>
          <Link to="/">
            <Heading size="xl" color="purple.400">
              <Flex align="center">
                <ChatIcon mr={2} /> StreamX
              </Flex>
            </Heading>
          </Link>
        </Center>
        
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User profile"
            variant="ghost"
            rounded="full"
            _hover={{ bg: "gray.700" }}
            _focus={{ boxShadow: "outline" }}
          >
            <Flex align="center">
              <Avatar name={user.name} size="sm" mr={2} />
              <Text color="white" fontWeight="medium">{user.name}</Text>
            </Flex>
          </MenuButton>
          <MenuList bg="gray.700" borderColor="gray.600">
            <MenuItem 
              icon={<FaCog />} 
              bg="gray.700" 
              _hover={{ bg: "gray.600" }}
              onClick={() => navigate('/settings')}  // Fixed navigation
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<FaCog />} 
              bg="gray.700" 
              _hover={{ bg: "gray.600" }}
              onClick={() => navigate('/settings')}
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<FaSignOutAlt />} 
              bg="gray.700" 
              _hover={{ bg: "gray.600" }}
              onClick={() => navigate('/login')}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}

export default Header;