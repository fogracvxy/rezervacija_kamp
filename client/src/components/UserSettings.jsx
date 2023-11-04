import React, { useContext, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Avatar,
  Divider,
  Input,
  InputGroup,
  InputLeftAddon,
  CircularProgress,
  Grid,
  Text,
  HStack,
  Box,
  VStack,
  Center,
  useMediaQuery,
  Flex,
} from "@chakra-ui/react";
import "./usersettings.css";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaLock, FaUser } from "react-icons/fa";
import { AccountContext } from "./AccountContext";
import { Navigate } from "react-router-dom";
const UserSettings = ({
  isModalUserOpen,
  userInfo,
  handleUpload,
  fileOnChange,
  profilePictureSource,
  progressUpload,
  onCloseUserSettings,
  uploadPercentage,
  handleProfilePictureDeleted,
}) => {
  const [isMobile] = useMediaQuery("(max-width: 767px)");
  const [isDeletePictureConfirmOpen, setIsDeletePictureConfirmOpen] =
    useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showConfirmDisableModal, setShowConfirmDisableModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFAToken, setTwoFAToken] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const { setUser } = useContext(AccountContext);
  const handleDeleteProfilePicture = async () => {
    try {
      const res = await fetch("auth/delete-profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        handleProfilePictureDeleted();
      }
    } catch (error) {
      console.error("Failed to delete profile picture", error);
    }
  };
  const handleEnable2FA = async () => {
    const res = await fetch("auth/generate-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setQrCodeUrl(data.url);
    setShow2FAModal(true);
  };
  const handleDisable2FA = () => {
    setShowConfirmDisableModal(true);
  };

  const openDeletePictureConfirmModal = () => {
    setIsDeletePictureConfirmOpen(true);
  };
  const handleVerify2FA = async () => {
    if (!twoFAToken) {
      setTwoFAError("Please enter your 2FA code.");
      return;
    }
    try {
      const res = await fetch("auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFAToken }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setBackupCodes(data.backupCodes); // Save the backup codes in state
        setShow2FAModal(false); // Close the 2FA modal
        setTwoFAError("");
        setShowBackupCodesModal(true);
      } else {
        setTwoFAError("Invalid 2FA code.");
      }
    } catch (error) {
      setTwoFAError("An error occurred while verifying 2FA.");
      console.error("An error occurred while verifying 2FA", error);
    }
  };
  const handleLogout = () => {
    fetch("/auth/logout", {
      method: "GET",
      credentials: "include",
    })
      .then(() => {})
      .then(() => {
        setUser({ loggedIn: false });
        Navigate("/"); // navigate nakon logouta
      });
  };
  const confirmDisable2FA = async () => {
    // Verify the 2FA code before disabling
    const verificationResponse = await fetch("auth/verify-disable-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: disable2FACode }),
    });

    if (verificationResponse.ok) {
      // If the 2FA code is correct, proceed with disabling 2FA
      await fetch("auth/disable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // Close the modal after disabling 2FA
      setShowConfirmDisableModal(false);
      handleLogout();
    } else {
      // Handle the error (e.g., show an error message to the user)
      const errorData = await verificationResponse.json();
      alert(errorData.error); // Replace this with a more user-friendly error handling
    }
  };

  return (
    <Modal size="xl" isOpen={isModalUserOpen} onClose={onCloseUserSettings}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Korisnik</ModalHeader>
        <ModalCloseButton />
        <Divider className="usersettings__divider" />
        <ModalBody m="25px" className="usersettings__modalbody">
          <Grid
            templateRows={isMobile ? "repeat(1, 1fr)" : "1fr"}
            gap={isMobile ? 4 : 6}
          >
            {" "}
            {/* Adjusted gap for mobile */}
            <Grid templateColumns={isMobile ? "1fr" : "1fr 1fr"}>
              <Box align={isMobile ? "center" : "left"}>
                <Flex direction="column" align="center" mb={isMobile ? 2 : 0}>
                  <Avatar
                    className="usersettings__profilepic"
                    mb="15px"
                    bg="green.800"
                    size={"2xl"}
                    src={`${profilePictureSource}`}
                  />
                  <Box pb={isMobile ? 0 : "24px"}>
                    <Divider w={"150px"} />
                  </Box>
                  {profilePictureSource && (
                    <Button
                      mt={2}
                      mb={isMobile ? 4 : 0}
                      colorScheme="red"
                      size="sm"
                      onClick={openDeletePictureConfirmModal}
                    >
                      Delete Picture
                    </Button>
                  )}
                </Flex>
              </Box>

              <Flex
                direction={isMobile ? "row" : "column"}
                justify="space-between"
                align="center"
                spacing={isMobile ? 2 : 3}
              >
                <VStack spacing={2} align="center">
                  <Box h="40px" pt={2}>
                    <Center>
                      <FaUser size={25} />
                    </Center>
                  </Box>
                  <Box>
                    <Divider w={"100px"} />
                  </Box>
                  <Box h="40px">
                    <Text textAlign="center">{userInfo.username}</Text>
                  </Box>
                </VStack>
                <VStack spacing={2} align="center">
                  <Box h="40px" pt={2}>
                    <Center>
                      <FaLock size={25} />
                    </Center>
                  </Box>
                  <Box>
                    <Divider w={"100px"} />
                  </Box>
                  <Box h="40px">
                    <Text textAlign="center">
                      {userInfo.two_factor_enabled ? (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={handleDisable2FA}
                        >
                          Isključi 2FA zaštitu
                        </Button>
                      ) : (
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={handleEnable2FA}
                        >
                          Uključi 2FA zaštitu
                        </Button>
                      )}
                    </Text>
                  </Box>
                </VStack>
              </Flex>
            </Grid>
            <VStack
              pt="20px"
              align="center"
              style={{ position: "relative", height: "50px" }}
            >
              <Box>
                <InputGroup>
                  <InputLeftAddon>
                    <MdOutlineAddPhotoAlternate />
                  </InputLeftAddon>
                  <Input
                    className="usersettings__fileupload"
                    placeholder="Fotografija"
                    type="file"
                    onChange={fileOnChange}
                    name="avatar"
                  />
                  <Button onClick={handleUpload}>Upload</Button>
                </InputGroup>
                {uploadPercentage !== "" && (
                  <Text mt={2}>
                    {uploadPercentage === "uploading"
                      ? "Uploading..."
                      : uploadPercentage}
                  </Text>
                )}
              </Box>
            </VStack>
          </Grid>
        </ModalBody>
        <Divider className="usersettings__divider" />
        <ModalFooter>
          <HStack spacing={3} justify="space-between" w="100%">
            <Box>
              {progressUpload === "success" ? (
                <></>
              ) : progressUpload === "uploading" ? (
                <CircularProgress
                  size="30px"
                  color="#00A0E2"
                  isIndeterminate={true}
                />
              ) : (
                <></>
              )}
            </Box>
            <Box>
              <Button colorScheme="blue" onClick={onCloseUserSettings}>
                Zatvori
              </Button>
            </Box>
          </HStack>
        </ModalFooter>
      </ModalContent>
      {isDeletePictureConfirmOpen && (
        <Modal
          isOpen={isDeletePictureConfirmOpen}
          onClose={() => setIsDeletePictureConfirmOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Potvrda</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Jeste li sigurni da želite izbrisati fotografiju?
            </ModalBody>
            <ModalFooter>
              <Button
                mr="3"
                colorScheme="red"
                onClick={() => {
                  handleDeleteProfilePicture();
                  setIsDeletePictureConfirmOpen(false);
                }}
              >
                Da
              </Button>
              <Button
                colorScheme="gray"
                onClick={() => setIsDeletePictureConfirmOpen(false)}
              >
                Ne
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Postavljanje 2FA zaštite</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Skenirajte ovaj QR kod sa svojom auth aplikacijom:
            </Text>
            <Flex justifyContent="center" alignItems="center" mb={4}>
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
            </Flex>
            <InputGroup>
              <Input
                placeholder="Unesite 2FA kod"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
              />
            </InputGroup>
            {twoFAError && (
              <Text color="red.500" mt={2}>
                {twoFAError}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleVerify2FA}>
              Provjeri
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={showConfirmDisableModal}
        onClose={() => setShowConfirmDisableModal(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Potvrda</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Jeste li sigurni da želite ugasiti 2FA zaštitu?</Text>
            <Input
              placeholder="Unesite 2FA kod"
              onChange={(e) => setDisable2FACode(e.target.value)}
              mt={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr="3" colorScheme="red" onClick={confirmDisable2FA}>
              Da
            </Button>
            <Button onClick={() => setShowConfirmDisableModal(false)}>
              Odustani
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vaši 2FA backup kodovi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Ovo su vaši kodovi za backup. Molimo vas zapišite ih negdje i
              spremite na sigurno:
            </Text>
            <VStack spacing={2} mt={4}>
              {backupCodes.map((code, index) => (
                <Text
                  key={index}
                  fontFamily="monospace"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  {code}
                </Text>
              ))}
            </VStack>
            <Text mt={4} color="gray.500">
              Svaki kod može se iskoristiti samo jednom.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setShowBackupCodesModal(false);
                handleLogout();
              }}
            >
              Spremio sam kodove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
};

export default UserSettings;
