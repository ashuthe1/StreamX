import { Component } from "react"
import axios from "axios"
import SearchBar from "../Searchbar"
import SocketConnection from "../../socket-connection"
import { motion, AnimatePresence } from "framer-motion"
import { Heading, Center } from "@chakra-ui/react"
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
  Text,
  Textarea,
  VStack,
  Avatar,
  HStack,
  Badge,
} from "@chakra-ui/react"
import { FaPaperPlane, FaPaperclip, FaSearch, FaUsers, FaRobot } from "react-icons/fa"
import { IoMdSettings, IoMdClose } from "react-icons/io"
import { MdInsertEmoticon } from "react-icons/md"
import EmojiPicker from "emoji-picker-react"

import ChatHistory from "./ChatHistory"
import ContactList from "./ContactList"
import * as KyberCrypto from "../../kyber/kyberCrypto"
import { getGlobalKeyPair } from "../../kyber/keyUtils"

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)

class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socketConn: "",
      username: "",
      message: "",
      to: "",
      endpoint: process.env.REACT_APP_API_URL,
      contacts: [],
      renderContactList: [],
      chats: [],
      chatHistory: [],
      activities: [],
      searchResults: [],
      isSearchModalOpen: false,
      selectedContact: "",
      kyberKeyPair: null,
      showEmojiPicker: false,
      isTyping: false,
      onlineUsers: [],
    }
  }

  handleEmojiClick = (emojiObject) => {
    this.setState((prevState) => ({
      message: prevState.message + emojiObject.emoji,
      showEmojiPicker: false,
    }))
  }

  componentDidMount = async () => {
    const queryParams = new URLSearchParams(window.location.search)
    const user = queryParams.get("u")
    this.setState({ username: user })
    this.getContacts(user)

    const conn = new SocketConnection()
    await this.setState({ socketConn: conn })

    const keyPair = await getGlobalKeyPair()
    const publicKeyBase64 = btoa(String.fromCharCode(...keyPair.publicKey))
    await axios.post(
      `${this.state.endpoint}/register-public-key`,
      { username: user, public_key: publicKeyBase64 },
      { withCredentials: true },
    )

    this.setState({ kyberKeyPair: keyPair })

    this.state.socketConn.connect(async (message) => {
      const msg = JSON.parse(message.data)

      if (msg.type === "activity") {
        this.setState((prevState) => ({
          activities: [msg, ...prevState.activities],
        }))
      } else {
        if (this.state.username === msg.to) {
          const chatsArr = []
          if (msg.from === "ChatBot") {
            chatsArr.push({
              from: msg.from,
              to: msg.to,
              message: msg.message,
              timestamp: msg.timestamp,
              id: msg.id,
              decryptedMessage: "",
            })
          } else {
            chatsArr.push({
              from: msg.from,
              to: msg.to,
              encapsulated_key: msg.encapsulated_key,
              encrypted_message: msg.encrypted_message,
              iv: msg.iv,
              timestamp: msg.timestamp,
              id: msg.id,
              decryptedMessage: "",
            })
          }
          const processedChatMessage = await this.processChats(
            chatsArr,
            this.state.kyberKeyPair.privateKey,
            this.state.kyberKeyPair.kemInstance,
          )
          const allChats = [...this.state.chats, processedChatMessage[0]]
          this.setState({ chats: allChats })
          this.renderChatHistory(this.state.username, allChats)
        }
      }
    })

    this.state.socketConn.connected(user)
    this.fetchInitialActivities()
  }

  handleSearchResults = (response) => {
    const results = response.result.data.Get.Users
    this.setState({ searchResults: results, isSearchModalOpen: true })
  }

  closeSearchModal = () => {
    this.setState({ isSearchModalOpen: false })
  }

  fetchInitialActivities = async () => {
    try {
      const response = await axios.get(`${this.state.endpoint}/activities`, {
        withCredentials: true,
      })
      if (response.status === 200) {
        this.setState({ activities: response.data.activities })
      } else {
        console.error("Failed to fetch activities:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  toBase64 = (uint8Array) => {
    return btoa(String.fromCharCode(...uint8Array))
  }

  getRecipientPublicKey = async (recipient) => {
    const response = await axios.get(`${this.state.endpoint}/public-key?user=${recipient}`, { withCredentials: true })
    const base64PublicKey = response.data.publicKey
    const binaryString = atob(base64PublicKey)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  storeSenderCopy = async (messageText) => {
    const { encapsulated: encapsulatedSender, sharedSecret: sharedSecretSender } = await KyberCrypto.encapsulateKey(
      this.state.kyberKeyPair.publicKey,
    )
    const { cipherText: cipherTextSender, iv: ivSender } = await KyberCrypto.symmetricEncrypt(
      messageText,
      sharedSecretSender,
    )
    const encapsulatedSenderB64 = this.toBase64(encapsulatedSender)
    const cipherTextSenderB64 = this.toBase64(cipherTextSender)
    const ivSenderB64 = this.toBase64(ivSender)
    const senderMsg = {
      from: this.state.username,
      to: this.state.to,
      encapsulated_key: encapsulatedSenderB64,
      encrypted_message: cipherTextSenderB64,
      iv: ivSenderB64,
      timestamp: Math.floor(Date.now() / 1000),
    }
    try {
      await axios.post(`${this.state.endpoint}/store-my-messages`, senderMsg, { withCredentials: true })
    } catch (storeError) {
      console.error("Error storing sender copy:", storeError)
    }
  }

  onSubmit = async (e) => {
    if ((e.type === "keydown" && e.charCode === 0 && e.code === "Enter") || e.type === "click") {
      e.preventDefault()
      if (this.state.to === "ChatBot") {
        const msg = {
          type: "message",
          chat: {
            from: this.state.username,
            to: this.state.to,
            message: this.state.message,
            timestamp: Math.floor(Date.now() / 1000),
          },
        }
        this.state.socketConn.sendMsg(msg)
      } else {
        const recipientPublicKey = await this.getRecipientPublicKey(this.state.to)
        const { encapsulated, sharedSecret } = await KyberCrypto.encapsulateKey(recipientPublicKey)
        const { cipherText, iv } = await KyberCrypto.symmetricEncrypt(this.state.message, sharedSecret)
        const encapsulatedB64 = this.toBase64(encapsulated)
        const cipherTextB64 = this.toBase64(cipherText)
        const ivB64 = this.toBase64(iv)
        const msg = {
          type: "message",
          chat: {
            from: this.state.username,
            to: this.state.to,
            encapsulated_key: encapsulatedB64,
            encrypted_message: cipherTextB64,
            iv: ivB64,
          },
        }
        this.state.socketConn.sendMsg(msg)
      }

      await this.storeSenderCopy(this.state.message)

      const newChat = {
        from: this.state.username,
        to: this.state.to,
        message: this.state.message,
        timestamp: Math.floor(Date.now() / 1000),
      }
      this.setState(
        (prevState) => ({
          chats: [...prevState.chats, newChat],
          message: "",
        }),
        () => this.renderChatHistory(this.state.username, this.state.chats),
      )
    }
  }

  fromBase64 = (base64String) => {
    const binaryString = atob(base64String)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  processChats = async (chats, privateKey, kemInstance) => {
    const processed = await Promise.all(
      chats.map(async (chat) => {
        try {
          if (chat.message) {
            chat.decryptedMessage = chat.message
            return chat
          }

          if (!chat.encapsulated_key || !chat.encrypted_message || !chat.iv) {
            console.error("Missing required encryption fields in chat:", chat)
            chat.decryptedMessage = "Error: Missing encryption data"
            return chat
          }

          const encapsulatedBytes = this.fromBase64(chat.encapsulated_key)
          const encryptedMessageBytes = this.fromBase64(chat.encrypted_message)
          const ivBytes = this.fromBase64(chat.iv)

          if (encapsulatedBytes.length === 0 || encryptedMessageBytes.length === 0 || ivBytes.length === 0) {
            console.error("Empty encryption data detected")
            chat.decryptedMessage = "Error: Empty encryption data"
            return chat
          }

          let sharedSecret
          try {
            sharedSecret = await KyberCrypto.decapsulateKey(encapsulatedBytes, privateKey, kemInstance)
          } catch (decapError) {
            console.error("Key decapsulation failed:", decapError)
            chat.decryptedMessage = "Error: Key decapsulation failed"
            return chat
          }

          if (!sharedSecret || sharedSecret.length === 0) {
            console.error("Invalid shared secret generated")
            chat.decryptedMessage = "Error: Invalid shared secret"
            return chat
          }

          try {
            const decryptedMessage = await KyberCrypto.symmetricDecrypt(encryptedMessageBytes, ivBytes, sharedSecret)
            chat.decryptedMessage = decryptedMessage
          } catch (decryptError) {
            console.error("Message decryption failed:", decryptError)
            chat.decryptedMessage = "Error: Message decryption failed"
          }
        } catch (err) {
          console.error("Error processing message:", err)
          chat.decryptedMessage = "Processing failed"
        }
        return chat
      }),
    )
    return processed
  }

  fetchChatHistory = async (u1 = "user1", u2 = "user2") => {
    try {
      const res1 = await axios.get(`${this.state.endpoint}/my-chat-history?u1=${u1}&u2=${u2}`, {
        withCredentials: true,
      })
      const res2 = await axios.get(`${this.state.endpoint}/chat-history?u1=${u2}&u2=${u1}`, { withCredentials: true })

      const chats1 = res1.status === 200 ? res1.data.chats : []
      const chats2 = res2.status === 200 ? res2.data.chats : []

      if (res1.status !== 200 && res2.status !== 200) {
        console.log("Unable to fetch chat history")
        this.setState({ chatHistory: [] })
        return
      }

      const processedChats1 = await this.processChats(
        chats1,
        this.state.kyberKeyPair.privateKey,
        this.state.kyberKeyPair.kemInstance,
      )
      const processedChats2 = await this.processChats(
        chats2,
        this.state.kyberKeyPair.privateKey,
        this.state.kyberKeyPair.kemInstance,
      )

      const finalChats = [...processedChats1, ...processedChats2]
      finalChats.sort((a, b) => a.timestamp - b.timestamp)

      this.setState({ chats: finalChats })
      this.renderChatHistory(u1, finalChats)
    } catch (error) {
      console.error("Error in fetchChatHistory:", error)
      this.setState({ chatHistory: [] })
    }
  }

  getContacts = async (user) => {
    const res = await axios.get(`${this.state.endpoint}/contact-list?username=${user}`, { withCredentials: true })
    if (res.data["data"] !== undefined) {
      this.setState({ contacts: res.data.data }, () => {
        this.renderContactList(this.state.contacts)
      })
    }
  }

  renderChatHistory = (currentUser, chats) => {
    const history = ChatHistory(currentUser, chats)
    this.setState({ chatHistory: history })
  }

  renderContactList = (contacts) => {
    const renderContactList = ContactList(contacts, this.sendMessageTo, this.state.selectedContact)
    this.setState({ renderContactList })
  }

  sendMessageTo = (to) => {
    this.setState({ to, selectedContact: to }, () => {
      this.renderContactList(this.state.contacts)
      this.fetchChatHistory(this.state.username, to)
    })
  }

  render() {
    const { searchResults, isSearchModalOpen } = this.state

    return (
      <Box bg="white" minHeight="100vh" w="100vw" position="relative" overflow="hidden">
        {/* Golden gradient background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(135deg, #ffd700 0%, #ffed4e 25%, #ffffff 50%, #ffed4e 75%, #ffd700 100%)"
          opacity={0.1}
          zIndex={0}
        />

        <Flex direction="column" h="100vh" w="100%" position="relative" zIndex={1}>
          <Flex flex={1} overflow="hidden" w="100%">
            {/* Contacts Sidebar */}
            <MotionBox
              w={{ base: this.state.to ? "0" : "100%", md: "350px" }}
              bg="white"
              overflowY="auto"
              borderRight="2px solid"
              borderColor="#fef08a"
              boxShadow="xl"
              display={{ base: this.state.to ? "none" : "block", md: "block" }}
              initial={{ x: -350 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Sidebar Header */}
              <Box
                p={6}
                bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                borderBottom="1px solid"
                borderColor="yellow.300"
              >
                <Flex align="center" mb={4}>
                  <Avatar name={this.state.username} size="md" mr={3} border="3px solid white" boxShadow="lg" />
                  <Box>
                    <Text fontWeight="bold" color="gray.800" fontSize="lg">
                      {this.state.username}
                    </Text>
                    <Flex align="center">
                      <Box w={2} h={2} bg="green.400" borderRadius="full" mr={2} />
                      <Text fontSize="sm" color="gray.600">
                        Online
                      </Text>
                    </Flex>
                  </Box>
                </Flex>

                <SearchBar from={this.state.username} onSearchResults={this.handleSearchResults} />
              </Box>

              {/* Contacts List */}
              <Box p={4}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3} textTransform="uppercase">
                  Contacts ({this.state.contacts.length})
                </Text>
                {this.state.renderContactList}
              </Box>
            </MotionBox>

            {/* Main Chat Area */}
            <Flex direction="column" flex={1} bg="white" position="relative" w="100%">
              {this.state.to ? (
                <>
                  {/* Chat Header */}
                  <MotionFlex
                    p={4}
                    align="center"
                    bg="white"
                    borderBottom="2px solid"
                    borderColor="#fef08a"
                    justify="space-between"
                    boxShadow="sm"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Flex align="center">
                      <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Avatar
                          name={this.state.to}
                          size="md"
                          mr={4}
                          border="3px solid"
                          borderColor="yellow.300"
                          boxShadow="lg"
                        />
                      </MotionBox>
                      <Box>
                        <Text fontWeight="bold" color="gray.800" fontSize="lg">
                          {this.state.to}
                        </Text>
                        <Flex align="center">
                          <Box w={2} h={2} bg="green.400" borderRadius="full" mr={2} />
                          <Text fontSize="sm" color="gray.600">
                            {this.state.to === "ChatBot" ? "AI Assistant" : "Online"}
                          </Text>
                        </Flex>
                      </Box>
                      {this.state.to === "ChatBot" && (
                        <Badge ml={3} colorScheme="purple" variant="subtle">
                          <FaRobot style={{ marginRight: "4px" }} />
                          AI
                        </Badge>
                      )}
                    </Flex>
                    <HStack>
                      <MotionButton
                        variant="ghost"
                        colorScheme="yellow"
                        size="sm"
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IoMdSettings />
                      </MotionButton>
                      <MotionButton
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        display={{ base: "flex", md: "none" }}
                        onClick={() => this.setState({ to: "" })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IoMdClose />
                      </MotionButton>
                    </HStack>
                  </MotionFlex>

                  {/* Chat History */}
                  <Box flex={1} overflowY="auto" p={4} bg="white" position="relative">
                    {/* Subtle pattern background */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      opacity={0.03}
                      bgImage="radial-gradient(circle, #ffd700 1px, transparent 1px)"
                      bgSize="20px 20px"
                    />
                    <Box position="relative" zIndex={1}>
                      {this.state.chatHistory}
                    </Box>
                  </Box>

                  {/* Message Input */}
                  <MotionBox
                    p={4}
                    bg="white"
                    borderTop="2px solid"
                    borderColor="#fef08a"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <FormControl onKeyDown={this.onSubmit} onSubmit={this.onSubmit}>
                      <Flex align="end" gap={2}>
                        <MotionButton
                          variant="ghost"
                          colorScheme="yellow"
                          size="sm"
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaPaperclip />
                        </MotionButton>

                        <Box position="relative" flex={1}>
                          <AnimatePresence>
                            {this.state.showEmojiPicker && (
                              <MotionBox
                                position="absolute"
                                bottom="60px"
                                right="10px"
                                zIndex={10}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ duration: 0.2 }}
                              >
                                <EmojiPicker
                                  onEmojiClick={this.handleEmojiClick}
                                  theme="light"
                                  previewConfig={{ showPreview: false }}
                                />
                              </MotionBox>
                            )}
                          </AnimatePresence>

                          <Textarea
                            bg="gray.50"
                            color="gray.800"
                            border="2px solid"
                            borderColor="#fef08a"
                            borderRadius="xl"
                            placeholder="Type your message..."
                            _placeholder={{ color: "gray.500" }}
                            _focus={{
                              borderColor: "#facc15",
                              boxShadow: "0 0 0 1px #ffd700",
                              bg: "white",
                            }}
                            name="message"
                            value={this.state.message}
                            onChange={this.onChange}
                            rows={1}
                            resize="none"
                            pr="100px"
                          />

                          <Flex position="absolute" right="8px" top="50%" transform="translateY(-50%)" gap={1}>
                            <MotionButton
                              variant="ghost"
                              colorScheme="yellow"
                              size="sm"
                              onClick={() =>
                                this.setState((prev) => ({
                                  showEmojiPicker: !prev.showEmojiPicker,
                                }))
                              }
                              whileHover={{ scale: 1.1, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MdInsertEmoticon />
                            </MotionButton>

                            <MotionButton
                              bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                              color="gray.800"
                              size="sm"
                              onClick={this.onSubmit}
                              whileHover={{
                                scale: 1.05,
                                boxShadow: "0 5px 15px rgba(255, 215, 0, 0.4)",
                              }}
                              whileTap={{ scale: 0.95 }}
                              _hover={{}}
                              isDisabled={!this.state.message.trim()}
                            >
                              <FaPaperPlane />
                            </MotionButton>
                          </Flex>
                        </Box>
                      </Flex>
                    </FormControl>
                  </MotionBox>
                </>
              ) : (
                <Center h="100%" flexDirection="column" bg="white">
                  <MotionBox
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    textAlign="center"
                    p={8}
                  >
                    <MotionBox whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
                      <Avatar
                        size="2xl"
                        mb={6}
                        bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                        color="gray.800"
                        name="StreamX"
                        border="4px solid"
                        borderColor="yellow.200"
                        boxShadow="xl"
                      />
                    </MotionBox>

                    <Heading
                      size="xl"
                      fontWeight="bold"
                      mb={3}
                      bgGradient="linear(135deg, #ffd700 0%, #ff8c00 100%)"
                      bgClip="text"
                    >
                      Welcome to StreamX
                    </Heading>

                    <Text color="gray.600" mb={8} fontSize="lg">
                      Select a contact to start your secure conversation
                    </Text>

                    <VStack spacing={4}>
                      <MotionButton
                        bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                        color="gray.800"
                        size="lg"
                        leftIcon={<FaUsers />}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(255, 215, 0, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => this.setState({ isSearchModalOpen: true })}
                        _hover={{}}
                      >
                        Find Contacts
                      </MotionButton>

                      <MotionButton
                        variant="outline"
                        borderColor="yellow.300"
                        color="gray.700"
                        size="lg"
                        leftIcon={<FaRobot />}
                        whileHover={{
                          scale: 1.05,
                          bg: "yellow.50",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => this.sendMessageTo("ChatBot")}
                      >
                        Chat with AI Assistant
                      </MotionButton>
                    </VStack>
                  </MotionBox>
                </Center>
              )}
            </Flex>
          </Flex>
        </Flex>

        {/* Search Modal */}
        <Modal isOpen={isSearchModalOpen} onClose={this.closeSearchModal} size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg="white" color="gray.800" borderRadius="xl" boxShadow="2xl">
            <ModalHeader bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" borderTopRadius="xl" color="gray.800">
              <Flex align="center">
                <FaSearch style={{ marginRight: "8px" }} />
                Search Results
              </Flex>
            </ModalHeader>
            <ModalCloseButton color="gray.800" />
            <ModalBody p={6}>
              {searchResults.length === 0 ? (
                <Center py={8}>
                  <VStack>
                    <Text color="gray.500" fontSize="lg">
                      No results found
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Try searching with different keywords
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={3} align="stretch">
                  {searchResults.map((result, index) => (
                    <MotionBox
                      key={index}
                      p={4}
                      bg="gray.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="yellow.200"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 5px 15px rgba(255, 215, 0, 0.2)",
                        borderColor: "#fde047",
                      }}
                      whileTap={{ scale: 0.98 }}
                      cursor="pointer"
                      onClick={() => {
                        this.sendMessageTo(result.username)
                        this.closeSearchModal()
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex align="center">
                        <Avatar name={result.username} size="md" mr={4} border="2px solid" borderColor="yellow.300" />
                        <Box>
                          <Text fontWeight="bold" color="gray.800">
                            {result.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Click to start chatting
                          </Text>
                        </Box>
                      </Flex>
                    </MotionBox>
                  ))}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <MotionButton
                bg="linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                color="gray.800"
                mr={3}
                onClick={this.closeSearchModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                _hover={{}}
              >
                Close
              </MotionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    )
  }
}

export default Chat
