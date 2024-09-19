// Header.jsx

import React from "react";
import { Flex, Image, useColorMode } from "@chakra-ui/react";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex justifyContent="center" mt={6} mb={12}>
      <Image
        cursor="pointer"
        alt="logo"
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode} // Toggles between light and dark mode when the logo is clicked
      />
    </Flex>
  );
};

export default Header;
