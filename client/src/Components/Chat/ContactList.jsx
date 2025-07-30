"use client"
import { motion } from "framer-motion"
import { Box, Flex, Avatar, Text, VStack, Badge, Divider } from "@chakra-ui/react"
import { FaRobot } from "react-icons/fa"

const MotionBox = motion(Box)

const ContactList = ({ contacts, sendMessageTo, selectedContact }) => {
  const allContacts = [{ username: "ChatBot", isBot: true }, ...contacts]

  return (
    <VStack spacing={2} align="stretch">
      {allContacts.map((contact, index) => (
        <MotionBox
          key={contact.username}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <MotionBox
            p={3}
            borderRadius="lg"
            cursor="pointer"
            bg={selectedContact === contact.username ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" : "white"}
            border="1px solid"
            borderColor={selectedContact === contact.username ? "#facc15" : "#e5e7eb"}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 5px 15px rgba(255, 215, 0, 0.2)",
              borderColor: "#fde047",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendMessageTo(contact.username)}
            transition={{ duration: 0.2 }}
          >
            <Flex align="center">
              <Avatar
                name={contact.username}
                size="sm"
                mr={3}
                border="2px solid"
                borderColor={contact.isBot ? "purple.300" : "#fde047"}
                bg={contact.isBot ? "purple.100" : "#fff9db"}
              />
              <Box flex={1}>
                <Flex align="center" justify="space-between">
                  <Text
                    fontWeight="semibold"
                    color={selectedContact === contact.username ? "gray.800" : "gray.700"}
                    fontSize="sm"
                  >
                    {contact.username}
                  </Text>
                  {contact.isBot && (
                    <Badge size="sm" colorScheme="purple" variant="subtle" borderRadius="full">
                      <FaRobot style={{ marginRight: "2px", fontSize: "10px" }} />
                      AI
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="xs" color={selectedContact === contact.username ? "gray.600" : "gray.500"}>
                  {contact.isBot ? "AI Assistant" : "Online"}
                </Text>
              </Box>
            </Flex>
          </MotionBox>

          {contact.isBot && index === 0 && <Divider my={2} borderColor="#fef08a" />}
        </MotionBox>
      ))}
    </VStack>
  )
}

export default ContactList
