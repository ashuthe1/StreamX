/* File: src/Components/ProfilePage.jsx */
import React, { useState } from 'react';
import { Box, Avatar, Input, Button, VStack, Text } from '@chakra-ui/react';

const ProfilePage = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState(user.photoURL);

  const handleSave = () => {
    // TODO: call API to update profile
    localStorage.setItem('username', name);
    localStorage.setItem('photoURL', photo);
  };

  return (
    <Box p={8} maxW="md" mx="auto">
      <VStack spacing={4}>
        <Avatar size="2xl" src={photo} name={name} />
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Photo URL"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />
        <Button colorScheme="purple" onClick={handleSave}>
          Save Profile
        </Button>
      </VStack>
    </Box>
  );
};

export default ProfilePage;