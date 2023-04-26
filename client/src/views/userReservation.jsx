import React, { useEffect, useState } from "react";
import Axios from "axios";
import moment from "moment";
import {
  Button,
  Tooltip,
  Text,
  SimpleGrid,
  Stack,
  Flex,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
const UserReservation = () => {
  useEffect(() => {
    Axios.get("/auth/userreservation").then((response) => {
      setRezervacijaList(response.data);
    });
  }, []);
  const dataColor = useColorModeValue("white", "gray.800");
  const bg = useColorModeValue("white", "gray.800");
  const bg2 = useColorModeValue("gray.100", "gray.700");
  const [rezervacijaList, setRezervacijaList] = useState([]);
  return (
    <div className="">
      <Text py={10} fontWeight="semibold" textAlign="center">
        Moje rezervacije
      </Text>

      <Flex
        w="full"
        bg="white"
        _dark={{
          bg: "#3e3e3e",
        }}
        px={{ base: 1, "2xl": 16 }}
        alignItems="center"
        justifyContent="center"
      >
        <Stack
          direction={{
            base: "column",
          }}
          w="full"
          bg={{
            md: bg,
          }}
          shadow="lg"
        >
          {rezervacijaList.map((user, pid) => {
            return (
              <Flex
                direction={{
                  base: "row",
                  "2xl": "column",
                }}
                bg={dataColor}
                key={pid}
              >
                <SimpleGrid
                  columns={{
                    base: 1,
                    "2xl": 8,
                  }}
                  w={{
                    base: "full",
                    "2xl": "full",
                  }}
                  textTransform="uppercase"
                  bg={bg2}
                  color={"gray.500"}
                  py={{
                    base: 1,
                    "2xl": 4,
                  }}
                  px={{
                    base: 2,
                    "2xl": 10,
                  }}
                  fontSize="md"
                  fontWeight="hairline"
                >
                  <chakra.span>Smještaj</chakra.span>
                  <chakra.span>Ime</chakra.span>
                  <chakra.span>Broj</chakra.span>
                  <chakra.span>Mail</chakra.span>
                  <chakra.span>Datum Početni</chakra.span>
                  <chakra.span>Datum krajni</chakra.span>
                  <chakra.span>Datum kreiranja</chakra.span>
                  <chakra.span>Stanje</chakra.span>
                </SimpleGrid>
                <SimpleGrid
                  spacingY={5}
                  columns={{
                    base: 1,
                    "2xl": 8,
                  }}
                  w="full"
                  py={{ "2xl": 2 }}
                  pl={{ base: 2 }}
                  px={{ "2xl": 10 }}
                  pb={{ base: 2 }}
                  fontWeight="hairline"
                >
                  <chakra.span>{user.room_id}</chakra.span>
                  <chakra.span>{user.user_name}</chakra.span>
                  <chakra.span>{user.user_phone}</chakra.span>
                  <chakra.span>{user.user_mail}</chakra.span>
                  <chakra.span>
                    {moment(user.t_start).format("DD.MM.YYYY.")}
                  </chakra.span>
                  <chakra.span>
                    {moment(user.t_end).format("DD.MM.YYYY.")}
                  </chakra.span>
                  <chakra.span>
                    {moment(user.created_at).format("DD.MM.YYYY.")}
                  </chakra.span>
                  {!user.odobreno ? (
                    <chakra.span>
                      <Tooltip
                        bg="red.600"
                        hasArrow
                        shouldWrapChildren
                        label="Čeka se odobrenje rezervacije od strane vlasnika"
                      >
                        <Button
                          isLoading
                          loadingText="Čekanje"
                          colorScheme="teal"
                          variant="outline"
                        ></Button>
                      </Tooltip>
                    </chakra.span>
                  ) : (
                    <chakra.span>
                      <Tooltip
                        bg="#65842E"
                        hasArrow
                        shouldWrapChildren
                        label="Vaša rezervacija je odobrena"
                      >
                        <Button
                          isDisabled
                          _disabled={{
                            color: "white",
                            bg: "#65842E",
                            pointerEvents: "none",
                          }}
                          _hover={{ bg: "" }}
                          color="white"
                          bg="#65842E"
                          variant="outline"
                        >
                          Odobreno
                        </Button>
                      </Tooltip>
                    </chakra.span>
                  )}
                </SimpleGrid>
              </Flex>
            );
          })}
        </Stack>
      </Flex>
      {/* Dio za printanje tablice rezervacije*/}
    </div>
  );
};

export default UserReservation;
