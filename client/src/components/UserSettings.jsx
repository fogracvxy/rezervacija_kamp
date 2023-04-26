import React from "react";
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
  GridItem,
  Grid,
  Text,
  chakra,
} from "@chakra-ui/react";
import "./usersettings.css";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaUser } from "react-icons/fa";
const UserSettings = ({
  isModalUserOpen,
  userInfo,
  handleUpload,
  fileOnChange,
  profilePictureSource,
  progressUpload,
  onCloseUserSettings,
}) => {
  return (
    <div>
      <Modal size="xl" isOpen={isModalUserOpen} onClose={onCloseUserSettings}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Korisnik</ModalHeader>
          <ModalCloseButton />
          <Divider className="usersettings__divider" />

          <ModalBody className="usersettings__modalbody">
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                {" "}
                <Avatar
                  className="usersettings__profilepic"
                  size={"2xl"}
                  src={`/uploads/${profilePictureSource}`}
                />
              </GridItem>
              <GridItem>
                <chakra.span
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <FaUser size={25} />
                </chakra.span>
                <Divider my={2} />{" "}
                <Text textAlign="center">
                  {" "}
                  Ime i prezime: {userInfo.ime} {userInfo.prezime}
                </Text>
                <Text mt={5} textAlign="center">
                  Korisničko ime: {userInfo.username}
                </Text>
                <Text mt={5} textAlign="center">
                  Mail: {userInfo.mail}
                </Text>
              </GridItem>
            </Grid>
            <Text mt={5}>Promjena profilne fotografije</Text>
            <InputGroup>
              <InputLeftAddon children={<MdOutlineAddPhotoAlternate />} />
              <Input
                className="usersettings__fileupload"
                placeholder="Fotografija"
                type="file"
                onChange={fileOnChange}
                name="avatar"
              />
              <Button bg="#65842e" color="white" onClick={handleUpload}>
                Upload
              </Button>
            </InputGroup>
          </ModalBody>

          <Divider className="usersettings__divider" />
          <ModalFooter>
            <Grid templateColumns="repeat(4, 1fr)">
              <GridItem colStart={1} colSpan={1}>
                {progressUpload === "sucess" ? (
                  <></>
                ) : progressUpload === "uploading" ? (
                  <CircularProgress
                    size="30px"
                    color="#65842e"
                    isIndeterminate={true}
                  />
                ) : (
                  <></>
                )}
              </GridItem>
              <GridItem float="right" colStart={4}>
                <Button
                  bg="red"
                  color="white"
                  mr={3}
                  onClick={onCloseUserSettings}
                >
                  {" "}
                  Zatvori
                </Button>
              </GridItem>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserSettings;
