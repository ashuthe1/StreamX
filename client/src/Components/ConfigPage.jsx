import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Container,
  Button,
  Collapse,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import {
  loadKeysFromFile,
  genereateNewKeysAndSaveToFile,
  base64ToArray,
  saveKeysToFile,
} from '../kyber/keyUtils';

const handleSaveCurrentConfig = () => {
  const storedPrivateKeyBase64 = localStorage.getItem("privateKey");
  const storedPublicKeyBase64 = localStorage.getItem("publicKey");

  const privateKey = base64ToArray(storedPrivateKeyBase64);
  const publicKey = base64ToArray(storedPublicKeyBase64);

  const keyPair = {
    publicKey: publicKey,
    privateKey: privateKey,
  };

  console.log("Current Config: ", keyPair);
  saveKeysToFile(keyPair);
};

const KeyDisplay = ({ label, keyData }) => {
  const { isOpen, onToggle } = useDisclosure();
  const truncated = keyData.slice(0, 20) + '...'; // show only first 20 characters

  return (
    <Box
      p={4}
      bg="gray.800"
      borderRadius="md"
      boxShadow="md"
      _hover={{ bg: 'gray.700', cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Text fontSize="lg" fontWeight="bold" color="white">
        {label}
      </Text>
      <Collapse startingHeight={20} in={isOpen}>
        <Text mt={2} fontFamily="monospace" color="gray.200">
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
  // Fetch key data from localStorage and convert them from base64
  const storedPrivateKeyBase64 = localStorage.getItem("privateKey") || "";
  const storedPublicKeyBase64 = localStorage.getItem("publicKey") || "";
  const privateKey = storedPrivateKeyBase64 ? base64ToArray(storedPrivateKeyBase64).toString() : "No data";
  const publicKey = storedPublicKeyBase64 ? base64ToArray(storedPublicKeyBase64).toString() : "No data";

  return (
    <Box p={8} bgGradient="linear(to-br, gray.900, purple.900)" minHeight="100vh">
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="extrabold" color="white">
              Configuration Dashboard
            </Text>
            {username && (
              <Text fontSize="lg" color="gray.300">
                Here are your current Kyber configurations :)
              </Text>
            )}
          </Box>

          <KeyDisplay label="Private Key" keyData={privateKey} />
          <KeyDisplay label="Public Key" keyData={publicKey} />

          <Flex mt={4} gap={4} justify="center" flexWrap="wrap">
            <Button
              onClick={handleSaveCurrentConfig}
              bgGradient="linear(to-r, teal.400, blue.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'scale(1.05)' }}
              shadow="md"
            >
              Save Current Config
            </Button>
            <Button
              onClick={loadKeysFromFile}
              bgGradient="linear(to-r, orange.400, red.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, orange.500, red.600)', transform: 'scale(1.05)' }}
              shadow="md"
            >
              Load Config
            </Button>
            <Button
              onClick={genereateNewKeysAndSaveToFile}
              bgGradient="linear(to-r, pink.400, purple.500)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, pink.500, purple.600)', transform: 'scale(1.05)' }}
              shadow="md"
            >
              Generate & Save New Config
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default ConfigPage;
