import { Outlet } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import { Flex, Box} from '@chakra-ui/react';


const AuthenticatedLayout = () => {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box flex="1">
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
};

export default AuthenticatedLayout;