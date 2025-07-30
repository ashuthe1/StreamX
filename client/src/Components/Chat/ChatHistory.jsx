"use client"
import { motion } from "framer-motion"
import { Box, Flex, Avatar, Text, VStack } from "@chakra-ui/react"

const MotionBox = motion(Box)

const ChatHistory = (currentUser, chats) => {
  return (
    <VStack spacing={4} align="stretch" p={2}>
      {chats.map((chat, index) => {
        const isCurrentUser = chat.from === currentUser
        const displayMessage = chat.decryptedMessage || chat.message || "Message could not be decrypted"

        return (
          <MotionBox
            key={`${chat.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Flex justify={isCurrentUser ? "flex-end" : "flex-start"} align="end" mb={2}>
              {!isCurrentUser && (
                <Avatar
                  name={chat.from}
                  size="sm"
                  mr={2}
                  border="2px solid"
                  borderColor={chat.from === "ChatBot" ? "purple.300" : "yellow.300"}
                />
              )}

              <MotionBox maxW="70%" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Box
                  bg={
                    isCurrentUser
                      ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                      : chat.from === "ChatBot"
                        ? "linear-gradient(135deg, #e6e6fa 0%, #f0f8ff 100%)"
                        : "gray.100"
                  }
                  color={isCurrentUser ? "gray.800" : "gray.700"}
                  p={3}
                  borderRadius="lg"
                  borderTopRightRadius={isCurrentUser ? "sm" : "lg"}
                  borderTopLeftRadius={isCurrentUser ? "lg" : "sm"}
                  boxShadow="sm"
                  border="1px solid"
                  borderColor={isCurrentUser ? "yellow.300" : chat.from === "ChatBot" ? "purple.200" : "gray.200"}
                >
                  {!isCurrentUser && (
                    <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.600">
                      {chat.from}
                    </Text>
                  )}
                  <Text fontSize="sm" lineHeight="1.4">
                    {displayMessage}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={isCurrentUser ? "gray.600" : "gray.500"}
                    mt={1}
                    textAlign={isCurrentUser ? "right" : "left"}
                  >
                    {new Date(chat.timestamp * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Box>
              </MotionBox>

              {isCurrentUser && (
                <Avatar name={chat.from} size="sm" ml={2} border="2px solid" borderColor="yellow.300" />
              )}
            </Flex>
          </MotionBox>
        )
      })}
    </VStack>
  )
}

export default ChatHistory
