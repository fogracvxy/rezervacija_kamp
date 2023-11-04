import Logo from "../assets/logo.png";
import { useState, useEffect, useContext } from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Stack,
  useColorMode,
  IconButton,
  Center,
  useDisclosure,
  useToast,
  Text,
  HStack,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import UserSettings from "./UserSettings";
import FormModal from "./FormModal";
import { HamburgerIcon } from "@chakra-ui/icons";
import "./navbar.css";
import { useNavigate } from "react-router";
import { AccountContext } from "./AccountContext";
import LoginButton from "./loginbutton";
//navbar prikaz
const Navbartop = () => {
  const [userInfo, setUserInfo] = useState([]);
  const [image, setImage] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState("");
  const toast = useToast();
  const [profileImageSource, setProfileImageSource] = useState("");
  const { user, setUser, checkedForUser } = useContext(AccountContext);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const {
    isOpen: isModalFormOpen,
    onOpen: onModalFormOpen,
    onClose: onModalFormClose,
  } = useDisclosure();
  const {
    isOpen: isModalUserOpen,
    onOpen: onModalUserOpen,
    onClose: onModalUserClose,
  } = useDisclosure();
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/auth/login", {
      method: "GET",
      credentials: "include",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        setIsLoggedIn(result.loggedIn);
        setUserInfo(result);
      });
  }, []);
  useEffect(() => {
    fetch("/auth/profilepicture", {
      method: "GET",
      credentials: "include",
    })
      .then(function (response) {
        return response.json();
      })
      .then((resBody) => {
        setProfileImageSource(resBody.source);
      });
  }, []);
  //useEffect za dohvat profilnih fotki i spremanje u profileImageSource
  const handleProfilePictureDeleted = () => {
    // Update the state variable that holds the profile picture URL
    setProfileImageSource(null); // Assuming `setProfilePictureSource` is your state updater
  };
  //funkcija za upload profilne fotografije
  const handleUpload = () => {
    const MAX_FILE_SIZE = 2000000;
    const TOAST_DURATION = 6000;

    const showErrorToast = (message) => {
      toast({
        title: "Greška",
        description: message,
        status: "error",
        duration: TOAST_DURATION,
        isClosable: true,
      });
      setUploadPercentage("");
    };

    let formData = new FormData();

    if (!image) {
      showErrorToast("Dodajte datoteku");
      // } else if (!ALLOWED_FORMATS.includes(image.type.split("/")[1])) {
      //   showErrorToast("Dozvoljeni formati: .png/.jpg/.jpeg");
    } else if (image.size > MAX_FILE_SIZE) {
      showErrorToast("Dozvoljena maksimalna veličina 2MB");
    } else {
      setUploadPercentage("uploading");
      formData.append("avatar", image);
      fetch("/auth/uploadpicture", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
        .then((res) => res.json())
        .then((resBody) => {
          toastNotification(resBody.title, resBody.response, resBody.status);
          if (resBody.status === "success") {
            // Only update the profile picture source if the status is "success"
            setProfileImageSource(resBody.source);
          }
          setUploadPercentage(resBody.status);
        });
    }
  };

  const toastNotification = (title, description, status) => {
    toast({
      title: title,
      description: description,
      status: status,
      duration: 6000,
      isClosable: true,
    });
  };
  //funckija onCloseUserSettings kada se ugasi modal da se postavi image upload na prazno zbog toga sto se vizualno makne a ovako i dalje se moze kliknuti upload i datoteka je spremna
  const onCloseUserSettings = () => {
    onModalUserClose();
    setImage();
  };
  // fileOnChange kad se odabere iz file explorera
  const fileOnChange = (event) => {
    setImage(event.target.files[0]);
  };
  //funkcija za logout fetch prosli oblik window.open("auth/login... nije radio sve potrebno")
  const handleLogout = () => {
    fetch("/auth/logout", {
      method: "GET",
      credentials: "include",
    })
      .then(() => {})
      .then(() => {
        setUser({ loggedIn: false });
        navigate("/"); // navigate nakon logouta
      });
  };
  const openLogoutConfirmModal = () => {
    setIsLogoutConfirmOpen(true);
  };
  const navigateAdmin = () => {
    navigate("/rezervacijaadmin");
  };
  const AdminButton = () => {
    if (user.role === "Admin") {
      return (
        <MenuItem
          _focus={{ background: "transparent" }}
          _hover={{
            background: "transparent",
            color: "#DC4A2C",
          }}
          onClick={navigateAdmin}
        >
          Admin
        </MenuItem>
      );
    } else {
      return <></>;
    }
  };
  /*   const { t } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  }; */
  return (
    <>
      <div
        style={{
          backgroundColor: "#698A2E",
          zIndex: "999",
        }}
      >
        {" "}
        <Flex
          h={16}
          alignItems={"center"}
          px={{ base: 6, lg: 16 }}
          justifyContent={"space-between"}
        >
          <Box display={{ base: "block", lg: "none" }} zIndex="999">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
              />
              <MenuList>
                <MenuItem onClick={() => navigate("/")}>Početna</MenuItem>
                {user.loggedIn && (
                  <MenuItem onClick={() => navigate("/rezervacija")}>
                    Rezervacija
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Box>
          <Box display={{ base: "none", lg: "block" }}>
            <HStack as="nav" spacing="5">
              <ButtonGroup variant="link" spacing="8">
                <Button color="white" onClick={() => navigate("/")}>
                  Početna
                </Button>
                {checkedForUser && user.loggedIn ? (
                  <Button
                    color="white"
                    onClick={() => navigate("/rezervacija")}
                  >
                    Rezervacija
                  </Button>
                ) : (
                  <></>
                )}
              </ButtonGroup>
            </HStack>
          </Box>

          {checkedForUser && user.loggedIn ? (
            <Stack style={{ zIndex: "999" }} direction={"row"} spacing={7}>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    borderColor="white"
                    boxSizing="content-box"
                    borderWidth="3px"
                    size={"sm"}
                    src={profileImageSource}
                  />
                </MenuButton>
                <MenuList
                  style={{
                    backgroundColor: "#E2E2E2",
                    color: "BLACK",
                    borderColor: "white",
                  }}
                  alignItems={"center"}
                >
                  <br />
                  <Center>
                    <Avatar size={"2xl"} src={profileImageSource} />
                  </Center>
                  <br />
                  <Center>
                    <Box>
                      {" "}
                      <p style={{ textAlign: "center", color: "black" }}>
                        Korisnik {/* {t("Korisnik")} */}
                      </p>
                      <hr style={{ width: "100%", borderColor: "green" }} />
                      <p style={{ textAlign: "center", color: "#DC4A2C" }}>
                        {user.username}
                      </p>
                      <div style={{ marginTop: "10px" }}>
                        {" "}
                        {/*  <Button onClick={() => changeLanguage("hr")}>
                  <HR style={{ height: "50%", width: "100%" }} />
                </Button>
                <Button onClick={() => changeLanguage("en")} marginLeft={2}>
                  <US style={{ height: "50%", width: "100%" }} />
                </Button> */}
                      </div>
                    </Box>
                  </Center>
                  <br />
                  <MenuDivider />

                  <AdminButton />
                  <MenuItem
                    _focus={{ background: "transparent" }}
                    _hover={{
                      background: "transparent",
                      color: "#DC4A2C",
                    }}
                    onClick={() => navigate("/rezervacije")}
                  >
                    {" "}
                    Moje rezervacije
                  </MenuItem>
                  <MenuItem
                    _focus={{ background: "transparent" }}
                    _hover={{
                      background: "transparent",
                      color: "#DC4A2C",
                    }}
                    onClick={onModalUserOpen}
                  >
                    {" "}
                    Postavke
                  </MenuItem>
                  <MenuItem
                    _focus={{ background: "transparent" }}
                    _hover={{
                      background: "transparent",
                      color: "#DC4A2C",
                    }}
                    onClick={onModalFormOpen}
                  >
                    {" "}
                    Prijava greške
                  </MenuItem>
                  <MenuItem
                    _focus={{ background: "transparent" }}
                    _hover={{
                      background: "transparent",
                    }}
                    color="red"
                    onClick={openLogoutConfirmModal}
                  >
                    Odjava
                  </MenuItem>
                </MenuList>
              </Menu>
              {isLogoutConfirmOpen && (
                <Modal
                  isOpen={isLogoutConfirmOpen}
                  onClose={() => setIsLogoutConfirmOpen(false)}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Potvrda</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      Jeste li sigurni da se želite odjaviti?
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        mr="3"
                        colorScheme="red"
                        onClick={() => {
                          handleLogout();
                          setIsLogoutConfirmOpen(false);
                        }}
                      >
                        Yes
                      </Button>
                      <Button
                        colorScheme="gray"
                        onClick={() => setIsLogoutConfirmOpen(false)}
                      >
                        No
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              )}
            </Stack>
          ) : (
            <LoginButton />
          )}
        </Flex>
        <UserSettings
          isModalUserOpen={isModalUserOpen}
          userInfo={userInfo}
          fileOnChange={fileOnChange}
          handleUpload={handleUpload}
          profilePictureSource={profileImageSource}
          progressUpload={uploadPercentage}
          onCloseUserSettings={onCloseUserSettings}
          handleProfilePictureDeleted={handleProfilePictureDeleted}
        />
        <FormModal
          isOpenFormModal={isModalFormOpen}
          onCloseFormModal={onModalFormClose}
        />
      </div>
    </>
  );
};

export default Navbartop;
