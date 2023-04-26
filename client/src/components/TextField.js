import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/react";
import { Field, useField } from "formik";
import { useState } from "react";

const TextField = ({ handleClick, showpass, show, label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <FormControl isInvalid={meta.touched && meta.error}>
      <FormLabel>{label}</FormLabel>
      <InputGroup size="md">
        <Input as={Field} {...field} {...props} />
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            w="100%"
            mr={2}
            display={show}
            size="sm"
            onClick={handleClick}
          >
            {showpass ? "Prikaži" : "Sakrij"}
          </Button>
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

export default TextField;
