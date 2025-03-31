// Chat.jsx
import React, { Component } from 'react';
import axios from 'axios';
import SearchBar from '../Searchbar';
import SocketConnection from '../../socket-connection';
import ActivityPage from '../Activitypage';

import {
  Box,
  Button,
  Flex,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  TabPanel,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import ChatHistory from './ChatHistory';
import ContactList from './ContactList';

// Import the Kyber crypto module and our singleton utility.
import * as KyberCrypto from '../../kyber/kyberCrypto';
import { getGlobalKeyPair } from '../../kyber/keyUtils';
class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socketConn: '',
      username: '',
      message: '',
      to: '',
      endpoint: 'http://localhost:3000/api',
      contacts: [],
      renderContactList: [],
      chats: [],
      chatHistory: [],
      activities: [],
      searchResults: [],
      isSearchModalOpen: false,
      selectedContact: '',
      // Stores the current user's Kyber key pair and its instance.
      kyberKeyPair: null,
    };
  }

  componentDidMount = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const user = queryParams.get('u');
    this.setState({ username: user });
    this.getContacts(user); // Retrieve user contacts

    // Initialize and connect the socket connection.
    const conn = new SocketConnection();
    await this.setState({ socketConn: conn });

    // Use the singleton utility to get the global key pair.
    const keyPair = await getGlobalKeyPair();
    // Update the backend with your public key so that others can fetch your current key.
    const publicKeyBase64 = btoa(String.fromCharCode(...keyPair.publicKey));
    await axios.post(
      `${this.state.endpoint}/register-public-key`,
      { username: user, public_key: publicKeyBase64 },
      { withCredentials: true }
    );
    console.log('Using global key pair: ', keyPair);
    console.log('KyberPublicKey: ', keyPair.publicKey);
    console.log('KyberPrivateKey: ', keyPair.privateKey);
    this.setState({ kyberKeyPair: keyPair });

    // Set up the socket message handler.
    this.state.socketConn.connect(async message => {
      const msg = JSON.parse(message.data);
      
      if (msg.type == 'activity') {
        this.setState(prevState => ({
          activities: [msg, ...prevState.activities],
        }));
      } else {
          if (
            this.state.username === msg.to
          ) {
            console.log('Ashutosh: Received message: ', msg);
          // update UI only when message is between from and to
          var chatsArr = []
          var singleMsg = {
            from: msg.from,
            to: msg.to,
            encapsulated_key: msg.encapsulated_key,
            encrypted_message: msg.encrypted_message,
            iv: msg.iv,
            timestamp: msg.timestamp,
            id: msg.id,
            decryptedMessage: '',
          };
          console.log('ConstructedSingleMsg: ', singleMsg);
          chatsArr.push(singleMsg);
          console.log('ConstructedChatsArr: ', chatsArr);
          const processedChatMessage = await this.processChats(
            chatsArr,
            this.state.kyberKeyPair.privateKey,
            this.state.kyberKeyPair.kemInstance
          );
          console.log('ProcessedChatMessage: ', processedChatMessage);
          var allChats = [...this.state.chats, processedChatMessage[0]];
          console.log("AllChats: ", allChats);
          this.setState({ chats: allChats });
          this.renderChatHistory(this.state.username, allChats);
        }
      }
    });

    // Signal connection to the socket server.
    this.state.socketConn.connected(user);

    // Fetch initial activities.
    this.fetchInitialActivities();
  };

  handleSearchResults = response => {
    const results = response.result.data.Get.Users;
    this.setState({ searchResults: results, isSearchModalOpen: true });
  };

  closeSearchModal = () => {
    this.setState({ isSearchModalOpen: false });
  };

  fetchInitialActivities = async () => {
    try {
      const response = await axios.get(`${this.state.endpoint}/activities`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        this.setState({ activities: response.data.activities });
      } else {
        console.error('Failed to fetch activities:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Helper function to convert a Uint8Array to a Base64 string.
  toBase64 = uint8Array => {
    return btoa(String.fromCharCode(...uint8Array));
  };

  // Retrieve the recipient's public key from the backend and decode from Base64.
  getRecipientPublicKey = async recipient => {
    const response = await axios.get(
      `${this.state.endpoint}/public-key?user=${recipient}`,
      { withCredentials: true }
    );
    const base64PublicKey = response.data.publicKey;
    const binaryString = atob(base64PublicKey);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper function to store sender's copy by encrypting with sender's own public key.
  storeSenderCopy = async messageText => {
    const { encapsulated: encapsulatedSender, sharedSecret: sharedSecretSender } =
      await KyberCrypto.encapsulateKey(this.state.kyberKeyPair.publicKey);
    const { cipherText: cipherTextSender, iv: ivSender } =
      await KyberCrypto.symmetricEncrypt(messageText, sharedSecretSender);
    const encapsulatedSenderB64 = this.toBase64(encapsulatedSender);
    const cipherTextSenderB64 = this.toBase64(cipherTextSender);
    const ivSenderB64 = this.toBase64(ivSender);
    const senderMsg = {
      from: this.state.username,
      to: this.state.to,
      encapsulated_key: encapsulatedSenderB64,
      encrypted_message: cipherTextSenderB64,
      iv: ivSenderB64,
      timestamp: Math.floor(Date.now() / 1000),
    };
    try {
      await axios.post(
        `${this.state.endpoint}/store-my-messages`,
        senderMsg,
        { withCredentials: true }
      );
    } catch (storeError) {
      console.error('Error storing sender copy:', storeError);
    }
  };

  // Encrypt and send message using Kyber-based encryption.
  onSubmit = async e => {
    if (
      (e.type === 'keydown' && e.charCode === 0 && e.code === 'Enter') ||
      e.type === 'click'
    ) {
      e.preventDefault();
      // Fetch the recipient's public key.
      const recipientPublicKey = await this.getRecipientPublicKey(this.state.to);
      const { encapsulated, sharedSecret } = await KyberCrypto.encapsulateKey(
        recipientPublicKey
      );
      const { cipherText, iv } = await KyberCrypto.symmetricEncrypt(
        this.state.message,
        sharedSecret
      );
      console.log('Encapsulated key:', encapsulated);
      console.log('Shared secret:', sharedSecret);
      console.log('Cipher text:', cipherText);
      console.log('IV:', iv);
      const encapsulatedB64 = this.toBase64(encapsulated);
      const cipherTextB64 = this.toBase64(cipherText);
      const ivB64 = this.toBase64(iv);
      const msg = {
        type: 'message',
        chat: {
          from: this.state.username,
          to: this.state.to,
          encapsulated_key: encapsulatedB64,
          encrypted_message: cipherTextB64,
          iv: ivB64,
        },
      };
      console.log('Sending encrypted message:', msg);
      this.state.socketConn.sendMsg(msg);
      await this.storeSenderCopy(this.state.message);
      const newChat = {
        from: this.state.username,
        to: this.state.to,
        message: this.state.message,
        timestamp: Math.floor(Date.now() / 1000),
      };
      this.setState(
        prevState => ({
          chats: [...prevState.chats, newChat],
          message: '',
        }),
        () => this.renderChatHistory(this.state.username, this.state.chats)
      );
    }
  };

  // Helper function to convert a Base64 string to a Uint8Array.
  fromBase64 = (base64String) => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  processChats = async (chats, privateKey, kemInstance) => {
    console.log('Processing chats: ', chats);
    const processed = await Promise.all(chats.map(async chat => {
      try {
        console.log('Processing chat: ', chat);
        // Add additional validation before decryption
        if (!chat.encapsulated_key || !chat.encrypted_message || !chat.iv) {
          console.error('Missing required encryption fields in chat:', chat);
          chat.decryptedMessage = 'Error: Missing encryption data';
          return chat;
        }
  
        // Convert stored Base64 strings to Uint8Array
        const encapsulatedBytes = this.fromBase64(chat.encapsulated_key);
        const encryptedMessageBytes = this.fromBase64(chat.encrypted_message);
        const ivBytes = this.fromBase64(chat.iv);
        
        // Ensure we have valid data before decryption
        if (encapsulatedBytes.length === 0 || encryptedMessageBytes.length === 0 || ivBytes.length === 0) {
          console.error('Empty encryption data detected');
          chat.decryptedMessage = 'Error: Empty encryption data';
          return chat;
        }
        
        // Try decapsulating with more error handling
        let sharedSecret;
        try {
          sharedSecret = await KyberCrypto.decapsulateKey(
            encapsulatedBytes,
            privateKey,
            kemInstance
          );
        } catch (decapError) {
          console.error('Key decapsulation failed:', decapError);
          chat.decryptedMessage = 'Error: Key decapsulation failed';
          return chat;
        }
        
        // Extra validation for shared secret
        if (!sharedSecret || sharedSecret.length === 0) {
          console.error('Invalid shared secret generated');
          chat.decryptedMessage = 'Error: Invalid shared secret';
          return chat;
        }
        
        // Try decrypting with the shared secret
        try {
          const decryptedMessage = await KyberCrypto.symmetricDecrypt(
            encryptedMessageBytes,
            ivBytes,
            sharedSecret
          );
          chat.decryptedMessage = decryptedMessage;
        } catch (decryptError) {
          console.error('Message decryption failed:', decryptError);
          chat.decryptedMessage = 'Error: Message decryption failed';
        }
      } catch (err) {
        console.error('Error processing message:', err);
        chat.decryptedMessage = 'Processing failed';
      }
      return chat;
    }));
    return processed;
  };


  fetchChatHistory = async (u1 = 'user1', u2 = 'user2') => {
    try {
      // Fetch messages sent from U1 to U2
      const res1 = await axios.get(
        `${this.state.endpoint}/my-chat-history?u1=${u1}&u2=${u2}`,
        { withCredentials: true }
      );
      // Fetch messages sent from U2 to U1
      const res2 = await axios.get(
        `${this.state.endpoint}/chat-history?u1=${u2}&u2=${u1}`,
        { withCredentials: true }
      );
      
  
      let chats1 = res1.status === 200 ? res1.data.chats : [];
      let chats2 = res2.status === 200 ? res2.data.chats : [];
      
      if (res1.status !== 200 && res2.status !== 200) {
        console.log('Unable to fetch chat history');
        this.setState({ chatHistory: [] });
        return;
      }
      
      // Validate chats before processing
      chats1 = chats1.filter(chat => 
        chat && chat.encapsulated_key && chat.encrypted_message && chat.iv);
      chats2 = chats2.filter(chat => 
        chat && chat.encapsulated_key && chat.encrypted_message && chat.iv);
      
      // Process chats with improved error handling
      const processedChats1 = await this.processChats(
        chats1,
        this.state.kyberKeyPair.privateKey,
        this.state.kyberKeyPair.kemInstance
      );
      const processedChats2 = await this.processChats(
        chats2,
        this.state.kyberKeyPair.privateKey,
        this.state.kyberKeyPair.kemInstance
      );
      
      const finalChats = [...processedChats1, ...processedChats2];
      finalChats.sort((a, b) => a.timestamp - b.timestamp);
      
      this.setState({ chats: finalChats });
      this.renderChatHistory(u1, finalChats);
    } catch (error) {
      console.error('Error in fetchChatHistory:', error);
      this.setState({ chatHistory: [] });
    }
  };

  getContacts = async user => {
    const res = await axios.get(
      `${this.state.endpoint}/contact-list?username=${user}`,
      { withCredentials: true }
    );
    console.log('Contacts:', res.data);
    if (res.data['data'] !== undefined) {
      this.setState({ contacts: res.data.data }, () => {
        this.renderContactList(this.state.contacts);
      });
    }
  };

  renderChatHistory = (currentUser, chats) => {
    const history = ChatHistory(currentUser, chats);
    this.setState({ chatHistory: history });
  };

  renderContactList = contacts => {
    const renderContactList = ContactList(
      contacts,
      this.sendMessageTo,
      this.state.selectedContact
    );
    this.setState({ renderContactList });
  };

  sendMessageTo = to => {
    this.setState({ to, selectedContact: to }, () => {
      this.renderContactList(this.state.contacts);
      this.fetchChatHistory(this.state.username, to);
    });
  };

  render() {
    const { searchResults, isSearchModalOpen, activities } = this.state;
    return (
      <Box bg="gray.900" minHeight="100vh" p={5}>
        <Flex direction="column" h="100vh" maxW="1200px" mx="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <SearchBar
              from={this.state.username}
              onSearchResults={this.handleSearchResults}
            />
            <Text color="purple.300" fontWeight="bold">
              {this.state.username}
            </Text>
          </Flex>

          <Tabs isFitted variant="enclosed" colorScheme="purple" flex={1}>
            <TabList>
              <Tab>Chat</Tab>
              <Tab>Activities</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Flex
                  flex={1}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="xl"
                  h="calc(100vh - 150px)"
                >
                  <Box
                    w={{ base: '100%', md: '300px' }}
                    bg="gray.700"
                    overflowY="auto"
                    borderRightWidth={1}
                    borderColor="gray.600"
                    display={{
                      base: this.state.to ? 'none' : 'block',
                      md: 'block',
                    }}
                  >
                    <Box p={4}>{this.state.renderContactList}</Box>
                  </Box>

                  <Flex
                    direction="column"
                    flex={1}
                    bg="gray.800"
                    display={{
                      base: this.state.to ? 'flex' : 'none',
                      md: 'flex',
                    }}
                  >
                    <Box flex={1} overflowY="auto" p={4}>
                      {this.state.chatHistory}
                    </Box>

                    <Box p={4} bg="gray.700">
                      {this.state.to !== '' ? (
                        <FormControl onKeyDown={this.onSubmit} onSubmit={this.onSubmit}>
                          <Textarea
                            bg="gray.600"
                            color="white"
                            border="none"
                            borderRadius="md"
                            placeholder="Type your message here... Press enter to send"
                            _placeholder={{ color: 'gray.400' }}
                            mb={2}
                            name="message"
                            value={this.state.message}
                            onChange={this.onChange}
                            rows={3}
                          />
                          <Flex justify="space-between" align="center">
                            <Button colorScheme="purple" size="sm" onClick={this.onSubmit}>
                              Send
                            </Button>
                          </Flex>
                        </FormControl>
                      ) : (
                        <Flex justify="center" align="center" h="100%">
                          <Text color="gray.400">
                            Select a contact to start chatting
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Flex>
              </TabPanel>
              <TabPanel>
                <ActivityPage activities={activities} />
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Modal isOpen={isSearchModalOpen} onClose={this.closeSearchModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Search Results</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {searchResults.length === 0 ? (
                  <Text>No results found.</Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {searchResults.map((result, index) => (
                      <Box key={index} p={3} shadow="md" borderWidth="1px" borderRadius="md">
                        <Flex direction="column">
                          <Flex justifyContent="space-between">
                            <Text fontWeight="bold">From: {result.from}</Text>
                            <Text fontWeight="bold">To: {result.to}</Text>
                          </Flex>
                          <Text mt={2}>{result.message}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={this.closeSearchModal}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>
      </Box>
    );
  }
}

export default Chat;
