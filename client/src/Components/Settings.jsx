"use client"

import { Component } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { InputGroup, InputLeftElement, Input, Box } from "@chakra-ui/react"
import { FaSearch } from "react-icons/fa"

const MotionBox = motion(Box)

class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchTerm: "",
      endpoint: process.env.REACT_APP_API_URL,
    }
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  onSubmit = async (e) => {
    if ((e.type === "keydown" && e.charCode === 0 && e.code === "Enter") || e.type === "click") {
      e.preventDefault()
      try {
        const response = await axios.post(
          `${this.state.endpoint}/search-users`,
          {
            searchTerm: this.state.searchTerm,
            from: this.props.from,
          },
          { withCredentials: true },
        )
        this.props.onSearchResults(response.data)
        this.setState({ searchTerm: "" })
      } catch (error) {
        console.error("Search error:", error)
      }
    }
  }

  render() {
    return (
      <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.500" />
          </InputLeftElement>
          <Input
            bg="white"
            color="gray.800"
            border="2px solid"
            borderColor="yellow.300"
            borderRadius="lg"
            placeholder="Search contacts..."
            _placeholder={{ color: "gray.500" }}
            _focus={{
              borderColor: "yellow.400",
              boxShadow: "0 0 0 1px #ffd700",
            }}
            name="searchTerm"
            value={this.state.searchTerm}
            onChange={this.onChange}
            onKeyDown={this.onSubmit}
          />
        </InputGroup>
      </MotionBox>
    )
  }
}

export default SearchBar
