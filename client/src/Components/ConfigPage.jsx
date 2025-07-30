// ConfigPage.jsx
import React, { useState } from 'react';
import {
  Box, Text, VStack, Container, Button, Collapse, useDisclosure,
  Flex, Avatar, FormControl, FormLabel, Input, Stack, useToast,
  Tabs, TabList, Tab, TabPanels, TabPanel, Heading, Icon, Divider
} from '@chakra-ui/react';
import { FaUser, FaKey, FaSave, FaUpload, FaDownload } from 'react-icons/fa';
import {
  loadKeysFromFile,
  genereateNewKeysAndSaveToFile,
  base64ToArray,
  saveKeysToFile,
} from '../kyber/keyUtils';

const KeyDisplay = ({ label, keyData }) => {
  const { isOpen, onToggle } = useDisclosure();
  const truncated = keyData.slice(0, 20) + '...';

  return (
    <Box
      p={4}
      bg="gray.800"
      borderRadius="md"
      boxShadow="md"
      _hover={{ bg: 'gray.700', cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Flex align="center">
        <Icon as={FaKey} mr={2} />
        <Text fontSize="lg" fontWeight="bold" color="white">
          {label}
        </Text>
      </Flex>
      <Collapse startingHeight={20} in={isOpen}>
        <Text mt={2} fontFamily="monospace" color="gray.200" wordBreak="break-all">
          {keyData}
        </Text>
      </Collapse>
      {!isOpen && (
        <Text mt={2} fontFamily="monospace" color="gray.400">
          {truncated}
        </Text>
      )}
    </Box>
  );
};

const ConfigPage = ({ username }) => {
  const storedPrivateKeyBase64 = localStorage.getItem("privateKey") || "";
  const storedPublicKeyBase64 = localStorage.getItem("publicKey") || "";
  const privateKey = storedPrivateKeyBase64 ? base64ToArray(storedPrivateKeyBase64).toString() : "No data";
  const publicKey = storedPublicKeyBase64 ? base64ToArray(storedPublicKeyBase64).toString() : "No data";
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState(username);
  const [email, setEmail] = useState("user@example.com");
  const toast = useToast();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    toast({
      title: 'Profile updated.',
      description: "Your profile has been updated.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={8} bgGradient="linear(to-b, gray.900, purple.900)" minHeight="100vh">
      <Container maxW="container.lg">
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab _selected={{ color: 'white', bg: 'purple.600' }}>
              <Icon as={FaUser} mr={2} /> Profile
            </Tab>
            <Tab _selected={{ color: 'white', bg: 'purple.600' }}>
              <Icon as={FaKey} mr={2} /> Security
            </Tab>
          </TabList>
          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="xl" color="white" mb={6}>
                  Profile Settings
                </Heading>
                
                <Stack direction={['column', 'row']} spacing={8}>
                  <Box flexShrink={0}>
                    <Avatar size="2xl" src={profilePic} name={name} mb={4} />
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        display="none"
                        id="profile-pic-upload"
                      />
                      <Button
                        as="label"
                        htmlFor="profile-pic-upload"
                        colorScheme="purple"
                        variant="outline"
                        w="full"
                      >
                        Change Photo
                      </Button>
                    </FormControl>
                  </Box>
                  
                  <Box flex="1">
                    <FormControl mb={4}>
                      <FormLabel color="gray.300">Name</FormLabel>
                      <Input
                        bg="gray.800"
                        borderColor="gray.700"
                        color="white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl mb={4}>
                      <FormLabel color="gray.300">Email</FormLabel>
                      <Input
                        bg="gray.800"
                        borderColor="gray.700"
                        color="white"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl mb={6}>
                      <FormLabel color="gray.300">Status</FormLabel>
                      <Input
                        bg="gray.800"
                        borderColor="gray.700"
                        color="white"
                        placeholder="What's on your mind?"
                      />
                    </FormControl>
                    
                    <Button 
                      colorScheme="purple" 
                      leftIcon={<FaSave />}
                      onClick={handleSubmit}
                    >
                      Save Profile
                    </Button>
                  </Box>
                </Stack>
              </VStack>
            </TabPanel>
            
            {/* Security Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="xl" color="white" mb={6}>
                  Security Settings
                </Heading>
                
                <KeyDisplay label="Private Key" keyData={privateKey} />
                <KeyDisplay label="Public Key" keyData={publicKey} />
                
                <Divider borderColor="gray.700" my={6} />
                
                <Flex gap={4} justify="center" flexWrap="wrap">
                  <Button
                    onClick={handleSaveCurrentConfig}
                    colorScheme="purple"
                    leftIcon={<FaSave />}
                  >
                    Save Current Config
                  </Button>
                  <Button
                    onClick={loadKeysFromFile}
                    colorScheme="blue"
                    leftIcon={<FaUpload />}
                  >
                    Load Config
                  </Button>
                  <Button
                    onClick={genereateNewKeysAndSaveToFile}
                    colorScheme="teal"
                    leftIcon={<FaDownload />}
                  >
                    Generate New Config
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default ConfigPage;