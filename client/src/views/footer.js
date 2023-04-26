import React, { memo } from "react";
import {
  ButtonGroup,
  Grid,
  IconButton,
  GridItem,
  Text,
  Center,
} from "@chakra-ui/react";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
// import Logo from "../assets/logo.png";
import "./footer.css";
const Footer = () => {
  return (
    <Grid py={10} className="Footer" templateColumns="repeat(12,1fr)">
      <GridItem colSpan={12}>
        <Center>
          {/*  <img src={Logo} className="logologin" alt="logo lucica" /> */}
        </Center>
        <ButtonGroup variant="ghost">
          <IconButton
            as="a"
            href="#"
            aria-label="Facebook"
            icon={<FaFacebook fontSize="1.25rem" />}
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Instagram"
            icon={<FaInstagram fontSize="1.25rem" />}
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Twitter"
            icon={<FaTwitter fontSize="1.25rem" />}
          />
        </ButtonGroup>
        <Text textAlign="center" fontSize="sm" color="subtle">
          &copy; {new Date().getFullYear()} | Robinzonski Kamp Lučica | Sva
          prava zadržana
        </Text>
      </GridItem>
    </Grid>
  );
};

export default memo(Footer);
