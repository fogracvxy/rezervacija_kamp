import React, { useContext } from "react";
//import Logo from "../images/logo.png";
import { Gallery, Karta, Navig } from "../components/";
import { FaToilet, FaCampground, FaDog, FaParking } from "react-icons/fa";
import {
  Box,
  Image,
  useColorModeValue,
  chakra,
  Icon,
  Flex,
  SimpleGrid,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./index.js";
import { AccountContext } from "../components/AccountContext";
const Feature = (props) => {
  return (
    <Box textAlign="center">
      <Icon
        boxSize={24}
        _light={{ color: "brand.700" }}
        mb={4}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {props.icon}
      </Icon>
      <chakra.h3
        mb={3}
        fontSize="lg"
        lineHeight="shorter"
        fontWeight="bold"
        _light={{ color: "gray.900" }}
      >
        {props.title}
      </chakra.h3>
      <chakra.p
        lineHeight="tall"
        color="gray.600"
        _dark={{ color: "gray.400" }}
      >
        {props.children}
      </chakra.p>
    </Box>
  );
};
const Onama = (props) => {
  return (
    <Box>
      <chakra.h3
        id="onama"
        mb={3}
        fontSize="2xl"
        lineHeight="shorter"
        fontWeight="bold"
        _light={{ color: "gray.900" }}
      >
        {props.title}
      </chakra.h3>
      <chakra.p
        lineHeight="tall"
        color="gray.600"
        _dark={{ color: "gray.400" }}
      >
        {props.children}
      </chakra.p>
    </Box>
  );
};
const Pocetna = () => {
  const data = [
    {
      vrsta: "Noćenje u kolibi za 2 osobe",
      boravak: "po danu",
      cijena: "170 kn",
    },
    {
      vrsta: "Noćenje u kampu - odrasli",
      boravak: "po danu",
      cijena: "75 kn",
    },
    {
      vrsta: "Noćenje u kampu - djeca 12-18 god.",
      boravak: "po danu",
      cijena: "40 kn",
    },
  ];
  const datasecond = [
    {
      vrsta: "Noćenje u kolibi za 2 osobe",
      boravak: "po danu",
      cijena: "200 kn",
    },
    {
      vrsta: "Noćenje u kampu - odrasli",
      boravak: "po danu",
      cijena: "90 kn",
    },
    {
      vrsta: "Noćenje u kampu - djeca 12-18 god.",
      boravak: "po danu",
      cijena: "50 kn",
    },
  ];
  const datathird = [
    {
      vrsta: "Noćenje u kolibi za 2 osobe",
      boravak: "po danu",
      cijena: "170 kn",
    },
    {
      vrsta: "Noćenje u kampu - odrasli",
      boravak: "po danu",
      cijena: "75 kn",
    },
    {
      vrsta: "Noćenje u kampu - djeca 12-18 god.",
      boravak: "po danu",
      cijena: "40 kn",
    },
  ];
  const navigate = useNavigate();
  const dataColor = useColorModeValue("white", "gray.800");
  const bg = useColorModeValue("white", "gray.800");
  const bg2 = useColorModeValue("gray.100", "gray.700");
  const { user, checkedForUser } = useContext(AccountContext);
  const handleRezervacijaClick = () => {
    if (user.loggedIn && checkedForUser) navigate("/rezervacija");
    else {
      navigate("/login");
    }
  };
  return (
    <>
      <Box pos="relative" overflow="hidden" bg={bg}>
        <Box maxW="7xl" mx="auto">
          <Box
            pos="relative"
            pb={{
              base: 8,
              sm: 16,
              md: 20,
              lg: 28,
              xl: 32,
            }}
            maxW={{
              lg: "2xl",
            }}
            w={{
              lg: "full",
            }}
            zIndex={1}
            bg={bg}
            border="solid 1px transparent"
          >
            <Icon
              display={{
                base: "none",
                lg: "block",
              }}
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              h="full"
              w={48}
              color={bg}
              transform="translateX(50%)"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </Icon>
            <Box
              mx="auto"
              maxW={{
                base: "7xl",
              }}
              px={{
                base: 4,
                sm: 6,
                lg: 8,
              }}
              mt={{
                base: 10,
                sm: 12,
                md: 16,
                lg: 20,
                xl: 28,
              }}
            >
              <Box
                w="full"
                textAlign={{
                  sm: "center",
                  lg: "left",
                }}
                justifyContent="center"
                alignItems="center"
              >
                <chakra.h1
                  fontSize={{
                    base: "4xl",
                    sm: "5xl",
                    md: "6xl",
                  }}
                  letterSpacing="tight"
                  lineHeight="short"
                  fontWeight="extrabold"
                  color="gray.900"
                  _dark={{
                    color: "white",
                  }}
                >
                  <chakra.span
                    display={{
                      base: "block",
                      xl: "inline",
                    }}
                  >
                    ROBINZONSKI KAMP{" "}
                  </chakra.span>
                  <chakra.span
                    display={{
                      base: "block",
                      xl: "inline",
                    }}
                    color="brand.600"
                    _dark={{
                      color: "brand.400",
                    }}
                  >
                    LUČICA
                  </chakra.span>
                </chakra.h1>
                <chakra.p
                  mt={{
                    base: 3,
                    sm: 5,
                    md: 5,
                  }}
                  fontSize={{
                    sm: "lg",
                    md: "xl",
                  }}
                  maxW={{
                    sm: "xl",
                  }}
                  mx={{
                    sm: "auto",
                    lg: 0,
                  }}
                  color="gray.500"
                >
                  Robinzonski kamp Lučica nalazi se u Karlovačkoj županiji u
                  sastavu Općine Barilović, naselje Lučica.
                </chakra.p>
                <Box
                  mt={{
                    base: 5,
                    sm: 8,
                  }}
                  display={{
                    sm: "flex",
                  }}
                  justifyContent={{
                    sm: "center",
                    lg: "start",
                  }}
                  fontWeight="medium"
                  fontFamily="fantasy"
                >
                  <Box rounded="full" shadow="md">
                    <chakra.a
                      onClick={() => handleRezervacijaClick()}
                      w="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="solid 1px transparent"
                      fontSize={{
                        base: "md",
                        md: "lg",
                      }}
                      rounded="full"
                      color="white"
                      bg="#DC4A2C"
                      _hover={{
                        bg: "brand.700",
                      }}
                      px={{
                        base: 8,
                        md: 10,
                      }}
                      py={{
                        base: 3,
                        md: 4,
                      }}
                      cursor="pointer"
                    >
                      Rezerviraj
                    </chakra.a>
                  </Box>
                  <Box mt={[3, 0]} ml={[null, 3]}>
                    <chakra.a
                      href="#onama"
                      w="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px={{
                        base: 8,
                        md: 10,
                      }}
                      py={{
                        base: 3,
                        md: 4,
                      }}
                      border="solid 1px transparent"
                      fontSize={{
                        base: "md",
                        md: "lg",
                      }}
                      rounded="md"
                      color="brand.700"
                      bg="brand.100"
                      _hover={{
                        bg: "brand.200",
                      }}
                      cursor="pointer"
                    >
                      O Kampu
                    </chakra.a>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          position={{
            lg: "absolute",
          }}
          top={{
            lg: 0,
          }}
          bottom={{
            lg: 0,
          }}
          right={{
            lg: 0,
          }}
          w={{
            lg: "50%",
          }}
          border="solid 1px transparent"
        >
          <Image
            h={[56, 72, 96, "full"]}
            w="full"
            fit="cover"
            src="../assets/DSC_1673.jpg"
            alt="Lucica fotografija"
            loading="lazy"
          />
        </Box>
      </Box>

      <Flex
        bg="#edf3f8"
        _dark={{ bg: "#3e3e3e" }}
        py={{ lg: 20, base: 20 }}
        w="100%"
        justifyContent="center"
        alignItems="center"
      >
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 2 }}
          spacing={20}
          px={{ base: 4, lg: 16, xl: 24 }}
          py={20}
          mx="auto"
          bg="white"
          _dark={{ bg: "gray.800" }}
          shadow="xl"
        >
          <Onama title="O nama">
            {" "}
            Ukoliko tražite smještaj koji pruža da određeno vrijeme provedete u
            blizini netaknute prirode, daleko od gradske buke onda je tu
            Robinzonski kamp Lučica. Nalazimo se u Karlovačkoj županiji, u
            sastavu općine Barilović, naselje Lučica. Veselimo se smjestiti
            goste iz različitih dijelova Hrvatske i inozemstva. Ovo mjesto
            savršeno je za opuštanje, uživanje i bijeg od užurbane svakodnevice.
            Sami odaberite kako ćete provoditi vrijeme kod nas. Iskoristite sve
            ono što Vam priroda nudi. Rijeka Korana, koja se nalazi uz kamp,
            izvire kod Plitvičkih jezera (nacionalni park) te obogaćuje sami
            prizor krajolika . Njena dužina iznosi 134,2 km te pripada
            crnomorskom slijevu. Na mnogim dijelovima Korana protiče kroz
            slikovite, krečnjačke kanjone visoke stotinjak i više metara. Ovi
            kanjoni obrasli su bukovom šumom ili su ogoljeli. U gornjem toku
            nalaze se slikovite pećine. Nedaleko od kampa, oko 300 metara,
            postoji izvor pitke vode koja svojom hladnoćom daje dodatni osjećaj
            svježine. Ispunite svoj dan raznim aktivnostima ili se jednostavno
            opuštajte i ljenčarite upotpuno prirodnom okruženju uz prekrasnu
            rijeku Koranu sjednite pod slapiće i isprobajte „prirodnu masažu“.
          </Onama>
          <Image
            borderRadius="full"
            loading="lazy"
            src="../assets/DSC_0986.jpg"
          ></Image>
        </SimpleGrid>
      </Flex>

      {/* Mogucnosti */}
      <Flex
        bg="#edf3f8"
        _dark={{ bg: "#3e3e3e" }}
        py={{ lg: 20, base: 20 }}
        w="100%"
        justifyContent="center"
        alignItems="center"
      >
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={20}
          px={{ base: 4, lg: 16, xl: 24 }}
          py={20}
          mx="auto"
          bg="white"
          w="100%"
          _dark={{ bg: "gray.800" }}
          shadow="xl"
        >
          <Feature title="Toalet" icon={<FaToilet color="#698A2E" size={25} />}>
            U kampu se nalazi sanitarni čvor opremljen sa 2 toaleta.
          </Feature>

          <Feature
            title="Dozvoljene životinje"
            icon={<FaDog color="#DC4A2C" size={25} />}
          >
            Mi smo prijatelji životinja. Ukoliko imate svog ljubimca slobodno ga
            povezite i neka uživa u prirodi.
          </Feature>

          <Feature title="Parking" icon={<FaParking color="blue" size={25} />}>
            Za goste našega kampa osiguran je parking nadomak kampa.
          </Feature>
        </SimpleGrid>
      </Flex>
      {/* <chakra.h2
        fontWeight="bold"
        textDecoration="underline"
        py={5}
        px={20}
        bg="#edf3f8"
        _dark={{ bg: "#3e3e3e" }}
        textAlign={{ sm: "center", md: "start" }}
      >
        Cjenik od 01.05. do 15.06.
      </chakra.h2>
      <Flex
        w="full"
        bg="#edf3f8"
        _dark={{
          bg: "#3e3e3e",
        }}
        px={{ lg: 20, base: 8 }}
        py={{ lg: 20, base: 15 }}
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
          {data.map((cijene, pid) => {
            return (
              <Flex
                direction={{
                  base: "row",
                  md: "column",
                }}
                bg={dataColor}
                key={pid}
              >
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w={{
                    base: 120,
                    md: "full",
                  }}
                  textTransform="uppercase"
                  bg={bg2}
                  color={"gray.500"}
                  py={{
                    base: 1,
                    md: 4,
                  }}
                  px={{
                    base: 2,
                    md: 10,
                  }}
                  fontSize="md"
                  fontWeight="hairline"
                >
                  <span>Vrsta Usluge</span>
                  <span>Boravak</span>
                  <span>Cijena</span>
                </SimpleGrid>
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w="full"
                  py={2}
                  px={10}
                  fontWeight="hairline"
                >
                  <span>{cijene.vrsta}</span>
                  <chakra.span
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {cijene.boravak}
                  </chakra.span>
                  <span>{cijene.cijena}</span>
                </SimpleGrid>
              </Flex>
            );
          })}
        </Stack>
      </Flex>
      <chakra.h2
        textDecoration="underline"
        fontWeight="bold"
        py={5}
        px={20}
        bg="#edf3f8"
        _dark={{ bg: "#3e3e3e" }}
        textAlign={{ sm: "center", md: "start" }}
      >
        Cjenik od 15.06. do 15.09.
      </chakra.h2>
      <Flex
        w="full"
        bg="#edf3f8"
        _dark={{
          bg: "#3e3e3e",
        }}
        px={{ lg: 20, base: 8 }}
        py={{ lg: 20, base: 15 }}
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
          {datasecond.map((cijene, pid) => {
            return (
              <Flex
                direction={{
                  base: "row",
                  md: "column",
                }}
                bg={dataColor}
                key={pid}
              >
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w={{
                    base: 120,
                    md: "full",
                  }}
                  textTransform="uppercase"
                  bg={bg2}
                  color={"gray.500"}
                  py={{
                    base: 1,
                    md: 4,
                  }}
                  px={{
                    base: 2,
                    md: 10,
                  }}
                  fontSize="md"
                  fontWeight="hairline"
                >
                  <span>Vrsta Usluge</span>
                  <span>Boravak</span>
                  <span>Cijena</span>
                </SimpleGrid>
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w="full"
                  py={2}
                  px={10}
                  fontWeight="hairline"
                >
                  <span>{cijene.vrsta}</span>
                  <chakra.span
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {cijene.boravak}
                  </chakra.span>
                  <span>{cijene.cijena}</span>
                </SimpleGrid>
              </Flex>
            );
          })}
        </Stack>
      </Flex>
      <chakra.h2
        textDecoration="underline"
        fontWeight="bold"
        py={5}
        px={20}
        bg="#edf3f8"
        _dark={{ bg: "#3e3e3e" }}
        textAlign={{ sm: "center", md: "start" }}
      >
        Cjenik od 15.09. do 31.10.
      </chakra.h2>
      <Flex
        w="full"
        bg="#edf3f8"
        _dark={{
          bg: "#3e3e3e",
        }}
        px={{ lg: 20, base: 8 }}
        py={{ lg: 20, base: 15 }}
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
          {datathird.map((cijene, pid) => {
            return (
              <Flex
                direction={{
                  base: "row",
                  md: "column",
                }}
                bg={dataColor}
                key={pid}
              >
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w={{
                    base: 120,
                    md: "full",
                  }}
                  textTransform="uppercase"
                  bg={bg2}
                  color={"gray.500"}
                  py={{
                    base: 1,
                    md: 4,
                  }}
                  px={{
                    base: 2,
                    md: 10,
                  }}
                  fontSize="md"
                  fontWeight="hairline"
                >
                  <span>Vrsta Usluge</span>
                  <span>Boravak</span>
                  <span>Cijena</span>
                </SimpleGrid>
                <SimpleGrid
                  spacingY={3}
                  columns={{
                    base: 1,
                    md: 3,
                  }}
                  w="full"
                  py={2}
                  px={10}
                  fontWeight="hairline"
                >
                  <span>{cijene.vrsta}</span>
                  <chakra.span
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {cijene.boravak}
                  </chakra.span>
                  <span>{cijene.cijena}</span>
                </SimpleGrid>
              </Flex>
            );
          })}
        </Stack>
      </Flex> */}
      <Box>
        <Gallery />
        <Karta />
        <Footer />
      </Box>
    </>
  );
};

export default Pocetna;
