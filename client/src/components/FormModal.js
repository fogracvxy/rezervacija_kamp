import React, { memo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
  VStack,
} from "@chakra-ui/react";
import TextField from "../components/TextField";
import { Form, Formik } from "formik";

const Yup = require("yup");
const FormModal = ({ isOpenFormModal, onCloseFormModal }) => {
  const toast = useToast();
  const validationSchema = Yup.object({
    name: Yup.string().required("Obavezno"),
    email: Yup.string()
      .email("Unesite ispravnu mail adresu")
      .required("Obavezno"),
    message: Yup.string()
      .min(50, "Unesite minimalno 50 znakova.")
      .required("Obavezno"),
  });
  return (
    <div>
      {/* {work in progress sa ovim ovdje treba dodat funkciju i provjeru forme} */}
      <Modal isOpen={isOpenFormModal} onClose={onCloseFormModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Prijavite grešku</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {" "}
            <Formik
              initialValues={{ name: "", email: "", message: "" }}
              validationSchema={validationSchema}
              onSubmit={(values, actions) => {
                const vals = { ...values };
                actions.resetForm();
                fetch("/auth/reporterror", {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(vals),
                })
                  .catch((err) => {
                    return;
                  })
                  .then((res) => {
                    if (!res || !res.ok || res.status >= 400) {
                      return;
                    }
                    return res.json();
                  })
                  .then((data) => {
                    console.log(data);
                    toast({
                      title: data.title,
                      description: data.response,
                      status: data.status,
                      duration: 6000,
                      isClosable: true,
                    });
                  });
                console.log("values", values);
              }}
            >
              <VStack as={Form}>
                <TextField
                  name="name"
                  placeholder="Ime i prezime"
                  label="Ime i prezime"
                  show="none"
                />

                <TextField
                  name="email"
                  placeholder="Unesite mail"
                  label=" Mail Adresa"
                  show="none"
                />

                <TextField
                  style={{ height: "100px" }}
                  as="textarea"
                  name="message"
                  resize="none"
                  placeholder="Opis problema"
                  autoComplete="off"
                  label="Problem"
                  show="none"
                />

                <Button
                  type="submit"
                  _hover={{ backgroundColor: "#65842e", color: "#DC4A2C" }}
                  color="white"
                  bg="#65842e"
                  mt={5}
                  mr={3}
                >
                  Šalji
                </Button>
              </VStack>
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default memo(FormModal);
